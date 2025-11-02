'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminEpisodeCard from '../AdminEpisodeCard/AdminEpisodeCard'
import ArchiveTableHeader from '@/app/components/archive/ArchiveTableHeader/ArchiveTableHeader'
import ArchiveControlHeader from '@/app/components/archive/ArchiveControlHeader/ArchiveControlHeader'
import { useDevMode } from '@/app/components/DevModeProvider'
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal'
import type { SelectedTag } from '@/app/components/archive/ArchiveControlHeader/FilterModal/FilterModal'

interface Episode {
  id: number
  title: string
  slug: string
  description: string | null
  aired_on: string
  audio_url: string
  image_url: string | null
  duration_seconds: number | null
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

interface ApiResponse {
  episodes: Episode[]
  pagination: {
    limit: number
    offset: number
    total: number
    hasMore: boolean
    orderBy: string
    order: string
    includeTest: boolean
    tags?: string[]
  }
}

interface EpisodesManagementProps {
  mode?: 'published' | 'draft'
}

export default function EpisodesManagement({ mode = 'published' }: EpisodesManagementProps) {
  const router = useRouter()
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([])
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedEpisodeId, setExpandedEpisodeId] = useState<number | null>(null)
  const [highlightedEpisodeIds, setHighlightedEpisodeIds] = useState<Set<number>>(new Set())
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

  const limit = 10

  const devMode = useDevMode()

  // Fetch highlighted episode IDs
  const fetchHighlightedEpisodes = async () => {
    try {
      const response = await fetch('/api/admin/highlights')
      if (response.ok) {
        const data = await response.json()
        const ids = new Set<number>(data.highlights.map((h: { episode_id: number }) => h.episode_id))
        setHighlightedEpisodeIds(ids)
      }
    } catch (error) {
      console.error('Failed to fetch highlighted episodes:', error)
    }
  }

  const fetchEpisodes = async (
    currentOffset: number = 0,
    tagSlugs: string[] = [],
    order: 'asc' | 'desc' = 'desc'
  ) => {
    try {
      setLoading(true)
      const tagParams = tagSlugs.length > 0 ? `&tags=${tagSlugs.join(',')}` : ''
      const statusParam = `&status=${mode}`
      const response = await fetch(
        `/api/episodes?limit=${limit}&offset=${currentOffset}&orderBy=aired_on&order=${order}&includeTest=true&testTypes=none,manual${tagParams}${statusParam}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch episodes')
      }

      const data: ApiResponse = await response.json()

      if (currentOffset === 0) {
        setEpisodes(data.episodes)
        setOffset(limit)
      } else {
        setEpisodes((prev) => [...prev, ...data.episodes])
        setOffset((prev) => prev + limit)
      }

      setHasMore(data.pagination.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHighlightedEpisodes()
  }, [])

  useEffect(() => {
    setOffset(0)
    setEpisodes([])
    const selectedTagSlugs = selectedTags.map((tag) => tag.slug)
    fetchEpisodes(0, selectedTagSlugs, sortOrder)
  }, [selectedTags, sortOrder, mode])

  const loadMore = () => {
    const selectedTagSlugs = selectedTags.map((tag) => tag.slug)
    fetchEpisodes(offset, selectedTagSlugs, sortOrder)
  }

  const handleFilterApply = (tags: SelectedTag[]) => {
    setSelectedTags(tags)
  }

  const handleSortApply = (order: 'asc' | 'desc') => {
    setSortOrder(order)
  }

  const handleEpisodeClick = (episodeId: number) => {
    setExpandedEpisodeId(expandedEpisodeId === episodeId ? null : episodeId)
  }

  const handleHighlightToggle = async (episodeId: number) => {
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
        throw new Error(data.error || 'Failed to toggle highlight')
      }

      // Refresh highlighted episodes
      await fetchHighlightedEpisodes()
    } catch (error) {
      console.error('Failed to toggle highlight:', error)
      setModalState({
        isOpen: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to toggle highlight',
        variant: 'error',
        onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
      })
    }
  }

  const handleEdit = (episodeId: number) => {
    router.push(`/admin/archive/edit/${episodeId}`)
  }

  const handleDelete = (episodeId: number) => {
    const episode = episodes.find(ep => ep.id === episodeId)
    const episodeTitle = episode?.title || 'this episode'

    setModalState({
      isOpen: true,
      title: 'Delete Episode',
      message: `Are you sure you want to delete "${episodeTitle}"? This action cannot be undone and will also delete the associated audio and image files.`,
      variant: 'confirm',
      onConfirm: async () => {
        setModalState(prev => ({ ...prev, isOpen: false }))
        
        try {
          const response = await fetch(`/api/admin/episodes/${episodeId}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to delete episode')
          }

          // Success - refresh the episodes list
          setModalState({
            isOpen: true,
            title: 'Success',
            message: 'Episode deleted successfully',
            variant: 'success',
            onConfirm: () => {
              setModalState(prev => ({ ...prev, isOpen: false }))
              // Refresh episodes list
              setOffset(0)
              setEpisodes([])
              const selectedTagSlugs = selectedTags.map((tag) => tag.slug)
              fetchEpisodes(0, selectedTagSlugs, sortOrder)
            }
          })
        } catch (error) {
          console.error('Failed to delete episode:', error)
          setModalState({
            isOpen: true,
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to delete episode',
            variant: 'error',
            onConfirm: () => setModalState(prev => ({ ...prev, isOpen: false }))
          })
        }
      }
    })
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={devMode ? 'border border-red-500' : ''}>
      {/* Control Header */}
      <div className="pb-2">
        <ArchiveControlHeader
          episodeCount={episodes.length}
          onFilterApply={handleFilterApply}
          onSortApply={handleSortApply}
          currentSortOrder={sortOrder}
          selectedTags={selectedTags}
        />
      </div>

      {/* Content */}
      <div>
        {loading && episodes.length === 0 ? (
          <div className="flex justify-center py-12">
            <div>Loading episodes...</div>
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-12">
            <p>No episodes found.</p>
          </div>
        ) : (
          <>
            <ArchiveTableHeader />

            {/* Episodes List */}
            <div className="space-y-0 mb-8">
              {episodes.map((episode, index) => (
                <AdminEpisodeCard
                  key={episode.id}
                  episode={episode}
                  isLast={index === episodes.length - 1}
                  isExpanded={expandedEpisodeId === episode.id}
                  onToggle={() => handleEpisodeClick(episode.id)}
                  isHighlighted={highlightedEpisodeIds.has(episode.id)}
                  onHighlightToggle={handleHighlightToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={() => {
                    setOffset(0)
                    setEpisodes([])
                    const selectedTagSlugs = selectedTags.map((tag) => tag.slug)
                    fetchEpisodes(0, selectedTagSlugs, sortOrder)
                  }}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="flex flex-col items-center gap-1 mx-auto hover:text-brand-dpr-orange disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-sm">{loading ? 'loading...' : 'show more'}</span>
                  <i className="fi fi-tr-angle-down"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        variant={modalState.variant}
        onConfirm={modalState.onConfirm}
        onCancel={modalState.variant === 'confirm' ? () => setModalState(prev => ({ ...prev, isOpen: false })) : undefined}
      />
    </div>
  )
}
