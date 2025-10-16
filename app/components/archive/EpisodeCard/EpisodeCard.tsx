'use client'

import Image from 'next/image'

import './episode-card-styles.css'
import { useDevMode } from '../../DevModeProvider'

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
    isLast?: boolean
    isExpanded: boolean
    onToggle: () => void
}

export default function EpisodeCard({ episode, isLast = false, isExpanded, onToggle }: EpisodeCardProps) {
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
        <div 
            className={`py-4 episode-card ${!isLast ? 'episode-card-dotted' : ''} ${isExpanded ? 'episode-card-expanded-state' : ''} ${devMode ? 'border-red-500 border' : ''}`}
            onClick={onToggle}
        >
            <div className={`grid grid-cols-7 md:grid-cols-10 lg:grid-cols-15 gap-4 h-26 md:h-24 items-start md:items-center ${devMode ? 'border-blue-500 border' : ''}`}>
                {/* Date Column */}
                <div className={`pl-2 col-span-2 pe-4 md:col-span-2 episode-card-date ${devMode ? 'border-green-500 border' : ''}`}>
                    {formatDate(episode.aired_on)}
                </div>

                {/* Title Column - includes host on mobile */}
                <div className={`col-span-5 md:col-span-4 lg:col-span-5 ${devMode ? 'border-green-500 border' : ''}`}>
                    <div className="episode-card-title -mt-1.5">
                        {episode.title}
                    </div>
                    {/* Host shown under title on mobile only */}
                    <div className={`md:hidden episode-card-host mt-1 ${devMode ? 'border-green-500 border' : ''}`}>
                        {episode.hosts.length > 0 ? (
                            <>
                                {episode.hosts[0]?.name}
                                {episode.hosts[0]?.organization && `, ${episode.hosts[0].organization}`}
                            </>
                        ) : (
                            ''
                        )}
                    </div>
                </div>

                {/* Host Column - desktop only */}
                <div className={`hidden md:block md:col-span-2 lg:col-span-3 episode-card-host ${devMode ? 'border-green-500 border' : ''}`}>
                    {episode.hosts.length > 0 ? (
                        <>
                            {episode.hosts[0]?.name}
                            {episode.hosts[0]?.organization && `, ${episode.hosts[0].organization}`}
                        </>
                    ) : (
                        ''
                    )}
                </div>

                {/* Duration Column - desktop only */}
                <div className={`hidden lg:block episode-card-duration lg:col-span-2 ${devMode ? 'border-green-500 border' : ''}`}>
                    {formatDuration(episode.duration_seconds)}
                </div>

                {/* Tags Column - desktop only */}
                <div className={`hidden md:flex align-start md:col-span-2 lg:col-span-3 flex-wrap gap-1 episode-card-tags ${devMode ? 'border-green-500 border' : ''}`}>
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

            {/* Expanded Content */}
            <div className={`episode-card-expanded ${isExpanded ? 'episode-card-expanded-open' : ''} ${devMode ? 'border-purple-500 border' : ''}`}>
                <div className="episode-card-expanded-content">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                        {/* Image */}
                        {episode.image_url && (
                            <div className={`md:col-span-4 ${devMode ? 'border-yellow-500 border' : ''}`}>
                                <Image
                                    src={episode.image_url}
                                    alt={episode.title}
                                    width={400}
                                    height={400}
                                    className="w-full h-auto"
                                />
                            </div>
                        )}
                        
                        {/* Description */}
                        <div className={`${episode.image_url ? 'md:col-span-8' : 'md:col-span-12'} ${devMode ? 'border-yellow-500 border' : ''}`}>
                            {episode.description && (
                                <p className="episode-card-description">
                                    {episode.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
