import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as forgotPasswordHandler } from './forgot-password/route';
import { POST as resetPasswordHandler } from './reset-password/route';
import { prisma } from '@/lib/prisma';
import * as mail from '@/lib/mail';
import { User, VerificationToken } from '@prisma/client';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    verificationToken: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/mail', () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when email is missing', async () => {
    const req = new NextRequest('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await forgotPasswordHandler(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe('Email is required');
  });

  it('returns generic success if user does not exist (prevents email enumeration)', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com' }),
    });
    const res = await forgotPasswordHandler(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(prisma.verificationToken.create).not.toHaveBeenCalled();
  });

  it('returns 400 if user signed up with OAuth and has no password', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'oauth-user',
      email: 'oauth@example.com',
      password: null,
      name: 'OAuth User',
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
    } as unknown as User);

    const req = new NextRequest('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'oauth@example.com' }),
    });
    const res = await forgotPasswordHandler(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain('Google or GitHub');
  });

  it('generates token and sends reset email for valid credentials user', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'valid-user',
      email: 'user@example.com',
      password: 'hashed-password',
      name: 'Valid User',
      emailVerified: new Date(),
      image: null,
      createdAt: new Date(),
    } as unknown as User);
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.verificationToken.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.verificationToken.create).mockResolvedValue({} as unknown as VerificationToken);

    const req = new NextRequest('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    });
    const res = await forgotPasswordHandler(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: 'reset:user@example.com' },
    });
    expect(prisma.verificationToken.create).toHaveBeenCalled();
    expect(mail.sendPasswordResetEmail).toHaveBeenCalled();
  });
});

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates required fields', async () => {
    const req = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', code: '123' }),
    });
    const res = await resetPasswordHandler(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for password less than 8 characters', async () => {
    const req = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', code: '123456', newPassword: 'short' }),
    });
    const res = await resetPasswordHandler(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain('8 characters');
  });

  it('returns 400 when token is not found or expired', async () => {
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', code: '123456', newPassword: 'newpassword123' }),
    });
    const res = await resetPasswordHandler(req);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain('Invalid or expired reset code');
  });

  it('resets password and marks emailVerified if valid token provided', async () => {
    vi.mocked(prisma.verificationToken.findFirst).mockResolvedValue({
      identifier: 'reset:user@example.com',
      token: '123456',
      expires: new Date(Date.now() + 60000),
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'valid-user',
      email: 'user@example.com',
      emailVerified: null,
    } as unknown as User);
    vi.mocked(prisma.user.update).mockResolvedValue({} as unknown as User);
    vi.mocked(prisma.verificationToken.deleteMany).mockResolvedValue({ count: 1 });

    const req = new NextRequest('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com', code: '123456', newPassword: 'brandnewpassword123' }),
    });
    const res = await resetPasswordHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'user@example.com' },
        data: expect.objectContaining({
          emailVerified: expect.any(Date),
        }),
      })
    );
    expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: 'reset:user@example.com' },
    });
  });
});
