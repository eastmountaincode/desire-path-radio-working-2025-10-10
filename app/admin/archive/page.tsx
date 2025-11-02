'use client'

import { useState } from 'react'
import { useDevMode } from '../../components/DevModeProvider'
import EpisodesManagement from '../../components/admin/EpisodesManagement/EpisodesManagement'
import HighlightsOrdering from '../../components/admin/HighlightsOrdering/HighlightsOrdering'

type Tab = 'episodes' | 'drafts' | 'highlights'

export default function ArchiveManagementPage() {
  const devMode = useDevMode()
  const [activeTab, setActiveTab] = useState<Tab>('episodes')

  return (
    <div className={`p-6 ${devMode ? 'border border-purple-500' : ''}`}>
      <h1 className="text-2xl mb-6">Archive Management</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-current">
        <button
          onClick={() => setActiveTab('episodes')}
          className={`pb-2 px-4 -mb-px transition-colors ${
            activeTab === 'episodes'
              ? 'border-b-2 border-current font-medium'
              : 'opacity-50 hover:opacity-100'
          }`}
        >
          Episodes
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={`pb-2 px-4 -mb-px transition-colors ${
            activeTab === 'drafts'
              ? 'border-b-2 border-current font-medium'
              : 'opacity-50 hover:opacity-100'
          }`}
        >
          Drafts
        </button>
        <button
          onClick={() => setActiveTab('highlights')}
          className={`pb-2 px-4 -mb-px transition-colors ${
            activeTab === 'highlights'
              ? 'border-b-2 border-current font-medium'
              : 'opacity-50 hover:opacity-100'
          }`}
        >
          Highlights
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'episodes' && <EpisodesManagement mode="published" />}
        {activeTab === 'drafts' && <EpisodesManagement mode="draft" />}
        {activeTab === 'highlights' && <HighlightsOrdering />}
      </div>
    </div>
  )
}
