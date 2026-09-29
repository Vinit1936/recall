import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as undoRevisionHandler } from './[id]/undo-revision/route';
import { PATCH as reviseHandler } from './[id]/revise/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    problem: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    revision: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    streakLog: {
      upsert: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => {
      return callback({
        revision: {
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
        problem: {
          update: vi.fn((args) => args.data),
        },
      });
    }),
  },
}));

describe('POST /api/problems/[id]/undo-revision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth as any).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/problems/p1/undo-revision', { method: 'POST' });
    const res = await undoRevisionHandler(req, { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(401);
  });

  it('returns 404 when problem not found', async () => {
    vi.mocked(auth as any).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.problem.findFirst).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/problems/p1/undo-revision', { method: 'POST' });
    const res = await undoRevisionHandler(req, { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(404);
  });

  it('returns 400 when problem has no revisions to undo', async () => {
    vi.mocked(auth as any).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.problem.findFirst).mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      createdAt: new Date(),
      revisionCount: 0,
      revisions: [],
    } as any);

    const req = new NextRequest('http://localhost/api/problems/p1/undo-revision', { method: 'POST' });
    const res = await undoRevisionHandler(req, { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(400);
  });

  it('successfully undoes the latest revision and decrements revision count', async () => {
    vi.mocked(auth as any).mockResolvedValue({ user: { id: 'u1' } } as any);
    const now = new Date();
    vi.mocked(prisma.problem.findFirst).mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      createdAt: new Date(now.getTime() - 86400000 * 3),
      revisionCount: 1,
      revisions: [
        {
          id: 'rev-1',
          stepBefore: 0,
          stepAfter: 1,
          type: 'REGULAR',
          confidence: 'CLEAN',
          revisedAt: now,
        },
      ],
    } as any);

    vi.mocked(prisma.revision.count).mockResolvedValue(0);

    const req = new NextRequest('http://localhost/api/problems/p1/undo-revision', { method: 'POST' });
    const res = await undoRevisionHandler(req, { params: Promise.resolve({ id: 'p1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.problem.currentStep).toBe(0);
    expect(json.problem.revisionCount).toBe(0);
    expect(json.problem.status).toBe('ACTIVE');
  });
});

describe('PATCH /api/problems/[id]/revise with replaceLatest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('re-applies the revision with new confidence without incrementing revisionCount', async () => {
    vi.mocked(auth as any).mockResolvedValue({ user: { id: 'u1' } } as any);
    const now = new Date();
    vi.mocked(prisma.problem.findFirst).mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      currentStep: 1,
      revisionCount: 1,
      status: 'ACTIVE',
      revisions: [
        {
          id: 'rev-1',
          stepBefore: 0,
          stepAfter: 1,
          type: 'REGULAR',
          confidence: 'CLEAN',
          revisedAt: now,
        },
      ],
    } as any);

    const req = new NextRequest('http://localhost/api/problems/p1/revise', {
      method: 'PATCH',
      body: JSON.stringify({ confidence: 'STRUGGLED', replaceLatest: true }),
    });
    const res = await reviseHandler(req, { params: Promise.resolve({ id: 'p1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.currentStep).toBe(0);
    expect(json.status).toBe('ACTIVE');
  });
});
