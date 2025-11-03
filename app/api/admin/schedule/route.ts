import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { PostgrestError } from '@supabase/supabase-js'

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

// Helper function to upload file to R2 and return public URL
async function uploadToR2(file: File, bucketName: string, fileName: string): Promise<{ publicUrl: string, key: string }> {
  const timestamp = Date.now()
  const sanitizedName = fileName.replace(/[^a-z0-9.-]/gi, '-')
  const key = `${timestamp}-${sanitizedName}`

  // Create presigned URL for upload
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: file.type,
  })

  const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })

  // Upload file using presigned URL with retry logic
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (uploadResponse.ok) {
        break
      } else {
        throw new Error(`Upload failed with status ${uploadResponse.status}`)
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown upload error')

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError
      }

      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
    }
  }

  // Construct public URL
  const publicUrl = `${process.env.MEDIA_PROXY_SCHEDULE_URL}/${key}`

  return { publicUrl, key }
}

// Helper function to delete from R2
async function deleteFromR2(bucketName: string, key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  await r2Client.send(command)
}

// GET - Fetch current schedule image
export async function GET() {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerSupabase()

    const { data, error } = await supabase
      .from('schedule_image')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to fetch schedule image: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('Schedule fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}

// POST - Upload new schedule image
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const imageFile = formData.get('imageFile') as File | null

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabase()
    const scheduleBucket = process.env.R2_SCHEDULE_BUCKET_NAME!

    // Step 1: Get current schedule image (if exists) so we can delete old one from R2
    const { data: currentSchedule } = await supabase
      .from('schedule_image')
      .select('*')
      .limit(1)
      .maybeSingle() as { data: { id: number; image_url: string; image_key: string; uploaded_at: string } | null; error: PostgrestError | null }

    // Step 2: Upload new image to R2
    const { publicUrl, key } = await uploadToR2(imageFile, scheduleBucket, imageFile.name)

    // Step 3: Update or insert database record
    const { data: existingRow } = await supabase
      .from('schedule_image')
      .select('id')
      .eq('id', 1)
      .maybeSingle() as { data: { id: number } | null; error: PostgrestError | null }

    if (existingRow) {
      // Update existing row
      const { error: updateError } = await supabase
        .from('schedule_image')
        // @ts-expect-error - Supabase type inference issue with update
        .update({
          image_url: publicUrl,
          image_key: key,
          uploaded_at: new Date().toISOString()
        })
        .eq('id', 1)

      if (updateError) {
        // Rollback: delete newly uploaded image
        await deleteFromR2(scheduleBucket, key)
        throw new Error(`Failed to update schedule: ${updateError.message}`)
      }
    } else {
      // Insert new row with id = 1
      const { error: insertError } = await supabase
        .from('schedule_image')
        // @ts-expect-error - Supabase type inference issue with insert
        .insert({
          id: 1,
          image_url: publicUrl,
          image_key: key
        })

      if (insertError) {
        // Rollback: delete newly uploaded image
        await deleteFromR2(scheduleBucket, key)
        throw new Error(`Failed to create schedule: ${insertError.message}`)
      }
    }

    // Step 4: Delete old image from R2 (if it exists)
    if (currentSchedule?.image_key) {
      try {
        await deleteFromR2(scheduleBucket, currentSchedule.image_key)
      } catch (deleteError) {
        console.error('Failed to delete old schedule image from R2:', deleteError)
        // Don't fail the request if old image deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      image_url: publicUrl,
      message: 'Schedule image uploaded successfully'
    })

  } catch (error) {
    console.error('Schedule upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload schedule' },
      { status: 500 }
    )
  }
}

// DELETE - Delete current schedule image
export async function DELETE() {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerSupabase()
    const scheduleBucket = process.env.R2_SCHEDULE_BUCKET_NAME!

    // Step 1: Get current schedule image
    const { data: currentSchedule, error: fetchError } = await supabase
      .from('schedule_image')
      .select('*')
      .limit(1)
      .maybeSingle() as { data: { id: number; image_url: string; image_key: string; uploaded_at: string } | null; error: PostgrestError | null }

    if (fetchError) {
      throw new Error(`Failed to fetch schedule: ${fetchError.message}`)
    }

    if (!currentSchedule) {
      return NextResponse.json(
        { error: 'No schedule image to delete' },
        { status: 404 }
      )
    }

    // Step 2: Delete from R2
    try {
      await deleteFromR2(scheduleBucket, currentSchedule.image_key)
    } catch (deleteError) {
      console.error('Failed to delete from R2:', deleteError)
      // Continue even if R2 deletion fails
    }

    // Step 3: Delete database record
    const { error: dbDeleteError } = await supabase
      .from('schedule_image')
      .delete()
      .eq('id', currentSchedule.id)

    if (dbDeleteError) {
      throw new Error(`Failed to delete schedule from database: ${dbDeleteError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule image deleted successfully'
    })

  } catch (error) {
    console.error('Schedule delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}
