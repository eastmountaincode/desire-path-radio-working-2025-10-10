'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import EpisodeUploadForm from '@/app/components/admin/EpisodeUploadForm/EpisodeUploadForm'

interface Episode {
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

export default function EditEpisodePage() {
  const params = useParams()
  const id = params.id as string
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await fetch(`/api/admin/episodes/${id}`)

        if (!response.ok) {
          if (response.status === 401) {
            window.location.href = '/admin'
            return
          }
          throw new Error('Failed to fetch episode')
        }

        const data = await response.json()
        setEpisode(data.episode)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchEpisode()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading episode...</p>
        </div>
      </div>
    )
  }

  if (error || !episode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error || 'Episode not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-6">Edit Episode</h1>
      <EpisodeUploadForm
        mode="edit"
        episodeId={episode.id}
        initialData={episode}
      />
    </div>
  )
}
