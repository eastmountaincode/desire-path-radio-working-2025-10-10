'use client'

import Image from 'next/image'

interface PlayPauseButtonProps {
    isPlaying: boolean
    size?: number
}

export default function PlayPauseButton({ isPlaying, size = 10 }: PlayPauseButtonProps) {
    const regularSrc = isPlaying
        ? '/images/audio-buttons/pause_regular.svg'
        : '/images/audio-buttons/play_regular.svg'

    const hoverSrc = isPlaying
        ? '/images/audio-buttons/pause_dark.svg'
        : '/images/audio-buttons/play_dark.svg'

    const alt = isPlaying ? 'Pause' : 'Play'

    // Convert Tailwind size to pixels (size * 4)
    const pixelSize = size * 4

    return (
        <div className="relative inline-block group translate-y-1">
            {/* Regular state - visible by default, hidden on hover */}
            <Image
                src={regularSrc}
                alt={alt}
                width={pixelSize}
                height={pixelSize}
                className="group-hover:opacity-0"
            />
            {/* Hover state - hidden by default, visible on hover */}
            <Image
                src={hoverSrc}
                alt={alt}
                width={pixelSize}
                height={pixelSize}
                className="absolute top-0 left-0 opacity-0 group-hover:opacity-100"
            />
        </div>
    )
}
