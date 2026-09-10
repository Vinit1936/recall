import type { PlatformResolver, ResolveResult, ProblemMeta } from './types';

let cachedMaps: {
  codeMap: Map<string, ProblemMeta>;
  numMap: Map<number, ProblemMeta>;
} | null = null;

async function getMaps(): Promise<{
  codeMap: Map<string, ProblemMeta>;
  numMap: Map<number, ProblemMeta>;
}> {
  if (!cachedMaps) {
    const problems = (await import('../../data/codeforces-problems.json')).default;
    const codeMap = new Map<string, ProblemMeta>();
    const numMap = new Map<number, ProblemMeta>();

    (problems as any[]).forEach((p) => {
      const meta: ProblemMeta = {
        title: p.title,
        difficulty: p.difficulty,
        topic: p.topic,
        url: p.url,
        problemNumber: p.numericId,
        code: p.id,
      };
      codeMap.set(p.id.toUpperCase(), meta);
      if (p.numericId) {
        numMap.set(p.numericId, meta);
      }
    });

    cachedMaps = { codeMap, numMap };
  }
  return cachedMaps;
}

class CodeforcesResolver implements PlatformResolver {
  async resolve(identifier: string): Promise<ResolveResult> {
    const raw = identifier.trim().toUpperCase();
    if (!raw) return { found: false };

    const { codeMap, numMap } = await getMaps();

    // 1. Direct code lookup (e.g. "4A", "158A")
    let data = codeMap.get(raw);
    if (data) return { found: true, data };

    // 2. Numeric ID lookup (e.g. "401")
    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      data = numMap.get(num);
      if (data) return { found: true, data };
    }

    return { found: false };
  }
}

export const codeforcesResolver = new CodeforcesResolver();
