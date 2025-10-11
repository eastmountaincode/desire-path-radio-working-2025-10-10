'use client'

import { useState, FormEvent } from 'react'
import { useDevMode } from '@/app/components/DevModeProvider'
import BasicInformation from './BasicInformation/BasicInformation'
import MediaFiles from './MediaFiles'
import GuestsSection, { type Guest } from './GuestsSection'
import TagsSection from './TagsSection'

interface FormData {
  title: string
  slug: string
  description: string
  aired_on: string
  audio_url: string | null
  image_url: string | null
  duration_seconds: number | null
  guests: Guest[]
  tag_ids: number[]
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
    tag_ids: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/episodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create episode')
      }

      setSuccess(true)
      // Reset form
      setFormData({
        title: '',
        slug: '',
        description: '',
        aired_on: '',
        audio_url: null,
        image_url: null,
        duration_seconds: null,
        guests: [],
        tag_ids: []
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`space-y-6 ${devMode ? 'border border-red-500' : ''}`}
    >
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-brand-dpr-green text-grey1">
          Episode created successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-brand-dpr-orange text-grey1">
          {error}
        </div>
      )}

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

      <TagsSection />

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
    </form>
  )
}

