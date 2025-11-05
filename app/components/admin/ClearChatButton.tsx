'use client'

import { useState } from 'react'
import { io } from 'socket.io-client'

export default function ClearChatButton() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleClearChat = (channel: 'channel1' | 'channel2' | 'both') => {
    setLoading(true)
    setStatus('')

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    const adminSecret = process.env.NEXT_PUBLIC_CHAT_ADMIN_SECRET

    if (!adminSecret) {
      setStatus('Error: Admin secret not configured')
      setLoading(false)
      return
    }

    const socket = io(socketUrl)

    socket.on('connect', () => {
      socket.emit('clear_chat', {
        channel,
        secret: adminSecret
      })

      setTimeout(() => {
        setStatus(`✅ Cleared ${channel === 'both' ? 'both channels' : channel}`)
        socket.disconnect()
        setLoading(false)
      }, 500)
    })

    socket.on('error', (error: { message: string }) => {
      setStatus(`❌ Error: ${error.message}`)
      socket.disconnect()
      setLoading(false)
    })

    socket.on('connect_error', () => {
      setStatus('❌ Failed to connect to chat server')
      setLoading(false)
    })
  }

  return (
    <div className="border p-4 rounded">
      <h2 className="text-xl mb-4">Chat Management</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleClearChat('channel1')}
          disabled={loading}
          className="px-4 py-2 dpr-button disabled:opacity-50"
        >
          Clear Channel 1
        </button>

        <button
          onClick={() => handleClearChat('channel2')}
          disabled={loading}
          className="px-4 py-2 dpr-button disabled:opacity-50"
        >
          Clear Channel 2
        </button>

        <button
          onClick={() => handleClearChat('both')}
          disabled={loading}
          className="px-4 py-2 dpr-button disabled:opacity-50"
        >
          Clear Both Channels
        </button>
      </div>

      {status && (
        <p className="text-sm">{status}</p>
      )}
    </div>
  )
}
