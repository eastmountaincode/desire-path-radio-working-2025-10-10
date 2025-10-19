'use client'

import { useState, useEffect } from 'react'
import EpisodeCard from '@/app/components/archive/EpisodeCard/EpisodeCard'
import ArchiveTableHeader from '@/app/components/archive/ArchiveTableHeader/ArchiveTableHeader'
import ArchiveControlHeader from '@/app/components/archive/ArchiveControlHeader/ArchiveControlHeader'
import { useDevMode } from '@/app/components/DevModeProvider'

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

export default function Archive() {
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(false)
    const [selectedTagSlugs, setSelectedTagSlugs] = useState<string[]>([])
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [expandedEpisodeId, setExpandedEpisodeId] = useState<number | null>(null)

    const limit = 3

    const fetchEpisodes = async (currentOffset: number = 0, tagSlugs: string[] = [], order: 'asc' | 'desc' = 'desc') => {        
        try {
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
                    const existingIds = new Set(prev.map(ep => ep.id))
                    const newEpisodes = data.episodes.filter(ep => !existingIds.has(ep.id))
                    return [...prev, ...newEpisodes]
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
        fetchEpisodes(0, selectedTagSlugs, sortOrder)
    }, [selectedTagSlugs, sortOrder])

    const loadMore = () => {
        fetchEpisodes(offset, selectedTagSlugs, sortOrder)
    }

    const handleFilterApply = (tagSlugs: string[]) => {
        setSelectedTagSlugs(tagSlugs)
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
                    <h1 className="text-2xl font-bold text-brand-dpr-orange mb-4">Archive</h1>
                    <p className="text-brand-dpr-orange">Error: {error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${devMode ? 'border border-red-500' : ''}`}>
            {/* Control Header */}
            <div className="pt-6 pb-2">
                <ArchiveControlHeader 
                    episodeCount={episodes.length}
                    onFilterApply={handleFilterApply}
                    onSortApply={handleSortApply}
                    currentSortOrder={sortOrder}
                />
            </div>

            {/* Content */}
            <div>
                {loading && episodes.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <div className="text-grey5">Loading episodes...</div>
                    </div>
                ) : episodes.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-grey5">No episodes found.</p>
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
                            <div className="text-center">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="px-6 py-2 bg-brand-dpr-orange text-grey1 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Loading...' : 'Show More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

