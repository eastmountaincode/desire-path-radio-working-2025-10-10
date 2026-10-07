This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Show proposal CAPTCHA and delivery

The proposal form at `/submit-show-proposal` uses Cloudflare Turnstile. The API
verifies every token with Cloudflare before calling Resend, and requires the
`show-proposal` action and an allowed hostname. Missing configuration, failed
verification, expired/used tokens, and provider failures return explicit errors.
The browser retains the form text on error and requests a fresh challenge.

### Configuration before deploying

Create a managed Turnstile widget in **DPR's Cloudflare account**, with
`desirepathradio.com` and `www.desirepathradio.com` as allowed hostnames. Set these
variables on the correct **DPR Vercel project** before building/deploying:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: public widget site key, included at build time.
- `TURNSTILE_SECRET_KEY`: server-only matching secret; never prefix with `NEXT_PUBLIC_`.
- `TURNSTILE_ALLOWED_HOSTNAMES`: optional comma-separated exact hostnames. Defaults
  to `desirepathradio.com,www.desirepathradio.com`. Add an exact preview hostname
  when testing with a separate preview widget; do not accept arbitrary hosts.
- Existing `RESEND_API_KEY` and `SUBMISSION_EMAIL` must remain configured.

Use separate keys/configuration for previews. Do not put Cloudflare's dummy keys
in production. There is no production test bypass. No DNS, root-domain routing,
Shopify, CMS, or email sender changes are required. Deployment without the keys
will make the form unavailable rather than expose an unprotected submission API.

### Delivery evidence and retry behavior

An HTTP success means **Resend accepted the email**, not that it reached an inbox.
Look up the email ID in Resend to check delivered, bounced, suppressed, failed,
or delayed events. Even a delivered event means recipient-server acceptance,
not confirmed inbox placement or reading.

Runtime logs use `show_proposal` with `requestId` and `outcome`; acceptance also
includes `emailId`. Outcomes distinguish invalid JSON/form data, CAPTCHA rejection
or outage, missing email configuration, provider rejection/missing acknowledgment,
and request exceptions. Logs exclude proposal contents, email addresses,
credentials, and CAPTCHA tokens. The system remains email-only; it does not add a
durable proposal database or claim to recover earlier failed attempts.

Retries with the same proposal and browser submission ID reuse an identical
Resend idempotency key and email payload. Resend deduplicates for 24 hours.
Editing the proposal changes the payload hash and therefore the key. Reloading
or leaving the page loses the in-memory draft and submission ID. The email's
variable server timestamp was removed so retries keep the same payload; Resend's
creation timestamp remains available in its logs.

### Focused verification

Run only the following tests for this change (the pre-existing episode tests
write to external services):

```sh
npm test -- --runInBand --runTestsByPath \
  app/api/submit-show-proposal/route.test.ts \
  app/components/SubmitShowProposalForm/ProposalCaptcha.test.tsx \
  app/components/SubmitShowProposalForm/SubmitShowProposalForm.test.tsx
```

The 44 tests mock email sending and Siteverify, covering success, invalid/expired/
replayed tokens, missing keys, wrong hostname/action, provider rejection or
exceptions, unconfirmed responses, script failures, fresh challenges, retained
text, concurrent submission prevention, HTML escaping, and retry idempotency.
These tests do not establish real inbox delivery or production CAPTCHA behavior.

Cloudflare's documented dummy keys can test the widget locally without a real
challenge. The always-pass Siteverify dummy response may omit the action and use
`example.com`; strict production action/hostname validation intentionally rejects
that response. Test successful route acceptance through the mocks above, then
verify the complete real-key flow on a preview with an approved test recipient.
Never loosen production checks to accommodate dummy responses.

### Investigation on October 7, 2026

- This checkout's HEAD and GitHub remote HEAD matched `b677293` before changes.
  DPR's authenticated Vercel dashboard later confirmed the live source commit
  as `b677293` on `main` in `desire-path-radio-working-2025-10-10`.
- The live proposal page rendered normally and had no CAPTCHA.
- Resend's available email listing contained four show proposals dated September
  18, October 4, October 5, and October 7 (UTC); all had `last_event: delivered`.
  This does not prove inbox placement, reveal attempts that never reached Resend,
  or establish that any legitimate proposal was lost.
- The existing handler returned errors on Resend failures, but the form used a
  generic failure message. There was no server field validation or CAPTCHA.
- The installed Vercel login exposed only Andrew's personal team, not DPR's
  project. DPR's authenticated Safari session later provided dashboard access.
  The matching managed Cloudflare widget and Production public/Secret variables
  were configured before the CAPTCHA release; keys are not stored in this repo.
- Local browser verification used an official dummy widget, an empty server
  CAPTCHA secret, and a placeholder email key. A controlled 503 retained the
  proposal text and allowed verification retry; no live proposal email was sent.
- Type checking passed. The existing ESLint FlatCompat configuration fails with
  the installed Next 16 flat config; focused lint passed using a temporary config
  with the installed Next presets. The existing Turbopack dev cache failed to
  open; `next dev --webpack` worked without clearing or changing the cache.
- The production build passed with `next build --webpack`. The normal script uses
  Turbopack; its earlier dev-cache failure remains outside this change.

References: [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/),
[Turnstile testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/),
[Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).
