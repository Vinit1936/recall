// =============================================================================
// leetvision.ts — Integration service with Leet-Vision (leet-vision.com)
// Provides company tags and solution visualizer URLs for LeetCode problems.
// =============================================================================

const LEETVISION_BASE_URL = 'https://leet-vision.com';

const apiKey =
  process.env.EXTERNAL_API_KEY ||
  process.env.LEETVISION_API_KEY ||
  'lv_ezzgfcD5mQd7oq4SYJhQ4zf7vHw0pCv8';

// In-memory cache for company tags to keep lookups sub-millisecond on subsequent calls
const companiesCache = new Map<string, { companies: string[]; fetchedAt: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export type LeetVisionData = {
  companies: string[];
  solutionUrl: string;
};

/**
 * Generates the direct Leet-Vision solution visualizer URL for a problem.
 */
export function getLeetVisionSolutionUrl(problemNumber: number | string): string {
  const num = String(problemNumber).trim();
  if (!num || num === '0') return 'https://leet-vision.com';
  return `${LEETVISION_BASE_URL}/solution/${encodeURIComponent(num)}`;
}

/**
 * Fetches company tags for a LeetCode question from Leet-Vision API.
 */
export async function fetchLeetVisionCompanies(problemNumber: number | string): Promise<string[]> {
  const num = String(problemNumber).trim();
  if (!num || num === '0') return [];

  // Check cache
  const cached = companiesCache.get(num);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.companies;
  }

  try {
    const res = await fetch(`${LEETVISION_BASE_URL}/api/question/${encodeURIComponent(num)}/companies`, {
      headers: {
        'x-api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 }, // Next.js ISR fetch cache
    });

    if (!res.ok) {
      console.warn(`[leetvision] Companies fetch returned status ${res.status} for question ${num}`);
      return [];
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      const companies = data.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
      companiesCache.set(num, { companies, fetchedAt: Date.now() });
      return companies;
    }

    return [];
  } catch (error) {
    console.error(`[leetvision] Error fetching companies for question ${num}:`, error);
    return [];
  }
}

/**
 * Fetches both company tags and solution visualizer URL for a problem.
 */
export async function getLeetVisionData(problemNumber: number | string): Promise<LeetVisionData> {
  const companies = await fetchLeetVisionCompanies(problemNumber);
  const solutionUrl = getLeetVisionSolutionUrl(problemNumber);

  return {
    companies,
    solutionUrl,
  };
}
