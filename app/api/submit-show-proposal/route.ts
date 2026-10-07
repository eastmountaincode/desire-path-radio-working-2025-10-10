import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createHash, randomUUID } from 'node:crypto'
import { escapeHtml, parseProposal } from '@/lib/show-proposal'
import { verifyProposalCaptcha } from '@/lib/turnstile'

export const runtime = 'nodejs'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request: Request) {
  const requestId = randomUUID()
  const failure = (error: string, status: number, outcome: string) => {
    console.warn('show_proposal', { requestId, outcome })
    return NextResponse.json({ error, requestId }, { status })
  }
  let input
  try {
    input = await request.json()
  } catch {
    return failure('Please check your form and try again.', 400, 'invalid_json')
  }
  const proposal = parseProposal(input)
  if (!proposal || typeof input.submissionId !== 'string' || !uuidPattern.test(input.submissionId)) {
    return failure('Please complete the required fields with valid text and an email address, then try again.', 400, 'invalid_form')
  }
  if (!process.env.RESEND_API_KEY || !process.env.SUBMISSION_EMAIL) {
    return failure('Submissions are temporarily unavailable. Your form text is still here; please try again later.', 503, 'email_not_configured')
  }
  const captcha = await verifyProposalCaptcha(input.captchaToken)
  if (captcha !== 'valid') {
    return captcha === 'invalid'
      ? failure('Verification expired or failed. Please complete verification again and retry.', 400, 'captcha_rejected')
      : failure('Verification is temporarily unavailable. Please retry verification in a moment.', 503, 'captcha_unavailable')
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    // Same proposal and browser attempt reuse the same email key on retry.
    const payloadHash = createHash('sha256').update(JSON.stringify(proposal)).digest('hex')
    const idempotencyKey = `show-proposal/${input.submissionId}/${payloadHash}`
    const escaped = Object.fromEntries(Object.entries(proposal).map(([key, value]) => [key, escapeHtml(value)]))

    const {
      firstName,
      lastName,
      email,
      phone,
      showName,
      location,
      category,
      frequency,
      oneLiner,
      fullDescription,
      relevantExperience,
      howDidYouHear,
      anythingElse
    } = escaped

    // Create email HTML content
    const emailHtml = `
      <html>
        <body style="font-family: monospace; color: #111111; line-height: 1.6;">
          <h1 style="font-size: 24px; margin-bottom: 20px;">New Show Proposal Submission</h1>

          <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 10px;">Contact Information</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>

          <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 10px;">Show Details</h2>
          <p><strong>Show Name:</strong> ${showName}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Frequency:</strong> ${frequency}</p>

          <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 10px;">Show Description</h2>
          <p><strong>One-liner:</strong> ${oneLiner}</p>
          <p><strong>Full Description:</strong></p>
          <p style="white-space: pre-wrap;">${fullDescription}</p>

          <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 10px;">Additional Information</h2>
          <p><strong>Relevant Experience:</strong></p>
          <p style="white-space: pre-wrap;">${relevantExperience || 'Not provided'}</p>

          <p><strong>How did you hear about DPR:</strong> ${howDidYouHear || 'Not provided'}</p>

          ${anythingElse ? `
            <p><strong>Anything else:</strong></p>
            <p style="white-space: pre-wrap;">${anythingElse}</p>
          ` : ''}

          <hr style="margin-top: 40px; border: none; border-top: 1px solid #D9D9D9;">
          <p style="font-size: 12px; color: #626262; margin-top: 20px;">
            This submission was sent from the Desire Path Radio website.
          </p>
        </body>
      </html>
    `

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Desire Path Radio <hello@showsubmissions.desirepathradio.com>',
      to: [process.env.SUBMISSION_EMAIL!], // Your client's email
      subject: `New Show Proposal: ${proposal.showName}`,
      html: emailHtml,
      replyTo: proposal.email, // Allow easy reply to submitter
    }, { idempotencyKey })

    if (error || !data?.id) {
      return failure('We could not confirm your submission. Your form text is still here; please complete verification again and retry.', 502, 'email_not_accepted')
    }

    console.info('show_proposal', { requestId, outcome: 'email_accepted', emailId: data.id })
    return NextResponse.json({ success: true, requestId })

  } catch {
    return failure('We could not confirm your submission. Your form text is still here; please complete verification again and retry.', 502, 'email_request_failed')
  }
}
