"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDevMode } from "../DevModeProvider"

export default function AdminLoginForm() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const devMode = useDevMode()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Refresh the page to show authenticated content
        router.refresh()
      } else {
        setError(data.error || "Invalid password")
        setPassword("")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex justify-center px-6 py-8 ${devMode ? 'border border-red-500' : ''}`}>
      <div className="w-full max-w-md">
        <h1 className="text-2xl mb-8">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-current bg-transparent"
              disabled={loading}
              autoFocus
            />
          </div>
          {error && (
            <p className="text-brand-dpr-orange">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full px-4 py-2 border border-current hover:bg-grey6 hover:text-grey1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}

