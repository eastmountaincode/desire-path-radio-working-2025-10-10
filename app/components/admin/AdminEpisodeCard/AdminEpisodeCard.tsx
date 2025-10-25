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
}

export default function AdminEpisodeCard({
  episode,
  isLast = false,
  isExpanded,
  onToggle,
  isHighlighted,
  onHighlightToggle,
  onEdit,
  onDelete
}: AdminEpisodeCardProps) {
  const devMode = useDevMode()
  const [isTogglingHighlight, setIsTogglingHighlight] = useState(false)

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

  return (
    <div className={devMode ? 'border border-orange-500' : ''}>
      {/* Existing Episode Card */}
      <EpisodeCard
        episode={episode}
        isLast={false} // We'll handle border in the wrapper
        isExpanded={isExpanded}
        onToggle={onToggle}
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
      </div>
    </div>
  )
}
