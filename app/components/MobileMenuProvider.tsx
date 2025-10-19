'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MobileMenuContextType {
    isMobileMenuOpen: boolean
    setIsMobileMenuOpen: (open: boolean) => void
    headerHeight: number
    setHeaderHeight: (height: number) => void
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined)

export function MobileMenuProvider({ children }: { children: ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [headerHeight, setHeaderHeight] = useState(48) // Default to 48px

    return (
        <MobileMenuContext.Provider value={{ 
            isMobileMenuOpen, 
            setIsMobileMenuOpen,
            headerHeight,
            setHeaderHeight
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

