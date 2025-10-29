'use client'

import Link from 'next/link'
import { useDevMode } from '../../DevModeProvider'
import './episode-page-header-styles.css'

export default function EpisodePageHeader() {
    const devMode = useDevMode()

    return (
        <div className={`pb-6 ${devMode ? 'border border-red-500' : ''}`}>
            <Link href="/archive" className={`episode-page-header-back flex gap-1 items-center w-fit ${devMode ? 'border border-red-500' : ''}`}>
                <i className="fi fi-ts-arrow-small-left episode-page-header-back-arrow"></i>
                <span>back to all</span>
            </Link>
        </div>
    )
}

