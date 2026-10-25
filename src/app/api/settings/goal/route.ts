// POST /api/settings/goal — update daily revision goal and send goal email
// GET  /api/settings/goal — fetch current goal and preview today's queue

import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendDailyGoalEmail, GoalProblemItem } from '@/lib/mail';

function toDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getUserStreak(userId: string): Promise<number> {
  try {
    const today = new Date();
    const todayKey = toDateKey(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toDateKey(yesterday);

    const logs = await prisma.streakLog.findMany({
      where: { userId, completed: true },
    });

    const problems = await prisma.problem.findMany({
      where: { userId },
      select: { id: true },
    });
    const problemIds = problems.map((p) => p.id);

    const revisions = problemIds.length > 0 ? await prisma.revision.findMany({
      where: { problemId: { in: problemIds } },
      select: { revisedAt: true },
    }) : [];

    const activeDates = new Set<string>();
    for (const log of logs) {
      activeDates.add(toDateKey(log.date));
    }
    for (const rev of revisions) {
      activeDates.add(toDateKey(rev.revisedAt));
    }

    let streak = 0;
    const cursor = new Date(today);

    if (activeDates.has(todayKey)) {
      while (activeDates.has(toDateKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    } else if (activeDates.has(yesterdayKey)) {
      cursor.setDate(cursor.getDate() - 1);
      while (activeDates.has(toDateKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    return streak;
  } catch (err) {
    console.error('[getUserStreak] Error calculating streak:', err);
    return 0;
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    // Fetch user dailyTarget & emailNotifications
    let dailyTarget = 5;
    let emailNotifications = false;
    try {
      const res = await prisma.$queryRawUnsafe<{ dailyTarget: number; emailNotifications: boolean }[]>(
        `SELECT "dailyTarget", "emailNotifications" FROM "User" WHERE "id" = $1 LIMIT 1`,
        userId
      );
      if (res && res[0]) {
        if (typeof res[0].dailyTarget === 'number') dailyTarget = res[0].dailyTarget;
        if (typeof res[0].emailNotifications === 'boolean') emailNotifications = res[0].emailNotifications;
      }
    } catch {
      // fallback
    }

    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const dueCount = await prisma.problem.count({
      where: { userId, status: 'ACTIVE', nextRevisionAt: { lte: endOfToday } },
    });

    const totalActive = await prisma.problem.count({
      where: { userId, status: 'ACTIVE' },
    });

    return Response.json({
      dailyTarget,
      emailNotifications,
      dueCount,
      totalActive,
    });
  } catch (e) {
    console.error('[GET /api/settings/goal]', e);
    return Response.json({ error: 'Failed to fetch goal settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const body = await request.json().catch(() => ({}));
    const target = body.dailyTarget !== undefined ? Number(body.dailyTarget) : undefined;
    let explicitSendEmail = body.sendEmail !== false;

    // Fetch user current settings
    let currentTarget = 5;
    let emailNotifications = false;
    try {
      const res = await prisma.$queryRawUnsafe<{ dailyTarget: number; emailNotifications: boolean }[]>(
        `SELECT "dailyTarget", "emailNotifications" FROM "User" WHERE "id" = $1 LIMIT 1`,
        userId
      );
      if (res && res[0]) {
        if (typeof res[0].dailyTarget === 'number') currentTarget = res[0].dailyTarget;
        if (typeof res[0].emailNotifications === 'boolean') emailNotifications = res[0].emailNotifications;
      }
    } catch {
      // fallback
    }

    // If body provides emailNotifications toggle
    if (typeof body.emailNotifications === 'boolean') {
      emailNotifications = body.emailNotifications;
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "emailNotifications" = $1 WHERE "id" = $2`,
          emailNotifications,
          userId
        );
      } catch (err) {
        console.warn('[POST /api/settings/goal] Could not persist emailNotifications to DB:', err);
      }
    }

    // Validate target
    const validTarget = target !== undefined ? Math.max(1, Math.min(50, target)) : currentTarget;

    // Save dailyTarget to database if provided
    if (target !== undefined) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "dailyTarget" = $1 WHERE "id" = $2`,
          validTarget,
          userId
        );
      } catch (err) {
        console.warn('[POST /api/settings/goal] Could not persist dailyTarget to DB:', err);
      }
    }

    // Fetch user details for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    const recipientEmail = user?.email || session.user.email;
    const recipientName = user?.name || session.user.name || null;

    // Fetch due and overdue problems for today
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const dueProblems = await prisma.problem.findMany({
      where: { userId, status: 'ACTIVE', nextRevisionAt: { lte: endOfToday } },
      orderBy: { nextRevisionAt: 'asc' },
      take: validTarget,
    });

    let selectedProblems = [...dueProblems];

    // If fewer due problems than the daily target, backfill from next upcoming active problems
    if (selectedProblems.length < validTarget) {
      const remainingSlots = validTarget - selectedProblems.length;
      const upcomingProblems = await prisma.problem.findMany({
        where: { userId, status: 'ACTIVE', nextRevisionAt: { gt: endOfToday } },
        orderBy: { nextRevisionAt: 'asc' },
        take: remainingSlots,
      });
      selectedProblems = [...selectedProblems, ...upcomingProblems];
    }

    const formattedProblems: GoalProblemItem[] = selectedProblems.map((p) => ({
      id: p.id,
      platform: p.platform,
      problemNumber: p.problemNumber,
      title: p.title,
      url: p.url,
      difficulty: p.difficulty,
      topic: p.topic,
      isOverdue: p.nextRevisionAt < todayMidnight,
    }));

    const streak = await getUserStreak(userId);

    let emailSent = false;
    let emailError: string | undefined;

    // Only send email if emailNotifications is enabled AND sendEmail is true
    if (!emailNotifications) {
      emailError = 'Email service is currently turned off in Settings.';
    } else if (explicitSendEmail) {
      if (!recipientEmail) {
        emailError = 'No verified email address associated with your account.';
      } else {
        const sendResult = await sendDailyGoalEmail({
          email: recipientEmail,
          name: recipientName,
          targetCount: validTarget,
          streak,
          problems: formattedProblems,
        });

        emailSent = sendResult.success;
        if (!sendResult.success) {
          emailError = sendResult.error;
        }
      }
    }

    return Response.json({
      success: true,
      dailyTarget: validTarget,
      emailNotifications,
      problemsCount: formattedProblems.length,
      problems: formattedProblems,
      streak,
      emailSent,
      emailRecipient: recipientEmail,
      error: emailError,
    });
  } catch (e) {
    console.error('[POST /api/settings/goal]', e);
    const msg = e instanceof Error ? e.message : 'Failed to update revision goal';
    return Response.json({ error: msg }, { status: 500 });
  }
}
