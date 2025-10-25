'use client'

import { useDevMode } from '@/app/components/DevModeProvider'
import './confirmation-modal-styles.css'

export type ModalVariant = 'confirm' | 'alert' | 'error' | 'success'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  variant?: ModalVariant
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  variant = 'confirm',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  const devMode = useDevMode()

  if (!isOpen) return null

  const showCancelButton = variant === 'confirm' && onCancel

  return (
    <div className="confirmation-modal-backdrop" onClick={onCancel}>
      <div
        className={`confirmation-modal ${devMode ? 'border border-red-500' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className={`confirmation-modal-header mb-4 ${devMode ? 'border border-red-500' : ''}`}>
            <h3 className="mb-1 pb-2">
              {title}
            </h3>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-sm opacity-90">{message}</p>
          </div>

          {/* Buttons */}
          <div className={`flex gap-2 ${showCancelButton ? 'justify-end' : 'justify-center'}`}>
            {showCancelButton && (
              <button
                className="confirmation-modal-button confirmation-modal-button-secondary px-6 py-2"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            )}
            <button
              className={`confirmation-modal-button confirmation-modal-button-primary px-6 py-2 ${
                variant === 'error' ? 'confirmation-modal-button-error' : ''
              }`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
