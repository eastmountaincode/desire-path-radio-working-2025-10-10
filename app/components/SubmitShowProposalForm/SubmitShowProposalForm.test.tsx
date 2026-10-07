import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import SubmitShowProposalForm from './SubmitShowProposalForm'

jest.mock('../DevModeProvider', () => ({ useDevMode: () => false }))
jest.mock('./ProposalCaptcha', () => ({
  __esModule: true,
  default: ({ onVerified, onError, resetKey }: { onVerified: (token: string) => void; onError: (message: string) => void; resetKey: number }) => (
    <div data-testid="captcha" data-reset={resetKey}>
      <button type="button" onClick={() => onVerified('fresh-test-token')}>Pass test verification</button>
      <button type="button" onClick={() => onError('Verification expired. Please retry.')}>Expire test verification</button>
    </div>
  ),
}))
const fetchMock = jest.fn()
const fillForm = () => {
  for (const [id, value] of Object.entries({ firstName: 'Test', lastName: 'Host', email: 'host@example.com', showName: 'Test show', location: 'Test location', category: 'Music', frequency: 'Weekly', oneLiner: 'Test concept', fullDescription: 'Keep my proposal' })) {
    fireEvent.change(document.getElementById(id)!, { target: { value } })
  }
}
const pass = () => fireEvent.click(screen.getByText('Pass test verification'))
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Submit Proposal' }))
beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = fetchMock
  Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: () => '12345678-1234-4123-8123-123456789abc' })
  Object.defineProperty(AbortSignal, 'timeout', { configurable: true, value: () => new AbortController().signal })
})
it('requires verification and disables sending again when it expires', () => {
  render(<SubmitShowProposalForm />)
  expect(screen.getByRole('button', { name: 'Submit Proposal' })).toBeDisabled()
  pass()
  expect(screen.getByRole('button', { name: 'Submit Proposal' })).toBeEnabled()
  fireEvent.click(screen.getByText('Expire test verification'))
  expect(screen.getByRole('button', { name: 'Submit Proposal' })).toBeDisabled()
  expect(fetchMock).not.toHaveBeenCalled()
})
it('retains text on rejection and retries with the same submission ID and fresh verification', async () => {
  fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Verification expired. Please retry.' }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) })
  render(<SubmitShowProposalForm />)
  fillForm(); pass(); submit()
  await screen.findByRole('alert')
  expect(screen.getByDisplayValue('Keep my proposal')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Submit Proposal' })).toBeDisabled()
  expect(screen.getByTestId('captcha')).toHaveAttribute('data-reset', '1')
  pass(); submit()
  await screen.findByText('Thank you! Your proposal has been submitted.')
  expect(JSON.parse(fetchMock.mock.calls[1][1].body).submissionId).toBe(JSON.parse(fetchMock.mock.calls[0][1].body).submissionId)
  expect(screen.queryByDisplayValue('Keep my proposal')).not.toBeInTheDocument()
})
it.each(['network', 'timeout', 'bad-json'])('keeps the text when the response cannot be confirmed: %s', async mode => {
  if (mode === 'network') fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
  if (mode === 'timeout') fetchMock.mockRejectedValue(new DOMException('timed out', 'TimeoutError'))
  if (mode === 'bad-json') fetchMock.mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('bad JSON') } })
  render(<SubmitShowProposalForm />); fillForm(); pass(); submit()
  await screen.findByRole('alert')
  expect(screen.getByDisplayValue('Keep my proposal')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Submit Proposal' })).toBeDisabled()
})
it('blocks concurrent submissions and changes while sending', async () => {
  let resolve!: (value: unknown) => void
  fetchMock.mockReturnValue(new Promise(result => { resolve = result }))
  render(<SubmitShowProposalForm />); fillForm(); pass(); submit()
  fireEvent.submit(document.querySelector('form')!)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(screen.getByLabelText('First name')).toBeDisabled()
  await act(async () => resolve({ ok: true, json: async () => ({ success: true }) }))
  await waitFor(() => expect(screen.getByLabelText('First name')).toBeEnabled())
})
