'use client'

import ShopDescription from '@/app/components/ShopDescription/ShopDescription'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MAX_SHOP_INTRO_LENGTH, shopImageError } from '@/lib/shop'
import type { ShopItem } from '@/lib/shop'

const buttonClass = 'px-4 py-2 border border-current hover:text-brand-dpr-orange disabled:opacity-50 disabled:cursor-not-allowed'
const fileClass = 'block max-w-full text-sm file:mr-4 file:border file:border-current file:bg-transparent file:px-4 file:py-2 file:text-current file:cursor-pointer hover:file:text-brand-dpr-orange disabled:opacity-50'
const imageTypes = 'image/jpeg,image/png,image/webp,image/gif'

export default function AdminShopPage() {
  const router = useRouter()
  const [items, setItems] = useState<ShopItem[]>([])
  const [intro, setIntro] = useState('')
  const [savedIntro, setSavedIntro] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ShopItem | 'new' | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [gallery, setGallery] = useState<(string | File)[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<number | null>(null)
  const lock = useRef(false)

  useEffect(() => {
    let active = true
    fetch('/api/admin/shop', { cache: 'no-store' })
      .then(async response => {
        if (response.status === 401) { router.push('/admin'); return null }
        if (!response.ok) throw new Error('Unable to load shop.')
        return response.json()
      })
      .then(data => {
        if (!active || !data) return
        setItems(data.items)
        setIntro(data.intro ?? '')
        setSavedIntro(data.intro ?? '')
      })
      .catch(() => { if (active) setError('Unable to load shop. Please reload to try again.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [router])

  useEffect(() => {
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function edit(item: ShopItem | 'new') {
    setEditing(item)
    setTitle(item === 'new' ? '' : item.title || '')
    setDescription(item === 'new' ? '' : item.description)
    setFile(null)
    setGallery(item === 'new' ? [] : item.gallery_image_urls ?? [])
    setError(null)
    setRemoving(null)
  }

  function close() {
    setEditing(null)
    setTitle('')
    setDescription('')
    setFile(null)
    setGallery([])
    setError(null)
  }

  async function saveIntro(event: React.FormEvent) {
    event.preventDefault()
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/shop', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ intro }),
      })
      if (response.status === 401) throw new Error('Your session expired. Sign in again before saving.')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save the shop intro.')
      setIntro(result.intro)
      setSavedIntro(result.intro)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save the shop intro.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (lock.current || !editing) return
    if (editing === 'new' && !file) { setError('Choose an image.'); return }
    lock.current = true
    setBusy(true)
    setError(null)
    try {
      const form = new FormData()
      form.set('title', title)
      form.set('description', description)
      if (editing !== 'new') form.set('id', String(editing.id))
      if (file) form.set('image', file)
      if (editing === 'new' ? gallery.length > 0 : gallery !== editing.gallery_image_urls) {
        form.set('update_gallery', 'true')
        const photos = [...gallery]
        for (const [index, photo] of photos.entries()) {
          if (typeof photo === 'string') {
            form.append('gallery_image_url', photo)
            continue
          }
          const upload = new FormData()
          upload.set('image', photo)
          const uploaded = await fetch('/api/admin/shop', { method: 'PUT', body: upload })
          if (uploaded.status === 401) throw new Error('Your session expired. Sign in again before saving.')
          const result = await uploaded.json()
          if (!uploaded.ok) throw new Error(result.error || 'Unable to upload this photo.')
          photos[index] = result.url
          setGallery([...photos])
          form.append('gallery_image_url', result.url)
        }
      }
      const response = await fetch('/api/admin/shop', { method: 'POST', body: form })
      if (response.status === 401) throw new Error('Your session expired. Sign in again before saving.')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save item.')
      setItems(current => editing === 'new' ? [...current, result.item] : current.map(item => item.id === result.item.id ? result.item : item))
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save item.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  async function remove(id: number) {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/shop?id=${id}`, { method: 'DELETE' })
      if (response.status === 401) throw new Error('Your session expired. Sign in again before removing the item.')
      if (!response.ok) throw new Error('Unable to remove item.')
      setItems(current => current.filter(item => item.id !== id))
      setRemoving(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove item.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  const imageUrl = preview || (editing && editing !== 'new' ? editing.image_url : null)

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl mb-6">Shop</h1>
      {error && <p role="alert" className="mb-4">{error}</p>}
      {loading ? <p>Loading...</p> : editing ? (
        <form onSubmit={save} className="space-y-4">
          {imageUrl && <Image src={imageUrl} alt="Selected merchandise" width={400} height={400} unoptimized className="w-full max-w-sm h-auto" />}
          <label className="block">
            <span className="block mb-2">Main photo</span>
            <input type="file" accept={imageTypes} disabled={busy} className={fileClass}
              onChange={event => {
                const selected = event.target.files?.[0]
                if (!selected) return
                const message = shopImageError(selected)
                if (message) { setError(message); event.target.value = ''; return }
                setFile(selected)
                setError(null)
              }} />
          </label>
          <label className="block">
            <span className="block mb-2">Additional photos</span>
            <input type="file" accept={imageTypes} multiple disabled={busy} className={fileClass}
              onChange={event => {
                const selected = Array.from(event.target.files ?? [])
                event.target.value = ''
                const message = selected.map(shopImageError).find(Boolean)
                if (message) { setError(message); return }
                setGallery(current => [...current, ...selected])
                setError(null)
              }} />
          </label>
          {gallery.length > 0 && (
            <ul className="flex flex-wrap gap-3">
              {gallery.map((photo, index) => (
                <li key={index} className="flex max-w-48 flex-col items-start gap-1 text-sm">
                  {typeof photo === 'string' ? (
                    <Image unoptimized src={photo} alt={`Additional photo ${index + 1}`} width={96} height={96}
                      className="h-24 w-24 object-contain" />
                  ) : <span className="break-all">{photo.name}</span>}
                  <button type="button" disabled={busy} aria-label={`Remove additional photo ${index + 1}`}
                    className="min-h-6 underline disabled:opacity-50"
                    onClick={() => setGallery(current => current.filter((_, position) => position !== index))}>Remove photo</button>
                </li>
              ))}
            </ul>
          )}
          <label className="block">
            <span className="block mb-2">Title</span>
            <input type="text" value={title} onChange={event => setTitle(event.target.value)} disabled={busy}
              maxLength={200} className="w-full border border-current p-3 bg-transparent" />
          </label>
          <label className="block">
            <span className="block mb-2">Description</span>
            <textarea value={description} onChange={event => setDescription(event.target.value)} disabled={busy}
              placeholder="Links: [link text](https://example.com)" required maxLength={10000} rows={6} className="w-full border border-current p-3 bg-transparent" />
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className={buttonClass}>{busy ? 'Saving...' : 'Save'}</button>
            <button type="button" disabled={busy} onClick={close} className={buttonClass}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <form onSubmit={saveIntro} className="mb-6 space-y-2">
            <label className="block">
              <span className="block mb-2">Shop intro</span>
              <textarea value={intro} onChange={event => setIntro(event.target.value)} disabled={busy}
                rows={3} maxLength={MAX_SHOP_INTRO_LENGTH} className="block w-full border border-current p-3 bg-transparent" />
            </label>
            <button type="submit" disabled={busy || intro.trim() === savedIntro} className={buttonClass}>Save intro</button>
          </form>
          <button onClick={() => edit('new')} disabled={busy} className={`${buttonClass} mb-6`}>Add item</button>
          <div className="space-y-8">
            {items.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4">
                <Image unoptimized src={item.image_url} alt={item.title || item.description.split('\n')[0].slice(0, 200) || 'DPR merchandise'}
                  width={160} height={160} className="w-40 h-auto object-contain self-start" />
                <div className="min-w-0 flex-1">
                  {item.title && <h2 className="font-semibold break-words mb-2">{item.title}</h2>}
                  <div className="mb-4"><ShopDescription text={item.description} /></div>
                  {removing === item.id ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span>Remove this item?</span>
                      <button disabled={busy} onClick={() => remove(item.id)} className={buttonClass}>Remove</button>
                      <button disabled={busy} onClick={() => setRemoving(null)} className={buttonClass}>Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button disabled={busy} onClick={() => edit(item)} className={buttonClass}>Edit</button>
                      <button disabled={busy} onClick={() => setRemoving(item.id)} className={buttonClass}>Remove</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
