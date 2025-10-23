'use client'

import { useDevMode } from '../../DevModeProvider'
import './home-coming-up-styles.css'

export default function HomeComingUp() {
    const devMode = useDevMode()

    return (
        <section className={`pt-12 pb-12 ${devMode ? 'border border-red-500' : ''}`}>
            <div className={devMode ? 'border border-blue-500' : ''}>
                <h2 className="mb-6 font-normal">Coming Up</h2>
                {/* Coming up content will go here */}
                <p>Coming soon...</p>
            </div>
        </section>
    )
}

