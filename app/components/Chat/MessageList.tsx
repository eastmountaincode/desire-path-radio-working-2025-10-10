'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useChat } from './ChatProvider'
import { useDevMode } from '../DevModeProvider'
import './chat-styles.css'

// Simple hash function to assign a leaf (0-29) based on userId
function getUserLeaf(userId: string): number {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash) % 30
}

// Get the leaf SVG path for a user
function getLeafPath(userId: string): string {
  const leafNumber = getUserLeaf(userId)
  const leafNames = [
    'alders_3.svg',
    'apple_2.svg',
    'basswoods_3.svg',
    'beeches_2.svg',
    'birches_3.svg',
    'buckthorns_2.svg',
    'bumelias.svg',
    'catalpas.svg',
    'cherries_2.svg',
    'chestnut_2.svg',
    'dogwoods.svg',
    'elms_3.svg',
    'hackberries_2.svg',
    'hawthords_3.svg',
    'hollies.svg',
    'hollies_2.svg',
    'hornbeam_2.svg',
    'magnolia.svg',
    'mountain-laurel.svg',
    'mulberries_3.svg',
    'oaks.svg',
    'persimmons.svg',
    'plums_2.svg',
    'poplar_3.svg',
    'serviceberries_3.svg',
    'silverbells_3.svg',
    'tupelos.svg',
    'viburnums.svg',
    'viburnums_3.svg',
    'willows_2.svg',
  ]
  return `/images/processed_leaves_1/${leafNames[leafNumber]}`
}

// Format timestamp to a readable format
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const timeString = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  // If today, just show time
  if (messageDate.getTime() === today.getTime()) {
    return timeString
  }

  // If yesterday
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeString}`
  }

  // If within this week, show day name
  const daysAgo = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))
  if (daysAgo < 7) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    return `${dayName} ${timeString}`
  }

  // Otherwise show full date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export default function MessageList() {
  const { activeChannel, messages, userId } = useChat()
  const devMode = useDevMode()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const channelMessages = messages[activeChannel]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
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
              <div className={`flex flex-col gap-0.5 ${isMyMessage ? 'items-end' : 'items-start'}`}>
                <div className={`message-username text-xs font-bold ${devMode ? 'border border-amber-500' : ''}`}>
                  {msg.username}
                </div>
                {msg.message && (
                  <div className={`message-text text-sm break-words ${devMode ? 'border border-rose-500' : ''}`}>
                    {msg.message}
                  </div>
                )}
                {msg.imageUrl && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}${msg.imageUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="message-image-link"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}${msg.imageUrl}`}
                      alt="uploaded image"
                      className="message-image"
                      onLoad={scrollToBottom}
                    />
                  </a>
                )}
                {msg.timestamp && (
                  <div className={`message-timestamp text-xs opacity-60 ${devMode ? 'border border-blue-500' : ''}`}>
                    {formatTimestamp(msg.timestamp)}
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
