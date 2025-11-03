'use client'

import { useState } from 'react'
import PlayCountAnalytics from '@/app/components/admin/PlayCountAnalytics/PlayCountAnalytics'
import AIAnalytics from '@/app/components/admin/AIAnalytics/AIAnalytics'

export default function AnalyticsTabsWrapper() {
  const [activeTab, setActiveTab] = useState<'standard' | 'ai'>('standard')

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-current pb-2">
        <button
          onClick={() => setActiveTab('standard')}
          className={`px-4 py-2 ${
            activeTab === 'standard'
              ? 'border-b-2 border-current font-semibold'
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          Play Count Analytics
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 ${
            activeTab === 'ai'
              ? 'border-b-2 border-current font-semibold'
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          AI Query (Experimental)
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'standard' && <PlayCountAnalytics />}
        {activeTab === 'ai' && <AIAnalytics />}
      </div>
    </div>
  )
}

