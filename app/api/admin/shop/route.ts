import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createServerSupabase } from '@/lib/supabase'
import { MAX_SHOP_IMAGE_BYTES, shopImageError, type ShopItem } from '@/lib/shop'

async function isAdmin() {
  return (await cookies()).get('admin_authenticated')?.value === 'true'
}

function parseId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('merch_items').select('*').is('deleted_at', null).order('id')
    if (error) throw error
    return NextResponse.json({ items: data || [] })
  } catch {
    return NextResponse.json({ error: 'Unable to load shop items.' }, { status: 500 })
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
    const values = {
      title: title === null ? previous?.title || '' : title.trim(),
      description: text.trim(),
      image_url: previous?.image_url || '',
      image_key: previous?.image_key || '',
    }
    if (image) {
      const { R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_ACCESS_KEY, R2_IMAGES_BUCKET_NAME, MEDIA_PROXY_IMAGE_URL } = process.env
      if (!R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET_ACCESS_KEY || !R2_IMAGES_BUCKET_NAME || !MEDIA_PROXY_IMAGE_URL) {
        return NextResponse.json({ error: 'Image storage is not configured.' }, { status: 503 })
      }
      const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[image.type]!
      const key = `merch-${randomUUID()}.${extension}`
      const r2 = new S3Client({
        region: 'auto', endpoint: R2_ENDPOINT,
        credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_ACCESS_KEY },
      })
      await r2.send(new PutObjectCommand({
        Bucket: R2_IMAGES_BUCKET_NAME, Key: key, ContentType: image.type,
        Body: Buffer.from(await image.arrayBuffer()),
      }))
      values.image_key = key
      values.image_url = `${MEDIA_PROXY_IMAGE_URL.replace(/\/$/, '')}/${key}`
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
