"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "../../ThemeToggle"
import { useDevMode } from "../../DevModeProvider"
import { useState } from "react"

import "./admin-header-style.css"

export default function AdminHeader() {
  const pathname = usePathname()
  const devMode = useDevMode()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname.startsWith("/admin")
    }
    return pathname === path
  }
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-6 ${devMode ? 'border border-blue-500' : ''}`}>
      <div className="flex items-center justify-between h-12">
        <div className="flex items-center gap-12">
          <div className="font-mono">
            desire path radio
          </div>
          
          {/* Desktop nav */}
          <nav className="hidden md:flex gap-3">
            <Link 
              href="/" 
              className={`group ${isActive("/") ? "text-brand-dpr-orange" : ""}`}
            >
              {isActive("/") ? (
                <>[&larr; go home]</>
              ) : (
                <><span className="invisible group-hover:visible">[</span>&larr; go home<span className="invisible group-hover:visible">]</span></>
              )}
            </Link>
            <Link
              href="/admin"
              className={`group ${isActive("/admin") ? "text-brand-dpr-orange" : ""}`}
            >
              {isActive("/admin") ? (
                <>[admin]</>
              ) : (
                <><span className="invisible group-hover:visible">[</span>admin<span className="invisible group-hover:visible">]</span></>
              )}
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {/* Hamburger menu button - mobile only */}
          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-[25px] h-3 relative flex flex-col justify-between">
              <span className={`h-0.5 w-full bg-current transition-transform origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-[5px]' : ''}`}></span>
              <span className={`h-0.5 w-full bg-current transition-transform origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <nav className={`md:hidden pb-4 flex flex-col gap-3 ${devMode ? 'border border-red-500' : ''}`}>
          <Link 
            href="/" 
            className={`group ${isActive("/") ? "text-brand-dpr-orange" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className={isActive("/") ? "" : "invisible group-hover:visible"}>[</span>&larr; go home<span className={isActive("/") ? "" : "invisible group-hover:visible"}>]</span>
          </Link>
          <Link 
            href="/admin" 
            className={`group ${isActive("/admin") ? "text-brand-dpr-orange" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className={isActive("/admin") ? "" : "invisible group-hover:visible"}>[</span>admin<span className={isActive("/admin") ? "" : "invisible group-hover:visible"}>]</span>
          </Link>
        </nav>
      )}
    </header>
  )
}
