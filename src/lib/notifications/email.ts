// src/lib/notifications/email.ts
// SendGrid email client — transactional emails
// All emails use the verified sender from SENDGRID_FROM_EMAIL

import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const FROM = process.env.SENDGRID_FROM_EMAIL!
const APP_NAME = 'Sure Word Glorious Gospel Assembly'

// ─── Base send function ───────────────────────────────────────────────────────

export async function sendEmail(to: string, subject: string, html: string) {
  await sgMail.send({
    to,
    from: { email: FROM, name: APP_NAME },
    subject,
    html,
  })
}

// ─── Email templates ──────────────────────────────────────────────────────────

const baseStyle = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
`

const headerStyle = `
  background: linear-gradient(135deg, #0D1B2A 0%, #1E3A8A 100%);
  padding: 32px 40px;
  text-align: center;
`

const bodyStyle = `
  padding: 40px;
  color: #374151;
  line-height: 1.6;
`

const footerStyle = `
  background: #F9FAFB;
  padding: 24px 40px;
  text-align: center;
  color: #9CA3AF;
  font-size: 12px;
  border-top: 1px solid #E5E7EB;
`

const btnStyle = `
  display: inline-block;
  background: #1E3A8A;
  color: #ffffff !important;
  text-decoration: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  margin: 24px 0;
`

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Sure Word GGA</title>
    </head>
    <body style="margin:0;padding:0;background:#F3F4F6;">
      <div style="${baseStyle}">
        <div style="${headerStyle}">
          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
            Sure Word GGA
          </h1>
          <p style="color:#93C5FD;margin:6px 0 0;font-size:13px;">
            Warri, Delta State, Nigeria
          </p>
        </div>
        <div style="${bodyStyle}">
          ${content}
        </div>
        <div style="${footerStyle}">
          <p style="margin:0 0 4px;">Sure Word Glorious Gospel Assembly</p>
          <p style="margin:0 0 4px;">Warri, Delta State, Nigeria</p>
          <p style="margin:0;">
            <a href="https://swgga.vercel.app" style="color:#1E3A8A;">swgga.vercel.app</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// ─── Verification email ───────────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  firstName: string,
  verifyUrl: string
) {
  const html = baseTemplate(`
    <h2 style="color:#1A1A1A;margin:0 0 16px;font-size:24px;">
      Welcome, ${firstName}! 🎉
    </h2>
    <p style="margin:0 0 16px;">
      Thank you for creating an account with Sure Word GGA. We are glad to have you
      as part of our community.
    </p>
    <p style="margin:0 0 16px;">
      Please verify your email address by clicking the button below. This link
      expires in <strong>24 hours</strong>.
    </p>
    <div style="text-align:center;">
      <a href="${verifyUrl}" style="${btnStyle}">
        Verify Email Address
      </a>
    </div>
    <p style="margin:16px 0 0;font-size:13px;color:#6B7280;">
      If you did not create this account, you can safely ignore this email.
    </p>
    <p style="margin:8px 0 0;font-size:13px;color:#6B7280;">
      If the button above does not work, copy and paste this link into your browser:
      <br>
      <a href="${verifyUrl}" style="color:#1E3A8A;word-break:break-all;">
        ${verifyUrl}
      </a>
    </p>
  `)

  await sendEmail(to, 'Verify your Sure Word GGA account', html)
}

// ─── Welcome email (after verification) ──────────────────────────────────────

export async function welcomeEmail(to: string, firstName: string) {
  const html = baseTemplate(`
    <h2 style="color:#1A1A1A;margin:0 0 16px;font-size:24px;">
      Your account is verified! ✅
    </h2>
    <p style="margin:0 0 16px;">
      Hi ${firstName}, your Sure Word GGA account is now fully active.
    </p>
    <p style="margin:0 0 16px;">
      You can now access the member portal to:
    </p>
    <ul style="margin:0 0 16px;padding-left:20px;color:#374151;">
      <li style="margin-bottom:8px;">Read and listen to daily devotionals</li>
      <li style="margin-bottom:8px;">Watch sermon recordings</li>
      <li style="margin-bottom:8px;">Register for upcoming events</li>
      <li style="margin-bottom:8px;">Submit and track prayer requests</li>
      <li style="margin-bottom:8px;">View your giving history</li>
    </ul>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/dashboard" style="${btnStyle}">
        Go to Member Portal
      </a>
    </div>
  `)

  await sendEmail(to, 'Welcome to Sure Word GGA!', html)
}

// ─── Giving receipt email ─────────────────────────────────────────────────────

export async function givingReceiptEmail(
  to: string,
  firstName: string,
  amount: number,
  fund: string,
  reference: string,
  date: string
) {
  const html = baseTemplate(`
    <h2 style="color:#1A1A1A;margin:0 0 16px;font-size:24px;">
      Giving Receipt 🙏
    </h2>
    <p style="margin:0 0 16px;">
      Dear ${firstName}, thank you for your faithful giving. Your generosity
      makes a difference in our community and beyond.
    </p>
    <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;
                padding:20px;margin:0 0 16px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6B7280;font-size:14px;">Amount</td>
          <td style="padding:8px 0;text-align:right;font-weight:700;
                     color:#1A1A1A;font-size:18px;">
            ₦${amount.toLocaleString()}
          </td>
        </tr>
        <tr style="border-top:1px solid #E5E7EB;">
          <td style="padding:8px 0;color:#6B7280;font-size:14px;">Fund</td>
          <td style="padding:8px 0;text-align:right;color:#1A1A1A;font-size:14px;">
            ${fund}
          </td>
        </tr>
        <tr style="border-top:1px solid #E5E7EB;">
          <td style="padding:8px 0;color:#6B7280;font-size:14px;">Reference</td>
          <td style="padding:8px 0;text-align:right;color:#1A1A1A;
                     font-size:14px;font-family:monospace;">
            ${reference}
          </td>
        </tr>
        <tr style="border-top:1px solid #E5E7EB;">
          <td style="padding:8px 0;color:#6B7280;font-size:14px;">Date</td>
          <td style="padding:8px 0;text-align:right;color:#1A1A1A;font-size:14px;">
            ${date}
          </td>
        </tr>
      </table>
    </div>
    <p style="margin:0;font-size:13px;color:#6B7280;">
      Please keep this receipt for your records. May God bless you abundantly.
    </p>
  `)

  await sendEmail(to, `Giving Receipt — ₦${amount.toLocaleString()} (${fund})`, html)
}

// ─── Devotional alert email ───────────────────────────────────────────────────

export async function devotionalAlertEmail(
  to: string,
  firstName: string,
  title: string,
  episode: number,
  readUrl: string
) {
  const html = baseTemplate(`
    <h2 style="color:#1A1A1A;margin:0 0 16px;font-size:24px;">
      Pastor Chii Daily — Episode ${episode}
    </h2>
    <p style="margin:0 0 16px;">
      Hi ${firstName}, a new devotional is available:
    </p>
    <div style="background:#EBF0FA;border-left:4px solid #1E3A8A;
                padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 16px;">
      <p style="margin:0;font-weight:700;color:#1A1A1A;font-size:16px;">
        "${title}"
      </p>
      <p style="margin:6px 0 0;color:#6B7280;font-size:13px;">
        Episode ${episode}
      </p>
    </div>
    <div style="text-align:center;">
      <a href="${readUrl}" style="${btnStyle}">
        Read Today's Devotional
      </a>
    </div>
  `)

  await sendEmail(to, `Pastor Chii Daily Ep.${episode}: "${title}"`, html)
}

// ─── Event registration confirmation email ────────────────────────────────────

export async function eventRegistrationEmail(
  to: string,
  firstName: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string
) {
  const html = baseTemplate(`
    <h2 style="color:#1A1A1A;margin:0 0 16px;font-size:24px;">
      Registration Confirmed! 🎉
    </h2>
    <p style="margin:0 0 16px;">
      Hi ${firstName}, you are registered for:
    </p>
    <div style="background:#EBF0FA;border-left:4px solid #1E3A8A;
                padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 16px;">
      <p style="margin:0;font-weight:700;color:#1A1A1A;font-size:16px;">
        ${eventTitle}
      </p>
      <p style="margin:6px 0 0;color:#6B7280;font-size:13px;">
        📅 ${eventDate}
      </p>
      <p style="margin:4px 0 0;color:#6B7280;font-size:13px;">
        📍 ${eventLocation}
      </p>
    </div>
    <p style="margin:0 0 16px;">
      We look forward to seeing you. God bless you!
    </p>
    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/events" style="${btnStyle}">
        View My Events
      </a>
    </div>
  `)

  await sendEmail(to, `Registration Confirmed: ${eventTitle}`, html)
}
