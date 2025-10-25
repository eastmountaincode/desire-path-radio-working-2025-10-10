'use client'

import { useState, useEffect } from 'react'
import EpisodeCard from '@/app/components/archive/EpisodeCard/EpisodeCard'
import ArchiveTableHeader from '@/app/components/archive/ArchiveTableHeader/ArchiveTableHeader'
import ArchiveControlHeader from '@/app/components/archive/ArchiveControlHeader/ArchiveControlHeader'
import { useDevMode } from '@/app/components/DevModeProvider'
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

// Notes
// When filter or sort changes, offset gets reset to 0.

export default function Archive() {
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(false)
    const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([])
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [expandedEpisodeId, setExpandedEpisodeId] = useState<number | null>(null)

    const limit = 10

    const fetchEpisodes = async (currentOffset: number = 0, tagSlugs: string[] = [], order: 'asc' | 'desc' = 'desc') => {        
        try {
            console.log('fetchEpisodes', currentOffset, tagSlugs, order)
            setLoading(true)
            const tagParams = tagSlugs.length > 0 ? `&tags=${tagSlugs.join(',')}` : ''
            const response = await fetch(`/api/episodes?limit=${limit}&offset=${currentOffset}&orderBy=aired_on&order=${order}&includeTest=true&testTypes=none,manual${tagParams}`)

            if (!response.ok) {
                throw new Error('Failed to fetch episodes')
            }

            const data: ApiResponse = await response.json()

            if (currentOffset === 0) {
                // Replace episodes (first page load or after filter/sort change)
                setEpisodes(data.episodes)
                setOffset(limit)
            } else {
                // Append more episodes, but deduplicate
                setEpisodes(prev => {
                    return [...prev, ...data.episodes]
                })
                setOffset(prev => prev + limit)
            }

            setHasMore(data.pagination.hasMore)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Reset offset immediately when sort or filter changes
        setOffset(0)
        setEpisodes([])
        const selectedTagSlugs = selectedTags.map(tag => tag.slug)
        fetchEpisodes(0, selectedTagSlugs, sortOrder)
    }, [selectedTags, sortOrder])

    const loadMore = () => {
        const selectedTagSlugs = selectedTags.map(tag => tag.slug)
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

    const devMode = useDevMode()

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-brand-dpr-orange">Error: {error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${devMode ? 'border border-red-500' : ''}`}>
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

                        {/* Episodes Grid */}
                        <div className="space-y-0 mb-8">
                            {episodes.map((episode, index) => (
                                <EpisodeCard 
                                    key={episode.id} 
                                    episode={episode} 
                                    isLast={index === episodes.length - 1}
                                    isExpanded={expandedEpisodeId === episode.id}
                                    onToggle={() => handleEpisodeClick(episode.id)}
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
        </div>
    )
}

