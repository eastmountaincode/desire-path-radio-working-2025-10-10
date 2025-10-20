'use client'

import { useState } from 'react'
import { useDevMode } from '@/app/components/DevModeProvider'
import FilterModal, { type SelectedTag } from '@/app/components/archive/ArchiveControlHeader/FilterModal/FilterModal'
import SortModal from '@/app/components/archive/ArchiveControlHeader/SortModal/SortModal'
import Tag from '@/app/components/Tag/Tag'
import './archive-control-header-styles.css'

interface ArchiveControlHeaderProps {
  episodeCount: number
  onFilterApply: (tags: SelectedTag[]) => void
  onSortApply: (order: 'asc' | 'desc') => void
  currentSortOrder: 'asc' | 'desc'
  selectedTags: SelectedTag[]
}

export default function ArchiveControlHeader({ episodeCount, onFilterApply, onSortApply, currentSortOrder, selectedTags }: ArchiveControlHeaderProps) {
  const devMode = useDevMode()
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)

  const handleFilterClick = () => {
    if (showSortModal) {
      setShowSortModal(false)
    }
    setShowFilterModal(!showFilterModal)
  }

  const handleSortClick = () => {
    if (showFilterModal) {
      setShowFilterModal(false)
    }
    setShowSortModal(!showSortModal)
  }

  const handleRemoveTag = (tagSlug: string) => {
    const updatedTags = selectedTags.filter(tag => tag.slug !== tagSlug)
    onFilterApply(updatedTags)
  }

  return (
    <div className={`relative flex items-center justify-between ${devMode ? 'border-orange-500 border' : ''}`}>
      {/* Left side - Episode count and selected tags */}
      <div className={`flex items-center gap-6 text-sm ${devMode ? 'border-red-500 border' : ''}`}>
        <span>
          {episodeCount} show{episodeCount !== 1 ? 's' : ''}
          {selectedTags.length > 0 && (
            <span className="md:hidden"> (filtered)</span>
          )}
        </span>
        {selectedTags.length > 0 && (
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            {selectedTags.map(tag => (
              <Tag 
                key={tag.slug}
                name={tag.name}
                onRemove={() => handleRemoveTag(tag.slug)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right side - Filter and Sort buttons */}
      <div className={`flex items-center text-sm gap-2 ${devMode ? 'border-purple-500 border' : ''}`}>
        <div className="relative">
          <button 
            className={`archive-control-button ${showFilterModal ? 'active' : ''}`}
            onClick={handleFilterClick}
          >
            <span className="mr-1">filter</span>
            <i className="fi fi-tr-bars-filter"></i>
          </button>
          {/* Filter Modal */}
          <FilterModal 
            isOpen={showFilterModal} 
            onClose={() => setShowFilterModal(false)}
            onApply={onFilterApply}
            currentSelectedTags={selectedTags}
          />
        </div>
        <div className="relative">
          <button 
            className={`archive-control-button ${showSortModal ? 'active' : ''}`}
            onClick={handleSortClick}
          >
            <span className="mr-1">sort</span>
            <i className="fi fi-tr-sort-alt"></i>
          </button>
          {/* Sort Modal */}
          <SortModal 
            isOpen={showSortModal} 
            onClose={() => setShowSortModal(false)}
            onApply={onSortApply}
            currentOrder={currentSortOrder}
          />
        </div>
      </div>
    </div>
  )
}
