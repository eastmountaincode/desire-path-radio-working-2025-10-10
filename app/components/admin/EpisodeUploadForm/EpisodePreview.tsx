'use client'

import { useState } from 'react'
import EpisodeCard from '@/app/components/archive/EpisodeCard/EpisodeCard'

interface EpisodePreviewProps {
    formData: {
        title: string
        slug: string
        description: string
        aired_on: string
        duration_seconds: number | null
        hosts: Array<{
            name: string
            organization: string
        }>
        tags: Array<{
            type: string
            value: string
        }>
    }
    imagePreviewUrl: string | null
}

export default function EpisodePreview({ formData, imagePreviewUrl }: EpisodePreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    // Transform form data into episode structure expected by EpisodeCard
    const previewEpisode = {
        id: 0, // Preview ID
        title: formData.title || 'Episode Title',
        slug: formData.slug || 'episode-slug',
        description: formData.description || null,
        aired_on: formData.aired_on || new Date().toISOString().split('T')[0],
        audio_url: '/placeholder-audio.mp3', // Placeholder since we don't have the actual URL yet
        image_url: imagePreviewUrl, // Use the preview URL from selected file
        duration_seconds: formData.duration_seconds,
        hosts: formData.hosts.map((host, index) => ({
            id: index + 1, // Mock IDs for preview
            name: host.name || 'Host Name',
            organization: host.organization || null
        })),
        tags: formData.tags.map((tag, index) => ({
            id: index + 1, // Mock IDs for preview
            name: tag.value || 'Tag',
            slug: tag.value?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'tag',
            type: tag.type || 'TOPIC'
        }))
    }

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-bold">Episode Preview</h2>
            <div className="border border-grey5 p-4 bg-grey1">
                <EpisodeCard
                    episode={previewEpisode}
                    isLast={true}
                    isExpanded={isExpanded}
                    onToggle={() => setIsExpanded(!isExpanded)}
                    showLink={false}
                />
            </div>
        </div>
    )
}
