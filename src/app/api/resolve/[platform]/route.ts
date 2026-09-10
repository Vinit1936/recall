// GET /api/resolve/[platform]?id=[identifier]
// Consolidated dynamic route for resolving problem metadata across supported platforms.
// Replaces individual /api/{platform}/resolve routes.

import type { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { getResolver } from '@/lib/platforms';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { platform: rawPlatform } = await params;
  const platform = rawPlatform.toUpperCase();
  const resolver = getResolver(platform);

  if (!resolver) {
    return Response.json(
      { error: `Unsupported platform: ${rawPlatform}. Supported platforms: LEETCODE, CODEFORCES, CODECHEF, GFG, HACKERRANK` },
      { status: 400 }
    );
  }

  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'id query param required' }, { status: 400 });
    }

    const result = await resolver.resolve(id);
    console.log(`[GET /api/resolve/${rawPlatform}] id=${id} found=${result.found}`);
    return Response.json(result);
  } catch (e) {
    console.error(`[GET /api/resolve/${rawPlatform}]`, e);
    return Response.json({ error: 'Resolver failed' }, { status: 500 });
  }
}
