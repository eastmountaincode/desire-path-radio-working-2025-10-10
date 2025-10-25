'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useDevMode } from '@/app/components/DevModeProvider'
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal'
import './highlights-ordering-styles.css'

interface HighlightedEpisode {
  id: number
  episode_id: number
  display_order: number
  episodes: {
    id: number
    title: string
    slug: string
    aired_on: string
    image_url: string | null
    duration_seconds: number | null
  }
}

export default function HighlightsOrdering() {
  const [highlights, setHighlights] = useState<HighlightedEpisode[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'confirm' | 'alert' | 'error' | 'success'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'alert',
    onConfirm: () => {}
  })
  const [episodeToRemove, setEpisodeToRemove] = useState<number | null>(null)

  const devMode = useDevMode()
  const MAX_HIGHLIGHTS = 5

  useEffect(() => {
    fetchHighlights()
  }, [])

  const fetchHighlights = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/highlights')
      if (response.ok) {
        const data = await response.json()
        setHighlights(data.highlights || [])
      }
    } catch (error) {
      console.error('Failed to fetch highlights:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === index) return

    const newHighlights = [...highlights]
    const draggedItem = newHighlights[draggedIndex]

    // Remove from old position
    newHighlights.splice(draggedIndex, 1)
    // Insert at new position
    newHighlights.splice(index, 0, draggedItem)

    setHighlights(newHighlights)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleSaveOrder = async () => {
    try {
      setSaving(true)
      const episodeIds = highlights.map(h => h.episode_id)

      const response = await fetch('/api/admin/highlights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episode_ids: episodeIds }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save order')
      }

      setModalState({
        isOpen: true,
        title: 'Success',
        message: 'Highlights order saved successfully!',
        variant: 'success',
        onConfirm: () => {
          setModalState(prev => ({ ...prev, isOpen: false }))
        }
      })
    } catch (error) {
      console.error('Failed to save order:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save order',
        variant: 'error',
        onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
      })
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveHighlight = (episodeId: number) => {
    setEpisodeToRemove(episodeId)
    setModalState({
      isOpen: true,
      title: 'Remove Highlight',
      message: 'Are you sure you want to remove this episode from highlights?',
      variant: 'confirm',
      onConfirm: () => confirmRemoveHighlight(episodeId)
    })
  }

  const confirmRemoveHighlight = async (episodeId: number) => {
    setModalState(prev => ({ ...prev, isOpen: false }))

    try {
      const response = await fetch('/api/admin/highlights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ episode_id: episodeId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove highlight')
      }

      await fetchHighlights()
      setEpisodeToRemove(null)
    } catch (error) {
      console.error('Failed to remove highlight:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to remove highlight',
        variant: 'error',
        onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p>Loading highlights...</p>
      </div>
    )
  }

  return (
    <div className={`${devMode ? 'border border-purple-500' : ''}`}>
      <div className="mb-6">
        <p className="text-sm opacity-70">
          Drag and drop to reorder. Top {MAX_HIGHLIGHTS} episodes will appear on the home page.
        </p>
        <p className="text-sm opacity-70 mt-1">
          Currently showing: {highlights.length} of {MAX_HIGHLIGHTS} highlights
        </p>
      </div>

      {highlights.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-current">
          <p className="opacity-70">No highlights selected yet.</p>
          <p className="text-sm opacity-50 mt-2">
            Go to the Episodes tab to add highlights
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {highlights.map((highlight, index) => (
              <div
                key={highlight.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  highlights-ordering-item p-4 cursor-move
                  ${draggedIndex === index ? 'opacity-50' : ''}
                  ${devMode ? 'border-2 border-blue-500' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="text-2xl">
                    ☰
                  </div>

                  {/* Order Number */}
                  <div className="text-lg font-bold opacity-50 w-6">
                    {index + 1}
                  </div>

                  {/* Image */}
                  {highlight.episodes.image_url && (
                    <div className="w-16 h-16 flex-shrink-0">
                      <Image
                        src={highlight.episodes.image_url}
                        alt={highlight.episodes.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Episode Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {highlight.episodes.title}
                    </div>
                    <div className="text-sm opacity-70">
                      {formatDate(highlight.episodes.aired_on)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveHighlight(highlight.episode_id)}
                    className="highlights-ordering-remove-button px-3 py-1 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="highlights-ordering-button px-6 py-2"
            >
              {saving ? 'Saving...' : 'Save Order'}
            </button>
            <button
              onClick={fetchHighlights}
              disabled={saving}
              className="highlights-ordering-button px-6 py-2"
            >
              Revert Order
            </button>
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        variant={modalState.variant}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.variant === 'confirm' ? () => setModalState(prev => ({ ...prev, isOpen: false })) : undefined}
        confirmText={modalState.variant === 'confirm' ? 'Remove' : 'OK'}
      />
    </div>
  )
}
