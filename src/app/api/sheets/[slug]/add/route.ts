// POST /api/sheets/[slug]/add
//
// Adds problems from a curated sheet to the signed-in user's tracker in one
// request. Body: { problemNumbers: number[] }
//
// WHY THIS EXISTS INSTEAD OF REUSING POST /api/problems
// Adding a whole sheet means up to ~2,000 problems (company-pyqs). Firing one
// request per problem is unacceptable, and POST /api/problems hard-fails with a
// 409 on the first duplicate and aborts the whole create — it is designed for
// the one-at-a-time "add a single problem" flow in the dashboard's new-row.
//
// This route instead uses createMany({ skipDuplicates: true }), the same
// semantics as the existing bulk import at /api/problems/import, so re-adding
// a sheet is idempotent and reports what it skipped rather than erroring.
//
// Every problem enters the spaced repetition ladder exactly as it would if typed
// in by hand: step 0, due in 3 days (getInitialSchedule in lib/scheduling.ts).
//
// Response: { added, skipped, total }

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getInitialSchedule } from '@/lib/scheduling';
import {
  MAX_ADD_PER_REQUEST,
  getSheet,
  sheetProblemIds,
} from '@/lib/sheets';

const BATCH_SIZE = 100;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { slug } = await params;
    const sheet = await getSheet(slug);
    if (!sheet) {
      return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.problemNumbers)) {
      return NextResponse.json(
        { error: 'Request body must include a "problemNumbers" array' },
        { status: 400 },
      );
    }

    // Only accept numbers that actually belong to this sheet. Without this the
    // endpoint would let a caller insert arbitrary LeetCode problems while
    // claiming they came from a sheet, which also makes the response counts
    // meaningless.
    const allowed = new Set(sheetProblemIds(sheet));
    const requested = (body.problemNumbers as unknown[])
      .filter((n): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0)
      .filter((n) => allowed.has(n));

    // De-duplicate the request itself, otherwise "skipped" would count the
    // caller's own repeats rather than genuine tracker conflicts.
    const unique = [...new Set(requested)];

    if (unique.length === 0) {
      return NextResponse.json(
        { error: 'No valid problems from this sheet were provided' },
        { status: 400 },
      );
    }

    if (unique.length > MAX_ADD_PER_REQUEST) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ADD_PER_REQUEST} problems can be added at once` },
        { status: 400 },
      );
    }

    const now = new Date();
    const schedule = getInitialSchedule(now);

    // Resolve against the bundled metadata slice rather than trusting the
    // client. Difficulty is a required enum in the schema, so an unresolved
    // problem must be dropped here or Prisma will throw.
    const rows = unique
      .map((id) => sheet.problems[id])
      .filter((p): p is NonNullable<typeof p> => p !== undefined)
      .map((p) => ({
        userId,
        platform: 'LEETCODE' as const,
        problemNumber: p.id,
        title: p.title,
        url: p.url,
        difficulty: p.difficulty,
        topic: p.topic,
        dateSolved: now,
        notes: null,
        customFields: {},
        currentStep: schedule.currentStep,
        nextRevisionAt: schedule.nextRevisionAt,
        status: schedule.status,
      }));

    let added = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const result = await prisma.problem.createMany({
        data: rows.slice(i, i + BATCH_SIZE),
        skipDuplicates: true,
      });
      added += result.count;
    }

    console.log(
      `[POST /api/sheets/${slug}/add] user=${userId} requested=${unique.length} added=${added} skipped=${unique.length - added}`,
    );

    return NextResponse.json(
      { added, skipped: unique.length - added, total: unique.length },
      { status: 201 },
    );
  } catch (error) {
    console.error('[POST /api/sheets/[slug]/add]', error);
    return NextResponse.json({ error: 'Failed to add problems' }, { status: 500 });
  }
}
