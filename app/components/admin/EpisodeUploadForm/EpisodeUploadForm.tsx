'use client'

import { useState, FormEvent, useRef } from 'react'
import { useDevMode } from '@/app/components/DevModeProvider'
import BasicInformation from './BasicInformation/BasicInformation'
import MediaFiles from './MediaFiles'
import HostsSection, { type Host } from './HostsSection'
import TagsSection from './TagsSection/TagsSection'
import UploadProgress from './UploadProgress'
import DeveloperSettings from './DeveloperSettings'
import EpisodePreview from './EpisodePreview'
import { type Tag } from '@/lib/tags'

interface FormData {
    title: string
    slug: string
    description: string
    aired_on: string
    location: string
    audio_url: string | null
    image_url: string | null
    duration_seconds: number | null
    hosts: Host[]
    tags: Tag[]
    test_type: 'none' | 'jest' | 'manual'
    status: 'draft' | 'published'
}

interface EpisodeData {
  id: number
  title: string
  slug: string
  description: string | null
  aired_on: string
  location: string | null
  audio_url: string
  image_url: string | null
  duration_seconds: number | null
  status: 'draft' | 'published'
  test_type: 'none' | 'jest' | 'manual'
  hosts: Array<{
    id: number
    name: string
    organization: string | null
  }>
  tags: Array<{
    id: number
    name: string
    slug: string
    type: string
  }>
}

interface EpisodeUploadFormProps {
  mode?: 'create' | 'edit'
  episodeId?: number
  initialData?: EpisodeData
}

export default function EpisodeUploadForm({
  mode = 'create',
  episodeId,
  initialData
}: EpisodeUploadFormProps) {
    const devMode = useDevMode()

    // Initialize form data from initialData if in edit mode
    const getInitialFormData = (): FormData => {
      if (mode === 'edit' && initialData) {
        return {
          title: initialData.title,
          slug: initialData.slug,
          description: initialData.description || '',
          aired_on: initialData.aired_on,
          location: initialData.location || '',
          audio_url: initialData.audio_url,
          image_url: initialData.image_url,
          duration_seconds: initialData.duration_seconds,
          hosts: initialData.hosts.map(h => ({ name: h.name, organization: h.organization || '' })),
          tags: initialData.tags.map(t => ({ type: t.type, value: t.name })),
          test_type: initialData.test_type,
          status: initialData.status
        }
      }

      return {
        title: '',
        slug: '',
        description: '',
        aired_on: '',
        location: '',
        audio_url: null,
        image_url: null,
        duration_seconds: null,
        hosts: [],
        tags: [],
        test_type: 'none' as const,
        status: 'published' as const
      }
    }

    const [formData, setFormData] = useState<FormData>(getInitialFormData())

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
    const [uploadSteps, setUploadSteps] = useState<{
        audio: 'pending' | 'uploading' | 'completed' | 'error' | 'skipped'
        image: 'pending' | 'uploading' | 'completed' | 'error' | 'skipped'
        database: 'pending' | 'processing' | 'completed' | 'error'
    }>({
        audio: 'pending',
        image: 'pending',
        database: 'pending'
    })

    // Refs to access files from MediaFiles component
    const audioFileRef = useRef<File | null>(null)
    const imageFileRef = useRef<File | null>(null)

    const handleSubmit = async (e: FormEvent, status: 'draft' | 'published') => {
        e.preventDefault()

        // Validate required fields
        if (!formData.title || !formData.slug || !formData.aired_on) {
            setError('Please fill in all required fields: title, slug, and aired on date')
            return
        }

        // Check if we have at least an audio file (only required in create mode)
        if (mode === 'create' && !audioFileRef.current) {
            setError('Please select an audio file')
            return
        }

        setIsSubmitting(true)
        setError(null)
        setSuccess(false)

        // Initialize upload steps
        const hasAudio = !!audioFileRef.current
        const hasImage = !!imageFileRef.current

        setUploadSteps({
            audio: hasAudio ? 'uploading' : 'skipped',
            image: hasImage ? 'pending' : 'skipped',
            database: 'pending'
        })

        try {
            // Create FormData for the orchestrated upload
            const uploadFormData = new FormData()

            // Add episode data as JSON
            uploadFormData.append('episodeData', JSON.stringify({
                title: formData.title,
                slug: formData.slug,
                description: formData.description,
                aired_on: formData.aired_on,
                location: formData.location,
                duration_seconds: formData.duration_seconds,
                hosts: formData.hosts,
                tags: formData.tags,
                test_type: formData.test_type,
                status: status
            }))

            // Add files
            if (audioFileRef.current) {
                uploadFormData.append('audioFile', audioFileRef.current)
            }
            if (imageFileRef.current) {
                uploadFormData.append('imageFile', imageFileRef.current)
            }

            // Update steps as we progress
            if (hasAudio) {
                setUploadSteps(prev => ({ ...prev, audio: 'uploading' }))
            }

            const apiUrl = mode === 'edit' ? `/api/admin/episodes/${episodeId}` : '/api/admin/episodes'
            const apiMethod = mode === 'edit' ? 'PUT' : 'POST'

            const response = await fetch(apiUrl, {
                method: apiMethod,
                body: uploadFormData,
            })

            if (!response.ok) {
                const data = await response.json()
                const errorMsg = mode === 'edit' ? 'Failed to update episode' : 'Failed to create episode'
                throw new Error(data.error || errorMsg)
            }

            // Mark audio as completed if it was uploaded
            if (hasAudio) {
                setUploadSteps(prev => ({ ...prev, audio: 'completed' }))
            }

            // Mark image as completed if it was uploaded
            if (hasImage) {
                setUploadSteps(prev => ({ ...prev, image: 'completed' }))
            }

            // Mark database as processing
            setUploadSteps(prev => ({ ...prev, database: 'processing' }))

            const result = await response.json()

            // Mark database as completed
            setUploadSteps(prev => ({ ...prev, database: 'completed' }))

            setSuccess(true)

            // Only reset form in create mode
            if (mode === 'create') {
                setTimeout(() => {
                    setFormData({
                        title: '',
                        slug: '',
                        description: '',
                        aired_on: '',
                        location: '',
                        audio_url: null,
                        image_url: null,
                        duration_seconds: null,
                        hosts: [],
                        tags: [],
                        test_type: 'none' as const,
                        status: 'published' as const
                    })
                    setUploadSteps({
                        audio: 'pending',
                        image: 'pending',
                        database: 'pending'
                    })
                    // Reset file refs and preview
                    audioFileRef.current = null
                    imageFileRef.current = null
                    setImagePreviewUrl(null)
                }, 1500)
            } else {
                // In edit mode, just reset the upload steps after a delay
                setTimeout(() => {
                    setUploadSteps({
                        audio: 'pending',
                        image: 'pending',
                        database: 'pending'
                    })
                }, 1500)
            }

        } catch (err) {
            // Mark failed step as error
            setUploadSteps(prev => ({
                ...prev,
                audio: prev.audio === 'uploading' ? 'error' : prev.audio,
                image: prev.image === 'uploading' ? 'error' : prev.image,
                database: prev.database === 'processing' ? 'error' : prev.database
            }))
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={`space-y-6 mb-6 max-w-7xl self-start ${devMode ? 'border border-red-500' : ''}`}
        >

            <BasicInformation
                title={formData.title}
                slug={formData.slug}
                description={formData.description}
                airedOn={formData.aired_on}
                location={formData.location}
                onChange={(data) => setFormData(prev => ({
                    ...prev,
                    title: data.title,
                    slug: data.slug,
                    description: data.description,
                    aired_on: data.airedOn,
                    location: data.location
                }))}
            />

            <MediaFiles
                audioUrl={formData.audio_url}
                imageUrl={formData.image_url}
                duration={formData.duration_seconds}
                audioFileRef={audioFileRef}
                imageFileRef={imageFileRef}
                onChange={(data) => setFormData(prev => ({
                    ...prev,
                    audio_url: data.audioUrl,
                    image_url: data.imageUrl,
                    duration_seconds: data.duration
                }))}
                onImagePreviewChange={setImagePreviewUrl}
            />

            <HostsSection
                hosts={formData.hosts}
                onChange={(hosts) => setFormData(prev => ({ ...prev, hosts }))}
            />

            <TagsSection
                tags={formData.tags}
                onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
            />

            <DeveloperSettings
                testType={formData.test_type}
                onTestTypeChange={(testType) => setFormData(prev => ({ ...prev, test_type: testType }))}
            />

            {/* Episode Preview */}
            <EpisodePreview formData={formData} imagePreviewUrl={imagePreviewUrl} />

            {/* Upload Progress */}
            <UploadProgress
                isSubmitting={isSubmitting}
                success={success}
                uploadSteps={uploadSteps}
            />

            {/* Submit Buttons */}
            <div className="pt-4 flex gap-4">
                {mode === 'create' ? (
                    <>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'draft')}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'published')}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-brand-dpr-orange text-grey1 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Publishing...' : 'Publish Episode'}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, formData.status)}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-brand-dpr-orange text-grey1 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                )}
            </div>

            {/* Success Message */}
            {success && (
                <div className="p-4 bg-brand-dpr-green text-grey1">
                    {mode === 'edit' ? 'Episode updated successfully!' : 'Episode created successfully!'}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-brand-dpr-orange text-grey1">
                    Error: {error}
                </div>
            )}
        </form>
    )
}

