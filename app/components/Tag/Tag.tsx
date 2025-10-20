'use client'

import './tag-styles.css'

interface TagProps {
    name: string
    onRemove?: () => void
}

export default function Tag({ name, onRemove }: TagProps) {
    return (
        <span 
            className="tag inline-flex items-center border px-1.5 py-0.5 bg-transparent text-xs rounded"
            style={{ 
                fontFamily: 'var(--font-monument)', 
                letterSpacing: '0em' 
            }}
        >
            {name.toLowerCase()}
            {onRemove && (
                <span 
                    className="tag-remove-icon ml-1 w-4 h-4 cursor-pointer"
                    aria-label="remove"
                    onClick={onRemove}
                />
            )}
        </span>
    )
}

