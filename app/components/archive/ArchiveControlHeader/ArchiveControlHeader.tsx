'use client'

import { useState } from 'react'
import { useDevMode } from '@/app/components/DevModeProvider'
import FilterModal from '@/app/components/archive/ArchiveControlHeader/FilterModal/FilterModal'
import './archive-control-header-styles.css'

interface ArchiveControlHeaderProps {
  episodeCount: number
}

export default function ArchiveControlHeader({ episodeCount }: ArchiveControlHeaderProps) {
  const devMode = useDevMode()
  const [showFilterModal, setShowFilterModal] = useState(false)

  return (
    <div className={`relative flex items-center justify-between ${devMode ? 'border-orange-500 border' : ''}`}>
      {/* Left side - Episode count */}
      <div className={`text-sm ${devMode ? 'border-red-500 border' : ''}`}>
        {episodeCount} show{episodeCount !== 1 ? 's' : ''}
      </div>

      {/* Right side - Filter and Sort buttons */}
      <div className={`flex items-center text-sm gap-2 ${devMode ? 'border-purple-500 border' : ''}`}>
        <div className="relative">
          <button 
            className="archive-control-button"
            onClick={() => setShowFilterModal(!showFilterModal)}
          >
            <span className="mr-1">filter</span>
            <i className="fi fi-tr-bars-filter"></i>
          </button>
          {/* Filter Modal */}
          <FilterModal 
            isOpen={showFilterModal} 
            onClose={() => setShowFilterModal(false)} 
          />
        </div>
        <button className="archive-control-button">
          <span className="mr-1">sort</span>
          <i className="fi fi-tr-sort-alt"></i>
        </button>
      </div>
    </div>
  )
}
