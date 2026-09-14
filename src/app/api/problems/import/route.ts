// POST /api/problems/import — bulk import problems from CSV / Excel

import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { ProcessedProblem } from '@/lib/import-utils';

const VALID_PLATFORMS = new Set(['LEETCODE', 'CODEFORCES', 'GFG', 'HACKERRANK', 'CODECHEF']);
const VALID_DIFFICULTIES = new Set(['EASY', 'MEDIUM', 'HARD']);
const VALID_STATUSES = new Set(['ACTIVE', 'MASTERED']);
const BATCH_SIZE = 100;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.problems)) {
      return Response.json({ error: 'Request body must include a "problems" array' }, { status: 400 });
    }

    const rawProblems = body.problems as ProcessedProblem[];

    if (rawProblems.length === 0) {
      return Response.json({ error: 'No problems provided to import' }, { status: 400 });
    }

    if (rawProblems.length > 1000) {
      return Response.json({ error: 'Maximum 1,000 problems can be imported at once' }, { status: 400 });
    }

    // Validate each problem
    const validatedProblems: {
      userId: string;
      platform: 'LEETCODE' | 'CODEFORCES' | 'GFG' | 'HACKERRANK' | 'CODECHEF';
      problemNumber: number;
      title: string;
      url: string;
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      topic: string;
      dateSolved: Date;
      notes: string | null;
      customFields: Record<string, any>;
      currentStep: number;
      nextRevisionAt: Date;
      status: 'ACTIVE' | 'MASTERED';
    }[] = [];

    for (let i = 0; i < rawProblems.length; i++) {
      const p = rawProblems[i];
      const idx = i + 1;

      if (!p.title || typeof p.title !== 'string' || !p.title.trim()) {
        return Response.json({ error: `Problem at row ${idx} is missing a title` }, { status: 400 });
      }

      if (!p.platform || !VALID_PLATFORMS.has(p.platform)) {
        return Response.json({ error: `Problem at row ${idx} has invalid platform "${p.platform}"` }, { status: 400 });
      }

      if (typeof p.problemNumber !== 'number' || isNaN(p.problemNumber) || p.problemNumber <= 0) {
        return Response.json({ error: `Problem at row ${idx} has invalid problemNumber` }, { status: 400 });
      }

      if (!p.difficulty || !VALID_DIFFICULTIES.has(p.difficulty)) {
        return Response.json({ error: `Problem at row ${idx} has invalid difficulty "${p.difficulty}"` }, { status: 400 });
      }

      const dateSolved = new Date(p.dateSolved);
      if (isNaN(dateSolved.getTime())) {
        return Response.json({ error: `Problem at row ${idx} has invalid dateSolved` }, { status: 400 });
      }

      const nextRevisionAt = new Date(p.nextRevisionAt);
      if (isNaN(nextRevisionAt.getTime())) {
        return Response.json({ error: `Problem at row ${idx} has invalid nextRevisionAt` }, { status: 400 });
      }

      const status = VALID_STATUSES.has(p.status) ? p.status : 'ACTIVE';
      const currentStep = typeof p.currentStep === 'number' && p.currentStep >= 0 && p.currentStep <= 3 ? p.currentStep : 0;

      validatedProblems.push({
        userId,
        platform: p.platform,
        problemNumber: p.problemNumber,
        title: p.title.trim(),
        url: p.url && typeof p.url === 'string' ? p.url.trim() : '#',
        difficulty: p.difficulty,
        topic: p.topic && typeof p.topic === 'string' ? p.topic.trim() : 'General',
        dateSolved,
        notes: p.notes && typeof p.notes === 'string' ? p.notes.trim() : null,
        customFields: p.customFields && typeof p.customFields === 'object' ? p.customFields : {},
        currentStep,
        nextRevisionAt,
        status,
      });
    }

    // If custom columns were specified, ensure they exist in UserColumnConfig
    const createdCols: string[] = [];
    if (Array.isArray(body.customColumns) && body.customColumns.length > 0) {
      const existing = await prisma.userColumnConfig.findMany({
        where: { userId },
        orderBy: { order: 'desc' },
      });
      const existingNames = new Set(existing.map((c) => c.name.toLowerCase().trim()));
      let nextOrder = existing.length > 0 ? existing[0].order + 1 : 0;

      for (const col of body.customColumns) {
        if (typeof col === 'string' && col.trim()) {
          const colName = col.trim();
          if (!existingNames.has(colName.toLowerCase())) {
            await prisma.userColumnConfig.create({
              data: {
                userId,
                name: colName,
                order: nextOrder++,
              },
            });
            existingNames.add(colName.toLowerCase());
            createdCols.push(colName);
          }
        }
      }
    }

    console.log(`[POST /api/problems/import] Importing ${validatedProblems.length} problems for user ${userId}`);

    let totalImported = 0;

    // Chunk into batches of 100
    for (let i = 0; i < validatedProblems.length; i += BATCH_SIZE) {
      const batch = validatedProblems.slice(i, i + BATCH_SIZE);
      const result = await prisma.problem.createMany({
        data: batch,
        skipDuplicates: true,
      });
      totalImported += result.count;
    }

    const skipped = validatedProblems.length - totalImported;

    return Response.json(
      {
        imported: totalImported,
        skipped,
        total: validatedProblems.length,
        customColumnsCreated: createdCols,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/problems/import]', error);
    return Response.json({ error: 'Failed to import problems' }, { status: 500 });
  }
}
