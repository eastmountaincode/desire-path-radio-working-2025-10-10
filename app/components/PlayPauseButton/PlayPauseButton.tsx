'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'

interface PlayPauseButtonProps {
    isPlaying: boolean
    size?: number
}

export default function PlayPauseButton({ isPlaying, size = 10 }: PlayPauseButtonProps) {
    const { theme } = useTheme()

    const imageSrc = isPlaying
        ? (theme === 'dark' ? '/images/audio-buttons/pause_dark.svg' : '/images/audio-buttons/pause_regular.svg')
        : (theme === 'dark' ? '/images/audio-buttons/play_dark.svg' : '/images/audio-buttons/play_regular.svg')

    const alt = isPlaying ? 'Pause' : 'Play'

    // Convert Tailwind size to pixels (size * 4)
    const pixelSize = size * 4

    return (
        <Image
            src={imageSrc}
            alt={alt}
            width={pixelSize}
            height={pixelSize}
        />
    )
}
