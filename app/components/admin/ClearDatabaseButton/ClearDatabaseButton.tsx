'use client'

import { useState } from 'react'
import ConfirmationModal from '@/app/components/admin/ConfirmationModal/ConfirmationModal'
import '@/app/components/admin/ConfirmationModal/confirmation-modal-styles.css'

interface ClearResults {
  episodes_deleted: number
  audio_files_deleted: number
  audio_files_failed: number
  image_files_deleted: number
  image_files_failed: number
  hosts_deleted: number
  tags_deleted: number
  highlights_cleared: number
  errors: string[]
}

export default function ClearDatabaseButton() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ClearResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClearDatabase = async () => {
    setIsModalOpen(false)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/clear-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear database')
      }

      setResults(data.results)
      setIsResultModalOpen(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      setIsResultModalOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const getResultMessage = () => {
    if (error) {
      return `Error: ${error}`
    }

    if (!results) {
      return 'No results available'
    }

    const messages = [
      `Episodes deleted: ${results.episodes_deleted}`,
      `Audio files deleted: ${results.audio_files_deleted}`,
      `Image files deleted: ${results.image_files_deleted}`,
      `Hosts deleted: ${results.hosts_deleted}`,
      `Tags deleted: ${results.tags_deleted}`,
      `Highlights cleared: ${results.highlights_cleared}`,
    ]

    if (results.audio_files_failed > 0) {
      messages.push(`Audio files failed: ${results.audio_files_failed}`)
    }

    if (results.image_files_failed > 0) {
      messages.push(`Image files failed: ${results.image_files_failed}`)
    }

    if (results.errors.length > 0) {
      messages.push(`Errors: ${results.errors.length}`)
    }

    return messages.join('\n')
  }

  return (
    <div className="border border-red-500 rounded-lg bg-red-50 dark:bg-red-950/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-red-100 dark:hover:bg-red-950/20 transition-colors"
      >
        <div>
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
            Danger Zone
          </h2>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            Destructive actions that cannot be undone
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-red-600 dark:text-red-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-red-300 dark:border-red-800">
          <div className="pt-4">
            <h3 className="font-semibold mb-2 text-red-700 dark:text-red-400">Clear Database</h3>
            <p className="text-sm text-red-600 dark:text-red-300 mb-4">
              This action will permanently delete all episodes, audio files, and images from the database and object storage.
              The schedule image will be preserved.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Clearing Database...' : 'Clear Database'}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        title="Clear Database"
        message="Are you sure you want to clear the entire database? This will permanently delete all episodes, audio files, and images. The schedule image will be preserved. This action cannot be undone."
        variant="error"
        confirmText="Yes, Clear Database"
        cancelText="Cancel"
        onConfirm={handleClearDatabase}
        onCancel={() => setIsModalOpen(false)}
      />

      {/* Results Modal */}
      {isResultModalOpen && (
        <div className="confirmation-modal-backdrop">
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="confirmation-modal-header mb-4">
                <h3 className="mb-1 pb-2">
                  {error ? 'Error' : 'Database Cleared'}
                </h3>
              </div>
              <div className="mb-6">
                <div className="text-sm opacity-90 whitespace-pre-line">
                  {getResultMessage()}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  className="confirmation-modal-button confirmation-modal-button-secondary px-6 py-2"
                  onClick={() => {
                    setIsResultModalOpen(false)
                    setResults(null)
                    setError(null)
                  }}
                >
                  Cancel
                </button>
                <button
                  className="confirmation-modal-button confirmation-modal-button-primary px-6 py-2"
                  onClick={() => {
                    setIsResultModalOpen(false)
                    setResults(null)
                    setError(null)
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
