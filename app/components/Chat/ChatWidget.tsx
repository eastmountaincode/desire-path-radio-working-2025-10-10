'use client'

import { useChat } from './ChatProvider'
import ChatButton from './ChatButton'
import ChatWindow from './ChatWindow'

export default function ChatWidget() {
  const { isOpen } = useChat()

  return (
    <>
      <ChatButton />
      {isOpen && <ChatWindow />}
    </>
  )
}
