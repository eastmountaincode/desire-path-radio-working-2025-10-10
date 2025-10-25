'use client'

import { useAudioPlayer } from './AudioPlayerProvider'
import { useDevMode } from '../DevModeProvider'
import { useMobileMenu } from '../MobileMenuProvider'
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import PlayPauseButton from '../PlayPauseButton/PlayPauseButton'
import './audio-player-styles.css'

export default function AudioPlayer() {
    const {
        mode,
        currentEpisode,
        liveChannel,
        liveStreamData,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        pause,
        resume,
        stop,
        seek,
        volume,
        setVolume
    } = useAudioPlayer()
    const devMode = useDevMode()
    const { headerHeight, setAudioPlayerHeight } = useMobileMenu()
    const playerRef = useRef<HTMLDivElement>(null)

    // Measure audio player height and update context
    useEffect(() => {
        const updateHeight = () => {
            if (playerRef.current) {
                setAudioPlayerHeight(playerRef.current.offsetHeight)
            }
        }

        // Use requestAnimationFrame to ensure DOM is ready
        const rafId = requestAnimationFrame(() => {
            updateHeight()
        })

        // Create ResizeObserver to watch for size changes
        const resizeObserver = new ResizeObserver(updateHeight)
        if (playerRef.current) {
            resizeObserver.observe(playerRef.current)
        }

        return () => {
            cancelAnimationFrame(rafId)
            resizeObserver.disconnect()
            // Reset to 0 when component unmounts
            setAudioPlayerHeight(0)
        }
    }, [setAudioPlayerHeight, currentEpisode, liveChannel])

    // Don't render if nothing is loaded
    if (!currentEpisode && !liveChannel) return null

    // Determine display content based on mode
    const isLiveMode = mode === 'live'
    const channelLabel = liveChannel
        ? `${liveChannel.channelNumber.toUpperCase()}: ${liveChannel.channelType.charAt(0).toUpperCase() + liveChannel.channelType.slice(1)}`
        : ''

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00:00'
        const hours = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = x / rect.width
        seek(percentage * duration)
    }

    const handleSeekBack = () => {
        seek(Math.max(0, currentTime - 15))
    }

    const handleSeekForward = () => {
        seek(Math.min(duration, currentTime + 15))
    }

    const handleToggleMute = () => {
        setVolume(volume > 0 ? 0 : 1)
    }

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
    const isMuted = volume === 0

    return (
        <div 
            ref={playerRef}
            className={`audio-player ${devMode ? 'border border-orange-500' : ''}`}
            style={{ top: `${headerHeight - 1}px` }}
        >
            {/* Desktop Layout */}
            <div className={`audio-player-container hidden md:flex h-full ${devMode ? 'border border-yellow-500' : ''}`}>
                {/* Left section - Controls and Info */}
                <div className={`flex items-center gap-4 min-w-0 ${devMode ? 'border border-green-500' : ''}`}>
                    {/* Play/Pause Button */}
                    <button
                        onClick={isPlaying ? pause : resume}
                        className={`audio-player-play-button ${devMode ? 'border border-pink-500' : ''}`}
                        aria-label={isLoading ? 'Loading' : (isPlaying ? 'Pause' : 'Play')}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={`animate-spin ${devMode ? 'border border-red-500' : ''}`}>
                                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
                                <path d="M8 2 A6 6 0 0 1 14 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <div className={devMode ? 'border border-red-500' : ''}>
                                <PlayPauseButton isPlaying={isPlaying} />
                            </div>
                        )}
                    </button>

                    {/* Title - Episode or Live Channel */}
                    {isLiveMode ? (
                        <div className={`flex items-center gap-2 min-w-0 ${devMode ? 'border border-cyan-500' : ''}`}>
                            <div className="live-indicator-dot"></div>
                            <div className="audio-player-title">
                                LIVE • {channelLabel}
                            </div>
                        </div>
                    ) : (
                        <Link
                            href={`/archive/${currentEpisode?.slug}`}
                            className={`audio-player-title hover:text-brand-dpr-orange ${devMode ? 'border border-cyan-500' : ''}`}
                        >
                            {currentEpisode?.title}
                        </Link>
                    )}
                </div>

                {/* Center section - Time and Progress (hidden in live mode) */}
                <div className={`flex items-center gap-3 flex-1 min-w-0 ${devMode ? 'border border-blue-500' : ''}`}>
                    {!isLiveMode && (
                        <>
                            {/* Current Time */}
                            <div className={`audio-player-time w-14 text-right ${devMode ? 'border border-red-500' : ''}`}>
                                {formatTime(currentTime)}
                            </div>

                            {/* Progress Bar */}
                            <div
                                className={`audio-player-progress-container ${devMode ? 'border border-purple-500' : ''}`}
                                onClick={handleProgressClick}
                            >
                                <div className="audio-player-progress-track">
                                    <div
                                        className="audio-player-progress-fill"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div className={`audio-player-time w-14 text-right ${devMode ? 'border border-red-500' : ''}`}>
                                {formatTime(duration)}
                            </div>
                        </>
                    )}

                    {/* Additional controls (desktop only) */}
                    <div className={`flex ${isLiveMode ? '' : 'ml-2'} items-center gap-4 ${devMode ? 'border border-indigo-500' : ''}`}>
                        {/* Seek buttons (only in archive mode) */}
                        {!isLiveMode && (
                            <>
                                {/* Seek Back 15s */}
                                <button
                                    onClick={handleSeekBack}
                                    className={`audio-player-control-button group ${devMode ? 'border border-pink-500' : ''}`}
                                    aria-label="Seek back 15 seconds"
                                >
                                    <div className={devMode ? 'border border-cyan-500' : ''}>
                                        <img src="/images/icons/skip-buttons/skip-15-seconds-back.svg" alt="Skip back 15 seconds" width="20" height="20" className="group-hover:brightness-0 group-hover:saturate-100 group-hover:[filter:invert(36%)_sepia(98%)_saturate(2738%)_hue-rotate(8deg)_brightness(102%)_contrast(107%)]" />
                                    </div>
                                </button>

                                {/* Seek Forward 15s */}
                                <button
                                    onClick={handleSeekForward}
                                    className={`audio-player-control-button group ${devMode ? 'border border-pink-500' : ''}`}
                                    aria-label="Seek forward 15 seconds"
                                >
                                    <div className={devMode ? 'border border-cyan-500' : ''}>
                                        <img src="/images/icons/skip-buttons/skip-15-seconds-forward.svg" alt="Skip forward 15 seconds" width="21" height="21" className="group-hover:brightness-0 group-hover:saturate-100 group-hover:[filter:invert(36%)_sepia(98%)_saturate(2738%)_hue-rotate(8deg)_brightness(102%)_contrast(107%)]" />
                                    </div>
                                </button>
                            </>
                        )}

                        {/* Mute/Unmute */}
                        <button
                            onClick={handleToggleMute}
                            className={`audio-player-control-button group ${devMode ? 'border border-pink-500' : ''}`}
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                            <div className={devMode ? 'border border-cyan-500' : ''}>
                                {isMuted ? (
                                    <img src="/images/icons/volume-buttons/volume-mute.svg" alt="Unmute" width="20" height="20" className="group-hover:brightness-0 group-hover:saturate-100 group-hover:[filter:invert(36%)_sepia(98%)_saturate(2738%)_hue-rotate(8deg)_brightness(102%)_contrast(107%)]" />
                                ) : (
                                    <img src="/images/icons/volume-buttons/volume.svg" alt="Mute" width="20" height="20" className="group-hover:brightness-0 group-hover:saturate-100 group-hover:[filter:invert(36%)_sepia(98%)_saturate(2738%)_hue-rotate(8deg)_brightness(102%)_contrast(107%)]" />
                                )}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right section - Close button */}
                <div className={`flex items-center ${devMode ? 'border border-indigo-500' : ''}`}>
                    <button
                        onClick={stop}
                        className={`audio-player-close-button ${devMode ? 'border border-pink-500' : ''}`}
                        aria-label="Close player"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Layout - 3 Columns */}
            <div className={`md:hidden grid grid-cols-[auto_1fr_auto] gap-4 items-center px-7 h-full ${devMode ? 'border border-yellow-500' : ''}`}>
                {/* Left Column - Play Button */}
                <button
                    onClick={isPlaying ? pause : resume}
                    className={`audio-player-play-button ${devMode ? 'border border-pink-500' : ''}`}
                    aria-label={isLoading ? 'Loading' : (isPlaying ? 'Pause' : 'Play')}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className={`animate-spin ${devMode ? 'border border-red-500' : ''}`}>
                            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
                            <path d="M8 2 A6 6 0 0 1 14 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <div className={devMode ? 'border border-red-500' : ''}>
                            <PlayPauseButton isPlaying={isPlaying} />
                        </div>
                    )}
                </button>

                {/* Center Column - Title and Progress (stacked) */}
                <div className={`flex flex-col gap-0 min-w-0 px-4 ${devMode ? 'border border-green-500' : ''}`}>
                    {/* Title - Episode or Live Channel */}
                    {isLiveMode ? (
                        <div className={`flex items-center gap-2 min-w-0 ${devMode ? 'border border-cyan-500' : ''}`}>
                            <div className="live-indicator-dot"></div>
                            <div className="audio-player-title">
                                LIVE • {channelLabel}
                            </div>
                        </div>
                    ) : (
                        <Link
                            href={`/archive/${currentEpisode?.slug}`}
                            className={`audio-player-title hover:text-brand-dpr-orange ${devMode ? 'border border-cyan-500' : ''}`}
                        >
                            {currentEpisode?.title}
                        </Link>
                    )}

                    {/* Progress Bar with Timestamps (hidden in live mode) */}
                    {!isLiveMode && (
                        <div className={`flex items-center gap-2 ${devMode ? 'border border-blue-500' : ''}`}>
                            {/* Current Time */}
                            <div className={`audio-player-time w-14 flex-shrink-0 ${devMode ? 'border border-red-500' : ''}`}>
                                {formatTime(currentTime)}
                            </div>

                            {/* Progress Bar */}
                            <div
                                className={`audio-player-progress-container flex-1 ${devMode ? 'border border-purple-500' : ''}`}
                                onClick={handleProgressClick}
                            >
                                <div className="audio-player-progress-track">
                                    <div
                                        className="audio-player-progress-fill"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div className={`audio-player-time w-14 flex-shrink-0 ${devMode ? 'border border-red-500' : ''}`}>
                                {formatTime(duration)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Close Button */}
                <button
                    onClick={stop}
                    className={`audio-player-close-button ${devMode ? 'border border-pink-500' : ''}`}
                    aria-label="Close player"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

