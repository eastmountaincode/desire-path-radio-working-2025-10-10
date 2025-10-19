'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MobileMenuContextType {
    isMobileMenuOpen: boolean
    setIsMobileMenuOpen: (open: boolean) => void
    headerHeight: number
    setHeaderHeight: (height: number) => void
    audioPlayerHeight: number
    setAudioPlayerHeight: (height: number) => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export function MobileMenuProvider({ children }: { children: ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [headerHeight, setHeaderHeight] = useState(48) // Default to 48px
    const [audioPlayerHeight, setAudioPlayerHeight] = useState(0) // Default to 0 (no player)

    return (
        <MobileMenuContext.Provider value={{ 
            isMobileMenuOpen, 
            setIsMobileMenuOpen,
            headerHeight,
            setHeaderHeight,
            audioPlayerHeight,
            setAudioPlayerHeight
        }}>
            {children}
        </MobileMenuContext.Provider>
    )
}

export function useMobileMenu() {
    const context = useContext(MobileMenuContext)
    if (context === undefined) {
        throw new Error('useMobileMenu must be used within a MobileMenuProvider')
    }
    return context
}

