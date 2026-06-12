/**
 * Email service using Nodemailer with Gmail SMTP
 * All emails are sent to kenzaachouk@gmail.com for testing
 * 
 * Setup: Create a Gmail App Password at https://myaccount.google.com/apppasswords
 * Then set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local
 */

import nodemailer from "nodemailer"

const GMAIL_USER = process.env.GMAIL_USER || "kenzaachouk@gmail.com"
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || ""
const TEST_EMAIL = "kenzaachouk@gmail.com"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
})

interface EmailOptions {
  to?: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { subject, html } = options
  // Override recipient for testing — all emails go to test address
  const to = TEST_EMAIL

  if (!GMAIL_APP_PASSWORD) {
    console.warn(`⚠️ GMAIL_APP_PASSWORD not set — email skipped: "${subject}"`)
    return false
  }

  try {
    await transporter.sendMail({
      from: `"IntelliConnect - Capgemini" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`✅ Email sent: "${subject}" -> ${to}`)
    return true
  } catch (error) {
    // Don't crash if email fails — log and continue
    console.warn(`⚠️ Email error: "${subject}"`, error instanceof Error ? error.message : error)
    return false
  }
}
