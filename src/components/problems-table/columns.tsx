import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getTopicColor } from '@/lib/topic-colors';
import { Pill } from '@/components/ui/pill';

export function getDifficultyStyle(difficulty: string): { bg: string; text: string; border: string } {
  switch (difficulty) {
    case 'EASY':   return { bg: 'var(--easy-bg, #1c3a1c)', text: 'var(--easy-text, #4ade80)', border: 'var(--easy-border, #2d5a2d)' };
    case 'MEDIUM': return { bg: 'var(--medium-bg, #3a2a0d)', text: 'var(--medium-text, #fb923c)', border: 'var(--medium-border, #5a3d10)' };
    case 'HARD':   return { bg: 'var(--hard-bg, #3a0f0f)', text: 'var(--hard-text, #f87171)', border: 'var(--hard-border, #5a1a1a)' };
    default:       return { bg: 'var(--secondary, #1a1a1a)', text: 'var(--text-dim, #888)', border: 'var(--border, #2a2a2a)' };
  }
}

// TopLevelPortal — renders any table pop up at root document.body level (zIndex: 99999)
// so it overflows table barriers and is never clipped by table overflow/headers.
export function TopLevelPortal({
  anchorRef,
  onClose,
  children,
  width = 160,
  minHeight = 120,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  minHeight?: number;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const popupH = popoverRef.current?.offsetHeight ?? minHeight;
      const popupW = popoverRef.current?.offsetWidth ?? width;

      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < popupH && rect.top > popupH;

      let top = openUpward ? rect.top - popupH - 4 : rect.bottom + 4;
      let left = rect.left;

      if (top < 8) top = 8;
      if (top + popupH > window.innerHeight - 8) top = window.innerHeight - popupH - 8;
      if (left + popupW > window.innerWidth - 12) left = window.innerWidth - popupW - 12;
      if (left < 8) left = 8;

      setPos({ top, left });
    };

    updatePosition();
    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 10);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anchorRef, onClose, width, minHeight]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={popoverRef}
      data-portal="true"
      style={{
        position: 'fixed',
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        zIndex: 99999,
        background: 'var(--popover)',
        border: '1px solid var(--input-border)',
        borderRadius: 8,
        padding: 6,
        boxShadow: 'var(--shadow-modal)',
        visibility: pos ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>,
    document.body
  );
}

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;

export function DifficultyPickerCell({
  difficulty,
  onSave,
}: {
  difficulty: string;
  onSave: (val: string) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hoveredOpt, setHoveredOpt] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSelect = async (newDiff: string) => {
    setOpen(false);
    if (newDiff === difficulty) return;
    setSaving(true);
    try {
      await onSave(newDiff);
    } catch {
      // Revert handled by parent/SWR
    } finally {
      setSaving(false);
    }
  };

  const diffStyle = getDifficultyStyle(difficulty);

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        data-difficulty-pill
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        title="Change difficulty"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          outline: 'none',
          opacity: saving ? 0.6 : 1,
          transition: 'opacity 0.15s ease',
          display: 'inline-flex',
        }}
      >
        <Pill bg={diffStyle.bg} text={diffStyle.text} border={diffStyle.border}>
          {difficulty ? difficulty.charAt(0) + difficulty.slice(1).toLowerCase() : 'Select'}
        </Pill>
      </button>

      {open && (
        <TopLevelPortal anchorRef={buttonRef} onClose={() => setOpen(false)} width={120}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {DIFFICULTIES.map((d) => {
              const st = getDifficultyStyle(d);
              const isSelected = d === difficulty;
              const isHovered = hoveredOpt === d;
              return (
                <button
                  key={d}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(d);
                  }}
                  onMouseEnter={() => setHoveredOpt(d)}
                  onMouseLeave={() => setHoveredOpt(null)}
                  style={{
                    background: isHovered ? 'var(--dropdown-item-hover-bg, rgba(255, 255, 255, 0.08))' : 'none',
                    border: 'none',
                    borderRadius: 4,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    textAlign: 'left',
                    outline: 'none',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <Pill bg={st.bg} text={st.text} border={st.border}>
                    {d.charAt(0) + d.slice(1).toLowerCase()}
                  </Pill>
                  {isSelected && <span style={{ color: 'var(--foreground)', fontSize: 12, marginLeft: 8 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </TopLevelPortal>
      )}
    </div>
  );
}

const DEFAULT_TOPICS = [
  'Array',
  'String',
  'Hash Table',
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Linked List',
  'Stack',
  'Queue',
  'Tree',
  'Binary Tree',
  'Binary Search Tree',
  'Graph',
  'Heap / Priority Queue',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Trie',
  'Bit Manipulation',
  'Union Find',
  'Matrix',
  'Math',
  'Recursion',
  'Sorting',
];

export function TopicPickerCell({
  topic,
  onSave,
}: {
  topic: string;
  onSave: (val: string) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [hoveredOpt, setHoveredOpt] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const handleSelect = async (newTopic: string) => {
    setOpen(false);
    if (newTopic === topic) return;
    setSaving(true);
    try {
      await onSave(newTopic);
    } catch {
      // Revert handled by parent/SWR
    } finally {
      setSaving(false);
    }
  };

  const topicColor = getTopicColor(topic || '');

  // Filter topics
  const query = search.trim().toLowerCase();
  const filtered = DEFAULT_TOPICS.filter((t) => t.toLowerCase().includes(query));
  const hasExactMatch = DEFAULT_TOPICS.some((t) => t.toLowerCase() === query) || (topic && topic.toLowerCase() === query);
  const showCreateOption = query.length > 0 && !hasExactMatch;

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        data-topic-pill
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        title="Change topic"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          outline: 'none',
          opacity: saving ? 0.6 : 1,
          transition: 'opacity 0.15s ease',
          display: 'inline-flex',
        }}
      >
        <Pill bg={topicColor.bg} text={topicColor.text} border={topicColor.border}>
          {topic || '—'}
        </Pill>
      </button>

      {open && (
        <TopLevelPortal anchorRef={buttonRef} onClose={() => setOpen(false)} width={220} minHeight={200}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 208 }}>
            {/* Search / Create Input */}
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.trim()) {
                  e.preventDefault();
                  handleSelect(search.trim());
                } else if (e.key === 'Escape') {
                  setOpen(false);
                }
              }}
              placeholder="Search or add topic..."
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: 4,
                color: 'var(--foreground)',
                fontSize: 12,
                padding: '5px 8px',
                width: '100%',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            {/* List options */}
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {showCreateOption && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(search.trim());
                  }}
                  onMouseEnter={() => setHoveredOpt('__create__')}
                  onMouseLeave={() => setHoveredOpt(null)}
                  style={{
                     background: hoveredOpt === '__create__' ? 'var(--success-bg)' : 'none',
                     border: '1px dashed var(--success-border)',
                    borderRadius: 4,
                    padding: '6px 8px',
                    cursor: 'pointer',
                    color: 'var(--success)',
                    fontSize: 12,
                    textAlign: 'left',
                    outline: 'none',
                    fontWeight: 500,
                  }}
                >
                  Create &quot;{search.trim()}&quot;
                </button>
              )}

              {filtered.map((t) => {
                const tc = getTopicColor(t);
                const isSelected = t === topic;
                const isHovered = hoveredOpt === t;
                return (
                  <button
                    key={t}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(t);
                    }}
                    onMouseEnter={() => setHoveredOpt(t)}
                    onMouseLeave={() => setHoveredOpt(null)}
                    style={{
                      background: isHovered ? 'var(--dropdown-item-hover-bg, rgba(255, 255, 255, 0.08))' : 'none',
                      border: 'none',
                      borderRadius: 4,
                      padding: '5px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      textAlign: 'left',
                      outline: 'none',
                    }}
                  >
                    <Pill bg={tc.bg} text={tc.text} border={tc.border}>
                      {t}
                    </Pill>
                    {isSelected && <span style={{ color: 'var(--foreground)', fontSize: 12 }}>✓</span>}
                  </button>
                );
              })}

              {filtered.length === 0 && !showCreateOption && (
                <div style={{ padding: 8, fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center' }}>
                  No matching topics
                </div>
              )}
            </div>
          </div>
        </TopLevelPortal>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Company Tags Cell (from Leet-Vision)
// ---------------------------------------------------------------------------
export function CompanyTagsCell({ problem }: { problem: any }) {
  const [companies, setCompanies] = useState<string[]>(() => {
    const raw = problem?.customFields?.companies ?? problem?.companies;
    return Array.isArray(raw) ? raw : [];
  });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Auto-fetch if LeetCode problem has no companies yet
  useEffect(() => {
    const raw = problem?.customFields?.companies ?? problem?.companies;
    if (Array.isArray(raw) && raw.length > 0) {
      setCompanies(raw);
      return;
    }

    if (problem?.platform === 'LEETCODE' && problem?.problemNumber > 0 && !companies.length && !loading) {
      setLoading(true);
      fetch(`/api/leetvision?id=${problem.problemNumber}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.companies && Array.isArray(data.companies) && data.companies.length > 0) {
            setCompanies(data.companies);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [problem?.id, problem?.problemNumber, problem?.platform]);

  if (!companies || companies.length === 0) {
    if (loading) {
      return (
        <span style={{ fontSize: 11, color: 'var(--text-faint)', fontStyle: 'italic', fontFamily: 'var(--font-geist-mono), monospace' }}>
          fetching...
        </span>
      );
    }
    return <span style={{ fontSize: 13, color: 'var(--text-faint)', fontFamily: 'var(--font-geist-mono), monospace' }}>—</span>;
  }

  const displayed = companies.slice(0, 2);
  const remaining = companies.length - displayed.length;
  const filtered = search.trim()
    ? companies.filter((c) => c.toLowerCase().includes(search.toLowerCase().trim()))
    : companies;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap', overflow: 'hidden' }}>
      {displayed.map((comp) => (
        <span
          key={comp}
          title={comp}
          style={{
            fontSize: 11,
            padding: '2px 7px',
            borderRadius: 4,
            background: 'rgba(56, 189, 248, 0.08)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            whiteSpace: 'nowrap',
            maxWidth: 82,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: 'var(--font-geist-mono), monospace',
            display: 'inline-block',
          }}
        >
          {comp}
        </span>
      ))}

      {remaining > 0 && (
        <>
          <button
            ref={triggerRef}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            title={`${remaining} more companies (click to view all)`}
            style={{
              fontSize: 10.5,
              padding: '2px 5px',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-geist-mono), monospace',
              display: 'inline-flex',
              alignItems: 'center',
              outline: 'none',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
          >
            +{remaining}
          </button>

          {open && (
            <TopLevelPortal anchorRef={triggerRef} onClose={() => setOpen(false)} width={230} minHeight={220}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 218 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Companies ({companies.length})
                  </span>
                  <span style={{ fontSize: 10, color: '#38bdf8', fontFamily: 'var(--font-geist-mono), monospace' }}>
                    Leet-Vision
                  </span>
                </div>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter companies..."
                  autoFocus
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: 4,
                    color: 'var(--foreground)',
                    fontSize: 12,
                    padding: '4px 8px',
                    width: '100%',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 4, padding: '2px 0' }}>
                  {filtered.map((comp) => (
                    <span
                      key={comp}
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: 'rgba(56, 189, 248, 0.08)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {comp}
                    </span>
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ padding: 8, fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center', width: '100%' }}>
                      No matching companies
                    </div>
                  )}
                </div>
              </div>
            </TopLevelPortal>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Solution Button Cell (Leet-Vision visualizer link)
// ---------------------------------------------------------------------------
export function SolutionButtonCell({ problem }: { problem: any }) {
  const customSolUrl = problem?.customFields?.solutionUrl ?? problem?.solutionUrl;
  const isLeetCode = problem?.platform === 'LEETCODE' && problem?.problemNumber > 0;
  const solutionUrl = customSolUrl || (isLeetCode ? `https://leet-vision.com/solution/${problem.problemNumber}` : null);

  if (!solutionUrl) {
    return <span style={{ fontSize: 13, color: 'var(--text-faint)', fontFamily: 'var(--font-geist-mono), monospace' }}>—</span>;
  }

  return (
    <a
      href={solutionUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      title="Open Leet-Vision solution visualizer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 5,
        fontSize: 11,
        fontWeight: 500,
        textDecoration: 'none',
        background: 'rgba(249, 115, 22, 0.1)',
        color: '#fb923c',
        border: '1px solid rgba(249, 115, 22, 0.25)',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(249, 115, 22, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.45)';
        e.currentTarget.style.transform = 'translateY(-0.5px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(249, 115, 22, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.25)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <span style={{ fontSize: 9 }}>▶</span>
      <span>Solution</span>
      <span style={{ fontSize: 9, opacity: 0.7 }}>↗</span>
    </a>
  );
}

