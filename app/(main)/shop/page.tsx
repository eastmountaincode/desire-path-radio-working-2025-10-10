'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import DesirePathAnimation from '@/app/components/home/HomeHero/DesirePathAnimation'
import { useDevMode } from '@/app/components/DevModeProvider'
import type { ShopItem } from '@/lib/shop'

export default function Shop() {
  const devMode = useDevMode()
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
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 ${devMode ? 'outline outline-blue-500' : ''}`}>
          {items.map(item => (
            <figure key={item.id} className={`row-span-3 grid grid-rows-subgrid gap-y-2 pb-4 ${devMode ? 'outline outline-green-500' : ''}`}>
              <div className={`flex items-end w-full mb-2 ${devMode ? 'outline outline-red-500' : ''}`}>
                <Image unoptimized src={item.image_url} alt={item.title || item.description.split('\n')[0].slice(0, 200) || 'DPR merchandise'}
                  width={800} height={800} className="w-full h-auto object-contain" />
              </div>
              <figcaption className="row-span-2 grid grid-rows-subgrid gap-y-2 break-words">
                <div>{item.title && <h2 className={`font-[family-name:var(--font-monument-wide)] text-[28px] leading-[1.2] tracking-[0em] font-normal ${devMode ? 'outline outline-yellow-500' : ''}`}>{item.title}</h2>}</div>
                <p className={`whitespace-pre-wrap font-[family-name:var(--font-monument)] text-[15px] leading-[1.6] tracking-[0em] ${devMode ? 'outline outline-orange-500' : ''}`}>{item.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
