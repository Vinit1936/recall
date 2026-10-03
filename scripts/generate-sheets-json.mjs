/**
 * generate-sheets-json.mjs
 *
 * Normalises the raw third-party sheet dumps in `sheets/` into the curated
 * JSON files consumed by the app's DSA Sheets section.
 *
 * WHY A GENERATOR INSTEAD OF HAND-WRITTEN JSON
 * ---------------------------------------------
 * Every source here is community-maintained and drifts over time. Rather than
 * hand-copying numbers (and hand-maintaining ~3,400 of them), we parse the raw
 * dumps once and re-run this script whenever a source updates. The output is
 * deterministic and diff-friendly, so a change in a sheet shows up in review as
 * a small, readable JSON diff instead of an opaque blob rewrite.
 *
 * OUTPUT DESIGN
 * -------------
 * Output goes to `src/data/sheets/`, alongside the other bundled datasets, so
 * the app can import it directly. The raw dumps stay in `sheets/` and are
 * gitignored.
 *
 * Sheet files store ONLY LeetCode problem numbers:
 *
 *   { id, title, sourceUrl, problemCount, sections: [{ name, items: [1, 121] }] }
 *
 * All metadata (title / difficulty / topic / url) lives in ONE place,
 * `problems.json`, keyed by problem number. Problems repeat heavily across
 * sheets - Two Sum alone is in at least six of them - so duplicating metadata
 * per sheet would multiply the payload for zero benefit. Total sheet payload is
 * ~15 KB this way versus ~195 KB if metadata were inlined.
 *
 * Where the metadata comes from, in priority order:
 *   1. src/data/leetcode-problems.json  - id + slug + title + url (authoritative
 *                                         for identity, but topic is always the
 *                                         placeholder "General")
 *   2. sheets/dsa-sheets/leetcode-company-wise-problems-main, per-company
 *      "5. All.csv"                    - real LeetCode topics, plus frequency
 *                                         and acceptance rate. Used to fill in
 *                                         topics that the repo dataset lacks.
 *
 * KNOWN LIMITATION: src/data/leetcode-problems.json omits premium-only problems
 * (710 gaps in the 1..3510 id range, e.g. 252 Meeting Rooms, 271 Encode and
 * Decode Strings). Those sheets entries are reported as `unresolved` rather
 * than being silently dropped, so the gap stays visible.
 *
 * Run: node scripts/generate-sheets-json.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'sheets');
const OUT = path.join(ROOT, 'src', 'data', 'sheets');

// Set to a fixed date so regenerating without changing sources is a no-op diff.
const VERIFIED = '2026-10-02';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const log = (...a) => console.log(...a);

/** Pull the LeetCode slug out of a URL cell, or null if it isn't LeetCode. */function slugOf(value) {
  const m = String(value ?? '').match(/leetcode\.com\/problems\/([^/?#\s,'")\]]+)/);
  return m ? m[1] : null;
}

function readXlsx(rel) {
  const full = path.join(RAW, rel);
  if (!fs.existsSync(full)) return [];
  const wb = XLSX.readFile(full);
  const out = [];
  for (const sn of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], {
      header: 1,
      blankrows: false,
      defval: '',
    });
    rows.forEach((r, i) => out.push({ row: i, sheet: sn, cells: r.map((c) => String(c ?? '').trim()) }));
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Build the union problem index
// ---------------------------------------------------------------------------

log('Reading repo LeetCode dataset...');
const repoLc = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src', 'data', 'leetcode-problems.json'), 'utf8'),
);
const bySlug = new Map();
const byNum = new Map();
for (const p of repoLc) {
  bySlug.set(p.slug, p);
  byNum.set(p.id, p);
}
log(`  ${repoLc.length} problems`);

// Backfill real topics from the company CSVs. The repo dataset ships
// `topic: "General"` for every single record, which makes the topic filter and
// the 12 --topic-N-* colour tokens useless. These CSVs carry genuine LeetCode
// topic lists, so we lift them in here rather than leaving sheets unfilterable.
log('Backfilling topics from company CSVs...');
const companyDir = path.join(
  RAW,
  'dsa-sheets',
  'leetcode-company-wise-problems-main',
);
const companyIds = new Map(); // company name -> Set<number>
const topicBackfill = new Map(); // slug -> topics string
let companyCsvCount = 0;

if (fs.existsSync(companyDir)) {
  for (const d of fs.readdirSync(companyDir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    // The dump contains a nested copy of itself; skip it.
    if (d.name === 'leetcode-company-wise-problems-main') continue;
    const allFile = path.join(companyDir, d.name, '5. All.csv');
    if (!fs.existsSync(allFile)) continue;
    companyCsvCount++;
    const text = fs.readFileSync(allFile, 'utf8');
    const ids = new Set();
    for (const m of text.matchAll(/leetcode\.com\/problems\/([^/?#,\s"')]+)/g)) {
      const slug = m[1];
      const rec = bySlug.get(slug);
      if (rec) ids.add(rec.id);
    }
    companyIds.set(d.name, ids);
  }

  // Second pass: harvest topics (cheap, only where still the "General" placeholder).
  for (const d of fs.readdirSync(companyDir, { withFileTypes: true }).filter((e) => e.isDirectory())) {
    if (d.name === 'leetcode-company-wise-problems-main') continue;
    const allFile = path.join(companyDir, d.name, '5. All.csv');
    if (!fs.existsSync(allFile)) continue;
    const wb = XLSX.read(text_to_buffer(fs.readFileSync(allFile, 'utf8')));
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
      header: 1,
      blankrows: false,
      defval: '',
    });
    for (const r of rows.slice(1)) {
      const slug = slugOf(r[4]);
      if (slug && bySlug.has(slug) && !topicBackfill.has(slug)) {
        const topics = String(r[5] ?? '').trim();
        if (topics) topicBackfill.set(slug, topics);
      }
    }
  }
}

// XLSX.read wants a Buffer; wrap our utf8 string.
function text_to_buffer(s) {
  return Buffer.from(s, 'utf8');
}

log(`  ${companyCsvCount} company CSVs, ${companyIds.size} companies`);
log(`  topics recovered for ${topicBackfill.size} problems`);

// ---------------------------------------------------------------------------
// Company tags per problem
//
// Invert companyIds into problem -> companies, so any sheet can show which
// companies ask a given question. That data is only in the company-wise dump,
// but it is genuinely useful on every sheet ("Two Sum - Google, Amazon,
// Meta"), so it is lifted onto all of them.
//
// Only a few are kept. The distribution is long-tailed: the median problem has
// 3 companies but Two Sum has 115, and storing them all would add hundreds of
// kilobytes for a column nobody reads.
//
// HOW THEY ARE RANKED — the interesting part
//
// Ranking purely by company popularity is useless: Google, Amazon and Bloomberg
// ask almost everything, so every single row would read "Google, Amazon,
// Bloomberg" and carry zero information.
//
// Ranking purely by selectivity (rarest asker first) is the opposite failure:
// Two Sum's top three become EY, Synopsys and Western Digital, which tells a
// user nothing and looks like noise.
//
// So both filters are combined. Companies asking fewer than
// MIN_COMPANY_SIZE problems are dropped as one-offs, and what remains is sorted
// ascending by catalog size — the most *distinctive* real company that asks this
// problem, which is both recognisable and actually informative.
// ---------------------------------------------------------------------------

const MAX_COMPANIES_PER_PROBLEM = 3;
const MIN_COMPANY_SIZE = 20;

const companiesByNumber = new Map(); // problem number -> string[]
for (const [company, ids] of companyIds) {
  if (ids.size < MIN_COMPANY_SIZE) continue;
  for (const id of ids) {
    let list = companiesByNumber.get(id);
    if (!list) companiesByNumber.set(id, (list = []));
    list.push(company);
  }
}

// Ascending by catalog size == most distinctive first.
const companySize = new Map([...companyIds].map(([name, ids]) => [name, ids.size]));
for (const [id, list] of companiesByNumber) {
  list.sort((a, b) => companySize.get(a) - companySize.get(b));
  companiesByNumber.set(id, list.slice(0, MAX_COMPANIES_PER_PROBLEM));
}

log(
  `  company tags: ${companiesByNumber.size} problems ` +
    `(top ${MAX_COMPANIES_PER_PROBLEM}, from ${[...companyIds.values()].filter((s) => s.size >= MIN_COMPANY_SIZE).length} companies with >=${MIN_COMPANY_SIZE} problems)`,
);

// ---------------------------------------------------------------------------
// 2. Sheet parsers
//
// Each parser returns { id, title, sourceUrl, sections: [{ name, items }] }
// where items are LeetCode problem numbers. Anything that can't be mapped gets
// pushed to `unresolved` so nothing disappears silently.
// ---------------------------------------------------------------------------

const builders = [];
const unresolvedAll = [];

// --- Blind 75 -------------------------------------------------------------
// generate_problems.py holds a PROBLEM_DATA dict keyed by category, with
// tuples of (file_slug, title, leetcode_number, difficulty, ...). Cleanest
// source of the 9: the number is already in the file.
builders.push({
  id: 'blind-75',
  title: 'Blind 75',
  description: 'The 75 problems that cover the most ground per hour of practice.',
  sourceUrl: 'https://neetcode.io/practice',
  build() {
    const f = path.join(RAW, 'blind-75', 'generate_problems.py');
    if (!fs.existsSync(f)) return null;
    const src = fs.readFileSync(f, 'utf8');
    const start = src.indexOf('PROBLEM_DATA = {');
    const end = src.indexOf('\ndef create_problem_file');
    const block = src.slice(start, end);
    const sections = [];
    const catRe = /^\s{4}"([a-z_]+)":\s*\[/gm;
    const cats = [...block.matchAll(catRe)];
    for (let i = 0; i < cats.length; i++) {
      const name = cats[i][1];
      const from = cats[i].index + cats[i][0].length;
      const to = i + 1 < cats.length ? cats[i + 1].index : block.length;
      const body = block.slice(from, to);
      const items = [];
      for (const t of body.matchAll(/\(\s*"[a-z0-9_]+"\s*,\s*"[^"]*"\s*,\s*"(\d+)"/g)) {
        const n = Number(t[1]);
        if (byNum.has(n)) items.push(n);
        else unresolvedAll.push({ sheet: 'blind-75', ref: String(n), reason: 'not in repo dataset (premium?)' });
      }
      if (items.length) sections.push({ name: pretty(name), items });
    }
    return finalize(sections);
  },
});

// --- Striver SDE ----------------------------------------------------------
// Java filenames encode difficulty + number: "E053. Maximum Subarray.java".
// The 27 folder names give us Striver's own topic sections. Files with no
// leading number are TUF-native exercises (Coding Ninjas / InterviewBit / GFG)
// and are reported as unresolved - there is no LeetCode problem to point at.
builders.push({
  id: 'striver-sde',
  description: "Product-company SDE questions, grouped into 27 topics in Striver's order.",
  title: "Striver's SDE Sheet",
  sourceUrl: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/',
  build() {
    const root = path.join(RAW, 'strivers-sde-sheet', 'Java');
    if (!fs.existsSync(root)) return null;
    const sections = [];
    for (const dir of fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory())) {
      const items = [];
      for (const f of fs.readdirSync(path.join(root, dir.name))) {
        const m = f.replace(/\.java$/i, '').match(/^([EMH])[\s.-]*(\d{1,5})\b/);
        if (!m) {
          unresolvedAll.push({ sheet: 'striver-sde', ref: f, reason: 'no LeetCode id (non-LeetCode exercise)' });
          continue;
        }
        const n = Number(m[2]);
        if (byNum.has(n)) items.push(n);
        else unresolvedAll.push({ sheet: 'striver-sde', ref: `${m[2]} ${f}`, reason: 'id not in repo dataset' });
      }
      if (items.length) sections.push({ name: cleanSectionName(dir.name), items });
    }
    return finalize(sections);
  },
});

// --- Striver A2Z ----------------------------------------------------------
// problems.json carries Striver's topic + subtopic but NO LeetCode numbers
// ("leetcode": "$undefined" in the sibling fixed file), so the only join
// available is title matching.
builders.push({
  id: 'striver-a2z',
  description: 'The step-by-step A2Z roadmap, from language basics to advanced patterns.',
  title: "Striver's A2Z DSA Sheet",
  sourceUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
  build() {
    const f = path.join(RAW, 'strivers-a2z-dsa-sheet-complete', 'problems.json');
    if (!fs.existsSync(f)) return null;
    const rows = JSON.parse(fs.readFileSync(f, 'utf8'));
    const byTitle = new Map();
    for (const p of repoLc) byTitle.set(norm(p.title), p.id);
    const sections = [];
    // `topic` is the real Striver step ("Binary Trees [Traversals...]").
    // `subtopic` is NOT a section - for 354 of the 474 rows it is just the
    // difficulty ("Easy" / "Medium" / "Hard"), which is why grouping by it
    // previously produced three meaningless sections instead of nineteen.
    for (const r of rows) {
      const name = String(r.topic || 'General').trim();
      const id = byTitle.get(norm(r.name));
      if (!id) {
        unresolvedAll.push({ sheet: 'striver-a2z', ref: r.name, reason: 'title did not match a LeetCode problem' });
        continue;
      }
      let sec = sections.find((s) => s.name === name);
      if (!sec) sections.push((sec = { name, items: [] }));
      sec.items.push(id);
    }
    return finalize(sections);
  },
});

// --- Fraz -----------------------------------------------------------------
// Sheet1: col A is either a topic header, an ALL-CAPS difficulty marker, or a
// problem URL. Editorial links live in col B and are ignored.
builders.push({
  id: 'fraz',
  title: 'Fraz DSA Sheet',
  description: 'Topic-wise DSA sheet with a linked editorial for every problem.',
  sourceUrl: 'https://www.youtube.com/c/LeadCodingbyFRAZ',
  build() {
    const rows = readXlsx('Leetcode DSA sheet by Fraz .xlsx');
    const sections = [];
    let topic = 'General';
    // Column A is overloaded: it holds the sheet's own promo banner, topic
    // headers ("Arrays", "RECURSION"), difficulty markers ("EASY", "MEDIUM /
    // HARD"), numbered commentary ("20- Rat in a Maze") and problem URLs.
    // Only the URLs are problems; everything else is structure to be skipped
    // or promoted to the current section.
    const DIFFICULTY = /^(easy|medium|hard)(\s*\/\s*(easy|medium|hard))?$/i;
    const NOTE = /^\d+\s*-/;
    const PROMO = /(youtube|youtu\.be|t\.me|telegram|DSA Sheet by)/i;
    for (const { cells } of rows) {
      const a = cells[0] ?? '';
      if (!a) continue;
      const slug = slugOf(a);
      if (slug) {
        const rec = bySlug.get(slug);
        if (!rec) {
          unresolvedAll.push({ sheet: 'fraz', ref: a, reason: 'slug not in repo dataset' });
          continue;
        }
        let sec = sections.find((s) => s.name === topic);
        if (!sec) sections.push((sec = { name: topic, items: [] }));
        sec.items.push(rec.id);
        continue;
      }
      if (DIFFICULTY.test(a) || NOTE.test(a) || PROMO.test(a)) continue;
      if (/^https?:/i.test(a)) {
        unresolvedAll.push({ sheet: 'fraz', ref: a, reason: 'non-LeetCode source' });
        continue;
      }
      topic = titleish(a);
    }
    return finalize(sections);
  },
});

// --- Arsh Goyal -----------------------------------------------------------
// Sheet1: a topic header is a row whose col A is empty and col B is short text.
// Rows below carry a difficulty in col A and a URL in col B. Some entries are
// GeeksforGeeks, which we can't track.
builders.push({
  id: 'arsh',
  title: 'Arsh Goyal DSA Sheet',
  description: 'A 45-60 day placement plan, with per-company tracking built in.',
  sourceUrl: 'https://www.youtube.com/c/arshgoyal',
  build() {
    const rows = readXlsx('DSA Sheet by Arsh (45-60 Days Plan).xlsx');
    const sections = [];
    let topic = 'General';
    for (const { cells } of rows) {
      const a = cells[0] ?? '';
      const b = cells[1] ?? '';
      if (!b) continue;
      const slug = slugOf(b);
      if (slug) {
        const rec = bySlug.get(slug);
        if (!rec) {
          unresolvedAll.push({ sheet: 'arsh', ref: b, reason: 'slug not in repo dataset' });
          continue;
        }
        let sec = sections.find((s) => s.name === topic);
        if (!sec) sections.push((sec = { name: topic, items: [] }));
        if (!sec.items.includes(rec.id)) sec.items.push(rec.id);
        continue;
      }
      if (/^https?:/i.test(b)) {
        unresolvedAll.push({ sheet: 'arsh', ref: b, reason: 'non-LeetCode source (GeeksforGeeks)' });
        continue;
      }
      // Topic header row.
      if (!a && b.length < 40) topic = titleish(b);
    }
    return finalize(sections);
  },
});

// --- Love Babbar 450 ------------------------------------------------------
// Column A repeats the topic, column B is a free-text problem description
// ("Reverse the array"), NOT a LeetCode title. There are no URLs in this file,
// so the only possible join is fuzzy title matching - which is why this sheet
// has by far the worst resolution rate.
builders.push({
  id: 'love-babbar-450',
  title: 'Love Babbar 450',
  description: 'The classic 450-question sheet, organised topic by topic.',
  sourceUrl: 'https://www.geeksforgeeks.org/dsa/dsa-sheet-by-love-babbar/',
  build() {
    const rows = readXlsx('Love Babbar 450.xlsx');
    const sections = [];
    for (const { cells } of rows) {
      const topic = titleish(cells[0] ?? '');
      const desc = cells[1] ?? '';
      if (!topic || !desc) continue;
      if (/^problem:?$/i.test(topic)) continue;
      const id = fuzzyMatch(desc);
      let sec = sections.find((s) => s.name === topic);
      if (!sec) sections.push((sec = { name: topic, items: [] }));
      if (id) {
        sec.items.push(id);
      } else {
        unresolvedAll.push({ sheet: 'love-babbar-450', ref: `${topic} / ${desc}`, reason: 'no reliable LeetCode match' });
      }
    }
    return finalize(sections);
  },
});

// --- Company-wise PYQs (the "Google / Company sheet") ----------------------
// One section per company, sorted by problem count. 470 companies, ~3,250
// problems. Company tags are the section itself rather than per-item metadata,
// which would be enormous (Two Sum alone is tagged with 118 companies).
builders.push({
  id: 'company-pyqs',
  title: 'Company-wise PYQs',
  description: 'Problems tagged by 435 companies, bucketed by how recently they were asked.',
  sourceUrl: 'https://github.com/ashishps1/awesome-leetcode-resources',
  build() {
    const sections = [...companyIds.entries()]
      .filter(([, ids]) => ids.size > 0)
      .map(([name, ids]) => ({ name, items: [...ids].sort((a, b) => a - b) }))
      .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name));
    return finalize(sections);
  },
});

// --- small text helpers ---------------------------------------------------

function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\b(leetcode|lc)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalise a parsed section list: dedupe ids within each section and drop
 * sections that ended up empty.
 *
 * Both are needed. Striver's SDE sheet legitimately lists the same LeetCode
 * problem more than once - #094 appears as both "Inorder Traversal" and "Morris
 * Inorder Traversal", and #207 is covered by four separate graph-cycle
 * exercises - and a sheet row keyed by problem number must not repeat. Empty
 * sections show up when every entry in a topic failed to resolve, which happens
 * a lot on the Love Babbar sheet.
 */
function finalize(sections) {
  return sections
    .map((s) => ({ ...s, items: [...new Set(s.items)] }))
    .filter((s) => s.items.length > 0 && s.name.trim());
}

/** Loose match for description-style text against real LeetCode titles. */
function fuzzyMatch(desc) {
  const target = norm(desc);
  if (target.split(' ').length < 2) return null;
  const words = new Set(target.split(' ').filter((w) => w.length > 3));
  if (words.size === 0) return null;
  let best = null;
  let bestScore = 0;
  for (const p of repoLc) {
    const t = norm(p.title);
    if (!t) continue;
    if (t === target) return p.id;
    const tw = new Set(t.split(' '));
    let hits = 0;
    for (const w of words) if (tw.has(w)) hits++;
    const score = hits / Math.max(words.size, tw.size);
    if (score > bestScore) {
      bestScore = score;
      best = p.id;
    }
  }
  return bestScore >= 0.75 ? best : null;
}

function pretty(kebab) {
  return kebab.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function titleish(s) {
  return String(s).replace(/\s+/g, ' ').trim();
}

function cleanSectionName(dir) {
  return dir.replace(/^\d+_/, '').replace(/_/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// 3. Build and write
// ---------------------------------------------------------------------------

fs.mkdirSync(OUT, { recursive: true });

/**
 * Write a JSON file. `pretty` is only used for the two small files a human
 * actually reads in a diff (index.json and unresolved.json) - the sheet files
 * and the problem index are machine-read and minifying them roughly halves the
 * payload, which matters for company-pyqs in particular.
 */
function write(file, data, pretty) {
  fs.writeFileSync(file, JSON.stringify(data, null, pretty ? 2 : 0) + '\n');
  return fs.statSync(file).size;
}

const index = [];
const allIds = new Set();
const allProblems = [];
let grandTotal = 0;

for (const b of builders) {
  const sections = b.build();
  if (!sections || sections.length === 0) {
    log(`  !! ${b.id}: no sections produced, skipping`);
    continue;
  }
  const count = sections.reduce((n, s) => n + s.items.length, 0);
  sections.forEach((s) => s.items.forEach((i) => allIds.add(i)));

  const doc = {
    id: b.id,
    title: b.title,
    description: b.description,
    sourceUrl: b.sourceUrl,
    lastVerified: VERIFIED,
    problemCount: count,
    sectionCount: sections.length,
    sections,
  };
  const bytes = write(path.join(OUT, `${b.id}.json`), doc, false);

  // Per-sheet metadata slice, loaded together with the sheet file.
  //
  // A single shared problems.json would be 276 KB on every sheets page, even
  // though Blind 75 only references 69 problems. Slicing per sheet means the
  // common sheets ship a couple of KB and only company-pyqs (which genuinely
  // references all 2,575) pays the full cost.
  const slice = {};
  for (const id of new Set(doc.sections.flatMap((s) => s.items))) {
    const p = byNum.get(id);
    if (!p) continue;
    const entry = {
      t: p.title,
      d: p.difficulty,
      s: p.slug,
      p: topicBackfill.get(p.slug)?.split(',')[0]?.trim() || '',
    };
    const companies = companiesByNumber.get(id);
    if (companies?.length) entry.co = companies;
    slice[id] = entry;
  }
  const sliceBytes = write(path.join(OUT, `problems-${b.id}.json`), slice, false);

  log(
    `  ${b.id.padEnd(18)} ${String(count).padStart(5)} refs  ${String(sections.length).padStart(3)} sections  sheet ${(bytes / 1024).toFixed(1).padStart(6)} KB  meta ${(sliceBytes / 1024).toFixed(1).padStart(6)} KB`,
  );

  index.push({
    id: b.id,
    title: b.title,
    description: b.description,
    sourceUrl: b.sourceUrl,
    problemCount: count,
    sectionCount: sections.length,
  });
  grandTotal += count;
  allProblems.push(...Object.values(slice));
}

// Catalog. Tiny (a few hundred bytes of JSON), so it is the one file loaded
// eagerly by the /sheets listing page.
write(path.join(OUT, 'index.json'), { lastVerified: VERIFIED, sheets: index }, true);

// Remove the previous global problems.json if one is lying around, so a stale
// 276 KB file can't be silently re-imported after this change.
const staleGlobal = path.join(OUT, 'problems.json');
if (fs.existsSync(staleGlobal)) {
  fs.unlinkSync(staleGlobal);
  log('  removed stale problems.json (superseded by problems-<sheet>.json)');
}

const withTopic = allProblems.filter((v) => v.p).length;

log('');
log(`wrote ${index.length} sheets (each as <id>.json + problems-<id>.json) -> ${path.relative(ROOT, OUT)}`);
log(`  total references: ${grandTotal}`);
log(`  unique problems:  ${allIds.size}`);
log(`  topics filled:    ${withTopic}/${allProblems.length}`);
log(`  unresolved refs:  ${unresolvedAll.length}`);

if (unresolvedAll.length) {
  write(path.join(OUT, 'unresolved.json'), { lastVerified: VERIFIED, entries: unresolvedAll }, true);
  const bySheet = {};
  for (const u of unresolvedAll) bySheet[u.sheet] = (bySheet[u.sheet] || 0) + 1;
  log('  by sheet: ' + JSON.stringify(bySheet));
  const byReason = {};
  for (const u of unresolvedAll) byReason[u.reason] = (byReason[u.reason] || 0) + 1;
  for (const [r, n] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) {
    log(`    ${String(n).padStart(5)}  ${r}`);
  }
}