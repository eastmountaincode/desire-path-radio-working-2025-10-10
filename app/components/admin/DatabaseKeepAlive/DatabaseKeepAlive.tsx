'use client'

import { useEffect, useState } from 'react'

interface KeepAliveLog {
  id: number
  event_type: string
  status: 'success' | 'error'
  message: string
  created_at: string
}

export default function DatabaseKeepAlive() {
  const [logs, setLogs] = useState<KeepAliveLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch('/api/admin/keep-alive-logs')
        if (!response.ok) {
          throw new Error('Failed to fetch logs')
        }
        const data = await response.json()
        setLogs(data.logs || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logs')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  if (loading) {
    return (
      <div className="border border-current rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Database Keep-Alive Status</h2>
        <p className="text-sm opacity-70">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-current rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Database Keep-Alive Status</h2>
        <p className="text-sm text-red-500">Error: {error}</p>
      </div>
    )
  }

  const successCount = logs.filter(log => log.status === 'success').length
  const errorCount = logs.filter(log => log.status === 'error').length
  const latestLog = logs[0]

  return (
    <div className="border border-current rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Database Keep-Alive Status</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-current rounded p-4">
          <div className="text-sm opacity-70 mb-1">Last Ping</div>
          <div className="text-lg font-semibold">
            {latestLog ? new Date(latestLog.created_at).toLocaleDateString() : 'N/A'}
          </div>
          <div className="text-xs opacity-60">
            {latestLog ? new Date(latestLog.created_at).toLocaleTimeString() : ''}
          </div>
        </div>

        <div className="border border-current rounded p-4">
          <div className="text-sm opacity-70 mb-1">Success</div>
          <div className="text-lg font-semibold text-green-500">{successCount}</div>
          <div className="text-xs opacity-60">Last 90 days</div>
        </div>

        <div className="border border-current rounded p-4">
          <div className="text-sm opacity-70 mb-1">Errors</div>
          <div className="text-lg font-semibold text-red-500">{errorCount}</div>
          <div className="text-xs opacity-60">Last 90 days</div>
        </div>
      </div>

      {/* Recent Logs */}
      <div className="mb-2">
        <h3 className="text-sm font-semibold opacity-70 mb-2">Recent Activity</h3>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-sm opacity-60">No keep-alive logs yet. The cron job will run twice a week.</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="border border-current rounded p-3 text-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    log.status === 'success'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-red-500/20 text-red-500'
                  }`}
                >
                  {log.status}
                </span>
                <span className="text-xs opacity-60">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              <div className="text-xs opacity-70">{log.message}</div>
            </div>
          ))
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-current border-dotted">
        <p className="text-xs opacity-60">
          Cron job runs every Monday and Thursday at midnight UTC to keep the Supabase free tier database active.
        </p>
      </div>
    </div>
  )
}
