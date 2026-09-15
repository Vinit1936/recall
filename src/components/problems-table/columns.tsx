import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getTopicColor } from '@/lib/topic-colors';
import { Pill } from '@/components/ui/pill';

export function getDifficultyStyle(difficulty: string): { bg: string; text: string; border: string } {
  switch (difficulty) {
    case 'EASY':   return { bg: 'rgba(34, 197, 94, 0.14)', text: '#16a34a', border: 'rgba(34, 197, 94, 0.28)' };
    case 'MEDIUM': return { bg: 'rgba(249, 115, 22, 0.14)', text: '#ea580c', border: 'rgba(249, 115, 22, 0.28)' };
    case 'HARD':   return { bg: 'rgba(239, 68, 68, 0.14)', text: '#dc2626', border: 'rgba(239, 68, 68, 0.28)' };
    default:       return { bg: 'var(--secondary)', text: 'var(--muted-foreground)', border: 'var(--border)' };
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
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 6,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
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
                    background: isHovered ? 'var(--accent)' : 'none',
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
                      background: isHovered ? 'var(--accent)' : 'none',
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
                <div style={{ padding: 8, fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center' }}>
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
