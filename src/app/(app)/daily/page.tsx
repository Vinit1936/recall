'use client';

import useSWR, { useSWRConfig } from 'swr';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { StatsStrip } from '@/components/daily/stats-strip';
import { NotionTableHeader } from '@/components/daily/table-header';
import { ProblemRevisionRow } from '@/components/daily/problem-row';
import { AllDone } from '@/components/daily/all-done';
import { EmptyState } from '@/components/daily/empty-state';
import { ContributionHeatmap } from '@/components/heatmap';
import { CompletedSection } from '@/components/daily/completed-section';
import { UndoToast, type UndoToastItem } from '@/components/daily/undo-toast';

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
  const revisedUrl = mounted ? `/api/problems/revised-today?before=${endOfToday.toISOString()}` : '/api/problems/revised-today';

  const { data: dueProblems, isLoading: dueLoading } = useSWR(dueUrl, fetcher);
  const { data: revisedProblems } = useSWR(revisedUrl, fetcher);
  const { data: allProblems } = useSWR('/api/problems', fetcher);
  const { data: streakData } = useSWR('/api/streak', fetcher);
  const { data: activity } = useSWR('/api/activity', fetcher);

  const [revisedIds, setRevisedIds] = useState<Set<string>>(new Set());
  const [undoToast, setUndoToast] = useState<UndoToastItem | null>(null);
  const [toast, setToast] = useState('');

  const isDailyLoading = !mounted || (dueLoading && !dueProblems);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleRevised = (problem: any, conf: 'CLEAN' | 'SHAKY' | 'STRUGGLED') => {
    setRevisedIds((prev) => new Set(prev).add(problem.id));
    setUndoToast({
      id: `${problem.id}-${Date.now()}`,
      problemId: problem.id,
      title: problem.title,
      confidence: conf,
    });
    mutate((key: any) => typeof key === 'string' && key.startsWith('/api/problems/due'));
    mutate((key: any) => typeof key === 'string' && key.startsWith('/api/problems/revised-today'));
    mutate('/api/streak');
    mutate('/api/activity');
    mutate('/api/problems');
  };

  const handleUndo = async (problemId: string) => {
    const revisedKeyMatcher = (key: any) => typeof key === 'string' && key.startsWith('/api/problems/revised-today');
    const dueKeyMatcher = (key: any) => typeof key === 'string' && key.startsWith('/api/problems/due');

    // 1. Optimistically remove from completed list immediately (0ms)
    mutate(
      revisedKeyMatcher,
      (current: any) => {
        if (!Array.isArray(current)) return current;
        return current.filter((p: any) => p.id !== problemId);
      },
      { revalidate: false }
    );

    setRevisedIds((prev) => {
      const next = new Set(prev);
      next.delete(problemId);
      return next;
    });

    if (undoToast?.problemId === problemId) {
      setUndoToast(null);
    }

    try {
      const res = await fetch(`/api/problems/${problemId}/undo-revision`, {
        method: 'POST',
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? 'Failed to undo revision');
      }

      // Revalidate in background to sync state without blocking UI
      mutate(dueKeyMatcher);
      mutate(revisedKeyMatcher);
      mutate('/api/streak');
      mutate('/api/activity');
      mutate('/api/problems');

      showToast('Revision undone');
    } catch (e: any) {
      // Rollback on error
      mutate(revisedKeyMatcher);
      mutate(dueKeyMatcher);
      showToast(e.message ?? 'Failed to undo revision');
    }
  };

  const handleChangeConfidence = async (problemId: string, newConf: 'CLEAN' | 'SHAKY' | 'STRUGGLED') => {
    const revisedKeyMatcher = (key: any) => typeof key === 'string' && key.startsWith('/api/problems/revised-today');

    // 1. Optimistic update in SWR cache immediately (0ms feedback)
    mutate(
      revisedKeyMatcher,
      (current: any) => {
        if (!Array.isArray(current)) return current;
        return current.map((p: any) => {
          if (p.id !== problemId) return p;
          return {
            ...p,
            latestRevision: {
              ...(p.latestRevision ?? {}),
              confidence: newConf,
            },
          };
        });
      },
      { revalidate: false }
    );

    showToast(`Updated status to ${newConf.charAt(0) + newConf.slice(1).toLowerCase()}`);

    try {
      const res = await fetch(`/api/problems/${problemId}/revise`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confidence: newConf, replaceLatest: true }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? 'Failed to update revision');
      }

      // Background revalidation without blocking UI
      mutate(revisedKeyMatcher);
      mutate((key: any) => typeof key === 'string' && key.startsWith('/api/problems/due'));
      mutate('/api/problems');
    } catch (e: any) {
      // Rollback on error
      mutate(revisedKeyMatcher);
      showToast(e.message ?? 'Failed to update status');
      throw e;
    }
  };

  const handleDismissToast = useCallback(() => {
    setUndoToast(null);
  }, []);

  const rawDueList = Array.isArray(dueProblems) ? dueProblems : [];
  const completedList = mounted && Array.isArray(revisedProblems) ? revisedProblems : [];
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
  const hasFinishedAll = (activeDueList.length > 0 && unrevisedDue.length === 0) || (activeDueList.length === 0 && completedList.length > 0);
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
        <span suppressHydrationWarning style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 13, color: 'var(--text-muted)' }}>
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
        todayCompleted={streakData?.todayCompleted || completedList.length > 0}
      />

      {/* Hero Questions Table Area */}
      <AnimatePresence mode="wait">
        {isDailyLoading ? (
          <div style={{ border: '1px solid var(--daily-card-border)', borderRadius: 8, background: 'var(--daily-card-bg)', overflow: 'hidden' }}>
            <NotionTableHeader />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 48, borderBottom: '1px solid var(--table-border)', background: 'var(--daily-row-skeleton)', opacity: 0.5 }} />
              ))}
            </div>
          </div>
        ) : activeDueList.length === 0 && completedList.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EmptyState />
          </motion.div>
        ) : hasFinishedAll ? (
          <AllDone key="done" streak={streak} />
        ) : (
          <motion.div
            data-daily-table
            key="table-view"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              border: '1px solid var(--daily-card-border)',
              borderRadius: 8,
              background: 'var(--daily-card-bg)',
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
                    background: 'var(--daily-header-bg)',
                    borderBottom: '1px solid var(--table-border)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-normal)',
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
                      background: 'var(--daily-section-bg)',
                      borderBottom: '1px solid var(--table-border)',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-dim)',
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

      {/* Completed Today Section */}
      {mounted && (
        <CompletedSection
          problems={completedList}
          onUndo={handleUndo}
          onChangeConfidence={handleChangeConfidence}
        />
      )}

      {/* Interactive Undo Toast */}
      {mounted && (
        <UndoToast
          toast={undoToast}
          onUndo={handleUndo}
          onDismiss={handleDismissToast}
        />
      )}

      {/* Heatmap Section */}
      <div style={{ marginTop: 40 }}>
        <ContributionHeatmap activity={Array.isArray(activity) ? activity : []} />
      </div>
    </div>
  );
}

