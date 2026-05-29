'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDevMode } from '../../DevModeProvider'
import DesirePathAnimation from './DesirePathAnimation'
import { DEFAULT_HOMEPAGE_TEXT, getHomepageParagraphs } from '@/lib/homepage'
import './home-hero-styles.css'

export default function HomeHero() {
    const devMode = useDevMode()
    const [homepageText, setHomepageText] = useState(DEFAULT_HOMEPAGE_TEXT)

    useEffect(() => {
        let isMounted = true

        async function fetchHomepageText() {
            try {
                const response = await fetch('/api/homepage-text')
                if (!response.ok) return

                const data = await response.json()
                if (isMounted && typeof data.text === 'string' && data.text.trim()) {
                    setHomepageText(data.text)
                }
            } catch (error) {
                console.error('Failed to fetch homepage text:', error)
            }
        }

        fetchHomepageText()

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <section className={`relative overflow-hidden ${devMode ? 'border border-green-500' : ''}`}>
            <div className={`${devMode ? 'border border-blue-500' : ''}`}>
                {/* Desire path animation */}
                <DesirePathAnimation />

                <div className="h-4" />

                {/* Logo */}
                <div className={`mb-8 flex justify-end ${devMode ? 'border border-pink-500' : ''}`}>
                    <h1 className="sr-only">Desire Path Radio</h1>
                    <img
                        src="/images/logo/DPR_LOGO.svg"
                        alt="Desire Path Radio"
                        className="h-[107px] md:h-[164px] w-auto dpr-logo"
                    />
                </div>

                {/* About Text - Two columns on desktop, one on mobile */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-start ${devMode ? 'border border-yellow-500' : ''}`}>
                    <div className="space-y-6">
                        {getHomepageParagraphs(homepageText).map((paragraph, index) => (
                            <p
                                key={`${paragraph}-${index}`}
                                className={`home-hero-about-text ${devMode ? 'border border-orange-500' : ''}`}
                            >
                                {paragraph}
                            </p>
                        ))}
                        <div className={`flex flex-col gap-1 items-start ${devMode ? 'border border-purple-500' : ''}`}>
                            <Link href="/submit-show-proposal" className={`flex gap-1 home-hero-link no-underline ${devMode ? 'border border-red-500' : ''}`}>
                                <span className={devMode ? 'border border-green-500' : ''}>submit a show proposal</span> <i className={`fi fi-ts-arrow-small-right home-hero-link-arrow ${devMode ? 'border border-blue-500' : ''}`}></i>
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
