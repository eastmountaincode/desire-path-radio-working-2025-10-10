'use client'

import { useState } from 'react'
import { TAG_CATEGORIES, type Tag } from '@/lib/tags'

interface TagsSectionProps {
  tags: Tag[]
  onChange: (tags: Tag[]) => void
}

import './tags-section-style.css'

export default function TagsSection({ tags, onChange }: TagsSectionProps) {
  const [customTagInputs, setCustomTagInputs] = useState<Record<string, string>>({
    Format: '',
    Genre: '',
    Topic: ''
  })

  const isTagSelected = (type: string, value: string) => {
    return tags.some(tag => tag.type === type && tag.value === value)
  }

  const toggleTag = (type: string, value: string) => {
    if (isTagSelected(type, value)) {
      // Deselect the tag
      onChange(tags.filter(tag => !(tag.type === type && tag.value === value)))
    } else {
      // For Channel tags, only allow one selection at a time
      if (type === 'Channel') {
        // Remove any existing Channel tags and add the new one
        const tagsWithoutChannel = tags.filter(tag => tag.type !== 'Channel')
        onChange([...tagsWithoutChannel, { type, value }])
      } else {
        // For other tag types, just add the tag
        onChange([...tags, { type, value }])
      }
    }
  }

  const addCustomTag = (type: string) => {
    const value = customTagInputs[type]?.trim()
    if (value && !isTagSelected(type, value)) {
      onChange([...tags, { type, value }])
      setCustomTagInputs(prev => ({ ...prev, [type]: '' }))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, type: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomTag(type)
    }
  }

  const canAddCustomTags = (type: string) => {
    return ['Format', 'Genre', 'Topic'].includes(type)
  }

  // Get all unique tag values for a category (predefined + custom selected)
  const getAllTagsForCategory = (category: typeof TAG_CATEGORIES[0]) => {
    const customTags = tags
      .filter(tag => tag.type === category.type && !category.tags.includes(tag.value))
      .map(tag => tag.value)
    return [...category.tags, ...customTags]
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Tags</h2>
      {TAG_CATEGORIES.map(category => (
        <div key={category.type} className="space-y-2">
          <h3 className="text-lg font-bold">{category.type}</h3>
          <div className="flex flex-wrap gap-2">
            {getAllTagsForCategory(category).map(tagValue => (
              <button
                key={`${category.type}-${tagValue}`}
                type="button"
                onClick={() => toggleTag(category.type, tagValue)}
                className={`px-3 py-1 border dpr-tag ${
                  isTagSelected(category.type, tagValue)
                    ? 'selected-dpr-tag'
                    : ''
                }`}
              >
                {tagValue}
              </button>
            ))}
          </div>
          {canAddCustomTags(category.type) && (
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={customTagInputs[category.type] || ''}
                onChange={(e) => setCustomTagInputs(prev => ({ 
                  ...prev, 
                  [category.type]: e.target.value 
                }))}
                onKeyPress={(e) => handleKeyPress(e, category.type)}
                placeholder={`Add custom ${category.type.toLowerCase()}...`}
                className="flex-1 px-3 py-1 border border-grey5"
              />
              <button
                type="button"
                onClick={() => addCustomTag(category.type)}
                className="px-4 py-1 bg-grey6 text-grey1 hover:bg-grey5"
              >
                Add
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

