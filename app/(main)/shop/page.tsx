'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import DesirePathAnimation from '@/app/components/home/HomeHero/DesirePathAnimation'
import { useDevMode } from '@/app/components/DevModeProvider'
import ShopDescription from '@/app/components/ShopDescription/ShopDescription'
import type { PublicShopItem } from '@/lib/shop'

const galleryArrowClass = 'grid size-11 place-items-center border border-current/45 text-lg leading-none touch-manipulation hover:border-current/70 hover:bg-current/5 focus-visible:outline-2 focus-visible:outline-offset-2 active:bg-current/10 sm:pointer-fine:size-8 sm:pointer-fine:text-base'

function ShopPhotos({ item, label }: { item: PublicShopItem; label: string }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const photos = [item.image_url, ...(item.gallery_image_urls ?? [])]
  const hasGallery = photos.length > 1
  const showingExtra = photoIndex > 0
  const mainPhotoElement = useRef<HTMLImageElement>(null)
  const controls = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const photo = mainPhotoElement.current
    const row = controls.current
    if (!hasGallery || !photo || !row) return

    const alignControls = () => {
      if (!photo.naturalHeight) return
      const { width, height } = photo.getBoundingClientRect()
      // A centered, contained photo can leave equal space on either side of its image box.
      const visibleWidth = Math.min(width, height * photo.naturalWidth / photo.naturalHeight)
      row.style.paddingInlineEnd = `${(width - visibleWidth) / 2}px`
    }

    alignControls()
    const observer = new ResizeObserver(alignControls)
    observer.observe(photo)
    photo.addEventListener('load', alignControls)
    return () => {
      observer.disconnect()
      photo.removeEventListener('load', alignControls)
    }
  }, [hasGallery])

  // Keep the main photo in the layout so its proportions set the frame height.
  const mainPhoto = (
    <Image ref={mainPhotoElement} unoptimized src={item.image_url} alt={label} width={800} height={800}
      aria-hidden={showingExtra || undefined} className={`w-full h-auto max-h-[min(56svh,34rem)] object-contain${showingExtra ? ' invisible' : ''}`} />
  )
  if (!hasGallery) return mainPhoto

  return (
    <div role="group" aria-label={`${label} photos`} className="w-full">
      <div className="relative">
        {mainPhoto}
        {showingExtra && <Image fill unoptimized src={photos[photoIndex]} alt={label} className="object-contain" />}
      </div>
      <div ref={controls} className="flex justify-end gap-2 pt-2">
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
