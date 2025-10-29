'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useDevMode } from '@/app/components/DevModeProvider'

export default function Schedule() {
  const devMode = useDevMode()
  const [scheduleImage, setScheduleImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/schedule')

      if (!response.ok) {
        throw new Error('Failed to fetch schedule')
      }

      const result = await response.json()

      if (result.data?.image_url) {
        setScheduleImage(result.data.image_url)
      } else {
        setError('No schedule available')
      }
    } catch (err) {
      console.error('Error fetching schedule:', err)
      setError('Failed to load schedule')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${devMode ? 'border border-purple-500' : ''}`}>
      <h1 className={`text-3xl mb-6 font-[family-name:var(--font-monument-wide)] ${devMode ? 'border border-blue-500' : ''}`}>Schedule</h1>

      {isLoading && (
        <div className={devMode ? 'border border-yellow-500' : ''}>Loading schedule...</div>
      )}

      {error && !isLoading && (
        <div className={`p-4 border border-current ${devMode ? 'border-red-500' : ''}`}>
          {error}
        </div>
      )}

      {scheduleImage && !isLoading && (
        <div className={devMode ? 'border border-green-500' : ''}>
          <div className={`relative w-full ${devMode ? 'border border-cyan-500' : ''}`} style={{ aspectRatio: '16/9' }}>
            <Image
              src={scheduleImage}
              alt="Radio schedule"
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}

