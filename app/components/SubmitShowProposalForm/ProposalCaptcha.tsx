'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
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
  const [failed, setFailed] = useState(false)
  const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === 'dark' ? 'dark' : resolvedTheme === 'light' ? 'light' : undefined

  useEffect(() => {
    if (!sitekey || !container.current || !theme) return
    onError('')
    let active = true
    let widgetId: string | undefined
    let timer: ReturnType<typeof setTimeout>
    const reportError = (message: string) => {
      if (active) {
        setFailed(true)
        onError(message)
      }
    }
    const render = () => {
      clearTimeout(timer)
      if (!active || !container.current || !window.turnstile || widgetId !== undefined) return
      try {
        widgetId = window.turnstile.render(container.current, {
          sitekey,
          action: proposalCaptchaAction,
          size: 'normal',
          theme,
          callback: (token: string) => {
            if (active) {
              setFailed(false)
              onVerified(token)
            }
          },
          'error-callback': () => {
            reportError('CAPTCHA failed to load. Please try again.')
          },
          'expired-callback': () => {
            reportError('CAPTCHA expired. Please try again.')
          },
          'timeout-callback': () => {
            reportError('CAPTCHA timed out. Please try again.')
          },
        })
      } catch {
        reportError('CAPTCHA could not start. Please try again.')
      }
    }
    const scriptError = () => {
      clearTimeout(timer)
      script?.remove()
      reportError('CAPTCHA could not load. Please try again.')
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
  }, [sitekey, resetKey, retryKey, theme, onVerified, onError])

  return (
    <div className="form-field-group">
      {sitekey ? (
        <>
          <div ref={container} className="captcha-widget" />
          {failed && <button type="button" className="captcha-retry-button" aria-label="Retry CAPTCHA" onClick={() => {
            setFailed(false)
            onError('')
            setRetryKey(key => key + 1)
          }}>↻</button>}
        </>
      ) : (
        <p role="alert">Submissions are temporarily unavailable. Please try again later.</p>
      )}
    </div>
  )
}
