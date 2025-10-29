'use client'

import { useEffect, useState } from 'react'
import { useDevMode } from '../../DevModeProvider'
import './home-coming-up-styles.css'

export default function HomeComingUp() {
    const devMode = useDevMode()
    const [text, setText] = useState<string>('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchComingUpText() {
            try {
                const response = await fetch('/api/coming-up')
                if (response.ok) {
                    const data = await response.json()
                    setText(data.text || '')
                }
            } catch (error) {
                console.error('Failed to fetch coming up text:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchComingUpText()
    }, [])

    if (loading) {
        return (
            <section className={`pt-12 pb-12 ${devMode ? 'border border-red-500' : ''}`}>
                <div className={`max-w-3xl ${devMode ? 'border border-blue-500' : ''}`}>
                    <h2 className="mb-6 text-3xl font-[family-name:var(--font-monument-wide)]">Coming Up</h2>
                </div>
            </section>
        )
    }

    if (!text) {
        return null
    }

    return (
        <section className={`pt-12 pb-12 ${devMode ? 'border border-red-500' : ''}`}>
            <div className={`max-w-3xl ${devMode ? 'border border-blue-500' : ''}`}>
                <h2 className="mb-6 text-3xl font-[family-name:var(--font-monument-wide)]">Coming Up</h2>
                <p className=" whitespace-pre-wrap">
                    {text}
                </p>
            </div>
        </section>
    )
}
