import { Resend } from 'resend';

// Initialize Resend if API key is present
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.EMAIL_FROM || 'Recall <noreply@recallx.tech>';

interface SendVerificationEmailParams {
  email: string;
  code: string;
  name?: string | null;
}

export async function sendVerificationEmail({ email, code, name }: SendVerificationEmailParams): Promise<{ success: boolean; error?: string }> {
  const greeting = name ? `Hi ${name},` : 'Hello,';

  // If no Resend API key is configured or we're in dev without key, log to console
  if (!resend) {
    console.log('\n================================================================');
    console.log(`🔑 [RECALL AUTH OTP] Verification Code for ${email}`);
    console.log(`👉 Code: ${code} (Expires in 10 minutes)`);
    console.log('💡 Note: Set RESEND_API_KEY in .env to send real emails via Resend');
    console.log('================================================================\n');
    return { success: true };
  }

  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Recall Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #131315; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 36px 28px; text-align: left; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Logo -->
          <tr>
            <td style="padding-bottom: 24px;">
              <span style="font-family: monospace; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                recall<span style="color: #ff6b00;">.</span>
              </span>
            </td>
          </tr>
          <!-- Main Content -->
          <tr>
            <td style="padding-bottom: 12px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: -0.01em;">Verify your email address</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px; font-size: 14px; line-height: 1.5; color: #a1a1aa;">
              ${greeting} Please enter this 6-digit verification code to complete your signup on Recall.
            </td>
          </tr>
          <!-- OTP Box -->
          <tr>
            <td style="padding-bottom: 24px;" align="center">
              <div style="background-color: #1a1a1d; border: 1px solid #2a2a2e; border-radius: 10px; padding: 18px 24px; text-align: center;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #ffffff; margin-left: 8px;">
                  ${code}
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 28px; font-size: 13px; color: #71717a; line-height: 1.5;">
              ⏱️ This code will expire in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid #27272a; padding-top: 20px; font-size: 12px; color: #52525b;">
              Recall • Spaced Repetition for LeetCode & Coding Problems
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `${code} is your Recall verification code`,
      html: htmlContent,
    });

    if (error) {
      console.error('[sendVerificationEmail] Resend API error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
    console.error('[sendVerificationEmail] Unexpected error:', err);
    return { success: false, error: errorMessage };
  }
}

interface SendPasswordResetEmailParams {
  email: string;
  code: string;
  name?: string | null;
}

export async function sendPasswordResetEmail({ email, code, name }: SendPasswordResetEmailParams): Promise<{ success: boolean; error?: string }> {
  const greeting = name ? `Hi ${name},` : 'Hello,';

  if (!resend) {
    console.log('\n================================================================');
    console.log(`🔑 [RECALL PASSWORD RESET OTP] Reset Code for ${email}`);
    console.log(`👉 Code: ${code} (Expires in 10 minutes)`);
    console.log('💡 Note: Set RESEND_API_KEY in .env to send real emails via Resend');
    console.log('================================================================\n');
    return { success: true };
  }

  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Recall Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #131315; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 36px 28px; text-align: left; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Logo -->
          <tr>
            <td style="padding-bottom: 24px;">
              <span style="font-family: monospace; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                recall<span style="color: #ff6b00;">.</span>
              </span>
            </td>
          </tr>
          <!-- Main Content -->
          <tr>
            <td style="padding-bottom: 12px;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; letter-spacing: -0.01em;">Reset your password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px; font-size: 14px; line-height: 1.5; color: #a1a1aa;">
              ${greeting} We received a request to reset your Recall password. Enter this 6-digit code to choose a new password.
            </td>
          </tr>
          <!-- OTP Box -->
          <tr>
            <td style="padding-bottom: 24px;" align="center">
              <div style="background-color: #1a1a1d; border: 1px solid #2a2a2e; border-radius: 10px; padding: 18px 24px; text-align: center;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #ffffff; margin-left: 8px;">
                  ${code}
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 28px; font-size: 13px; color: #71717a; line-height: 1.5;">
              ⏱️ This code will expire in <strong>10 minutes</strong>. If you did not request a password reset, your account is safe and you can ignore this email.
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid #27272a; padding-top: 20px; font-size: 12px; color: #52525b;">
              Recall • Spaced Repetition for LeetCode & Coding Problems
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `${code} is your Recall password reset code`,
      html: htmlContent,
    });

    if (error) {
      console.error('[sendPasswordResetEmail] Resend API error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
    console.error('[sendPasswordResetEmail] Unexpected error:', err);
    return { success: false, error: errorMessage };
  }
}

