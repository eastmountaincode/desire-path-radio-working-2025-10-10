'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useDevMode } from '../../DevModeProvider'
import Tag from '../../Tag/Tag'
import './home-highlights-styles.css'

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

export default function HomeHighlights() {
    const devMode = useDevMode()
    const [episodes, setEpisodes] = useState<Episode[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchHighlights() {
            try {
                const response = await fetch('/api/highlights')
                if (response.ok) {
                    const data = await response.json()
                    setEpisodes(data.episodes || [])
                }
            } catch (error) {
                console.error('Failed to fetch highlights:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchHighlights()
    }, [])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (loading || episodes.length === 0) {
        return null
    }

    return (
        <section className={`pt-12 pb-12 ${devMode ? 'border border-red-500' : ''}`}>
            <div className={devMode ? 'border border-blue-500' : ''}>
                <h2 className="mb-6 text-3xl font-[family-name:var(--font-monument-wide)]">Highlights</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {episodes.map((episode) => (
                        <div
                            key={episode.id}
                            className={`py-4 pb-8 relative ${devMode ? 'border border-purple-500' : ''}`}
                        >
                            {/* Image */}
                            {episode.image_url && (
                                <div className={`mb-4 aspect-square overflow-hidden ${devMode ? 'border border-yellow-500' : ''}`}>
                                    <Image
                                        src={episode.image_url}
                                        alt={episode.title}
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                    />
                                </div>
                            )}

                            {/* Date */}
                            <div className={`text-sm mb-2 font-[family-name:var(--font-monument)] tracking-[0.003em] ${devMode ? 'border border-green-500' : ''}`}>
                                {formatDate(episode.aired_on)}
                            </div>

                            {/* Title */}
                            <h3 className={`text-xl mb-2 line-clamp-2 font-[family-name:var(--font-monument)] ${devMode ? 'border border-cyan-500' : ''}`}>
                                {episode.title}
                            </h3>

                            {/* Tags */}
                            {episode.tags.length > 0 && (
                                <div className={`flex flex-wrap gap-1 mb-4 ${devMode ? 'border border-orange-500' : ''}`}>
                                    {episode.tags.slice(0, 3).map(tag => (
                                        <Tag key={tag.id} name={tag.name} />
                                    ))}
                                    {episode.tags.length > 3 && (
                                        <Tag name={`+${episode.tags.length - 3}`} />
                                    )}
                                </div>
                            )}

                            {/* View Episode Link */}
                            <Link
                                href={`/archive/${episode.slug}`}
                                className={`home-highlights-link flex items-center gap-1 font-mono absolute bottom-0 left-0 ${devMode ? 'border border-pink-500' : ''}`}
                            >
                                <span>view episode</span>
                                <i className="fi fi-ts-arrow-small-right home-highlights-link-arrow"></i>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
