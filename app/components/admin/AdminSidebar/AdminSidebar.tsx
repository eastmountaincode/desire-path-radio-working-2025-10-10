"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useDevMode } from "../../DevModeProvider"
import "./admin-sidebar-styles.css"

const navItems = [
    { href: "/admin/dashboard", label: "dashboard", icon: "◆" },
    { href: "/admin/upload", label: "upload", icon: "↑" },
    { href: "/admin/analytics", label: "analytics", icon: "⌗" },
    { href: "/admin/archive", label: "archive", icon: "๏" },
    { href: "/admin/coming-up", label: "coming up", icon: "಄" },
    { href: "/admin/schedule", label: "schedule", icon: "◷" },
    { href: "/admin/settings", label: "settings", icon: "⚙" },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const devMode = useDevMode()

    return (
        <aside
            className={`
        w-18 md:w-42
        border-r border-current
        flex flex-col items-center
        ${devMode ? 'border-2 border-red-500' : ''}
      `}
        >
            <nav className="p-2">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`
                                            flex items-center justify-center md:justify-start
                                            h-10 w-10 md:w-auto md:px-4
                                            admin-sidebar-link
                                            border border-current
                                            ${isActive ? 'active-admin-sidebar-link' : ''}
                                        `}
                                        title={item.label}
                                    >
                                    <span className="text-xl h-8">{item.icon}</span>
                                    <span className="hidden md:inline md:ml-3">{item.label}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </aside>
    )
}

