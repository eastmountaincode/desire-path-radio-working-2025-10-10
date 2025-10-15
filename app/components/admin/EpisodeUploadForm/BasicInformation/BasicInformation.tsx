'use client'

import './basic-information-style.css'

interface BasicInformationProps {
  title: string
  slug: string
  description: string
  airedOn: string
  onChange: (data: {
    title: string
    slug: string
    description: string
    airedOn: string
  }) => void
}

export default function BasicInformation({
  title,
  slug,
  description,
  airedOn,
  onChange
}: BasicInformationProps) {
  const handleTitleChange = (newTitle: string) => {
    const newSlug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    onChange({
      title: newTitle,
      slug: newSlug,
      description,
      airedOn
    })
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Basic Information</h2>
      
      <div>
        <label htmlFor="title" className="block mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full p-2 border border-grey5"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block mb-2">
          <span className="inline-flex items-center gap-2">
            Slug (automatically derived from title)
            <span className="relative group cursor-help">
              <span className="inline-flex items-center justify-center w-4 h-4 text-xs border border-grey5">
                i
              </span>
              <span className="slug-info-tooltip absolute right-0 bottom-6 w-64 p-2 text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none z-10">
                A slug is a URL-friendly version of the title. It contains only lowercase letters, numbers, and hyphens. Example: "my-episode-title". You don't need to enter this manually.
              </span>
            </span>
          </span>
        </label>
        <input
          type="text"
          id="slug"
          value={slug}
          readOnly
          disabled
          className="w-full p-2 border border-grey5 cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="description" className="block mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => onChange({ title, slug, description: e.target.value, airedOn })}
          rows={4}
          className="w-full p-2 border border-grey5"
        />
      </div>

      <div>
        <label htmlFor="aired_on" className="block mb-2">
          Aired On *
        </label>
        <input
          type="date"
          id="aired_on"
          value={airedOn}
          onChange={(e) => onChange({ title, slug, description, airedOn: e.target.value })}
          required
          className="w-full p-2 border border-grey5"
        />
      </div>
    </div>
  )
}

