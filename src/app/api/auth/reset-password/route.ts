// POST /api/auth/reset-password — verify 6-digit OTP code and update password

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, reset code, and new password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = String(code).trim();

    if (cleanCode.length !== 6) {
      return NextResponse.json(
        { error: 'Reset code must be 6 digits.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const tokenIdentifier = `reset:${normalizedEmail}`;

    // Verify token exists and hasn't expired
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: tokenIdentifier,
        token: cleanCode,
        expires: { gt: new Date() },
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset code. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address.' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and ensure emailVerified is set (since they proved email ownership)
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: {
        password: hashedPassword,
        emailVerified: user.emailVerified ?? new Date(),
      },
    });

    // Delete all reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: tokenIdentifier },
    });

    return NextResponse.json(
      { success: true, message: 'Password reset successfully! Please sign in with your new password.' },
      { status: 200 }
    );
  } catch (e) {
    console.error('[POST /api/auth/reset-password]', e);
    return NextResponse.json(
      { error: 'Something went wrong while resetting your password.' },
      { status: 500 }
    );
  }
}
