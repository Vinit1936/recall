'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { PlatformLogo } from '@/lib/platforms/logos';
import { getDifficultyStyle, CONF_BUTTONS } from './demo-styles';
import { getTopicColor } from '@/lib/topic-colors';
import { FakeCursor, CursorHandle } from './fake-cursor';
import { ExternalLink } from 'lucide-react';
import { Pill } from '@/components/ui/pill';

const REVISION_PROBLEMS = [
  { id: 1, platform: 'LEETCODE', number: 1850, title: 'Minimum Adjacent Swaps', difficulty: 'MEDIUM', topic: 'String' },
  { id: 2, platform: 'LEETCODE', number: 55, title: 'Jump Game', difficulty: 'MEDIUM', topic: 'General' },
  { id: 3, platform: 'CODEFORCES', number: 401, title: 'Watermelon', difficulty: 'EASY', topic: 'brute force' },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function RevisionDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<CursorHandle>(null);
  const isInView = useInView(containerRef, { amount: 0.3 });

  // Refs for buttons
  const r1CleanRef = useRef<HTMLButtonElement>(null);
  const r2ShakyRef = useRef<HTMLButtonElement>(null);
  const r3StruggledRef = useRef<HTMLButtonElement>(null);

  // States
  const [row1Badge, setRow1Badge] = useState<keyof typeof CONF_BUTTONS | null>(null);
  const [row2Badge, setRow2Badge] = useState<keyof typeof CONF_BUTTONS | null>(null);
  const [row3Badge, setRow3Badge] = useState<keyof typeof CONF_BUTTONS | null>(null);

  const [row1Hover, setRow1Hover] = useState<string | null>(null);
  const [row2Hover, setRow2Hover] = useState<string | null>(null);
  const [row3Hover, setRow3Hover] = useState<string | null>(null);

  const [row1Done, setRow1Done] = useState(false);
  const [row2Done, setRow2Done] = useState(false);
  const [row3Done, setRow3Done] = useState(false);

  const [dueCount, setDueCount] = useState(12);
  const [overdueCount, setOverdueCount] = useState(7);
  const [allDoneVisible, setAllDoneVisible] = useState(false);
  const [streakVal, setStreakVal] = useState(14);
  const [streakFlipping, setStreakFlipping] = useState(false);

  const getRelativePos = (el: HTMLElement | null) => {
    if (!el || !containerRef.current) return { x: 40, y: 200 };
    const cBox = containerRef.current.getBoundingClientRect();
    const eBox = el.getBoundingClientRect();
    return {
      x: eBox.left - cBox.left + eBox.width / 2,
      y: eBox.top - cBox.top + eBox.height / 2,
    };
  };

  const resetAll = () => {
    setRow1Badge(null);
    setRow2Badge(null);
    setRow3Badge(null);
    setRow1Hover(null);
    setRow2Hover(null);
    setRow3Hover(null);
    setRow1Done(false);
    setRow2Done(false);
    setRow3Done(false);
    setDueCount(12);
    setOverdueCount(7);
    setAllDoneVisible(false);
    setStreakVal(14);
    setStreakFlipping(false);
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

      // Move cursor to Row 1 Clean button
      const r1Pos = getRelativePos(r1CleanRef.current);
      cursorRef.current?.moveTo(r1Pos.x + 40, r1Pos.y + 30, 0);
      cursorRef.current?.show();
      await sleep(300);

      await cursorRef.current?.moveTo(r1Pos.x, r1Pos.y, 0.4);
      setRow1Hover('CLEAN');
      await sleep(300);
      if (isCancelled) return;

      // Click Clean
      await cursorRef.current?.click();
      setRow1Hover(null);
      setRow1Badge('CLEAN');
      await sleep(500);
      setRow1Done(true);
      setDueCount(11);
      setOverdueCount(6);
      await sleep(400);
      if (isCancelled) return;

      // Move cursor to Row 2 Shaky button
      const r2Pos = getRelativePos(r2ShakyRef.current);
      await cursorRef.current?.moveTo(r2Pos.x, r2Pos.y, 0.4);
      setRow2Hover('SHAKY');
      await sleep(300);
      if (isCancelled) return;

      // Click Shaky
      await cursorRef.current?.click();
      setRow2Hover(null);
      setRow2Badge('SHAKY');
      await sleep(500);
      setRow2Done(true);
      setDueCount(10);
      setOverdueCount(5);
      await sleep(400);
      if (isCancelled) return;

      // Move cursor to Row 3 Struggled button
      const r3Pos = getRelativePos(r3StruggledRef.current);
      await cursorRef.current?.moveTo(r3Pos.x, r3Pos.y, 0.4);
      setRow3Hover('STRUGGLED');
      await sleep(300);
      if (isCancelled) return;

      // Click Struggled
      await cursorRef.current?.click();
      setRow3Hover(null);
      setRow3Badge('STRUGGLED');
      await sleep(500);
      setRow3Done(true);
      setDueCount(9);
      setOverdueCount(4);
      await sleep(600);
      if (isCancelled) return;

      // Show completion & flip streak
      setAllDoneVisible(true);
      setStreakFlipping(true);
      await sleep(400);
      setStreakVal(15);
      setStreakFlipping(false);

      // Hide cursor & reset
      cursorRef.current?.hide();
      await sleep(2500);
      if (isCancelled) return;

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
        width: '100%',
        minHeight: '460px',
        background: 'var(--demo-bg)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        fontSize: '13px',
        color: 'var(--demo-text)',
        padding: '24px 28px',
        userSelect: 'none',
      }}
    >
      <FakeCursor ref={cursorRef} />

      {/* Notion-style Page Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--demo-text)', margin: 0, letterSpacing: '-0.01em' }}>
          Daily Revision
        </h1>
        <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 13, color: 'var(--demo-text-faint)' }}>
          Saturday, August 8
        </span>
      </div>

      {/* Minimal Inline Stats Strip */}
      <div style={{ marginBottom: 24 }}>
        {/* Streak Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, height: 40 }}>
          <span style={{ fontSize: 26, lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}>
            🔥
          </span>
          <div style={{ position: 'relative', height: 38, width: 48, display: 'inline-flex', alignItems: 'center', overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={streakVal}
                initial={streakFlipping ? { y: -38, opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 38, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: 34,
                  fontWeight: 700,
                  color: 'var(--demo-text)',
                  letterSpacing: '-0.03em',
                  lineHeight: '38px',
                }}
              >
                {streakVal}
              </motion.span>
            </AnimatePresence>
          </div>
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--demo-text-muted)', letterSpacing: '-0.01em', lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}>
            day streak
          </span>
        </div>

        {/* Secondary metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--demo-text-muted)' }}>
          <span>
            <strong style={{ color: 'var(--demo-text)' }}>{dueCount}</strong> due today ({overdueCount} overdue)
          </span>
          <span>·</span>
          <span>
            <strong style={{ color: 'var(--demo-text)' }}>20</strong> total problems
          </span>
          <span>·</span>
          <span>
            <strong style={{ color: 'var(--demo-text)' }}>1</strong> mastered
          </span>
        </div>
      </div>

      {/* Main Table Structure */}
      <div style={{ background: 'var(--demo-bg)', border: '1px solid var(--demo-border)', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Table Column Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px minmax(140px, 1fr) 80px 100px 220px 32px',
            alignItems: 'center',
            padding: '8px 16px',
            borderBottom: '1px solid var(--demo-border)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--demo-text-faint)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <div>#</div>
          <div>Problem Title</div>
          <div>Difficulty</div>
          <div>Topic</div>
          <div>Confidence Rating</div>
          <div style={{ textAlign: 'right' }}>Link</div>
        </div>

        {/* Content Body */}
        {!allDoneVisible ? (
          <div>
            {/* Overdue Section Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px 6px',
                fontSize: '11px',
                fontFamily: 'var(--font-geist-mono), monospace',
                color: '#f87171',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171' }} />
              OVERDUE ({overdueCount})
            </div>

            {/* Problem Rows List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence>
                {/* Row 1 */}
                {!row1Done && (
                  <motion.div
                    key="row-1"
                    initial={{ height: 44, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px minmax(140px, 1fr) 80px 100px 220px 32px',
                      alignItems: 'center',
                      padding: '0 16px',
                      borderBottom: '1px solid var(--demo-border-subtle)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Platform & Number */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PlatformLogo platform="LEETCODE" size={18} padding={1} />
                      <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 12, color: 'var(--demo-text-muted)' }}>
                        1850
                      </span>
                    </div>

                    {/* Title */}
                    <div style={{ color: 'var(--demo-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                      Minimum Adjacent Swaps
                    </div>

                    {/* Difficulty */}
                    <div>
                      <Pill
                        bg={getDifficultyStyle('MEDIUM').bg}
                        text={getDifficultyStyle('MEDIUM').text}
                        border={getDifficultyStyle('MEDIUM').border}
                      >
                        Medium
                      </Pill>
                    </div>

                    {/* Topic */}
                    <div>
                      <Pill
                        bg={getTopicColor('String').bg}
                        text={getTopicColor('String').text}
                        border={getTopicColor('String').border}
                      >
                        String
                      </Pill>
                    </div>

                    {/* Confidence Rating Buttons */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        ref={r1CleanRef}
                        style={{
                          background: row1Badge === 'CLEAN' ? 'rgba(74, 222, 128, 0.15)' : 'var(--demo-control)',
                          border: row1Badge === 'CLEAN' ? '1px solid #4ade80' : row1Hover === 'CLEAN' ? '1px solid #4ade80' : '1px solid var(--demo-control-border)',
                          color: row1Badge === 'CLEAN' || row1Hover === 'CLEAN' ? '#4ade80' : 'var(--demo-text-muted)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-geist-sans), sans-serif',
                        }}
                      >
                        {row1Badge === 'CLEAN' ? '✓ Clean' : 'Clean'}
                      </button>
                      <button
                        style={{
                          background: 'var(--demo-control)',
                          border: '1px solid var(--demo-control-border)',
                          color: 'var(--demo-text-muted)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                        }}
                      >
                        Shaky
                      </button>
                      <button
                        style={{
                          background: 'var(--demo-control)',
                          border: '1px solid var(--demo-control-border)',
                          color: 'var(--demo-text-muted)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                        }}
                      >
                        Struggled
                      </button>
                    </div>

                    {/* External Link */}
                    <div style={{ textAlign: 'right', color: 'var(--demo-text-faint)' }}>
                      <ExternalLink size={14} />
                    </div>
                  </motion.div>
                )}

                {/* Row 2 */}
                {!row2Done && (
                  <motion.div
                    key="row-2"
                    initial={{ height: 44, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px minmax(140px, 1fr) 80px 100px 220px 32px',
                      alignItems: 'center',
                      padding: '0 16px',
                      borderBottom: '1px solid var(--demo-border-subtle)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Platform & Number */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PlatformLogo platform="LEETCODE" size={18} padding={1} />
                      <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 12, color: 'var(--demo-text-muted)' }}>
                        55
                      </span>
                    </div>

                    {/* Title */}
                    <div style={{ color: 'var(--demo-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                      Jump Game
                    </div>

                    {/* Difficulty */}
                    <div>
                      <Pill
                        bg={getDifficultyStyle('MEDIUM').bg}
                        text={getDifficultyStyle('MEDIUM').text}
                        border={getDifficultyStyle('MEDIUM').border}
                      >
                        Medium
                      </Pill>
                    </div>

                    {/* Topic */}
                    <div>
                      <Pill
                        bg={getTopicColor('General').bg}
                        text={getTopicColor('General').text}
                        border={getTopicColor('General').border}
                      >
                        General
                      </Pill>
                    </div>

                    {/* Confidence Rating Buttons */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        style={{
                          background: 'var(--demo-control)',
                          border: '1px solid var(--demo-control-border)',
                          color: 'var(--demo-text-muted)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                        }}
                      >
                        Clean
                      </button>
                      <button
                        ref={r2ShakyRef}
                        style={{
                          background: row2Badge === 'SHAKY' ? 'rgba(251, 146, 60, 0.15)' : 'var(--demo-control)',
                          border: row2Badge === 'SHAKY' ? '1px solid #fb923c' : row2Hover === 'SHAKY' ? '1px solid #fb923c' : '1px solid var(--demo-control-border)',
                          color: row2Badge === 'SHAKY' || row2Hover === 'SHAKY' ? '#fb923c' : 'var(--demo-text-muted)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-geist-sans), sans-serif',
                        }}
                      >
                        {row2Badge === 'SHAKY' ? '~ Shaky' : 'Shaky'}
                      </button>
                      <button
                        style={{
                          background: 'var(--demo-control)',
                          border: '1px solid var(--demo-control-border)',
                          color: 'var(--demo-text-muted)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                        }}
                      >
                        Struggled
                      </button>
                    </div>

                    {/* External Link */}
                    <div style={{ textAlign: 'right', color: 'var(--demo-text-faint)' }}>
                      <ExternalLink size={14} />
                    </div>
                  </motion.div>
                )}

                {/* Row 3 */}
                {!row3Done && (
                  <motion.div
                    key="row-3"
                    initial={{ height: 44, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px minmax(140px, 1fr) 80px 100px 220px 32px',
                      alignItems: 'center',
                      padding: '0 16px',
                      borderBottom: '1px solid var(--demo-border-subtle)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Platform & Number */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PlatformLogo platform="CODEFORCES" size={18} padding={1} />
                      <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 12, color: 'var(--demo-text-muted)' }}>
                        401
                      </span>
                    </div>

                    {/* Title */}
                    <div style={{ color: 'var(--demo-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                      Watermelon
                    </div>

                    {/* Difficulty */}
                    <div>
                      <Pill
                        bg={getDifficultyStyle('EASY').bg}
                        text={getDifficultyStyle('EASY').text}
                        border={getDifficultyStyle('EASY').border}
                      >
                        Easy
                      </Pill>
                    </div>

                    {/* Topic */}
                    <div>
                      <Pill
                        bg={getTopicColor('brute force').bg}
                        text={getTopicColor('brute force').text}
                        border={getTopicColor('brute force').border}
                      >
                        brute force
                      </Pill>
                    </div>

                    {/* Confidence Rating Buttons */}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        style={{
                          background: 'var(--demo-control)',
                          border: '1px solid var(--demo-control-border)',
                          color: 'var(--demo-text-muted)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                        }}
                      >
                        Clean
                      </button>
                      <button
                        style={{
                          background: 'var(--demo-control)',
                          border: '1px solid var(--demo-control-border)',
                          color: 'var(--demo-text-muted)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                        }}
                      >
                        Shaky
                      </button>
                      <button
                        ref={r3StruggledRef}
                        style={{
                          background: row3Badge === 'STRUGGLED' ? 'rgba(248, 113, 113, 0.15)' : 'var(--demo-control)',
                          border: row3Badge === 'STRUGGLED' ? '1px solid #f87171' : row3Hover === 'STRUGGLED' ? '1px solid #f87171' : '1px solid var(--demo-control-border)',
                          color: row3Badge === 'STRUGGLED' || row3Hover === 'STRUGGLED' ? '#f87171' : 'var(--demo-text-muted)',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-geist-sans), sans-serif',
                        }}
                      >
                        {row3Badge === 'STRUGGLED' ? '✗ Struggled' : 'Struggled'}
                      </button>
                    </div>

                    {/* External Link */}
                    <div style={{ textAlign: 'right', color: 'var(--demo-text-faint)' }}>
                      <ExternalLink size={14} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* Completion State (All Done) */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4ade80',
                fontSize: 20,
                marginBottom: 16,
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--demo-text)', margin: '0 0 6px' }}>
              All caught up for today!
            </h3>
            <p style={{ fontSize: 13, color: 'var(--demo-text-muted)', margin: 0 }}>
              Great job maintaining your daily revision streak.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
