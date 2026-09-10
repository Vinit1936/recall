// POST /api/auth/forgot-password — send 6-digit OTP code to reset password with 60s cooldown

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // If user doesn't exist, return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If an account exists with this email, a reset code has been sent.' },
        { status: 200 }
      );
    }

    // If user registered with OAuth and has no password
    if (!user.password) {
      return NextResponse.json(
        { error: 'This account was created using Google or GitHub. Please sign in with your provider.' },
        { status: 400 }
      );
    }

    // Check if a reset token was created in the last 60 seconds (10 min expiry = 600s, > 540s remaining means < 60s elapsed)
    const tokenIdentifier = `reset:${normalizedEmail}`;
    const existingToken = await prisma.verificationToken.findFirst({
      where: { identifier: tokenIdentifier },
    });

    if (existingToken) {
      const remainingMs = existingToken.expires.getTime() - Date.now();
      const elapsedMs = 10 * 60 * 1000 - remainingMs;
      if (elapsedMs < 60 * 1000 && elapsedMs >= 0) {
        const waitSec = Math.ceil((60 * 1000 - elapsedMs) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSec}s before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    // Generate fresh 6-digit numeric OTP
    const code = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Clean up old reset tokens for this email and save new one
    await prisma.verificationToken.deleteMany({
      where: { identifier: tokenIdentifier },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: tokenIdentifier,
        token: code,
        expires,
      },
    });

    const mailResult = await sendPasswordResetEmail({
      email: normalizedEmail,
      code,
      name: user.name,
    });

    if (!mailResult.success) {
      console.warn('[forgot-password] Email send failed:', mailResult.error);
    }

    return NextResponse.json(
      { success: true, message: 'If an account exists with this email, a reset code has been sent.' },
      { status: 200 }
    );
  } catch (e) {
    console.error('[POST /api/auth/forgot-password]', e);
    return NextResponse.json(
      { error: 'Failed to process password reset request. Please try again.' },
      { status: 500 }
    );
  }
}
