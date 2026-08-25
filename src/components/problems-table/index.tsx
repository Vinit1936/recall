'use client';

import useSWR from 'swr';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TabBar, type TabKey } from './tab-bar';
import { Toolbar, type SortOrder } from './toolbar';
import { ProblemRow } from './row';
import { NewRow } from './new-row';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';
import { Star, MoreVertical, Trash2, Download, Bookmark } from 'lucide-react';
import { getTopicColor } from '@/lib/topic-colors';
import { useMediaQuery } from '@/hooks/use-media-query';

import { fetcher } from '@/lib/fetcher';

function ColumnHeaderMenu({ col, onDelete }: { col: any; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {col.name}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        style={{
          background: open ? 'rgba(255, 255, 255, 0.08)' : 'none',
          border: 'none',
          color: open ? '#ffffff' : hovered ? '#888' : 'transparent',
          cursor: 'pointer',
          padding: '2px 4px',
          borderRadius: 4,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.15s ease, background 0.15s ease',
          outline: 'none',
        }}
        title="Column settings"
      >
        <MoreVertical size={13} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: '#1a1a1c',
            border: '1px solid #2a2a2e',
            borderRadius: 6,
            padding: 4,
            zIndex: 100,
            width: 140,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete(col.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#f87171',
              cursor: 'pointer',
              fontSize: 12,
              padding: '6px 10px',
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderRadius: 4,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#2e1212')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <Trash2 size={13} />
            Delete column
          </button>
        </div>
      )}
    </div>
  );
}

function sortProblems(problems: any[], sort: string, sortOrder: SortOrder = 'asc') {
  const arr = [...problems];
  const mult = sortOrder === 'asc' ? 1 : -1;

  return arr.sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case 'dateAdded': {
        const timeA = new Date(a.dateSolved || a.createdAt).getTime();
        const timeB = new Date(b.dateSolved || b.createdAt).getTime();
        cmp = timeA - timeB;
        break;
      }
      case 'problemNumber': {
        const valA = typeof a.problemNumber === 'number' && a.problemNumber > 0 ? a.problemNumber : (a.code || a.title || '');
        const valB = typeof b.problemNumber === 'number' && b.problemNumber > 0 ? b.problemNumber : (b.code || b.title || '');
        if (typeof valA === 'number' && typeof valB === 'number') {
          cmp = valA - valB;
        } else {
          cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
        }
        break;
      }
      case 'difficulty': {
        const order = { EASY: 1, MEDIUM: 2, HARD: 3 };
        const diffA = order[a.difficulty as keyof typeof order] ?? 0;
        const diffB = order[b.difficulty as keyof typeof order] ?? 0;
        cmp = diffA - diffB;
        break;
      }
      case 'status': {
        const order = { ACTIVE: 1, MASTERED: 2, RETIRED: 3 };
        const statA = order[a.status as keyof typeof order] ?? 0;
        const statB = order[b.status as keyof typeof order] ?? 0;
        cmp = statA - statB;
        break;
      }
      case 'topic': {
        const topA = (a.topic || '').toLowerCase();
        const topB = (b.topic || '').toLowerCase();
        cmp = topA.localeCompare(topB);
        break;
      }
      case 'nextRevision':
      default: {
        const timeA = a.nextRevisionAt ? new Date(a.nextRevisionAt).getTime() : Infinity;
        const timeB = b.nextRevisionAt ? new Date(b.nextRevisionAt).getTime() : Infinity;
        cmp = timeA - timeB;
        break;
      }
    }
    return cmp * mult;
  });
}

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr style={{ borderBottom: '1px solid #1c1c1c', height: 44 }}>
      <td style={{ width: 36, padding: '0 4px', textAlign: 'center' }}><Skeleton className="h-4 w-4 mx-auto rounded" /></td>
      <td style={{ width: 40, padding: '0 4px', textAlign: 'center' }}><Skeleton className="h-6 w-6 mx-auto rounded" /></td>
      <td style={{ width: 320, padding: '0 12px' }}><Skeleton className="h-4 w-48 rounded" /></td>
      <td style={{ width: 100, padding: '0 8px' }}><Skeleton className="h-5 w-16 rounded" /></td>
      <td style={{ width: 130, padding: '0 8px' }}><Skeleton className="h-5 w-20 rounded" /></td>
      <td style={{ width: 120, padding: '0 8px' }}><Skeleton className="h-4 w-20 rounded" /></td>
      <td style={{ width: 44, textAlign: 'center' }}><Skeleton className="h-4 w-4 mx-auto rounded" /></td>
      <td style={{ width: 130, padding: '0 8px' }}><Skeleton className="h-4 w-16 rounded" /></td>
      <td style={{ width: 180, padding: '0 12px' }}><Skeleton className="h-4 w-24 rounded" /></td>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={{ width: 140, padding: '0 8px' }}><Skeleton className="h-4 w-20 rounded" /></td>
      ))}
      <td style={{ width: 100 }} />
    </tr>
  );
}

function CollapsibleGroup({ title, count, topicColor, children }: {
  title: string;
  count: number;
  topicColor?: { bg: string; text: string; border: string };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <tr
        onClick={() => setOpen((o) => !o)}
        style={{ borderBottom: '1px solid #1c1c1c', height: 36, cursor: 'pointer', background: '#141414' }}
      >
        <td colSpan={100} style={{ padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              color: '#555',
              fontSize: 11,
              transition: 'transform 0.15s',
              display: 'inline-block',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            }}>▶</span>
            {topicColor ? (
              <span style={{
                fontSize: 12,
                fontWeight: 500,
                color: topicColor.text,
                background: topicColor.bg,
                border: `1px solid ${topicColor.border}`,
                borderRadius: 4,
                padding: '2px 8px',
              }}>{title}</span>
            ) : (
              <span style={{ fontSize: 12, color: '#888', fontWeight: 500, textTransform: 'uppercase', fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.06em' }}>{title}</span>
            )}
            <span style={{ fontSize: 12, color: '#555', fontFamily: 'var(--font-geist-mono), monospace' }}>{count}</span>
          </div>
        </td>
      </tr>
      {open && children}
    </>
  );
}

function AddColumnPopover({ onSave, columns }: { onSave: (name: string) => void; columns: any[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const submit = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName('');
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 11, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-geist-mono), monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        + Add column
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: 12, zIndex: 50, width: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Column name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
            autoFocus
            style={{ background: '#111', border: '1px solid #333', borderRadius: 4, color: '#fff', fontSize: 13, padding: '5px 8px', width: '100%', outline: 'none', marginBottom: 8 }}
            placeholder="e.g. Company"
          />
          <button
            onClick={submit}
            style={{ background: '#222222', border: '1px solid #333', borderRadius: 4, color: '#ffffff', cursor: 'pointer', fontSize: 12, padding: '4px 12px', width: '100%' }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={100}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: 12 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="4" width="40" height="40" rx="4" stroke="#333" strokeWidth="2"/>
            <line x1="4" y1="16" x2="44" y2="16" stroke="#333" strokeWidth="2"/>
            <line x1="4" y1="28" x2="44" y2="28" stroke="#333" strokeWidth="2"/>
            <line x1="16" y1="4" x2="16" y2="44" stroke="#333" strokeWidth="2"/>
          </svg>
          <div style={{ fontSize: 16, color: '#888', fontWeight: 500 }}>No problems yet</div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, textAlign: 'center', maxWidth: 320 }}>
            Add your first problem using the + New Problem button above,<br />
            or click + New row at the top of the table.
          </div>
        </div>
      </td>
    </tr>
  );
}

export function ProblemsTable() {
  const { data: allProblems, isLoading, mutate } = useSWR<any[]>('/api/problems', fetcher);
  const { data: rawColumns, mutate: mutateColumns } = useSWR('/api/columns', fetcher);
  const rawColumnsList: any[] = Array.isArray(rawColumns) ? rawColumns : [];

  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const columns: any[] = mounted ? rawColumnsList : [];
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sort, setSort] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showNewRow, setShowNewRow] = useState(false);
  const [toast, setToast] = useState('');
  const [tableHovered, setTableHovered] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Set mounted on client to prevent SSR hydration mismatch with SWR client cache
  useEffect(() => {
    setMounted(true);
  }, []);

  const showSkeleton = !mounted || (isLoading && !allProblems);

  // Restore user sort preferences and active tab from URL on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recall_sort_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sortBy) setSort(parsed.sortBy);
        if (parsed.sortOrder) setSortOrder(parsed.sortOrder);
      }
    } catch {}

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'bookmarked') {
        setActiveTab('bookmarked');
      }
    }
  }, []);

  // Smooth scroll to bottom when new row is opened
  useEffect(() => {
    if (showNewRow) {
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      }, 50);
    }
  }, [showNewRow]);

  const saveSortPreference = (newSort: string, newOrder: SortOrder) => {
    try {
      localStorage.setItem('recall_sort_config', JSON.stringify({ sortBy: newSort, sortOrder: newOrder }));
    } catch {}
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    saveSortPreference(newSort, sortOrder);
  };

  const handleSortOrderToggle = () => {
    const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(nextOrder);
    saveSortPreference(sort, nextOrder);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Filter + sort
  const filtered = (Array.isArray(allProblems) ? allProblems : []).filter((p) => {
    const q = search.toLowerCase();
    if (q && !p.title.toLowerCase().includes(q) && !String(p.problemNumber).includes(q)) return false;
    if (difficultyFilter.length && !difficultyFilter.includes(p.difficulty)) return false;
    if (activeTab === 'bookmarked') {
      if (!p.isFavorite) return false;
    }
    if (activeTab === 'due') {
      if (!p.nextRevisionAt) return false;
      if (p.status !== 'ACTIVE') return false;
      const revDate = new Date(p.nextRevisionAt);
      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      if (revDate > endOfToday) return false;
    }
    if (['LEETCODE', 'CODEFORCES', 'CODECHEF', 'GFG', 'HACKERRANK'].includes(activeTab)) {
      if (p.platform !== activeTab) return false;
    }
    return true;
  });
  const sorted = sortProblems(filtered, sort, sortOrder);

  const isAllSelected = sorted.length > 0 && sorted.every((p) => selectedIds.includes(p.id));

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sorted.map((p) => p.id));
    }
  }, [isAllSelected, sorted]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const idsToDelete = [...selectedIds];

    setShowDeleteModal(false);

    // Optimistic update — remove rows immediately
    mutate(
      (prev: any[] | undefined) => prev?.filter((p) => !idsToDelete.includes(p.id)) ?? [],
      { revalidate: false }
    );
    setSelectedIds([]);

    try {
      const res = await fetch('/api/problems', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete }),
      });
      if (!res.ok) throw new Error('Failed to delete problems');
      showToast(`Deleted ${count} ${count === 1 ? 'problem' : 'problems'}`);
      // No refetch needed — optimistic data is correct
    } catch (e: any) {
      mutate(); // revert by refetching from server
      showToast(e.message ?? 'Failed to delete problems');
    }
  }, [selectedIds, mutate]);

  const handleDeleteClick = useCallback(() => {
    if (selectedIds.length === 0) return;
    if (selectedIds.length > 5) {
      setShowDeleteModal(true);
    } else {
      handleBulkDelete();
    }
  }, [selectedIds.length, handleBulkDelete]);

  // Keyboard shortcut listener: Delete or Backspace key triggers delete flow
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isEditable) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        if (selectedIds.length > 5) {
          setShowDeleteModal(true);
        } else {
          handleBulkDelete();
        }
      } else if (showDeleteModal) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowDeleteModal(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleBulkDelete();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedIds.length, showDeleteModal, handleBulkDelete]);

  // Star toggle with optimistic update
  const handleStarToggle = useCallback(async (id: string, current: boolean) => {
    // Optimistic — flip immediately in the cache
    mutate(
      (prev: any[] | undefined) => prev?.map((p) => p.id === id ? { ...p, isFavorite: !current } : p) ?? [],
      { revalidate: false }
    );
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !current }),
      });
      if (!res.ok) throw new Error('Failed to update favorite');
      // No refetch — optimistic data is correct
    } catch {
      mutate(); // revert by refetching from server
      showToast('Failed to update favorite');
    }
  }, [mutate]);

  // Custom field save with optimistic update
  const handleCustomFieldSave = useCallback(async (id: string, columnName: string, value: string) => {
    // Optimistic — merge the new custom field value immediately
    mutate(
      (prev: any[] | undefined) => prev?.map((p) => {
        if (p.id !== id) return p;
        const fields = (p.customFields as Record<string, string>) ?? {};
        return { ...p, customFields: { ...fields, [columnName]: value } };
      }) ?? [],
      { revalidate: false }
    );
    try {
      const res = await fetch(`/api/problems/${id}/custom-fields`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: columnName, value }),
      });
      if (!res.ok) throw new Error('Failed to save field');
    } catch (e: any) {
      mutate(); // revert by refetching from server
      showToast(e.message ?? 'Failed to save field');
      throw e;
    }
  }, [mutate]);

  // Notes save with optimistic update
  const handleNotesSave = useCallback(async (id: string, notes: string) => {
    // Optimistic — update the note value immediately in the cache
    mutate(
      (prev: any[] | undefined) => prev?.map((p) => p.id === id ? { ...p, notes } : p) ?? [],
      { revalidate: false }
    );
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to save notes');
    } catch (e: any) {
      mutate(); // revert by refetching from server
      showToast(e.message ?? 'Failed to save notes');
      throw e;
    }
  }, [mutate]);

  // New problem save with optimistic cache insert, auto-scroll, and highlight flash
  const handleNewProblemSave = useCallback(async (data: any) => {
    const payload = {
      ...data,
      dateSolved: data.dateSolved ?? new Date().toISOString(),
    };
    const res = await fetch('/api/problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Failed to create problem');

    // Optimistically add newly created problem to SWR cache immediately (0ms)
    mutate(
      (prev: any[] | undefined) => [json, ...(prev?.filter((p) => p.id !== json.id) ?? [])],
      { revalidate: false }
    );
    setShowNewRow(false);

    // Auto-scroll to newly created row and flash green highlight
    if (json?.id) {
      setHighlightId(json.id);
      setTimeout(() => {
        const el = document.getElementById(`problem-row-${json.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);

      setTimeout(() => {
        setHighlightId(null);
      }, 2200);
    }
  }, [mutate]);

  // Add column with optimistic update
  const handleAddColumn = useCallback(async (name: string) => {
    const order = rawColumnsList.length;
    const tempId = `temp-${Date.now()}`;
    const newCol = { id: tempId, name, order };

    // Optimistically add column to UI
    mutateColumns((prev: any[] | undefined) => [...(prev ?? []), newCol], { revalidate: false });

    try {
      const res = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, order }),
      });
      if (!res.ok) throw new Error('Failed to create column');
      const savedCol = await res.json();
      // Replace temp column with real server response
      mutateColumns((prev: any[] | undefined) => prev?.map((c) => c.id === tempId ? savedCol : c) ?? [], { revalidate: false });
    } catch {
      mutateColumns(); // revert on error
      showToast('Failed to create column');
    }
  }, [rawColumnsList.length, mutateColumns]);

  // Delete custom column with optimistic update
  const handleDeleteColumn = useCallback(async (id: string) => {
    // Optimistically remove column from UI
    mutateColumns((prev: any[] | undefined) => prev?.filter((c) => c.id !== id) ?? [], { revalidate: false });
    try {
      const res = await fetch(`/api/columns?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete column');
    } catch {
      mutateColumns(); // revert on error
      showToast('Failed to delete column');
    }
  }, [mutateColumns]);

  const COLUMN_COUNT = columns.length;

  // Table header
  const TableHead = () => (
    <thead>
      <tr style={{ borderBottom: '1px solid #1c1c1c', height: 36 }}>
        <th data-cell="checkbox" style={{ width: 36, padding: '0 4px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CustomCheckbox
              checked={isAllSelected}
              onChange={handleToggleSelectAll}
              title={isAllSelected ? "Deselect all" : "Select all"}
              opacity={selectedIds.length > 0 ? 1 : 0.4}
            />
          </div>
        </th>
        <th data-cell="platform" style={{ width: 40, padding: '0 4px' }} />
        {[
          { label: 'PROBLEM', width: 340, padding: '0 16px', dataCol: 'problem' },
          { label: 'DIFFICULTY', width: 115, padding: '0 12px', dataCol: 'difficulty' },
          { label: 'TOPIC', width: 185, padding: '0 12px', dataCol: 'topic' },
          { label: 'STATUS', width: 140, padding: '0 12px', dataCol: 'status' },
          { label: 'STAR', icon: <Bookmark size={13} strokeWidth={2} style={{ color: '#555' }} />, width: 44, center: true, padding: '0', dataCol: 'star' },
          { label: 'NEXT REVISION', width: 140, padding: '0 12px', dataCol: 'next-revision' },
          { label: 'NOTES', width: 190, padding: '0 12px', dataCol: 'notes' },
        ].map(({ label, icon, width, center, padding, dataCol }) => (
          <th key={label} data-col={dataCol} data-cell={dataCol} style={{
            width,
            padding: padding ?? (center ? '0' : '0 8px'),
            textAlign: center ? 'center' : 'left',
            fontSize: 11,
            fontFamily: 'var(--font-geist-mono), monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#555',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            {icon ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </div>
            ) : (
              label
            )}
          </th>
        ))}
        {columns.map((col) => (
          <th key={col.id} data-col="custom" data-cell="custom" style={{ width: 140, padding: '0 8px', fontSize: 11, fontFamily: 'var(--font-geist-mono), monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', fontWeight: 500, whiteSpace: 'nowrap' }}>
            <ColumnHeaderMenu col={col} onDelete={handleDeleteColumn} />
          </th>
        ))}
        <th data-col="custom" data-cell="custom" style={{ width: 100, padding: '0 8px' }}>
          <AddColumnPopover onSave={handleAddColumn} columns={columns} />
        </th>
      </tr>
    </thead>
  );

  // Difficulty save with optimistic update
  const handleDifficultySave = useCallback(async (id: string, difficulty: string) => {
    // Optimistic — update difficulty immediately
    mutate(
      (prev: any[] | undefined) => prev?.map((p) => p.id === id ? { ...p, difficulty } : p) ?? [],
      { revalidate: false }
    );
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      });
      if (!res.ok) throw new Error('Failed to update difficulty');
    } catch (e: any) {
      mutate(); // revert by refetching from server
      showToast(e.message ?? 'Failed to update difficulty');
      throw e;
    }
  }, [mutate]);

  // Topic save with optimistic update
  const handleTopicSave = useCallback(async (id: string, topic: string) => {
    // Optimistic — update topic immediately
    mutate(
      (prev: any[] | undefined) => prev?.map((p) => p.id === id ? { ...p, topic } : p) ?? [],
      { revalidate: false }
    );
    try {
      const res = await fetch(`/api/problems/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) throw new Error('Failed to update topic');
    } catch (e: any) {
      mutate(); // revert by refetching from server
      showToast(e.message ?? 'Failed to update topic');
    }
  }, [mutate]);

  const renderRows = (problems: any[]) =>
    problems.map((p) => (
      <ProblemRow
        key={p.id}
        problem={p}
        columns={columns}
        isSelected={selectedIds.includes(p.id)}
        isHighlighted={highlightId === p.id}
        onToggleSelect={handleToggleSelect}
        onStarToggle={handleStarToggle}
        onDifficultySave={handleDifficultySave}
        onTopicSave={handleTopicSave}
        onNotesSave={handleNotesSave}
        onCustomFieldSave={handleCustomFieldSave}
      />
    ));

  const renderByStatus = () => {
    const groups = { ACTIVE: [] as any[], MASTERED: [] as any[], RETIRED: [] as any[] };
    sorted.forEach((p) => { if (p.status in groups) groups[p.status as keyof typeof groups].push(p); });
    return (
      <>
        <CollapsibleGroup title="Active" count={groups.ACTIVE.length}>{renderRows(groups.ACTIVE)}</CollapsibleGroup>
        <CollapsibleGroup title="Mastered" count={groups.MASTERED.length}>{renderRows(groups.MASTERED)}</CollapsibleGroup>
        <CollapsibleGroup title="Retired" count={groups.RETIRED.length}>{renderRows(groups.RETIRED)}</CollapsibleGroup>
      </>
    );
  };

  const renderByTopic = () => {
    const map = new Map<string, any[]>();
    sorted.forEach((p) => {
      const key = p.topic || 'General';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return Array.from(map.entries()).map(([topicName, problems]) => {
      const color = getTopicColor(topicName);
      return (
        <CollapsibleGroup key={topicName} title={topicName} count={problems.length} topicColor={color}>
          {renderRows(problems)}
        </CollapsibleGroup>
      );
    });
  };

  // Bulk status update with optimistic update
  const handleBulkStatusChange = useCallback(async (newStatus: string) => {
    const idsToUpdate = [...selectedIds];
    // Optimistic — update all selected rows immediately
    mutate(
      (prev: any[] | undefined) => prev?.map((p) =>
        idsToUpdate.includes(p.id) ? { ...p, status: newStatus } : p
      ) ?? [],
      { revalidate: false }
    );
    showToast(`Updated ${idsToUpdate.length} problem(s) to ${newStatus.toLowerCase()}`);
    setSelectedIds([]);
    try {
      await Promise.all(
        idsToUpdate.map((id) =>
          fetch(`/api/problems/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
    } catch {
      mutate(); // revert by refetching from server
      showToast('Failed to update status');
    }
  }, [selectedIds, mutate]);

  // CSV Export
  const handleExportCSV = useCallback(() => {
    if (!allProblems || allProblems.length === 0) {
      showToast('No problems to export');
      return;
    }
    const headers = ['Title', 'Platform', 'Problem Code', 'Difficulty', 'Topic', 'Status', 'URL', 'Notes', 'Date Solved'];
    const rows = allProblems.map((p) => [
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.platform || ''}"`,
      `"${p.code || p.problemNumber || ''}"`,
      `"${p.difficulty || ''}"`,
      `"${(p.topic || '').replace(/"/g, '""')}"`,
      `"${p.status || ''}"`,
      `"${p.url || ''}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
      `"${p.dateSolved || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `recall-problems-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported recall-problems.csv');
  }, [allProblems]);

  return (
    <div data-dashboard-container style={{ padding: '24px 32px' }}>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          background: '#1a1a1a', border: '1px solid #333', borderRadius: 6,
          color: '#fff', fontSize: 13, padding: '10px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}

      {/* Floating action bar when rows selected */}
      {selectedIds.length > 0 && (
        <div
          data-selection-bar
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 900,
            background: '#1a1a1c',
            border: '1px solid #2a2a2e',
            borderRadius: 8,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          <span data-selection-count style={{ fontSize: 13, color: '#ccc', fontFamily: 'var(--font-geist-mono), monospace' }}>
            <span className="hidden md:inline">{selectedIds.length} selected</span>
            <span className="inline md:hidden">{selectedIds.length} sel</span>
          </span>
          <div data-selection-divider style={{ width: 1, height: 16, background: '#333', flexShrink: 0 }} />

          <div data-selection-actions style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              data-selection-btn="mastered"
              onClick={() => handleBulkStatusChange('MASTERED')}
              style={{
                background: '#1a2e1a', border: '1px solid #2d5a2d',
                borderRadius: 4, color: '#4ade80', cursor: 'pointer',
                fontSize: 12, padding: '4px 8px', fontWeight: 500,
              }}
            >
              <span className="hidden md:inline">Mark Mastered</span>
              <span className="inline md:hidden">Mastered</span>
            </button>
            <button
              data-selection-btn="active"
              onClick={() => handleBulkStatusChange('ACTIVE')}
              style={{
                background: '#252525', border: '1px solid #333',
                borderRadius: 4, color: '#ccc', cursor: 'pointer',
                fontSize: 12, padding: '4px 8px', fontWeight: 500,
              }}
            >
              <span className="hidden md:inline">Mark Active</span>
              <span className="inline md:hidden">Active</span>
            </button>
            <button
              data-selection-btn="retired"
              onClick={() => handleBulkStatusChange('RETIRED')}
              style={{
                background: '#2a251a', border: '1px solid #4a3d1a',
                borderRadius: 4, color: '#fb923c', cursor: 'pointer',
                fontSize: 12, padding: '4px 8px', fontWeight: 500,
              }}
            >
              <span className="hidden md:inline">Mark Retired</span>
              <span className="inline md:hidden">Retired</span>
            </button>
          </div>

          <div data-selection-divider style={{ width: 1, height: 16, background: '#333', flexShrink: 0 }} />

          <button
            data-selection-delete
            onClick={handleDeleteClick}
            style={{
              background: '#2e1212',
              border: '1px solid #4a1818',
              borderRadius: 4,
              color: '#f87171',
              cursor: 'pointer',
              fontSize: 13,
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#3e1616')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2e1212')}
          >
            <Trash2 size={13} />
            <span className="hidden md:inline">Delete</span>
          </button>
          <button
            data-selection-close
            onClick={() => setSelectedIds([])}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: 13,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              flexShrink: 0,
            }}
            title="Clear selection"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page header */}
      <div data-page-header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div data-breadcrumb style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 14 }}>
          <span style={{ color: '#555' }}>recall</span>
          <span style={{ color: '#333', margin: '0 8px' }}>/</span>
          <span style={{ color: '#fff', fontWeight: 500 }}>All Problems</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            data-download-button
            onClick={handleExportCSV}
            title="Export problems to CSV"
            style={{
              background: '#161618',
              border: '1px solid #27272a',
              borderRadius: 6,
              color: '#888',
              cursor: 'pointer',
              fontSize: 13,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s, border-color 0.15s',
              padding: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.color = '#888'; }}
          >
            <Download size={14} />
          </button>

          <button
            data-new-problem-button
            id="new-problem-btn"
            onClick={() => setShowNewRow(true)}
            style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Problem
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      {/* Toolbar */}
      <div style={{ margin: '16px 0' }}>
        <Toolbar
          search={search} onSearchChange={setSearch}
          difficultyFilter={difficultyFilter} onDifficultyChange={setDifficultyFilter}
          statusFilter={statusFilter} onStatusChange={setStatusFilter}
          sort={sort} onSortChange={handleSortChange}
          sortOrder={sortOrder} onSortOrderToggle={handleSortOrderToggle}
        />
      </div>

      {/* Table — Notion-style horizontal scroll container */}
      <div
        data-table-container
        data-table-scroll-container
        style={{
          overflowX: 'auto',
          maxWidth: '100%',
          borderRadius: 8,
          border: '1px solid #1c1c1c',
        }}
        onMouseEnter={() => setTableHovered(true)}
        onMouseLeave={() => setTableHovered(false)}
      >
        <table data-problems-table style={{ width: '100%', minWidth: 1230 + COLUMN_COUNT * 140, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <TableHead />
          <tbody>
            {showSkeleton ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} columns={COLUMN_COUNT} />
              ))
            ) : sorted.length === 0 && !showNewRow ? (
              <EmptyState />
            ) : activeTab === 'status' ? (
              renderByStatus()
            ) : activeTab === 'topic' ? (
              renderByTopic()
            ) : (
              renderRows(sorted)
            )}
            {showNewRow && (
              <NewRow
                onSave={handleNewProblemSave}
                onCancel={() => setShowNewRow(false)}
                columns={columns}
              />
            )}
          </tbody>
        </table>

        {/* Bottom hover bar — Notion style + New row */}
        {!showNewRow && (
          <div
            onClick={() => setShowNewRow(true)}
            style={{
              padding: '8px 12px',
              borderTop: '1px solid #1c1c1c',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: '#555',
              transition: 'background 0.15s, color 0.15s',
              background: '#0d0d0d',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#141414';
              e.currentTarget.style.color = '#aaa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0d0d0d';
              e.currentTarget.style.color = '#555';
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
            <span>New row</span>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 400,
              background: '#161618',
              border: '1px solid #28282c',
              borderRadius: 10,
              padding: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
              Delete {selectedIds.length} {selectedIds.length === 1 ? 'problem' : 'problems'}?
            </div>
            <div style={{ fontSize: 13, color: '#999', lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to delete {selectedIds.length === 1 ? 'this problem' : `these ${selectedIds.length} selected problems`}? This action cannot be undone.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  background: '#222226',
                  border: '1px solid #333338',
                  borderRadius: 6,
                  padding: '6px 14px',
                  color: '#ccc',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 14px',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete {selectedIds.length}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
