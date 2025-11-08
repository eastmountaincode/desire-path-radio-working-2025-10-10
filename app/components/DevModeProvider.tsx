"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

// Set to false to disable dev mode in production
const DEV_MODE_ENABLED = true

const DevModeContext = createContext<boolean>(false)

export function useDevMode() {
  return useContext(DevModeContext)
}

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [devMode, setDevMode] = useState(false)

  useEffect(() => {
    if (!DEV_MODE_ENABLED) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'b' || e.key === 'B') {
        setDevMode(prev => {
          console.log(`Dev mode: ${!prev ? 'ON' : 'OFF'}`)
          return !prev
        })
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <DevModeContext.Provider value={devMode}>
      {children}
    </DevModeContext.Provider>
  )
}
