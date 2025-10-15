'use client'

import { useDevMode } from '../../DevModeProvider'
import './archive-header-styles.css'

export default function ArchiveHeader() {
  const devMode = useDevMode()

  return (
    <div className={`grid grid-cols-7 text-sm md:grid-cols-10 lg:grid-cols-15 gap-4 md:items-center py-2.5 mb-6 archive-table-header ${devMode ? 'border-blue-500 border' : ''}`}>
      {/* Date Header */}
      <div className={`archive-column-header-item col-span-2 md:col-span-2 lg:col-span-2 border-r ${devMode ? 'border-green-500 border' : ''}`}>
        date
      </div>

      {/* Title Header - spans 3 columns on mobile, 2 on tablet, 3 on desktop */}
      <div className={`archive-column-header-item col-span-5 md:col-span-4 lg:col-span-5 md:border-r ${devMode ? 'border-green-500 border' : ''}`}>
        <span className="block md:hidden">title + host</span>
        <span className="hidden md:block">title</span>
      </div>

      {/* Host Header - desktop only */}
      <div className={`archive-column-header-item hidden md:block md:col-span-2 lg:col-span-3 border-r ${devMode ? 'border-green-500 border' : ''}`}>
        host
      </div>

      {/* Duration Header - desktop only */}
      <div className={`archive-column-header-item hidden lg:block lg:col-span-2 border-r ${devMode ? 'border-green-500 border' : ''}`}>
        duration
      </div>

      {/* Tags Header - desktop only */}
      <div className={`archive-column-header-item hidden md:flex md:col-span-2 lg:col-span-3 ${devMode ? 'border-green-500 border' : ''}`}>
        tag
      </div>
    </div>
  )
}
