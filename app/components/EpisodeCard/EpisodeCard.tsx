'use client'

import Link from 'next/link'

import './episode-card-styles.css'
import { useDevMode } from '../DevModeProvider'

interface EpisodeCardProps {
    episode: {
        id: number
        title: string
        slug: string
        description: string | null
        aired_on: string
        audio_url: string
        image_url: string | null
        duration_seconds: number | null
        guests: Array<{
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
}

export default function EpisodeCard({ episode, isLast = false }: EpisodeCardProps) {

    const devMode = useDevMode()
    
    const formatDuration = (seconds: number | null) => {
        if (!seconds) return null
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (hours > 0) {
            return `${hours}h ${minutes} min`
        }
        return `${minutes} min`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    return (
        <div className={`py-2 ${devMode ? 'border-red-500 border' : ''}`} style={isLast ? {} : {
          backgroundImage: 'linear-gradient(90deg, var(--color-grey6) 54%, transparent 46%)',
          backgroundSize: '4px 1.3px',
          backgroundPosition: '0 100%',
          backgroundRepeat: 'repeat-x'
        }}>
            <div className={`grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4 h-24 items-center ${devMode ? 'border-blue-500 border' : ''}`}>
                {/* Date Column */}
                <div className={`episode-card-date ${devMode ? 'border-green-500 border' : ''}`}>
                    {formatDate(episode.aired_on)}
                </div>

                {/* Title Column - includes guest on mobile */}
                <div className={`md:col-span-2 ${devMode ? 'border-green-500 border' : ''}`}>
                    <div className="episode-card-title">
                        <Link href={`/episodes/${episode.slug}`} className="hover:underline">
                            {episode.title}
                        </Link>
                    </div>
                    {/* Guest shown under title on mobile only */}
                    <div className={`md:hidden episode-card-guest mt-1 ${devMode ? 'border-green-500 border' : ''}`}>
                        {episode.guests.length > 0 ? (
                            <>
                                {episode.guests[0]?.name}
                                {episode.guests[0]?.organization && `, ${episode.guests[0].organization}`}
                            </>
                        ) : (
                            'No guests'
                        )}
                    </div>
                </div>

                {/* Guest Column - desktop only */}
                <div className={`hidden md:block md:col-span-2 episode-card-guest ${devMode ? 'border-green-500 border' : ''}`}>
                    {episode.guests.length > 0 ? (
                        <>
                            {episode.guests[0]?.name}
                            {episode.guests[0]?.organization && `, ${episode.guests[0].organization}`}
                        </>
                    ) : (
                        'No guests'
                    )}
                </div>

                {/* Duration Column - desktop only */}
                <div className={`hidden lg:block episode-card-duration ${devMode ? 'border-green-500 border' : ''}`}>
                    {formatDuration(episode.duration_seconds)}
                </div>

                {/* Tags Column - desktop only */}
                <div className={`hidden md:flex align-start lg:col-span-2 flex-wrap gap-1 episode-card-tags ${devMode ? 'border-green-500 border' : ''}`}>
                    {episode.tags.slice(0, 2).map(tag => (
                        <span
                            key={tag.id}
                            className={`episode-card-tag ${devMode ? 'bborder-green-500 border' : ''}`}>
                        
                            {tag.name}
                        </span>
                    ))}
                    {episode.tags.length > 2 && (
                        <span className={`episode-card-tag ${devMode ? 'border-green-500 border' : ''}`}>
                            +{episode.tags.length - 2}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
