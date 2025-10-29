'use client'

import { useAudioPlayer } from './AudioPlayerProvider'
import { useDevMode } from '../DevModeProvider'
import { useMobileMenu } from '../MobileMenuProvider'
import { useRef, useEffect, useState } from 'react'
import AudioPlayerPlayPauseButton from './AudioPlayerPlayPauseButton'
import AudioPlayerTitleDisplay from './AudioPlayerTitleDisplay'
import AudioPlayerTimeDisplay from './AudioPlayerTimeDisplay'
import AudioPlayerProgressBar from './AudioPlayerProgressBar'
import AudioPlayerControlButton from './AudioPlayerControlButton'
import AudioPlayerCloseButton from './AudioPlayerCloseButton'
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
    const [desktopTitleElement, setDesktopTitleElement] = useState<HTMLElement | null>(null)
    const [mobileTitleElement, setMobileTitleElement] = useState<HTMLElement | null>(null)
    const [isTruncated, setIsTruncated] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [draggingPercentage, setDraggingPercentage] = useState(0)

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

    // Check if title is truncated
    useEffect(() => {
        let timeoutId: NodeJS.Timeout

        const checkTruncation = () => {
            // Debounce to prevent rapid state changes
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                // Check which element is visible (desktop or mobile)
                let visibleElement: HTMLElement | null = null

                if (desktopTitleElement && window.getComputedStyle(desktopTitleElement).display !== 'none') {
                    // Check if parent container is visible
                    const parent = desktopTitleElement.closest('.audio-player-container')
                    if (parent && window.getComputedStyle(parent).display !== 'none') {
                        visibleElement = desktopTitleElement
                    }
                }

                if (!visibleElement && mobileTitleElement && window.getComputedStyle(mobileTitleElement).display !== 'none') {
                    visibleElement = mobileTitleElement
                }

                if (visibleElement) {
                    // If the element contains marquee wrapper, we need to check differently
                    const hasMarquee = visibleElement.querySelector('.audio-player-title-marquee-wrapper')

                    // Get the actual text content
                    const isLive = mode === 'live'
                    const channelText = liveChannel
                        ? `${liveChannel.channelNumber.toUpperCase()}: ${liveChannel.channelType.charAt(0).toUpperCase() + liveChannel.channelType.slice(1)}`
                        : ''
                    const textContent = isLive ? `LIVE • ${channelText}` : currentEpisode?.title || ''

                    if (hasMarquee) {
                        // Element is already in marquee mode, measure the original text width
                        const tempSpan = document.createElement('span')
                        tempSpan.style.cssText = window.getComputedStyle(visibleElement).cssText
                        tempSpan.style.position = 'absolute'
                        tempSpan.style.visibility = 'hidden'
                        tempSpan.style.width = 'auto'
                        tempSpan.style.maxWidth = 'none'
                        tempSpan.textContent = textContent

                        document.body.appendChild(tempSpan)
                        const fullWidth = tempSpan.offsetWidth
                        document.body.removeChild(tempSpan)

                        const containerWidth = visibleElement.clientWidth
                        setIsTruncated(fullWidth > containerWidth)
                    } else {
                        // Normal mode, just check scrollWidth vs clientWidth
                        const hasOverflow = visibleElement.scrollWidth > visibleElement.clientWidth
                        setIsTruncated(hasOverflow)
                    }
                }
            }, 100) // 100ms debounce
        }

        // Check on mount and window resize
        checkTruncation()

        // Use ResizeObserver on parent containers instead of title elements
        const resizeObserver = new ResizeObserver(() => {
            checkTruncation()
        })

        // Observe the parent containers, not the title elements themselves
        if (desktopTitleElement) {
            const parent = desktopTitleElement.closest('.audio-player-container')
            if (parent) {
                resizeObserver.observe(parent as HTMLElement)
            }
        }
        if (mobileTitleElement) {
            const mobileContainer = mobileTitleElement.closest('.md\\:hidden')
            if (mobileContainer) {
                resizeObserver.observe(mobileContainer as HTMLElement)
            }
        }

        window.addEventListener('resize', checkTruncation)

        return () => {
            clearTimeout(timeoutId)
            resizeObserver.disconnect()
            window.removeEventListener('resize', checkTruncation)
        }
    }, [desktopTitleElement, mobileTitleElement, currentEpisode, liveChannel, mode])

    // Don't render if nothing is loaded
    if (!currentEpisode && !liveChannel) return null

    // Determine display content based on mode
    const isLiveMode = mode === 'live'
    const channelLabel = liveChannel
        ? `${liveChannel.channelNumber.toUpperCase()}: ${liveChannel.channelType.charAt(0).toUpperCase() + liveChannel.channelType.slice(1)}`
        : ''

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Don't handle clicks if we're dragging
        if (isDragging) return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = x / rect.width
        seek(percentage * duration)
    }

    const handleThumbDrag = (e: React.MouseEvent<HTMLDivElement>, progressRef: React.RefObject<HTMLDivElement | null>) => {
        e.preventDefault()
        e.stopPropagation()

        if (!progressRef.current) return

        setIsDragging(true)

        // Set initial position
        const rect = progressRef.current.getBoundingClientRect()
        const initialX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
        const initialPercentage = (initialX / rect.width) * 100
        setDraggingPercentage(initialPercentage)
        seek((initialPercentage / 100) * duration)

        // Throttle seek calls to every 100ms
        let lastSeekTime = Date.now()
        let pendingSeek: number | null = null

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!progressRef.current) return

            const rect = progressRef.current.getBoundingClientRect()
            const x = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width))
            const percentage = (x / rect.width) * 100

            // Always update visual position immediately
            setDraggingPercentage(percentage)

            // Throttle seek calls
            const now = Date.now()
            if (now - lastSeekTime >= 100) {
                seek((percentage / 100) * duration)
                lastSeekTime = now
                pendingSeek = null
            } else {
                // Store pending seek to call on mouseup
                pendingSeek = percentage
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
            // Execute any pending seek
            if (pendingSeek !== null) {
                seek((pendingSeek / 100) * duration)
            }
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
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
    const displayPercentage = isDragging ? draggingPercentage : progressPercentage
    const isMuted = volume === 0

    return (
        <div 
            ref={playerRef}
            className={`audio-player ${devMode ? 'border border-orange-500' : ''}`}
            style={{ top: `${headerHeight - 1}px` }}
        >
            {/* Desktop Layout */}
            <div className={`audio-player-container items-center gap-4 px-5 h-full max-w-full hidden md:flex ${devMode ? 'border border-yellow-500' : ''}`}>
                {/* Left section - Controls and Info */}
                <div className={`flex items-center gap-4 min-w-0 ${devMode ? 'border border-green-500' : ''}`}>
                    <AudioPlayerPlayPauseButton
                        isPlaying={isPlaying}
                        isLoading={isLoading}
                        onToggle={isPlaying ? pause : resume}
                    />

                    <AudioPlayerTitleDisplay
                        isLive={isLiveMode}
                        title={isLiveMode ? `LIVE • ${channelLabel}` : currentEpisode?.title || ''}
                        slug={currentEpisode?.slug}
                        isTruncated={isTruncated}
                        onRefCallback={setDesktopTitleElement}
                    />
                </div>

                {/* Center section - Time and Progress (hidden in live mode) */}
                <div className={`flex items-center gap-3 flex-shrink-0 ${devMode ? 'border border-green-500' : ''}`}>
                    {!isLiveMode && (
                        <>
                            <AudioPlayerTimeDisplay time={currentTime} alignment="right" />

                            <AudioPlayerProgressBar
                                displayPercentage={displayPercentage}
                                isDragging={isDragging}
                                onProgressClick={handleProgressClick}
                                onThumbDrag={handleThumbDrag}
                                className="flex-shrink-0"
                            />

                            <AudioPlayerTimeDisplay time={duration} alignment="right" />
                        </>
                    )}

                    {/* Additional controls (desktop only) */}
                    <div className={`flex ${isLiveMode ? '' : 'ml-2'} items-center gap-4 flex-shrink-0 ${devMode ? 'border border-indigo-500' : ''}`}>
                        {/* Seek buttons (only in archive mode) */}
                        {!isLiveMode && (
                            <>
                                <AudioPlayerControlButton
                                    onClick={handleSeekBack}
                                    ariaLabel="Seek back 15 seconds"
                                >
                                    <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="currentColor" d="M.02,2.28h.74v3.12l.63-1.14C3.73.5,8.55-1.02,12.64.8c3.44,1.53,5.66,5.17,5.31,8.95h-.77c.16-1.2-.04-2.47-.46-3.6C15.41,2.59,11.75.37,7.97.85c-2.93.37-5.61,2.41-6.62,5.19h3.16v.74s-3.53,0-3.53,0c-.14,0-.52-.21-.63-.31-.16-.16-.24-.4-.33-.6v-3.58Z"/>
                                        <path fill="currentColor" d="M13.49,18v-.74h2.33c.76,0,1.43-.79,1.42-1.52s-.68-1.49-1.42-1.49h-2.33v-2.98h4.11v.74h-3.32l-.05.05v1.46h1.77c.43,0,1.12.42,1.4.74,1.07,1.2.59,3.04-.88,3.62l-.51.14h-2.53Z"/>
                                        <path fill="currentColor" d="M.02,9.02h.74c.02,1.52.43,2.99,1.21,4.28,1.46,2.4,4.06,3.88,6.87,3.97l.9-.04v.74s-.2,0-.2,0l-.08.04h-1.02c-.2-.05-.43-.05-.64-.08C3.84,17.4.61,14.18.09,10.22c-.03-.21-.02-.44-.08-.64v-.56Z"/>
                                        <path fill="currentColor" d="M11.98,18h-.74v-5.51s-1.6,1.65-1.6,1.65l-.54-.51,2.14-2.25c.27-.25.67-.1.74.25v6.37Z"/>
                                        <polygon fill="currentColor" points="9 4.14 9 9.75 4.12 9.75 4.12 9.02 8.26 9.02 8.26 4.14 9 4.14"/>
                                    </svg>
                                </AudioPlayerControlButton>

                                <AudioPlayerControlButton
                                    onClick={handleSeekForward}
                                    ariaLabel="Seek forward 15 seconds"
                                >
                                    <svg width="21" height="21" viewBox="0 0 19 18" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="currentColor" d="M19,2.28h-.74s0,3.12,0,3.12l-.63-1.14C15.29.5,10.47-1.02,6.38.8,2.94,2.33.72,5.97,1.07,9.75h.77c-.16-1.2.04-2.47.46-3.6C3.61,2.59,7.26.37,11.05.85c2.93.37,5.61,2.41,6.62,5.19h-3.16s0,.74,0,.74h3.53c.14,0,.52-.21.63-.31.16-.16.24-.4.33-.6v-3.58Z"/>
                                        <path fill="currentColor" d="M4.25,18v-.74h2.33c.76,0,1.43-.79,1.42-1.52s-.68-1.49-1.42-1.49h-2.33v-2.98h4.11v.74h-3.32l-.05.05v1.46h1.77c.43,0,1.12.42,1.4.74,1.07,1.2.59,3.04-.88,3.62l-.51.14h-2.53Z"/>
                                        <path fill="currentColor" d="M19,9.02h-.74c-.02,1.52-.43,2.99-1.21,4.28-1.46,2.4-4.06,3.88-6.87,3.97l-.9-.04v.74s.2,0,.2,0l.08.04h1.02c.2-.05.43-.05.64-.08,3.95-.52,7.19-3.75,7.7-7.7.03-.21.02-.44.08-.64v-.56Z"/>
                                        <path fill="currentColor" d="M2.75,18h-.74v-5.51s-1.6,1.65-1.6,1.65l-.54-.51,2.14-2.25c.27-.25.67-.1.74.25v6.37Z"/>
                                        <polygon fill="currentColor" points="10.02 4.14 10.02 9.75 14.89 9.75 14.89 9.02 10.75 9.02 10.75 4.14 10.02 4.14"/>
                                    </svg>
                                </AudioPlayerControlButton>
                            </>
                        )}

                        <AudioPlayerControlButton
                            onClick={handleToggleMute}
                            ariaLabel={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="currentColor" d="m19.732,12l4.146,4.146-.707.707-4.146-4.146-4.146,4.146-.707-.707,4.146-4.146-4.146-4.146.707-.707,4.146,4.146,4.146-4.146.707.707-4.146,4.146ZM5.323,6L12,.585v22.873l-6.678-5.458h-2.822c-1.378,0-2.5-1.122-2.5-2.5v-7c0-1.378,1.122-2.5,2.5-2.5h2.823Zm.354,1h-3.177c-.827,0-1.5.673-1.5,1.5v7c0,.827.673,1.5,1.5,1.5h3.178l5.322,4.35V2.684l-5.323,4.316Z"/>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="currentColor" d="M2.5,6c-1.379,0-2.5,1.121-2.5,2.5v7c0,1.379,1.121,2.5,2.5,2.5h2.303l7.197,5.986V-.016L4.802,6H2.5ZM11,2.123V21.854l-5.836-4.854H2.5c-.827,0-1.5-.673-1.5-1.5v-7c0-.827,.673-1.5,1.5-1.5h2.665L11,2.123Zm13,9.877c0,4.963-4.037,9-9,9h-1v-1h1c4.411,0,8-3.589,8-8s-3.589-8-8-8h-1v-1h1c4.963,0,9,4.037,9,9Zm-9,5h-1v-1h1c2.206,0,4-1.794,4-4s-1.794-4-4-4h-1v-1h1c2.757,0,5,2.243,5,5s-2.243,5-5,5Z"/>
                                </svg>
                            )}
                        </AudioPlayerControlButton>
                    </div>
                </div>

                {/* Right section - Close button */}
                <div className={`flex items-center flex-shrink-0 ml-auto ${devMode ? 'border border-indigo-500' : ''}`}>
                    <AudioPlayerCloseButton onClose={stop} />
                </div>
            </div>

            {/* Mobile Layout - 3 Columns */}
            <div className={`md:hidden grid grid-cols-[auto_1fr_auto] gap-4 items-center px-7 h-full ${devMode ? 'border border-yellow-500' : ''}`}>
                {/* Left Column - Play Button */}
                <AudioPlayerPlayPauseButton
                    isPlaying={isPlaying}
                    isLoading={isLoading}
                    onToggle={isPlaying ? pause : resume}
                />

                {/* Center Column - Title and Progress (stacked) */}
                <div className={`flex flex-col gap-0 min-w-0 px-0 ${devMode ? 'border border-green-500' : ''}`}>
                    <AudioPlayerTitleDisplay
                        isLive={isLiveMode}
                        title={isLiveMode ? `LIVE • ${channelLabel}` : currentEpisode?.title || ''}
                        slug={currentEpisode?.slug}
                        isTruncated={isTruncated}
                        onRefCallback={setMobileTitleElement}
                    />

                    {/* Progress Bar with Timestamps (hidden in live mode) */}
                    {!isLiveMode && (
                        <div className={`flex items-center gap-2 mt-1 ${devMode ? 'border border-blue-500' : ''}`}>
                            <AudioPlayerTimeDisplay time={currentTime} alignment="left" />

                            <AudioPlayerProgressBar
                                displayPercentage={displayPercentage}
                                isDragging={isDragging}
                                onProgressClick={handleProgressClick}
                                onThumbDrag={handleThumbDrag}
                                className="flex-1"
                            />

                            <AudioPlayerTimeDisplay time={duration} alignment="left" />
                        </div>
                    )}
                </div>

                {/* Right Column - Close Button */}
                <AudioPlayerCloseButton onClose={stop} />
            </div>
        </div>
    )
}

