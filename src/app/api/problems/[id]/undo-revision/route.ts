// POST /api/problems/[id]/undo-revision — undo the most recent revision for a problem
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revertRevision } from '@/lib/scheduling';
import type { RevisionType, Confidence, ProblemStatus } from '@/lib/scheduling';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const { id } = await params;
    const problem = await prisma.problem.findFirst({
      where: { id, userId },
      include: {
        revisions: {
          orderBy: { revisedAt: 'desc' },
          take: 2,
        },
      },
    });

    if (!problem) return Response.json({ error: 'Problem not found' }, { status: 404 });
    if (problem.revisions.length === 0) {
      return Response.json({ error: 'No revisions found to undo for this problem' }, { status: 400 });
    }

    const latestRevision = problem.revisions[0];
    const priorRevision = problem.revisions[1] ?? null;

    const { restoredStep, restoredStatus, restoredNextRevisionAt, restoredRevisionCount } = revertRevision({
      currentProblem: {
        createdAt: problem.createdAt,
        revisionCount: problem.revisionCount,
      },
      latestRevision: {
        stepBefore: latestRevision.stepBefore,
        type: latestRevision.type as RevisionType,
      },
      priorRevision: priorRevision
        ? {
            stepBefore: priorRevision.stepBefore,
            confidence: priorRevision.confidence as Confidence,
            type: priorRevision.type as RevisionType,
            revisedAt: priorRevision.revisedAt,
          }
        : null,
    });

    const updatedProblem = await prisma.$transaction(async (tx) => {
      // 1. Delete the latest revision record
      await tx.revision.delete({
        where: { id: latestRevision.id },
      });

      // 2. Restore problem state
      return tx.problem.update({
        where: { id },
        data: {
          currentStep: restoredStep,
          status: restoredStatus as ProblemStatus,
          nextRevisionAt: restoredNextRevisionAt,
          revisionCount: restoredRevisionCount,
        },
      });
    });

    // 3. Streak check: If the undone revision was created today, check if any other revisions were made today
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    if (latestRevision.revisedAt >= todayStart && latestRevision.revisedAt <= todayEnd) {
      const remainingRevisionsToday = await prisma.revision.count({
        where: {
          problem: { userId },
          revisedAt: { gte: todayStart, lte: todayEnd },
        },
      });

      if (remainingRevisionsToday === 0) {
        const todayDateObj = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0));
        await prisma.streakLog.upsert({
          where: { userId_date: { userId, date: todayDateObj } },
          create: { userId, date: todayDateObj, completed: false },
          update: { completed: false },
        });
      }
    }

    return Response.json({ success: true, problem: updatedProblem });
  } catch (e) {
    console.error('[POST /api/problems/[id]/undo-revision]', e);
    return Response.json({ error: 'Failed to undo revision' }, { status: 500 });
  }
}
