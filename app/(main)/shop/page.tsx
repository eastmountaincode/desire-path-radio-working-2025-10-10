'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import DesirePathAnimation from '@/app/components/home/HomeHero/DesirePathAnimation'
import { useDevMode } from '@/app/components/DevModeProvider'
import ShopDescription from '@/app/components/ShopDescription/ShopDescription'
import type { PublicShopItem } from '@/lib/shop'

const galleryArrowClass = 'grid size-8 place-items-center text-base leading-none touch-manipulation opacity-60 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2 active:opacity-80'

function ShopPhotos({ item, label }: { item: PublicShopItem; label: string }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const photos = [item.image_url, ...(item.gallery_image_urls ?? [])]
  const showingExtra = photoIndex > 0
  // Keep the main photo in the layout so its proportions set the frame height.
  const mainPhoto = (
    <Image unoptimized src={item.image_url} alt={label} width={800} height={800}
      aria-hidden={showingExtra || undefined} className={`w-full h-auto object-contain${showingExtra ? ' invisible' : ''}`} />
  )
  if (photos.length === 1) return mainPhoto

  return (
    <div role="group" aria-label={`${label} photos`} className="w-full">
      <div className="relative">
        {mainPhoto}
        {showingExtra && <Image fill unoptimized src={photos[photoIndex]} alt={label} className="object-contain" />}
      </div>
      <div className="flex justify-end">
        <button type="button" aria-label="Previous photo" className={galleryArrowClass}
          onClick={() => setPhotoIndex(index => (index + photos.length - 1) % photos.length)}>
          <i aria-hidden="true" className="fi fi-ts-arrow-small-left translate-y-px" />
        </button>
        <button type="button" aria-label="Next photo" className={galleryArrowClass}
          onClick={() => setPhotoIndex(index => (index + 1) % photos.length)}>
          <i aria-hidden="true" className="fi fi-ts-arrow-small-right translate-y-px" />
        </button>
      </div>
      <span aria-live="polite" className="sr-only">Photo {photoIndex + 1} of {photos.length}</span>
    </div>
  )
}

export default function Shop() {
  const devMode = useDevMode()
  const [items, setItems] = useState<PublicShopItem[]>([])
  const [intro, setIntro] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/shop', { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Unable to load shop')
        return response.json()
      })
      .then(data => {
        if (!active) return
        setItems(data.items)
        setIntro(data.intro ?? '')
      })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  return (
    <div className="min-h-screen mb-8">
      <div className="mb-8"><DesirePathAnimation size="compact" /></div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 font-[family-name:var(--font-monument-wide)]">[shop]</h1>
        {intro && <div className="max-w-prose mb-6"><ShopDescription text={intro} /></div>}
        {error && <p role="alert">Unable to load shop. Please try again.</p>}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 ${devMode ? 'outline outline-blue-500' : ''}`}>
          {items.map(item => {
            const label = item.title || item.description.split('\n')[0].slice(0, 200) || 'DPR merchandise'
            return (
              <figure key={item.id} className={`row-span-3 grid grid-rows-subgrid gap-y-2 pb-4 last:pb-0 md:[&:nth-last-child(2):nth-child(odd)]:pb-0 ${devMode ? 'outline outline-green-500' : ''}`}>
                <div className={`flex items-end w-full mb-2 ${devMode ? 'outline outline-red-500' : ''}`}>
                  <ShopPhotos item={item} label={label} />
                </div>
                <figcaption className="row-span-2 grid grid-rows-subgrid gap-y-2 break-words">
                  <div>{item.title && <h2 className={`font-[family-name:var(--font-monument-wide)] text-[17px] md:text-[20px] leading-[1.2] tracking-[0em] font-normal ${devMode ? 'outline outline-yellow-500' : ''}`}>{item.title}</h2>}</div>
                  <div className={devMode ? 'outline outline-orange-500' : ''}><ShopDescription text={item.description} /></div>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </div>
  )
}
