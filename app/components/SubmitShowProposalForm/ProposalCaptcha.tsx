'use client'

import { useEffect, useRef, useState } from 'react'
import { proposalCaptchaAction } from '@/lib/show-proposal'

type Turnstile = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  remove: (id: string) => void
}

declare global {
  interface Window { turnstile?: Turnstile }
}

type Props = {
  resetKey: number
  onVerified: (token: string) => void
  onError: (message: string) => void
}

export default function ProposalCaptcha({ resetKey, onVerified, onError }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const [retryKey, setRetryKey] = useState(0)
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!sitekey || !container.current) return
    let active = true
    let widgetId: string | undefined
    let timer: ReturnType<typeof setTimeout>
    const render = () => {
      clearTimeout(timer)
      if (!active || !container.current || !window.turnstile || widgetId !== undefined) return
      try {
        widgetId = window.turnstile.render(container.current, {
          sitekey,
          action: proposalCaptchaAction,
          size: 'flexible',
          theme: 'auto',
          callback: (token: string) => { if (active) onVerified(token) },
          'error-callback': () => {
            if (active) onError('Verification failed to load. Check your connection and retry verification.')
          },
          'expired-callback': () => {
            if (active) onError('Verification expired. Please complete verification again.')
          },
          'timeout-callback': () => {
            if (active) onError('Verification timed out. Please retry verification.')
          },
        })
      } catch {
        onError('Verification could not start. Please retry verification.')
      }
    }
    const scriptError = () => {
      clearTimeout(timer)
      script?.remove()
      if (active) onError('Verification could not load. Allow challenges.cloudflare.com and retry verification. Your form text is still here.')
    }
    let script = document.querySelector<HTMLScriptElement>('#proposal-turnstile-script')
    if (window.turnstile) {
      render()
    } else {
      if (!script) {
        script = document.createElement('script')
        script.id = 'proposal-turnstile-script'
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', render)
      script.addEventListener('error', scriptError)
      timer = setTimeout(scriptError, 15000)
    }
    return () => {
      active = false
      clearTimeout(timer)
      script?.removeEventListener('load', render)
      script?.removeEventListener('error', scriptError)
      if (widgetId !== undefined) window.turnstile?.remove(widgetId)
    }
  }, [sitekey, resetKey, retryKey, onVerified, onError])

  return (
    <div className="form-field-group">
      <p className="form-label">Verification</p>
      {sitekey ? (
        <>
          <div ref={container} />
          <button type="button" className="captcha-retry-button" onClick={() => {
            onError('Please complete verification before submitting.')
            setRetryKey(key => key + 1)
          }}>Retry verification</button>
        </>
      ) : (
        <p role="alert">Proposal submission is temporarily unavailable. Your form text will stay here; please try again later.</p>
      )}
    </div>
  )
}
