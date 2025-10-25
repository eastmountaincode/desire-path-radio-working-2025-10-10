'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDevMode } from '../../components/DevModeProvider'

export default function AdminComingUpPage() {
  const router = useRouter()
  const devMode = useDevMode()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    async function fetchComingUpText() {
      try {
        const response = await fetch('/api/coming-up')
        if (response.ok) {
          const data = await response.json()
          setText(data.text || '')
        } else if (response.status === 401) {
          router.push('/admin')
        }
      } catch (error) {
        console.error('Failed to fetch coming up text:', error)
        setMessage({ type: 'error', text: 'Failed to load text' })
      } finally {
        setLoading(false)
      }
    }

    fetchComingUpText()
  }, [router])

  async function handleSave() {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/coming-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Coming up text saved successfully!' })
      } else if (response.status === 401) {
        router.push('/admin')
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Failed to save text' })
      }
    } catch (error) {
      console.error('Failed to save coming up text:', error)
      setMessage({ type: 'error', text: 'Failed to save text' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={`p-6 ${devMode ? 'border border-blue-500' : ''}`}>
        <h1 className="text-2xl mb-4">Coming Up</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className={`p-6 ${devMode ? 'border border-blue-500' : ''}`}>
      <h1 className="text-2xl mb-4">Coming Up</h1>
      <p className="mb-4 opacity-70">
        Edit the text that appears on the home page. Newlines will be preserved.
      </p>

      <div className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-64 p-4 border border-current bg-transparent font-mono"
          placeholder="Enter coming up text here..."
        />
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
          <span className={message.type === 'success' ? 'text-green-500' : 'text-red-500'}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  )
}
