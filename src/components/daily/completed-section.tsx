'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { CompletedRow, type ProblemCompletedItem } from './completed-row';
import { NotionTableHeader } from './table-header';

type Confidence = 'CLEAN' | 'SHAKY' | 'STRUGGLED';

type CompletedSectionProps = {
  problems: ProblemCompletedItem[];
  onUndo: (id: string) => Promise<void>;
  onChangeConfidence: (id: string, conf: Confidence) => Promise<void>;
};

export function CompletedSection({ problems, onUndo, onChangeConfidence }: CompletedSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!problems || problems.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 32,
        border: '1px solid var(--daily-card-border)',
        borderRadius: 8,
        background: 'var(--daily-card-bg)',
        overflow: 'visible',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}
    >
      {/* Header with Accordion toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'var(--daily-header-bg)',
          border: 'none',
          borderBottom: collapsed ? 'none' : '1px solid var(--table-border)',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.1s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.98)')}
        onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={13} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>
            Completed Today
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: 999,
              background: 'var(--secondary)',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-geist-mono), monospace',
            }}
          >
            {problems.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-subtle)', fontSize: 12 }}>
          <span>{collapsed ? 'Show' : 'Hide'}</span>
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Accordion Body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'visible' }}
          >
            <NotionTableHeader />
            <div>
              {problems.map((p) => (
                <CompletedRow
                  key={p.id}
                  problem={p}
                  onUndo={onUndo}
                  onChangeConfidence={onChangeConfidence}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
