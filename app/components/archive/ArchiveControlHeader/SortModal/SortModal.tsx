'use client'

import { useState } from 'react'
import { useDevMode } from '@/app/components/DevModeProvider'
import "./sort-modal-styles.css"

interface SortModalProps {
    isOpen: boolean
    onClose: () => void
    onApply: (order: 'asc' | 'desc') => void
    currentOrder: 'asc' | 'desc'
}

export default function SortModal({ isOpen, onClose, onApply, currentOrder }: SortModalProps) {
    const [selectedOrder, setSelectedOrder] = useState<'asc' | 'desc'>(currentOrder)

    const handleApply = () => {
        onApply(selectedOrder)
        onClose()
    }

    const devMode = useDevMode()

    if (!isOpen) return null

    return (
        <div className={`sort-modal rounded-sm absolute top-full right-0 z-50 mt-2 ${devMode ? 'border border-red-500' : ''}`}>
            <div className={`p-4 min-w-72`}>
                <div className={`sort-modal-header mb-4 ${devMode ? 'border border-red-500' : ''}`}>
                    <h3 className={`mb-1 pb-2 ${devMode ? 'border border-red-500' : ''}`}>
                        sort by date
                    </h3>
                </div>

                <div className={`mb-4 space-y-1 ${devMode ? 'border border-red-500' : ''}`}>
                    <label className="flex items-center gap-2 py-1 cursor-pointer">
                        <input 
                            type="radio" 
                            name="sort-order"
                            className="cursor-pointer"
                            checked={selectedOrder === 'desc'}
                            onChange={() => setSelectedOrder('desc')}
                        />
                        <span className="select-none">newest first</span>
                    </label>
                    <label className="flex items-center gap-2 py-1 cursor-pointer">
                        <input 
                            type="radio" 
                            name="sort-order"
                            className="cursor-pointer"
                            checked={selectedOrder === 'asc'}
                            onChange={() => setSelectedOrder('asc')}
                        />
                        <span className="select-none">oldest first</span>
                    </label>
                </div>

                <div className="pt-3">
                    <button 
                        className="sort-modal-apply-button w-full py-2 px-4 rounded"
                        onClick={handleApply}
                    >
                        apply
                    </button>
                </div>
            </div>
        </div>
    )
}

