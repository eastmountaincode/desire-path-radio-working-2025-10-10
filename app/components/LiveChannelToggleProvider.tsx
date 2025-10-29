'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

const LiveChannelToggleContext = createContext<{
    showToggles: boolean
    setShowToggles: (show: boolean) => void
} | undefined>(undefined)

export function LiveChannelToggleProvider({ children }: { children: ReactNode }) {
    const [showToggles, setShowToggles] = useState(true)

    return (
        <LiveChannelToggleContext.Provider value={{ showToggles, setShowToggles }}>
            {children}
        </LiveChannelToggleContext.Provider>
    )
}

export function useLiveChannelToggle() {
    const context = useContext(LiveChannelToggleContext)
    if (context === undefined) {
        throw new Error('useLiveChannelToggle must be used within LiveChannelToggleProvider')
    }
    return context
}
