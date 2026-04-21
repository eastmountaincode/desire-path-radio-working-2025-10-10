'use client'

import { useEffect, useState } from 'react'
import DesirePathAnimation from '@/app/components/home/HomeHero/DesirePathAnimation'
import MarkdownContent from '@/app/components/MarkdownContent/MarkdownContent'
import { useDevMode } from '@/app/components/DevModeProvider'

export default function About() {
  const devMode = useDevMode()
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAboutText() {
      try {
        const response = await fetch('/api/about')
        if (response.ok) {
          const data = await response.json()
          setText(data.text || '')
        } else {
          setText('')
        }
      } catch (error) {
        console.error('Failed to fetch about text:', error)
        setText('')
      }
    }

    fetchAboutText()
  }, [])

  return (
    <div className={`min-h-screen mb-8 ${devMode ? 'border-2 border-green-500' : ''}`}>
      <div className={`mb-8 ${devMode ? 'border border-blue-500' : ''}`}>
        <DesirePathAnimation size="compact" />
      </div>

      <div className={`max-w-4xl mx-auto ${devMode ? 'border border-purple-500' : ''}`}>
        {text !== null && <MarkdownContent text={text} />}
      </div>
    </div>
  )
}
