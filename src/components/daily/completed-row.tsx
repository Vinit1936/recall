'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Check, RotateCcw, ChevronDown } from 'lucide-react';
import { getDifficultyStyle } from '@/components/problems-table/columns';
import { getTopicColor } from '@/lib/topic-colors';
import { Pill } from '@/components/ui/pill';
import { PlatformLogo } from '@/lib/platforms/logos';

type Confidence = 'CLEAN' | 'SHAKY' | 'STRUGGLED';

export type ProblemCompletedItem = {
  id: string;
  title: string;
  problemNumber?: number | null;
  platform?: string | null;
  difficulty: string;
  topic: string;
  url?: string | null;
  latestRevision?: {
    id: string;
    confidence: Confidence;
    type?: string;
  } | null;
};

type CompletedRowProps = {
  problem: ProblemCompletedItem;
  onUndo: (id: string) => Promise<void>;
  onChangeConfidence: (id: string, conf: Confidence) => Promise<void>;
};

const CONF_BUTTONS: Record<
  Confidence,
  {
    label: string;
    hint: string;
    hoverBg: string;
    hoverBorder: string;
    hoverText: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
  }
> = {
  CLEAN: {
    label: 'Clean',
    hint: 'Advance',
    hoverBg: 'rgba(16, 185, 129, 0.12)',
    hoverBorder: '#10b981',
    hoverText: '#34d399',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    badgeText: '#34d399',
    badgeBorder: 'rgba(16, 185, 129, 0.3)',
  },
  SHAKY: {
    label: 'Shaky',
    hint: 'Repeat',
    hoverBg: 'rgba(245, 158, 11, 0.12)',
    hoverBorder: '#f59e0b',
    hoverText: '#fbbf24',
    badgeBg: 'rgba(245, 158, 11, 0.14)',
    badgeText: '#fbbf24',
    badgeBorder: 'rgba(245, 158, 11, 0.3)',
  },
  STRUGGLED: {
    label: 'Struggled',
    hint: 'Reset',
    hoverBg: 'rgba(248, 113, 113, 0.12)',
    hoverBorder: '#f87171',
    hoverText: '#f87171',
    badgeBg: 'rgba(248, 113, 113, 0.14)',
    badgeText: '#f87171',
    badgeBorder: 'rgba(248, 113, 113, 0.3)',
  },
};

export function CompletedRow({ problem, onUndo, onChangeConfidence }: CompletedRowProps) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticConf, setOptimisticConf] = useState<Confidence | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const diffStyle = getDifficultyStyle(problem.difficulty);
  const topicColor = getTopicColor(problem.topic);
  const serverConf: Confidence = problem.latestRevision?.confidence ?? 'CLEAN';

  // Synchronize optimistic state whenever problem server props update
  useEffect(() => {
    setOptimisticConf(null);
  }, [serverConf]);

  const currentConf: Confidence = optimisticConf ?? serverConf;
  const confCfg = CONF_BUTTONS[currentConf] || CONF_BUTTONS.CLEAN;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleUndo = async () => {
    if (isUndoing || isUpdating) return;
    setIsUndoing(true);
    try {
      await onUndo(problem.id);
    } finally {
      setIsUndoing(false);
    }
  };

  const handleSelectConfidence = async (newConf: Confidence) => {
    if (newConf === currentConf || isUpdating || isUndoing) {
      setMenuOpen(false);
      return;
    }
    const previousConf = currentConf;
    // 1. Immediately close dropdown menu and update badge (0ms response)
    setMenuOpen(false);
    setOptimisticConf(newConf);
    setIsUpdating(true);

    try {
      await onChangeConfidence(problem.id, newConf);
    } catch {
      // Revert if API failed
      setOptimisticConf(previousConf);
    } finally {
      setIsUpdating(false);
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
        background: hovered ? 'var(--input-bg)' : 'var(--daily-card-bg)',
        borderBottom: '1px solid var(--table-border)',
        transition: 'background 0.12s ease',
        position: 'relative',
        zIndex: menuOpen ? 50 : 1,
      }}
    >
      {/* 1. ID / Number */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <PlatformLogo platform={problem.platform ?? 'LEETCODE'} size={19} padding={1} />
        {(problem.platform === 'LEETCODE' || problem.platform === 'CODEFORCES') && (problem.problemNumber ?? 0) > 0 && (
          <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: 12, color: 'var(--text-dim)' }}>
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
              fontWeight: 500,
              color: 'var(--text-strong)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
              textDecoration: hovered ? 'underline' : 'none',
              cursor: 'pointer',
            }}
          >
            {problem.title}
          </a>
        ) : (
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              color: 'var(--text-strong)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
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

      {/* 5. Status Badge + Change Status Popover + Undo Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: menuOpen ? 60 : 1 }} ref={menuRef}>
        {/* Status Dropdown Trigger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          disabled={isUpdating || isUndoing}
          title="Click to change revision status"
          style={{
            background: confCfg.badgeBg,
            color: confCfg.badgeText,
            border: `1px solid ${confCfg.badgeBorder}`,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            padding: '3px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            transition: 'all 0.12s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'none';
          }}
        >
          <Check size={12} strokeWidth={2.5} />
          <span>{confCfg.label}</span>
          <ChevronDown size={11} style={{ opacity: 0.7 }} />
        </button>

        {/* Change Confidence Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                zIndex: 1000,
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 4,
                boxShadow: 'var(--shadow-popover)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minWidth: 140,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-subtle)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Change Status
              </div>
              {(['CLEAN', 'SHAKY', 'STRUGGLED'] as Confidence[]).map((c) => {
                const cfg = CONF_BUTTONS[c];
                const isSelected = c === currentConf;
                return (
                  <button
                    key={c}
                    onClick={() => handleSelectConfidence(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      borderRadius: 5,
                      background: isSelected ? 'var(--accent)' : 'transparent',
                      color: isSelected ? cfg.badgeText : 'var(--text-normal)',
                      border: 'none',
                      fontSize: 12,
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: cfg.badgeText,
                        }}
                      />
                      {cfg.label}
                    </span>
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Undo Action Button */}
        <button
          onClick={handleUndo}
          disabled={isUndoing || isUpdating}
          title="Undo this revision (returns question to pending list)"
          style={{
            background: 'var(--popover)',
            border: '1px solid var(--input-border)',
            borderRadius: 6,
            color: isUndoing ? 'var(--text-subtle)' : 'var(--text-normal)',
            cursor: isUndoing ? 'not-allowed' : 'pointer',
            fontSize: 12,
            fontWeight: 500,
            padding: '3px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: 'var(--shadow-popover)',
            transition: 'all 0.12s ease-in-out',
          }}
          onMouseEnter={(e) => {
            if (!isUndoing && !isUpdating) {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.borderColor = 'var(--text-muted)';
              e.currentTarget.style.color = 'var(--foreground)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isUndoing && !isUpdating) {
              e.currentTarget.style.background = 'var(--popover)';
              e.currentTarget.style.borderColor = 'var(--input-border)';
              e.currentTarget.style.color = 'var(--text-normal)';
            }
          }}
        >
          <RotateCcw size={11} className={isUndoing ? 'animate-spin' : ''} />
          <span>{isUndoing ? 'Undoing...' : 'Undo'}</span>
        </button>
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
              color: 'var(--text-subtle)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              borderRadius: 4,
              transition: 'color 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
