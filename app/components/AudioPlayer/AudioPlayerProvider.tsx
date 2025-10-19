'use client'

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface AudioPlayerContextType {
    // Current episode info
    currentEpisode: {
        id: number
        title: string
        slug: string
        audioUrl: string
        imageUrl?: string
        hosts?: string
    } | null
    
    // Playback state
    isPlaying: boolean
    currentTime: number
    duration: number
    volume: number
    
    // Actions
    play: (episode: {
        id: number
        title: string
        slug: string
        audioUrl: string
        imageUrl?: string
        hosts?: string
    }) => void
    pause: () => void
    resume: () => void
    stop: () => void
    seek: (time: number) => void
    setVolume: (volume: number) => void
    
    // Audio element ref
    audioRef: React.RefObject<HTMLAudioElement>
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
    const [currentEpisode, setCurrentEpisode] = useState<AudioPlayerContextType['currentEpisode']>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolumeState] = useState(1)
    
    const audioRef = useRef<HTMLAudioElement>(null)

    // Play a new episode
    const play = (episode: AudioPlayerContextType['currentEpisode']) => {
        if (!episode) return
        
        setCurrentEpisode(episode)
        setIsPlaying(true)
        
        // Set audio source and play
        if (audioRef.current) {
            audioRef.current.src = episode.audioUrl
            audioRef.current.play()
        }
    }

    // Pause current episode
    const pause = () => {
        setIsPlaying(false)
        audioRef.current?.pause()
    }

    // Resume current episode
    const resume = () => {
        setIsPlaying(true)
        audioRef.current?.play()
    }

    // Stop and clear episode
    const stop = () => {
        setIsPlaying(false)
        setCurrentEpisode(null)
        setCurrentTime(0)
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.src = ''
        }
    }

    // Seek to specific time
    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time
            setCurrentTime(time)
        }
    }

    // Set volume
    const setVolume = (vol: number) => {
        const clampedVolume = Math.max(0, Math.min(1, vol))
        setVolumeState(clampedVolume)
        if (audioRef.current) {
            audioRef.current.volume = clampedVolume
        }
    }

    // Audio event listeners
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
        const handleDurationChange = () => setDuration(audio.duration)
        const handleEnded = () => {
            setIsPlaying(false)
            setCurrentTime(0)
        }

        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('durationchange', handleDurationChange)
        audio.addEventListener('ended', handleEnded)

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('durationchange', handleDurationChange)
            audio.removeEventListener('ended', handleEnded)
        }
    }, [])

    return (
        <AudioPlayerContext.Provider
            value={{
                currentEpisode,
                isPlaying,
                currentTime,
                duration,
                volume,
                play,
                pause,
                resume,
                stop,
                seek,
                setVolume,
                audioRef: audioRef as React.RefObject<HTMLAudioElement>,
            }}
        >
            {children}
            {/* Hidden audio element */}
            <audio ref={audioRef} />
        </AudioPlayerContext.Provider>
    )
}

export function useAudioPlayer() {
    const context = useContext(AudioPlayerContext)
    if (context === undefined) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider')
    }
    return context
}

