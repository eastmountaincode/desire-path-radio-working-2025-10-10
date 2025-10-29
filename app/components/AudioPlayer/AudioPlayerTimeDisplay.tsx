import { useDevMode } from '../DevModeProvider'

interface AudioPlayerTimeDisplayProps {
    time: number
    alignment?: 'left' | 'right'
}

export default function AudioPlayerTimeDisplay({
    time,
    alignment = 'right'
}: AudioPlayerTimeDisplayProps) {
    const devMode = useDevMode()

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00:00'
        const hours = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = Math.floor(seconds % 60)
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className={`audio-player-time text-[13px] leading-[1.5] tracking-[-0.045em] w-14 flex-shrink-0 ${alignment === 'right' ? 'text-right' : ''} ${devMode ? 'border border-red-500' : ''}`}>
            {formatTime(time)}
        </div>
    )
}
