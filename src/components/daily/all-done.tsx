'use client';

import { motion } from 'motion/react';

type AllDoneProps = {
  streak: number;
};

export function AllDone({ streak }: AllDoneProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
        gap: 14,
        textAlign: 'center',
      }}
    >
      {/* Checkmark */}
      <div style={{ fontSize: 48, color: '#4ade80', lineHeight: 1 }}>✓</div>

      {/* Title */}
      <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--foreground)', marginTop: 4 }}>
        All done for today
      </div>

      {/* Subtitle */}
      <div style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
        Come back tomorrow to keep your streak alive.
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 18 }}>🔥</span>
        <span
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--foreground)',
          }}
        >
          {streak}
        </span>
        <span style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>day streak</span>
      </div>
    </motion.div>
  );
}
