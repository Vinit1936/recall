'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Check, ChevronRight, Sparkles, Layers, BookOpen } from 'lucide-react';
import { getDifficultyStyle } from '@/components/problems-table/columns';
import { getTopicColor } from '@/lib/topic-colors';
import { Pill } from '@/components/ui/pill';
import { PlatformLogo } from '@/lib/platforms/logos';

type Confidence = 'CLEAN' | 'SHAKY' | 'STRUGGLED';

type FocusDeckProps = {
  problems: any[];
  revisedIds: Set<string>;
  onRevised: (id: string) => void;
  onToast: (msg: string) => void;
  onExitFocus: () => void;
};

export function FocusDeck({ problems, revisedIds, onRevised, onToast, onExitFocus }: FocusDeckProps) {
  // Remaining unrevised problems in this deck
  const activeList = problems.filter((p) => !revisedIds.has(p.id));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingConf, setLoadingConf] = useState<Confidence | null>(null);

  const currentProblem = activeList[currentIndex] || activeList[0];

  const handleRate = async (conf: Confidence) => {
    if (!currentProblem || loadingConf) return;
    setLoadingConf(conf);
    try {
      const res = await fetch(`/api/problems/${currentProblem.id}/revise`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confidence: conf }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? 'Failed');
      }
      onRevised(currentProblem.id);
      if (currentIndex >= activeList.length - 1) {
        setCurrentIndex(0);
      }
    } catch (e: any) {
      onToast(e.message ?? 'Failed to submit revision');
    } finally {
      setLoadingConf(null);
    }
  };

  // Keyboard shortcut listener: 1 = Clean, 2 = Shaky, 3 = Struggled
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') {
        handleRate('CLEAN');
      } else if (e.key === '2') {
        handleRate('SHAKY');
      } else if (e.key === '3') {
        handleRate('STRUGGLED');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProblem, loadingConf]);

  if (!currentProblem || activeList.length === 0) {
    return null;
  }

  const totalCards = problems.length;
  const completedCards = problems.length - activeList.length;
  const progressPct = Math.round((completedCards / totalCards) * 100);

  const diffStyle = getDifficultyStyle(currentProblem.difficulty);
  const topicColor = getTopicColor(currentProblem.topic);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '12px 0' }}>
      {/* Progress & Deck Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={16} style={{ color: '#f97316' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#aaa' }}>
            Card {completedCards + 1} of {totalCards}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 140, height: 6, background: '#222', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #f97316 0%, #3b82f6 100%)',
                borderRadius: 999,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <button
            onClick={onExitFocus}
            style={{
              background: 'none',
              border: '1px solid #333',
              borderRadius: 6,
              color: '#888',
              fontSize: 12,
              padding: '4px 10px',
              cursor: 'pointer',
            }}
          >
            Exit Focus
          </button>
        </div>
      </div>

      {/* Main Focus Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentProblem.id}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'linear-gradient(180deg, #141416 0%, #0d0d0e 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 16,
            padding: '32px 36px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
            position: 'relative',
          }}
        >
          {/* Card Top Meta */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <PlatformLogo platform={currentProblem.platform ?? 'LEETCODE'} size={22} />
              {(currentProblem.platform === 'LEETCODE' || currentProblem.platform === 'CODEFORCES') && (currentProblem.problemNumber ?? 0) > 0 && (
                <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 14, color: '#888' }}>
                  #{currentProblem.problemNumber}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pill bg={diffStyle.bg} text={diffStyle.text} border={diffStyle.border}>
                {currentProblem.difficulty}
              </Pill>
              <Pill bg={topicColor.bg} text={topicColor.text} border={topicColor.border}>
                {currentProblem.topic}
              </Pill>
            </div>
          </div>

          {/* Problem Title */}
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: 24 }}>
            {currentProblem.url ? (
              <a
                href={currentProblem.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#fff', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                {currentProblem.title}
              </a>
            ) : (
              currentProblem.title
            )}
          </h2>

          {/* Solution / Link details preview */}
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10,
              padding: '16px 20px',
              marginBottom: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BookOpen size={18} style={{ color: '#60a5fa' }} />
              <span style={{ fontSize: 13, color: '#aaa' }}>Ready to review code & solution?</span>
            </div>
            {currentProblem.url && (
              <a
                href={currentProblem.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#60a5fa',
                  textDecoration: 'none',
                }}
              >
                Open Problem <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Confidence Action Buttons */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#888', textAlign: 'center', marginBottom: 12 }}>
              Rate your recall confidence (or press keys <kbd style={{ background: '#222', padding: '2px 6px', borderRadius: 4, color: '#ccc' }}>1</kbd>, <kbd style={{ background: '#222', padding: '2px 6px', borderRadius: 4, color: '#ccc' }}>2</kbd>, <kbd style={{ background: '#222', padding: '2px 6px', borderRadius: 4, color: '#ccc' }}>3</kbd>)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <button
                onClick={() => handleRate('CLEAN')}
                disabled={loadingConf !== null}
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  color: '#34d399',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.18)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)')}
              >
                <span style={{ fontSize: 15, fontWeight: 600 }}>1. Clean</span>
                <span style={{ fontSize: 11, opacity: 0.8 }}>Review in 7 days</span>
              </button>

              <button
                onClick={() => handleRate('SHAKY')}
                disabled={loadingConf !== null}
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  color: '#fbbf24',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.18)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)')}
              >
                <span style={{ fontSize: 15, fontWeight: 600 }}>2. Shaky</span>
                <span style={{ fontSize: 11, opacity: 0.8 }}>Review in 3 days</span>
              </button>

              <button
                onClick={() => handleRate('STRUGGLED')}
                disabled={loadingConf !== null}
                style={{
                  background: 'rgba(248, 113, 113, 0.08)',
                  border: '1px solid rgba(248, 113, 113, 0.25)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  color: '#f87171',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248, 113, 113, 0.18)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(248, 113, 113, 0.08)')}
              >
                <span style={{ fontSize: 15, fontWeight: 600 }}>3. Struggled</span>
                <span style={{ fontSize: 11, opacity: 0.8 }}>Review tomorrow</span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
