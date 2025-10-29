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
    <div className={`min-h-screen ${devMode ? 'border-2 border-green-500' : ''}`}>
      <h1 className="text-3xl mb-6 font-[family-name:var(--font-monument-wide)]">Schedule</h1>

      {isLoading && (
        <div className="">Loading schedule...</div>
      )}

      {error && !isLoading && (
        <div className="p-4 border border-current">
          {error}
        </div>
      )}

      {scheduleImage && !isLoading && (
        <div className="max-w-7xl">
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            <Image
              src={scheduleImage}
              alt="Radio schedule"
              fill
              className="object-contain"
              sizes="(max-width: 1536px) 100vw, 1536px"
              unoptimized
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}

