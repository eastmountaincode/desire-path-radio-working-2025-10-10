'use client'

import { useDevMode } from '@/app/components/DevModeProvider'

interface ArchiveControlHeaderProps {
  episodeCount: number
}

export default function ArchiveControlHeader({ episodeCount }: ArchiveControlHeaderProps) {
  const devMode = useDevMode()

  return (
    <div className={`flex items-center justify-between py-4 ${devMode ? 'border-orange-500 border' : ''}`}>
      {/* Left side - Episode count */}
      <div className={`text-sm text-grey5 ${devMode ? 'border-red-500 border' : ''}`}>
        {episodeCount} episode{episodeCount !== 1 ? 's' : ''}
      </div>

      {/* Right side - Filter and Sort buttons */}
      <div className={`flex items-center gap-2 sm:gap-3 ${devMode ? 'border-purple-500 border' : ''}`}>
        <button className="px-2 py-1 text-xs bg-grey2 text-grey6 hover:bg-grey3 sm:px-3">
          filter ⌄
        </button>
        <button className="px-2 py-1 text-xs bg-grey2 text-grey6 hover:bg-grey3 sm:px-3">
          sort ⌄
        </button>
      </div>
    </div>
  )
}
