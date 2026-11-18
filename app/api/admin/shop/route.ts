import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createServerSupabase } from '@/lib/supabase'
import { MAX_SHOP_IMAGE_BYTES, MAX_SHOP_INTRO_LENGTH, shopImageError, type ShopItem } from '@/lib/shop'
import { readShopIntro } from '@/lib/shop-settings'

const imageExtensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }
const shopImageKey = /^merch-[0-9a-f-]{36}\.(jpg|png|webp|gif)$/

async function isAdmin() {
  return (await cookies()).get('admin_authenticated')?.value === 'true'
}

function parseId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

function imageBase() {
  return process.env.MEDIA_PROXY_IMAGE_URL?.replace(/\/$/, '')
}

async function uploadPhoto(image: File) {
  const { R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_ACCESS_KEY, R2_IMAGES_BUCKET_NAME } = process.env
  const base = imageBase()
  if (!R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET_ACCESS_KEY || !R2_IMAGES_BUCKET_NAME || !base) return null

  const key = `merch-${randomUUID()}.${imageExtensions[image.type]}`
  const r2 = new S3Client({
    region: 'auto', endpoint: R2_ENDPOINT,
    credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_ACCESS_KEY },
  })
  await r2.send(new PutObjectCommand({
    Bucket: R2_IMAGES_BUCKET_NAME, Key: key, ContentType: image.type,
    Body: Buffer.from(await image.arrayBuffer()),
  }))
  return { image_key: key, image_url: `${base}/${key}` }
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const supabase = await createServerSupabase()
    const [{ data, error }, intro] = await Promise.all([
      supabase.from('merch_items').select('*').is('deleted_at', null).order('id'),
      readShopIntro(supabase),
    ])
    if (error) throw error
    return NextResponse.json({ items: data || [], intro })
  } catch {
    return NextResponse.json({ error: 'Unable to load shop items.' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (typeof body?.intro !== 'string' || body.intro.trim().length > MAX_SHOP_INTRO_LENGTH) {
    return NextResponse.json({ error: `Keep the shop intro to ${MAX_SHOP_INTRO_LENGTH} characters or fewer.` }, { status: 400 })
  }
  const intro = body.intro.trim()
  try {
    const supabase = await createServerSupabase()
    const { error } = await supabase.from('shop_settings')
      // @ts-expect-error - Existing Database schema lacks Supabase relationship inference.
      .upsert({ id: 1, intro })
    if (error) throw error
    return NextResponse.json({ intro })
  } catch {
    return NextResponse.json({ error: 'Unable to save the shop intro. Please try again.' }, { status: 500 })
  }
}

// One upload per request keeps each file within the existing hosting limit.
export async function PUT(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (Number(request.headers.get('content-length')) > MAX_SHOP_IMAGE_BYTES + 65536) {
    return NextResponse.json({ error: 'Choose an image smaller than 4 MB.' }, { status: 413 })
  }
  const form = await request.formData().catch(() => null)
  const image = form?.get('image')
  if (!(image instanceof File)) return NextResponse.json({ error: 'Choose an image.' }, { status: 400 })
  const error = shopImageError(image)
  if (error) return NextResponse.json({ error }, { status: 400 })
  try {
    const photo = await uploadPhoto(image)
    if (!photo) return NextResponse.json({ error: 'Image storage is not configured.' }, { status: 503 })
    return NextResponse.json({ url: photo.image_url })
  } catch {
    return NextResponse.json({ error: 'Unable to upload this photo. Please try again.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (Number(request.headers.get('content-length')) > MAX_SHOP_IMAGE_BYTES + 65536) {
    return NextResponse.json({ error: 'Choose an image smaller than 4 MB.' }, { status: 413 })
  }
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }
  const rawId = form.get('id')
  const id = rawId === null ? null : parseId(rawId)
  if (rawId !== null && id === null) return NextResponse.json({ error: 'Invalid item.' }, { status: 400 })
  const title = form.get('title')
  if (title !== null && (typeof title !== 'string' || title.trim().length > 200)) {
    return NextResponse.json({ error: 'Keep the title to 200 characters or fewer.' }, { status: 400 })
  }
  const text = form.get('description')
  if (typeof text !== 'string' || !text.trim() || text.trim().length > 10000) {
    return NextResponse.json({ error: 'Add a description of up to 10,000 characters.' }, { status: 400 })
  }
  const image = form.get('image')
  if (image !== null && !(image instanceof File)) return NextResponse.json({ error: 'Invalid image.' }, { status: 400 })
  if (!id && !image) return NextResponse.json({ error: 'Choose an image.' }, { status: 400 })
  if (image) {
    const error = shopImageError(image)
    if (error) return NextResponse.json({ error }, { status: 400 })
  }

  try {
    const supabase = await createServerSupabase()
    let previous: ShopItem | null = null
    if (id) {
      const { data, error } = await supabase.from('merch_items').select('*').eq('id', id).is('deleted_at', null).maybeSingle()
      if (error) throw error
      previous = data as ShopItem | null
      if (!previous) return NextResponse.json({ error: 'Item not found.' }, { status: 404 })
    }
    const values: Pick<ShopItem, 'title' | 'description' | 'image_url' | 'image_key'> & { gallery_image_urls?: string[] } = {
      title: title === null ? previous?.title || '' : title.trim(),
      description: text.trim(),
      image_url: previous?.image_url || '',
      image_key: previous?.image_key || '',
    }
    if (form.has('update_gallery')) {
      const urls = form.getAll('gallery_image_url')
      const base = imageBase()
      const isShopPhoto = (url: FormDataEntryValue): url is string => typeof url === 'string' && (
        previous?.gallery_image_urls?.includes(url) ||
        (!!base && url.startsWith(`${base}/`) && shopImageKey.test(url.slice(base.length + 1)))
      )
      if (!urls.every(isShopPhoto)) return NextResponse.json({ error: 'Invalid gallery photo.' }, { status: 400 })
      values.gallery_image_urls = [...new Set(urls)]
    }
    if (image) {
      const photo = await uploadPhoto(image)
      if (!photo) return NextResponse.json({ error: 'Image storage is not configured.' }, { status: 503 })
      Object.assign(values, photo)
    }
    const query = id
      // @ts-expect-error - Existing Database schema lacks Supabase relationship inference.
      ? supabase.from('merch_items').update(values).eq('id', id).is('deleted_at', null)
      // @ts-expect-error - Existing Database schema lacks Supabase relationship inference.
      : supabase.from('merch_items').insert(values)
    const { data, error } = await query.select('*').single()
    if (error) throw error
    return NextResponse.json({ item: data })
  } catch {
    return NextResponse.json({ error: 'Unable to save this item. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const id = parseId(new URL(request.url).searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Invalid item.' }, { status: 400 })
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('merch_items')
      // @ts-expect-error - Existing Database schema lacks Supabase relationship inference.
      .update({ deleted_at: new Date().toISOString() }).eq('id', id).is('deleted_at', null).select('id').maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Item not found.' }, { status: 404 })
    // Keep the row and its image so removal remains recoverable.
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to remove this item.' }, { status: 500 })
  }
}
