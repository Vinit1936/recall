import { describe, it, expect } from 'vitest';
import {
  normalizeDifficulty,
  parseDate,
  detectPlatformFromUrl,
  normalizePlatform,
  autoDetectMappings,
  normalizeUrl,
  normalizeTopic,
  isRowEmpty,
  computeStaggerSchedule,
  hashString,
  detectFileType,
  validateAndProcessRows,
  type ParsedFile,
  type ColumnMapping,
} from './import-utils';

describe('import-utils', () => {
  describe('normalizeDifficulty', () => {
    it('normalizes standard difficulty strings', () => {
      expect(normalizeDifficulty('Easy')).toBe('EASY');
      expect(normalizeDifficulty('easy')).toBe('EASY');
      expect(normalizeDifficulty('EASY')).toBe('EASY');
      expect(normalizeDifficulty('Medium')).toBe('MEDIUM');
      expect(normalizeDifficulty('medium')).toBe('MEDIUM');
      expect(normalizeDifficulty('MEDIUM')).toBe('MEDIUM');
      expect(normalizeDifficulty('Hard')).toBe('HARD');
      expect(normalizeDifficulty('hard')).toBe('HARD');
      expect(normalizeDifficulty('HARD')).toBe('HARD');
    });

    it('normalizes abbreviations and numeric ratings', () => {
      expect(normalizeDifficulty('E')).toBe('EASY');
      expect(normalizeDifficulty('M')).toBe('MEDIUM');
      expect(normalizeDifficulty('H')).toBe('HARD');
      expect(normalizeDifficulty('1')).toBe('EASY');
      expect(normalizeDifficulty('2')).toBe('MEDIUM');
      expect(normalizeDifficulty('3')).toBe('HARD');
    });

    it('normalizes common synonyms', () => {
      expect(normalizeDifficulty('Simple')).toBe('EASY');
      expect(normalizeDifficulty('Basic')).toBe('EASY');
      expect(normalizeDifficulty('Moderate')).toBe('MEDIUM');
      expect(normalizeDifficulty('Intermediate')).toBe('MEDIUM');
      expect(normalizeDifficulty('Difficult')).toBe('HARD');
      expect(normalizeDifficulty('Advanced')).toBe('HARD');
      expect(normalizeDifficulty('Expert')).toBe('HARD');
    });

    it('handles mixed casing and whitespace', () => {
      expect(normalizeDifficulty('  eAsY  ')).toBe('EASY');
      expect(normalizeDifficulty('  mEdIuM  ')).toBe('MEDIUM');
      expect(normalizeDifficulty('  hArD  ')).toBe('HARD');
    });

    it('defaults to MEDIUM for empty or unrecognized values', () => {
      expect(normalizeDifficulty('')).toBe('MEDIUM');
      expect(normalizeDifficulty('   ')).toBe('MEDIUM');
      expect(normalizeDifficulty(null)).toBe('MEDIUM');
      expect(normalizeDifficulty(undefined)).toBe('MEDIUM');
      expect(normalizeDifficulty('Unknown')).toBe('MEDIUM');
      expect(normalizeDifficulty('Insane')).toBe('MEDIUM');
    });
  });

  describe('parseDate', () => {
    it('parses standard ISO dates', () => {
      const d = parseDate('2024-01-15');
      expect(d.getFullYear()).toBe(2024);
      expect(d.getMonth()).toBe(0); // Jan is 0
      expect(d.getDate()).toBe(15);
    });

    it('parses US formatted dates MM/DD/YYYY', () => {
      const d = parseDate('01/15/2024');
      expect(d.getFullYear()).toBe(2024);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(15);
    });

    it('parses EU formatted dates DD/MM/YYYY when day > 12', () => {
      const d = parseDate('25/01/2024');
      expect(d.getFullYear()).toBe(2024);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(25);
    });

    it('parses natural language dates', () => {
      const d = parseDate('Jan 15, 2024');
      expect(d.getFullYear()).toBe(2024);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(15);
    });

    it('parses unix timestamp in milliseconds', () => {
      const timestamp = 1705276800000; // Jan 15 2024 00:00:00 UTC
      const d = parseDate(String(timestamp));
      expect(d.getTime()).toBe(timestamp);
    });

    it('parses Excel serial date numbers', () => {
      // Excel 45306 is ~2024-01-15
      const d = parseDate('45306');
      expect(d.getFullYear()).toBe(2024);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(15);
    });

    it('defaults to today for empty, invalid, or garbage input', () => {
      const before = Date.now();
      const d1 = parseDate('');
      const d2 = parseDate(null);
      const d3 = parseDate('not-a-valid-date');
      const after = Date.now();

      expect(d1.getTime()).toBeGreaterThanOrEqual(before - 1000);
      expect(d1.getTime()).toBeLessThanOrEqual(after + 1000);
      expect(d2.getTime()).toBeGreaterThanOrEqual(before - 1000);
      expect(d3.getTime()).toBeGreaterThanOrEqual(before - 1000);
    });
  });

  describe('detectPlatformFromUrl', () => {
    it('detects LeetCode URLs', () => {
      expect(detectPlatformFromUrl('https://leetcode.com/problems/two-sum/')).toBe('LEETCODE');
      expect(detectPlatformFromUrl('http://www.leetcode.com/problems/3sum')).toBe('LEETCODE');
      expect(detectPlatformFromUrl('leetcode.com/problems/two-sum')).toBe('LEETCODE');
    });

    it('detects Codeforces URLs', () => {
      expect(detectPlatformFromUrl('https://codeforces.com/problemset/problem/4/A')).toBe('CODEFORCES');
      expect(detectPlatformFromUrl('https://www.codeforces.com/contest/158/problem/A')).toBe('CODEFORCES');
    });

    it('detects GFG URLs', () => {
      expect(detectPlatformFromUrl('https://www.geeksforgeeks.org/problems/kadanes-algorithm/1')).toBe('GFG');
      expect(detectPlatformFromUrl('https://practice.geeksforgeeks.org/problems/two-sum')).toBe('GFG');
    });

    it('detects HackerRank URLs', () => {
      expect(detectPlatformFromUrl('https://www.hackerrank.com/challenges/solve-me-first/problem')).toBe('HACKERRANK');
    });

    it('detects CodeChef URLs', () => {
      expect(detectPlatformFromUrl('https://www.codechef.com/problems/FLOW001')).toBe('CODECHEF');
    });

    it('returns null for unknown platforms or null values', () => {
      expect(detectPlatformFromUrl('https://interviewbit.com/problems/two-sum')).toBeNull();
      expect(detectPlatformFromUrl('https://example.com')).toBeNull();
      expect(detectPlatformFromUrl('')).toBeNull();
      expect(detectPlatformFromUrl(null)).toBeNull();
    });
  });

  describe('normalizePlatform', () => {
    it('normalizes LeetCode variations', () => {
      expect(normalizePlatform('leetcode')).toBe('LEETCODE');
      expect(normalizePlatform('LEETCODE')).toBe('LEETCODE');
      expect(normalizePlatform('Leet Code')).toBe('LEETCODE');
      expect(normalizePlatform('lc')).toBe('LEETCODE');
    });

    it('normalizes Codeforces variations', () => {
      expect(normalizePlatform('codeforces')).toBe('CODEFORCES');
      expect(normalizePlatform('CODEFORCES')).toBe('CODEFORCES');
      expect(normalizePlatform('cf')).toBe('CODEFORCES');
    });

    it('normalizes GFG variations', () => {
      expect(normalizePlatform('gfg')).toBe('GFG');
      expect(normalizePlatform('geeksforgeeks')).toBe('GFG');
      expect(normalizePlatform('geeks for geeks')).toBe('GFG');
    });

    it('normalizes HackerRank variations', () => {
      expect(normalizePlatform('hackerrank')).toBe('HACKERRANK');
      expect(normalizePlatform('hr')).toBe('HACKERRANK');
    });

    it('normalizes CodeChef variations', () => {
      expect(normalizePlatform('codechef')).toBe('CODECHEF');
      expect(normalizePlatform('cc')).toBe('CODECHEF');
    });

    it('returns null for unsupported platforms', () => {
      expect(normalizePlatform('interviewbit')).toBeNull();
      expect(normalizePlatform('')).toBeNull();
      expect(normalizePlatform(null)).toBeNull();
    });
  });

  describe('autoDetectMappings', () => {
    it('maps common headers correctly', () => {
      const headers = ['Problem', 'Difficulty', 'Link', 'Topic'];
      const mapping = autoDetectMappings(headers);
      expect(mapping['Problem']).toBe('title');
      expect(mapping['Difficulty']).toBe('difficulty');
      expect(mapping['Link']).toBe('url');
      expect(mapping['Topic']).toBe('topic');
    });

    it('maps number and question headers', () => {
      const headers = ['S.No', 'Question Name', 'URL', 'Platform', 'Notes'];
      const mapping = autoDetectMappings(headers);
      expect(mapping['S.No']).toBe('problemNumber');
      expect(mapping['Question Name']).toBe('title');
      expect(mapping['URL']).toBe('url');
      expect(mapping['Platform']).toBe('platform');
      expect(mapping['Notes']).toBe('notes');
    });

    it('directly maps non-standard column headers as custom columns', () => {
      const headers = ['Language', 'Company Target', ' '];
      const mapping = autoDetectMappings(headers);
      expect(mapping['Language']).toBe('custom:Language');
      expect(mapping['Company Target']).toBe('custom:Company Target');
      expect(mapping[' ']).toBe('skip');
    });

    it('assigns first matching column and avoids duplicate mapping of the same field', () => {
      const headers = ['Title', 'Title2', 'Question'];
      const mapping = autoDetectMappings(headers);
      expect(mapping['Title']).toBe('title');
      expect(mapping['Title2']).toBe('custom:Title2');
      expect(mapping['Question']).toBe('custom:Question');
    });
  });

  describe('normalizeUrl', () => {
    it('preserves complete HTTP and HTTPS URLs', () => {
      expect(normalizeUrl('https://leetcode.com/problems/two-sum/')).toBe('https://leetcode.com/problems/two-sum/');
      expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('prepends https:// when protocol is omitted', () => {
      expect(normalizeUrl('leetcode.com/problems/two-sum/')).toBe('https://leetcode.com/problems/two-sum/');
    });

    it('returns # for invalid or empty URLs', () => {
      expect(normalizeUrl('')).toBe('#');
      expect(normalizeUrl('   ')).toBe('#');
      expect(normalizeUrl(null)).toBe('#');
      expect(normalizeUrl('random-text-without-domain')).toBe('#');
    });
  });

  describe('normalizeTopic', () => {
    it('converts to title case', () => {
      expect(normalizeTopic('dynamic programming')).toBe('Dynamic Programming');
      expect(normalizeTopic('ARRAYS')).toBe('Arrays');
      expect(normalizeTopic('binary search trees')).toBe('Binary Search Trees');
    });

    it('defaults to General for empty input', () => {
      expect(normalizeTopic('')).toBe('General');
      expect(normalizeTopic('  ')).toBe('General');
      expect(normalizeTopic(null)).toBe('General');
    });
  });

  describe('isRowEmpty', () => {
    it('returns true when all fields are empty or whitespace', () => {
      expect(isRowEmpty({ col1: '', col2: '  ', col3: '' })).toBe(true);
    });

    it('returns false when at least one field has content', () => {
      expect(isRowEmpty({ col1: '', col2: 'Two Sum', col3: '' })).toBe(false);
    });

    it('checks only specified mapped fields if provided', () => {
      expect(isRowEmpty({ col1: 'ignored-garbage', col2: '' }, ['col2'])).toBe(true);
      expect(isRowEmpty({ col1: 'ignored-garbage', col2: 'valid' }, ['col2'])).toBe(false);
    });
  });

  describe('computeStaggerSchedule', () => {
    const today = new Date('2024-01-01T00:00:00.000Z');

    it('assigns day 0 offset for the first batch', () => {
      const d0 = computeStaggerSchedule(0, 50, today, 10);
      const d9 = computeStaggerSchedule(9, 50, today, 10);
      expect(d0.getDate()).toBe(1);
      expect(d9.getDate()).toBe(1);
    });

    it('assigns day 1 offset for the second batch', () => {
      const d10 = computeStaggerSchedule(10, 50, today, 10);
      const d19 = computeStaggerSchedule(19, 50, today, 10);
      expect(d10.getDate()).toBe(2);
      expect(d19.getDate()).toBe(2);
    });

    it('assigns correct offset for large indices', () => {
      const d100 = computeStaggerSchedule(100, 200, today, 10);
      expect(d100.getDate()).toBe(11); // 10 days after Jan 1
    });
  });

  describe('hashString', () => {
    it('produces consistent non-negative integer hashes', () => {
      const h1 = hashString('two-sum');
      const h2 = hashString('two-sum');
      const h3 = hashString('3sum');

      expect(h1).toBe(h2);
      expect(typeof h1).toBe('number');
      expect(h1).toBeGreaterThanOrEqual(0);
      expect(h1).not.toBe(h3);
    });
  });

  describe('detectFileType', () => {
    it('detects csv files', () => {
      const file = new File([''], 'problems.csv', { type: 'text/csv' });
      expect(detectFileType(file)).toBe('csv');
    });

    it('detects xlsx and xls files', () => {
      const xlsxFile = new File([''], 'problems.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const xlsFile = new File([''], 'problems.xls', { type: 'application/vnd.ms-excel' });
      expect(detectFileType(xlsxFile)).toBe('excel');
      expect(detectFileType(xlsFile)).toBe('excel');
    });

    it('returns unsupported for other file types', () => {
      const pdf = new File([''], 'doc.pdf', { type: 'application/pdf' });
      expect(detectFileType(pdf)).toBe('unsupported');
    });
  });

  describe('validateAndProcessRows', () => {
    const parsedFile: ParsedFile = {
      headers: ['#', 'Title', 'Diff', 'Topic', 'URL', 'Date'],
      rows: [
        {
          '#': '1',
          Title: 'Two Sum',
          Diff: 'Easy',
          Topic: 'Arrays',
          URL: 'https://leetcode.com/problems/two-sum/',
          Date: '2024-01-15',
        },
        {
          '#': '2',
          Title: 'Add Two Numbers',
          Diff: '',
          Topic: '',
          URL: '',
          Date: '',
        },
        {
          '#': '3',
          Title: '',
          Diff: 'Hard',
          Topic: 'DP',
          URL: '',
          Date: '',
        },
        {
          '#': '1',
          Title: 'Two Sum Duplicate',
          Diff: 'Easy',
          Topic: 'Arrays',
          URL: 'https://leetcode.com/problems/two-sum/',
          Date: '2024-01-15',
        },
      ],
      totalRows: 4,
    };

    const mapping: ColumnMapping = {
      '#': 'problemNumber',
      Title: 'title',
      Diff: 'difficulty',
      Topic: 'topic',
      URL: 'url',
      Date: 'dateSolved',
    };

    it('correctly processes rows with fallbacks, skips missing titles, and removes duplicates', async () => {
      const res = await validateAndProcessRows(parsedFile, mapping, 'staggered', 'LEETCODE');

      // Row 1: Valid
      // Row 2: Valid with defaults (diff -> MEDIUM, topic -> General, url -> #, date -> today)
      // Row 3: Skipped (no title)
      // Row 4: Skipped (duplicate #1 on LeetCode)
      expect(res.valid.length).toBe(2);
      expect(res.valid[0].problemNumber).toBe(1);
      expect(res.valid[0].title).toBe('Two Sum');
      expect(res.valid[0].difficulty).toBe('EASY');

      expect(res.valid[1].problemNumber).toBe(2);
      expect(res.valid[1].difficulty).toBe('MEDIUM');
      expect(res.valid[1].topic).toBe('General');

      // Check warnings and errors
      expect(res.warnings.length).toBeGreaterThan(0);
      expect(res.errors.length).toBe(1); // Row 3
      expect(res.skipped.length).toBe(2); // Row 3 and Row 4
    });

    it('applies archive strategy correctly', async () => {
      const res = await validateAndProcessRows(parsedFile, mapping, 'archive', 'LEETCODE');
      expect(res.valid[0].status).toBe('MASTERED');
      expect(res.valid[0].currentStep).toBe(3);
      expect(res.valid[0].nextRevisionAt).toBe('2099-12-31T00:00:00.000Z');
    });

    it('applies fresh strategy correctly', async () => {
      const today = new Date('2024-01-01T00:00:00.000Z');
      const res = await validateAndProcessRows(parsedFile, mapping, 'fresh', 'LEETCODE', today);
      expect(res.valid[0].status).toBe('ACTIVE');
      expect(res.valid[0].currentStep).toBe(0);
      // Fresh adds 3 days
      const due = new Date(res.valid[0].nextRevisionAt);
      expect(due.getUTCDate()).toBe(4);
    });

    it('applies staggered strategy with custom daily pace', async () => {
      const today = new Date('2024-01-01T00:00:00.000Z');
      // With daily pace of 1, problem 0 is day 0 (Jan 1) and problem 1 is day 1 (Jan 2)
      const res = await validateAndProcessRows(parsedFile, mapping, 'staggered', 'LEETCODE', today, 1);
      const due0 = new Date(res.valid[0].nextRevisionAt);
      const due1 = new Date(res.valid[1].nextRevisionAt);
      expect(due0.getUTCDate()).toBe(1);
      expect(due1.getUTCDate()).toBe(2);
    });

    it('extracts custom columns and stores them in customFields', async () => {
      const fileWithCustomCols: ParsedFile = {
        headers: ['#', 'Title', 'Language', 'Company Target'],
        rows: [
          {
            '#': '1',
            Title: 'Two Sum',
            Language: 'Python3',
            'Company Target': 'Google',
          },
          {
            '#': '2',
            Title: 'Add Two Numbers',
            Language: 'C++',
            'Company Target': '',
          },
        ],
        totalRows: 2,
      };

      const customMapping: ColumnMapping = {
        '#': 'problemNumber',
        Title: 'title',
        Language: 'custom:Language',
        'Company Target': 'custom:Company Target',
      };

      const res = await validateAndProcessRows(fileWithCustomCols, customMapping, 'staggered', 'LEETCODE');
      expect(res.valid.length).toBe(2);
      expect(res.customColumns).toEqual(['Language', 'Company Target']);
      expect(res.valid[0].customFields).toEqual({
        Language: 'Python3',
        'Company Target': 'Google',
      });
      expect(res.valid[1].customFields).toEqual({
        Language: 'C++',
      });
    });

    it('auto-detects existing custom columns when provided', () => {
      const headers = ['Title', 'Language', 'Approach'];
      const mapping = autoDetectMappings(headers, ['Language', 'Approach']);
      expect(mapping['Title']).toBe('title');
      expect(mapping['Language']).toBe('custom:Language');
      expect(mapping['Approach']).toBe('custom:Approach');
    });
  });
});
