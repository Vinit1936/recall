# Curated DSA sheet data

Generated output — do not edit by hand. Re-run the generator instead:

```bash
node scripts/generate-sheets-json.mjs
```

It reads the raw third-party dumps in `../../sheets/` (gitignored, ~19 MB) and writes
the files below. Those raw sources are re-downloadable, so nothing here depends on
them staying present — only the generator does.

## Files

Each sheet ships as a **pair**: the structure, and the metadata for exactly the
problems that sheet references.

| File | Size | Purpose |
|---|---|---|
| `index.json` | 1.4 KB | Catalog of every sheet. The only eagerly-loaded file. |
| `arsh.json` / `problems-arsh.json` | 1.5 + 18.9 KB | Arsh Goyal — 206 refs, 16 sections |
| `blind-75.json` / `problems-blind-75.json` | 0.7 + 6.2 KB | Blind 75 — 69 refs, 10 sections |
| `company-pyqs.json` / `problems-company-pyqs.json` | 65 + 276 KB | 435 companies — 13,038 refs |
| `fraz.json` / `problems-fraz.json` | 2.0 + 28.5 KB | Fraz — 314 refs, 20 sections |
| `love-babbar-450.json` / `problems-love-babbar-450.json` | 0.6 + 2.7 KB | Love Babbar 450 — 29 refs (see caveats) |
| `striver-a2z.json` / `problems-striver-a2z.json` | 1.2 + 10.9 KB | Striver A2Z — 120 refs, 9 sections |
| `striver-sde.json` / `problems-striver-sde.json` | 1.6 + 11.2 KB | Striver SDE — 124 refs, 26 sections |
| `unresolved.json` | 144 KB | Source entries that could not be mapped, with a reason. Never imported by the app. |

Sheet files and metadata slices are minified because they are machine-read;
`index.json` and `unresolved.json` are pretty-printed because a human reads them
in a diff.

## Shapes

A sheet file stores **only LeetCode problem numbers**:

```jsonc
{
  "id": "fraz",
  "title": "Fraz DSA Sheet",
  "sourceUrl": "https://www.youtube.com/c/LeadCodingbyFRAZ",
  "lastVerified": "2026-10-02",
  "problemCount": 314,
  "sectionCount": 20,
  "sections": [{ "name": "Arrays", "items": [1, 121, 66, 283] }]
}
```

`problems-<sheet>.json` holds the metadata for those numbers. Fields are single
letters to keep the file small, and the URL is rebuilt from the slug rather than
stored (the slug is ~20 chars, a full URL ~45):

```jsonc
{ "1": { "t": "Two Sum", "d": "EASY", "s": "two-sum", "p": "Array" } }
//  t = title   d = difficulty   s = slug   p = primary topic
//  url = `https://leetcode.com/problems/${s}/`
```

## Why numbers-only, and why the metadata is sliced

Problems repeat heavily across sheets — Two Sum alone is in six of them — so
storing metadata per sheet reference would duplicate it thousands of times across
13,900 references. Numbers-only keeps the sheet payload at ~74 KB instead of
~370 KB.

The metadata is sliced **per sheet** rather than shared because a single global
index would be 276 KB on every sheets page: Blind 75 references 69 problems and
would otherwise ship all 2,575 to render them. Sliced, Blind 75 costs ~7 KB and
only company-pyqs — which genuinely references every problem — pays the full
price.

## Topics are backfilled, and why

Every record in `src/data/leetcode-problems.json` ships `topic: "General"`, which
makes the app's topic filter and its 12 `--topic-N-*` colour tokens inert. The
per-company CSVs in the raw dump carry real LeetCode topic lists, so the generator
lifts the primary topic from there. Only the first topic is kept — one is what
filtering needs, and the full list costs 70 KB more for no functional gain.

37 of the 2,575 problems still have no topic. These are LeetCode's
JavaScript/Java one-liner problems (2618–2626), which genuinely have no topic
assigned upstream.

## Adding a sheet

1. Add a `builders.push({...})` entry to `scripts/generate-sheets-json.mjs`.
2. Add one entry to `SHEET_LOADERS` in `src/lib/sheets.ts`.
3. Re-run the generator. `npm test` fails if the two lists disagree, if any
   problem number does not resolve, or if the sheet ends up suspiciously small.

## Caveats — read before trusting this data

`unresolved.json` lists 936 source entries that could not be mapped. These are
gaps in the upstream sources, not generator bugs:

- **love-babbar-450 resolved only 29 of 445 entries.** The sheet stores free-text
  descriptions ("Reverse the array", "Kadane's Algo [V.V.V.V.V IMP]"), not
  LeetCode titles, and contains no URLs at all. Several entries have no LeetCode
  equivalent ("Count Inversion", "cyclically rotate an array"). This sheet needs a
  hand-written mapping before it is fit to show.
- **striver-a2z resolved 120 of 474.** Striver's JSON carries no LeetCode numbers
  (`"leetcode": "$undefined"`), so the only join available is title matching, and
  many entries are non-LeetCode exercises or renamed variants.
- **91 Arsh + 62 Striver SDE + 6 Blind 75 entries are not LeetCode problems**
  (GeeksforGeeks, Coding Ninjas, InterviewBit) or are premium-only problems that
  `src/data/leetcode-problems.json` omits by design — it filters out `paidOnly`,
  which is 710 gaps in the 1..3510 id range.
- **NeetCode 150 and Striver 75 are absent.** Neither was present in the raw dump.

Slugs were spot-checked against LeetCode's live GraphQL API (32 samples spanning
the full id range): problem id, title, difficulty and slug all matched exactly.

Two upstream repos were checked and deliberately **not** used as sources: a
"Striver SDE" sheet with 191 entries of which 63 are non-LeetCode, and a
"booleanstack" master CSV claiming 1,552 problems whose `leetcode.com` URLs are
only 375 genuine (the rest point at Coding Ninjas-style slugs such as
`aggressive-cows`).
