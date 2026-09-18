'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Chrome } from './chrome';
import { getTopicColor } from '@/lib/topic-colors';
import { Pill } from '@/components/ui/pill';

const PROBLEMS = [
  {
    title: 'Best Time to Buy and Sell Stock',
    diff: 'Hard',
    diffColor: { bg: 'var(--hard-bg)', text: 'var(--hard-text)', border: 'var(--hard-border)' },
    topic: 'Two Pointers',
    actionBtn: 'Clean',
    badgeText: '✓ Marked Clean',
    badgeColor: 'var(--easy-text)',
    badgeBackground: 'var(--easy-bg)',
    badgeBorder: 'var(--easy-border)',
  },
  {
    title: 'Subarray Sum Equals K',
    diff: 'Medium',
    diffColor: { bg: 'var(--medium-bg)', text: 'var(--medium-text)', border: 'var(--medium-border)' },
    topic: 'Hash Table',
    actionBtn: 'Shaky',
    badgeText: '✓ Marked Shaky',
    badgeColor: 'var(--medium-text)',
    badgeBackground: 'var(--medium-bg)',
    badgeBorder: 'var(--medium-border)',
  },
];

export function RevisionDemoMobile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: '-50px' });

  // Index 0 or 1 for problems
  const [probIndex, setProbIndex] = useState(0);
  const [btnState, setBtnState] = useState<'idle' | 'highlight' | 'pressed' | 'done'>('idle');
  const [streak, setStreak] = useState(3);
  const [cardOpacity, setCardOpacity] = useState(1);

  useEffect(() => {
    if (!isInView) return;

    let t1: NodeJS.Timeout,
      t2: NodeJS.Timeout,
      t3: NodeJS.Timeout,
      t4: NodeJS.Timeout,
      t5: NodeJS.Timeout,
      t6: NodeJS.Timeout;

    if (probIndex === 0) {
      // Problem 1 Cycle
      setStreak(3);
      setBtnState('idle');
      setCardOpacity(1);

      // t=800ms: Highlight Clean
      t1 = setTimeout(() => setBtnState('highlight'), 800);
      // t=1400ms: Tap press
      t2 = setTimeout(() => setBtnState('pressed'), 1400);
      // t=1600ms: Marked Clean badge
      t3 = setTimeout(() => setBtnState('done'), 1600);
      // t=2400ms: Streak 3 -> 4
      t4 = setTimeout(() => setStreak(4), 2400);
      // t=3400ms: Fade out Card 1
      t5 = setTimeout(() => setCardOpacity(0), 3400);
      // t=3700ms: Switch to Problem 2
      t6 = setTimeout(() => setProbIndex(1), 3700);
    } else {
      // Problem 2 Cycle
      setBtnState('idle');
      setCardOpacity(1);

      // t=800ms: Highlight Shaky
      t1 = setTimeout(() => setBtnState('highlight'), 800);
      // t=1400ms: Tap press
      t2 = setTimeout(() => setBtnState('pressed'), 1400);
      // t=1600ms: Marked Shaky badge
      t3 = setTimeout(() => setBtnState('done'), 1600);
      // t=3000ms: Fade out Card 2
      t5 = setTimeout(() => setCardOpacity(0), 3000);
      // t=3300ms: Reset to Problem 1
      t6 = setTimeout(() => {
        setProbIndex(0);
      }, 3300);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [isInView, probIndex]);

  const currentProb = PROBLEMS[probIndex];
  const topicColor = getTopicColor(currentProb.topic);

  return (
    <div ref={containerRef} style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}>
      <Chrome url="recallx.tech/daily" height={260}>
        <div
          style={{
            height: '100%',
            background: 'var(--demo-bg)',
            padding: '14px 16px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            fontFamily: 'var(--font-geist-sans), sans-serif',
          }}
        >
          {/* Header Stats Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              padding: '0 4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>🔥</span>
              <span
                style={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--demo-text)',
                }}
              >
                {streak} day streak
              </span>
            </div>

            <span
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '10px',
                color: 'var(--demo-text-faint)',
              }}
            >
              {probIndex === 0 ? '3 due today' : '2 due today'}
            </span>
          </div>

          {/* Problem Card */}
          <motion.div
            animate={{ opacity: cardOpacity }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'var(--demo-surface)',
              border: '1px solid var(--demo-border)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--demo-text)',
                marginBottom: '10px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentProb.title}
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Pill bg={currentProb.diffColor.bg} text={currentProb.diffColor.text} border={currentProb.diffColor.border}>
                {currentProb.diff}
              </Pill>

              <Pill bg={topicColor.bg} text={topicColor.text} border={topicColor.border}>
                {currentProb.topic}
              </Pill>
            </div>

            {/* Buttons / Result Action Row */}
            {btnState !== 'done' ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Clean', 'Shaky', 'Struggled'].map((btn) => {
                  const isTarget = btn === currentProb.actionBtn;
                  const isHighlighted = isTarget && (btnState === 'highlight' || btnState === 'pressed');
                  const isPressed = isTarget && btnState === 'pressed';

                  let btnBg = 'var(--demo-control)';
                  let btnBorder = 'var(--demo-control-border)';
                  let btnColor = 'var(--demo-text-muted)';

                  if (isHighlighted) {
                    if (btn === 'Clean') {
                      btnBg = 'var(--easy-bg)';
                      btnBorder = 'var(--easy-border)';
                      btnColor = 'var(--easy-text)';
                    } else {
                      btnBg = 'var(--medium-bg)';
                      btnBorder = 'var(--medium-border)';
                      btnColor = 'var(--medium-text)';
                    }
                  }

                  return (
                    <motion.button
                      key={btn}
                      animate={{ scale: isPressed ? 0.94 : 1 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        flex: 1,
                        height: '38px',
                        background: btnBg,
                        border: `1px solid ${btnBorder}`,
                        borderRadius: '6px',
                        color: btnColor,
                        fontSize: '11px',
                        fontWeight: 500,
                        fontFamily: 'var(--font-geist-sans), sans-serif',
                        cursor: 'default',
                        outline: 'none',
                        transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                      }}
                    >
                      {btn}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  height: '38px',
                  background: currentProb.badgeBackground,
                  border: `1px solid ${currentProb.badgeBorder}`,
                  borderRadius: '6px',
                  color: currentProb.badgeColor,
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {currentProb.badgeText}
              </motion.div>
            )}
          </motion.div>
        </div>
      </Chrome>
    </div>
  );
}
