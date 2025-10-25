'use client'

import Link from "next/link"
import Image from "next/image"
import { useDevMode } from "../DevModeProvider"
import "./footer-styles.css"

export default function Footer() {
    const devMode = useDevMode()

    return (
        <footer className={`footer-container border-t px-7 py-7 ${devMode ? 'border border-yellow-500' : ''}`}>
            {/* Navigation Links */}
            <nav className={`flex flex-col gap-1 ${devMode ? 'border border-blue-500' : ''}`}>
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
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`footer-link footer-external-link mt-4 ${devMode ? 'border border-green-500' : ''}`}
                >
                    <span className={devMode ? 'border border-yellow-500' : ''}>instagram</span>
                    <i className={`fi fi-brands-instagram text-xs ${devMode ? 'border border-cyan-500' : ''}`}></i>
                </a>
            </nav>

            <div aria-hidden="true" className="h-36 md:h-12 w-full" />

            {/* Logo Row */}
            <div className={`flex justify-start md:justify-end mb-2 ${devMode ? 'border border-purple-500' : ''}`}>
                <Image
                    src="/images/logo/DPR_LOGO.svg"
                    alt="desire path radio logo"
                    width={120}
                    height={120}
                    className={`footer-logo ${devMode ? 'border border-red-500' : ''}`}
                />
            </div>

            {/* Bottom Row - Legal and Copyright */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 footer-bottom-text ${devMode ? 'border border-orange-500' : ''}`}>
                {/* Privacy/Terms - hidden on mobile */}
                <div className={`hidden md:flex gap-4 ${devMode ? 'border border-pink-500' : ''}`}>
                    <Link href="/privacy-policy" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                        privacy policy
                    </Link>
                    <Link href="/terms-and-conditions" className={`footer-link ${devMode ? 'border border-green-500' : ''}`}>
                        terms and conditions
                    </Link>
                </div>
                <div className={devMode ? 'border border-cyan-500' : ''}>
                    desire path radio | 2025
                </div>
            </div>
        </footer>
    )
}
