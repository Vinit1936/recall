import type { PlatformResolver, ResolveResult, ProblemMeta } from './types';

let cachedMaps: {
  slugMap: Map<string, ProblemMeta>;
  codeMap: Map<string, ProblemMeta>;
} | null = null;

async function getMaps(): Promise<{
  slugMap: Map<string, ProblemMeta>;
  codeMap: Map<string, ProblemMeta>;
}> {
  if (!cachedMaps) {
    const problems = (await import('../../data/hackerrank-problems.json')).default;
    const slugMap = new Map<string, ProblemMeta>();
    const codeMap = new Map<string, ProblemMeta>();

    (problems as any[]).forEach((p) => {
      const meta: ProblemMeta = {
        title: p.title,
        difficulty: p.difficulty,
        topic: p.topic,
        url: p.url,
        problemNumber: p.numericId,
        code: p.code,
      };
      if (p.slug) slugMap.set(p.slug.toLowerCase(), meta);
      if (p.code) codeMap.set(p.code.toUpperCase(), meta);
    });

    cachedMaps = { slugMap, codeMap };
  }
  return cachedMaps;
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

class HackerRankResolver implements PlatformResolver {
  async resolve(identifier: string): Promise<ResolveResult> {
    const raw = identifier.trim();
    if (!raw) return { found: false };

    // 1. URL pattern match (e.g. https://www.hackerrank.com/challenges/solve-me-first/problem)
    if (raw.includes('hackerrank.com') || raw.startsWith('http://') || raw.startsWith('https://')) {
      const match = raw.match(/hackerrank\.com\/(?:contests\/[^/]+\/)?challenges\/([^/]+)/i);
      const slug = match ? match[1].toLowerCase() : raw.split('/').filter((s) => s !== 'problem').pop()?.toLowerCase();

      if (slug) {
        const { slugMap } = await getMaps();
        // Check local dataset first
        const knownData = slugMap.get(slug);
        if (knownData) return { found: true, data: knownData };

        // Dynamic URL parsing
        const cleanTitle = slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const fullUrl = raw.startsWith('http') ? raw : `https://${raw}`;

        return {
          found: true,
          data: {
            title: cleanTitle || 'HackerRank Challenge',
            difficulty: 'EASY',
            topic: 'General',
            url: fullUrl,
            problemNumber: hashString(slug),
            code: slug.toUpperCase(),
          },
        };
      }
    }

    const { codeMap, slugMap } = await getMaps();

    // 2. Direct code lookup (e.g. HR_001)
    const codeData = codeMap.get(raw.toUpperCase());
    if (codeData) return { found: true, data: codeData };

    // 3. Direct slug lookup (e.g. solve-me-first)
    const slugData = slugMap.get(raw.toLowerCase());
    if (slugData) return { found: true, data: slugData };

    return { found: false };
  }
}

export const hackerrankResolver = new HackerRankResolver();
