'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Check } from 'lucide-react';
import { getDifficultyStyle, getTopicColor, Pill } from '@/components/problems-table/columns';
import { PlatformLogo } from '@/lib/platforms/logos';

type Confidence = 'CLEAN' | 'SHAKY' | 'STRUGGLED';

type ProblemRowProps = {
  problem: any;
  onRevised: (id: string) => void;
  onToast: (msg: string) => void;
};

const CONF_BUTTONS: Record<
  Confidence,
  {
    label: string;
    hint: string;
    hoverBg: string;
    hoverBorder: string;
    hoverText: string;
    doneBg: string;
    doneText: string;
  }
> = {
  CLEAN: {
    label: 'Clean',
    hint: 'Advance',
    hoverBg: 'rgba(16, 185, 129, 0.12)',
    hoverBorder: '#10b981',
    hoverText: '#34d399',
    doneBg: 'rgba(16, 185, 129, 0.15)',
    doneText: '#34d399',
  },
  SHAKY: {
    label: 'Shaky',
    hint: 'Repeat',
    hoverBg: 'rgba(245, 158, 11, 0.12)',
    hoverBorder: '#f59e0b',
    hoverText: '#fbbf24',
    doneBg: 'rgba(245, 158, 11, 0.15)',
    doneText: '#fbbf24',
  },
  STRUGGLED: {
    label: 'Struggled',
    hint: 'Reset',
    hoverBg: 'rgba(248, 113, 113, 0.12)',
    hoverBorder: '#f87171',
    hoverText: '#f87171',
    doneBg: 'rgba(248, 113, 113, 0.15)',
    doneText: '#f87171',
  },
};

export function ProblemRevisionRow({ problem, onRevised, onToast }: ProblemRowProps) {
  const [done, setDone] = useState(false);
  const [chosenConf, setChosenConf] = useState<Confidence | null>(null);
  const [loadingConf, setLoadingConf] = useState<Confidence | null>(null);
  const [hovered, setHovered] = useState(false);

  const diffStyle = getDifficultyStyle(problem.difficulty);
  const topicColor = getTopicColor(problem.topic);

  const handleConfidence = async (conf: Confidence) => {
    setLoadingConf(conf);
    try {
      const res = await fetch(`/api/problems/${problem.id}/revise`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confidence: conf }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? 'Failed');
      }
      setChosenConf(conf);
      setDone(true);
      onRevised(problem.id);
    } catch (e: any) {
      onToast(e.message ?? 'Failed to submit revision');
    } finally {
      setLoadingConf(null);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '70px minmax(180px, 1fr) 95px 125px 220px 32px',
        alignItems: 'center',
        height: 48,
        padding: '0 16px',
        background: done ? 'var(--secondary)' : hovered ? 'var(--accent)' : 'var(--card)',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.12s ease',
      }}
    >
      {/* 1. ID / Number */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <PlatformLogo platform={problem.platform ?? 'LEETCODE'} size={19} padding={1} />
        {(problem.platform === 'LEETCODE' || problem.platform === 'CODEFORCES') && (problem.problemNumber ?? 0) > 0 && (
          <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 12, color: 'var(--muted-foreground)' }}>
            {problem.problemNumber}
          </span>
        )}
      </div>

      {/* 2. Title */}
      <div style={{ paddingRight: 12, overflow: 'hidden' }}>
        {problem.url ? (
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            title={problem.title}
            style={{
              fontSize: 13.5,
              fontWeight: done ? 400 : 500,
              color: done ? 'var(--muted-foreground)' : 'var(--foreground)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              textDecoration: done ? 'line-through' : hovered ? 'underline' : 'none',
              cursor: 'pointer',
            }}
          >
            {problem.title}
          </a>
        ) : (
          <span
            style={{
              fontSize: 13.5,
              fontWeight: done ? 400 : 500,
              color: done ? 'var(--muted-foreground)' : 'var(--foreground)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              textDecoration: done ? 'line-through' : 'none',
            }}
            title={problem.title}
          >
            {problem.title}
          </span>
        )}
      </div>

      {/* 3. Difficulty */}
      <div>
        <Pill bg={diffStyle.bg} text={diffStyle.text} border={diffStyle.border}>
          {problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()}
        </Pill>
      </div>

      {/* 4. Topic */}
      <div>
        <Pill bg={topicColor.bg} text={topicColor.text} border={topicColor.border}>
          {problem.topic}
        </Pill>
      </div>

      {/* 5. Tactile Action Buttons */}
      <div>
        <AnimatePresence mode="wait">
          {done && chosenConf ? (
            <motion.span
              key="done-badge"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: CONF_BUTTONS[chosenConf].doneBg,
                color: CONF_BUTTONS[chosenConf].doneText,
                border: `1px solid ${CONF_BUTTONS[chosenConf].doneText}40`,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                padding: '3px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Check size={12} /> {CONF_BUTTONS[chosenConf].label}
            </motion.span>
          ) : (
            <motion.div
              key="conf-buttons"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: 6, alignItems: 'center' }}
            >
              {(['CLEAN', 'SHAKY', 'STRUGGLED'] as Confidence[]).map((conf) => {
                const confCfg = CONF_BUTTONS[conf];
                return (
                  <button
                    key={conf}
                    onClick={() => handleConfidence(conf)}
                    disabled={loadingConf !== null}
                    style={{
                      background: 'var(--secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 6,
                      color: loadingConf === conf ? 'var(--muted-foreground)' : 'var(--foreground)',
                      cursor: loadingConf !== null ? 'not-allowed' : 'pointer',
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '4px 10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                      transition: 'all 0.12s ease-in-out',
                    }}
                    onMouseEnter={(e) => {
                      if (loadingConf === null) {
                        e.currentTarget.style.background = confCfg.hoverBg;
                        e.currentTarget.style.borderColor = confCfg.hoverBorder;
                        e.currentTarget.style.color = confCfg.hoverText;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (loadingConf === null) {
                        e.currentTarget.style.background = 'var(--secondary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--foreground)';
                      }
                    }}
                  >
                    {loadingConf === conf ? '…' : confCfg.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 6. Link */}
      <div style={{ textAlign: 'right' }}>
        {problem.url && (
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open problem in new tab"
            style={{
              color: 'var(--muted-foreground)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              borderRadius: 4,
              transition: 'color 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}


