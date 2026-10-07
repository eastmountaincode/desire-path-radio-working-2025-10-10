import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'
import ProposalCaptcha from './ProposalCaptcha'

const renderWidget = jest.fn()
const remove = jest.fn()
const onVerified = jest.fn()
const onError = jest.fn()
beforeEach(() => {
  jest.clearAllMocks()
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-site-key'
  window.turnstile = { render: renderWidget.mockReturnValue('widget-1'), remove }
  document.querySelector('#proposal-turnstile-script')?.remove()
})
afterEach(() => { delete window.turnstile; jest.useRealTimers() })
it('renders the correct action and handles success, expiry, failure and timeout', () => {
  render(<ProposalCaptcha resetKey={0} onVerified={onVerified} onError={onError} />)
  const options = renderWidget.mock.calls[0][1]
  expect(options.action).toBe('show-proposal')
  act(() => options.callback('test-token'))
  expect(onVerified).toHaveBeenCalledWith('test-token')
  act(() => options['expired-callback']())
  expect(onError).toHaveBeenLastCalledWith(expect.stringContaining('expired'))
  act(() => options['error-callback']())
  expect(onError).toHaveBeenLastCalledWith(expect.stringContaining('failed'))
  act(() => options['timeout-callback']())
  expect(onError).toHaveBeenLastCalledWith(expect.stringContaining('timed out'))
})
it('removes spent widgets and creates a fresh one after a submission or retry', () => {
  const { rerender, unmount } = render(<ProposalCaptcha resetKey={0} onVerified={onVerified} onError={onError} />)
  rerender(<ProposalCaptcha resetKey={1} onVerified={onVerified} onError={onError} />)
  expect(remove).toHaveBeenCalledWith('widget-1')
  expect(renderWidget).toHaveBeenCalledTimes(2)
  act(() => renderWidget.mock.calls[1][1]['error-callback']())
  fireEvent.click(screen.getByRole('button', { name: 'Retry CAPTCHA' }))
  expect(renderWidget).toHaveBeenCalledTimes(3)
  unmount()
  expect(remove).toHaveBeenCalledTimes(3)
})
it('ignores late callbacks from removed widgets', () => {
  const { unmount } = render(<ProposalCaptcha resetKey={0} onVerified={onVerified} onError={onError} />)
  const callback = renderWidget.mock.calls[0][1].callback
  unmount()
  callback('late-token')
  expect(onVerified).not.toHaveBeenCalled()
})
it('fails visibly when the script is blocked and retries script loading', () => {
  delete window.turnstile
  jest.useFakeTimers()
  render(<ProposalCaptcha resetKey={0} onVerified={onVerified} onError={onError} />)
  act(() => jest.advanceTimersByTime(15000))
  expect(onError).toHaveBeenCalledWith(expect.stringContaining('could not load'))
  expect(document.querySelector('#proposal-turnstile-script')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Retry CAPTCHA' }))
  const script = document.querySelector('#proposal-turnstile-script')!
  window.turnstile = { render: renderWidget, remove }
  fireEvent.load(script)
  expect(renderWidget).toHaveBeenCalledTimes(1)
})
it('fails visibly when the site key is missing', () => {
  delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  render(<ProposalCaptcha resetKey={0} onVerified={onVerified} onError={onError} />)
  expect(screen.getByRole('alert')).toHaveTextContent('temporarily unavailable')
  expect(renderWidget).not.toHaveBeenCalled()
})
