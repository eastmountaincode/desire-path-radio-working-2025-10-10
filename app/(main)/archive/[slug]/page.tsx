'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import EpisodePageHeader from '@/app/components/archive/EpisodePageHeader/EpisodePageHeader'
import { useDevMode } from '@/app/components/DevModeProvider'
import { useAudioPlayer } from '@/app/components/AudioPlayer/AudioPlayerProvider'
import PlayPauseButton from '@/app/components/PlayPauseButton/PlayPauseButton'
import ShareModal from '@/app/components/ShareModal/ShareModal'
import './episode-page-styles.css'

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
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
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
            
            <div className={`pb-12 md:pb-16 max-w-6xl mx-auto ${devMode ? 'border border-purple-500' : ''}`}>
                {/* Two Column Layout */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:items-start ${devMode ? 'border border-blue-500' : ''}`}>
                    {/* Left Column */}
                    <div className={`order-2 md:order-1 ${devMode ? 'border bordebr-green-500' : ''}`}>
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
                                        slug: episode.slug,
                                        audioUrl: episode.audio_url,
                                        imageUrl: episode.image_url || undefined,
                                        hosts: episode.hosts[0]?.name || undefined
                                    })
                                }
                            }}
                            className={`episode-page-play-button group bg-transparent border-none p-0 cursor-pointer w-fit mb-3 ${devMode ? 'border border-pink-500' : ''}`}
                            aria-label={currentEpisode?.id === episode.id && isPlaying ? 'Pause' : 'Play'}
                        >
                            <div className={devMode ? 'border border-red-500' : ''}>
                                <PlayPauseButton isPlaying={currentEpisode?.id === episode.id && isPlaying} />
                            </div>
                        </button>

                        {/* Content with gap-4 */}
                        <div className="flex flex-col gap-4">
                            {/* Title */}
                            <h1 className={`episode-page-title font-[family-name:var(--font-monument-wide)] text-[28px] leading-[1.2] tracking-[0em] font-normal ${devMode ? 'border border-yellow-500' : ''}`}>
                                {episode.title}
                            </h1>

                            {/* Subtitle (Host, Location and Date) */}
                            <div className={`episode-page-subtitle font-[family-name:var(--font-monument)] text-[15px] leading-[1.5] tracking-[0em] ${devMode ? 'border border-cyan-500' : ''}`}>
                                {episode.hosts.length > 0 && (
                                    <div>
                                        <span className="font-bold">Host:</span> {episode.hosts[0]?.name}
                                        {episode.hosts[0]?.organization && `, ${episode.hosts[0].organization}`}
                                    </div>
                                )}
                                {episode.location && (
                                    <div><span className="font-bold">Location:</span> {episode.location}</div>
                                )}
                                <div><span className="font-bold">Aired On:</span> {formatDate(episode.aired_on)}</div>
                            </div>

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

             

                            {/* Share Button */}
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className={`flex items-center gap-2 cursor-pointer hover:text-brand-dpr-orange ${devMode ? 'border border-lime-500' : ''}`} 
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                                    <path d="M19.5,15c-1.656,0-3.09,.909-3.872,2.245l-7.164-3.161c.331-.626,.536-1.328,.536-2.085s-.205-1.458-.536-2.085l7.164-3.161c.781,1.336,2.215,2.245,3.872,2.245,2.481,0,4.5-2.019,4.5-4.5S21.981,0,19.5,0s-4.5,2.019-4.5,4.5c0,.469,.092,.913,.226,1.339l-7.335,3.236c-.826-.956-2.032-1.575-3.391-1.575C2.019,7.5,0,9.519,0,12s2.019,4.5,4.5,4.5c1.36,0,2.566-.619,3.391-1.575l7.335,3.236c-.134,.426-.226,.87-.226,1.339,0,2.481,2.019,4.5,4.5,4.5s4.5-2.019,4.5-4.5-2.019-4.5-4.5-4.5Zm0-14c1.93,0,3.5,1.57,3.5,3.5s-1.57,3.5-3.5,3.5-3.5-1.57-3.5-3.5,1.57-3.5,3.5-3.5ZM4.5,15.5c-1.93,0-3.5-1.57-3.5-3.5s1.57-3.5,3.5-3.5,3.5,1.57,3.5,3.5-1.57,3.5-3.5,3.5Zm15,7.5c-1.93,0-3.5-1.57-3.5-3.5s1.57-3.5,3.5-3.5,3.5,1.57,3.5,3.5-1.57,3.5-3.5,3.5Z"/>
                                </svg>
                            </button>

                            {/* Description */}
                            {episode.description && (
                                <p className={`episode-page-description mt-2 font-[family-name:var(--font-monument)] text-[15px] leading-[1.6] tracking-[0em] ${devMode ? 'border border-orange-500' : ''}`}>
                                    {episode.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Image */}
                    {episode.image_url && (
                        <div className={`w-full mx-auto mb-0 order-1 md:order-2 max-w-none ${devMode ? 'border border-green-500' : ''}`}>
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

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/archive/${slug}` : ''}
                title="Share Episode"
            />
        </div>
    )
}

