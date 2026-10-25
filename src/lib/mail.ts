import { Resend } from 'resend';

// Initialize Resend if API key is present
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.EMAIL_FROM || 'Recall <onboarding@resend.dev>';

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

export interface GoalProblemItem {
  id: string;
  platform: string;
  problemNumber: number;
  title: string;
  url: string;
  difficulty: string;
  topic: string;
  isOverdue?: boolean;
}

export interface SendDailyGoalEmailParams {
  email: string;
  name?: string | null;
  targetCount: number;
  streak?: number;
  problems: GoalProblemItem[];
  appUrl?: string;
}

export const OFFICIAL_APP_URL = 'https://recallx.tech';

export function getOfficialProblemUrl(p: GoalProblemItem): string {
  if (p.url && !p.url.includes('localhost') && !p.url.includes('127.0.0.1') && (p.url.startsWith('http://') || p.url.startsWith('https://'))) {
    return p.url;
  }
  const platform = (p.platform || 'LEETCODE').toUpperCase();
  if (platform === 'LEETCODE' && p.title) {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `https://leetcode.com/problems/${slug}/`;
  }
  return `${OFFICIAL_APP_URL}/daily`;
}

export async function sendDailyGoalEmail({
  email,
  name,
  targetCount,
  streak = 0,
  problems,
  appUrl,
}: SendDailyGoalEmailParams): Promise<{ success: boolean; error?: string }> {
  const greeting = name ? `Hi ${name},` : 'Hello,';
  // Always enforce official production app URL in emails to never send localhost links
  const cleanAppUrl = OFFICIAL_APP_URL;
  const dailyQueueUrl = `${cleanAppUrl}/daily`;

  if (!resend) {
    console.log('\n================================================================');
    console.log(`🎯 [RECALL DAILY GOAL EMAIL] Goal for ${email}`);
    console.log(`👉 Target: ${targetCount} problems/day | Queue items: ${problems.length}`);
    console.log('Problems to solve today:');
    problems.forEach((p, idx) => console.log(`   ${idx + 1}. [${p.platform} #${p.problemNumber}] ${p.title} (${p.difficulty}) - ${getOfficialProblemUrl(p)}`));
    console.log(`👉 Queue Link: ${dailyQueueUrl}`);
    console.log('================================================================\n');
    return { success: true };
  }

  // Generate problem rows HTML
  const problemCardsHtml = problems.length > 0
    ? problems.map((p, index) => {
        const diff = (p.difficulty || 'MEDIUM').toUpperCase();
        let diffBg = '#451a03';
        let diffColor = '#fbbf24';
        let diffBorder = '#d97706';

        if (diff === 'EASY') {
          diffBg = '#064e3b';
          diffColor = '#34d399';
          diffBorder = '#059669';
        } else if (diff === 'HARD') {
          diffBg = '#450a0a';
          diffColor = '#f87171';
          diffBorder = '#dc2626';
        }

        const platformName = p.platform || 'LEETCODE';
        const numLabel = p.problemNumber > 0 ? `#${p.problemNumber}` : '';
        const problemLink = getOfficialProblemUrl(p);

        return `
          <div style="background-color: #161619; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px 18px; margin-bottom: 12px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="left">
                  <span style="font-family: monospace; font-size: 11px; font-weight: 600; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em;">
                    ${index + 1}. ${platformName} ${numLabel}
                  </span>
                </td>
                <td align="right">
                  <span style="font-family: monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; background-color: ${diffBg}; color: ${diffColor}; border: 1px solid ${diffBorder}; border-radius: 4px; padding: 2px 7px;">
                    ${diff}
                  </span>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 8px; padding-bottom: 8px;">
                  <a href="${problemLink}" target="_blank" rel="noopener noreferrer" style="font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; display: inline-block;">
                    ${p.title} <span style="font-size: 12px; color: #ff6b00;">↗</span>
                  </a>
                </td>
              </tr>
              <tr>
                <td align="left" style="font-size: 12px; color: #71717a;">
                  Topic: <strong style="color: #e4e4e7;">${p.topic || 'General'}</strong>
                </td>
                <td align="right">
                  <a href="${problemLink}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; color: #ff6b00; font-weight: 600; text-decoration: none;">
                    Solve Problem &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </div>
        `;
      }).join('')
    : `
      <div style="background-color: #161619; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 16px;">
        <p style="font-size: 14px; color: #a1a1aa; margin: 0 0 12px 0;">
          🎉 You have no pending problems due right now! Add new problems to your tracker to schedule your next revision cycle.
        </p>
        <a href="${cleanAppUrl}/dashboard" style="color: #ff6b00; font-weight: 600; font-size: 13px; text-decoration: none;">
          Go to Dashboard &rarr;
        </a>
      </div>
    `;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Today's Revision Goal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #111113; border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 16px; padding: 36px 28px; text-align: left; box-shadow: 0 12px 40px rgba(0,0,0,0.6);">
          <!-- Header Bar -->
          <tr>
            <td style="padding-bottom: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.07);">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-family: monospace; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                      recall<span style="color: #ff6b00;">.</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #ff8833; background-color: rgba(255, 107, 0, 0.12); border: 1px solid rgba(255, 107, 0, 0.3); border-radius: 20px; padding: 4px 12px; text-transform: uppercase;">
                      DAILY GOAL: ${targetCount}/DAY
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Headline -->
          <tr>
            <td style="padding-top: 24px; padding-bottom: 8px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                Today's Revision Goal: ${problems.length > 0 ? `${problems.length} Problem${problems.length === 1 ? '' : 's'}` : 'All Clear'}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 20px; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
              ${greeting} You've committed to a target of <strong>${targetCount} problems per day</strong>. Active recall and spaced intervals convert short-term problem solving into lasting technical interview intuition. Here are your questions for today:
            </td>
          </tr>

          <!-- Stats Strip -->
          <tr>
            <td style="padding-bottom: 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #161619; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 12px 16px;">
                <tr>
                  <td width="33%" align="center" style="border-right: 1px solid rgba(255, 255, 255, 0.08);">
                    <div style="font-family: monospace; font-size: 11px; color: #71717a; text-transform: uppercase;">Daily Target</div>
                    <div style="font-family: monospace; font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 2px;">${targetCount}</div>
                  </td>
                  <td width="33%" align="center" style="border-right: 1px solid rgba(255, 255, 255, 0.08);">
                    <div style="font-family: monospace; font-size: 11px; color: #71717a; text-transform: uppercase;">Current Streak</div>
                    <div style="font-family: monospace; font-size: 18px; font-weight: 700; color: #fbbf24; margin-top: 2px;">${streak}d 🔥</div>
                  </td>
                  <td width="33%" align="center">
                    <div style="font-family: monospace; font-size: 11px; color: #71717a; text-transform: uppercase;">Queued</div>
                    <div style="font-family: monospace; font-size: 18px; font-weight: 700; color: #34d399; margin-top: 2px;">${problems.length}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Problem List Section -->
          <tr>
            <td style="padding-bottom: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #71717a; letter-spacing: 0.06em;">
                SCHEDULED PROBLEMS
              </span>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 24px;">
              ${problemCardsHtml}
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #ff6b00 0%, #ea580c 100%); box-shadow: 0 4px 16px rgba(255, 107, 0, 0.35);">
                    <a href="${dailyQueueUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 13px 32px; display: inline-block; letter-spacing: -0.01em;">
                      Open Recall Daily Queue &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Motivational Tip -->
          <tr>
            <td style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px; font-size: 12px; color: #71717a; line-height: 1.5;">
              💡 <strong>Pro Tip:</strong> Strive for understanding the pattern, not memorizing code. When revising in Recall, mark Clean, Shaky, or Struggled to dynamically calibrate future review intervals.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 16px; font-size: 11px; color: #52525b; text-align: center;">
              Recall • Turn Solved Problems Into Lasting Intuition<br>
              <a href="${cleanAppUrl}" style="color: #71717a; text-decoration: underline;">recallx.tech</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `🎯 Today's Revision Goal: ${problems.length > 0 ? `${problems.length} Problem${problems.length === 1 ? '' : 's'}` : 'Review Queue'} (${targetCount}/day)`,
      html: htmlContent,
    });

    if (error) {
      console.error('[sendDailyGoalEmail] Resend API error:', error);
      // If error is domain verification, retry with onboarding@resend.dev as backup
      if (fromEmail !== 'Recall <onboarding@resend.dev>' && error.message?.toLowerCase().includes('domain')) {
        console.log('[sendDailyGoalEmail] Retrying with fallback sender onboarding@resend.dev...');
        const retry = await resend.emails.send({
          from: 'Recall <onboarding@resend.dev>',
          to: email,
          subject: `🎯 Today's Revision Goal: ${problems.length > 0 ? `${problems.length} Problem${problems.length === 1 ? '' : 's'}` : 'Review Queue'} (${targetCount}/day)`,
          html: htmlContent,
        });
        if (retry.error) {
          return { success: false, error: retry.error.message };
        }
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to send daily goal email';
    console.error('[sendDailyGoalEmail] Unexpected error:', err);
    return { success: false, error: errorMessage };
  }
}


