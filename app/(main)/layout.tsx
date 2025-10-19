'use client'

import Header from "../components/Header/Header";
import AudioPlayer from "../components/AudioPlayer/AudioPlayer";
import { useAudioPlayer } from "../components/AudioPlayer/AudioPlayerProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentEpisode } = useAudioPlayer()
  const hasAudioPlayer = currentEpisode !== null

  return (
    <>
      <Header />
      <AudioPlayer />
      <main className={`p-7 ${hasAudioPlayer ? 'pt-[96px]' : 'pt-[50px]'}`}>
        {children}
      </main>
    </>
  )
}

