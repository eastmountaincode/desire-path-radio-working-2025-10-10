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
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {

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
        <div className={`border-b border-grey5 py-4 ${devMode ? 'border-red-500 border' : ''}`}>
            <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 md:items-center ${devMode ? 'border-blue-500 border' : ''}`}>
                {/* Date Column */}
                <div className={`episode-card-date self-start ${devMode ? 'border-green-500 border' : ''}`}>
                    {formatDate(episode.aired_on)}
                </div>

                {/* Title Column - includes guest on mobile */}
                <div className={`self-start ${devMode ? 'border-green-500 border' : ''}`}>
                    <div className="episode-card-title">
                        <Link href={`/episodes/${episode.slug}`} className="hover:underline">
                            {episode.title}
                        </Link>
                    </div>
                    {/* Guest shown under title on mobile only */}
                    <div className="md:hidden episode-card-guest mt-1">
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
                <div className="hidden md:block episode-card-guest">
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
                <div className="hidden md:block episode-card-duration">
                    {formatDuration(episode.duration_seconds)}
                </div>

                {/* Tags Column - desktop only */}
                <div className="hidden md:flex flex-wrap gap-1 justify-end episode-card-tags">
                    {episode.tags.slice(0, 3).map(tag => (
                        <span
                            key={tag.id}
                            className="episode-card-tag"
                        >
                            {tag.name}
                        </span>
                    ))}
                    {episode.tags.length > 3 && (
                        <span className="episode-card-tag">
                            +{episode.tags.length - 3}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
