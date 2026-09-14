import { getResolver } from './platforms';
import { getInitialSchedule } from './scheduling';

export type RecallField =
  | 'title'
  | 'problemNumber'
  | 'platform'
  | 'difficulty'
  | 'topic'
  | 'url'
  | 'dateSolved'
  | 'notes'
  | 'skip'
  | `custom:${string}`;

export type Platform = 'LEETCODE' | 'CODEFORCES' | 'GFG' | 'HACKERRANK' | 'CODECHEF';

export type ParsedFile = {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
};

export type ColumnMapping = Record<string, RecallField>;

export type ImportStrategy = 'staggered' | 'fresh' | 'archive';

export type ProcessedProblem = {
  platform: Platform;
  problemNumber: number;
  title: string;
  url: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  dateSolved: string; // ISO string
  notes: string | null;
  customFields?: Record<string, string>;
  currentStep: number;
  nextRevisionAt: string; // ISO string
  status: 'ACTIVE' | 'MASTERED';
};

export type ValidationResult = {
  valid: ProcessedProblem[];
  warnings: { row: number; message: string }[];
  errors: { row: number; message: string }[];
  skipped: { row: number; reason: string }[];
  customColumns: string[];
};

// -----------------------------------------------------------------------------
// File Parsing
// -----------------------------------------------------------------------------

export function detectFileType(file: File): 'csv' | 'excel' | 'unsupported' {
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();

  if (name.endsWith('.csv') || type === 'text/csv' || type === 'application/csv') {
    return 'csv';
  }

  if (
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    type === 'application/vnd.ms-excel'
  ) {
    return 'excel';
  }

  return 'unsupported';
}

export async function parseCsvFile(file: File): Promise<ParsedFile> {
  const Papa = (await import('papaparse')).default;

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        const headers = (results.meta.fields || [])
          .map((h) => h.trim())
          .filter(Boolean);

        const rows: Record<string, string>[] = [];

        for (const rawRow of results.data as Record<string, any>[]) {
          const row: Record<string, string> = {};
          let hasAnyContent = false;

          for (const key of Object.keys(rawRow)) {
            const trimmedKey = key.trim();
            if (!trimmedKey) continue;
            const val = rawRow[key];
            const strVal = val !== null && val !== undefined ? String(val).trim() : '';
            if (strVal) hasAnyContent = true;
            row[trimmedKey] = strVal;
          }

          if (hasAnyContent) {
            rows.push(row);
          }
        }

        resolve({
          headers,
          rows,
          totalRows: rows.length,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export async function parseExcelFile(file: File): Promise<ParsedFile> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    raw: false,
    defval: '',
  });

  if (jsonData.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const headers = Object.keys(jsonData[0])
    .map((h) => h.trim())
    .filter(Boolean);

  const rows: Record<string, string>[] = [];

  for (const rawRow of jsonData) {
    const row: Record<string, string> = {};
    let hasAnyContent = false;

    for (const key of Object.keys(rawRow)) {
      const trimmedKey = key.trim();
      if (!trimmedKey) continue;
      const val = rawRow[key];
      const strVal = val !== null && val !== undefined ? String(val).trim() : '';
      if (strVal) hasAnyContent = true;
      row[trimmedKey] = strVal;
    }

    if (hasAnyContent) {
      rows.push(row);
    }
  }

  return {
    headers,
    rows,
    totalRows: rows.length,
  };
}

// -----------------------------------------------------------------------------
// Auto Detection & Column Mapping
// -----------------------------------------------------------------------------

export function autoDetectMappings(
  headers: string[],
  existingCustomColumns: string[] = []
): Record<string, RecallField> {
  const mapping: Record<string, RecallField> = {};
  const assigned = new Set<RecallField>();

  for (const header of headers) {
    const h = header.toLowerCase().trim();

    const checkField = (field: RecallField, condition: boolean): boolean => {
      if (condition && !assigned.has(field)) {
        mapping[header] = field;
        assigned.add(field);
        return true;
      }
      return false;
    };

    // 1. Problem Number (check before title so "problem number" or "problem #" isn't caught by title)
    if (
      checkField(
        'problemNumber',
        /\b(number|no|#|id|s\.no|sno|sr|code)\b/i.test(h) ||
          h === '#' ||
          h === 'no' ||
          h === 'id' ||
          h.includes('problem number') ||
          h.includes('problem #') ||
          h.includes('question number')
      )
    ) {
      continue;
    }

    // 2. Title / Question
    if (
      checkField(
        'title',
        /\b(title|question|problem|name)\b/i.test(h) ||
          h === 'title' ||
          h === 'name' ||
          h === 'question' ||
          h.includes('problem name') ||
          h.includes('question name')
      )
    ) {
      continue;
    }

    // 3. Platform
    if (
      checkField(
        'platform',
        /\b(platform|source|site|judge)\b/i.test(h) || h === 'platform' || h === 'source'
      )
    ) {
      continue;
    }

    // 4. Difficulty
    if (
      checkField(
        'difficulty',
        /\b(difficulty|diff|level)\b/i.test(h) || h === 'difficulty' || h === 'diff'
      )
    ) {
      continue;
    }

    // 5. Topic / Tags
    if (
      checkField(
        'topic',
        /\b(topic|tag|tags|category|type|subject)\b/i.test(h) || h === 'topic' || h === 'tags'
      )
    ) {
      continue;
    }

    // 6. URL / Link
    if (
      checkField(
        'url',
        /\b(url|link|href|webpage)\b/i.test(h) || h === 'url' || h === 'link'
      )
    ) {
      continue;
    }

    // 7. Date Solved
    if (
      checkField(
        'dateSolved',
        /\b(date|solved|completed|when)\b/i.test(h) || h === 'date' || h.includes('date solved')
      )
    ) {
      continue;
    }

    // 8. Notes
    if (
      checkField(
        'notes',
        /\b(note|notes|comment|comments|remark|remarks)\b/i.test(h) || h === 'notes' || h === 'note'
      )
    ) {
      continue;
    }

    // 9. Match existing user custom columns if provided
    let matchedCustom = false;
    for (const ec of existingCustomColumns) {
      if (ec.toLowerCase().trim() === h) {
        mapping[header] = `custom:${ec}` as RecallField;
        matchedCustom = true;
        break;
      }
    }
    if (matchedCustom) continue;

    // 10. Directly map any other non-standard column as a custom column
    const cleanHeader = header.trim();
    if (cleanHeader) {
      mapping[header] = `custom:${cleanHeader}` as RecallField;
    } else {
      mapping[header] = 'skip';
    }
  }

  return mapping;
}

// -----------------------------------------------------------------------------
// Normalization Utilities
// -----------------------------------------------------------------------------

export function normalizeDifficulty(value?: string | null): 'EASY' | 'MEDIUM' | 'HARD' {
  if (!value) return 'MEDIUM';
  const v = value.trim().toLowerCase();

  if (
    v === 'easy' ||
    v === 'e' ||
    v === '1' ||
    v === 'simple' ||
    v === 'basic' ||
    v.startsWith('easy')
  ) {
    return 'EASY';
  }

  if (
    v === 'hard' ||
    v === 'h' ||
    v === '3' ||
    v === 'difficult' ||
    v === 'advanced' ||
    v === 'expert' ||
    v.startsWith('hard')
  ) {
    return 'HARD';
  }

  if (
    v === 'medium' ||
    v === 'm' ||
    v === '2' ||
    v === 'med' ||
    v === 'moderate' ||
    v === 'intermediate' ||
    v.startsWith('med')
  ) {
    return 'MEDIUM';
  }

  return 'MEDIUM';
}

export function parseDate(value?: string | null): Date {
  if (!value) return new Date();
  const trimmed = value.trim();
  if (!trimmed) return new Date();

  // Numeric: timestamp or Excel serial date
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const num = parseFloat(trimmed);
    // Unix timestamp in ms
    if (num > 10000000000) {
      const d = new Date(num);
      if (!isNaN(d.getTime())) return d;
    }
    // Unix timestamp in seconds
    if (num > 1000000000) {
      const d = new Date(num * 1000);
      if (!isNaN(d.getTime())) return d;
    }
    // Excel serial date (e.g. 45678)
    if (num >= 20000 && num <= 70000) {
      const excelEpoch = new Date(1899, 11, 30);
      const msPerDay = 86400000;
      const d = new Date(excelEpoch.getTime() + num * msPerDay);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Try standard parse
  const parsedTime = Date.parse(trimmed);
  if (!isNaN(parsedTime)) {
    return new Date(parsedTime);
  }

  // Regex patterns: DD/MM/YYYY or DD-MM-YYYY
  const partsMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (partsMatch) {
    const p1 = parseInt(partsMatch[1], 10);
    const p2 = parseInt(partsMatch[2], 10);
    const year = parseInt(partsMatch[3], 10);

    // If p1 > 12, p1 is day, p2 is month
    if (p1 > 12 && p2 <= 12) {
      return new Date(year, p2 - 1, p1);
    }
    // If p2 > 12, p2 is day, p1 is month
    if (p2 > 12 && p1 <= 12) {
      return new Date(year, p1 - 1, p2);
    }
    // Default to US format (p1: month, p2: day)
    return new Date(year, p1 - 1, p2);
  }

  return new Date();
}

export function detectPlatformFromUrl(url?: string | null): Platform | null {
  if (!url) return null;
  const lower = url.toLowerCase();

  if (lower.includes('leetcode.com')) return 'LEETCODE';
  if (lower.includes('codeforces.com')) return 'CODEFORCES';
  if (lower.includes('geeksforgeeks.org') || lower.includes('gfg')) return 'GFG';
  if (lower.includes('hackerrank.com')) return 'HACKERRANK';
  if (lower.includes('codechef.com')) return 'CODECHEF';

  return null;
}

export function normalizePlatform(value?: string | null): Platform | null {
  if (!value) return null;
  const v = value.trim().toLowerCase().replace(/[\s_-]+/g, '');

  if (v === 'leetcode' || v === 'lc') return 'LEETCODE';
  if (v === 'codeforces' || v === 'cf') return 'CODEFORCES';
  if (v === 'gfg' || v === 'geeksforgeeks') return 'GFG';
  if (v === 'hackerrank' || v === 'hr') return 'HACKERRANK';
  if (v === 'codechef' || v === 'cc') return 'CODECHEF';

  return null;
}

export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function normalizeTopic(value?: string | null): string {
  if (!value) return 'General';
  const trimmed = value.trim();
  if (!trimmed) return 'General';

  // Capitalize words
  return trimmed
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeUrl(value?: string | null): string {
  if (!value) return '#';
  const trimmed = value.trim();
  if (!trimmed) return '#';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.includes('.com') || trimmed.includes('.org') || trimmed.includes('.io') || trimmed.includes('.net')) {
    return `https://${trimmed}`;
  }

  return '#';
}

export function isRowEmpty(row: Record<string, string>, mappedFields?: string[]): boolean {
  if (mappedFields && mappedFields.length > 0) {
    return mappedFields.every((field) => !row[field] || !row[field].trim());
  }
  return Object.values(row).every((val) => !val || !val.trim());
}

export function computeStaggerSchedule(
  index: number,
  totalProblems: number,
  today: Date,
  batchSize: number = 10
): Date {
  const dayOffset = Math.floor(index / Math.max(1, batchSize));
  const target = new Date(today.getTime());
  target.setDate(target.getDate() + dayOffset);
  return target;
}

// -----------------------------------------------------------------------------
// Problem Number Extraction
// -----------------------------------------------------------------------------

export async function extractProblemNumberFromUrl(
  url: string,
  platform: Platform
): Promise<number | null> {
  if (!url || url === '#') return null;

  try {
    if (platform === 'LEETCODE') {
      const match = url.match(/leetcode\.com\/problems\/([^/?#]+)/i);
      if (match && match[1]) {
        const slug = match[1].toLowerCase();
        // Check local JSON dataset if available
        try {
          const leetcodeData = (await import('../data/leetcode-problems.json')).default as any[];
          const item = leetcodeData.find((p) => p.slug?.toLowerCase() === slug);
          if (item?.id) return item.id;
        } catch {}
        return hashString(slug);
      }
    }

    if (platform === 'CODEFORCES') {
      const match = url.match(/codeforces\.com\/(?:problemset\/problem|contest)\/(\d+)\/([A-Za-z\d]+)/i);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    if (platform === 'CODECHEF') {
      const match = url.match(/codechef\.com\/(?:[^\/]+\/)?problems\/([A-Za-z\d_]+)/i);
      if (match) {
        const code = match[1].toUpperCase();
        try {
          const ccData = (await import('../data/codechef-problems.json')).default as any[];
          const item = ccData.find((p) => p.code?.toUpperCase() === code);
          if (item?.numericId) return item.numericId;
        } catch {}
        return hashString(code);
      }
    }

    if (platform === 'GFG') {
      const match = url.match(/geeksforgeeks\.org\/problems\/([^/?#]+)/i);
      const slug = match ? match[1].toLowerCase() : url.split('/').filter(Boolean).pop()?.toLowerCase();
      if (slug) return hashString(slug);
    }

    if (platform === 'HACKERRANK') {
      const match = url.match(/hackerrank\.com\/(?:contests\/[^/]+\/)?challenges\/([^/?#]+)/i);
      const slug = match ? match[1].toLowerCase() : url.split('/').filter(Boolean).pop()?.toLowerCase();
      if (slug) return hashString(slug);
    }
  } catch {}

  return null;
}

// -----------------------------------------------------------------------------
// Full Validation and Row Processing Pipeline
// -----------------------------------------------------------------------------

export async function validateAndProcessRows(
  parsedFile: ParsedFile,
  columnMapping: ColumnMapping,
  strategy: ImportStrategy,
  defaultPlatform: Platform = 'LEETCODE',
  today: Date = new Date(),
  batchSize: number = 10
): Promise<ValidationResult> {
  const valid: ProcessedProblem[] = [];
  const warnings: { row: number; message: string }[] = [];
  const errors: { row: number; message: string }[] = [];
  const skipped: { row: number; reason: string }[] = [];

  // Invert mapping for quick column lookup: RecallField -> csvHeader
  const fieldToHeader: Partial<Record<RecallField, string>> = {};
  const customColMappings: { csvCol: string; colName: string }[] = [];

  for (const [csvCol, field] of Object.entries(columnMapping)) {
    if (field !== 'skip') {
      fieldToHeader[field] = csvCol;
      if (typeof field === 'string' && field.startsWith('custom:')) {
        const colName = field.slice(7).trim();
        if (colName) {
          customColMappings.push({ csvCol, colName });
        }
      }
    }
  }

  const customColumns = Array.from(new Set(customColMappings.map((c) => c.colName)));
  const mappedHeaders = Object.keys(columnMapping).filter((col) => columnMapping[col] !== 'skip');
  const seenUniqueKeys = new Set<string>();

  for (let i = 0; i < parsedFile.rows.length; i++) {
    const rowNum = i + 1; // 1-indexed row number
    const row = parsedFile.rows[i];

    // 1. Skip completely empty rows
    if (isRowEmpty(row, mappedHeaders)) {
      continue;
    }

    // 2. Extract values
    const rawTitle = fieldToHeader.title ? row[fieldToHeader.title] : '';
    const rawNumber = fieldToHeader.problemNumber ? row[fieldToHeader.problemNumber] : '';
    const rawPlatform = fieldToHeader.platform ? row[fieldToHeader.platform] : '';
    const rawDiff = fieldToHeader.difficulty ? row[fieldToHeader.difficulty] : '';
    const rawTopic = fieldToHeader.topic ? row[fieldToHeader.topic] : '';
    const rawUrl = fieldToHeader.url ? row[fieldToHeader.url] : '';
    const rawDate = fieldToHeader.dateSolved ? row[fieldToHeader.dateSolved] : '';
    const rawNotes = fieldToHeader.notes ? row[fieldToHeader.notes] : '';

    // 3. Validate Title
    const title = rawTitle ? rawTitle.trim() : '';
    if (!title) {
      errors.push({ row: rowNum, message: `Row ${rowNum}: Missing required title` });
      skipped.push({ row: rowNum, reason: `Row ${rowNum}: Missing title` });
      continue;
    }

    // 4. Platform
    let platform: Platform | null = normalizePlatform(rawPlatform);
    if (!platform && rawUrl) {
      platform = detectPlatformFromUrl(rawUrl);
    }
    if (!platform) {
      platform = defaultPlatform;
    }

    // 5. Difficulty
    let difficulty = normalizeDifficulty(rawDiff);
    if (!rawDiff || !rawDiff.trim()) {
      warnings.push({ row: rowNum, message: `Row ${rowNum}: Missing difficulty, defaulted to Medium` });
    }

    // 6. Topic
    let topic = normalizeTopic(rawTopic);
    if (!rawTopic || !rawTopic.trim()) {
      warnings.push({ row: rowNum, message: `Row ${rowNum}: Missing topic, defaulted to General` });
    }

    // 7. Date Solved
    const dateSolvedDate = parseDate(rawDate);
    if (!rawDate || !rawDate.trim()) {
      warnings.push({ row: rowNum, message: `Row ${rowNum}: Missing date, defaulted to today` });
    }

    // 8. URL
    let url = normalizeUrl(rawUrl);
    if (!rawUrl || !rawUrl.trim() || url === '#') {
      warnings.push({ row: rowNum, message: `Row ${rowNum}: Missing URL, placeholder '#' used` });
    }

    // 9. Problem Number
    let problemNumber: number | null = null;
    if (rawNumber && /^\d+$/.test(rawNumber.trim())) {
      problemNumber = parseInt(rawNumber.trim(), 10);
    }

    if (!problemNumber && rawUrl) {
      problemNumber = await extractProblemNumberFromUrl(rawUrl, platform);
    }

    if (!problemNumber || problemNumber <= 0) {
      // Auto-generate safe high-range problem number
      problemNumber = 100000 + i;
      warnings.push({
        row: rowNum,
        message: `Row ${rowNum}: Problem number generated (${problemNumber})`,
      });
    }

    // 10. Platform Resolver Enrichment (if title, diff, topic, or url can be enriched)
    try {
      const resolver = getResolver(platform);
      if (resolver) {
        const resolveId = String(problemNumber);
        const res = await resolver.resolve(resolveId);
        if (res.found && res.data) {
          if (!rawDiff && res.data.difficulty) difficulty = res.data.difficulty;
          if (!rawTopic && res.data.topic) topic = res.data.topic;
          if ((!rawUrl || url === '#') && res.data.url) url = res.data.url;
        }
      }
    } catch {}

    // 11. Scheduling Strategy
    let currentStep = 0;
    let nextRevisionAt: Date;
    let status: 'ACTIVE' | 'MASTERED' = 'ACTIVE';

    if (strategy === 'archive') {
      currentStep = 3;
      status = 'MASTERED';
      nextRevisionAt = new Date('2099-12-31T00:00:00.000Z');
    } else if (strategy === 'fresh') {
      const initial = getInitialSchedule(today);
      currentStep = initial.currentStep;
      status = initial.status;
      nextRevisionAt = initial.nextRevisionAt;
    } else {
      // Staggered: custom batchSize problems per day
      currentStep = 0;
      status = 'ACTIVE';
      nextRevisionAt = computeStaggerSchedule(valid.length, parsedFile.rows.length, today, batchSize);
    }

    // 12. De-duplication within the uploaded file
    const uniqueKey = `${platform}:${problemNumber}`;
    if (seenUniqueKeys.has(uniqueKey)) {
      skipped.push({
        row: rowNum,
        reason: `Row ${rowNum}: Duplicate problem (${platform} #${problemNumber}) in file`,
      });
      continue;
    }
    seenUniqueKeys.add(uniqueKey);

    // 13. Extract custom fields if any
    const rowCustomFields: Record<string, string> = {};
    for (const cm of customColMappings) {
      const val = row[cm.csvCol];
      if (val !== undefined && val !== null && String(val).trim()) {
        rowCustomFields[cm.colName] = String(val).trim();
      }
    }

    // 14. Add valid problem
    valid.push({
      platform,
      problemNumber,
      title,
      url,
      difficulty,
      topic,
      dateSolved: dateSolvedDate.toISOString(),
      notes: rawNotes ? rawNotes.trim() : null,
      customFields: Object.keys(rowCustomFields).length > 0 ? rowCustomFields : undefined,
      currentStep,
      nextRevisionAt: nextRevisionAt.toISOString(),
      status,
    });
  }

  return {
    valid,
    warnings,
    errors,
    skipped,
    customColumns,
  };
}
