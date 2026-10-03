'use client';

// SheetDetail — the /sheets/[slug] view.
//
// Renders one curated sheet as collapsible topic sections in the style of the
// original Striver sheet. Problems already in the user's tracker show the same
// state the dashboard does — lifecycle status, bookmark, ladder position — and
// can be updated in place: star/unstar, change status, or remove.
//
// WHY THE PROBLEM LIST ARRIVES AS PROPS RATHER THAN BEING FETCHED HERE
// The sheet's contents are static, identical for every user, and already
// bundled. Fetching them from an API would mean shipping the same bytes twice.
// The page component loads the sheet on the server and passes the resolved rows
// down, so the first paint needs no client-side waterfall. Only the per-user
// slice is fetched, via SWR.
//
// WHY THERE IS ONE MENU, NOT ONE PER ROW
// company-pyqs can render 2,575 rows. Mounting a menu per row would be absurd,
// so a single menu is rendered at the document level via TopLevelPortal and
// driven by whichever row opened it.

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Bookmark,
  ChevronDown,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  countByDifficulty,
  matchesQuery,
  type LoadedSheet,
  type SheetSectionResolved,
  type TrackedInfo,
  type TrackedMap,
} from '@/lib/sheets';
import { getDifficultyStyle, TopLevelPortal } from '@/components/problems-table/columns';
import { PlatformLogo } from '@/lib/platforms/logos';
import { fetcher } from '@/lib/fetcher';

// The brand accent. Hardcoded rather than taken from a token because
// --new-row-submit-bg is a neutral surface colour (light grey in light mode),
// not the orange — the dashboard hardcodes #ff6b00 the same way.
const ACCENT = '#ff6b00';

// ---------------------------------------------------------------------------
// Render budget
//
// company-pyqs references 13,038 problems across 435 sections. Rendering all of
// them up front made the page unusable — 13,000 DOM nodes, and 13 MB of
// prerendered HTML, for one route.
//
// Three bounds keep it responsive without capping what the user can reach:
//
//   * A sheet with more than MANY_SECTIONS sections is a browse list, not a
//     reading list, so it starts fully collapsed — only the 435 company headers
//     render. The topic-based sheets are unaffected (Fraz has 20 sections).
//   * Sections larger than COLLAPSE_THRESHOLD start closed. Only Striver A2Z's
//     catch-all "General" section trips this on the topic sheets.
//   * An expanded section renders PAGE_SIZE rows at a time, with a button to
//     reveal the rest, so opening a 2,000-problem company stays fast.
//
// Nothing is removed — every problem stays one click away.
// ---------------------------------------------------------------------------

const MANY_SECTIONS = 60;
const COLLAPSE_THRESHOLD = 50;
const PAGE_SIZE = 100;

const STATUSES = ['ACTIVE', 'MASTERED', 'RETIRED'] as const;
type Status = (typeof STATUSES)[number];

/**
 * Plain-English labels for the lifecycle states.
 *
 * The dashboard groups rows under Active / Mastered / Retired headings, but a
 * single pill in a dense list has no room for that vocabulary, so the enum
 * names are spelled out. Untracked problems are labelled too — a row the user
 * has not added yet is meaningfully "not done", and leaving the space blank
 * made the list harder to scan than the dashboard.
 */
const STATUS_LABEL: Record<Status, string> = {
  ACTIVE: 'Needs revision',
  MASTERED: 'Completed',
  RETIRED: 'Retired',
};

function statusStyle(status: Status) {
  switch (status) {
    case 'MASTERED':
      return {
        bg: 'var(--success-bg)',
        text: 'var(--success)',
        border: 'var(--success-border)',
      };
    case 'RETIRED':
      return {
        bg: 'var(--muted)',
        text: 'var(--text-subtle)',
        border: 'var(--border)',
      };
    default:
      return {
        bg: 'var(--secondary)',
        text: 'var(--text-normal)',
        border: 'var(--border)',
      };
  }
}

export function SheetDetail({
  sheet,
  sections,
}: {
  sheet: LoadedSheet;
  sections: SheetSectionResolved[];
}) {
  const { data, mutate, isLoading } = useSWR<{ tracked: TrackedMap }>(
    `/api/sheets/${sheet.id}/progress`,
    fetcher,
    { revalidateOnFocus: false },
  );

  // Memoised because `data?.tracked ?? {}` allocates a fresh object on every
  // render while the request is in flight, which would invalidate every
  // useMemo/useCallback below.
  const tracked: TrackedMap = useMemo(() => data?.tracked ?? {}, [data]);

  const [query, setQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState<string | null>(null);
  const [hideAdded, setHideAdded] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // Drill-down for browse-list sheets (company-pyqs): null shows the company
  // blocks grid, a name shows that company's problems.
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  // Rows rendered per section, nested under the current filter combination.
  // Keying by filter means a stale count can never apply: changing a filter
  // simply selects a different (empty) bucket, so there is no effect to reset.
  const [pages, setPages] = useState<Record<string, Record<string, number>>>({});
  const [pending, setPending] = useState<number | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  // Only bulk results and failures surface here. A single add is already
  // unambiguous — the row's status pill flips from "Not done" to "Needs
  // revision" — so it does not need a confirmation banner.
  const [message, setMessage] = useState<string | null>(null);

  // Which row's action menu is open, and the button to anchor it to.
  const [menu, setMenu] = useState<{ lcNumber: number; info: TrackedInfo } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const totals = useMemo(
    () => countByDifficulty(sections.flatMap((s) => s.problems)),
    [sections],
  );
  const totalRefs = sections.reduce((n, s) => n + s.problems.length, 0);
  const addedCount = useMemo(
    () => sections.flatMap((s) => s.problems).filter((p) => tracked[String(p.id)]).length,
    [sections, tracked],
  );

  const filtered = useMemo(() => {
    return sections
      .map((s) => ({
        ...s,
        problems: s.problems.filter(
          (p) =>
            matchesQuery(p, query) &&
            (!diffFilter || p.difficulty === diffFilter) &&
            (!hideAdded || !tracked[String(p.id)]),
        ),
      }))
      .filter((s) => s.problems.length > 0);
  }, [sections, query, diffFilter, hideAdded, tracked]);

  // A sheet with hundreds of sections is an index to browse, not an article to
  // read, so it renders as a grid of clickable blocks instead of collapsible
  // rows. Selecting a block drills into that section's problems.
  const browseList = sections.length > MANY_SECTIONS;
  const gridMode = browseList && selectedCompany === null;
  const listSections = browseList
    ? filtered.filter((s) => s.name === selectedCompany)
    : filtered;
  const listEmpty = gridMode ? filtered.length === 0 : listSections.length === 0;

  // A section is open unless it is big enough to warrant starting closed.
  // Browse sheets never reach this with more than one visible section: the grid
  // handles navigation, and a drilled-in company starts open (paginated).
  const isOpen = useCallback(
    (name: string, count: number) =>
      expanded[name] ?? (browseList || count <= COLLAPSE_THRESHOLD),
    [expanded, browseList],
  );

  const filterKey = `${query}|${diffFilter}|${hideAdded}`;
  const pageBySection = pages[filterKey] ?? {};

  const showMore = useCallback(
    (name: string) => {
      setPages((prev) => {
        const bucket = prev[filterKey] ?? {};
        return {
          ...prev,
          [filterKey]: { ...bucket, [name]: (bucket[name] ?? PAGE_SIZE) + PAGE_SIZE },
        };
      });
    },
    [filterKey],
  );

  const addProblems = useCallback(
    async (ids: number[]) => {
      const res = await fetch(`/api/sheets/${sheet.id}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemNumbers: ids }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to add problems');
      await mutate();
      return json as { added: number; skipped: number; total: number };
    },
    [sheet.id, mutate],
  );

  const handleAddOne = useCallback(
    async (id: number) => {
      setPending(id);
      try {
        await addProblems([id]);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'Could not add that problem');
      } finally {
        setPending(null);
      }
    },
    [addProblems],
  );

  const handleAddAll = useCallback(async () => {
    const missing = filtered
      .flatMap((s) => s.problems)
      .map((p) => p.id)
      .filter((id) => !tracked[String(id)]);

    if (missing.length === 0) {
      setMessage('Everything visible is already in your tracker.');
      return;
    }
    setBulkBusy(true);
    setMessage(null);
    try {
      // The endpoint caps a single call at MAX_ADD_PER_REQUEST, so long lists
      // go out in chunks rather than failing outright.
      let added = 0;
      let skipped = 0;
      for (let i = 0; i < missing.length; i += 500) {
        const r = await addProblems(missing.slice(i, i + 500));
        added += r.added;
        skipped += r.skipped;
      }
      setMessage(
        `Added ${added} problem${added === 1 ? '' : 's'}` +
          (skipped ? `, skipped ${skipped} already tracked.` : '.'),
      );
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'Bulk add failed');
      } finally {
        setBulkBusy(false);
      }
  }, [filtered, tracked, addProblems]);

  /** PATCH the underlying Problem row and reflect the change in the SWR cache. */
  const patchTracked = useCallback(
    async (
      lcNumber: number,
      info: TrackedInfo,
      body: Record<string, unknown>,
    ) => {
      // Optimistic: mirror what problems-table does for its star toggle.
      await mutate(
        (prev) =>
          prev
            ? {
                tracked: {
                  ...prev.tracked,
                  [String(lcNumber)]: { ...info, ...body },
                },
              }
            : prev,
        { revalidate: false },
      );
      try {
        const res = await fetch(`/api/problems/${info.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Update failed');
        await mutate();
      } catch {
        await mutate();
        setMessage('Could not update that problem.');
      }
    },
    [mutate],
  );

  const handleStar = useCallback(
    (lcNumber: number, info: TrackedInfo) =>
      patchTracked(lcNumber, info, { isFavorite: !info.isFavorite }),
    [patchTracked],
  );

  const handleStatus = useCallback(
    (lcNumber: number, info: TrackedInfo, status: Status) => {
      setMenu(null);
      if (info.status === status) return;
      void patchTracked(lcNumber, info, { status });
    },
    [patchTracked],
  );

  const handleRemove = useCallback(
    async (lcNumber: number, info: TrackedInfo) => {
      setMenu(null);
      await mutate(
        (prev) => {
          if (!prev) return prev;
          const next = { ...prev.tracked };
          delete next[String(lcNumber)];
          return { tracked: next };
        },
        { revalidate: false },
      );
      try {
        const res = await fetch(`/api/problems/${info.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
        await mutate();
        setMessage('Removed from your tracker.');
      } catch {
        await mutate();
        setMessage('Could not remove that problem.');
      }
    },
    [mutate],
  );

  /**
   * Sequential position of each problem within the sheet, so rows are numbered
   * 1, 2, 3... the way a printed sheet is. Computed once from the full,
   * unfiltered section list so numbers stay stable while searching and
   * filtering — renumbering on every keystroke would be disorienting.
   */
  const positionById = useMemo(() => {
    const map = new Map<number, number>();
    let n = 0;
    for (const s of sections) {
      for (const p of s.problems) {
        if (!map.has(p.id)) map.set(p.id, ++n);
      }
    }
    return map;
  }, [sections]);

  return (
    <div
      data-sheet-detail
      style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 48 }}
    >
      <div
        data-page-header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          gap: 12,
        }}
      >
        <div
          data-breadcrumb
          style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 14 }}
        >
          <Link href="/sheets" style={{ color: 'var(--text-subtle)', textDecoration: 'none' }}>
            recall
          </Link>
          <span style={{ color: 'var(--text-faint)', margin: '0 8px' }}>/</span>
          <Link href="/sheets" style={{ color: 'var(--text-subtle)', textDecoration: 'none' }}>
            Sheets
          </Link>
          <span style={{ color: 'var(--text-faint)', margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>
            {sheet.title}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--text-strong)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              {sheet.title}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '5px 0 0' }}>
              {sheet.description}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddAll}
            disabled={bulkBusy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 13px',
              fontSize: 12.5,
              fontWeight: 500,
              cursor: bulkBusy ? 'default' : 'pointer',
              background: bulkBusy ? 'var(--border)' : ACCENT,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              opacity: bulkBusy ? 0.7 : 1,
              transition: 'background 0.15s',
            }}
          >
            {bulkBusy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Add visible to tracker
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginTop: 10,
            flexWrap: 'wrap',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
            {addedCount}/{totalRefs} added
          </span>
          <DifficultyTally label="Easy" n={totals.EASY} difficulty="EASY" />
          <DifficultyTally label="Medium" n={totals.MEDIUM} difficulty="MEDIUM" />
          <DifficultyTally label="Hard" n={totals.HARD} difficulty="HARD" />
          <a
            href={sheet.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--text-subtle)',
              textDecoration: 'none',
            }}
          >
            Official source <ExternalLink size={11} />
          </a>
        </div>
      </div>

      <Toolbar
        query={query}
        onQuery={setQuery}
        diffFilter={diffFilter}
        onDiffFilter={setDiffFilter}
        hideAdded={hideAdded}
        onHideAdded={setHideAdded}
      />

      {message && (
        <div
          role="status"
          style={{
            marginBottom: 12,
            padding: '8px 12px',
            fontSize: 12,
            borderRadius: 6,
            color: 'var(--text-normal)',
            background: 'var(--secondary)',
            border: '1px solid var(--border)',
          }}
        >
          {message}
        </div>
      )}

      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-subtle)', padding: '10px 0' }}>
          <Loader2 size={13} className="animate-spin" />
          Loading your progress…
        </div>
      )}

      {listEmpty ? (
        <div
          style={{
            padding: '40px 24px',
            textAlign: 'center',
            border: '1px dashed var(--border)',
            borderRadius: 10,
            color: 'var(--text-subtle)',
            fontSize: 13,
          }}
        >
          No problems match the current filters.
          {browseList && selectedCompany !== null && (
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                }}
              >
                &lsaquo; Back to all companies
              </button>
            </div>
          )}
        </div>
      ) : gridMode ? (
        <div
          data-company-grid
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {filtered.map((section) => {
            const count = section.problems.filter((p) => tracked[String(p.id)]).length;
            return (
              <CompanyCard
                key={section.name}
                name={section.name}
                total={section.problems.length}
                added={count}
                onOpen={() => setSelectedCompany(section.name)}
              />
            );
          })}
        </div>
      ) : (
        <>
          {browseList && selectedCompany !== null && (
            <button
              type="button"
              onClick={() => setSelectedCompany(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 12,
                padding: '6px 12px',
                fontSize: 12,
                cursor: 'pointer',
                borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
              }}
            >
              &lsaquo; All {sections.length} companies
            </button>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {listSections.map((section) => {
            const open = isOpen(section.name, section.problems.length);
            const shown = open
              ? section.problems.slice(0, pageBySection[section.name] ?? PAGE_SIZE)
              : [];
            const hiddenCount = section.problems.length - shown.length;
            const sectionAdded = section.problems.filter((p) => tracked[String(p.id)])
              .length;

            return (
              <div
                key={section.name}
                data-sheet-section
                style={{
                  border: '1px solid var(--table-border)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'var(--card)',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((c) => ({ ...c, [section.name]: !open }))
                  }
                  aria-expanded={open}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '11px 14px',
                    background: 'var(--table-group-bg)',
                    border: 'none',
                    borderBottom: open
                      ? '1px solid var(--table-border)'
                      : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text-strong)',
                  }}
                >
                  <ChevronDown
                    size={14}
                    style={{
                      color: 'var(--text-subtle)',
                      transform: open ? 'none' : 'rotate(-90deg)',
                      transition: 'transform 0.15s',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>
                    {section.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-geist-mono), monospace',
                      color: 'var(--text-faint)',
                    }}
                  >
                    {sectionAdded}/{section.problems.length}
                  </span>
                </button>

                {open && (
                  <div>
                    {shown.map((p, rowIdx) => {
                      const info = tracked[String(p.id)];
                      return (
                        <ProblemRow
                          key={p.id}
                          // In a drill-down the list is one company, so rows are
                          // numbered within it. The prefix slice always starts
                          // at 0, so rowIdx + 1 stays stable as more load.
                          position={
                            browseList ? rowIdx + 1 : (positionById.get(p.id) ?? 0)
                          }
                          problem={p}
                          info={info}
                          pending={pending === p.id}
                          onAdd={() => handleAddOne(p.id)}
                          onStar={() => info && handleStar(p.id, info)}
                          onOpenMenu={(el) => {
                            triggerRef.current = el;
                            setMenu({ lcNumber: p.id, info: info! });
                          }}
                        />
                      );
                    })}

                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={() => showMore(section.name)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          fontSize: 12,
                          fontFamily: 'var(--font-geist-sans), sans-serif',
                          color: 'var(--text-muted)',
                          background: 'transparent',
                          border: 'none',
                          borderTop: '1px solid var(--table-border)',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--foreground)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                      >
                        Show {Math.min(hiddenCount, PAGE_SIZE).toLocaleString()} more
                        <span style={{ color: 'var(--text-faint)' }}>
                          {' '}
                          &middot; {hiddenCount.toLocaleString()} hidden
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </>
      )}

      {menu && (
        <TopLevelPortal
          anchorRef={triggerRef}
          onClose={() => setMenu(null)}
          width={186}
          minHeight={0}
        >
          <div style={{ padding: 4 }}>
            {STATUSES.map((s) => (
              <MenuItem
                key={s}
                onClick={() => handleStatus(menu.lcNumber, menu.info, s)}
                active={menu.info.status === s}
              >
                <StatusDot status={s} />
                {STATUS_LABEL[s]}
              </MenuItem>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <MenuItem onClick={() => handleRemove(menu.lcNumber, menu.info)} danger>
              <Trash2 size={13} />
              Remove from tracker
            </MenuItem>
          </div>
        </TopLevelPortal>
      )}
    </div>
  );
}
/**
 * One clickable company block on the browse grid.
 *
 * Same card vocabulary as the /sheets catalog (background, border, radius,
 * shadow, mono numerals) so the two grids read as one surface: name, counts,
 * and a thin progress bar.
 */
function CompanyCard({
  name,
  total,
  added,
  onOpen,
}: {
  name: string;
  total: number;
  added: number;
  onOpen: () => void;
}) {
  const pct = total === 0 ? 0 : (added / total) * 100;
  return (
    <button
      type="button"
      data-company-card
      onClick={onOpen}
      aria-label={`Open ${name} problems`}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        background: 'var(--settings-card-bg)',
        border: '1px solid var(--settings-card-border)',
        borderRadius: 10,
        padding: 16,
        boxShadow: 'var(--shadow-modal)',
        color: 'inherit',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--input-focus-border)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--settings-card-border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-strong)',
          letterSpacing: '-0.01em',
          marginBottom: 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </div>
      <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'var(--font-geist-mono), monospace',
              color: 'var(--text-strong)',
            }}
          >
            {total.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            problems
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'var(--font-geist-mono), monospace',
              color: added > 0 ? '#ff6b00' : 'var(--text-strong)',
            }}
          >
            {added.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            added
          </div>
        </div>
      </div>
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: 'var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
            height: '100%',
            background: '#ff6b00',
          }}
        />
      </div>
    </button>
  );
}

function StatusDot({ status }: { status: Status }) {
  const s = statusStyle(status);
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: s.text,
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}

function MenuItem({
  children,
  onClick,
  active,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 9px',
        fontSize: 12.5,
        fontFamily: 'var(--font-geist-sans), sans-serif',
        textAlign: 'left',
        cursor: 'pointer',
        borderRadius: 5,
        border: 'none',
        background: 'transparent',
        color: danger ? 'var(--error)' : 'var(--text-normal)',
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--dropdown-item-hover-bg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

function DifficultyTally({
  label,
  n,
  difficulty,
}: {
  label: string;
  n: number;
  difficulty: string;
}) {
  const s = getDifficultyStyle(difficulty);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: s.text,
          display: 'inline-block',
        }}
      />
      <span style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>{n}</span>
      <span style={{ color: 'var(--text-faint)' }}>{label}</span>
    </span>
  );
}

function Toolbar({
  query,
  onQuery,
  diffFilter,
  onDiffFilter,
  hideAdded,
  onHideAdded,
}: {
  query: string;
  onQuery: (v: string) => void;
  diffFilter: string | null;
  onDiffFilter: (v: string | null) => void;
  hideAdded: boolean;
  onHideAdded: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        marginBottom: 14,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: 11,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-faint)',
            pointerEvents: 'none',
          }}
        />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by title or topic"
          aria-label="Search problems in this sheet"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '8px 12px 8px 32px',
            fontSize: 12.5,
            fontFamily: 'var(--font-geist-sans), sans-serif',
            color: 'var(--foreground)',
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: 7,
            outline: 'none',
          }}
        />
      </div>

      {(['EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onDiffFilter(diffFilter === d ? null : d)}
          aria-pressed={diffFilter === d}
          style={{
            padding: '6px 11px',
            fontSize: 11.5,
            fontWeight: diffFilter === d ? 600 : 400,
            cursor: 'pointer',
            borderRadius: 6,
            ...(diffFilter === d
              ? { background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }
              : { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }),
          }}
        >
          {d[0] + d.slice(1).toLowerCase()}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onHideAdded(!hideAdded)}
        aria-pressed={hideAdded}
        style={{
          padding: '6px 11px',
          fontSize: 11.5,
          fontWeight: hideAdded ? 600 : 400,
          cursor: 'pointer',
          borderRadius: 6,
          background: hideAdded ? 'var(--secondary)' : 'transparent',
          border: '1px solid var(--border)',
          color: hideAdded ? 'var(--foreground)' : 'var(--text-muted)',
        }}
      >
        Hide added
      </button>
    </div>
  );
}

function ProblemRow({
  position,
  problem,
  info,
  pending,
  onAdd,
  onStar,
  onOpenMenu,
}: {
  /** Sequential 1-based index within the sheet — what the row is numbered by. */
  position: number;
  problem: {
    id: number;
    title: string;
    difficulty: string;
    topic: string;
    url: string;
    companies: string[];
  };
  info: TrackedInfo | undefined;
  pending: boolean;
  onAdd: () => void;
  onStar: () => void;
  onOpenMenu: (el: HTMLButtonElement) => void;
}) {
  const diff = getDifficultyStyle(problem.difficulty);
  const status = statusStyle(info ? info.status : 'ACTIVE');

  return (
    <div
      data-sheet-row
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 14px',
        borderTop: '1px solid var(--table-border)',
      }}
    >
      {/* 1. Position within the sheet. */}
      <span
        style={{
          fontSize: 11,
          fontFamily: 'var(--font-geist-mono), monospace',
          color: 'var(--text-faint)',
          minWidth: 20,
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {position}
      </span>

      {/* 2. Difficulty. Sits early and never wraps, so a column of rows scans
          as an easy -> hard gradient down the left edge. */}
      <span
        data-sheet-difficulty
        title={problem.difficulty}
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
          padding: '2px 7px',
          borderRadius: 4,
          border: `1px solid ${diff.border}`,
          background: diff.bg,
          color: diff.text,
          flexShrink: 0,
          minWidth: 54,
          textAlign: 'center',
        }}
      >
        {problem.difficulty}
      </span>

      {/* 3. The LeetCode logo, linking straight to the problem. */}
      <a
        href={problem.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${problem.title} on LeetCode`}
        title={problem.url}
        style={{ display: 'inline-flex', flexShrink: 0, lineHeight: 0 }}
      >
        <PlatformLogo platform="LEETCODE" size={18} />
      </a>

      {/* 4. Title with its real LeetCode number. */}
      <span
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'baseline',
          gap: 7,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: info?.status === 'RETIRED' ? 'var(--text-faint)' : 'var(--text-normal)',
            textDecoration: info?.status === 'RETIRED' ? 'line-through' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {problem.title}
        </span>
        <span
          style={{
            fontSize: 10.5,
            fontFamily: 'var(--font-geist-mono), monospace',
            color: 'var(--text-faint)',
            flexShrink: 0,
          }}
        >
          #{problem.id}
        </span>
        {problem.companies.length > 0 && (
          <span
            className="sheet-row-companies"
            title={`Asked by: ${problem.companies.join(', ')}`}
            style={{
              fontSize: 10.5,
              color: 'var(--text-faint)',
              flexShrink: 0,
              display: 'none',
              maxWidth: 190,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {problem.companies.join(' · ')}
          </span>
        )}
      </span>

      {/* 5. Lifecycle status — appears once the problem is tracked. A row the
          user has not added has no status to show, so the pill is omitted
          entirely rather than showing a placeholder. */}
      {info ? (
        <button
          type="button"
          onClick={(e) => onOpenMenu(e.currentTarget)}
          aria-label={`Change status for ${problem.title}`}
          aria-haspopup="menu"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontFamily: 'var(--font-geist-mono), monospace',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: status.text,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            padding: 0,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: status.text,
              flexShrink: 0,
            }}
          />
          {STATUS_LABEL[info.status]}
          <ChevronDown size={11} />
        </button>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          disabled={pending}
          aria-label={`Add ${problem.title} to tracker`}
          title="Add to tracker"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 28,
            height: 26,
            padding: 0,
            cursor: pending ? 'default' : 'pointer',
            borderRadius: 5,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-subtle)',
            opacity: pending ? 0.7 : 1,
            flexShrink: 0,
          }}
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={14} />}
        </button>
      )}

      {/* 6. Bookmark — the same glyph the dashboard uses for its star column. */}
      <button
        type="button"
        onClick={onStar}
        disabled={!info}
        aria-label={info?.isFavorite ? 'Remove bookmark' : 'Bookmark'}
        aria-pressed={Boolean(info?.isFavorite)}
        title={info?.isFavorite ? 'Remove bookmark' : 'Bookmark'}
        style={{
          display: 'inline-flex',
          padding: 2,
          border: 'none',
          background: 'transparent',
          cursor: info ? 'pointer' : 'default',
          opacity: info ? 1 : 0.25,
          color: info?.isFavorite ? ACCENT : 'var(--star-icon-color)',
          flexShrink: 0,
        }}
      >
        <Bookmark size={14} fill={info?.isFavorite ? ACCENT : 'none'} />
      </button>
    </div>
  );
}
