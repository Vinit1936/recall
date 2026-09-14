'use client';

import useSWR, { useSWRConfig } from 'swr';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { StatsStrip } from '@/components/daily/stats-strip';
import { NotionTableHeader } from '@/components/daily/table-header';
import { ProblemRevisionRow } from '@/components/daily/problem-row';
import { AllDone } from '@/components/daily/all-done';
import { EmptyState } from '@/components/daily/empty-state';
import { ContributionHeatmap } from '@/components/heatmap';

import { fetcher } from '@/lib/fetcher';

export default function DailyRevisionPage() {
  const { mutate } = useSWRConfig();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  const dueUrl = mounted ? `/api/problems/due?before=${endOfToday.toISOString()}` : '/api/problems/due';
  const { data: dueProblems, isLoading: dueLoading } = useSWR(dueUrl, fetcher);
  const { data: allProblems } = useSWR('/api/problems', fetcher);
  const { data: streakData } = useSWR('/api/streak', fetcher);
  const { data: activity } = useSWR('/api/activity', fetcher);

  const [revisedIds, setRevisedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');

  const isDailyLoading = !mounted || (dueLoading && !dueProblems);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleRevised = (id: string) => {
    setRevisedIds((prev) => new Set(prev).add(id));
    mutate((key: any) => typeof key === 'string' && key.startsWith('/api/problems/due'));
    mutate('/api/streak');
    mutate('/api/activity');
    mutate('/api/problems');
  };

  const rawDueList = Array.isArray(dueProblems) ? dueProblems : [];
  const allList = Array.isArray(allProblems) ? allProblems : [];

  // Overdue: strictly before today's start
  const overdue = rawDueList.filter((p: any) => new Date(p.nextRevisionAt) < todayMidnight);
  // Due Today: between today's start and today's end (never includes tomorrow)
  const dueToday = rawDueList.filter((p: any) => {
    const d = new Date(p.nextRevisionAt);
    return d >= todayMidnight && d <= endOfToday;
  });

  const activeDueList = [...overdue, ...dueToday];
  const totalProblems = allList.length;
  const masteredCount = allList.filter((p: any) => p.status === 'MASTERED').length;
  const dueCount = activeDueList.length;
  const streak = streakData?.currentStreak ?? 0;

  const unrevisedDue = activeDueList.filter((p: any) => !revisedIds.has(p.id));
  const allDone = activeDueList.length > 0 && unrevisedDue.length === 0;
  const dateLabel = format(today, 'EEEE, MMMM d');

  return (
    <div style={{ maxWidth: 1150, margin: '0 auto', paddingBottom: 48 }}>
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'var(--popover)',
            border: '1px solid var(--error-border)',
            borderRadius: 6,
            color: 'var(--error)',
            fontSize: 13,
            fontWeight: 500,
            padding: '8px 16px',
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {toast}
        </div>
      )}

      {/* Notion-style Page Header */}
      <div data-daily-header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--foreground)', margin: 0, letterSpacing: '-0.01em' }}>
          Daily Revision
        </h1>
        <span suppressHydrationWarning style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 13, color: 'var(--muted-foreground)' }}>
          {dateLabel}
        </span>
      </div>

      {/* Minimal Inline Metadata Strip */}
      <StatsStrip
        streak={streak}
        totalProblems={totalProblems}
        masteredCount={masteredCount}
        dueCount={dueCount}
        overdueCount={overdue.length}
        todayCompleted={streakData?.todayCompleted}
      />

      {/* Hero Questions Table Area */}
      <AnimatePresence mode="wait">
        {isDailyLoading ? (
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, background: 'var(--card)', overflow: 'hidden' }}>
            <NotionTableHeader />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 48, borderBottom: '1px solid var(--border)', background: 'var(--accent)', opacity: 0.5 }} />
              ))}
            </div>
          </div>
        ) : activeDueList.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyState />
          </motion.div>
        ) : allDone ? (
          <AllDone key="done" streak={streak} />
        ) : (
          <motion.div
            data-daily-table
            key="table-view"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--card)',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            <NotionTableHeader />

            {/* Overdue Section */}
            {overdue.length > 0 && (
              <div>
                <div
                  style={{
                    padding: '7px 16px',
                    background: 'var(--accent)',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#f87171', opacity: 0.8 }} />
                  Overdue ({overdue.length})
                </div>

                {overdue.map((p: any) => (
                  <ProblemRevisionRow key={p.id} problem={p} onRevised={handleRevised} onToast={showToast} />
                ))}
              </div>
            )}

            {/* Due Today Section */}
            {dueToday.length > 0 && (
              <div>
                {overdue.length > 0 && (
                  <div
                    style={{
                      padding: '8px 16px',
                      background: 'var(--accent)',
                      borderBottom: '1px solid var(--border)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--muted-foreground)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Due Today ({dueToday.length})
                  </div>
                )}
                {dueToday.map((p: any) => (
                  <ProblemRevisionRow key={p.id} problem={p} onRevised={handleRevised} onToast={showToast} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heatmap Section */}
      <div style={{ marginTop: 40 }}>
        <ContributionHeatmap activity={Array.isArray(activity) ? activity : []} />
      </div>
    </div>
  );
}

