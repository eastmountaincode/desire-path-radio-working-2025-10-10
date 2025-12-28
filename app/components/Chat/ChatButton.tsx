'use client'

import { useState, useRef } from 'react'
import { useChat } from './ChatProvider'
import { useDevMode } from '../DevModeProvider'
import './chat-styles.css'

const MAX_MESSAGE_LENGTH = 500
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export default function ChatButton() {
  const { isOpen, openChat, closeChat, screenName, sendMessage, uploadImage } = useChat()
  const devMode = useDevMode()
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleToggleChat = () => {
    if (isOpen) {
      closeChat()
    } else {
      openChat()
    }
  }

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Invalid file type. Allowed: jpg, png, gif, webp')
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('File too large. Maximum size is 5 MB.')
      return false
    }
    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      setMessage('') // Clear any text when image is selected
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedMessage = message.trim()
    const hasMessage = trimmedMessage.length > 0
    const hasImage = selectedFile !== null

    // Either text OR image, not both
    if (!hasMessage && !hasImage) return
    if (hasMessage && trimmedMessage.length > MAX_MESSAGE_LENGTH) return

    if (hasImage) {
      // Send image only
      setIsUploading(true)
      const uploadedUrl = await uploadImage(selectedFile)
      setIsUploading(false)

      if (!uploadedUrl) {
        alert('Failed to upload image. Please try again.')
        return
      }
      sendMessage('', uploadedUrl)
      setSelectedFile(null)
    } else {
      // Send text only
      sendMessage(trimmedMessage)
      setMessage('')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
  }

  // Handle clearing image with backspace when input is focused but empty
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (selectedFile && e.key === 'Backspace') {
      clearSelectedFile()
    }
  }

  return (
    <div className={`chat-input-bar fixed bottom-0 flex items-stretch z-50 ${isOpen ? 'w-[440px] right-0 border-t border-l max-md:w-full max-md:left-0 max-md:border-r' : 'right-0'} ${devMode ? 'border border-red-500' : ''}`}>
      {isOpen && (
        <form
          onSubmit={handleSubmit}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex items-stretch flex-1 min-w-0 ${!screenName ? 'invisible' : ''} ${isDragOver ? 'drag-over' : ''} ${devMode ? 'border border-orange-500' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={handleImageButtonClick}
            disabled={!screenName || isUploading}
            className={`chat-image-button px-3 cursor-pointer flex items-center flex-shrink-0 ${devMode ? 'border border-teal-500' : ''}`}
            aria-label="Upload image"
          >
            <img
              src="/images/icons/flaticon/add-image.svg"
              alt=""
              draggable="false"
              className={`chat-icon ${devMode ? 'border border-orange-500' : ''}`}
              style={{ width: '18px', height: '18px', display: 'block' }}
            />
          </button>

          {selectedFile ? (
            // Image selected - show filename with X to clear
            <div className={`chat-input flex-1 px-3 py-2 flex items-center gap-2 min-w-0 overflow-hidden ${devMode ? 'border border-blue-500' : ''}`}>
              <span className="text-sm opacity-70 truncate">{selectedFile.name}</span>
              <button
                type="button"
                onClick={clearSelectedFile}
                className="text-lg leading-none opacity-60 hover:opacity-100 flex-shrink-0 ml-auto"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ) : (
            // No image - show text input
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={isDragOver ? 'Drop image here...' : 'type message...'}
              disabled={!screenName || isUploading}
              maxLength={MAX_MESSAGE_LENGTH}
              className={`chat-input flex-1 px-3 py-2 outline-none max-md:px-2 ${devMode ? 'border border-blue-500' : ''}`}
            />
          )}

          <button
            type="submit"
            disabled={!screenName || isUploading}
            className={`chat-submit-button px-4 cursor-pointer flex items-center border-l max-md:px-3 ${devMode ? 'border border-green-500' : ''}`}
            aria-label={isUploading ? 'Uploading...' : 'Send message'}
          >
            {isUploading ? (
              <i className={`fi fi-tr-spinner animate-spin text-lg translate-y-[2px] ${devMode ? 'border border-yellow-500' : ''}`}></i>
            ) : (
              <i className={`fi fi-tr-paper-plane-top text-lg translate-y-[2px] ${devMode ? 'border border-yellow-500' : ''}`}></i>
            )}
          </button>
        </form>
      )}
      <button
        onClick={handleToggleChat}
        className={`chat-toggle-button flex items-center gap-2 px-4 py-2 cursor-pointer max-md:px-3 ${isOpen ? 'border-l' : ''} ${devMode ? 'border border-purple-500' : ''}`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <i className={`fi fi-tr-messages text-lg translate-y-[1px] ${devMode ? 'border border-pink-500' : ''}`}></i>
        <span className={`translate-y-[-1px] ${devMode ? 'border border-cyan-500' : ''}`}>chat</span>
      </button>
    </div>
  )
}
