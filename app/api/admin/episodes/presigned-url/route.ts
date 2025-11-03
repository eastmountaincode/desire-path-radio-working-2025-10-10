import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || '',
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

    const body = await request.json()
    const { fileName, fileType, uploadType } = body

    if (!fileName || !fileType || !uploadType) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileType, uploadType' },
        { status: 400 }
      )
    }

    if (!['audio', 'image', 'schedule'].includes(uploadType)) {
      return NextResponse.json(
        { error: 'uploadType must be either "audio", "image", or "schedule"' },
        { status: 400 }
      )
    }

    // Generate unique key for the file
    const timestamp = Date.now()
    const sanitizedName = fileName.replace(/[^a-z0-9.-]/gi, '-')
    const key = `${timestamp}-${sanitizedName}`

    // Determine bucket and URL based on upload type
    let bucketName: string | undefined
    let publicUrl: string

    switch (uploadType) {
      case 'audio':
        bucketName = process.env.R2_AUDIO_BUCKET_NAME
        publicUrl = `${process.env.MEDIA_PROXY_AUDIO_URL}/${key}`
        break
      case 'image':
        bucketName = process.env.R2_IMAGES_BUCKET_NAME
        publicUrl = `${process.env.MEDIA_PROXY_IMAGE_URL}/${key}`
        break
      case 'schedule':
        bucketName = process.env.R2_SCHEDULE_BUCKET_NAME
        publicUrl = `${process.env.MEDIA_PROXY_SCHEDULE_URL}/${key}`
        break
      default:
        return NextResponse.json(
          { error: 'Invalid upload type' },
          { status: 400 }
        )
    }

    if (!bucketName) {
      return NextResponse.json(
        { error: 'Bucket configuration missing' },
        { status: 500 }
      )
    }

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    })

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })

    return NextResponse.json({
      presignedUrl,
      key,
      publicUrl,
      bucket: bucketName
    })

  } catch (error) {
    console.error('Presigned URL generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate presigned URL' },
      { status: 500 }
    )
  }
}

