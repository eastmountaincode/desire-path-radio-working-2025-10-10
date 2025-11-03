'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDevMode } from '@/app/components/DevModeProvider'
import Image from 'next/image'

export default function AdminSchedulePage() {
  const router = useRouter()
  const devMode = useDevMode()
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<'pending' | 'uploading' | 'completed' | 'error'>('pending')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedFileRef = useRef<File | null>(null)

  const fetchCurrentSchedule = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/schedule')

      if (response.status === 401) {
        router.push('/admin')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch current schedule')
      }

      const result = await response.json()

      if (result.data?.image_url) {
        setCurrentImage(result.data.image_url)
      }
    } catch (err) {
      console.error('Error fetching schedule:', err)
      // Don't show error to user if there's no schedule yet
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Fetch current schedule image on mount
  useEffect(() => {
    fetchCurrentSchedule()
  }, [fetchCurrentSchedule])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Store file reference
    selectedFileRef.current = file

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setPreviewImage(previewUrl)
    setError(null)
    setSuccess(false)
  }

  const handleUpload = async () => {
    if (!selectedFileRef.current) {
      setError('Please select an image file')
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccess(false)
    setUploadProgress('uploading')

    try {
      const formData = new FormData()
      formData.append('imageFile', selectedFileRef.current)

      const response = await fetch('/api/admin/schedule', {
        method: 'POST',
        body: formData,
      })

      if (response.status === 401) {
        router.push('/admin')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload schedule image')
      }

      const result = await response.json()

      setUploadProgress('completed')
      setSuccess(true)
      setCurrentImage(result.image_url)

      // Clear preview and file input
      setPreviewImage(null)
      selectedFileRef.current = null
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Reset success message after delay
      setTimeout(() => {
        setSuccess(false)
        setUploadProgress('pending')
      }, 3000)

    } catch (err) {
      setUploadProgress('error')
      setError(err instanceof Error ? err.message : 'Failed to upload schedule image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearPreview = () => {
    setPreviewImage(null)
    selectedFileRef.current = null
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    setSuccess(false)
    setShowDeleteConfirm(false)

    try {
      const response = await fetch('/api/admin/schedule', {
        method: 'DELETE',
      })

      if (response.status === 401) {
        router.push('/admin')
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete schedule image')
      }

      setCurrentImage(null)
      setSuccess(true)

      // Reset success message after delay
      setTimeout(() => {
        setSuccess(false)
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule image')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={`flex flex-col gap-6 p-6 ${devMode ? 'border-2 border-red-500' : ''}`}>
      <div>
        <h1 className="text-2xl font-bold mb-2">Schedule Image</h1>
        <p className="text-grey5">Upload an image to display on the public schedule page</p>
      </div>

      {/* Current Schedule Image */}
      {!isLoading && currentImage && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Current Schedule</h2>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting || isUploading}
              className="px-4 py-2 border border-current text-grey6 hover:bg-grey2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete Schedule Image'}
            </button>
          </div>
          <div className="border border-current p-4 max-w-4xl">
            <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
              <Image
                src={currentImage}
                alt="Current schedule"
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-grey5">Loading current schedule...</div>
      )}

      {/* Upload Section */}
      <div className="space-y-4 max-w-4xl">
        <h2 className="text-lg font-medium">Upload New Schedule</h2>

        {/* File Input */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-grey5 mb-2 block">Select Image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="block w-full text-sm text-grey6
                file:mr-4 file:py-2 file:px-4
                file:border file:border-current
                file:bg-grey1 file:text-grey6
                hover:file:bg-grey2
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>

          {/* Preview */}
          {previewImage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Preview</span>
                <button
                  type="button"
                  onClick={handleClearPreview}
                  disabled={isUploading}
                  className="text-sm text-grey5 hover:text-grey6 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
              <div className="border border-current p-4">
                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-medium text-grey6">Upload Progress</h3>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                uploadProgress === 'completed' ? 'bg-brand-dpr-green text-grey1' :
                uploadProgress === 'uploading' ? 'bg-brand-dpr-orange text-grey1' :
                uploadProgress === 'error' ? 'bg-brand-dpr-orange text-grey1' :
                'bg-grey3 text-grey5'
              }`}>
                {uploadProgress === 'completed' ? '✓' :
                 uploadProgress === 'uploading' ? '⟳' :
                 uploadProgress === 'error' ? '✗' : '○'}
              </div>
              <span className={`text-sm ${
                uploadProgress === 'completed' ? 'text-brand-dpr-green' :
                uploadProgress === 'error' ? 'text-brand-dpr-orange' :
                uploadProgress === 'uploading' ? 'text-brand-dpr-orange' :
                'text-grey5'
              }`}>
                {uploadProgress === 'uploading' ? 'Uploading schedule image...' :
                 uploadProgress === 'completed' ? 'Schedule image uploaded successfully' :
                 uploadProgress === 'error' ? 'Upload failed' : 'Waiting to upload'}
              </span>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFileRef.current || isUploading}
          className="px-6 py-3 bg-brand-dpr-orange text-grey1 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : 'Upload Schedule Image'}
        </button>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-brand-dpr-green text-grey1">
            {currentImage ? 'Schedule image uploaded successfully!' : 'Schedule image deleted successfully!'}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-brand-dpr-orange text-grey1">
            Error: {error}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-grey1 border border-current p-6 max-w-md w-full mx-4 pointer-events-auto shadow-lg">
            <h3 className="text-lg font-bold mb-4">Delete Schedule Image?</h3>
            <p className="text-grey6 mb-6">
              Are you sure you want to delete the current schedule image? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-current text-grey6 hover:bg-grey2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-brand-dpr-orange text-grey1 hover:opacity-90 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
