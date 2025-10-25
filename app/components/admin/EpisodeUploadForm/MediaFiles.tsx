'use client'

import { useState, useRef, useEffect } from 'react'

interface MediaFilesProps {
  audioUrl: string | null
  imageUrl: string | null
  duration: number | null
  audioFileRef: React.MutableRefObject<File | null>
  imageFileRef: React.MutableRefObject<File | null>
  onChange: (data: {
    audioUrl: string | null
    imageUrl: string | null
    duration: number | null
  }) => void
  onImagePreviewChange?: (previewUrl: string | null) => void
}

export default function MediaFiles({
  audioUrl,
  imageUrl,
  duration,
  audioFileRef,
  imageFileRef,
  onChange,
  onImagePreviewChange
}: MediaFilesProps) {
  const [audioError, setAudioError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
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
        window.URL.revokeObjectURL(audio.src)
        reject(new Error('Failed to load audio metadata'))
      }

      audio.src = window.URL.createObjectURL(file)
    })
  }

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        window.URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Clear any previous errors
    setAudioError(null)

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

    try {
      // Extract duration
      const duration = await extractDuration(file)
      setAudioDuration(duration)

      // Store file in ref for form submission
      audioFileRef.current = file

      // Update form with duration (URL will be set after orchestrated upload)
      onChange({
        audioUrl: null,
        imageUrl,
        duration
      })
    } catch (err) {
      setAudioError('Failed to read audio file metadata')
      console.error('Audio metadata error:', err)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Clear any previous errors and preview
    setImageError(null)

    // Clean up previous preview URL
    if (imagePreview) {
      window.URL.revokeObjectURL(imagePreview)
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validImageTypes.includes(file.type)) {
      setImageError('Please select a valid image file (.jpg, .png, .webp)')
      // Clean up preview on error
      if (imagePreview) {
        window.URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
      }
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image file must be less than 10MB')
      // Clean up preview on error
      if (imagePreview) {
        window.URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
      }
      return
    }

    // Create preview URL for the selected image
    const previewUrl = window.URL.createObjectURL(file)
    setImagePreview(previewUrl)

    // Notify parent component about preview URL change
    if (onImagePreviewChange) {
      onImagePreviewChange(previewUrl)
    }

    // Store file in ref for form submission
    imageFileRef.current = file

    // Update form with null URL (will be set after orchestrated upload)
    onChange({
      audioUrl,
      imageUrl: null,
      duration
    })
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
              className="hidden"
            />
          </label>

          {audioFileRef.current && !audioError && (
            <span className="text-sm text-brand-dpr-green">
              ✓ {audioFileRef.current.name} ({(audioFileRef.current.size / (1024 * 1024)).toFixed(1)}MB
              {audioDuration && ` • ${Math.floor(audioDuration / 60)}:${(audioDuration % 60).toString().padStart(2, '0')}`}
              )
            </span>
          )}
        </div>

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
              className="hidden"
            />
          </label>

          {imageFileRef.current && !imageError && (
            <span className="text-sm text-brand-dpr-green">
              ✓ {imageFileRef.current.name} ({(imageFileRef.current.size / (1024 * 1024)).toFixed(1)}MB)
            </span>
          )}
        </div>

        {imageError && (
          <p className="text-sm text-brand-dpr-orange">{imageError}</p>
        )}

        {/* Show image preview - either selected file or uploaded URL */}
        {(imagePreview || imageUrl) && (
          <div className="space-y-2">
            <p className="text-sm text-grey5">Preview:</p>
            <img
              src={imagePreview || imageUrl || ''}
              alt="Episode preview"
              className="max-w-xs border border-grey5"
            />
          </div>
        )}
      </div>
    </div>
  )
}
