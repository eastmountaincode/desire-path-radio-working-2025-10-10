'use client'

import { useState, FormEvent, useRef } from 'react'
import { useDevMode } from '@/app/components/DevModeProvider'
import BasicInformation from './BasicInformation/BasicInformation'
import MediaFiles from './MediaFiles'
import GuestsSection, { type Guest } from './GuestsSection'
import TagsSection from './TagsSection/TagsSection'
import UploadProgress from './UploadProgress'
import { type Tag } from '@/lib/tags'

interface FormData {
    title: string
    slug: string
    description: string
    aired_on: string
    audio_url: string | null
    image_url: string | null
    duration_seconds: number | null
    guests: Guest[]
    tags: Tag[]
    is_test: boolean
}

export default function EpisodeUploadForm() {
    const devMode = useDevMode()
    const [formData, setFormData] = useState<FormData>({
        title: '',
        slug: '',
        description: '',
        aired_on: '',
        audio_url: null,
        image_url: null,
        duration_seconds: null,
        guests: [],
        tags: [],
        is_test: false
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        // Validate required fields
        if (!formData.title || !formData.slug || !formData.aired_on) {
            setError('Please fill in all required fields: title, slug, and aired on date')
            return
        }

        // Check if we have at least an audio file
        if (!audioFileRef.current) {
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
                duration_seconds: formData.duration_seconds,
                guests: formData.guests,
                tags: formData.tags,
                is_test: formData.is_test
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

            const response = await fetch('/api/admin/episodes', {
                method: 'POST',
                body: uploadFormData,
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to create episode')
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

            // Reset form after a short delay to show success
            setTimeout(() => {
                setFormData({
                    title: '',
                    slug: '',
                    description: '',
                    aired_on: '',
                    audio_url: null,
                    image_url: null,
                    duration_seconds: null,
                    guests: [],
                    tags: [],
                    is_test: false
                })
                setUploadSteps({
                    audio: 'pending',
                    image: 'pending',
                    database: 'pending'
                })
                // Reset file refs
                audioFileRef.current = null
                imageFileRef.current = null
            }, 1500)

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
            className={`space-y-6 mb-6 ${devMode ? 'border border-red-500' : ''}`}
        >

            <BasicInformation
                title={formData.title}
                slug={formData.slug}
                description={formData.description}
                airedOn={formData.aired_on}
                onChange={(data) => setFormData(prev => ({
                    ...prev,
                    title: data.title,
                    slug: data.slug,
                    description: data.description,
                    aired_on: data.airedOn
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
            />

            <GuestsSection
                guests={formData.guests}
                onChange={(guests) => setFormData(prev => ({ ...prev, guests }))}
            />

            <TagsSection
                tags={formData.tags}
                onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
            />

            {/* Environment Selection */}
            <div className="space-y-2">
                <h2 className="text-xl font-bold">Developer Settings</h2>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.is_test}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_test: e.target.checked }))}
                        className="w-5 h-5 border border-grey5"
                    />
                    <span>This is a test episode (not for production)</span>
                </label>
            </div>

            {/* Upload Progress */}
            <UploadProgress
                isSubmitting={isSubmitting}
                success={success}
                uploadSteps={uploadSteps}
            />

            {/* Submit Button */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-brand-dpr-orange text-grey1 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Creating Episode...' : 'Create Episode'}
                </button>
            </div>

            {/* Success Message */}
            {success && (
                <div className="p-4 bg-brand-dpr-green text-grey1">
                    Episode created successfully!
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

