'use client';

import { useState, useEffect } from 'react';

type StatsStripProps = {
  streak: number;
  totalProblems: number;
  masteredCount: number;
  dueCount: number;
  overdueCount?: number;
  todayCompleted?: boolean;
};

export function StatsStrip({
  streak,
  totalProblems,
  masteredCount,
  dueCount,
  overdueCount = 0,
  todayCompleted = false,
}: StatsStripProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayStreak = mounted ? streak : 0;
  const displayTotal = mounted ? totalProblems : 0;
  const displayMastered = mounted ? masteredCount : 0;
  const displayDue = mounted ? dueCount : 0;
  const displayOverdue = mounted ? overdueCount : 0;
  const isFlameLit = mounted && (streak > 0 || todayCompleted);

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Minimalist Hero Streak Display */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 28, filter: isFlameLit ? 'none' : 'grayscale(1) opacity(0.4)', transition: 'filter 0.2s' }}>
          🔥
        </span>
        <span
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 38,
            fontWeight: 700,
            color: 'var(--foreground)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          {displayStreak}
        </span>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--muted-foreground)', letterSpacing: '-0.01em' }}>
          {displayStreak === 1 ? 'day streak' : 'day streak'}
        </span>
      </div>

      {/* Clean secondary inline metadata */}
      <div data-stats-strip style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--muted-foreground)' }}>
        <span>
          <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontWeight: 600, color: 'var(--foreground)' }}>
            {displayDue}
          </span>{' '}
          due today {displayOverdue > 0 && <span style={{ color: 'var(--muted-foreground)' }}>({displayOverdue} overdue)</span>}
        </span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span>
          <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontWeight: 600, color: 'var(--foreground)' }}>
            {displayTotal}
          </span>{' '}
          total problems
        </span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span>
          <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontWeight: 600, color: 'var(--foreground)' }}>
            {displayMastered}
          </span>{' '}
          mastered
        </span>
      </div>
    </div>
  );
}





