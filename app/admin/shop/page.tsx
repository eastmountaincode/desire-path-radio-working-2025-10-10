'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { shopImageError } from '@/lib/shop'
import type { ShopItem } from '@/lib/shop'

const buttonClass = 'px-4 py-2 border border-current hover:text-brand-dpr-orange disabled:opacity-50 disabled:cursor-not-allowed'

export default function AdminShopPage() {
  const router = useRouter()
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ShopItem | 'new' | null>(null)
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
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
      .then(data => { if (active && data) setItems(data.items) })
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
    setDescription(item === 'new' ? '' : item.description)
    setFile(null)
    setError(null)
    setRemoving(null)
  }

  function close() {
    setEditing(null)
    setDescription('')
    setFile(null)
    setError(null)
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
      form.set('description', description)
      if (editing !== 'new') form.set('id', String(editing.id))
      if (file) form.set('image', file)
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
            <span className="block mb-2">Photo</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy}
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
            <span className="block mb-2">Description</span>
            <textarea value={description} onChange={event => setDescription(event.target.value)} disabled={busy}
              required maxLength={10000} rows={6} className="w-full border border-current p-3 bg-transparent" />
          </label>
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className={buttonClass}>{busy ? 'Saving...' : 'Save'}</button>
            <button type="button" disabled={busy} onClick={close} className={buttonClass}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <button onClick={() => edit('new')} disabled={busy} className={`${buttonClass} mb-6`}>Add item</button>
          <div className="space-y-8">
            {items.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4">
                <Image src={item.image_url} alt={item.description.split('\n')[0].slice(0, 200) || 'DPR merchandise'}
                  width={160} height={160} className="w-40 h-auto object-contain self-start" />
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap break-words mb-4">{item.description}</p>
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
