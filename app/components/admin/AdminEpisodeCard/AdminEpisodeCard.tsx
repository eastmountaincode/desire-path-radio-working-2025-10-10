'use client'

import { useState } from 'react'
import EpisodeCard from '@/app/components/archive/EpisodeCard/EpisodeCard'
import { useDevMode } from '@/app/components/DevModeProvider'
import './admin-episode-card-styles.css'

interface AdminEpisodeCardProps {
  episode: {
    id: number
    title: string
    slug: string
    description: string | null
    aired_on: string
    audio_url: string
    image_url: string | null
    duration_seconds: number | null
    play_count?: number
    status?: 'draft' | 'published'
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
  isLast?: boolean
  isExpanded: boolean
  onToggle: () => void
  isHighlighted: boolean
  onHighlightToggle: (episodeId: number) => Promise<void>
  onEdit?: (episodeId: number) => void
  onDelete?: (episodeId: number) => void
  onStatusChange?: () => void
}

export default function AdminEpisodeCard({
  episode,
  isLast = false,
  isExpanded,
  onToggle,
  isHighlighted,
  onHighlightToggle,
  onEdit,
  onDelete,
  onStatusChange
}: AdminEpisodeCardProps) {
  const devMode = useDevMode()
  const [isTogglingHighlight, setIsTogglingHighlight] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  const handleHighlightClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsTogglingHighlight(true)
    try {
      await onHighlightToggle(episode.id)
    } finally {
      setIsTogglingHighlight(false)
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(episode.id)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(episode.id)
    }
  }

  const handlePublishClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsPublishing(true)
    try {
      const response = await fetch(`/api/admin/episodes/${episode.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'published' }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish episode')
      }

      // Trigger a refresh
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (error) {
      console.error('Error publishing episode:', error)
      alert('Failed to publish episode')
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className={devMode ? 'border border-orange-500' : ''}>
      {/* Existing Episode Card */}
      <EpisodeCard
        episode={episode}
        isLast={false} // We'll handle border in the wrapper
        isExpanded={isExpanded}
        onToggle={onToggle}
        linkHref={`/archive/${episode.slug}`} // Use regular episode page (works for both draft and published)
      />

      {/* Admin Action Buttons Below Card */}
      <div
        className={`px-6 pb-4 pt-4 flex items-center gap-3 text-sm ${!isLast && !devMode ? 'border-b border-dotted border-current' : ''} ${devMode ? 'border-2 border-green-500' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleEditClick}
          className="admin-action-button px-3 py-1"
        >
          Edit
        </button>

        <button
          onClick={handleDeleteClick}
          className="admin-action-button admin-delete-button px-3 py-1"
        >
          Delete
        </button>

        {/* Only show Highlight button for published episodes */}
        {episode.status !== 'draft' && (
          <button
            onClick={handleHighlightClick}
            disabled={isTogglingHighlight}
            className={`admin-action-button px-3 py-1 ${isHighlighted ? 'highlighted' : ''}`}
          >
            {isTogglingHighlight ? (
              '...'
            ) : isHighlighted ? (
              <>
                <span className={`star-icon ${devMode ? 'border border-pink-500' : ''}`}>★</span>{' '}
                <span className={devMode ? 'border border-cyan-500' : ''}>Highlighted</span>
              </>
            ) : (
              <>
                <span className={`star-icon ${devMode ? 'border border-pink-500' : ''}`}>☆</span>{' '}
                <span className={devMode ? 'border border-cyan-500' : ''}>Highlight</span>
              </>
            )}
          </button>
        )}

        {/* Publish button for drafts */}
        {episode.status === 'draft' && (
          <button
            onClick={handlePublishClick}
            disabled={isPublishing}
            className="admin-action-button px-3 py-1 bg-green-600 text-white hover:bg-green-700"
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        )}

        {/* Status badge and play count */}
        <div className="ml-auto flex items-center gap-3">
          {episode.status === 'draft' && (
            <span className="px-2 py-1 text-xs bg-yellow-600 text-white rounded">
              DRAFT
            </span>
          )}
          <span className="text-xs opacity-60">
            {episode.play_count ?? 0} plays
          </span>
        </div>
      </div>
    </div>
  )
}
