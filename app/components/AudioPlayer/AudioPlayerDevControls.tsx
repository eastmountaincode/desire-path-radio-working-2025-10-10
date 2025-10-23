'use client'

export type ChannelState = 'offline' | 'live' | 'mock'

interface LiveChannelToggleProps {
    state: ChannelState
    onToggle: () => void
}

export default function LiveChannelToggle({ state, onToggle }: LiveChannelToggleProps) {
    const labels = {
        offline: 'NOT LIVE',
        live: 'LIVE',
        mock: 'MOCK LIVE'
    }

    return (
        <button onClick={onToggle} className="border p-2 font-mono text-sm">
            {labels[state]}
        </button>
    )
}
