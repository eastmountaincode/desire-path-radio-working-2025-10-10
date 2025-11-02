import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const formData = await request.json()

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
    } = formData

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
            This submission was sent from the Desire Path Radio website on ${new Date().toLocaleString()}.
          </p>
        </body>
      </html>
    `

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Desire Path Radio <hello@showsubmissions.desirepathradio.com>',
      to: [process.env.SUBMISSION_EMAIL!], // Your client's email
      subject: `New Show Proposal: ${showName}`,
      html: emailHtml,
      replyTo: email, // Allow easy reply to submitter
    })

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (err) {
    console.error('Error processing form submission:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
