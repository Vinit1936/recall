// GET / POST /api/cron/daily-revision — Automated daily cron service to send daily revision emails to all users who have the email service enabled

import type { NextRequest } from 'next/server';
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
    console.error('[cron getUserStreak] Error calculating streak:', err);
    return 0;
  }
}

async function handleDailyRevisionCron(request: NextRequest) {
  try {
    // Optional cron secret check for external runners (like Vercel Cron or GitHub Actions)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In development or if CRON_SECRET is not set, allow execution
      console.warn('[cron/daily-revision] Authorization header did not match CRON_SECRET');
    }

    // Query all users where emailNotifications is enabled (defaulting to true)
    const usersWithPref = await prisma.$queryRawUnsafe<{ id: string; email: string; name: string | null; dailyTarget: number; emailNotifications: boolean }[]>(
      `SELECT "id", "email", "name", "dailyTarget", "emailNotifications" 
       FROM "User" 
       WHERE "emailNotifications" = true AND "email" IS NOT NULL`
    );

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const results: Array<{ email: string; success: boolean; count: number; error?: string }> = [];

    for (const user of usersWithPref) {
      try {
        const target = user.dailyTarget || 5;

        // Fetch user due/overdue problems
        const dueProblems = await prisma.problem.findMany({
          where: { userId: user.id, status: 'ACTIVE', nextRevisionAt: { lte: endOfToday } },
          orderBy: { nextRevisionAt: 'asc' },
          take: target,
        });

        let selectedProblems = [...dueProblems];

        // If fewer due than target, backfill from next upcoming active problems
        if (selectedProblems.length < target) {
          const remaining = target - selectedProblems.length;
          const upcomingProblems = await prisma.problem.findMany({
            where: { userId: user.id, status: 'ACTIVE', nextRevisionAt: { gt: endOfToday } },
            orderBy: { nextRevisionAt: 'asc' },
            take: remaining,
          });
          selectedProblems = [...selectedProblems, ...upcomingProblems];
        }

        // Only send if user has at least one active problem or queue item
        if (selectedProblems.length === 0) {
          results.push({ email: user.email, success: true, count: 0, error: 'No active problems in queue' });
          continue;
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

        const streak = await getUserStreak(user.id);

        const emailResult = await sendDailyGoalEmail({
          email: user.email,
          name: user.name,
          targetCount: target,
          streak,
          problems: formattedProblems,
        });

        results.push({
          email: user.email,
          success: emailResult.success,
          count: formattedProblems.length,
          error: emailResult.error,
        });
      } catch (userErr) {
        console.error(`[cron/daily-revision] Error processing user ${user.email}:`, userErr);
        results.push({
          email: user.email,
          success: false,
          count: 0,
          error: userErr instanceof Error ? userErr.message : 'Unknown error',
        });
      }
    }

    return Response.json({
      success: true,
      processed: usersWithPref.length,
      sentCount: results.filter((r) => r.success && r.count > 0).length,
      results,
    });
  } catch (err) {
    console.error('[cron/daily-revision] Fatal error:', err);
    return Response.json({ error: 'Failed to execute daily revision cron' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleDailyRevisionCron(request);
}

export async function POST(request: NextRequest) {
  return handleDailyRevisionCron(request);
}
