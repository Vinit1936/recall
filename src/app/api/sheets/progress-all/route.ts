// GET /api/sheets/progress-all
//
// Per-user progress across every sheet at once, for the /sheets catalog page.
//
// The catalog shows one card per sheet and each card needs to know how much of
// that specific sheet is already in the user's tracker. That count cannot be
// derived on the client: the catalog only loads index.json (ids, titles and
// totals — no problem numbers), and summing the flat set of tracked problems
// would give "problems tracked anywhere", which is a different and wrong number.
//
// So the server resolves it: load each sheet (memoised in lib/sheets.ts, so the
// JSON is parsed once per process), intersect its problem numbers with the
// user's tracker, and return both the per-sheet counts and the flat map that
// the detail view reuses.
//
// The flat `tracked` map is capped at the union of all sheet problems. A user
// can also add problems by hand from the dashboard, and those must NOT leak into
// the catalog's progress figures.
//
// Response: { tracked: Record<problemNumber, status>, bySheet: Record<sheetId, count> }

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SHEET_INDEX, getSheet, sheetProblemIds } from '@/lib/sheets';

const CHUNK = 500;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // Per-sheet id sets, and the union of all of them.
  const perSheet = new Map<string, number[]>();
  const union = new Set<number>();
  for (const summary of SHEET_INDEX.sheets) {
    const sheet = await getSheet(summary.id);
    if (!sheet) continue;
    const ids = sheetProblemIds(sheet);
    perSheet.set(summary.id, ids);
    for (const id of ids) union.add(id);
  }

  const unionIds = [...union];

  // Only the problem numbers are needed here — the catalog renders counts, not
  // per-row state. Full tracker state comes from /sheets/[slug]/progress.
  const trackedNumbers = new Set<number>();
  for (let i = 0; i < unionIds.length; i += CHUNK) {
    const rows = await prisma.problem.findMany({
      where: {
        userId,
        platform: 'LEETCODE',
        problemNumber: { in: unionIds.slice(i, i + CHUNK) },
      },
      select: { problemNumber: true },
    });
    for (const r of rows) trackedNumbers.add(r.problemNumber);
  }

  const bySheet: Record<string, number> = {};
  for (const [sheetId, ids] of perSheet) {
    let n = 0;
    for (const id of ids) if (trackedNumbers.has(id)) n++;
    bySheet[sheetId] = n;
  }

  return NextResponse.json(
    { bySheet },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
