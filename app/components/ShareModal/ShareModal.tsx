'use client'

import { useState } from 'react'
import { useDevMode } from '@/app/components/DevModeProvider'
import './share-modal-styles.css'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  title?: string
}

export default function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  title = 'Share Episode'
}: ShareModalProps) {
  const devMode = useDevMode()
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="share-modal-backdrop p-6" onClick={onClose}>
      <div
        className={`share-modal ${devMode ? 'border border-red-500' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className={`share-modal-header mb-4 ${devMode ? 'border border-red-500' : ''}`}>
            <h3 className="mb-1 pb-2">
              {title}
            </h3>
          </div>

          {/* URL Display */}
          <div className="mb-6">
            <div className="share-modal-url-container p-3 mb-3 break-all">
              {shareUrl}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              className="share-modal-button share-modal-button-secondary px-6 py-2"
              onClick={onClose}
            >
              close
            </button>
            <button
              className="share-modal-button share-modal-button-primary px-6 py-2"
              onClick={handleCopy}
            >
              {copied ? 'copied!' : 'copy link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
