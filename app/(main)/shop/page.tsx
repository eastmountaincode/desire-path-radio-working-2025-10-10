'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import DesirePathAnimation from '@/app/components/home/HomeHero/DesirePathAnimation'
import { useDevMode } from '@/app/components/DevModeProvider'
import ShopDescription from '@/app/components/ShopDescription/ShopDescription'
import type { PublicShopItem } from '@/lib/shop'

export default function Shop() {
  const devMode = useDevMode()
  const [items, setItems] = useState<PublicShopItem[]>([])
  const [intro, setIntro] = useState('')
  const [error, setError] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const [gallery, setGallery] = useState<{ photos: string[]; label: string } | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)

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
            const image = <Image unoptimized src={item.image_url} alt={label} width={800} height={800} className="w-full h-auto object-contain" />
            const extraPhotos = item.gallery_image_urls ?? []
            return (
              <figure key={item.id} className={`row-span-3 grid grid-rows-subgrid gap-y-2 pb-4 last:pb-0 md:[&:nth-last-child(2):nth-child(odd)]:pb-0 ${devMode ? 'outline outline-green-500' : ''}`}>
                <div className={`flex items-end w-full mb-2 ${devMode ? 'outline outline-red-500' : ''}`}>
                  {extraPhotos.length ? (
                    <button type="button" aria-label={`View photos of ${label}`} aria-haspopup="dialog"
                      className="relative w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-4"
                      onClick={() => {
                        setPhotoIndex(0)
                        setGallery({ photos: [item.image_url, ...extraPhotos], label })
                        dialog.current?.showModal()
                      }}>
                      {image}
                      <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs text-white">View photos</span>
                    </button>
                  ) : image}
                </div>
                <figcaption className="row-span-2 grid grid-rows-subgrid gap-y-2 break-words">
                  <div>{item.title && <h2 className={`font-[family-name:var(--font-monument-wide)] text-[17px] md:text-[20px] leading-[1.2] tracking-[0em] font-normal ${devMode ? 'outline outline-yellow-500' : ''}`}>{item.title}</h2>}</div>
                  <div className={devMode ? 'outline outline-orange-500' : ''}><ShopDescription text={item.description} /></div>
                </figcaption>
              </figure>
            )
          })}
        </div>
        <dialog ref={dialog} aria-label="Merch photos" onClose={() => setGallery(null)}
          className="m-auto w-[min(92vw,56rem)] p-3 text-white bg-neutral-950 overscroll-contain backdrop:bg-black/75 backdrop:overflow-hidden backdrop:overscroll-contain">
          <form method="dialog" className="flex justify-end">
            <button autoFocus type="submit" className="px-3 py-2 hover:underline">Close</button>
          </form>
          {gallery && (
            <>
              <Image unoptimized src={gallery.photos[photoIndex]} alt={gallery.label} width={1000} height={1000}
                className="w-full h-[min(66dvh,42rem)] object-contain" />
              <div className="flex items-center justify-between gap-2 pt-2 text-sm">
                <button type="button" className="px-3 py-2 hover:underline"
                  onClick={() => setPhotoIndex(index => (index + gallery.photos.length - 1) % gallery.photos.length)}>Previous</button>
                <span aria-live="polite">{photoIndex + 1} / {gallery.photos.length}</span>
                <button type="button" className="px-3 py-2 hover:underline"
                  onClick={() => setPhotoIndex(index => (index + 1) % gallery.photos.length)}>Next</button>
              </div>
            </>
          )}
        </dialog>
      </div>
    </div>
  )
}
