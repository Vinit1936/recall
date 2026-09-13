'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { PlatformLogo } from '@/lib/platforms/logos';
import { getTopicColor, getDifficultyStyle } from './demo-styles';
import { FakeCursor, CursorHandle } from './fake-cursor';

const INITIAL_PROBLEMS = [
  { id: 1, platform: 'CODEFORCES', number: '187', title: 'Target Practice', difficulty: 'EASY', topic: 'implementation', status: 'Clean', notes: 'two pointer', statusColor: '#4ade80', textColor: '#4ade80' },
  { id: 2, platform: 'CODECHEF', number: '21', title: 'Triple Xor', difficulty: 'EASY', topic: 'Bitwise', status: 'Shaky', notes: 'bit manip', statusColor: '#fb923c', textColor: '#fb923c' },
  { id: 3, platform: 'HACKERRANK', number: '474', title: 'Luck Balance', difficulty: 'EASY', topic: 'Greedy', status: 'Struggled', notes: 'sorting', statusColor: '#f87171', textColor: '#f87171' },
  { id: 4, platform: 'GFG', number: '170', title: 'Nth Fibonacci', difficulty: 'MEDIUM', topic: 'DP', status: 'Mastered', notes: 'dp memo', statusColor: '#a855f7', textColor: '#c084fc' },
  { id: 5, platform: 'LEETCODE', number: '66', title: 'Plus One', difficulty: 'EASY', topic: 'Array', status: 'Clean', notes: 'math carry', statusColor: '#4ade80', textColor: '#4ade80' },
];

const PLATFORMS_LIST = [
  { id: 'LEETCODE', label: 'LeetCode' },
  { id: 'CODEFORCES', label: 'Codeforces' },
  { id: 'GFG', label: 'GeeksForGeeks' },
  { id: 'HACKERRANK', label: 'HackerRank' },
  { id: 'CODECHEF', label: 'CodeChef' },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function TableDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<CursorHandle>(null);
  const isInView = useInView(containerRef, { amount: 0.3 });

  // Refs for cursor targets
  const newRowTriggerRef = useRef<HTMLDivElement>(null);
  const leetCodeOptionRef = useRef<HTMLDivElement>(null);
  const inputCellRef = useRef<HTMLDivElement>(null);
  const notesCellRef = useRef<HTMLDivElement>(null);

  // Demo animation states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  const [newRowActive, setNewRowActive] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTypingNumber, setIsTypingNumber] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const [greenFlash, setGreenFlash] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [isTypingNotes, setIsTypingNotes] = useState(false);
  const [rowFinalized, setRowFinalized] = useState(false);

  const getRelativePos = (el: HTMLElement | null) => {
    if (!el || !containerRef.current) return { x: 40, y: 350 };
    const cBox = containerRef.current.getBoundingClientRect();
    const eBox = el.getBoundingClientRect();
    return {
      x: eBox.left - cBox.left + eBox.width / 2 + 25,
      y: eBox.top - cBox.top + eBox.height / 2 + 25,
    };
  };

  const resetAll = () => {
    setDropdownOpen(false);
    setHoveredPlatform(null);
    setNewRowActive(false);
    setSelectedPlatform(null);
    setInputValue('');
    setIsTypingNumber(false);
    setIsLoading(false);
    setAutoFilled(false);
    setGreenFlash(false);
    setNotesValue('');
    setIsTypingNotes(false);
    setRowFinalized(false);
    cursorRef.current?.hide();
  };

  useEffect(() => {
    if (!isInView) {
      resetAll();
      return;
    }

    let isCancelled = false;

    const runSequence = async () => {
      resetAll();
      await sleep(800);
      if (isCancelled) return;

      // t=800ms: cursor fades in near "+ Select a platform"
      const trigPos = getRelativePos(newRowTriggerRef.current);
      cursorRef.current?.moveTo(trigPos.x + 30, trigPos.y + 40, 0);
      cursorRef.current?.show();
      await sleep(300);
      if (isCancelled) return;

      // t=1100ms: move cursor to + platform trigger
      await cursorRef.current?.moveTo(trigPos.x, trigPos.y, 0.4);
      await sleep(300);
      if (isCancelled) return;

      // t=1500ms: click + platform trigger -> dropdown opens
      await cursorRef.current?.click();
      setDropdownOpen(true);
      setNewRowActive(true);
      await sleep(400);
      if (isCancelled) return;

      // t=1900ms: move cursor to LeetCode option in dropdown
      const lcPos = getRelativePos(leetCodeOptionRef.current);
      await cursorRef.current?.moveTo(lcPos.x, lcPos.y, 0.35);
      setHoveredPlatform('LEETCODE');
      await sleep(350);
      if (isCancelled) return;

      // t=2300ms: click LeetCode option -> dropdown closes, LC logo appears
      await cursorRef.current?.click();
      setHoveredPlatform(null);
      setDropdownOpen(false);
      setSelectedPlatform('LEETCODE');
      await sleep(400);
      if (isCancelled) return;

      // t=2700ms: move cursor to input cell
      const inputPos = getRelativePos(inputCellRef.current);
      await cursorRef.current?.moveTo(inputPos.x + 20, inputPos.y, 0.3);
      await sleep(300);
      if (isCancelled) return;

      // t=3000ms: click input cell -> text cursor blinks
      await cursorRef.current?.click();
      setIsTypingNumber(true);
      await sleep(150);

      // Type "234"
      setInputValue('2');
      await sleep(150);
      setInputValue('23');
      await sleep(150);
      setInputValue('234');
      await sleep(150);

      // t=3600ms: loading dots appear
      setIsTypingNumber(false);
      setIsLoading(true);
      await sleep(400);
      if (isCancelled) return;

      // t=4000ms: title & pills auto-fill, green flash overlay
      setIsLoading(false);
      setAutoFilled(true);
      setGreenFlash(true);
      await sleep(650);
      setGreenFlash(false);
      if (isCancelled) return;

      // t=4800ms: move cursor to Notes cell
      const notesPos = getRelativePos(notesCellRef.current);
      await cursorRef.current?.moveTo(notesPos.x, notesPos.y, 0.4);
      await sleep(400);
      if (isCancelled) return;

      // t=5300ms: click notes cell -> type "two pointer"
      await cursorRef.current?.click();
      setIsTypingNotes(true);
      await sleep(200);

      const noteText = 'two pointer';
      for (let i = 1; i <= noteText.length; i++) {
        if (isCancelled) return;
        setNotesValue(noteText.slice(0, i));
        await sleep(140);
      }
      setIsTypingNotes(false);
      await sleep(500);
      if (isCancelled) return;

      // t=7500ms: cursor moves away, row finalizes
      setRowFinalized(true);
      const awayPos = { x: notesPos.x + 100, y: notesPos.y + 40 };
      await cursorRef.current?.moveTo(awayPos.x, awayPos.y, 0.4);
      await sleep(400);

      // t=8000ms: cursor fades out
      cursorRef.current?.hide();
      await sleep(1200);
      if (isCancelled) return;

      // t=9200ms: new row resets and sequence loops
      resetAll();
      await sleep(600);

      if (!isCancelled) {
        runSequence();
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
    };
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '480px',
        width: '100%',
        background: 'var(--demo-bg)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        fontSize: '13px',
        color: 'var(--demo-text)',
        userSelect: 'none',
      }}
    >
      <FakeCursor ref={cursorRef} />

      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px minmax(220px, 1fr) 85px 120px 110px 80px',
          height: '34px',
          alignItems: 'center',
          padding: '0 16px',
          background: 'var(--demo-surface)',
          borderBottom: '1px solid var(--demo-border)',
          fontSize: '11px',
          fontFamily: 'var(--font-geist-mono), monospace',
          color: 'var(--demo-text-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <div style={{ textAlign: 'center' }}>Plat</div>
        <div>Problem</div>
        <div>Diff</div>
        <div>Topic</div>
        <div>Status</div>
        <div style={{ textAlign: 'right' }}>Revision</div>
      </div>

      {/* Rows List */}
      <div>
        {INITIAL_PROBLEMS.map((prob) => {
          const diff = getDifficultyStyle(prob.difficulty);
          const topic = prob.topic ? getTopicColor(prob.topic) : null;

          return (
            <div
              key={prob.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px minmax(220px, 1fr) 85px 120px 110px 80px',
                height: '44px',
                alignItems: 'center',
                padding: '0 16px',
                background: 'var(--demo-bg)',
                borderBottom: '1px solid var(--demo-border-subtle)',
              }}
            >
              {/* Platform Logo */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PlatformLogo platform={prob.platform} size={18} padding={1} />
              </div>

              {/* Number + Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {prob.number && (
                  <span style={{ fontFamily: 'var(--font-geist-mono), monospace', color: 'var(--demo-text-faint)', fontSize: '12px' }}>
                    {prob.number}
                  </span>
                )}
                <span style={{ color: 'var(--demo-text)', fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {prob.title}
                </span>
              </div>

              {/* Difficulty */}
              <div>
                <span
                  style={{
                    background: diff.bg,
                    color: diff.text,
                    border: `1px solid ${diff.border}`,
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  {prob.difficulty.charAt(0) + prob.difficulty.slice(1).toLowerCase()}
                </span>
              </div>

              {/* Topic */}
              <div>
                {topic ? (
                  <span
                    style={{
                      background: topic.bg,
                      color: topic.text,
                      border: `1px solid ${topic.border}`,
                      borderRadius: '4px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                  >
                    {prob.topic}
                  </span>
                ) : (
                  <span style={{ color: 'var(--demo-placeholder)', fontSize: '12px' }}>—</span>
                )}
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: prob.statusColor }} />
                <span style={{ fontSize: '12px', color: prob.textColor || 'var(--demo-text-muted)', fontWeight: 500 }}>
                  {prob.status}
                </span>
              </div>

              {/* Notes */}
              <div
                style={{
                  textAlign: 'right',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  color: 'var(--demo-text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {prob.notes || '—'}
              </div>
            </div>
          );
        })}

        {/* New Row / Platform Dropdown Demo */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '40px minmax(220px, 1fr) 85px 120px 110px 80px',
              height: '44px',
              alignItems: 'center',
              padding: '0 16px',
              background: rowFinalized ? 'var(--demo-bg)' : newRowActive ? 'var(--demo-surface-raised)' : 'var(--demo-bg)',
              borderBottom: '1px solid var(--demo-border-subtle)',
              borderLeft: newRowActive && !rowFinalized ? '2px solid var(--demo-control-border)' : 'none',
              position: 'relative',
            }}
          >
            {/* Green Overlay Flash on auto fill */}
            <AnimatePresence>
              {greenFlash && (
                <motion.div
                  initial={{ opacity: 0.18 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#22c55e',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </AnimatePresence>

            {/* Platform Selector Trigger */}
            <div style={{ display: 'flex', justifyContent: 'center' }} ref={newRowTriggerRef}>
              {selectedPlatform ? (
                <PlatformLogo platform={selectedPlatform} size={18} padding={1} />
              ) : (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    background: 'var(--demo-control)',
                    border: '1px solid var(--demo-control-border)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--demo-text-muted)',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  +
                </div>
              )}
            </div>

            {/* Title / Input area */}
            <div ref={inputCellRef} style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              {!selectedPlatform ? (
                <span style={{ fontSize: '13px', color: 'var(--demo-placeholder)' }}>← Select a platform</span>
              ) : !autoFilled ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '13px', color: inputValue ? 'var(--demo-text)' : 'var(--demo-text-faint)' }}>
                    {inputValue || 'Problem number (e.g. 1)...'}
                    {isTypingNumber && (
                      <span style={{ display: 'inline-block', width: '2px', height: '12px', background: 'var(--demo-text)', marginLeft: '2px' }} />
                    )}
                  </span>
                  {isLoading && <span style={{ color: 'var(--demo-text-faint)', fontSize: '12px', letterSpacing: '2px' }}>...</span>}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <span style={{ fontFamily: 'var(--font-geist-mono), monospace', color: 'var(--demo-text-faint)', fontSize: '12px' }}>
                    #234
                  </span>
                  <span style={{ color: 'var(--demo-text)', fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Palindrome Linked List
                  </span>
                </div>
              )}
            </div>

            {/* Difficulty */}
            <div>
              {autoFilled && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: 'var(--easy-bg)',
                    color: 'var(--easy-text)',
                    border: '1px solid var(--easy-border)',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  Easy
                </motion.span>
              )}
            </div>

            {/* Topic */}
            <div>
              {autoFilled && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: getTopicColor('Linked List').bg,
                    color: getTopicColor('Linked List').text,
                    border: `1px solid ${getTopicColor('Linked List').border}`,
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                >
                  Linked List
                </motion.span>
              )}
            </div>

            {/* Status */}
            <div>
              {autoFilled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--demo-text-faint)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--demo-text-muted)' }}>Not started</span>
                </div>
              )}
            </div>

            {/* Revision / Notes */}
            <div ref={notesCellRef} style={{ textAlign: 'right' }}>
              {notesValue || isTypingNotes ? (
                <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '12px', color: 'var(--demo-text-muted)' }}>
                  {notesValue}
                </span>
              ) : autoFilled ? (
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-geist-mono), monospace', color: '#f87171' }}>1d</span>
              ) : null}
            </div>
          </div>

          {/* Real Platform Dropdown Card (matching real app screenshot 1:1) */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '12px',
                  zIndex: 200,
                  width: '165px',
                  background: 'var(--demo-dropdown)',
                  border: '1px solid var(--demo-dropdown-border)',
                  borderRadius: '8px',
                  padding: '6px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.85)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {PLATFORMS_LIST.map((p) => {
                  const isHovered = hoveredPlatform === p.id;
                  return (
                    <div
                      key={p.id}
                      ref={p.id === 'LEETCODE' ? leetCodeOptionRef : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        background: isHovered ? 'var(--demo-surface-hover)' : 'transparent',
                        color: isHovered ? 'var(--demo-text)' : 'var(--demo-text-muted)',
                        fontSize: '13px',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      <PlatformLogo platform={p.id} size={18} padding={1} />
                      {p.label}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
