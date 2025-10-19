'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import EpisodePageHeader from '@/app/components/archive/EpisodePageHeader/EpisodePageHeader'
import { useDevMode } from '@/app/components/DevModeProvider'
import { useAudioPlayer } from '@/app/components/AudioPlayer/AudioPlayerProvider'
import './episode-page-styles.css'

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

export default function EpisodePage() {
    const params = useParams()
    const slug = params.slug as string
    const [episode, setEpisode] = useState<Episode | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const devMode = useDevMode()
    const { play, currentEpisode, isPlaying, pause, resume } = useAudioPlayer()

    useEffect(() => {
        const fetchEpisode = async () => {
            try {
                const response = await fetch(`/api/episodes/${slug}`)
                
                if (!response.ok) {
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
    }, [slug])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen">
                <EpisodePageHeader />
                <div className="flex justify-center py-12">
                    <div className="text-grey5">Loading episode...</div>
                </div>
            </div>
        )
    }

    if (error || !episode) {
        return (
            <div className="min-h-screen">
                <EpisodePageHeader />
                <div className="flex justify-center py-12">
                    <div className="text-brand-dpr-orange">
                        {error || 'Episode not found'}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <EpisodePageHeader />
            
            <div className={`px-6 pb-12 md:pb-16 max-w-6xl mx-auto ${devMode ? 'border border-purple-500' : ''}`}>
                {/* Two Column Layout */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 ${devMode ? 'border border-blue-500' : ''}`}>
                    {/* Left Column */}
                    <div className={`flex flex-col gap-6 order-2 md:order-1 ${devMode ? 'border border-green-500' : ''}`}>
                        {/* Play Button */}
                        <button 
                            onClick={() => {
                                if (currentEpisode?.id === episode.id) {
                                    // Same episode - toggle play/pause
                                    if (isPlaying) {
                                        pause()
                                    } else {
                                        resume()
                                    }
                                } else {
                                    // Different episode - load and play
                                    play({
                                        id: episode.id,
                                        title: episode.title,
                                        audioUrl: episode.audio_url,
                                        imageUrl: episode.image_url || undefined,
                                        hosts: episode.hosts[0]?.name || undefined
                                    })
                                }
                            }}
                            className={`episode-page-play-button flex items-center gap-2 text-[15px] leading-[1.5] tracking-[-0.045em] bg-transparent border-none p-0 cursor-pointer w-fit ${devMode ? 'border border-pink-500' : ''}`}
                        >
                            {currentEpisode?.id === episode.id && isPlaying ? (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <rect x="3" y="2" width="4" height="12" />
                                        <rect x="9" y="2" width="4" height="12" />
                                    </svg>
                                    pause
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M3 2L13 8L3 14V2Z" />
                                    </svg>
                                    play
                                </>
                            )}
                        </button>

                        {/* Title */}
                        <h1 className={`episode-page-title font-[family-name:var(--font-monument-wide)] text-[28px] leading-[1.2] tracking-[0em] font-normal ${devMode ? 'border border-yellow-500' : ''}`}>
                            {episode.title}
                        </h1>

                        {/* Subtitle (Host and Date) */}
                        <div className={`episode-page-subtitle font-[family-name:var(--font-monument)] text-[15px] leading-[1.5] tracking-[0em] ${devMode ? 'border border-cyan-500' : ''}`}>
                            {episode.hosts.length > 0 && (
                                <span>
                                    {episode.hosts[0]?.name}
                                    {episode.hosts[0]?.organization && `, ${episode.hosts[0].organization}`}
                                </span>
                            )}
                            {episode.hosts.length > 0 && ' • '}
                            {formatDate(episode.aired_on)}
                        </div>

                        {/* Description */}
                        {episode.description && (
                            <p className={`episode-page-description font-[family-name:var(--font-monument)] text-[15px] leading-[1.6] tracking-[0em] ${devMode ? 'border border-orange-500' : ''}`}>
                                {episode.description}
                            </p>
                        )}

                        {/* Tags */}
                        {episode.tags.length > 0 && (
                            <div className={`flex flex-wrap gap-2 ${devMode ? 'border border-red-500' : ''}`}>
                                {episode.tags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className={`episode-page-tag font-[family-name:var(--font-monument)] text-[12px] tracking-[0em] border bg-transparent rounded px-2 py-0.5 ${devMode ? 'border border-indigo-500' : ''}`}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Image */}
                    {episode.image_url && (
                        <div className={`w-full max-w-[400px] mx-auto mb-0 order-1 md:order-2 md:max-w-none ${devMode ? 'border border-green-500' : ''}`}>
                            <Image
                                src={episode.image_url}
                                alt={episode.title}
                                width={600}
                                height={600}
                                className="w-full h-auto"
                                unoptimized
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

