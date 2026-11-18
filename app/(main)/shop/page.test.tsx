import { fireEvent, render, screen, within } from '@testing-library/react'
import Shop from './page'

jest.mock('@/app/components/home/HomeHero/DesirePathAnimation', () => ({ __esModule: true, default: () => null }))
jest.mock('next/image', () => ({ __esModule: true, default: (props: Record<string, unknown>) => {
  const { unoptimized, fill, ...imageProps } = props
  void unoptimized
  void fill
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img {...imageProps} />
} }))

test('keeps full photos and content in aligned image, title, and description rows', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ items: [
    { id: 1, title: 'Short title', description: 'First description', image_url: '/portrait.png' },
    { id: 2, title: 'A longer title that can wrap naturally', description: 'Second description\nSecond line', image_url: '/landscape.png' },
  ] }) })
  render(<Shop />)
  expect(await screen.findByText('Short title')).toHaveClass('font-[family-name:var(--font-monument-wide)]', 'text-[17px]', 'md:text-[20px]', 'leading-[1.2]')
  expect(screen.getByText('A longer title that can wrap naturally')).toBeInTheDocument()
  expect(screen.getByText(/Second description/)).toHaveTextContent('Second description Second line')
  expect(screen.queryByRole('button', { name: 'Next photo' })).not.toBeInTheDocument()
  for (const image of screen.getAllByRole('img')) {
    expect(image).toHaveClass('object-contain')
    expect(image.parentElement).toHaveClass('items-end')
    expect(image.closest('figure')).toHaveClass('grid-rows-subgrid', 'row-span-3')
    expect(image.closest('figure')).toHaveClass('last:pb-0', 'md:[&:nth-last-child(2):nth-child(odd)]:pb-0')
    expect(image.closest('figure')?.parentElement).toHaveClass('gap-y-4')
  }
})

test('shows ordering instructions and cycles photos inline in the main photo’s frame', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({
    intro: 'Order by [email](mailto:orders@example.com).',
    items: [{ id: 1, title: 'Shirt', description: 'A shirt', image_url: '/front.png', gallery_image_urls: ['/back.png'] }],
  }) })
  render(<Shop />)
  const gallery = within(await screen.findByRole('group', { name: 'Shirt photos' }))
  expect(screen.getByRole('link', { name: 'email' })).toHaveAttribute('href', 'mailto:orders@example.com')
  const mainPhoto = gallery.getByRole('img')
  expect(mainPhoto).toHaveAttribute('src', '/front.png')
  fireEvent.click(gallery.getByRole('button', { name: 'Next photo' }))
  const extraPhoto = gallery.getByRole('img')
  expect(extraPhoto).toHaveAttribute('src', '/back.png')
  expect(extraPhoto).toHaveClass('object-contain')
  expect(extraPhoto.parentElement).toBe(mainPhoto.parentElement)
  expect(mainPhoto).toHaveClass('h-auto', 'invisible')
  expect(gallery.getByText('Photo 2 of 2')).toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  fireEvent.click(gallery.getByRole('button', { name: 'Previous photo' }))
  expect(gallery.getByRole('img')).toBe(mainPhoto)
})
