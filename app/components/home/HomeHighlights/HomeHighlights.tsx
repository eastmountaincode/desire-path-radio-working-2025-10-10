'use client'

import { useDevMode } from '../../DevModeProvider'
import './home-highlights-styles.css'

export default function HomeHighlights() {
    const devMode = useDevMode()

    return (
        <section className={`pt-12 pb-12 ${devMode ? 'border border-red-500' : ''}`}>
            <div className={devMode ? 'border border-blue-500' : ''}>
                <h2 className="mb-6 font-normal">Highlights</h2>
                {/* Highlights content will go here */}
                <p>Coming soon...</p>
            </div>
        </section>
    )
}

