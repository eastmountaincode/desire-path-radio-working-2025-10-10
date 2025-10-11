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
      className="px-4 py-2 border border-current hover:bg-grey6 hover:text-grey1 hover:border-color-grey6"
    >
      clear auth cookie (test)
    </button>
  )
}

