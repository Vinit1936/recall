'use client';

import { formatDistanceToNow, startOfDay } from 'date-fns';
import { getDifficultyStyle, getTopicColor, Pill, DifficultyPickerCell, TopicPickerCell } from './columns';
import { PlatformLogo } from '@/lib/platforms/logos';

import { useState, useRef, useEffect } from 'react';
import { CustomCheckbox } from '@/components/ui/custom-checkbox';
import { Bookmark, Pencil } from 'lucide-react';

// Status dot + label — derives from problem.status and revisions[0].confidence
export function StatusCell({ problem }: { problem: any }) {
  if (problem.status === 'MASTERED') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div data-status-dot style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', flexShrink: 0 }} />
        <span data-status-label style={{ fontSize: 13, color: '#a78bfa', fontFamily: 'var(--font-geist-mono), monospace' }}>Mastered</span>
      </div>
    );
  }
  if (problem.status === 'RETIRED') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div data-status-dot style={{ width: 8, height: 8, borderRadius: '50%', background: '#444', flexShrink: 0 }} />
        <span data-status-label style={{ fontSize: 13, color: '#555', fontFamily: 'var(--font-geist-mono), monospace' }}>Retired</span>
      </div>
    );
  }

  const latestConfidence = problem.revisions?.[0]?.confidence ?? null;

  if (!latestConfidence || problem.revisionCount === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div data-status-dot style={{ width: 8, height: 8, borderRadius: '50%', background: '#555', flexShrink: 0 }} />
        <span data-status-label style={{ fontSize: 13, color: '#666', fontFamily: 'var(--font-geist-mono), monospace' }}>Not started</span>
      </div>
    );
  }

  if (latestConfidence === 'CLEAN') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div data-status-dot style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
        <span data-status-label style={{ fontSize: 13, color: '#4ade80', fontFamily: 'var(--font-geist-mono), monospace' }}>Clean</span>
      </div>
    );
  }
  if (latestConfidence === 'SHAKY') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div data-status-dot style={{ width: 8, height: 8, borderRadius: '50%', background: '#fb923c', flexShrink: 0 }} />
        <span data-status-label style={{ fontSize: 13, color: '#fb923c', fontFamily: 'var(--font-geist-mono), monospace' }}>Shaky</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div data-status-dot style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171', flexShrink: 0 }} />
      <span data-status-label style={{ fontSize: 13, color: '#f87171', fontFamily: 'var(--font-geist-mono), monospace' }}>Struggled</span>
    </div>
  );
}

// Next revision formatted date string helper
function NextRevisionCell({ problem }: { problem: any }) {
  if (problem.status !== 'ACTIVE') {
    return <span style={{ fontSize: 13, color: '#444', fontFamily: 'var(--font-geist-mono), monospace' }}>—</span>;
  }
  const date = new Date(problem.nextRevisionAt);
  const today = startOfDay(new Date());
  const revDay = startOfDay(date);
  const diffDays = Math.round((revDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let text = '';
  let color = '#888';
  if (diffDays < 0) {
    text = `${Math.abs(diffDays)}d overdue`;
    color = '#f87171';
  } else if (diffDays === 0) {
    text = 'Today';
    color = '#facc15';
  } else if (diffDays === 1) {
    text = 'Tomorrow';
    color = '#a1a1aa';
  } else {
    text = `in ${diffDays}d`;
    color = '#666';
  }

  return <span style={{ fontSize: 13, color, fontFamily: 'var(--font-geist-mono), monospace', fontVariantNumeric: 'tabular-nums' }}>{text}</span>;
}

// Star toggle — Lucide Star icon with golden glow & hover effect
function StarCell({ problem, onToggle }: { problem: any; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isFav = !!problem.isFavorite;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? 'rgba(255, 255, 255, 0.05)' : 'none',
          border: 'none',
          cursor: 'pointer',
          width: 28,
          height: 28,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Bookmark
          size={15}
          fill={isFav ? '#ffffff' : 'none'}
          color={isFav ? '#ffffff' : hovered ? '#a1a1aa' : '#3f3f46'}
          style={{
            transition: 'transform 0.15s ease, color 0.15s ease, fill 0.15s ease',
            transform: hovered ? 'scale(1.15)' : 'scale(1)',
          }}
        />
      </button>
    </div>
  );
}

// Notion-style inline editable cell for Notes and Custom Fields using a floating popover editor
function InlineEditCell({
  initialValue = '',
  maxWidth = 180,
  onSave,
}: {
  initialValue?: string;
  maxWidth?: number;
  onSave: (val: string) => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(initialValue ?? '');
  const [hovered, setHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isCommittingRef = useRef(false);

  useEffect(() => {
    if (!editing && !saving) {
      setValue(initialValue ?? '');
    }
  }, [initialValue, editing, saving]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [editing]);

  useEffect(() => {
    if (!editing) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleCommit(value);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editing, value]);

  const handleInput = () => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const handleCommit = async (valToSave: string) => {
    if (isCommittingRef.current) return;
    isCommittingRef.current = true;
    const trimmed = valToSave.trim();
    const original = (initialValue ?? '').trim();

    setEditing(false);

    if (trimmed !== original) {
      setSaving(true);
      try {
        await onSave(trimmed);
      } catch {
        setValue(initialValue ?? '');
      } finally {
        setSaving(false);
        isCommittingRef.current = false;
      }
    } else {
      isCommittingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommit(value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      isCommittingRef.current = true;
      setValue(initialValue ?? '');
      setEditing(false);
      setTimeout(() => {
        isCommittingRef.current = false;
      }, 50);
    }
  };

  const displayText = (value ?? '').trim();
  const truncated = displayText.length > 40 ? displayText.slice(0, 40) + '…' : displayText;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Display mode cell */}
      <div
        onClick={() => setEditing(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={displayText ? displayText : undefined}
        style={{
          fontSize: 13,
          color: '#666',
          cursor: 'text',
          minHeight: 26,
          padding: '3px 6px',
          borderRadius: 4,
          background: hovered ? '#1a1a1a' : 'transparent',
          opacity: saving ? 0.6 : 1,
          transition: 'background 0.15s ease, opacity 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            maxWidth: maxWidth - 24,
          }}
        >
          {truncated}
        </span>
        {hovered && (
          <Pencil
            size={12}
            style={{ color: '#444', flexShrink: 0, marginLeft: 4 }}
          />
        )}
      </div>

      {/* Floating notion-style popover editor */}
      {editing && (
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            top: -4,
            left: -4,
            width: 'max(100% + 8px, 240px)',
            zIndex: 100,
            background: '#1a1a1c',
            border: '1px solid #2a2a2e',
            borderRadius: 6,
            padding: '8px 10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            opacity: saving ? 0.6 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 13,
              fontFamily: 'inherit',
              lineHeight: '1.4',
              resize: 'none',
              overflow: 'hidden',
              padding: 0,
              margin: 0,
              display: 'block',
              boxSizing: 'border-box',
              caretColor: '#ffffff',
            }}
          />
        </div>
      )}
    </div>
  );
}

type ProblemRowProps = {
  problem: any;
  columns: any[];
  isSelected: boolean;
  isHighlighted?: boolean;
  onToggleSelect: (id: string) => void;
  onStarToggle: (id: string, current: boolean) => void;
  onDifficultySave: (id: string, difficulty: string) => Promise<void> | void;
  onTopicSave: (id: string, topic: string) => Promise<void> | void;
  onNotesSave: (id: string, notes: string) => Promise<void> | void;
  onCustomFieldSave: (id: string, columnName: string, value: string) => Promise<void> | void;
};

export function ProblemRow({ problem, columns, isSelected, isHighlighted, onToggleSelect, onStarToggle, onDifficultySave, onTopicSave, onNotesSave, onCustomFieldSave }: ProblemRowProps) {
  const [hovered, setHovered] = useState(false);
  const diffStyle = getDifficultyStyle(problem.difficulty);
  const topicColor = getTopicColor(problem.topic);

  return (
    <tr
      id={`problem-row-${problem.id}`}
      className={isHighlighted ? 'animate-row-highlight' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isSelected ? '#1c1c1c' : hovered ? '#0f0f0f' : 'transparent',
        borderBottom: '1px solid #1c1c1c',
        height: 44,
        transition: 'background 0.1s',
      }}
    >
      {/* Checkbox cell */}
      <td data-cell="checkbox" style={{ width: 36, textAlign: 'center', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CustomCheckbox
            checked={isSelected}
            onChange={() => onToggleSelect(problem.id)}
            title="Select row"
            opacity={hovered || isSelected ? 1 : 0}
          />
        </div>
      </td>

      {/* Platform logo cell */}
      <td data-cell="platform" style={{ width: 40, textAlign: 'center', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlatformLogo platform={problem.platform} />
        </div>
      </td>

      {/* Problem cell: number + title */}
      <td data-cell="problem" style={{ width: 340, padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
          {(problem.platform === 'LEETCODE' || problem.platform === 'CODEFORCES') && problem.problemNumber > 0 && (
            <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 13, color: '#666', fontWeight: 400, flexShrink: 0 }}>
              {problem.problemNumber}
            </span>
          )}
          {problem.url ? (
            <a
              data-problem-title
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              title={problem.title}
              style={{
                fontSize: 14,
                color: '#e5e5e5',
                fontWeight: 500,
                textDecoration: hovered ? 'underline' : 'none',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {problem.title}
            </a>
          ) : (
            <span style={{ fontSize: 14, color: '#e5e5e5', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={problem.title}>
              {problem.title}
              <span style={{ color: '#444', fontSize: 12, textDecoration: 'line-through', flexShrink: 0 }}>🔗</span>
            </span>
          )}
        </div>
      </td>

      {/* Difficulty */}
      <td data-cell="difficulty" style={{ width: 115, padding: '0 12px', position: 'relative' }}>
        <DifficultyPickerCell
          difficulty={problem.difficulty}
          onSave={(newDiff) => onDifficultySave(problem.id, newDiff)}
        />
      </td>

      {/* Topic */}
      <td data-cell="topic" style={{ width: 185, padding: '0 12px', position: 'relative' }}>
        <TopicPickerCell
          topic={problem.topic}
          onSave={(newTopic) => onTopicSave(problem.id, newTopic)}
        />
      </td>

      {/* Status */}
      <td data-cell="status" style={{ width: 140, padding: '0 12px' }}>
        <StatusCell problem={problem} />
      </td>

      {/* Star */}
      <td data-cell="star" data-col="star" style={{ width: 44, textAlign: 'center', padding: 0 }}>
        <StarCell problem={problem} onToggle={() => onStarToggle(problem.id, problem.isFavorite)} />
      </td>

      {/* Next Revision */}
      <td data-cell="next-revision" data-col="next-revision" style={{ width: 140, padding: '0 12px' }}>
        <NextRevisionCell problem={problem} />
      </td>

      {/* Notes — Notion-style in-place editable */}
      <td data-cell="notes" data-col="notes" style={{ width: 190, padding: '0 12px' }}>
        <InlineEditCell
          initialValue={problem.notes ?? ''}
          maxWidth={190}
          onSave={(val) => onNotesSave(problem.id, val)}
        />
      </td>

      {/* Custom columns — Notion-style in-place editable */}
      {columns.map((col) => {
        const fields = (problem.customFields as Record<string, string>) ?? {};
        return (
          <td key={col.id} data-cell="custom" data-col="custom" style={{ width: 140, padding: '0 8px' }}>
            <InlineEditCell
              initialValue={fields[col.name] ?? ''}
              maxWidth={140}
              onSave={(val) => onCustomFieldSave(problem.id, col.name, val)}
            />
          </td>
        );
      })}

      {/* Trailing cell for Add Column column alignment */}
      <td data-cell="custom" data-col="custom" style={{ width: 100 }} />
    </tr>
  );
}

