'use client'

import Header from "../components/Header/Header";
import AudioPlayer from "../components/AudioPlayer/AudioPlayer";
import { useAudioPlayer } from "../components/AudioPlayer/AudioPlayerProvider";
import { useMobileMenu } from "../components/MobileMenuProvider";
import { useState, useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentEpisode } = useAudioPlayer()
  const { headerHeight, audioPlayerHeight } = useMobileMenu()
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // If audio player is active but height not measured yet, use default values
  // Mobile: 80px, Desktop: 48px (matches CSS)
  const defaultPlayerHeight = isMobile ? 80 : 48
  const playerHeight = currentEpisode && audioPlayerHeight === 0 ? defaultPlayerHeight : audioPlayerHeight
  
  // Calculate total offset: header + audio player (if active)
  const topOffset = headerHeight + playerHeight

  return (
    <>
      <Header />
      <AudioPlayer />
      <main 
        className="p-7"
        style={{ paddingTop: `${topOffset + 2}px` }}
      >
        {children}
      </main>
    </>
  )
}

