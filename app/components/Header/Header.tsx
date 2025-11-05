"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "../ThemeToggle"
import { useDevMode } from "../DevModeProvider"
import { useMobileMenu } from "../MobileMenuProvider"
import { useRef, useEffect } from "react"

import "./header-style.css"

export default function Header() {
    const pathname = usePathname()
    const { isMobileMenuOpen, setIsMobileMenuOpen, setHeaderHeight } = useMobileMenu()
    const devMode = useDevMode()
    const headerRef = useRef<HTMLElement>(null)

    const isActive = (path: string) => pathname === path

    // Measure header height and update context
    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.offsetHeight)
            }
        }

        // Initial measurement
        updateHeight()

        // Create ResizeObserver to watch for size changes
        const resizeObserver = new ResizeObserver(updateHeight)
        if (headerRef.current) {
            resizeObserver.observe(headerRef.current)
        }

        return () => {
            resizeObserver.disconnect()
        }
    }, [isMobileMenuOpen, setHeaderHeight])

    return (
        <header ref={headerRef} className={`fixed border-b top-0 left-0 right-0 z-52 px-5 ${devMode ? 'border border-red-500' : ''}`}>
            <div className={`flex items-center justify-between h-12 ${devMode ? 'border border-blue-500' : ''}`}>
                <div className="flex items-center gap-12">
                    <Link 
                        href="/"
                        className={`select-none hover:text-brand-dpr-orange ${devMode ? 'border border-green-500' : ''}`}
                    >
                        desire path radio
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex gap-3">
                        <Link
                            href="/"
                            className={`group ${isActive("/") ? "text-brand-dpr-orange" : ""}`}
                        >
                            <span className={isActive("/") ? "" : "invisible group-hover:visible"}>[</span>home<span className={isActive("/") ? "" : "invisible group-hover:visible"}>]</span>
                        </Link>
                        <Link
                            href="/archive"
                            className={`group ${isActive("/archive") ? "text-brand-dpr-orange" : ""}`}
                        >
                            <span className={isActive("/archive") ? "" : "invisible group-hover:visible"}>[</span>archive<span className={isActive("/archive") ? "" : "invisible group-hover:visible"}>]</span>
                        </Link>
                        <Link
                            href="/about"
                            className={`group ${isActive("/about") ? "text-brand-dpr-orange" : ""}`}
                        >
                            <span className={isActive("/about") ? "" : "invisible group-hover:visible"}>[</span>about<span className={isActive("/about") ? "" : "invisible group-hover:visible"}>]</span>
                        </Link>
                        <Link
                            href="/schedule"
                            className={`group ${isActive("/schedule") ? "text-brand-dpr-orange" : ""}`}
                        >
                            <span className={isActive("/schedule") ? "" : "invisible group-hover:visible"}>[</span>schedule<span className={isActive("/schedule") ? "" : "invisible group-hover:visible"}>]</span>
                        </Link>
                        <a
                            href="https://vmgkdp-0h.myshopify.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                        >
                            <span className="invisible group-hover:visible">[</span>shop<span className="invisible group-hover:visible">]</span>
                        </a>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    {/* Hamburger menu button - mobile only */}
                    <button
                        className="md:hidden p-2 -mr-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="w-[25px] h-3 relative flex flex-col justify-between">
                            <span className={`h-0.5 w-full bg-current transition-transform origin-center ${isMobileMenuOpen ? 'rotate-45 translate-y-[5px]' : ''}`}></span>
                            <span className={`h-0.5 w-full bg-current transition-transform origin-center ${isMobileMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}></span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile menu dropdown */}
            {isMobileMenuOpen && (
                <nav className={`md:hidden flex flex-col pb-6 gap-3 ${devMode ? 'border border-red-500' : ''}`}>
                    <Link
                        href="/"
                        className={`group ${isActive("/") ? "text-brand-dpr-orange" : ""}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className={isActive("/") ? "" : "invisible group-hover:visible"}>[</span>home<span className={isActive("/") ? "" : "invisible group-hover:visible"}>]</span>
                    </Link>
                    <Link
                        href="/archive"
                        className={`group ${isActive("/archive") ? "text-brand-dpr-orange" : ""}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className={isActive("/archive") ? "" : "invisible group-hover:visible"}>[</span>archive<span className={isActive("/archive") ? "" : "invisible group-hover:visible"}>]</span>
                    </Link>
                    <Link
                        href="/about"
                        className={`group ${isActive("/about") ? "text-brand-dpr-orange" : ""}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className={isActive("/about") ? "" : "invisible group-hover:visible"}>[</span>about<span className={isActive("/about") ? "" : "invisible group-hover:visible"}>]</span>
                    </Link>
                    <Link
                        href="/schedule"
                        className={`group ${isActive("/schedule") ? "text-brand-dpr-orange" : ""}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className={isActive("/schedule") ? "" : "invisible group-hover:visible"}>[</span>schedule<span className={isActive("/schedule") ? "" : "invisible group-hover:visible"}>]</span>
                    </Link>
                    <a
                        href="https://vmgkdp-0h.myshopify.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <span className="invisible group-hover:visible">[</span>shop<span className="invisible group-hover:visible">]</span>
                    </a>
                </nav>
            )}
        </header>
    )
}
