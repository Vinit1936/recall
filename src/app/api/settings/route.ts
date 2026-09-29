// GET  /api/settings — fetch user profile & preference settings
// PATCH /api/settings — update user profile & preferences

import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

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
      // fallback to 5 and false
    }

    return Response.json({
      user,
      preferences: {
        defaultPlatform: 'LEETCODE',
        dailyTarget,
        emailNotifications,
      },
    });
  } catch (e) {
    console.error('[GET /api/settings]', e);
    return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const body = await request.json();
    const { name, dailyTarget, emailNotifications } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (dailyTarget !== undefined && typeof dailyTarget === 'number') {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "dailyTarget" = $1 WHERE "id" = $2`,
          dailyTarget,
          userId
        );
      } catch (err) {
        console.warn('Could not update dailyTarget in DB:', err);
      }
    }

    if (emailNotifications !== undefined && typeof emailNotifications === 'boolean') {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "emailNotifications" = $1 WHERE "id" = $2`,
          emailNotifications,
          userId
        );
      } catch (err) {
        console.warn('Could not update emailNotifications in DB:', err);
      }
    }

    return Response.json({ success: true, user: updatedUser });
  } catch (e) {
    console.error('[PATCH /api/settings]', e);
    return Response.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
