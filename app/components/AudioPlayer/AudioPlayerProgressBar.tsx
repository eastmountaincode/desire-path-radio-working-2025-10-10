import { useRef } from 'react'
import { useDevMode } from '../DevModeProvider'

interface AudioPlayerProgressBarProps {
    displayPercentage: number
    isDragging: boolean
    onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void
    onThumbDrag: (e: React.MouseEvent<HTMLDivElement>, progressRef: React.RefObject<HTMLDivElement | null>) => void
    className?: string
}

export default function AudioPlayerProgressBar({
    displayPercentage,
    isDragging,
    onProgressClick,
    onThumbDrag,
    className = ''
}: AudioPlayerProgressBarProps) {
    const devMode = useDevMode()
    const progressRef = useRef<HTMLDivElement | null>(null)

    return (
        <div
            ref={progressRef}
            className={`audio-player-progress-container ${isDragging ? 'dragging' : ''} ${className} ${devMode ? 'border border-purple-500' : ''}`}
            onClick={onProgressClick}
        >
            <div className="audio-player-progress-track">
                <div
                    className="audio-player-progress-fill"
                    style={{ width: `${displayPercentage}%` }}
                />
            </div>
            <div
                className={`audio-player-progress-thumb ${isDragging ? 'dragging' : ''}`}
                style={{ left: `${displayPercentage}%` }}
                onMouseDown={(e) => onThumbDrag(e, progressRef)}
            />
        </div>
    )
}
