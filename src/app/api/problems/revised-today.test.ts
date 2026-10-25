import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as revisedTodayHandler } from './revised-today/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    revision: {
      findMany: vi.fn(),
    },
  },
}));

describe('GET /api/problems/revised-today', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth as any).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/problems/revised-today');
    const res = await revisedTodayHandler(req);
    expect(res.status).toBe(401);
  });

  it('returns empty array when user has no revisions today', async () => {
    vi.mocked(auth as any).mockResolvedValue({ user: { id: 'u1' } } as any);
    vi.mocked(prisma.revision.findMany).mockResolvedValue([]);

    const req = new NextRequest('http://localhost/api/problems/revised-today');
    const res = await revisedTodayHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual([]);
  });

  it('returns formatted list with latest revision when revisions exist today', async () => {
    vi.mocked(auth as any).mockResolvedValue({ user: { id: 'u1' } } as any);
    const now = new Date();
    vi.mocked(prisma.revision.findMany).mockResolvedValue([
      {
        id: 'rev-1',
        problemId: 'p1',
        confidence: 'CLEAN',
        type: 'REGULAR',
        stepBefore: 0,
        stepAfter: 1,
        revisedAt: now,
        problem: {
          id: 'p1',
          title: 'Two Sum',
          difficulty: 'EASY',
          topic: 'Arrays',
        },
      },
    ] as any);

    const req = new NextRequest('http://localhost/api/problems/revised-today');
    const res = await revisedTodayHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.length).toBe(1);
    expect(json[0].id).toBe('p1');
    expect(json[0].title).toBe('Two Sum');
    expect(json[0].latestRevision.confidence).toBe('CLEAN');
  });
});
