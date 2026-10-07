import { proposalCaptchaAction } from './show-proposal'

type Verification = {
  success?: boolean
  hostname?: string
  action?: string
  'error-codes'?: string[]
}

export async function verifyProposalCaptcha(token: unknown): Promise<'valid' | 'invalid' | 'unavailable'> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return 'unavailable'
  if (typeof token !== 'string' || !token || token.length > 2048) return 'invalid'

  const hostnames = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || 'desirepathradio.com,www.desirepathradio.com')
    .split(',').map(hostname => hostname.trim()).filter(Boolean)

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return 'unavailable'
    const result: Verification = await response.json()
    if (!result || typeof result !== 'object') return 'unavailable'
    if (result['error-codes']?.some(code => ['internal-error', 'invalid-input-secret', 'missing-input-secret', 'bad-request'].includes(code))) {
      return 'unavailable'
    }
    return result.success === true && result.action === proposalCaptchaAction &&
      typeof result.hostname === 'string' && hostnames.includes(result.hostname)
      ? 'valid' : 'invalid'
  } catch {
    return 'unavailable'
  }
}
