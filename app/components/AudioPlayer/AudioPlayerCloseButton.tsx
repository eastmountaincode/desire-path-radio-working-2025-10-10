import { useDevMode } from '../DevModeProvider'

interface AudioPlayerCloseButtonProps {
    onClose: () => void
}

export default function AudioPlayerCloseButton({ onClose }: AudioPlayerCloseButtonProps) {
    const devMode = useDevMode()

    return (
        <button
            onClick={onClose}
            className={`audio-player-close-button flex items-center justify-center p-0 bg-transparent border-none cursor-pointer flex-shrink-0 ${devMode ? 'border border-pink-500' : ''}`}
            aria-label="Close player"
        >
            <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M17.854,17.146c.195,.195,.195,.512,0,.707-.098,.098-.226,.146-.354,.146s-.256-.049-.354-.146l-5.146-5.146-5.146,5.146c-.098,.098-.226,.146-.354,.146s-.256-.049-.354-.146c-.195-.195-.195-.512,0-.707l5.146-5.146L6.146,6.854c-.195-.195-.195-.512,0-.707s.512-.195,.707,0l5.146,5.146,5.146-5.146c.195-.195,.512-.195,.707,0s.195,.512,0,.707l-5.146,5.146,5.146,5.146Z"/>
            </svg>
        </button>
    )
}
