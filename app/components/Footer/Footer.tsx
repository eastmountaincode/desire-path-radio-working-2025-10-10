'use client'

import Link from "next/link"
import Image from "next/image"
import { useDevMode } from "../DevModeProvider"
import "./footer-styles.css"

export default function Footer() {
    const devMode = useDevMode()

    return (
        <footer className={`footer-container border-t px-5 py-7 ${devMode ? 'border border-yellow-500' : ''}`}>
            {/* Top Row - Navigation Links and Logo (desktop only) */}
            <div className={`hidden md:flex justify-between items-start ${devMode ? 'border border-purple-500' : ''}`}>
                {/* Navigation Links */}
                <nav className={`flex flex-col gap-1 items-start ${devMode ? 'border border-blue-500' : ''}`}>
                    <Link href="/about" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                        about
                    </Link>
                    <Link href="/schedule" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                        schedule
                    </Link>
                    <Link href="/archive" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                        archive
                    </Link>
                    <Link href="/submit-show-proposal" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                        submit show proposal
                    </Link>
                    <a
                        href="https://www.gofundme.com/f/desire-path-radio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`footer-link ${devMode ? 'border border-green-500' : ''}`}
                    >
                        donate
                    </a>
                    <a
                        href="mailto:info@desirepathradio.com"
                        className={`footer-link footer-external-link mt-4 ${devMode ? 'border border-green-500' : ''}`}
                    >
                        <span className={devMode ? 'border border-yellow-500' : ''}>email</span>
                        <i className={`fi fi-rr-envelope text-xs ${devMode ? 'border border-cyan-500' : ''}`}></i>
                    </a>
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`footer-link footer-external-link ${devMode ? 'border border-green-500' : ''}`}
                    >
                        <span className={devMode ? 'border border-yellow-500' : ''}>instagram</span>
                        <i className={`fi fi-brands-instagram text-xs ${devMode ? 'border border-cyan-500' : ''}`}></i>
                    </a>
                </nav>

                {/* Logo and Copyright - desktop only */}
                <div className={`flex flex-col items-end gap-2 ${devMode ? 'border border-purple-500' : ''}`}>
                    <Image
                        src="/images/logo/DPR_LOGO.svg"
                        alt="desire path radio logo"
                        width={120}
                        height={120}
                        className={`footer-logo ${devMode ? 'border border-red-500' : ''}`}
                    />
                    {/* <div className={`${devMode ? 'border border-cyan-500' : ''}`}>
                        desire path radio | 2025
                    </div> */}
                </div>
            </div>

            {/* Mobile Navigation */}
            <nav className={`md:hidden flex flex-col gap-1 items-start ${devMode ? 'border border-blue-500' : ''}`}>
                <Link href="/about" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                    about
                </Link>
                <Link href="/schedule" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                    schedule
                </Link>
                <Link href="/archive" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                    archive
                </Link>
                <Link href="/submit-show-proposal" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                    submit show proposal
                </Link>
                <a
                    href="https://www.gofundme.com/f/desire-path-radio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`footer-link ${devMode ? 'border border-green-500' : ''}`}
                >
                    donate
                </a>
                <a
                    href="mailto:info@desirepathradio.com"
                    className={`footer-link footer-external-link mt-4 ${devMode ? 'border border-green-500' : ''}`}
                >
                    <span className={devMode ? 'border border-yellow-500' : ''}>email</span>
                    <i className={`fi fi-rr-envelope text-xs ${devMode ? 'border border-cyan-500' : ''}`}></i>
                </a>
                <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`footer-link footer-external-link ${devMode ? 'border border-green-500' : ''}`}
                >
                    <span className={devMode ? 'border border-yellow-500' : ''}>instagram</span>
                    <i className={`fi fi-brands-instagram text-xs ${devMode ? 'border border-cyan-500' : ''}`}></i>
                </a>
            </nav>

            <div aria-hidden="true" className="h-36 md:h-12 w-full" />

            {/* Mobile Logo and Copyright */}
            <div className={`md:hidden flex flex-col gap-2 ${devMode ? 'border border-purple-500' : ''}`}>
                <Image
                    src="/images/logo/DPR_LOGO.svg"
                    alt="desire path radio logo"
                    width={120}
                    height={120}
                    className={`footer-logo ${devMode ? 'border border-red-500' : ''}`}
                />
                <div className={`${devMode ? 'border border-cyan-500' : ''}`}>
                    desire path radio | 2025
                </div>
            </div>

            {/* Desktop Privacy/Terms */}
            <div className={`hidden md:flex gap-4 items-start ${devMode ? 'border border-pink-500' : ''}`}>
                <Link href="/privacy-policy" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                    privacy policy
                </Link>
                <Link href="/terms-and-conditions" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                    terms and conditions
                </Link>
            </div>
        </footer>
    )
}
