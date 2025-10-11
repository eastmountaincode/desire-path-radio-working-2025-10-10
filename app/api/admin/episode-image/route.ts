import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

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

    const { fileName, fileType } = await request.json()

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing fileName or fileType' },
        { status: 400 }
      )
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validImageTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be image file (.jpg, .png, .webp)' },
        { status: 400 }
      )
    }

    const bucketName = process.env.R2_IMAGES_BUCKET_NAME

    if (!bucketName) {
      return NextResponse.json(
        { error: 'Images bucket not configured' },
        { status: 500 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = fileName.replace(/[^a-z0-9.-]/gi, '-')
    const key = `${timestamp}-${sanitizedName}`

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    })

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })

    // Construct public URL
    const publicUrl = `${process.env.R2_IMAGES_PUBLIC_URL}/${key}`

    return NextResponse.json({
      success: true,
      presignedUrl,
      publicUrl,
      key
    })

  } catch (error) {
    console.error('Presigned URL generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}

