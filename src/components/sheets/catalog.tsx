'use client';

// SheetsCatalog — the /sheets landing page.
//
// A grid of cards, one per curated sheet. Each card shows how much of that sheet
// the user has already added to their tracker, so the page doubles as a progress
// dashboard rather than just a link list.
//
// Styling follows the rest of the (app) section: inline styles referencing the
// --* CSS custom properties from globals.css, mono font for numbers, and the same
// breadcrumb header the dashboard uses.

import Link from 'next/link';
import useSWR from 'swr';
import { useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { SHEET_INDEX, type SheetSummary, type TrackedMap } from '@/lib/sheets';
import { fetcher } from '@/lib/fetcher';

export type { TrackedMap };

type ProgressAll = {
  bySheet: Record<string, number>;
};

export function SheetsCatalog() {
  const { data, isLoading } = useSWR<ProgressAll>('/api/sheets/progress-all', fetcher, {
    revalidateOnFocus: false,
  });

  const [query, setQuery] = useState('');
  const sheets = SHEET_INDEX.sheets;
  const q = query.trim().toLowerCase();

  const visible = q
    ? sheets.filter(
        (s) => s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
      )
    : sheets;

  const totalRefs = sheets.reduce((n, s) => n + s.problemCount, 0);

  return (
    <div
      data-sheets-container
      style={{ maxWidth: 1150, margin: '0 auto', paddingBottom: 48 }}
    >
      <div
        data-page-header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div
          data-breadcrumb
          style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 14 }}
        >
          <span style={{ color: 'var(--text-subtle)' }}>recall</span>
          <span style={{ color: 'var(--text-faint)', margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>Sheets</span>
        </div>
      </div>

      <div style={{ marginBottom: 22, marginTop: 8 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text-strong)',
            letterSpacing: '-0.02em',
            marginBottom: 6,
          }}
        >
          DSA Sheets
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, maxWidth: 620 }}>
          {sheets.length} curated lists &middot; {totalRefs.toLocaleString()} problem
          references. Add a whole sheet to your tracker and spaced repetition takes
          over from there.
        </p>
      </div>

      <div style={{ position: 'relative', marginBottom: 20 }}>
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
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sheets"
          aria-label="Search sheets"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '9px 12px 9px 32px',
            fontSize: 13,
            fontFamily: 'var(--font-geist-sans), sans-serif',
            color: 'var(--foreground)',
            background: 'var(--input-bg)',
            border: '1px solid var(--input-border)',
            borderRadius: 8,
            outline: 'none',
          }}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState text={`No sheets match "${query}".`} />
      ) : (
        <div
          data-sheets-grid
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}
        >
          {visible.map((sheet) => (
            <SheetCard
              key={sheet.id}
              sheet={sheet}
              added={isLoading ? null : (data?.bySheet[sheet.id] ?? 0)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SheetCard({
  sheet,
  added,
}: {
  sheet: SheetSummary;
  added: number | null;
}) {
  const pct =
    added === null || sheet.problemCount === 0
      ? null
      : (added / sheet.problemCount) * 100;

  return (
    <div data-sheet-card style={{ display: 'flex', flexDirection: 'column' }}>
      <Link
        href={`/sheets/${sheet.id}`}
        style={{
          display: 'block',
          textDecoration: 'none',
          color: 'inherit',
          background: 'var(--settings-card-bg)',
          border: '1px solid var(--settings-card-border)',
          borderRadius: 10,
          padding: 18,
          boxShadow: 'var(--shadow-modal)',
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
        <h2
          style={{
            fontSize: 14.5,
            fontWeight: 600,
            color: 'var(--text-strong)',
            margin: '0 0 3px',
            letterSpacing: '-0.01em',
          }}
        >
          {sheet.title}
        </h2>
        <p
          style={{
            fontSize: 12,
            lineHeight: 1.45,
            color: 'var(--text-muted)',
            margin: '0 0 12px',
            minHeight: 34,
          }}
        >
          {sheet.description}
        </p>

        <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
          <Stat label="problems" value={sheet.problemCount.toLocaleString()} />
          <Stat label="sections" value={String(sheet.sectionCount)} />
          <Stat
            label="added"
            value={added === null ? '—' : added.toLocaleString()}
            accent={added !== null && added > 0}
          />
        </div>

        <ProgressBar pct={pct} />
      </Link>

      <a
        href={sheet.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          marginTop: 8,
          fontSize: 11.5,
          color: 'var(--text-subtle)',
          textDecoration: 'none',
          alignSelf: 'flex-start',
        }}
      >
        Official source <ExternalLink size={11} />
      </a>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'var(--font-geist-mono), monospace',
          color: accent ? '#ff6b00' : 'var(--text-strong)',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10.5,
          color: 'var(--text-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ProgressBar({ pct }: { pct: number | null }) {
  return (
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
          width: pct === null ? '0%' : `${Math.min(100, Math.max(0, pct))}%`,
          height: '100%',
          background: '#ff6b00',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        border: '1px dashed var(--border)',
        borderRadius: 10,
        color: 'var(--text-subtle)',
        fontSize: 13,
      }}
    >
      {text}
    </div>
  );
}
