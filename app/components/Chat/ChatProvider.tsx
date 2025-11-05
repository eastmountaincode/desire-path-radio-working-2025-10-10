'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type Channel = 'channel1' | 'channel2'

interface ChatContextType {
  isOpen: boolean
  screenName: string | null
  activeChannel: Channel
  openChat: () => void
  closeChat: () => void
  setScreenName: (name: string) => void
  switchChannel: (channel: Channel) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [screenName, setScreenNameState] = useState<string | null>(null)
  const [activeChannel, setActiveChannel] = useState<Channel>('channel1')

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

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        screenName,
        activeChannel,
        openChat,
        closeChat,
        setScreenName,
        switchChannel,
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