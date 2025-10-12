'use client'

import { useState, FormEvent } from 'react'
import { useDevMode } from '@/app/components/DevModeProvider'
import BasicInformation from './BasicInformation/BasicInformation'
import MediaFiles from './MediaFiles'
import GuestsSection, { type Guest } from './GuestsSection'
import TagsSection from './TagsSection/TagsSection'
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    console.log('📦 Episode Data Object:', formData)
    console.log('-----------------------------------')
    console.log('Title:', formData.title)
    console.log('Slug:', formData.slug)
    console.log('Description:', formData.description)
    console.log('Aired On:', formData.aired_on)
    console.log('Audio URL:', formData.audio_url)
    console.log('Image URL:', formData.image_url)
    console.log('Duration (seconds):', formData.duration_seconds)
    console.log('Guests:', formData.guests)
    console.log('Tags:', formData.tags)
    console.log('Is Test:', formData.is_test)
    console.log('-----------------------------------')
    
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
        tags: [],
        is_test: false
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

