'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDevMode } from '../../components/DevModeProvider'
import { getHomepageParagraphs } from '@/lib/homepage'
import '@/app/components/home/HomeHero/home-hero-styles.css'

export default function AdminHomepagePage() {
  const router = useRouter()
  const devMode = useDevMode()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    async function fetchHomepageText() {
      try {
        const response = await fetch('/api/homepage-text')
        if (response.ok) {
          const data = await response.json()
          setText(data.text || '')
        } else if (response.status === 401) {
          router.push('/admin')
        }
      } catch (error) {
        console.error('Failed to fetch homepage text:', error)
        setMessage({ type: 'error', text: 'Failed to load text' })
      } finally {
        setLoading(false)
      }
    }

    fetchHomepageText()
  }, [router])

  async function handleSave() {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/homepage-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Homepage text saved successfully!' })
      } else if (response.status === 401) {
        router.push('/admin')
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to save text' })
      }
    } catch (error) {
      console.error('Failed to save homepage text:', error)
      setMessage({ type: 'error', text: 'Failed to save text' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={`p-6 ${devMode ? 'border border-blue-500' : ''}`}>
        <h1 className="text-2xl mb-4">Homepage</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className={`p-6 ${devMode ? 'border border-blue-500' : ''}`}>
      <h1 className="text-2xl mb-4">Homepage</h1>
      <p className="mb-4 opacity-70">
        Edit the introductory text that appears at the top of the home page. Put each paragraph on its own line.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="mb-2 text-sm font-semibold opacity-70">Editor</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 p-4 border border-current bg-transparent font-mono"
            placeholder="Enter homepage intro text here..."
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold opacity-70">Live preview</p>
          <div className="h-64 p-4 border border-current overflow-auto space-y-6">
            {getHomepageParagraphs(text).length > 0 ? (
              getHomepageParagraphs(text).map((paragraph, index) => (
                <p key={`${paragraph}-${index}`} className="home-hero-about-text">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="opacity-50 text-sm italic">Preview will appear here as you type...</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 border border-current hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>

        {message && (
          <span className={message.type === 'error' ? 'text-red-500' : ''}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  )
}
