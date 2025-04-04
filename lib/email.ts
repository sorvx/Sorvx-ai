import nodemailer from "nodemailer"

// Create a transporter using SMTP configuration
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Email template for password reset
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const appName = process.env.APP_NAME || "Sorvx AI"

  try {
    const info = await transporter.sendMail({
      from: `"${appName}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: email,
      subject: `Reset Your ${appName} Password`,
      text: `
        Hello,
        
        You requested to reset your password for ${appName}.
        
        Please click the link below to reset your password:
        ${resetLink}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        Regards,
        The ${appName} Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>You requested to reset your password for <strong>${appName}</strong>.</p>
          <p>Please click the button below to reset your password:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #4f46e5;">${resetLink}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Regards,<br>The ${appName} Team</p>
        </div>
      `,
    })

    console.log("Password reset email sent:", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return false
  }
}

