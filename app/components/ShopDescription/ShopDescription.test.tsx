import { render, screen } from '@testing-library/react'
import ShopDescription from './ShopDescription'

test('renders standard links, emphasis and lists with inherited body typography', () => {
  const { container } = render(<ShopDescription text={'Designed by [Person Online Studios](https://www.instagram.com/persononlinestudios/).\n\n**Details**\n\n- Risograph print\n- Limited edition'} />)
  expect(screen.getByRole('link', { name: 'Person Online Studios' })).toHaveAttribute('href', 'https://www.instagram.com/persononlinestudios/')
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
  expect(container.querySelector('strong')).toHaveTextContent('Details')
  expect(container.querySelector('p')).not.toHaveAttribute('style')
})

test('preserves existing plain text and line breaks', () => {
  const { container } = render(<ShopDescription text={'First line\nSecond line\n\nLast paragraph'} />)
  expect(container.querySelector('br')).toBeInTheDocument()
  expect(container.querySelectorAll('p')).toHaveLength(2)
  expect(screen.getByText('Last paragraph')).toBeInTheDocument()
})

test('does not execute HTML or unsafe links or embed description images', () => {
  const { container } = render(<ShopDescription text={'<script>alert(1)</script>\n<img src=x onerror=alert(1)>\n[bad](javascript:alert%281%29)\n[data](data:text/html,test)\n![image](https://example.com/a.png)'} />)
  expect(container.querySelector('script, img')).toBeNull()
  expect(container.textContent).toContain('<script>')
  expect(screen.queryByRole('link', { name: 'bad' })).toBeNull()
  expect(screen.queryByRole('link', { name: 'data' })).toBeNull()
})

test('permits email and relative links but rejects obfuscated schemes', () => {
  const { container } = render(<ShopDescription text={'[email](mailto:info@desirepathradio.com) [about](/about) [bad](jav&#x61;script:alert%281%29)'} />)
  expect(screen.getByRole('link', { name: 'email' })).toHaveAttribute('href', 'mailto:info@desirepathradio.com')
  expect(screen.getByRole('link', { name: 'about' })).toHaveAttribute('href', '/about')
  expect(container.querySelectorAll('a')).toHaveLength(2)
})
