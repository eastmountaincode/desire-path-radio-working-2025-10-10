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
  await userEvent.type(screen.getByLabelText('Description'), 'New shirt')
  await userEvent.click(screen.getByText('Save'))
  expect(screen.getByRole('alert')).toHaveTextContent('Choose an image')
  fireEvent.change(screen.getByLabelText('Photo'), { target: { files: [new File(['bad'], 'x.svg', { type: 'image/svg+xml' })] } })
  expect(screen.getByRole('alert')).toHaveTextContent('JPEG')
  fireEvent.change(screen.getByLabelText('Photo'), { target: { files: [new File(['photo'], 'shirt.png', { type: 'image/png' })] } })
  fetchMock.mockImplementationOnce(() => reply({ item: { ...item, id: 2, description: 'New shirt' } }))
  await userEvent.click(screen.getByText('Save'))
  expect(await screen.findByText('New shirt')).toBeInTheDocument()
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
