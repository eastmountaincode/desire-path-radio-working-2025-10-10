'use client'

import { useEffect, useState } from 'react'
import { useDevMode } from '../../DevModeProvider'
import { useAudioPlayer } from '../../AudioPlayer/AudioPlayerProvider'
import { fetchStreamData, type EveningsStreamData } from '../../../../lib/evenings'
import type { ChannelState } from './LiveChannelToggle'
import PlayPauseButton from '../../PlayPauseButton/PlayPauseButton'
import ParsedDescription from './ParsedDescription'

interface LiveChannelProps {
    devState: ChannelState
    stationSlug: string
}

type DisplayChannel = '1' | '2'

function parseChannelTag(description: string): {
    displayChannel: DisplayChannel | null
    cleanedDescription: string
} {
    const channelMatch = description.match(/{{\s*channel\s*:\s*([12])\s*}}/i)

    return {
        displayChannel: channelMatch ? channelMatch[1] as DisplayChannel : null,
        cleanedDescription: description.replace(/{{\s*channel\s*:\s*[12]\s*}}/gi, '').trim(),
    }
}

export default function LiveChannel({ devState, stationSlug }: LiveChannelProps) {
    const devMode = useDevMode()
    const { mode, liveStream, playLiveStream, preloadLiveStream, pause, isPlaying: audioPlayerIsPlaying, isLoading } = useAudioPlayer()

    const [streamData, setStreamData] = useState<EveningsStreamData | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Check if this live stream is currently playing in the audio player
    const isThisChannelPlaying = mode === 'live' && liveStream?.stationSlug === stationSlug && audioPlayerIsPlaying

    // Check if this live stream is currently loading
    const isThisChannelLoading = mode === 'live' && liveStream?.stationSlug === stationSlug && isLoading

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

    // Preload stream when it becomes available (for faster playback)
    useEffect(() => {
        if (devState === 'live' && streamData?.online && streamData?.streamUrl) {
            preloadLiveStream(stationSlug, streamData.streamUrl)
        }
    }, [devState, streamData?.online, streamData?.streamUrl, stationSlug, preloadLiveStream])

    // Stop playback when stream goes offline
    useEffect(() => {
        if (devState === 'live' && streamData && !streamData.online && isThisChannelPlaying) {
            pause()
        }
    }, [streamData, devState, isThisChannelPlaying, pause])

    const togglePlay = () => {
        // If already playing this channel, pause it
        if (isThisChannelPlaying) {
            pause()
            return
        }

        // Only allow starting playback if stream is actually online (live state) or in mock state
        // For live state, also ensure we have a valid stream URL
        if (devState === 'mock' || (streamData?.online && streamData?.streamUrl)) {
            // For mock state, use dummy stream data
            const dataToPlay = devState === 'mock'
                ? {
                    online: true,
                    name: 'Mock Show',
                    streamUrl: 'https://stream.example.com/mock',
                    description: 'Mock description {{channel:1}}',
                  }
                : streamData!

            const { displayChannel } = parseChannelTag(dataToPlay.description || '')
            const channelLabel = displayChannel ? `CHANNEL ${displayChannel}` : ''

            playLiveStream(channelLabel, stationSlug, dataToPlay)
        }
    }

    // Determine if we should show as online based on state
    const isStreamOnline = devState === 'mock' || (devState === 'live' && streamData?.online) || false

    // Mock show data for mock dev state only
    const mockShow = {
        title: 'Saving the Old Growth Forest',
        description: 'Luis Hernandez, Urban Planner / Oregon, Pacific Northwest | April 18, 2025 {{channel:1}}{{newline}}{{social:instagram:luishernandez}}',
        imageUrl: ''
    }

    // Use real data in live state, mock data in mock state
    const showTitle = devState === 'mock' ? mockShow.title : (streamData?.name || '')
    const showDescription = devState === 'mock' ? mockShow.description : (streamData?.description || '')
    const showImage = devState === 'mock' ? mockShow.imageUrl : (streamData?.image || '')
    const { displayChannel, cleanedDescription } = parseChannelTag(showDescription)

    return (
        <div className={`live-radio-display ${devMode ? 'border border-green-500' : ''}`}>
            <div className={`channel-indicators ${devMode ? 'border border-yellow-500' : ''}`} aria-label="Live channel indicator">
                <div className={`channel-indicator ${displayChannel === '1' ? 'active' : ''}`}>
                    CHANNEL 1
                </div>
                <div className={`channel-indicator ${displayChannel === '2' ? 'active' : ''}`}>
                    CHANNEL 2
                </div>
            </div>

            <div className={`live-channel-container ${isStreamOnline ? 'live-active' : ''} w-full min-h-[300px] rounded-lg p-3 flex flex-col ${devMode ? 'border border-green-500' : ''}`}>
                {/* Conditional rendering based on stream status */}
                {!isStreamOnline ? (
                    <div className={`flex-1 flex flex-col items-center justify-center gap-3 ${devMode ? 'border border-blue-500' : ''}`}>
                        <i className="fi fi-ts-hand-dots text-2xl live-channel-inactive-icon"></i>
                        <p className="text-sm live-channel-inactive-text">
                            {error ? error : 'not live at the moment'}
                        </p>
                    </div>
                ) : (
                    <div className={`flex-1 flex flex-col md:flex-row gap-4 min-h-0 p-3 ${devMode ? 'border border-blue-500' : ''}`}>
                        {showImage && (
                            <div className={`relative w-full md:w-48 md:flex-shrink-0 aspect-square md:aspect-auto overflow-hidden ${devMode ? 'border border-red-500' : ''}`}>
                                <img
                                    src={showImage}
                                    alt={showTitle}
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        )}

                        {/* Content container for title, description, and button */}
                        <div className={`flex flex-col gap-4 flex-1 min-w-0 ${devMode ? 'border border-cyan-500' : ''}`}>
                            {/* Show info */}
                            <div className={`flex flex-col gap-1 flex-shrink-0 ${devMode ? 'border border-purple-500' : ''}`}>
                                <h3 className="live-show-title text-lg">{showTitle}</h3>
                                <ParsedDescription
                                    text={cleanedDescription}
                                    className="live-show-info text-sm"
                                />
                            </div>

                            {/* Play/Pause Button */}
                            <div className={`${devMode ? 'border border-orange-500' : ''}`}>
                                <button
                                    onClick={togglePlay}
                                    className={`live-channel-play-button ${devMode ? 'border border-cyan-500' : ''}`}
                                    aria-label={isThisChannelLoading ? 'Loading' : (isThisChannelPlaying ? 'Pause' : 'Play')}
                                    disabled={isThisChannelLoading}
                                >
                                    {isThisChannelLoading ? (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={`animate-spin ${devMode ? 'border border-red-500' : ''}`}>
                                                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
                                                <path d="M8 2 A6 6 0 0 1 14 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                                            </svg>
                                            <span className={`live-channel-play-text ${devMode ? 'border border-yellow-500' : ''}`}>Loading...</span>
                                        </>
                                    ) : (
                                        <div className={devMode ? 'border border-red-500' : ''}>
                                            <PlayPauseButton isPlaying={isThisChannelPlaying} />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
