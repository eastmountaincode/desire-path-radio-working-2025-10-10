'use client'

import { useState } from 'react'

interface DeveloperSettingsProps {
    testType: 'none' | 'jest' | 'manual'
    onTestTypeChange: (testType: 'none' | 'jest' | 'manual') => void
}

export default function DeveloperSettings({ testType, onTestTypeChange }: DeveloperSettingsProps) {
    const [isDevSettingsCollapsed, setIsDevSettingsCollapsed] = useState(false) // TODO: change to true in production

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Developer Settings</h2>
                <button
                    type="button"
                    onClick={() => setIsDevSettingsCollapsed(!isDevSettingsCollapsed)}
                    className="p-1 hover:bg-grey1 transition-colors"
                    aria-label={isDevSettingsCollapsed ? 'Expand developer settings' : 'Collapse developer settings'}
                >
                    <svg
                        className={`w-5 h-5 transition-transform ${isDevSettingsCollapsed ? 'rotate-0' : 'rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {!isDevSettingsCollapsed && (
                <div className="space-y-3">
                    <label className="block text-sm font-medium">Test Type</label>
                    <div className="space-y-2">
                        {[
                            { value: 'none', label: 'Production (none)', description: 'Production episodes are shown to all users' },
                            { value: 'jest', label: 'Jest Test', description: 'Jest test episodes are automatically cleaned up after tests' },
                            { value: 'manual', label: 'Manual Test', description: 'Manual test episodes require manual deletion' }
                        ].map((option) => (
                            <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="test_type"
                                    value={option.value}
                                    checked={testType === option.value}
                                    onChange={(e) => onTestTypeChange(e.target.value as 'none' | 'jest' | 'manual')}
                                    className="mt-1 w-4 h-4 border border-grey5"
                                />
                                <div className="flex-1">
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-sm text-grey5">{option.description}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
