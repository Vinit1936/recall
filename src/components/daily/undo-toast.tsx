'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, X, Check } from 'lucide-react';

export type UndoToastItem = {
  id: string;
  problemId: string;
  title: string;
  confidence: 'CLEAN' | 'SHAKY' | 'STRUGGLED';
};

type UndoToastProps = {
  toast: UndoToastItem | null;
  onUndo: (problemId: string) => Promise<void>;
  onDismiss: () => void;
};

const CONFIDENCE_COLORS = {
  CLEAN: { text: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  SHAKY: { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  STRUGGLED: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.3)' },
};

function UndoToastContent({
  toast,
  onUndo,
  onDismiss,
}: {
  toast: UndoToastItem;
  onUndo: (problemId: string) => Promise<void>;
  onDismiss: () => void;
}) {
  const [isUndoing, setIsUndoing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const confCfg = CONFIDENCE_COLORS[toast.confidence] || CONFIDENCE_COLORS.CLEAN;
  const label = toast.confidence.charAt(0) + toast.confidence.slice(1).toLowerCase();

  const handleUndoClick = async () => {
    if (isUndoing) return;
    setIsUndoing(true);
    try {
      await onUndo(toast.problemId);
    } finally {
      setIsUndoing(false);
      onDismiss();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: 'var(--popover)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        boxShadow: 'var(--shadow-modal)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 420,
        minWidth: 320,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', gap: 12 }}>
        {/* Status icon + details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: confCfg.bg,
              color: confCfg.text,
              border: `1px solid ${confCfg.border}`,
              flexShrink: 0,
            }}
          >
            <Check size={13} strokeWidth={2.5} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-strong)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {toast.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>
              Marked as <span style={{ color: confCfg.text, fontWeight: 600 }}>{label}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            onClick={handleUndoClick}
            disabled={isUndoing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              background: 'var(--secondary)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              cursor: isUndoing ? 'not-allowed' : 'pointer',
              transition: 'all 0.12s ease',
            }}
            onMouseEnter={(e) => {
              if (!isUndoing) {
                e.currentTarget.style.background = 'var(--accent)';
                e.currentTarget.style.borderColor = 'var(--text-muted)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUndoing) {
                e.currentTarget.style.background = 'var(--secondary)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }
            }}
          >
            <RotateCcw size={12} className={isUndoing ? 'animate-spin' : ''} />
            {isUndoing ? 'Undoing...' : 'Undo'}
          </button>

          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 4,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Subtle timer progress bar */}
      <div style={{ width: '100%', height: 2, background: 'var(--border-subtle)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 7, ease: 'linear' }}
          style={{
            height: '100%',
            background: confCfg.text,
          }}
        />
      </div>
    </motion.div>
  );
}

export function UndoToast({ toast, onUndo, onDismiss }: UndoToastProps) {
  if (!toast) return null;

  return (
    <AnimatePresence>
      <UndoToastContent key={toast.id} toast={toast} onUndo={onUndo} onDismiss={onDismiss} />
    </AnimatePresence>
  );
}

