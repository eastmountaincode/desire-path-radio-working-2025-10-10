'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Episode {
  id: number
  title: string
  slug: string
  aired_on: string
  play_count: number
  image_url: string | null
}

interface AnalyticsData {
  topEpisodes: Episode[]
  leastPlayed: Episode[]
  stats: {
    totalPlays: number
    totalEpisodes: number
    averagePlays: number
  }
}

export default function PlayCountAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      const analyticsData = await response.json()
      setData(analyticsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const handleResetPlayCounts = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset ALL play counts to 0? This action cannot be undone.'
    )

    if (!confirmed) return

    setIsResetting(true)
    setResetMessage(null)

    try {
      const response = await fetch('/api/admin/analytics/reset', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to reset play counts')
      }

      setResetMessage('All play counts have been reset to 0')
      setIsDangerZoneOpen(false)

      // Refresh analytics data
      await fetchAnalytics()
    } catch (err) {
      setResetMessage('Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsResetting(false)
    }
  }

  if (loading && !data) {
    return <div className="p-6">Loading analytics...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  if (!data) {
    return <div className="p-6">No data available</div>
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-current rounded">
          <div className="text-sm opacity-60">Total Plays</div>
          <div className="text-3xl font-bold">{data.stats.totalPlays.toLocaleString()}</div>
        </div>
        <div className="p-4 border border-current rounded">
          <div className="text-sm opacity-60">Total Episodes</div>
          <div className="text-3xl font-bold">{data.stats.totalEpisodes.toLocaleString()}</div>
        </div>
        <div className="p-4 border border-current rounded">
          <div className="text-sm opacity-60">Average Plays per Episode</div>
          <div className="text-3xl font-bold">{data.stats.averagePlays.toLocaleString()}</div>
        </div>
      </div>

      {/* Top Episodes */}
      <div>
        <h2 className="text-xl font-bold mb-4">Most Played Episodes</h2>
        <div className="space-y-2">
          {data.topEpisodes.length > 0 ? (
            data.topEpisodes.map((episode, index) => (
              <Link
                key={episode.id}
                href={`/archive/${episode.slug}`}
                className="block p-4 border border-current rounded hover:bg-white hover:bg-opacity-5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold opacity-40 w-8">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{episode.title}</div>
                    <div className="text-sm opacity-60">
                      Aired {new Date(episode.aired_on).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{episode.play_count.toLocaleString()}</div>
                    <div className="text-sm opacity-60">plays</div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm opacity-60">No episodes have been played yet</p>
          )}
        </div>
      </div>

      {/* Least Played Episodes */}
      {data.leastPlayed.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Least Played Episodes</h2>
          <div className="space-y-2">
            {data.leastPlayed.map((episode, index) => (
              <Link
                key={episode.id}
                href={`/archive/${episode.slug}`}
                className="block p-4 border border-current rounded hover:bg-white hover:bg-opacity-5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold opacity-40 w-8">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{episode.title}</div>
                    <div className="text-sm opacity-60">
                      Aired {new Date(episode.aired_on).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{episode.play_count.toLocaleString()}</div>
                    <div className="text-sm opacity-60">plays</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="border border-red-500 rounded p-4 mt-12">
        <button
          onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <h2 className="text-xl font-bold text-red-500">Danger Zone</h2>
            <p className="text-sm opacity-60 mt-1">Destructive actions that cannot be undone</p>
          </div>
          <div className="text-2xl">
            {isDangerZoneOpen ? '−' : '+'}
          </div>
        </button>

        {isDangerZoneOpen && (
          <div className="mt-4 pt-4 border-t border-red-500 border-opacity-30">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Reset All Play Counts</h3>
                <p className="text-sm opacity-60 mb-4">
                  This will set all episode play counts back to 0. This action cannot be undone.
                </p>
                <button
                  onClick={handleResetPlayCounts}
                  disabled={isResetting}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isResetting ? 'Resetting...' : 'Reset All Play Counts'}
                </button>
              </div>

              {resetMessage && (
                <div className={`p-3 rounded ${resetMessage.startsWith('Error') ? 'bg-red-500 bg-opacity-20 text-red-300' : 'bg-green-500 bg-opacity-20 text-green-300'}`}>
                  {resetMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
