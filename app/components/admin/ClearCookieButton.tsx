"use client"

import { useRouter } from "next/navigation"

export default function ClearCookieButton() {
  const router = useRouter()

  const handleClearCookie = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.refresh()
  }

  return (
    <button
      onClick={handleClearCookie}
      className="px-4 py-2 dpr-button"
    >
      clear auth cookie (test)
    </button>
  )
}

