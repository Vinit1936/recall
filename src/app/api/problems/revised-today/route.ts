// GET /api/problems/revised-today — fetch problems revised today by the current user
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const { searchParams } = request.nextUrl;
    const beforeParam = searchParams.get('before');

    const now = new Date();
    let todayStart: Date;
    let endOfToday: Date;

    if (beforeParam) {
      const parsed = new Date(beforeParam);
      if (!isNaN(parsed.getTime())) {
        endOfToday = parsed;
        todayStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
      } else {
        todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      }
    } else {
      todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    // Fetch revisions created today for this user's problems
    const revisions = await prisma.revision.findMany({
      where: {
        problem: { userId },
        revisedAt: { gte: todayStart, lte: endOfToday },
      },
      include: {
        problem: true,
      },
      orderBy: { revisedAt: 'desc' },
    });

    type RevisedProblemItem = Record<string, unknown> & {
      latestRevision: {
        id: string;
        confidence: string;
        type: string;
        stepBefore: number;
        stepAfter: number;
        revisedAt: Date;
      };
    };

    // Group by problemId to keep only the latest revision of each problem if revised multiple times
    const problemMap = new Map<string, RevisedProblemItem>();
    for (const rev of revisions) {
      if (!problemMap.has(rev.problemId)) {
        problemMap.set(rev.problemId, {
          ...rev.problem,
          latestRevision: {
            id: rev.id,
            confidence: rev.confidence,
            type: rev.type,
            stepBefore: rev.stepBefore,
            stepAfter: rev.stepAfter,
            revisedAt: rev.revisedAt,
          },
        });
      }
    }

    return Response.json(Array.from(problemMap.values()));
  } catch (e) {
    console.error('[GET /api/problems/revised-today]', e);
    return Response.json({ error: 'Failed to fetch revised problems' }, { status: 500 });
  }
}
