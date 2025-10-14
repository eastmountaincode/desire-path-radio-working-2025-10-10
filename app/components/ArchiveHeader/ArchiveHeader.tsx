'use client'

import { useDevMode } from '../DevModeProvider'
import './archive-header-styles.css'

export default function ArchiveHeader() {
  const devMode = useDevMode()

  return (
    <div className={`grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4 md:items-center py-2.5 mb-6 archive-header ${devMode ? 'border-blue-500 border' : ''}`}>
      {/* Date Header */}
      <div className={`archive-column-header-item border-r border-grey6 ${devMode ? 'border-green-500 border' : ''}`}>
        date
      </div>

      {/* Title Header - spans 2 columns */}
      <div className={`archive-column-header-item md:col-span-2 border-r border-grey6 ${devMode ? 'border-green-500 border' : ''}`}>
        title
      </div>

      {/* Guest Header - desktop only */}
      <div className={`archive-column-header-item hidden md:block md:col-span-2 border-r border-grey6 ${devMode ? 'border-green-500 border' : ''}`}>
        guest
      </div>

      {/* Duration Header - desktop only */}
      <div className={`archive-column-header-item hidden lg:block border-r border-grey6 ${devMode ? 'border-green-500 border' : ''}`}>
        duration
      </div>

      {/* Tags Header - desktop only */}
      <div className={`archive-column-header-item hidden md:flex lg:col-span-2 ${devMode ? 'border-green-500 border' : ''}`}>
        topic
      </div>
    </div>
  )
}
