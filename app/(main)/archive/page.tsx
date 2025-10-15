'use client'

import { useState, useEffect } from 'react'
import EpisodeCard from '@/app/components/archive/EpisodeCard/EpisodeCard'
import ArchiveTableHeader from '@/app/components/archive/ArchiveTableHeader/ArchiveTableHeader'
import ArchiveControlHeader from '@/app/components/archive/ArchiveControlHeader/ArchiveControlHeader'

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

    const limit = 10

    const fetchEpisodes = async (currentOffset: number = 0) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/episodes?limit=${limit}&offset=${currentOffset}&orderBy=aired_on&order=desc&includeTest=true&testTypes=none,manual`)

            if (!response.ok) {
                throw new Error('Failed to fetch episodes')
            }

            const data: ApiResponse = await response.json()

            if (currentOffset === 0) {
                // First load
                setEpisodes(data.episodes)
            } else {
                // Append more episodes
                setEpisodes(prev => [...prev, ...data.episodes])
            }

            setHasMore(data.pagination.hasMore)
            setOffset(currentOffset + limit)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEpisodes(0)
    }, [])

    const loadMore = () => {
        fetchEpisodes(offset)
    }

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
        <div className="min-h-screen">
            {/* Control Header */}
            <div className="pt-6 pb-2">
                <ArchiveControlHeader episodeCount={episodes.length} />
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
                        <div className="space-y-3 mb-8">
                            {episodes.map((episode, index) => (
                                <EpisodeCard key={episode.id} episode={episode} isLast={index === episodes.length - 1} />
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

