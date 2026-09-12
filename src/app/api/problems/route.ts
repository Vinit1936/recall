// GET  /api/problems — list all problems for the current user
// POST /api/problems — add a new problem to the tracker

import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getResolver } from '@/lib/platforms';
import { getInitialSchedule } from '@/lib/scheduling';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') ?? undefined;
    const topic = searchParams.get('topic') ?? undefined;

    // Direct Prisma query — no server-side unstable_cache.
    // SWR handles client-side caching; double-caching caused stale-data
    // race conditions where mutations appeared lost.
    const problems = await prisma.problem.findMany({
      where: {
        userId,
        ...(status ? { status: status as any } : {}),
        ...(topic ? { topic } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        revisions: {
          orderBy: { revisedAt: 'desc' },
          take: 1,
        },
      },
    });

    return Response.json(problems, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (e) {
    console.error('[GET /api/problems]', e);
    return Response.json({ error: 'Failed to fetch problems' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('[POST /api/problems] hit');
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const body = await request.json();
    const { platform, problemNumber, notes, dateSolved, customFields } = body;

    if (!platform) {
      return Response.json({ error: 'platform is required' }, { status: 400 });
    }

    const resolver = getResolver(platform);
    let meta: { title: string; difficulty: string; topic: string; url: string };

    if (resolver) {
      const result = await resolver.resolve(String(problemNumber));
      if (result.found) {
        meta = result.data;
      } else {
        const { title, difficulty, topic, url } = body;
        if (!title || !difficulty || !url) {
          return Response.json(
            { error: 'Problem not found in local dataset. Provide title, difficulty, and url manually.' },
            { status: 422 }
          );
        }
        meta = { title, difficulty, topic: topic || '', url };
      }
    } else {
      const { title, difficulty, topic, url } = body;
      if (!title || !difficulty || !url) {
        return Response.json(
          { error: 'Unknown platform. Provide title, difficulty, and url.' },
          { status: 422 }
        );
      }
      meta = { title, difficulty, topic: topic || '', url };
    }

    // Validate difficulty — it's a required enum; empty string will crash Prisma
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
    if (!validDifficulties.includes(meta.difficulty?.toUpperCase?.())) {
      return Response.json({ error: 'difficulty is required and must be EASY, MEDIUM, or HARD' }, { status: 400 });
    }

    const now = new Date();
    const solvedAt = dateSolved ? new Date(dateSolved) : now;
    const schedule = getInitialSchedule(isNaN(solvedAt.getTime()) ? now : solvedAt);

    let finalProblemNumber =
      typeof (meta as any).problemNumber === 'number' && (meta as any).problemNumber > 0
        ? (meta as any).problemNumber
        : parseInt(String(problemNumber), 10) || 0;

    // Safety net: If problemNumber is <= 0 for LeetCode, hash the URL slug so we never save duplicate 0s
    if (finalProblemNumber <= 0 && platform === 'LEETCODE' && meta.url) {
      const match = meta.url.match(/leetcode\.com\/problems\/([^/?#]+)/);
      if (match) {
        let hash = 5381;
        for (let i = 0; i < match[1].length; i++) {
          hash = ((hash << 5) + hash) + match[1].charCodeAt(i);
          hash |= 0;
        }
        finalProblemNumber = 100000 + (Math.abs(hash) % 899999);
      }
    }

    try {
      const problem = await prisma.problem.create({
        data: {
          userId,
          platform: platform as any,
          problemNumber: finalProblemNumber,
          title: meta.title,
          url: meta.url,
          difficulty: meta.difficulty as any,
          topic: meta.topic,
          dateSolved: dateSolved ? new Date(dateSolved) : now,
          notes: notes ?? null,
          customFields: customFields ?? {},
          currentStep: schedule.currentStep,
          nextRevisionAt: schedule.nextRevisionAt,
          status: schedule.status,
        },
      });

      return Response.json(problem, { status: 201 });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        return Response.json({ error: 'This problem already exists in your tracker.' }, { status: 409 });
      }
      throw e; // rethrow so the outer catch returns a proper 500
    }
  } catch (e) {
    console.error('[POST /api/problems]', e);
    return Response.json({ error: 'Failed to create problem' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: 'ids array is required' }, { status: 400 });
    }

    const deleted = await prisma.problem.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });

    return Response.json({ count: deleted.count, message: `Successfully deleted ${deleted.count} problems` });
  } catch (e) {
    console.error('[DELETE /api/problems]', e);
    return Response.json({ error: 'Failed to delete problems' }, { status: 500 });
  }
}

