/** @jest-environment node */
import { POST } from './route'

const send = jest.fn()
jest.mock('resend', () => ({ Resend: jest.fn().mockImplementation(() => ({ emails: { send: (...args: unknown[]) => send(...args) } })) }))
const verify = jest.fn()
const originalEnv = { ...process.env }
const valid = {
  firstName: 'Test', lastName: 'Host', email: 'host@example.com',
  showName: 'A test show', location: 'Test location', category: 'Music',
  frequency: 'One-off', oneLiner: 'Test concept', fullDescription: 'Test description',
  captchaToken: 'valid-token', submissionId: '12345678-1234-4123-8123-123456789abc',
}
const request = (overrides = {}) => new Request('http://localhost/api/submit-show-proposal', {
  method: 'POST', body: JSON.stringify({ ...valid, ...overrides }),
})
const approved = { success: true, hostname: 'desirepathradio.com', action: 'show-proposal' }

beforeEach(() => {
  jest.clearAllMocks()
  process.env = { ...originalEnv, RESEND_API_KEY: 'test-key', SUBMISSION_EMAIL: 'receiver@example.com', TURNSTILE_SECRET_KEY: 'test-secret' }
  delete process.env.TURNSTILE_ALLOWED_HOSTNAMES
  global.fetch = verify
  verify.mockResolvedValue({ ok: true, json: async () => approved })
  send.mockResolvedValue({ data: { id: 'test-email-id' }, error: null })
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'info').mockImplementation(() => {})
})
afterEach(() => jest.restoreAllMocks())
afterAll(() => { process.env = originalEnv })

it('verifies before sending and only reports provider acceptance', async () => {
  const response = await POST(request())
  expect(response.status).toBe(200)
  expect(await response.json()).toMatchObject({ success: true, requestId: expect.any(String) })
  expect(verify.mock.invocationCallOrder[0]).toBeLessThan(send.mock.invocationCallOrder[0])
  expect(JSON.parse(verify.mock.calls[0][1].body)).toEqual({ secret: 'test-secret', response: 'valid-token' })
  expect(send).toHaveBeenCalledWith(expect.objectContaining({ replyTo: valid.email }), { idempotencyKey: expect.stringContaining(valid.submissionId) })
  expect(console.info).toHaveBeenCalledWith('show_proposal', expect.objectContaining({ outcome: 'email_accepted', emailId: 'test-email-id' }))
})

it.each(['invalid-input-response', 'timeout-or-duplicate'])('rejects failed, expired or replayed CAPTCHA: %s', async code => {
  verify.mockResolvedValue({ ok: true, json: async () => ({ success: false, 'error-codes': [code] }) })
  expect((await POST(request())).status).toBe(400)
  expect(send).not.toHaveBeenCalled()
})
it.each([undefined, '', 123, 'x'.repeat(2049)])('rejects missing or malformed tokens without sending: %s', async captchaToken => {
  expect((await POST(request({ captchaToken }))).status).toBe(400)
  expect(send).not.toHaveBeenCalled()
  expect(verify).not.toHaveBeenCalled()
})
it.each([
  { ...approved, hostname: 'attacker.example' },
  { ...approved, action: 'other-form' },
  { success: 'true', hostname: approved.hostname, action: approved.action },
])('rejects hostname/action/invalid success mismatch', async result => {
  verify.mockResolvedValue({ ok: true, json: async () => result })
  expect((await POST(request())).status).toBe(400)
  expect(send).not.toHaveBeenCalled()
})
it('allows an explicitly configured preview hostname', async () => {
  process.env.TURNSTILE_ALLOWED_HOSTNAMES = 'preview.example,desirepathradio.com'
  verify.mockResolvedValue({ ok: true, json: async () => ({ ...approved, hostname: 'preview.example' }) })
  expect((await POST(request())).status).toBe(200)
})
it.each(['TURNSTILE_SECRET_KEY', 'RESEND_API_KEY', 'SUBMISSION_EMAIL'])('fails closed when %s is absent', async name => {
  delete process.env[name]
  expect((await POST(request())).status).toBe(503)
  expect(send).not.toHaveBeenCalled()
})
it.each(['internal-error', 'invalid-input-secret'])('reports verification service/configuration failure: %s', async code => {
  verify.mockResolvedValue({ ok: true, json: async () => ({ success: false, 'error-codes': [code] }) })
  expect((await POST(request())).status).toBe(503)
  expect(send).not.toHaveBeenCalled()
})
it.each(['http', 'timeout', 'bad-json', 'null-json'])('fails closed on Siteverify %s', async mode => {
  if (mode === 'http') verify.mockResolvedValue({ ok: false })
  if (mode === 'timeout') verify.mockRejectedValue(new DOMException('timeout', 'TimeoutError'))
  if (mode === 'bad-json') verify.mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('bad JSON') } })
  if (mode === 'null-json') verify.mockResolvedValue({ ok: true, json: async () => null })
  expect((await POST(request())).status).toBe(503)
  expect(send).not.toHaveBeenCalled()
})
it.each([{ email: 'not-an-email' }, { firstName: '' }, { fullDescription: {} }, { showName: 'a\nb' }, { fullDescription: 'x'.repeat(20001) }, { submissionId: 'bad' }])('rejects invalid fields without contacting providers', async overrides => {
  expect((await POST(request(overrides))).status).toBe(400)
  expect(verify).not.toHaveBeenCalled()
  expect(send).not.toHaveBeenCalled()
})
it('rejects malformed JSON', async () => {
  const response = await POST(new Request('http://localhost/api/submit-show-proposal', { method: 'POST', body: '{' }))
  expect(response.status).toBe(400)
})
it('escapes HTML while preserving reply-to and subject text', async () => {
  await POST(request({ showName: 'Jazz & <Music>', fullDescription: '<img src=x>\nHello' }))
  const email = send.mock.calls[0][0]
  expect(email.subject).toBe('New Show Proposal: Jazz & <Music>')
  expect(email.html).toContain('&lt;img src=x&gt;\nHello')
  expect(email.html).not.toContain('<img src=x>')
})
it.each(['error', 'throw', 'empty'])('reports provider %s without claiming success', async mode => {
  if (mode === 'error') send.mockResolvedValue({ data: null, error: { message: 'provider error' } })
  if (mode === 'throw') send.mockRejectedValue(new Error('private provider details'))
  if (mode === 'empty') send.mockResolvedValue({ data: null, error: null })
  const response = await POST(request())
  expect(response.status).toBe(502)
  expect(await response.json()).toMatchObject({ error: expect.stringContaining('could not confirm') })
  expect(console.info).not.toHaveBeenCalled()
})
it('reuses an identical email payload/key on fresh CAPTCHA retry; edits get a new key', async () => {
  await POST(request())
  await POST(request({ captchaToken: 'fresh-token' }))
  expect(send.mock.calls[1]).toEqual(send.mock.calls[0])
  await POST(request({ showName: 'Edited show', captchaToken: 'third-token' }))
  expect(send.mock.calls[2][1].idempotencyKey).not.toBe(send.mock.calls[0][1].idempotencyKey)
})
it('never logs tokens, credentials, or proposal fields', async () => {
  await POST(request())
  const logs = JSON.stringify((console.info as jest.Mock).mock.calls)
  expect(logs).not.toContain(valid.captchaToken)
  expect(logs).not.toContain(valid.email)
  expect(logs).not.toContain('test-secret')
})
