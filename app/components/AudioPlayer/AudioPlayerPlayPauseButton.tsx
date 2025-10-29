import PlayPauseButton from '../PlayPauseButton/PlayPauseButton'
import { useDevMode } from '../DevModeProvider'

interface AudioPlayerPlayPauseButtonProps {
    isPlaying: boolean
    isLoading: boolean
    onToggle: () => void
}

export default function AudioPlayerPlayPauseButton({
    isPlaying,
    isLoading,
    onToggle
}: AudioPlayerPlayPauseButtonProps) {
    const devMode = useDevMode()

    return (
        <button
            onClick={onToggle}
            className={`audio-player-play-button flex items-center justify-center p-0 bg-transparent border-none cursor-pointer flex-shrink-0 group ${devMode ? 'border border-pink-500' : ''}`}
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
    )
}
