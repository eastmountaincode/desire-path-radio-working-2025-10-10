'use client'

import { useState } from 'react'
import { useChat } from './ChatProvider'
import { useDevMode } from '../DevModeProvider'
import { MAX_SCREEN_NAME_LENGTH } from '@/lib/constants'
import './chat-styles.css'

export default function ScreenNamePrompt() {
  const { setScreenName } = useChat()
  const devMode = useDevMode()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = input.trim()

    if (!trimmed) {
      setError('Please enter a screen name')
      return
    }

    if (trimmed.length > MAX_SCREEN_NAME_LENGTH) {
      setError(`Screen name must be ${MAX_SCREEN_NAME_LENGTH} characters or less`)
      return
    }

    setScreenName(trimmed)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (error) setError('')
  }

  return (
    <div className={`p-6 flex flex-col gap-4 flex-1 justify-center ${devMode ? 'border border-indigo-500' : ''}`}>
      <h2 className={`screen-name-title m-0 text-center ${devMode ? 'border border-violet-500' : ''}`}>
        choose your screen name
      </h2>
      <form onSubmit={handleSubmit} className={`flex flex-col gap-4 ${devMode ? 'border border-fuchsia-500' : ''}`}>
        <input
          type="text"
          className={`screen-name-input p-3 border outline-none ${devMode ? 'border border-sky-500' : ''}`}
          value={input}
          onChange={handleInputChange}
          maxLength={MAX_SCREEN_NAME_LENGTH}
        />
        {error && (
          <div className={`text-xs text-red-600 text-center ${devMode ? 'border border-emerald-500' : ''}`}>
            {error}
          </div>
        )}
        <button
          type="submit"
          className={`screen-name-submit text-sm py-3 px-6 border cursor-pointer hover:opacity-90 disabled:cursor-not-allowed ${devMode ? 'border border-teal-500' : ''}`}
          disabled={!input.trim()}
        >
          enter chat
        </button>
      </form>
    </div>
  )
}
