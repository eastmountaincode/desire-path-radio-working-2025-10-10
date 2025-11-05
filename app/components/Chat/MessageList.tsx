'use client'

import { useEffect, useRef } from 'react'
import { useChat } from './ChatProvider'
import { useDevMode } from '../DevModeProvider'
import './chat-styles.css'

export default function MessageList() {
  const { activeChannel, messages, userId } = useChat()
  const devMode = useDevMode()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const channelMessages = messages[activeChannel]

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages])

  return (
    <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-3 ${devMode ? 'border border-cyan-500' : ''}`}>
      {channelMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-sm opacity-60">
          No messages yet.
        </div>
      ) : (
        channelMessages.map((msg) => {
          const isMyMessage = msg.userId === userId
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${isMyMessage ? 'items-end' : 'items-start'} ${devMode ? 'border border-lime-500' : ''}`}
            >
              <div className={`message-username text-xs font-bold ${devMode ? 'border border-amber-500' : ''}`}>
                {msg.username}
              </div>
              <div className={`message-text text-sm break-words ${devMode ? 'border border-rose-500' : ''}`}>
                {msg.message}
              </div>
            </div>
          )
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
