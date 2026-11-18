import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminShopPage from './page'

const push = jest.fn()
const router = { push }
jest.mock('next/navigation', () => ({ useRouter: () => router }))
jest.mock('next/image', () => ({ __esModule: true, default: (props: Record<string, unknown>) => {
  const { unoptimized, ...imageProps } = props
  void unoptimized
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...imageProps} />
} }))

const item = { id: 1, description: 'DPR shirt', image_url: 'https://example.com/shirt.png', image_key: 'shirt.png' }
const reply = (data: unknown, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => data })
const fetchMock = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = fetchMock
  fetchMock.mockImplementation(() => reply({ items: [item] }))
  URL.createObjectURL = jest.fn(() => 'blob:preview')
  URL.revokeObjectURL = jest.fn()
})

test('lists items, edits description, saves, and returns to the list without a status badge', async () => {
  render(<AdminShopPage />)
  await userEvent.click(await screen.findByText('Edit'))
  const text = screen.getByLabelText('Description')
  await userEvent.clear(text)
  await userEvent.type(text, 'Updated shirt')
  fetchMock.mockImplementationOnce(() => reply({ item: { ...item, description: 'Updated shirt' } }))
  await userEvent.click(screen.getByText('Save'))
  expect(await screen.findByText('Updated shirt')).toBeInTheDocument()
  expect(screen.queryByText('Save')).not.toBeInTheDocument()
  expect(fetchMock.mock.calls[1][1].body.get('id')).toBe('1')
})

test('cancel discards edits, including repeated edit/cancel', async () => {
  render(<AdminShopPage />)
  await userEvent.click(await screen.findByText('Edit'))
  await userEvent.type(screen.getByLabelText('Description'), ' changed')
  await userEvent.click(screen.getByText('Cancel'))
  await userEvent.click(screen.getByText('Edit'))
  expect(screen.getByLabelText('Description')).toHaveValue('DPR shirt')
  await userEvent.click(screen.getByText('Cancel'))
  expect(fetchMock).toHaveBeenCalledTimes(1)
})

test('new item requires an image, rejects unsupported files, and saves photo/text', async () => {
  render(<AdminShopPage />)
  await userEvent.click(await screen.findByText('Add item'))
  await userEvent.type(screen.getByLabelText('Title'), 'Shirt')
  await userEvent.type(screen.getByLabelText('Description'), 'New shirt')
  await userEvent.click(screen.getByText('Save'))
  expect(screen.getByRole('alert')).toHaveTextContent('Choose an image')
  fireEvent.change(screen.getByLabelText('Main photo'), { target: { files: [new File(['bad'], 'x.svg', { type: 'image/svg+xml' })] } })
  expect(screen.getByRole('alert')).toHaveTextContent('JPEG')
  fireEvent.change(screen.getByLabelText('Main photo'), { target: { files: [new File(['photo'], 'shirt.png', { type: 'image/png' })] } })
  fetchMock.mockImplementationOnce(() => reply({ item: { ...item, id: 2, title: 'Shirt', description: 'New shirt' } }))
  await userEvent.click(screen.getByText('Save'))
  await waitFor(() => expect(screen.queryByText('Save')).not.toBeInTheDocument())
  expect(screen.getByText('New shirt')).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Shirt' })).toBeInTheDocument()
  expect(fetchMock.mock.calls[1][1].body.get('title')).toBe('Shirt')
  expect(fetchMock.mock.calls[1][1].body.get('image')).toBeInstanceOf(File)
})

test('failed save and expired session preserve text and image for retry', async () => {
  render(<AdminShopPage />)
  await userEvent.click(await screen.findByText('Edit'))
  await userEvent.type(screen.getByLabelText('Description'), ' changed')
  fetchMock.mockImplementationOnce(() => reply({}, 401))
  await userEvent.click(screen.getByText('Save'))
  expect(await screen.findByRole('alert')).toHaveTextContent('session expired')
  expect(screen.getByLabelText('Description')).toHaveValue('DPR shirt changed')
  expect(push).not.toHaveBeenCalled()
})

test('saves the ordering text from the shop list', async () => {
  render(<AdminShopPage />)
  const intro = await screen.findByLabelText('Shop intro')
  fireEvent.change(intro, { target: { value: '  Order by email.  ' } })
  fetchMock.mockImplementationOnce(() => reply({ intro: 'Order by email.' }))
  await userEvent.click(screen.getByRole('button', { name: 'Save intro' }))
  await waitFor(() => expect(intro).toHaveValue('Order by email.'))
  expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'PATCH', body: JSON.stringify({ intro: '  Order by email.  ' }) })
})

test('keeps successful uploads when an additional photo fails and saves all photos on retry', async () => {
  render(<AdminShopPage />)
  await userEvent.click(await screen.findByText('Edit'))
  const first = new File(['first'], 'front.png', { type: 'image/png' })
  const second = new File(['second'], 'back.png', { type: 'image/png' })
  fireEvent.change(screen.getByLabelText('Additional photos'), { target: { files: [first, second] } })
  fetchMock.mockImplementationOnce(() => reply({ url: '/front.png' }))
  fetchMock.mockImplementationOnce(() => reply({ error: 'Upload failed' }, 500))
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Upload failed')
  expect(screen.getByText('back.png')).toBeInTheDocument()

  fetchMock.mockImplementationOnce(() => reply({ url: '/back.png' }))
  fetchMock.mockImplementationOnce(() => reply({ item: { ...item, gallery_image_urls: ['/front.png', '/back.png'] } }))
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(screen.queryByLabelText('Additional photos')).not.toBeInTheDocument())
  expect(fetchMock.mock.calls.slice(1).map(call => call[1].method)).toEqual(['PUT', 'PUT', 'PUT', 'POST'])
  expect(fetchMock.mock.calls[3][1].body.get('image')).toBe(second)
  expect(fetchMock.mock.calls[4][1].body.getAll('gallery_image_url')).toEqual(['/front.png', '/back.png'])
})

test('remove can be cancelled and confirms before removing', async () => {
  render(<AdminShopPage />)
  await userEvent.click(await screen.findByText('Remove'))
  await userEvent.click(screen.getByText('Cancel'))
  expect(fetchMock).toHaveBeenCalledTimes(1)
  await userEvent.click(screen.getByText('Remove'))
  fetchMock.mockImplementationOnce(() => reply({ success: true }))
  await userEvent.click(screen.getByText('Remove'))
  await waitFor(() => expect(screen.queryByText('DPR shirt')).not.toBeInTheDocument())
  expect(fetchMock).toHaveBeenLastCalledWith('/api/admin/shop?id=1', { method: 'DELETE' })
})

test('unauthenticated load routes to existing sign-in', async () => {
  fetchMock.mockImplementationOnce(() => reply({}, 401))
  render(<AdminShopPage />)
  await waitFor(() => expect(push).toHaveBeenCalledWith('/admin'))
})


test('saves Markdown unchanged and renders links in the list', async () => {
  render(<AdminShopPage />)
  await userEvent.click(await screen.findByText('Edit'))
  const description = 'Designed by [Person Online Studios](https://example.com/studio).'
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: description } })
  fetchMock.mockImplementationOnce(() => reply({ item: { ...item, description } }))
  await userEvent.click(screen.getByText('Save'))
  expect(await screen.findByRole('link', { name: 'Person Online Studios' })).toHaveAttribute('href', 'https://example.com/studio')
  expect(fetchMock.mock.calls[1][1].body.get('description')).toBe(description)
  await userEvent.click(screen.getByText('Edit'))
  expect(screen.getByLabelText('Description')).toHaveValue(description)
})
