'use client'

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'
import type { EveningsStreamData } from '../../../lib/evenings'

interface AudioPlayerContextType {
    // Playback mode
    mode: 'archive' | 'live' | null

    // Current episode info (for archive mode)
    currentEpisode: {
        id: number
        title: string
        slug: string
        audioUrl: string
        imageUrl?: string
        hosts?: string
    } | null

    // Live channel info (for live mode)
    liveChannel: {
        channelNumber: 'ch1' | 'ch2'
        channelType: string
        stationSlug: string
    } | null
    liveStreamData: EveningsStreamData | null

    // Playback state
    isPlaying: boolean
    isLoading: boolean
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
    playLiveChannel: (
        channelNumber: 'ch1' | 'ch2',
        channelType: string,
        stationSlug: string,
        streamData: EveningsStreamData
    ) => void
    preloadLiveChannel: (
        channelNumber: 'ch1' | 'ch2',
        stationSlug: string,
        streamUrl: string
    ) => void
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
    const [mode, setMode] = useState<'archive' | 'live' | null>(null)
    const [currentEpisode, setCurrentEpisode] = useState<AudioPlayerContextType['currentEpisode']>(null)
    const [liveChannel, setLiveChannel] = useState<AudioPlayerContextType['liveChannel']>(null)
    const [liveStreamData, setLiveStreamData] = useState<EveningsStreamData | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolumeState] = useState(1)

    const audioRef = useRef<HTMLAudioElement>(null)
    const preloadedChannelRef = useRef<{ channelNumber: string; stationSlug: string; streamUrl: string } | null>(null)
    const playCountTrackedRef = useRef<number | null>(null) // Track which episode ID has been counted

    // Play a new episode (archive mode)
    const play = (episode: AudioPlayerContextType['currentEpisode']) => {
        if (!episode) return

        // Switch to archive mode
        setMode('archive')
        setCurrentEpisode(episode)
        setLiveChannel(null)
        setLiveStreamData(null)
        setIsPlaying(true)

        // Set audio source and play
        if (audioRef.current) {
            audioRef.current.src = episode.audioUrl
            audioRef.current.play()
        }
    }

    // Preload a live channel (buffer without playing)
    const preloadLiveChannel = (
        channelNumber: 'ch1' | 'ch2',
        stationSlug: string,
        streamUrl: string
    ) => {
        if (!audioRef.current || !streamUrl) return

        const audio = audioRef.current

        // Only preload if we're not currently playing or loading anything
        // and this is a different stream than what's already loaded
        const currentSrc = audio.src
        const isSameStream = currentSrc === streamUrl
        const isCurrentlyPlayingOrLoading = mode !== null && (isPlaying || isLoading)

        if (!isCurrentlyPlayingOrLoading && !isSameStream) {
            audio.src = streamUrl
            audio.load()
            preloadedChannelRef.current = { channelNumber, stationSlug, streamUrl }
        }
    }

    // Play a live channel (live mode)
    const playLiveChannel = async (
        channelNumber: 'ch1' | 'ch2',
        channelType: string,
        stationSlug: string,
        streamData: EveningsStreamData
    ) => {
        if (!streamData.streamUrl || !audioRef.current) return

        const audio = audioRef.current
        console.log(`[${channelNumber}] playLiveChannel called, streamUrl:`, streamData.streamUrl)

        // Switch to live mode immediately (for UI responsiveness)
        setMode('live')
        setLiveChannel({ channelNumber, channelType, stationSlug })
        setLiveStreamData(streamData)
        setCurrentEpisode(null)
        setIsLoading(true)
        setIsPlaying(false)

        // Check if we need to set a new source
        const needsNewSource = audio.src !== streamData.streamUrl
        console.log(`[${channelNumber}] needsNewSource:`, needsNewSource, 'current src:', audio.src)

        if (needsNewSource) {
            // Set the new source
            audio.src = streamData.streamUrl
            console.log(`[${channelNumber}] Setting new source, waiting for canplay...`)

            // Wait for the audio to be ready to play
            await new Promise<void>((resolve, reject) => {
                const onCanPlay = () => {
                    console.log(`[${channelNumber}] canplay event fired`)
                    audio.removeEventListener('canplay', onCanPlay)
                    audio.removeEventListener('error', onError)
                    resolve()
                }
                const onError = (e: Event) => {
                    console.log(`[${channelNumber}] error event fired:`, e)
                    audio.removeEventListener('canplay', onCanPlay)
                    audio.removeEventListener('error', onError)
                    reject(e)
                }
                audio.addEventListener('canplay', onCanPlay)
                audio.addEventListener('error', onError)
                audio.load()
            })
        }

        try {
            console.log(`[${channelNumber}] Calling play()...`)
            await audio.play()
            console.log(`[${channelNumber}] play() succeeded`)
            setIsLoading(false)
            setIsPlaying(true)
        } catch (err) {
            console.error(`[${channelNumber}] Error playing live channel:`, err)
            setIsLoading(false)
            setIsPlaying(false)
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

    // Stop and clear all playback
    const stop = () => {
        setIsPlaying(false)
        setIsLoading(false)
        setMode(null)
        setCurrentEpisode(null)
        setLiveChannel(null)
        setLiveStreamData(null)
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

    // Track play count after 20 seconds of playback
    useEffect(() => {
        // Only track for archive mode (not live streams)
        if (mode !== 'archive' || !currentEpisode) return

        // If we've already tracked this episode, don't track again
        if (playCountTrackedRef.current === currentEpisode.id) return

        // Check if we've played for X seconds
        if (currentTime >= 30) {
            // Track the play count
            playCountTrackedRef.current = currentEpisode.id

            // Fire-and-forget API call to increment play count
            fetch(`/api/episodes/${currentEpisode.slug}/play`, {
                method: 'POST',
            }).catch((error) => {
                console.error('Failed to track play count:', error)
            })
        }
    }, [currentTime, mode, currentEpisode])

    // Reset play count tracking when a new episode is played
    useEffect(() => {
        if (currentEpisode && playCountTrackedRef.current !== currentEpisode.id) {
            playCountTrackedRef.current = null
        }
    }, [currentEpisode])

    return (
        <AudioPlayerContext.Provider
            value={{
                mode,
                currentEpisode,
                liveChannel,
                liveStreamData,
                isPlaying,
                isLoading,
                currentTime,
                duration,
                volume,
                play,
                playLiveChannel,
                preloadLiveChannel,
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
            <audio ref={audioRef} crossOrigin="anonymous" />
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

