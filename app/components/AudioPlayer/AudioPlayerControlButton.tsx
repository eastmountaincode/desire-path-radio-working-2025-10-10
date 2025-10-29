import { useDevMode } from '../DevModeProvider'

interface AudioPlayerControlButtonProps {
    onClick: () => void
    ariaLabel: string
    children: React.ReactNode
}

export default function AudioPlayerControlButton({
    onClick,
    ariaLabel,
    children
}: AudioPlayerControlButtonProps) {
    const devMode = useDevMode()

    return (
        <button
            onClick={onClick}
            className={`audio-player-control-button flex items-center justify-center p-0 bg-transparent border-none cursor-pointer flex-shrink-0 ${devMode ? 'border border-pink-500' : ''}`}
            aria-label={ariaLabel}
        >
            {children}
        </button>
    )
}
