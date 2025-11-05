'use client'

import { useEffect, useRef } from 'react'
import { useChat } from './ChatProvider'
import { useDevMode } from '../DevModeProvider'
import './chat-styles.css'

interface Message {
  id: number
  username: string
  message: string
}

const mockMessages: Record<'channel1' | 'channel2', Message[]> = {
  channel1: [
    { id: 1, username: 'RadioFan42', message: 'Great show today!' },
    { id: 2, username: 'MusicLover', message: 'What was that last track?' },
    { id: 3, username: 'NightListener', message: 'Been listening all week, love it' },
    { id: 4, username: 'VinylHead', message: 'This is my favorite hour' },
    { id: 5, username: 'SoundSeeker', message: 'Anyone know the artist on this one?' },
    { id: 6, username: 'BeatSeeker', message: 'The transitions are so smooth' },
    { id: 7, username: 'RadioLover', message: 'First time listening, this is amazing!' },
    { id: 8, username: 'SonicExplorer', message: 'Can we get a tracklist?' },
    { id: 9, username: 'WaveRider', message: 'Tuning in from California' },
    { id: 10, username: 'AudioPhile', message: 'The sound quality is incredible' },
  ],
  channel2: [
    { id: 1, username: 'NightOwl', message: 'Loving the vibes on channel 2' },
    { id: 2, username: 'BeatHunter', message: 'This mix is fire' },
    { id: 3, username: 'GrooveSeeker', message: 'Perfect late night listening' },
    { id: 4, username: 'RadioHead88', message: 'Been tuned in for hours' },
    { id: 5, username: 'FrequencyFan', message: 'Channel 2 never disappoints' },
    { id: 6, username: 'MidnightDJ', message: 'These selections are top tier' },
    { id: 7, username: 'SoundWave', message: 'Love the energy on this channel' },
    { id: 8, username: 'VibeChaser', message: 'Playing this all night long' },
    { id: 9, username: 'TuneCollector', message: 'Need to know this track!' },
    { id: 10, username: 'RadioAddict', message: 'Channel 2 is my go-to' },
  ],
}

export default function MessageList() {
  const { activeChannel } = useChat()
  const devMode = useDevMode()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messages = mockMessages[activeChannel]

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={`flex-1 overflow-y-auto p-4 flex flex-col gap-3 ${devMode ? 'border border-cyan-500' : ''}`}>
      {messages.map((msg) => (
        <div key={msg.id} className={`flex flex-col gap-1 ${devMode ? 'border border-lime-500' : ''}`}>
          <div className={`message-username text-xs font-bold ${devMode ? 'border border-amber-500' : ''}`}>
            {msg.username}
          </div>
          <div className={`message-text text-sm break-words ${devMode ? 'border border-rose-500' : ''}`}>
            {msg.message}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
