// GET /api/leetvision?id=[problemNumber]
// Fetches company tags and solution visualizer URL from Leet-Vision.

import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { getLeetVisionData } from '@/lib/leetvision';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return Response.json({ error: 'id parameter is required' }, { status: 400 });
  }

  try {
    const data = await getLeetVisionData(id);
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('[GET /api/leetvision] Error:', error);
    return Response.json({ error: 'Failed to fetch Leet-Vision data' }, { status: 500 });
  }
}
