import type { PlatformResolver, ResolveResult, ProblemMeta } from './types';

let cachedMaps: {
  codeMap: Map<string, ProblemMeta>;
  numMap: Map<number, ProblemMeta>;
  titleMap: Map<string, ProblemMeta>;
} | null = null;

async function getMaps(): Promise<{
  codeMap: Map<string, ProblemMeta>;
  numMap: Map<number, ProblemMeta>;
  titleMap: Map<string, ProblemMeta>;
}> {
  if (!cachedMaps) {
    const problems = (await import('../../data/codechef-problems.json')).default;
    const codeMap = new Map<string, ProblemMeta>();
    const numMap = new Map<number, ProblemMeta>();
    const titleMap = new Map<string, ProblemMeta>();

    (problems as any[]).forEach((p) => {
      const meta: ProblemMeta = {
        title: p.title,
        difficulty: p.difficulty,
        topic: p.topic,
        url: p.url,
        problemNumber: p.numericId,
        code: p.code,
      };
      if (p.code) codeMap.set(p.code.toUpperCase(), meta);
      if (p.numericId) numMap.set(p.numericId, meta);
      if (p.title) titleMap.set(p.title.toLowerCase().trim(), meta);
    });

    cachedMaps = { codeMap, numMap, titleMap };
  }
  return cachedMaps;
}

class CodeChefResolver implements PlatformResolver {
  async resolve(identifier: string): Promise<ResolveResult> {
    const raw = identifier.trim();
    if (!raw) return { found: false };

    const { codeMap, numMap, titleMap } = await getMaps();

    // 1. Direct URL detection / parsing (e.g. https://www.codechef.com/problems/FLOW001)
    if (raw.includes('codechef.com') || raw.startsWith('http://') || raw.startsWith('https://')) {
      const match = raw.match(/codechef\.com\/(?:[^/]+\/)?problems\/([A-Za-z0-9]+)/i);
      if (match && match[1]) {
        const ccCode = match[1].toUpperCase();
        const data = codeMap.get(ccCode);
        if (data) return { found: true, data };
      }
    }

    // 2. Direct code lookup (e.g. "FLOW001", "START01")
    const codeData = codeMap.get(raw.toUpperCase());
    if (codeData) return { found: true, data: codeData };

    // 3. Numeric ID lookup if numeric
    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      const data = numMap.get(num);
      if (data) return { found: true, data };
    }

    // 4. Question Title lookup (e.g. "Add Two Numbers", "Number Mirror")
    const titleData = titleMap.get(raw.toLowerCase());
    if (titleData) return { found: true, data: titleData };

    return { found: false };
  }
}

export const codechefResolver = new CodeChefResolver();
