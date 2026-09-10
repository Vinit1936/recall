'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { TopLevelPortal, DifficultyPickerCell, TopicPickerCell } from './columns';
import { PlatformLogo } from '@/lib/platforms/logos';
import { Pencil, Search, X, Loader2 } from 'lucide-react';

type NewRowProps = {
  onSave: (data: {
    platform: string;
    problemNumber: number;
    title: string;
    difficulty: string;
    topic: string;
    url: string;
    code?: string;
    notes?: string;
    customFields?: Record<string, string>;
    dateSolved: string;
  }) => Promise<void>;
  onCancel: () => void;
  columns: any[];
};

type AutoFillData = {
  title: string;
  difficulty: string;
  topic: string;
  url: string;
  problemNumber?: number;
  code?: string;
} | null;

const PLATFORMS = [
  { value: 'LEETCODE',   label: 'LeetCode' },
  { value: 'CODEFORCES', label: 'Codeforces' },
  { value: 'GFG',        label: 'GeeksForGeeks' },
  { value: 'HACKERRANK', label: 'HackerRank' },
  { value: 'CODECHEF',   label: 'CodeChef' },
];

// ---------------------------------------------------------------------------
// Floating notes / text cell
// ---------------------------------------------------------------------------
function NewRowFloatingCell({
  value,
  placeholder,
  maxWidth = 180,
  autoOpen = false,
  onChange,
  onSaveRow,
  onCancelRow,
}: {
  value: string;
  placeholder: string;
  maxWidth?: number;
  autoOpen?: boolean;
  onChange: (val: string) => void;
  onSaveRow: () => void;
  onCancelRow: () => void;
}) {
  const [editing, setEditing] = useState(autoOpen);
  const [hovered, setHovered] = useState(false);
  const [localVal, setLocalVal] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLocalVal(value); }, [value]);
  useEffect(() => { if (autoOpen) setEditing(true); }, [autoOpen]);

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
        onChange(localVal);
        setEditing(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 10);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handleClickOutside); };
  }, [editing, localVal, onChange]);

  const handleInput = () => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); onChange(localVal); setEditing(false); onSaveRow();
    } else if (e.key === 'Escape') {
      e.preventDefault(); setEditing(false);
    }
  };

  const displayText = localVal.trim();
  const truncated = displayText.length > 40 ? displayText.slice(0, 40) + '…' : displayText;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        onClick={() => setEditing(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={displayText || undefined}
        style={{
          fontSize: 13, color: displayText ? '#666' : '#444', cursor: 'text',
          minHeight: 26, padding: '3px 6px', borderRadius: 4,
          background: hovered ? '#1a1a1a' : 'transparent',
          transition: 'background 0.15s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', boxSizing: 'border-box',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, maxWidth: maxWidth - 24 }}>
          {truncated || placeholder}
        </span>
        {hovered && <Pencil size={12} style={{ color: '#444', flexShrink: 0, marginLeft: 4 }} />}
      </div>
      {editing && (
        <div
          ref={containerRef}
          style={{
            position: 'absolute', top: -4, left: -4,
            width: 'max(100% + 8px, 240px)', zIndex: 100,
            background: '#1a1a1c', border: '1px solid #2a2a2e',
            borderRadius: 6, padding: '8px 10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={localVal}
            onChange={(e) => { setLocalVal(e.target.value); onChange(e.target.value); handleInput(); }}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={placeholder}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 13, fontFamily: 'inherit', lineHeight: '1.4',
              resize: 'none', overflow: 'hidden', padding: 0, margin: 0,
              display: 'block', boxSizing: 'border-box', caretColor: '#ffffff',
            }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main NewRow component
// ---------------------------------------------------------------------------
export function NewRow({ onSave, onCancel, columns }: NewRowProps) {
  const [platform, setPlatform] = useState<string | null>(null);
  const [platformOpen, setPlatformOpen] = useState(true);

  // Shared autofill / pickers state
  const [autoFill, setAutoFill] = useState<AutoFillData>(null);
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState(false);
  const [openNotesFloating, setOpenNotesFloating] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // LeetCode-specific
  const [problemNumber, setProblemNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [lcUrl, setLcUrl] = useState('');

  // Other platforms: simple URL + Title inputs
  const [otherUrl, setOtherUrl] = useState('');
  const [otherTitle, setOtherTitle] = useState('');

  const numRef = useRef<HTMLInputElement>(null);
  const lcUrlRef = useRef<HTMLInputElement>(null);
  const otherUrlRef = useRef<HTMLInputElement>(null);
  const otherTitleRef = useRef<HTMLInputElement>(null);
  const platformBtnRef = useRef<HTMLButtonElement>(null);

  const isLeetCode = platform === 'LEETCODE';
  const isCodeforces = platform === 'CODEFORCES';
  const isCodeChef = platform === 'CODECHEF';
  const isGFG = platform === 'GFG';
  const isHackerRank = platform === 'HACKERRANK';
  const isAutoSupported = isLeetCode || isCodeforces || isCodeChef || isGFG || isHackerRank;
  const isOther = platform && !isAutoSupported;

  // For other platforms, difficulty/topic pickers are always visible once platform is picked
  const otherReady = !!isOther;

  useEffect(() => {
    if (!platform) return;
    if (isAutoSupported) setTimeout(() => numRef.current?.focus(), 20);
    else setTimeout(() => otherUrlRef.current?.focus(), 20);
  }, [platform, isAutoSupported]);

  // Global Escape key listener (captures Esc from anywhere)
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [onCancel]);

  // Global Click Outside listener (cancels draft if clicking anywhere outside NewRow or its portals)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const elements = document.querySelectorAll('[data-new-row="true"], [data-portal="true"]');
      let isInside = false;
      elements.forEach((el) => {
        if (el.contains(e.target as Node)) isInside = true;
      });
      if (!isInside) {
        onCancel();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  const executeAutoSave = async (autoData: AutoFillData, queryCode: string) => {
    if (!autoData || !platform) return;
    setSaving(true);
    setError('');
    try {
      await onSave({
        platform,
        problemNumber: autoData.problemNumber ?? (isLeetCode ? (parseInt(queryCode, 10) || 0) : 0),
        code: autoData.code ?? (isCodeforces || isCodeChef || isGFG || isHackerRank ? queryCode.trim().toUpperCase() : undefined),
        title: autoData.title,
        difficulty: (autoData.difficulty || 'EASY').toUpperCase(),
        topic: autoData.topic === 'General' ? '' : autoData.topic,
        url: autoData.url,
        notes: undefined,
        customFields: {},
        dateSolved: new Date().toISOString(),
      });
    } catch (e: any) {
      setError(e.message ?? 'Failed to save problem');
      setSaving(false);
    }
  };

  // ── Auto-supported platforms: number/code/URL → resolve ────────────────────
  const triggerResolve = async () => {
    if (loading || saving) return;
    const query = problemNumber.trim();
    if (!query) return;

    setLoading(true); setNotFound(false); setAutoFill(null); setError('');
    try {
      const endpoint = isLeetCode
        ? `/api/resolve/leetcode?id=${encodeURIComponent(query)}`
        : isCodeforces
          ? `/api/resolve/codeforces?id=${encodeURIComponent(query)}`
          : isCodeChef
            ? `/api/resolve/codechef?id=${encodeURIComponent(query)}`
            : isGFG
              ? `/api/resolve/gfg?id=${encodeURIComponent(query)}`
              : `/api/resolve/hackerrank?id=${encodeURIComponent(query)}`;
      const res = await fetch(endpoint);
      const json = await res.json();
      if (json.found) {
        setAutoFill(json.data);
        setDifficulty(json.data.difficulty);
        setTopic(json.data.topic === 'General' ? '' : json.data.topic);
        await executeAutoSave(json.data, query);
      } else {
        setNotFound(true);
        setTimeout(() => lcUrlRef.current?.focus(), 20);
      }
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  const handleNumberKey = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { onCancel(); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      await triggerResolve();
    }
  };

  // ── LeetCode / Codeforces URL fallback ────────────────────────────────
  const handleLcUrl = async (url: string) => {
    setLcUrl(url);
    if (saving) return;
    if (isLeetCode) {
      const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
      if (!match) return;
      try {
        const res = await fetch('/api/leetcode/lookup', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titleSlug: match[1] }),
        });
        const json = await res.json();
        if (!json.error) {
          setAutoFill(json);
          setDifficulty(json.difficulty);
          setTopic(json.topic === 'General' ? '' : json.topic);
          setNotFound(false);
          await executeAutoSave(json, match[1]);
        }
      } catch {}
    } else if (isCodeforces) {
      const match = url.match(/(?:problemset\/problem|contest)\/(\d+)\/(?:problem\/)?([A-Za-z0-9]+)/);
      if (!match) return;
      const cfCode = `${match[1]}${match[2]}`;
      try {
        const res = await fetch(`/api/resolve/codeforces?id=${encodeURIComponent(cfCode)}`);
        const json = await res.json();
        if (json.found) {
          setAutoFill(json.data);
          setDifficulty(json.data.difficulty);
          setTopic(json.data.topic === 'General' ? '' : json.data.topic);
          setNotFound(false);
          await executeAutoSave(json.data, cfCode);
        }
      } catch {}
    } else if (isCodeChef) {
      const match = url.match(/codechef\.com\/(?:[^/]+\/)?problems\/([A-Za-z0-9]+)/);
      if (!match) return;
      const ccCode = match[1];
      try {
        const res = await fetch(`/api/resolve/codechef?id=${encodeURIComponent(ccCode)}`);
        const json = await res.json();
        if (json.found) {
          setAutoFill(json.data);
          setDifficulty(json.data.difficulty);
          setTopic(json.data.topic === 'General' ? '' : json.data.topic);
          setNotFound(false);
          await executeAutoSave(json.data, ccCode);
        }
      } catch {}
    } else if (isGFG) {
      try {
        const res = await fetch(`/api/resolve/gfg?id=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (json.found) {
          setAutoFill(json.data);
          setDifficulty(json.data.difficulty);
          setTopic(json.data.topic === 'General' ? '' : json.data.topic);
          setNotFound(false);
          await executeAutoSave(json.data, url);
        }
      } catch {}
    } else if (isHackerRank) {
      try {
        const res = await fetch(`/api/resolve/hackerrank?id=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (json.found) {
          setAutoFill(json.data);
          setDifficulty(json.data.difficulty);
          setTopic(json.data.topic === 'General' ? '' : json.data.topic);
          setNotFound(false);
          await executeAutoSave(json.data, url);
        }
      } catch {}
    }
  };

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!platform) return;
    if (isAutoSupported && !autoFill) return;
    if (isOther && (!otherTitle || !otherUrl)) {
      setError('Title and URL are required.');
      return;
    }
    if (isOther && !difficulty) {
      setError('Please select a difficulty.');
      return;
    }
    setSaving(true); setError('');
    try {
      if (isAutoSupported && autoFill) {
        await onSave({
          platform,
          problemNumber: autoFill.problemNumber ?? (isLeetCode ? (parseInt(problemNumber, 10) || 0) : 0),
          code: autoFill.code ?? (isCodeforces || isCodeChef || isGFG || isHackerRank ? problemNumber.trim().toUpperCase() : undefined),
          title: autoFill.title,
          difficulty: difficulty || autoFill.difficulty,
          topic: topic || (autoFill.topic === 'General' ? '' : autoFill.topic),
          url: autoFill.url,
          notes: notes || undefined,
          customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
          dateSolved: new Date().toISOString(),
        });
      } else if (isOther) {
        await onSave({
          platform,
          problemNumber: 0,
          title: otherTitle,
          difficulty,
          topic,
          url: otherUrl,
          notes: notes || undefined,
          customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
          dateSolved: new Date().toISOString(),
        });
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const cellBg = flash ? 'rgba(74, 222, 128, 0.05)' : 'transparent';
  const inputStyle = {
    background: 'none', border: 'none', color: '#fff',
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: 13, outline: 'none', width: '100%', caretColor: '#ffffff',
  } as React.CSSProperties;

  const resetState = () => {
    setPlatform(null); setPlatformOpen(true);
    setAutoFill(null); setNotFound(false);
    setLcUrl(''); setProblemNumber('');
    setOtherUrl(''); setOtherTitle('');
    setDifficulty(''); setTopic('');
    setError('');
  };

  return (
    <>
      <tr data-new-row="true" style={{
        background: '#141414',
        borderBottom: '1px solid #1c1c1c',
        borderLeft: '1px solid #3a3a3a',
        height: 44,
        outline: 'none',
      }}>
        {/* Checkbox */}
        <td data-cell="checkbox" style={{ width: 36, textAlign: 'center', padding: '0 4px' }} />

        {/* Platform logo / selector */}
        <td data-cell="platform" style={{ width: 40, textAlign: 'center', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {platform ? (
              <button
                type="button"
                onClick={resetState}
                data-platform-btn
                title="Change platform"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlatformLogo platform={platform} />
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  ref={platformBtnRef}
                  type="button"
                  onClick={() => setPlatformOpen((o) => !o)}
                  data-platform-select-btn
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    background: '#1e1e20',
                    borderRadius: 4,
                    border: '1px solid #333338',
                    cursor: 'pointer',
                    color: '#888',
                    fontSize: 14,
                    lineHeight: 1,
                    padding: 0,
                  }}
                  title="Select platform"
                >
                  +
                </button>
                {platformOpen && (
                  <TopLevelPortal anchorRef={platformBtnRef} onClose={() => setPlatformOpen(false)} width={165}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {PLATFORMS.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => { setPlatform(p.value); setPlatformOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: 4,
                            color: '#ccc',
                            fontSize: 13,
                            textAlign: 'left',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#252525')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                        >
                          <PlatformLogo platform={p.value} size={20} />
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </TopLevelPortal>
                )}
              </div>
            )}
          </div>
        </td>

        {/* Title / number area */}
        <td data-cell="problem" style={{ width: 340, padding: '0 16px', transition: 'background 0.4s', background: cellBg }}>
          {!platform ? (
            <span style={{ fontSize: 13, color: '#444' }}>← Select a platform</span>
          ) : isAutoSupported ? (
            !autoFill ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: 6,
                    padding: '0 8px',
                    height: 30,
                    transition: 'border-color 0.15s',
                  }}
                >
                  <input
                    ref={numRef}
                    value={problemNumber}
                    onChange={(e) => setProblemNumber(e.target.value)}
                    onKeyDown={handleNumberKey}
                    placeholder={
                      isLeetCode
                        ? 'Problem # (e.g. 1)...'
                        : isCodeforces
                          ? 'Problem code (e.g. 4A)...'
                          : isCodeChef
                            ? 'Problem code (e.g. FLOW001)...'
                            : isGFG
                              ? 'Paste GFG problem URL...'
                              : 'Paste HackerRank URL...'
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      fontFamily: 'var(--font-geist-mono), monospace',
                      fontSize: 13,
                      outline: 'none',
                      width: '100%',
                      padding: 0,
                      caretColor: '#ffffff',
                    }}
                  />
                  {loading ? (
                    <span style={{ color: '#888', display: 'inline-flex', alignItems: 'center', marginLeft: 4 }}>
                      <Loader2 size={13} className="animate-spin" />
                    </span>
                  ) : problemNumber.trim() ? (
                    <button
                      type="button"
                      onClick={triggerResolve}
                      data-new-row-submit
                      title="Search & Add Problem"
                      style={{
                        background: '#27272a',
                        border: '1px solid #3f3f46',
                        borderRadius: 4,
                        color: '#4ade80',
                        cursor: 'pointer',
                        padding: '3px 6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 4,
                        flexShrink: 0,
                        transition: 'background 0.15s',
                      }}
                    >
                      <Search size={12} strokeWidth={2.5} />
                    </button>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={onCancel}
                  data-new-row-cancel
                  title="Cancel"
                  style={{
                    background: '#1c1c1f',
                    border: '1px solid #27272a',
                    borderRadius: 6,
                    color: '#71717a',
                    cursor: 'pointer',
                    width: 30,
                    height: 30,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'color 0.15s, background 0.15s',
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                {(() => {
                  const isLeetCodeOrCF = platform === 'LEETCODE' || platform === 'CODEFORCES';
                  const isUrl = problemNumber.startsWith('http') || problemNumber.startsWith('www.');
                  const codeDisplay = isLeetCodeOrCF && !isUrl ? (autoFill.code || problemNumber) : null;
                  return codeDisplay ? (
                    <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 13, color: '#666', flexShrink: 0 }}>
                      {codeDisplay}
                    </span>
                  ) : null;
                })()}
                <a
                  href={autoFill.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 14, color: '#e5e5e5', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {autoFill.title}
                </a>
              </div>
            )
          ) : (
            // Other platforms — title shown as hyperlink if URL is set
            otherTitle && otherUrl ? (
              <a
                href={otherUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 14, color: '#e5e5e5', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'none', display: 'block' }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                {otherTitle}
              </a>
            ) : (
              <span style={{ fontSize: 13, color: '#444' }}>Fill in URL and title below...</span>
            )
          )}
        </td>

        {/* Difficulty */}
        <td data-cell="difficulty" style={{ width: 115, padding: '0 12px', transition: 'background 0.4s', background: cellBg, position: 'relative' }}>
          {(autoFill || otherReady) && (
            <DifficultyPickerCell
              difficulty={difficulty || (autoFill?.difficulty ?? '')}
              onSave={(d) => setDifficulty(d)}
            />
          )}
        </td>

        {/* Topic */}
        <td data-cell="topic" style={{ width: 185, padding: '0 12px', transition: 'background 0.4s', background: cellBg, position: 'relative' }}>
          {(autoFill || otherReady) && (
            <TopicPickerCell
              topic={topic || (autoFill?.topic === 'General' ? '' : (autoFill?.topic ?? ''))}
              onSave={(t) => setTopic(t)}
            />
          )}
        </td>

        {/* Status */}
        <td style={{ width: 140, padding: '0 12px', color: '#555', fontSize: 13, fontFamily: 'var(--font-geist-mono), monospace' }}>—</td>
        {/* Star */}
        <td data-col="star" style={{ width: 44, textAlign: 'center' }} />
        {/* Next Revision */}
        <td data-col="next-revision" style={{ width: 140, padding: '0 12px', color: '#555', fontSize: 13, fontFamily: 'var(--font-geist-mono), monospace' }}>—</td>

        {/* Notes */}
        <td data-col="notes" style={{ width: 190, padding: '0 12px', position: 'relative' }}>
          {(autoFill || otherReady) && (
            <NewRowFloatingCell
              value={notes}
              placeholder="Notes (optional)"
              maxWidth={190}
              autoOpen={openNotesFloating}
              onChange={(val) => setNotes(val)}
              onSaveRow={handleSave}
              onCancelRow={onCancel}
            />
          )}
        </td>

        {/* Custom columns */}
        {columns.map((col) => (
          <td key={col.id} data-col="custom" style={{ width: 140, padding: '0 8px', position: 'relative' }}>
            {(autoFill || otherReady) && (
              <NewRowFloatingCell
                value={customFields[col.name] ?? ''}
                placeholder={col.name}
                maxWidth={140}
                onChange={(val) => setCustomFields((prev) => ({ ...prev, [col.name]: val }))}
                onSaveRow={handleSave}
                onCancelRow={onCancel}
              />
            )}
          </td>
        ))}

        <td data-col="custom" style={{ width: 100 }} />
      </tr>

      {/* ── LeetCode / Codeforces: number/code not found → URL fallback ── */}
      {isAutoSupported && notFound && (
        <tr data-new-row="true" style={{ background: '#141414', borderBottom: '1px solid #1c1c1c', borderLeft: '1px solid #3a3a3a' }}>
          <td colSpan={9 + columns.length} style={{ padding: '8px 68px' }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#888' }}>
                Problem &quot;{problemNumber}&quot; not found in dataset. Paste the URL to continue, or press Esc to cancel.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                ref={lcUrlRef}
                value={lcUrl}
                onChange={(e) => handleLcUrl(e.target.value)}
                placeholder={
                  isLeetCode
                    ? 'https://leetcode.com/problems/...'
                    : isCodeforces
                      ? 'https://codeforces.com/problemset/problem/...'
                      : isCodeChef
                        ? 'https://www.codechef.com/problems/...'
                        : isGFG
                          ? 'https://www.geeksforgeeks.org/problems/...'
                          : 'https://www.hackerrank.com/challenges/...'
                }
                onKeyDown={(e) => e.key === 'Escape' && onCancel()}
                style={{
                  background: 'none', border: 'none', color: '#fff',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: 12, padding: 0, outline: 'none', width: 380, caretColor: '#ffffff',
                }}
              />
              {lcUrl.trim() && (
                <button
                  type="button"
                  onClick={() => handleLcUrl(lcUrl)}
                  style={{
                    background: '#1c3a1c', border: '1px solid #2d5a2d', borderRadius: 4,
                    color: '#4ade80', cursor: 'pointer', padding: '2px 8px',
                    display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600,
                  }}
                >
                  <Search size={12} />
                  <span>Fetch</span>
                </button>
              )}
            </div>
          </td>
        </tr>
      )}

      {/* ── Other platforms: URL + Title inputs ── */}
      {isOther && (
        <tr data-new-row="true" style={{ background: '#141414', borderBottom: '1px solid #1c1c1c', borderLeft: '1px solid #3a3a3a' }}>
          <td colSpan={9 + columns.length} style={{ padding: '8px 68px' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, color: '#555', letterSpacing: '0.05em', textTransform: 'uppercase' }}>URL</span>
                <input
                  ref={otherUrlRef}
                  value={otherUrl}
                  onChange={(e) => setOtherUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') { onCancel(); return; }
                    if (e.key === 'Tab') { e.preventDefault(); otherTitleRef.current?.focus(); }
                    if (e.key === 'Enter') { otherTitleRef.current?.focus(); }
                  }}
                  placeholder={`${PLATFORMS.find(p => p.value === platform)?.label} problem URL...`}
                  style={{
                    background: 'none', border: 'none', color: '#fff',
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: 12, padding: 0, outline: 'none', width: 300, caretColor: '#ffffff',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, color: '#555', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Title</span>
                <input
                  ref={otherTitleRef}
                  value={otherTitle}
                  onChange={(e) => setOtherTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') { onCancel(); return; }
                    if (e.key === 'Enter') handleSave();
                  }}
                  placeholder="Problem title..."
                  style={{
                    background: 'none', border: 'none', color: '#fff',
                    fontFamily: 'inherit', fontSize: 13, padding: 0,
                    outline: 'none', width: 220, caretColor: '#ffffff',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleSave}
                style={{
                  background: '#1c3a1c', border: '1px solid #2d5a2d', borderRadius: 4,
                  color: '#4ade80', cursor: 'pointer', padding: '4px 10px',
                  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500,
                  alignSelf: 'flex-end', marginBottom: 2,
                }}
              >
                Save
              </button>
            </div>
            {error && <div style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>{error}</div>}
          </td>
        </tr>
      )}

      {/* ── Save / cancel hint ── */}
      {(autoFill || (isOther && (otherTitle || otherUrl))) && (
        <tr data-new-row="true" style={{ background: '#141414', borderBottom: '1px solid #1c1c1c', borderLeft: '1px solid #3a3a3a' }}>
          <td colSpan={9 + columns.length} style={{ padding: '4px 68px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, color: '#444' }}>
                <span className="hidden md:inline">Press <kbd style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, padding: '1px 5px', fontSize: 10, color: '#666' }}>Enter</kbd> to save &nbsp;
                <kbd style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3, padding: '1px 5px', fontSize: 10, color: '#666' }}>Esc</kbd> to cancel</span>
                {saving && <span style={{ color: '#ffffff', marginLeft: 8 }}>saving...</span>}
                {error && !isOther && <span style={{ color: '#f87171', marginLeft: 8 }}>{error}</span>}
              </span>
              <div className="inline-flex md:hidden items-center gap-6">
                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    background: '#1c3a1c', border: '1px solid #2d5a2d', borderRadius: 4,
                    color: '#4ade80', cursor: 'pointer', padding: '2px 8px',
                    fontSize: 11, fontWeight: 600,
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  style={{
                    background: 'none', border: 'none', color: '#888',
                    cursor: 'pointer', padding: '2px 6px', fontSize: 11,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
