'use client'

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

type Channel = 'channel1' | 'channel2'

export interface Message {
  id: string
  userId: string
  username: string
  message: string
}

interface ChatContextType {
  isOpen: boolean
  screenName: string | null
  activeChannel: Channel
  messages: Record<Channel, Message[]>
  userId: string | null
  isConnected: boolean
  openChat: () => void
  closeChat: () => void
  setScreenName: (name: string) => void
  switchChannel: (channel: Channel) => void
  sendMessage: (message: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [screenName, setScreenNameState] = useState<string | null>(null)
  const [activeChannel, setActiveChannel] = useState<Channel>('channel1')
  const [messages, setMessages] = useState<Record<Channel, Message[]>>({
    channel1: [],
    channel2: []
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  // Connect to Socket.IO server once on mount
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socketRef.current = socket

    // Connection established
    socket.on('connect', () => {
      console.log('✅ Connected to chat server')
      setIsConnected(true)
    })

    // Receive user ID from server
    socket.on('user_id', (id: string) => {
      console.log('👤 Received user ID:', id)
      setUserId(id)
    })

    // Receive message history for both channels
    socket.on('message_history', (history: Record<Channel, Message[]>) => {
      console.log('📚 Received message history')
      setMessages(history)
    })

    // Receive new messages
    socket.on('new_message', (data: { channel: Channel; message: Message }) => {
      console.log('📨 New message:', data)
      setMessages(prev => ({
        ...prev,
        [data.channel]: [...prev[data.channel], data.message]
      }))
    })

    // Handle chat cleared by admin
    socket.on('chat_cleared', (data: { channel: string }) => {
      console.log('🧹 Chat cleared:', data.channel)
      if (data.channel === 'both') {
        setMessages({
          channel1: [],
          channel2: []
        })
      } else {
        setMessages(prev => ({
          ...prev,
          [data.channel as Channel]: []
        }))
      }
    })

    // Handle errors
    socket.on('error', (error: { message: string }) => {
      console.error('❌ Socket error:', error.message)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server')
      setIsConnected(false)
    })

    // Cleanup on unmount only
    return () => {
      console.log('🧹 Cleaning up socket connection')
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const openChat = () => {
    setIsOpen(true)
  }

  const closeChat = () => {
    setIsOpen(false)
  }

  const setScreenName = (name: string) => {
    setScreenNameState(name)
  }

  const switchChannel = (channel: Channel) => {
    setActiveChannel(channel)
  }

  const sendMessage = (message: string) => {
    if (!socketRef.current || !screenName || !message.trim()) return

    socketRef.current.emit('send_message', {
      channel: activeChannel,
      username: screenName,
      message: message.trim()
    })
  }

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        screenName,
        activeChannel,
        messages,
        userId,
        isConnected,
        openChat,
        closeChat,
        setScreenName,
        switchChannel,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}