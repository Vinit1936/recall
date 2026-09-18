'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const CARDS = [
  {
    num: '01',
    category: 'Spaced Repetition',
    title: 'Adaptive Intervals',
    desc: 'Automated 3 → 7 → 14 → 30 day revision queue that adapts dynamically based on your confidence rating. Clean advances the interval, Struggled resets it, and Shaky repeats.',
  },
  {
    num: '02',
    category: 'Automation',
    title: 'Multi-Platform Sync',
    desc: 'Instant title, difficulty, and topic extraction for LeetCode (3,400+ problems indexed), Codeforces, HackerRank, GFG, and CodeChef. Type the ID — everything fills in.',
  },
  {
    num: '03',
    category: 'Flexibility',
    title: 'Custom Columns',
    desc: 'Add custom columns to your tracker — Approach Summary, Time Complexity, Companies Asked, Pattern — anything you need. Stored per-problem, visible everywhere.',
  },
  {
    num: '04',
    category: 'Ownership',
    title: 'Your Data',
    desc: 'Every problem you track is yours. No algorithmic feed, no gamification dark patterns, no daily streak pressure. Just your problems, your schedule, your pace.',
  },
];

export function Capabilities() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section data-capabilities-section id="capabilities" style={{ maxWidth: 'clamp(1280px, 92vw, 1800px)', margin: '0 auto', padding: '0 40px 120px', scrollMarginTop: '60px' }}>
      <div ref={ref}>
        {/* Section Header */}
        <div
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '10px',
            color: '#888',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '64px',
          }}
        >
          Capabilities
        </div>

        {/* 2×2 Grid — 1px border gap */}
        <div
          data-capabilities-grid
          className="capabilities-v2-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1px',
            background: 'var(--border)',
          }}
        >
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.08,
              }}
              data-capability-card
              className="capability-card"
              style={{
                background: 'var(--surface)',
                padding: '48px 44px',
                transition: 'background 0.2s ease',
              }}
            >
              {/* Category & Number Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                }}
              >
                <div
                  className="card-category"
                  style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '10px',
                    color: 'var(--text-secondary)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {card.category}
                </div>
                <div
                  className="card-num"
                  style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {card.num}
                </div>
              </div>

              {/* Title */}
              <div
                className="card-title"
                style={{
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontSize: '22px',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  marginBottom: '14px',
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                  transition: 'color 0.2s ease',
                }}
              >
                {card.title}
              </div>

              {/* Description */}
              <p
                className="card-desc"
                style={{
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.75,
                  margin: 0,
                  transition: 'color 0.2s ease',
                }}
              >
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .capability-card:hover {
          filter: brightness(0.96);
        }
        .dark .capability-card:hover {
          filter: brightness(1.1);
        }
        @media (max-width: 768px) {
          #capabilities { padding: 0 24px 80px !important; }
          .capabilities-v2-grid { grid-template-columns: 1fr !important; }
          .capability-card { padding: 32px 24px !important; }
        }
      `}</style>
    </section>
  );
}
