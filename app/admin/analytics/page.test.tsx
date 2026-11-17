import { render, screen } from '@testing-library/react'
import AnalyticsPage from './page'

jest.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: 'true' }) }) }))
jest.mock('next/navigation', () => ({ redirect: jest.fn() }))
jest.mock('@/app/components/admin/PlayCountAnalytics/PlayCountAnalytics', () => ({
  __esModule: true,
  default: () => <div>Play Count Analytics</div>,
}))

test('keeps standard analytics without the AI query feature or tabs', async () => {
  render(await AnalyticsPage())
  expect(screen.getByRole('heading', { name: 'Analytics' })).toBeInTheDocument()
  expect(screen.getByText('Play Count Analytics')).toBeInTheDocument()
  expect(screen.queryByText(/AI Query/i)).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
