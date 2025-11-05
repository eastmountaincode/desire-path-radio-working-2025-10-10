'use client'

import { useState } from 'react'
import { useChat } from './ChatProvider'
import { useDevMode } from '../DevModeProvider'
import './chat-styles.css'

export default function ChatButton() {
  const { isOpen, openChat, closeChat, screenName } = useChat()
  const devMode = useDevMode()
  const [message, setMessage] = useState('')

  const handleToggleChat = () => {
    if (isOpen) {
      closeChat()
    } else {
      openChat()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // TODO: Send message to backend
    console.log('Send message:', message)
    setMessage('')
  }

  return (
    <div className={`chat-input-bar fixed bottom-0 flex items-stretch z-50 ${isOpen ? 'w-[400px] right-0 border-t border-l max-md:w-full max-md:left-0 max-md:border-r' : 'right-0'} ${devMode ? 'border border-red-500' : ''}`}>
      {isOpen && (
        <form onSubmit={handleSubmit} className={`flex items-stretch flex-1 ${!screenName ? 'invisible' : ''} ${devMode ? 'border border-orange-500' : ''}`}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="type message..."
            disabled={!screenName}
            className={`chat-input flex-1 px-3 py-2 outline-none max-md:px-2 ${devMode ? 'border border-blue-500' : ''}`}
          />
          <button
            type="submit"
            disabled={!screenName}
            className={`chat-submit-button px-4 cursor-pointer flex items-center border-l max-md:px-3 ${devMode ? 'border border-green-500' : ''}`}
            aria-label="Send message"
          >
            <i className={`fi fi-tr-paper-plane-top text-lg ${devMode ? 'border border-yellow-500' : ''}`}></i>
          </button>
        </form>
      )}
      <button
        onClick={handleToggleChat}
        className={`chat-toggle-button flex items-center gap-2 px-4 py-2 cursor-pointer max-md:px-3 ${isOpen ? 'border-l' : ''} ${devMode ? 'border border-purple-500' : ''}`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <i className={`fi fi-tr-messages text-lg ${devMode ? 'border border-pink-500' : ''}`}></i>
        <span className={`translate-y-[-1px] ${devMode ? 'border border-cyan-500' : ''}`}>chat</span>
      </button>
    </div>
  )
}
