'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import DesirePathAnimation from '@/app/components/home/HomeHero/DesirePathAnimation'
import type { ShopItem } from '@/lib/shop'

export default function Shop() {
  const [items, setItems] = useState<ShopItem[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/shop', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Unable to load shop')
        return response.json()
      })
      .then(data => { if (active) setItems(data.items) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  return (
    <div className="min-h-screen mb-8">
      <div className="mb-8"><DesirePathAnimation size="compact" /></div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 font-[family-name:var(--font-monument-wide)]">[shop]</h1>
        {error && <p role="alert">Unable to load shop. Please try again.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map(item => (
            <figure key={item.id}>
              <Image unoptimized src={item.image_url} alt={item.title || item.description.split('\n')[0].slice(0, 200) || 'DPR merchandise'}
                width={800} height={800} className="w-full h-auto" />
              <figcaption className="mt-4 break-words">
                {item.title && <h2 className="font-semibold mb-2">{item.title}</h2>}
                <p className="whitespace-pre-wrap">{item.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
