// GET /api/sheets/[slug]/progress
//
// Returns which of a sheet's problems are already in the signed-in user's
// tracker, so the sheet view can show checkmarks instead of making the user
// guess.
//
// WHY A SEPARATE ENDPOINT RATHER THAN A SERVER COMPONENT QUERY
// The sheet's static content (titles, difficulty, sections) is identical for
// every user and is served from the bundled JSON. Only this per-user slice
// needs the database, and keeping it on its own route lets it be cached
// client-side by SWR like the rest of the app (see src/lib/swr-cache.ts) and
// refetched after a bulk add without re-downloading the sheet itself.
//
// Response: { tracked: TrackedMap }
//   Keyed by LeetCode problem number; absent key = not tracked. Each entry
//   carries the row id plus status / bookmark / ladder position so the sheet
//   rows can show the same state the dashboard does.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getSheet, sheetProblemIds, type TrackedMap } from '@/lib/sheets';

// Postgres handles a long IN list fine, but keeping each statement modest keeps
// the plan an index-only scan on @@unique([userId, platform, problemNumber])
// even for company-pyqs, which references 2,575 distinct problems.
const CHUNK = 500;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await params;
  const sheet = await getSheet(slug);
  if (!sheet) {
    return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
  }

  const ids = sheetProblemIds(sheet);

  const rows: {
    id: string;
    problemNumber: number;
    status: 'ACTIVE' | 'MASTERED' | 'RETIRED';
    isFavorite: boolean;
    currentStep: number;
    revisionCount: number;
  }[] = [];

  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const found = await prisma.problem.findMany({
      where: {
        userId: session.user.id,
        platform: 'LEETCODE',
        problemNumber: { in: chunk },
      },
      select: {
        id: true,
        problemNumber: true,
        status: true,
        isFavorite: true,
        currentStep: true,
        revisionCount: true,
      },
    });
    rows.push(...found);
  }

  const tracked: TrackedMap = {};
  for (const r of rows) {
    tracked[String(r.problemNumber)] = {
      id: r.id,
      status: r.status,
      isFavorite: r.isFavorite,
      currentStep: r.currentStep,
      revisionCount: r.revisionCount,
    };
  }

  return NextResponse.json(
    { tracked },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
