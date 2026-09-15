'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';

export type SortOrder = 'asc' | 'desc';

type ToolbarProps = {
  search: string;
  onSearchChange: (v: string) => void;
  difficultyFilter: string[];
  onDifficultyChange: (v: string[]) => void;
  statusFilter: string[];
  onStatusChange: (v: string[]) => void;
  sort: string;
  onSortChange: (v: string) => void;
  sortOrder: SortOrder;
  onSortOrderToggle: () => void;
};

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];
const STATUSES = ['ACTIVE', 'MASTERED', 'RETIRED'];
const SORT_OPTIONS = [
  { value: 'dateAdded', label: 'Date Added' },
  { value: 'nextRevision', label: 'Next Revision' },
  { value: 'problemNumber', label: 'Problem Number' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'status', label: 'Status' },
  { value: 'topic', label: 'Topic' },
];

function DropdownMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          color: 'var(--muted-foreground)',
          cursor: 'pointer',
          fontSize: 13,
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            background: 'var(--popover)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '6px',
            zIndex: 50,
            minWidth: 160,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function CheckItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onChange}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 10px',
        cursor: 'pointer',
        borderRadius: 5,
        fontSize: 13,
        color: checked ? 'var(--foreground)' : hovered ? 'var(--foreground)' : 'var(--muted-foreground)',
        background: hovered ? 'var(--accent)' : 'transparent',
        transition: 'background 0.15s, color 0.15s',
        userSelect: 'none',
      }}
    >
      <CustomCheckbox checked={checked} onChange={onChange} size={15} />
      <span>{label.charAt(0) + label.slice(1).toLowerCase()}</span>
    </div>
  );
}

export function Toolbar({
  search, onSearchChange,
  difficultyFilter, onDifficultyChange,
  statusFilter, onStatusChange,
  sort, onSortChange,
  sortOrder, onSortOrderToggle,
}: ToolbarProps) {
  const toggleDifficulty = (d: string) => {
    onDifficultyChange(difficultyFilter.includes(d)
      ? difficultyFilter.filter((x) => x !== d)
      : [...difficultyFilter, d]);
  };
  const toggleStatus = (s: string) => {
    onStatusChange(statusFilter.includes(s)
      ? statusFilter.filter((x) => x !== s)
      : [...statusFilter, s]);
  };

  const [searchVal, setSearchVal] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (v: string) => {
    setSearchVal(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange(v), 150);
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const isSlash = e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA';
      if (isCmdK || isSlash) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeFilters = [
    ...difficultyFilter.map((d) => ({ label: d.charAt(0) + d.slice(1).toLowerCase(), remove: () => toggleDifficulty(d) })),
    ...statusFilter.map((s) => ({ label: s.charAt(0) + s.slice(1).toLowerCase(), remove: () => toggleStatus(s) })),
  ];

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort';

  return (
    <div data-toolbar>
      <div data-table-toolbar style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search */}
        <div data-search-container style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', pointerEvents: 'none' }}>
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            data-search-input
            ref={searchInputRef}
            value={searchVal}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search problems..."
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              borderRadius: 6,
              color: 'var(--foreground)',
              fontSize: 13,
              padding: '6px 28px 6px 32px',
              outline: 'none',
              width: 220,
            }}
          />
          {!searchVal && (
            <kbd data-search-shortcut-hint style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '1px 5px',
              fontSize: 10,
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-geist-mono), monospace',
              pointerEvents: 'none',
              lineHeight: 1.2,
            }}>
              /
            </kbd>
          )}
        </div>

        {/* Filter & Sort consolidated row container */}
        <div data-filter-sort-row style={{ display: 'contents' }}>
          {/* Filter dropdown */}
          <DropdownMenu label={difficultyFilter.length + statusFilter.length > 0 ? `Filters (${difficultyFilter.length + statusFilter.length})` : 'Filter'}>
            <div style={{ padding: '2px 4px 6px', fontSize: 10, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Difficulty</div>
            {DIFFICULTIES.map((d) => (
              <CheckItem key={d} label={d} checked={difficultyFilter.includes(d)} onChange={() => toggleDifficulty(d)} />
            ))}
            <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />
            <div style={{ padding: '2px 4px 6px', fontSize: 10, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</div>
            {STATUSES.map((s) => (
              <CheckItem key={s} label={s} checked={statusFilter.includes(s)} onChange={() => toggleStatus(s)} />
            ))}
          </DropdownMenu>

          {/* Sort dropdown */}
          <DropdownMenu label={`Sort: ${currentSortLabel}`}>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSortChange(opt.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  background: sort === opt.value ? 'var(--secondary)' : 'none',
                  border: 'none',
                  borderRadius: 4,
                  color: sort === opt.value ? 'var(--foreground)' : 'var(--muted-foreground)',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: '5px 8px',
                  textAlign: 'left',
                }}
              >
                {opt.label}
              </button>
            ))}
          </DropdownMenu>
        </div>

        {/* Arrow Flip Toggle Icon Button */}
        <button
          data-redundant-sort-icon-button
          onClick={onSortOrderToggle}
          title={sortOrder === 'asc' ? 'Ascending Order (click for Descending)' : 'Descending Order (click for Ascending)'}
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--muted-foreground)',
            cursor: 'pointer',
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
            padding: 0,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = 'var(--foreground)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--muted-foreground)';
          }}
        >
          <ArrowUpDown
            size={14}
            style={{
              transition: 'transform 0.2s ease',
              transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>
      </div>

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {activeFilters.map((f, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'var(--secondary)', border: '1px solid var(--border)',
              borderRadius: 4, fontSize: 12, color: 'var(--foreground)',
              padding: '2px 6px',
            }}>
              {f.label}
              <button
                onClick={f.remove}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: 0, fontSize: 12, lineHeight: 1, display: 'flex', alignItems: 'center' }}
              >×</button>
            </span>
          ))}
          <button
            onClick={() => { onDifficultyChange([]); onStatusChange([]); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: 12, padding: 0 }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
