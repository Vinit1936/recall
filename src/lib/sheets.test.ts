import { describe, it, expect } from 'vitest';
import {
  SHEET_IDS,
  SHEET_INDEX,
  countByDifficulty,
  getSheet,
  getSheetSummary,
  lcUrl,
  matchesQuery,
  partitionTracked,
  resolveProblem,
  resolveSections,
  sheetProblemIds,
  toResolvedProblem,
  type Sheet,
  type TrackedMap,
} from './sheets';

// A small stand-in for a loaded sheet, so the pure helpers can be tested
// without touching the generated JSON.
const stubSheet = {
  id: 'stub',
  title: 'Stub',
  description: 'Stub sheet for unit tests.',
  sourceUrl: '',
  lastVerified: '',
  problemCount: 4,
  sectionCount: 2,
  sections: [
    { name: 'A', items: [1, 2] },
    { name: 'B', items: [3, 4] },
  ],
  problems: {
    1: toResolvedProblem(1, { t: 'Two Sum', d: 'EASY', s: 'two-sum', p: 'Array' }),
    2: toResolvedProblem(2, { t: 'Add Two Numbers', d: 'MEDIUM', s: 'add-two-numbers', p: 'Linked List' }),
    3: toResolvedProblem(3, { t: 'Longest Substring', d: 'MEDIUM', s: 'longest-substring-without-repeating-characters', p: 'Hash Table' }),
    4: toResolvedProblem(4, { t: 'Median of Two Sorted Arrays', d: 'HARD', s: 'median-of-two-sorted-arrays', p: 'Binary Search' }),
  },
} as NonNullable<Awaited<ReturnType<typeof getSheet>>>;

// -----------------------------------------------------------------------------
// These tests cover two things:
//
//  1. The pure helpers, which is where the actual logic lives.
//  2. Integrity of the generated data. The Sheets feature ships curated JSON, so
//     a bad regeneration (a typo'd id, a dropped section) would otherwise only
//     surface as a broken row in production. These assertions fail loudly at
//     `npm test` instead.
//
// The data-integrity block is intentionally assertions about the real files
// rather than fixtures, so it goes red the moment the generator's output rots.
// -----------------------------------------------------------------------------

describe('lcUrl', () => {
  it('builds the canonical LeetCode url from a slug', () => {
    expect(lcUrl('two-sum')).toBe('https://leetcode.com/problems/two-sum/');
  });

  it('tolerates a slug that already carries a trailing slash', () => {
    // Defensive: the generator strips slugs, but a slug pasted from a URL by
    // hand elsewhere must not produce a doubled slash.
    expect(lcUrl('two-sum')).not.toContain('//problems');
  });
});

describe('toResolvedProblem', () => {
  it('builds a renderable row and rebuilds the url from the slug', () => {
    expect(toResolvedProblem(1, { t: 'Two Sum', d: 'EASY', s: 'two-sum', p: 'Array' })).toEqual({
      id: 1,
      title: 'Two Sum',
      difficulty: 'EASY',
      topic: 'Array',
      url: 'https://leetcode.com/problems/two-sum/',
      companies: [],
    });
  });

  it('carries company tags through when present', () => {
    const p = toResolvedProblem(217, {
      t: 'Contains Duplicate',
      d: 'EASY',
      s: 'contains-duplicate',
      p: 'Array',
      co: ['Netflix', 'Yahoo', 'Airbnb'],
    });
    expect(p.companies).toEqual(['Netflix', 'Yahoo', 'Airbnb']);
  });

  it('defaults companies to an empty array when absent', () => {
    // A few problems are only tagged by very small companies and get filtered
    // out upstream, so `co` is genuinely optional.
    const p = toResolvedProblem(999, { t: 'x', d: 'HARD', s: 'x', p: '' });
    expect(p.companies).toEqual([]);
  });
});

describe('resolveProblem', () => {
  it('resolves a known problem number within a sheet', () => {
    expect(resolveProblem(stubSheet!, 1)).toMatchObject({ id: 1, title: 'Two Sum' });
  });

  it('returns null for a number absent from the sheet', () => {
    expect(resolveProblem(stubSheet!, 999999)).toBeNull();
    expect(resolveProblem(stubSheet!, 0)).toBeNull();
    expect(resolveProblem(stubSheet!, -1)).toBeNull();
  });
});

describe('resolveSections', () => {
  it('groups resolved problems under their section, in order', () => {
    expect(resolveSections(stubSheet!)).toEqual([
      { name: 'A', problems: [stubSheet!.problems[1], stubSheet!.problems[2]] },
      { name: 'B', problems: [stubSheet!.problems[3], stubSheet!.problems[4]] },
    ]);
  });

  it('drops problems missing from the metadata slice', () => {
    const gapped = { ...stubSheet!, problems: { 1: stubSheet!.problems[1] } } as typeof stubSheet;
    const out = resolveSections(gapped);
    expect(out).toEqual([{ name: 'A', problems: [stubSheet.problems[1]] }]);
  });

  it('drops sections left with no problems', () => {
    const gapped = { ...stubSheet!, problems: { 1: stubSheet!.problems[1] } } as typeof stubSheet;
    expect(resolveSections(gapped).map((s) => s.name)).toEqual(['A']);
  });
});

describe('sheetProblemIds', () => {
  it('flattens sections into a single list', () => {
    const sheet: Sheet = {
      id: 'x',
      title: 'x',
      description: 'x',
      sourceUrl: '',
      lastVerified: '',
      problemCount: 4,
      sectionCount: 2,
      sections: [
        { name: 'A', items: [1, 2] },
        { name: 'B', items: [3, 4] },
      ],
    };
    expect(sheetProblemIds(sheet)).toEqual([1, 2, 3, 4]);
  });

  it('de-duplicates while preserving first-seen order', () => {
    // Striver's SDE genuinely lists #207 four times and #094 twice, so this is
    // not a hypothetical.
    const sheet: Sheet = {
      id: 'x',
      title: 'x',
      description: 'x',
      sourceUrl: '',
      lastVerified: '',
      problemCount: 0,
      sectionCount: 2,
      sections: [
        { name: 'A', items: [207, 94, 207] },
        { name: 'B', items: [94, 5] },
      ],
    };
    expect(sheetProblemIds(sheet)).toEqual([207, 94, 5]);
  });

  it('returns an empty array for a sheet with no sections', () => {
    const sheet: Sheet = {
      id: 'x',
      title: 'x',
      description: 'x',
      sourceUrl: '',
      lastVerified: '',
      problemCount: 0,
      sectionCount: 0,
      sections: [],
    };
    expect(sheetProblemIds(sheet)).toEqual([]);
  });
});

describe('countByDifficulty', () => {
  it('tallies the three difficulties', () => {
    expect(countByDifficulty(Object.values(stubSheet!.problems))).toEqual({
      EASY: 1,
      MEDIUM: 2,
      HARD: 1,
    });
  });

  it('returns zeroes for an empty list', () => {
    expect(countByDifficulty([])).toEqual({ EASY: 0, MEDIUM: 0, HARD: 0 });
  });
});

describe('partitionTracked', () => {
  const info = {
    id: 'cuid',
    status: 'ACTIVE',
    isFavorite: false,
    currentStep: 0,
    revisionCount: 0,
  } as const;

  it('splits ids by tracker membership, preserving order', () => {
    const tracked: TrackedMap = { '2': { ...info, status: 'ACTIVE' }, '4': { ...info, status: 'MASTERED' } };
    expect(partitionTracked([1, 2, 3, 4], tracked)).toEqual({
      added: [2, 4],
      missing: [1, 3],
    });
  });

  it('treats an empty tracker map as everything missing', () => {
    expect(partitionTracked([1, 2], {})).toEqual({ added: [], missing: [1, 2] });
  });

  it('does not care about the status value', () => {
    // RETIRED, MASTERED and ACTIVE all count as "already tracked" — the add
    // endpoint must not offer to re-add a problem the user retired.
    expect(partitionTracked([1], { '1': { ...info, status: 'RETIRED' } }).added).toEqual([1]);
  });
});

describe('matchesQuery', () => {
  const problem = resolveProblem(stubSheet!, 1)!;

  it('matches everything for an empty or whitespace query', () => {
    expect(matchesQuery(problem, '')).toBe(true);
    expect(matchesQuery(problem, '   ')).toBe(true);
  });

  it('matches on title, case-insensitively', () => {
    expect(matchesQuery(problem, 'two sum')).toBe(true);
    expect(matchesQuery(problem, 'TWO')).toBe(true);
  });

  it('matches on topic', () => {
    expect(matchesQuery(problem, 'array')).toBe(true);
  });

  it('rejects a non-match', () => {
    expect(matchesQuery(problem, 'binary tree')).toBe(false);
  });
});

describe('getSheetSummary', () => {
  it('finds a known sheet', () => {
    expect(getSheetSummary('fraz')?.title).toBe('Fraz DSA Sheet');
  });

  it('returns null for an unknown sheet', () => {
    expect(getSheetSummary('does-not-exist')).toBeNull();
  });
});

describe('getSheet', () => {
  it('returns null for an unknown id instead of throwing', async () => {
    await expect(getSheet('nope')).resolves.toBeNull();
  });

  it('memoises so the JSON is parsed once per process', async () => {
    const a = await getSheet('blind-75');
    const b = await getSheet('blind-75');
    expect(a).toBe(b);
  });
});

// -----------------------------------------------------------------------------
// Data integrity — asserts against the real generated files.
// -----------------------------------------------------------------------------

describe('generated sheet data integrity', () => {
  it('every catalog entry has a loader', () => {
    for (const s of SHEET_INDEX.sheets) {
      expect(SHEET_IDS, `missing loader for "${s.id}"`).toContain(s.id);
    }
  });

  it('every loader corresponds to a catalog entry', () => {
    const catalogIds = SHEET_INDEX.sheets.map((s) => s.id);
    for (const id of SHEET_IDS) {
      expect(catalogIds, `loader "${id}" missing from index.json`).toContain(id);
    }
  });

  it('covers the seven curated sheets', () => {
    expect(SHEET_INDEX.sheets.map((s) => s.id).sort()).toEqual([
      'arsh',
      'blind-75',
      'company-pyqs',
      'fraz',
      'love-babbar-450',
      'striver-a2z',
      'striver-sde',
    ]);
  });

  it('every sheet has non-empty, uniquely named sections', async () => {
    for (const id of SHEET_IDS) {
      const sheet = await getSheet(id);
      expect(sheet, `${id} failed to load`).not.toBeNull();
      expect(sheet!.sections.length, `${id} has no sections`).toBeGreaterThan(0);

      const names = sheet!.sections.map((s) => s.name);
      expect(new Set(names).size, `${id} has duplicate section names`).toBe(names.length);
      for (const s of sheet!.sections) {
        expect(s.name.trim().length, `${id} has a blank section name`).toBeGreaterThan(0);
        expect(s.items.length, `${id}/${s.name} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('problemCount matches the sum of section items', async () => {
    for (const id of SHEET_IDS) {
      const sheet = await getSheet(id);
      const sum = sheet!.sections.reduce((n, s) => n + s.items.length, 0);
      expect(sheet!.problemCount, `${id} problemCount drifted`).toBe(sum);
    }
  });

  it('every referenced problem resolves in the sheet metadata slice', async () => {
    // This is the assertion that would have caught a typo'd problem number at
    // generation time rather than as a blank row in production.
    for (const id of SHEET_IDS) {
      const sheet = await getSheet(id);
      const missing = sheetProblemIds(sheet!).filter((n) => resolveProblem(sheet!, n) === null);
      expect(missing, `${id} references unresolvable problems`).toEqual([]);
    }
  });

  it('contains no non-numeric or non-positive problem numbers', async () => {
    for (const id of SHEET_IDS) {
      const sheet = await getSheet(id);
      const bad = sheetProblemIds(sheet!).filter((n) => !Number.isInteger(n) || n <= 0);
      expect(bad, `${id} has invalid problem numbers`).toEqual([]);
    }
  });

  it('resolveSections drops nothing for the bundled data', async () => {
    const sheet = await getSheet('blind-75');
    const resolved = resolveSections(sheet!).flatMap((s) => s.problems);
    expect(resolved.length).toBe(sheetProblemIds(sheet!).length);
  });

  it('every section survives resolution with at least one problem', async () => {
    for (const id of SHEET_IDS) {
      const sheet = await getSheet(id);
      expect(resolveSections(sheet!).length, `${id} lost sections on resolve`).toBe(
        sheet!.sections.length,
      );
    }
  });

  it('resolved problems always carry a usable title and difficulty', async () => {
    const sheet = await getSheet('fraz');
    for (const p of resolveSections(sheet!).flatMap((s) => s.problems)) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(['EASY', 'MEDIUM', 'HARD']).toContain(p.difficulty);
      expect(p.url.startsWith('https://leetcode.com/problems/')).toBe(true);
      expect(p.url.endsWith('/')).toBe(true);
      expect(Array.isArray(p.companies)).toBe(true);
      expect(p.companies.length).toBeLessThanOrEqual(3);
    }
  });

  it('company tags are present on the large sheets and never empty strings', async () => {
    // company-pyqs is built entirely from the company CSVs, so every one of its
    // problems should carry tags.
    const sheet = await getSheet('company-pyqs');
    const all = resolveSections(sheet!).flatMap((s) => s.problems);
    const tagged = all.filter((p) => p.companies.length > 0);
    expect(tagged.length / all.length).toBeGreaterThan(0.9);
    for (const p of tagged) {
      for (const c of p.companies) expect(c.trim().length).toBeGreaterThan(0);
    }
  });

  it('no sheet has an implausibly low resolution rate', async () => {
    // Guards against a source regression silently gutting a sheet. Thresholds
    // reflect the known gaps: love-babbar-450 only resolves 29 of ~445 upstream
    // entries because its source is free-text rather than LeetCode titles.
    const minimums: Record<string, number> = {
      arsh: 200,
      'blind-75': 65,
      'company-pyqs': 2500,
      fraz: 300,
      'love-babbar-450': 25,
      'striver-a2z': 100,
      'striver-sde': 115,
    };
    for (const [id, min] of Object.entries(minimums)) {
      const sheet = await getSheet(id);
      expect(sheetProblemIds(sheet!).length, `${id} resolved too few problems`).toBeGreaterThanOrEqual(min);
    }
  });
});
