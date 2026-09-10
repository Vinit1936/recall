import type { PlatformResolver, ResolveResult, ProblemMeta } from './types';

let cachedProblemMap: Map<number, ProblemMeta> | null = null;

async function getProblemMap(): Promise<Map<number, ProblemMeta>> {
  if (!cachedProblemMap) {
    const problems = (await import('../../data/leetcode-problems.json')).default;
    cachedProblemMap = new Map<number, ProblemMeta>(
      (problems as any[]).map((p) => [
        p.id,
        {
          title: p.title,
          difficulty: p.difficulty,
          topic: p.topic,
          url: p.url,
        },
      ])
    );
  }
  return cachedProblemMap;
}

class LeetCodeResolver implements PlatformResolver {
  async resolve(identifier: string): Promise<ResolveResult> {
    const id = parseInt(identifier, 10);
    if (isNaN(id)) return { found: false };
    const problemMap = await getProblemMap();
    const data = problemMap.get(id);
    if (!data) return { found: false };
    return { found: true, data };
  }
}

export const leetcodeResolver = new LeetCodeResolver();
