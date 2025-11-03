'use client'

import './ai-analytics-styles.css'
import { useState } from 'react'

interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  query: string
}

export default function AIAnalytics() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<QueryResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/analytics/ai-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute query')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const exampleQueries = [
    'Show me the top 10 episodes by play count',
    'What episodes aired in 2024?',
    'Show me the total play count across all episodes.',
    'What are the least played episodes?',
    'How many episodes have more than 1 host?',
    
  ]

  return (
    <div className="space-y-6 mb-8">
      {/* Info Banner */}
      <div className="p-4 border border-current rounded">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="opacity-60"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Experimental Feature
        </h3>
        <p className="text-sm opacity-60 mb-2">
          This AI-powered analytics tool lets you query your database using natural language.
          An LLM will convert your question into SQL and execute it against your Supabase database.
        </p>
        <p className="text-sm opacity-60">
          <strong>Note:</strong> Only SELECT queries are allowed for security.
        </p>
      </div>

      {/* Query Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="query" className="block text-sm font-semibold mb-2">
            Ask a question about your data
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Show me the top 10 episodes from 2024 with their play counts..."
            className="w-full h-24 px-4 py-2 bg-transparent border border-current rounded resize-none focus:outline-none focus:ring-2 focus:ring-current"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-2 border border-current rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Run Query'}
        </button>
      </form>

      {/* Example Queries */}
      <div>
        <h3 className="text-sm font-semibold mb-2 opacity-60">Example Queries:</h3>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              className="px-3 py-1 text-sm border border-current rounded"
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 border border-current rounded">
          <h3 className="font-semibold mb-1">Error</h3>
          <p className="text-sm opacity-60">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          {/* Generated SQL */}
          <div>
            <h3 className="text-sm font-semibold mb-2 opacity-60">Generated SQL:</h3>
            <pre className="p-4 rounded border border-current overflow-x-auto text-sm">
              <code>{formatSQL(result.query)}</code>
            </pre>
          </div>

          {/* Results Table */}
          <div>
            <h3 className="text-sm font-semibold mb-2 opacity-60">
              Results ({result.rowCount} rows)
            </h3>
            {result.rowCount === 0 ? (
              <p className="text-sm opacity-60">No results found</p>
            ) : (
                <div className="border border-current rounded overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 ai-analytics-table-header">
                      <tr className="border-b border-current">
                      {result.columns.map((col) => (
                        <th
                          key={col}
                          className={`px-4 py-2 text-left font-semibold ${
                            col.toLowerCase().includes('description') ? 'description-column' : ''
                          }`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={rowIndex === result.rows.length - 1 ? '' : 'border-b border-current border-opacity-30'}
                      >
                        {result.columns.map((col) => (
                          <td 
                            key={col} 
                            className={`px-4 py-2 ${
                              col.toLowerCase().includes('description') ? 'description-column' : ''
                            }`}
                          >
                            {formatCellValue(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function formatSQL(sql: string): string {
  // Basic SQL formatting for readability
  return sql
    .replace(/\bSELECT\b/gi, '\nSELECT\n  ')
    .replace(/\bFROM\b/gi, '\nFROM\n  ')
    .replace(/\bWHERE\b/gi, '\nWHERE\n  ')
    .replace(/\bJOIN\b/gi, '\nJOIN\n  ')
    .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN\n  ')
    .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN\n  ')
    .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN\n  ')
    .replace(/\bON\b/gi, '\nON\n  ')
    .replace(/\bORDER BY\b/gi, '\nORDER BY\n  ')
    .replace(/\bGROUP BY\b/gi, '\nGROUP BY\n  ')
    .replace(/\bHAVING\b/gi, '\nHAVING\n  ')
    .replace(/\bLIMIT\b/gi, '\nLIMIT\n  ')
    .replace(/\bOFFSET\b/gi, '\nOFFSET\n  ')
    .replace(/,\s*/g, ',\n  ')
    .replace(/\bAND\b/gi, '\n  AND ')
    .replace(/\bOR\b/gi, '\n  OR ')
    .trim()
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  if (typeof value === 'boolean') {
    return value ? '✓' : '✗'
  }
  return String(value)
}

