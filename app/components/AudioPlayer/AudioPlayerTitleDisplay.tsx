import Link from 'next/link'
import { useDevMode } from '../DevModeProvider'

interface AudioPlayerTitleDisplayProps {
    isLive: boolean
    title: string
    slug?: string
    isTruncated: boolean
    onRefCallback: (element: HTMLElement | null) => void
}

export default function AudioPlayerTitleDisplay({
    isLive,
    title,
    slug,
    isTruncated,
    onRefCallback
}: AudioPlayerTitleDisplayProps) {
    const devMode = useDevMode()

    // Base classes shared by both live and episode modes
    const baseClasses = `audio-player-title text-base leading-[1.5] tracking-[-0.025em] whitespace-nowrap overflow-hidden text-ellipsis min-w-0 max-w-[250px] no-underline ${isTruncated ? 'text-blue-500' : ''} ${devMode ? 'border border-cyan-500' : ''}`

    // Add interactive classes only for episodes (not live)
    const titleClasses = isLive ? baseClasses : `${baseClasses} cursor-pointer audio-player-title-link`

    const titleContent = isTruncated ? (
        <div className="audio-player-title-marquee-wrapper">
            <div className="audio-player-title-marquee-content">
                <span>{title}</span>
                <span>{title}</span>
            </div>
        </div>
    ) : (
        title
    )

    if (isLive) {
        return (
            <div className={`flex items-center gap-2 min-w-0 ${devMode ? 'border border-cyan-500' : ''}`}>
                <div className="live-indicator-dot"></div>
                <div ref={onRefCallback} className={titleClasses}>
                    {titleContent}
                </div>
            </div>
        )
    }

    return (
        <Link
            href={`/archive/${slug}`}
            ref={onRefCallback}
            className={titleClasses}
        >
            {titleContent}
        </Link>
    )
}
