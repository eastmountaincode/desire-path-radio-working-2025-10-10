import { render, screen } from '@testing-library/react'
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
  expect(await screen.findByText('Short title')).toBeInTheDocument()
  expect(screen.getByText('A longer title that can wrap naturally')).toBeInTheDocument()
  expect(screen.getByText(/Second description/)).toHaveTextContent('Second description Second line')
  for (const image of screen.getAllByRole('img')) {
    expect(image).toHaveClass('object-contain')
    expect(image.parentElement).toHaveClass('aspect-square')
    expect(image.closest('figure')).toHaveClass('grid-rows-subgrid', 'row-span-3')
  }
})
