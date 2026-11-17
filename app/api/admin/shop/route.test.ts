/** @jest-environment node */
import { GET, POST, DELETE } from './route'
import { GET as publicGET } from '../../shop/route'
import { MAX_SHOP_IMAGE_BYTES, shopImageError } from '@/lib/shop'

const getCookie = jest.fn()
const from = jest.fn()
const send = jest.fn()
jest.mock('next/headers', () => ({ cookies: async () => ({ get: getCookie }) }))
jest.mock('@/lib/supabase', () => ({ createServerSupabase: async () => ({ from }) }))
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send })),
  PutObjectCommand: jest.fn().mockImplementation(input => ({ input })),
}))
const originalEnv = { ...process.env }
const item = { id: 1, description: 'A shirt', image_url: 'https://images.example/old.png', image_key: 'old.png', created_at: '2026-11-17', deleted_at: null }
const result = (data: unknown, error: unknown = null) => ({ data, error })
let responses: ReturnType<typeof result>[]
let query: Record<string, jest.Mock>
function formRequest(values: { id?: string; description?: string; image?: File } = {}) {
  const form = new FormData()
  if (values.id !== undefined) form.set('id', values.id)
  if (values.description !== undefined) form.set('description', values.description)
  if (values.image) form.set('image', values.image)
  return new Request('http://localhost/api/admin/shop', { method: 'POST', body: form })
}
const image = () => new File(['test-image'], 'shirt.png', { type: 'image/png' })

beforeEach(() => {
  jest.clearAllMocks()
  getCookie.mockReturnValue({ value: 'true' })
  responses = []
  query = {}
  for (const name of ['select', 'is', 'order', 'eq', 'maybeSingle', 'single', 'update', 'insert']) {
    query[name] = jest.fn().mockImplementation(() => query)
  }
  query.then = jest.fn().mockImplementation(resolve => resolve(responses.shift() || result([])))
  from.mockReturnValue(query)
  send.mockResolvedValue({})
  process.env = { ...originalEnv, R2_ENDPOINT: 'https://r2.example', R2_ACCESS_KEY: 'test', R2_SECRET_ACCESS_KEY: 'test', R2_IMAGES_BUCKET_NAME: 'test-images', MEDIA_PROXY_IMAGE_URL: 'https://images.example/' }
})
afterAll(() => { process.env = originalEnv })

it('returns only public fields and excludes removed items in order', async () => {
  responses.push(result([{ id: 1, description: item.description, image_url: item.image_url }]))
  const response = await publicGET()
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ items: [{ id: 1, description: item.description, image_url: item.image_url }] })
  expect(query.select).toHaveBeenCalledWith('id, description, image_url')
  expect(query.is).toHaveBeenCalledWith('deleted_at', null)
  expect(query.order).toHaveBeenCalledWith('id')
})
it('returns authenticated admin items', async () => {
  responses.push(result([item]))
  expect(await (await GET()).json()).toEqual({ items: [item] })
})
it('rejects unauthenticated reads and writes without accessing storage', async () => {
  getCookie.mockReturnValue(undefined)
  expect((await GET()).status).toBe(401)
  expect((await POST(formRequest())).status).toBe(401)
  expect((await DELETE(new Request('http://localhost/api/admin/shop?id=1'))).status).toBe(401)
  expect(from).not.toHaveBeenCalled()
  expect(send).not.toHaveBeenCalled()
})
it.each(['', '0', '-1', '1.5', 'foo', '9007199254740992'])('rejects invalid item id %s', async id => {
  expect((await POST(formRequest({ id, description: 'A shirt' }))).status).toBe(400)
  expect((await DELETE(new Request(`http://localhost/api/admin/shop?id=${id}`))).status).toBe(400)
  expect(from).not.toHaveBeenCalled()
})
it.each([undefined, '', ' ', 'a'.repeat(10001)])('requires a bounded description', async description => {
  expect((await POST(formRequest({ description, image: image() }))).status).toBe(400)
  expect(send).not.toHaveBeenCalled()
})
it('requires an image for a new item', async () => {
  expect((await POST(formRequest({ description: 'A shirt' }))).status).toBe(400)
})
it.each(['text/html', 'image/svg+xml', 'application/octet-stream'])('rejects image type %s', async type => {
  expect((await POST(formRequest({ description: 'A shirt', image: new File(['x'], 'image', { type }) }))).status).toBe(400)
  expect(send).not.toHaveBeenCalled()
})
it('rejects empty and oversized images', () => {
  expect(shopImageError({ type: 'image/png', size: 0 })).not.toBeNull()
  expect(shopImageError({ type: 'image/png', size: MAX_SHOP_IMAGE_BYTES + 1 })).not.toBeNull()
  expect(shopImageError({ type: 'image/png', size: MAX_SHOP_IMAGE_BYTES })).toBeNull()
})
it('creates a new item after image upload', async () => {
  responses.push(result(item))
  const response = await POST(formRequest({ description: ' A shirt ', image: image() }))
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual({ item })
  expect(send).toHaveBeenCalledTimes(1)
  expect(query.insert).toHaveBeenCalledWith({ description: 'A shirt', image_key: expect.stringMatching(/^merch-.*\.png$/), image_url: expect.stringMatching(/^https:\/\/images.example\/merch-.*\.png$/) })
  expect(send.mock.invocationCallOrder[0]).toBeLessThan(query.insert.mock.invocationCallOrder[0])
})
it('edits description without replacing the image', async () => {
  responses.push(result(item), result({ ...item, description: 'New text' }))
  const response = await POST(formRequest({ id: '1', description: 'New text' }))
  expect(response.status).toBe(200)
  expect(send).not.toHaveBeenCalled()
  expect(query.update).toHaveBeenCalledWith({ description: 'New text', image_key: 'old.png', image_url: item.image_url })
})
it('does not upload when the item was removed or is missing', async () => {
  responses.push(result(null))
  expect((await POST(formRequest({ id: '1', description: 'New text', image: image() }))).status).toBe(404)
  expect(send).not.toHaveBeenCalled()
})
it('reports storage configuration errors without writing metadata', async () => {
  delete process.env.R2_IMAGES_BUCKET_NAME
  expect((await POST(formRequest({ description: 'A shirt', image: image() }))).status).toBe(503)
  expect(query.insert).not.toHaveBeenCalled()
})
it('keeps provider details private and does not write after upload failure', async () => {
  send.mockRejectedValue(new Error('private credentials in provider error'))
  const response = await POST(formRequest({ description: 'A shirt', image: image() }))
  expect(response.status).toBe(500)
  expect(JSON.stringify(await response.json())).not.toContain('private')
  expect(query.insert).not.toHaveBeenCalled()
})
it('reports database failure without claiming success', async () => {
  responses.push(result(null, { message: 'private database details' }))
  const response = await POST(formRequest({ description: 'A shirt', image: image() }))
  expect(response.status).toBe(500)
  expect(JSON.stringify(await response.json())).not.toContain('private')
})
it('soft-removes the item without deleting any storage object', async () => {
  responses.push(result({ id: 1 }))
  expect((await DELETE(new Request('http://localhost/api/admin/shop?id=1'))).status).toBe(200)
  expect(query.update).toHaveBeenCalledWith({ deleted_at: expect.any(String) })
  expect(query.is).toHaveBeenCalledWith('deleted_at', null)
  expect(send).not.toHaveBeenCalled()
})
it('reports repeated removal as not found', async () => {
  responses.push(result(null))
  expect((await DELETE(new Request('http://localhost/api/admin/shop?id=1'))).status).toBe(404)
})
it('reports public database failure without exposing details', async () => {
  responses.push(result(null, { message: 'private details' }))
  const response = await publicGET()
  expect(response.status).toBe(500)
  expect(await response.json()).toEqual({ error: 'Unable to load the shop.' })
})
