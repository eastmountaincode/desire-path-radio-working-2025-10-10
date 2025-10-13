'use client'

import { useState } from 'react'

// Force dynamic rendering to check authentication on every request
export default function ArchiveManagementPage() {
    const [loadingStates, setLoadingStates] = useState({
        episodes: false,
        guests: false,
        tags: false
    })
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const clearDatabase = async (table: string) => {
        const tableNames = {
            episodes: 'ALL episodes and related data',
            guests: 'ALL guests',
            tags: 'ALL tags'
        }

        if (!confirm(`Are you sure you want to delete ${tableNames[table as keyof typeof tableNames]}? This action cannot be undone.`)) {
            return
        }

        // Set loading state for this specific table
        setLoadingStates(prev => ({ ...prev, [table]: true }))
        setError(null)
        setMessage(null)

        try {
            const response = await fetch(`/api/admin/episodes?table=${table}`, {
                method: 'DELETE',
            })

            const data = await response.json()

            if (response.ok) {
                setMessage(data.message)
            } else {
                setError(data.error || 'Failed to clear database')
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Network error occurred')
        } finally {
            // Clear loading state for this specific table
            setLoadingStates(prev => ({ ...prev, [table]: false }))
        }
    }

    return (
        <div className="p-6 border border-purple-500">
            <h1 className="text-2xl mb-4">Archive Management</h1>

            <div className="space-y-4">
                <div className="p-4 border border-red-500 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        These actions will permanently delete data from the database.
                        The CASCADE DELETE constraints will automatically clean up related records.
                    </p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => clearDatabase('episodes')}
                            disabled={loadingStates.episodes}
                            className={`
                                w-auto px-6 py-2 rounded font-medium text-sm self-start
                                ${loadingStates.episodes
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }
                            `}
                        >
                            {loadingStates.episodes ? 'Clearing Episodes...' : 'Clear All Episodes'}
                        </button>

                        <button
                            onClick={() => clearDatabase('guests')}
                            disabled={loadingStates.guests}
                            className={`
                                w-auto px-6 py-2 rounded font-medium text-sm self-start
                                ${loadingStates.guests
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                                }
                            `}
                        >
                            {loadingStates.guests ? 'Clearing Guests...' : 'Clear All Guests'}
                        </button>

                        <button
                            onClick={() => clearDatabase('tags')}
                            disabled={loadingStates.tags}
                            className={`
                                w-auto px-6 py-2 rounded font-medium text-sm self-start
                                ${loadingStates.tags
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                }
                            `}
                        >
                            {loadingStates.tags ? 'Clearing Tags...' : 'Clear All Tags'}
                        </button>
                    </div>
                </div>

                {message && (
                    <div className="p-3 bg-green-100 border border-green-300 rounded text-green-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}