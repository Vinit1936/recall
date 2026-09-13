'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Chrome } from './chrome';
import { PlatformLogo } from '@/lib/platforms/logos';

const EXISTING_ROWS = [
  {
    platform: 'LEETCODE',
    number: '1',
    title: 'Two Sum',
    diff: 'Easy',
    diffStyle: { bg: 'var(--easy-bg)', text: 'var(--easy-text)', border: 'var(--easy-border)' },
    status: 'Clean',
    statusColor: '#4ade80',
  },
  {
    platform: 'CODEFORCES',
    number: '187',
    title: 'Target Practice',
    diff: 'Easy',
    diffStyle: { bg: 'var(--easy-bg)', text: 'var(--easy-text)', border: 'var(--easy-border)' },
    status: 'Shaky',
    statusColor: '#fb923c',
  },
];

export function TableDemoMobile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: '-40px' });

  // Sequence states
  const [step, setStep] = useState(0);
  const [typedNumber, setTypedNumber] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    let t1: NodeJS.Timeout,
      t2: NodeJS.Timeout,
      t3: NodeJS.Timeout,
      t4: NodeJS.Timeout,
      t5: NodeJS.Timeout,
      t6: NodeJS.Timeout,
      t7: NodeJS.Timeout,
      t8: NodeJS.Timeout;

    // t=0ms: Reset to initial state
    setStep(0);
    setTypedNumber('');
    setConfirmed(false);

    // t=600ms: Open inline new row & select LeetCode
    t1 = setTimeout(() => setStep(1), 600);

    // t=1200ms: Focus number input
    t2 = setTimeout(() => setStep(2), 1200);

    // t=1400ms: Type "2"
    t3 = setTimeout(() => setTypedNumber('2'), 1400);
    // t=1520ms: Type "23"
    t4 = setTimeout(() => setTypedNumber('23'), 1520);
    // t=1640ms: Type "234"
    t5 = setTimeout(() => setTypedNumber('234'), 1640);

    // t=1850ms: Loading shimmer
    t6 = setTimeout(() => setStep(3), 1850);

    // t=2150ms: Auto-fill Title & Metadata
    t7 = setTimeout(() => setStep(4), 2150);

    // t=2500ms: Green confirmation flash & row finalized
    t8 = setTimeout(() => setConfirmed(true), 2500);

    // t=4400ms: Reset loop
    const t9 = setTimeout(() => {
      setStep(5); // fade out
    }, 4400);

    const t10 = setTimeout(() => {
      setStep(0);
      setTypedNumber('');
      setConfirmed(false);
    }, 4700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
      clearTimeout(t9);
      clearTimeout(t10);
    };
  }, [isInView, step === 5]);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}>
      <Chrome url="recallx.tech/dashboard" height={300}>
        <div
          style={{
            height: '100%',
            background: 'var(--demo-bg)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'var(--font-geist-sans), sans-serif',
            fontSize: '12px',
            color: 'var(--demo-text)',
            userSelect: 'none',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Tab Bar — Matches real Mobile Dashboard */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px 0',
              borderBottom: '1px solid var(--demo-border)',
              background: 'var(--demo-bg)',
              overflowX: 'hidden',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--demo-text)',
                borderBottom: '2px solid var(--demo-text)',
                paddingBottom: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              All Problems
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--demo-text-faint)',
                paddingBottom: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              Due Today
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: 'var(--demo-text-faint)',
                paddingBottom: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <PlatformLogo platform="LEETCODE" size={14} />
              LeetCode
            </div>
          </div>

          {/* Mini Problems Table Container */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '26px 1fr 54px 50px',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderBottom: '1px solid var(--demo-border)',
                fontSize: '10px',
                fontFamily: 'var(--font-geist-mono), monospace',
                color: 'var(--demo-text-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'var(--demo-surface)',
              }}
            >
              <span style={{ textAlign: 'center' }}>PF</span>
              <span>PROBLEM</span>
              <span style={{ textAlign: 'center' }}>DIFF</span>
              <span style={{ textAlign: 'center' }}>STATUS</span>
            </div>

            {/* Existing Rows */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {EXISTING_ROWS.map((row) => (
                <div
                  key={row.number}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '26px 1fr 54px 50px',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--demo-border-subtle)',
                    fontSize: '12px',
                  }}
                >
                  {/* Platform */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <PlatformLogo platform={row.platform} size={16} />
                  </div>

                  {/* Problem title */}
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', color: 'var(--demo-text-muted)' }}>
                      {row.number}
                    </span>
                    <span style={{ fontWeight: 500, color: 'var(--demo-text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.title}
                    </span>
                  </div>

                  {/* Difficulty */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <span
                      style={{
                        background: row.diffStyle.bg,
                        color: row.diffStyle.text,
                        border: `1px solid ${row.diffStyle.border}`,
                        fontSize: '9px',
                        fontWeight: 500,
                        fontFamily: 'var(--font-geist-mono), monospace',
                        padding: '1px 5px',
                        borderRadius: '3px',
                      }}
                    >
                      {row.diff}
                    </span>
                  </div>

                  {/* Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: row.statusColor }} />
                    <span style={{ fontSize: '10px', color: row.statusColor, fontFamily: 'var(--font-geist-mono), monospace' }}>
                      {row.status}
                    </span>
                  </div>
                </div>
              ))}

              {/* Animated Row 3 (Addition Flow) */}
              {step > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: step === 5 ? 0 : 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '26px 1fr 54px 50px',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 10px',
                    borderBottom: '1px solid var(--demo-border-subtle)',
                    background: confirmed ? 'rgba(74, 222, 128, 0.08)' : step >= 2 ? 'var(--demo-control-active)' : 'var(--demo-surface)',
                    boxShadow: confirmed ? 'inset 0 0 0 1px rgba(74, 222, 128, 0.3)' : 'none',
                    transition: 'background 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                  }}
                >
                  {/* Platform Cell */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <PlatformLogo platform="LEETCODE" size={16} />
                  </div>

                  {/* Input / Problem Cell */}
                  <div
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {step < 4 ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: step >= 2 ? 'var(--demo-control-active)' : 'transparent',
                          border: `1px solid ${step >= 2 ? 'var(--demo-control-border)' : 'transparent'}`,
                          borderRadius: '4px',
                          padding: '1px 4px',
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', color: 'var(--demo-text-muted)' }}>
                          #
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-geist-mono), monospace',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: typedNumber ? 'var(--demo-text)' : 'var(--demo-placeholder)',
                          }}
                        >
                          {typedNumber || '___'}
                        </span>
                        {step === 2 && (
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            style={{ display: 'inline-block', width: '1.5px', height: '12px', background: '#ff6b00' }}
                          />
                        )}
                        {step === 3 && (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
                            style={{
                              display: 'inline-block',
                              width: '8px',
                              height: '8px',
                              border: '1.5px solid #ff6b00',
                              borderTopColor: 'transparent',
                              borderRadius: '50%',
                              marginLeft: '2px',
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', color: 'var(--demo-text-muted)' }}>
                          234
                        </span>
                        <motion.span
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{ fontWeight: 500, color: 'var(--demo-text)', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          Palindrome Linked...
                        </motion.span>
                      </>
                    )}
                  </div>

                  {/* Difficulty Cell */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {step >= 4 ? (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          background: 'var(--easy-bg)',
                          color: 'var(--easy-text)',
                          border: '1px solid var(--easy-border)',
                          fontSize: '9px',
                          fontWeight: 500,
                          fontFamily: 'var(--font-geist-mono), monospace',
                          padding: '1px 5px',
                          borderRadius: '3px',
                        }}
                      >
                        Easy
                      </motion.span>
                    ) : (
                      <span style={{ color: 'var(--demo-placeholder)', fontSize: '10px' }}>—</span>
                    )}
                  </div>

                  {/* Status Cell */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    {step >= 4 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                        <span style={{ fontSize: '10px', color: '#4ade80', fontFamily: 'var(--font-geist-mono), monospace' }}>
                          Clean
                        </span>
                      </motion.div>
                    ) : (
                      <span style={{ color: 'var(--demo-placeholder)', fontSize: '10px' }}>—</span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Trigger Button: + New problem */}
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  color: 'var(--demo-text-muted)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  cursor: 'pointer',
                  borderTop: '1px solid var(--demo-border-subtle)',
                }}
              >
                <span style={{ fontSize: '12px', color: 'var(--demo-text-muted)' }}>+</span>
                <span>New problem</span>
              </motion.div>
            )}
          </div>
        </div>
      </Chrome>
    </div>
  );
}
