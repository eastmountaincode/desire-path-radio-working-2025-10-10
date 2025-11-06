'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useChat } from './ChatProvider'
import { useDevMode } from '../DevModeProvider'
import './chat-styles.css'

// Simple hash function to assign a leaf (0-9) based on userId
function getUserLeaf(userId: string): number {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash) % 10
}

// Get the leaf SVG path for a user
function getLeafPath(userId: string): string {
  const leafNumber = getUserLeaf(userId)
  const leafNames = [
    'Artboard 2.svg',
    'Artboard 2 copy.svg',
    'Artboard 2 copy 2.svg',
    'Artboard 2 copy 3.svg',
    'Artboard 2 copy 4.svg',
    'Artboard 2 copy 5.svg',
    'Artboard 2 copy 6.svg',
    'Artboard 2 copy 7.svg',
    'Artboard 2 copy 8.svg',
    'Artboard 2 copy 9.svg',
  ]
  return `/images/processed_leaves_1/${leafNames[leafNumber]}`
}

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
              className={`flex gap-2 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'} ${devMode ? 'border border-lime-500' : ''}`}
            >
              <div className="flex-shrink-0 w-6 h-6">
                <Image
                  src={getLeafPath(msg.userId)}
                  alt="user icon"
                  width={24}
                  height={24}
                  className="w-full h-full leaf-icon"
                />
              </div>
              <div className={`flex flex-col gap-1 ${isMyMessage ? 'items-end' : 'items-start'}`}>
                <div className={`message-username text-xs font-bold ${devMode ? 'border border-amber-500' : ''}`}>
                  {msg.username}
                </div>
                <div className={`message-text text-sm break-words ${devMode ? 'border border-rose-500' : ''}`}>
                  {msg.message}
                </div>
              </div>
            </div>
          )
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
