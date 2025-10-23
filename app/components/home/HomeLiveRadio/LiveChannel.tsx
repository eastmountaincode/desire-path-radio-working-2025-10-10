'use client'

import { useEffect, useState, useRef } from 'react'
import { useDevMode } from '../../DevModeProvider'
import { fetchStreamData, type EveningsStreamData } from '../../../../lib/evenings'
import type { ChannelState } from '../../AudioPlayer/AudioPlayerDevControls'

interface LiveChannelProps {
    channelNumber: string
    channelType: string
    devState: ChannelState
    stationSlug: string
}

export default function LiveChannel({ channelNumber, channelType, devState, stationSlug }: LiveChannelProps) {
    const devMode = useDevMode()
    const audioRef = useRef<HTMLAudioElement>(null)

    const [streamData, setStreamData] = useState<EveningsStreamData | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch stream data only when in 'live' state
    useEffect(() => {
        const loadStreamData = async () => {
            try {
                setError(null)
                const data = await fetchStreamData(stationSlug)
                setStreamData(data)
            } catch (err) {
                setError('Failed to load stream')
                console.error('Error loading stream data:', err)
            }
        }

        if (devState === 'live' && stationSlug) {
            // Load immediately
            loadStreamData()

            // Poll every 10 seconds
            const pollInterval = setInterval(() => {
                loadStreamData()
            }, 10000)

            // Cleanup interval on unmount or state change
            return () => clearInterval(pollInterval)
        } else {
            // Reset stream data for other states
            setStreamData(null)
        }
    }, [stationSlug, devState])

    // Handle audio playback
    useEffect(() => {
        // Only actually play audio if in 'live' state (not mock)
        if (isPlaying && audioRef.current && devState === 'live') {
            audioRef.current.play().catch((err) => {
                console.error('Error playing audio:', err)
                setIsPlaying(false)
            })
        } else if (!isPlaying && audioRef.current) {
            audioRef.current.pause()
        }
    }, [isPlaying, devState])

    // Stop playback when switching states
    useEffect(() => {
        setIsPlaying(false)
        if (audioRef.current) {
            audioRef.current.pause()
        }
    }, [devState])

    // Stop playback when stream goes offline
    useEffect(() => {
        if (devState === 'live' && streamData && !streamData.online && isPlaying) {
            setIsPlaying(false)
            if (audioRef.current) {
                audioRef.current.pause()
            }
        }
    }, [streamData, devState, isPlaying])

    const togglePlay = () => {
        // Only allow toggling if stream is actually online (live state) or in mock state
        if (devState === 'mock' || streamData?.online) {
            setIsPlaying(!isPlaying)
        }
    }

    // Determine if we should show as online based on state
    const isStreamOnline = devState === 'mock' || (devState === 'live' && streamData?.online) || false

    // Mock show data for styling when no real data available
    const mockShow = {
        title: 'Saving the Old Growth Forest',
        description: 'Luis Hernandez, Urban Planner / Oregon, Pacific Northwest | April 18, 2025',
        imageUrl: 'https://placehold.co/600x600/CCCCCC/666666?text=Show+Image'
    }

    // Use real data from stream if available, otherwise use mock
    const showTitle = (devState === 'live' && streamData?.name) ? streamData.name : mockShow.title
    const showDescription = (devState === 'live' && streamData?.description) ? streamData.description : mockShow.description
    const showImage = (devState === 'live' && streamData?.image) ? streamData.image : mockShow.imageUrl

    return (
        <div className={`live-channel-container ${isStreamOnline ? 'live-active' : ''} h-[550px] md:h-[600px] w-full rounded-lg p-3 flex flex-col ${devMode ? 'border border-green-500' : ''}`}>
            {/* Channel header */}
            <div className={`flex items-center gap-2 mb-2 ${devMode ? 'border border-yellow-500' : ''}`}>
                {isStreamOnline && <div className="live-indicator-dot"></div>}
                <div className="text-sm font-mono">
                    {channelNumber.toUpperCase()}: {channelType.charAt(0).toUpperCase() + channelType.slice(1)}
                </div>
            </div>

            {/* Hidden audio element */}
            {streamData?.streamUrl && (
                <audio
                    ref={audioRef}
                    src={streamData.streamUrl}
                    className="hidden"
                />
            )}

            {/* Conditional rendering based on stream status */}
            {!isStreamOnline ? (
                <div className={`flex-1 flex flex-col items-center justify-center gap-3 ${devMode ? 'border border-blue-500' : ''}`}>
                    <i className="fi fi-ts-hand-dots text-2xl live-channel-inactive-icon"></i>
                    <p className="text-sm live-channel-inactive-text">
                        {error ? error : 'not live at the moment'}
                    </p>
                </div>
            ) : (
                <div className={`flex-1 flex flex-col gap-4 min-h-0 p-4 ${devMode ? 'border border-blue-500' : ''}`}>
                    {/* Show image - square aspect, cropped to fit */}
                    <div className={`relative w-full aspect-square overflow-hidden ${devMode ? 'border border-red-500' : ''}`}>
                        <img
                            src={showImage}
                            alt={showTitle}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Show info */}
                    <div className={`flex flex-col gap-1 flex-shrink-0 ${devMode ? 'border border-purple-500' : ''}`}>
                        <h3 className="live-show-title text-lg">{showTitle}</h3>
                        <p className="live-show-info text-sm">
                            {showDescription}
                        </p>
                    </div>

                    {/* Play/Pause Button */}
                    <div className={`${devMode ? 'border border-orange-500' : ''}`}>
                        <button
                            onClick={togglePlay}
                            className="live-channel-play-button"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <rect x="3" y="2" width="4" height="12" />
                                        <rect x="9" y="2" width="4" height="12" />
                                    </svg>
                                    <span className="live-channel-play-text">Pause</span>
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M3 2L13 8L3 14V2Z" />
                                    </svg>
                                    <span className="live-channel-play-text">Play</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
