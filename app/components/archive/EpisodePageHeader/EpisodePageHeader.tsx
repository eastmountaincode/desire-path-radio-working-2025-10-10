'use client'

import Link from 'next/link'
import { useDevMode } from '../../DevModeProvider'
import './episode-page-header-styles.css'

export default function EpisodePageHeader() {
    const devMode = useDevMode()

    return (
        <div className={`pt-6 pb-6 ${devMode ? 'border border-red-500' : ''}`}>
            <Link href="/archive" className={`episode-page-header-back ${devMode ? 'border border-red-500' : ''}`}>
                ← back to all
            </Link>
        </div>
    )
}

