'use client'

import { useDevMode } from '../../DevModeProvider'
import DesirePathAnimation from './DesirePathAnimation'
import './home-hero-styles.css'

export default function HomeHero() {
    const devMode = useDevMode()

    return (
        <section className={`relative overflow-hidden ${devMode ? 'border border-green-500' : ''}`}>
            <div className={`${devMode ? 'border border-blue-500' : ''}`}>
                {/* Desire path animation */}
                <DesirePathAnimation />

                <div className="h-4" />

                {/* DPR Logo */}
                <div className={`mb-8 flex justify-end ${devMode ? 'border border-pink-500' : ''}`}>
                    <img
                        src="/images/logo/DPR_LOGO.svg"
                        alt="DPR Logo"
                        className="h-[107px] md:h-[164px] w-auto dpr-logo"
                    />
                </div>

                {/* About Text - Two columns on desktop, one on mobile */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-start ${devMode ? 'border border-yellow-500' : ''}`}>
                    <div className="space-y-6">
                        <p className="home-hero-about-text">
                            In today&apos;s internet radio landscape, the definition of &ldquo;radio&rdquo; has expanded beyond
                            the technology and practice of transmitting sound over airwaves. &ldquo;Radio&rdquo; has
                            become a stand-in for curation, community, and discourse.
                        </p>
                        <div className={`flex flex-col gap-1 ${devMode ? 'border border-purple-500' : ''}`}>
                            <a href="/about" className={`home-hero-link flex gap-1 no-underline ${devMode ? 'border border-red-500' : ''}`}>
                                <span className={devMode ? 'border border-green-500' : ''}>about us</span> <i className={`fi fi-ts-arrow-small-right home-hero-link-arrow ${devMode ? 'border border-blue-500' : ''}`}></i>
                            </a>
                            <a href="/schedule" className={`home-hero-link flex gap-1 no-underline ${devMode ? 'border border-red-500' : ''}`}>
                                <span className={devMode ? 'border border-green-500' : ''}>schedule</span> <i className={`fi fi-ts-arrow-small-right home-hero-link-arrow ${devMode ? 'border border-blue-500' : ''}`}></i>
                            </a>
                            <a href="https://www.instagram.com/desirepath.radio/" target="_blank" rel="noopener noreferrer" className={`home-hero-link flex gap-1 no-underline ${devMode ? 'border border-red-500' : ''}`}>
                                <span className={devMode ? 'border border-green-500' : ''}>instagram</span> <i className={`fi fi-ts-arrow-small-right home-hero-link-arrow ${devMode ? 'border border-blue-500' : ''}`}></i>
                            </a>
                            <a href="#" className={`md:hidden block flex gap-1 home-hero-link no-underline ${devMode ? 'border border-red-500' : ''}`}>
                                <span className={devMode ? 'border border-green-500' : ''}>submit a show proposal</span> <i className={`fi fi-ts-arrow-small-right home-hero-link-arrow ${devMode ? 'border border-blue-500' : ''}`}></i>
                            </a>
                        </div>
                    </div>
                    <div className={`${devMode ? 'border border-purple-500' : ''} md:flex md:justify-end`}>
                        <a href="#" className={`hidden md:block md:flex gap-1 home-hero-link no-underline md:text-right ${devMode ? 'border border-red-500' : ''}`}>
                            <span className={devMode ? 'border border-green-500' : ''}>submit a show proposal</span> <i className={`fi fi-ts-arrow-small-right home-hero-link-arrow ${devMode ? 'border border-blue-500' : ''}`}></i>
                        </a>
                    </div>
                </div>

            </div>
        </section>
    )
}

