'use client'

import { useState, useRef } from 'react'

interface MediaFilesProps {
  audioUrl: string | null
  imageUrl: string | null
  duration: number | null
  onChange: (data: {
    audioUrl: string | null
    imageUrl: string | null
    duration: number | null
  }) => void
}

export default function MediaFiles({
  audioUrl,
  imageUrl,
  duration,
  onChange
}: MediaFilesProps) {
  const [audioUploading, setAudioUploading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Extract duration from audio file
  const extractDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.preload = 'metadata'
      
      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src)
        resolve(Math.floor(audio.duration))
      }
      
      audio.onerror = () => {
        reject(new Error('Failed to load audio metadata'))
      }
      
      audio.src = window.URL.createObjectURL(file)
    })
  }

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/x-m4a']
    if (!validAudioTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
      setAudioError('Please select a valid audio file (.mp3, .wav, .m4a)')
      return
    }

    // Validate file size (500MB max)
    if (file.size > 500 * 1024 * 1024) {
      setAudioError('Audio file must be less than 500MB')
      return
    }

    setAudioUploading(true)
    setAudioError(null)

    try {
      // Extract duration first
      const audioDuration = await extractDuration(file)

      // Step 1: Get presigned URL from our API
      const presignedResponse = await fetch('/api/admin/episode-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      })

      if (!presignedResponse.ok) {
        const data = await presignedResponse.json()
        throw new Error(data.error || 'Failed to get upload URL')
      }

      const { presignedUrl, publicUrl } = await presignedResponse.json()

      // Step 2: Upload directly to R2 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage')
      }

      onChange({
        audioUrl: publicUrl,
        imageUrl,
        duration: audioDuration
      })
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : 'Failed to upload audio')
      console.error('Audio upload error:', err)
    } finally {
      setAudioUploading(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validImageTypes.includes(file.type)) {
      setImageError('Please select a valid image file (.jpg, .png, .webp)')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image file must be less than 10MB')
      return
    }

    setImageUploading(true)
    setImageError(null)

    try {
      // Step 1: Get presigned URL from our API
      const presignedResponse = await fetch('/api/admin/episode-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      })

      if (!presignedResponse.ok) {
        const data = await presignedResponse.json()
        throw new Error(data.error || 'Failed to get upload URL')
      }

      const { presignedUrl, publicUrl } = await presignedResponse.json()

      // Step 2: Upload directly to R2 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage')
      }

      onChange({
        audioUrl,
        imageUrl: publicUrl,
        duration
      })
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to upload image')
      console.error('Image upload error:', err)
    } finally {
      setImageUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Media Files</h2>
      
      {/* Audio Upload */}
      <div className="space-y-2">
        <label htmlFor="audio" className="block">
          Audio File *
        </label>
        
        <div className="flex items-center gap-4">
          <label className="px-4 py-2 dpr-button">
            Choose Audio File
            <input
              ref={audioInputRef}
              type="file"
              id="audio"
              accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-m4a"
              onChange={handleAudioSelect}
              disabled={audioUploading}
              className="hidden"
            />
          </label>
          
          {audioUrl && !audioUploading && (
            <span className="text-sm text-brand-dpr-green">
              ✓ Audio uploaded {duration && `(${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`}
            </span>
          )}
        </div>
        
        {audioUploading && (
          <p className="text-sm text-grey5">Uploading audio...</p>
        )}
        
        {audioError && (
          <p className="text-sm text-brand-dpr-orange">{audioError}</p>
        )}
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <label htmlFor="image" className="block">
          Episode Image
        </label>
        
        <div className="flex items-center gap-4">
          <label className="px-4 py-2 dpr-button">
            Choose Image File
            <input
              ref={imageInputRef}
              type="file"
              id="image"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              disabled={imageUploading}
              className="hidden"
            />
          </label>
          
          {imageUrl && !imageUploading && (
            <span className="text-sm text-brand-dpr-green">✓ Image uploaded</span>
          )}
        </div>
        
        {imageUploading && (
          <p className="text-sm text-grey5">Uploading image...</p>
        )}
        
        {imageError && (
          <p className="text-sm text-brand-dpr-orange">{imageError}</p>
        )}
        
        {imageUrl && !imageUploading && (
          <img src={imageUrl} alt="Episode preview" className="max-w-xs border border-grey5" />
        )}
      </div>
    </div>
  )
}
