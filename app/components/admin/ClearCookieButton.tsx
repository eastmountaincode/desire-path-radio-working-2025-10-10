"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ClearCookieButton() {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleClearCookie = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.refresh()
  }

  return (
    <div className="border p-4 rounded">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xl mb-4 w-full text-left hover:opacity-70 transition-opacity"
      >
        <span className="text-sm">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span>Admin Authentication</span>
      </button>

      {isExpanded && (
        <button
          onClick={handleClearCookie}
          className="px-4 py-2 dpr-button"
        >
          clear auth cookie (test)
        </button>
      )}
    </div>
  )
}

