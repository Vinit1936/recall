'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const STEPS = [
  {
    num: '01',
    title: 'Solve & add',
    desc: 'Add any problem from LeetCode, Codeforces, GFG, HackerRank, or CodeChef. Title, difficulty, and topic fill in automatically.',
  },
  {
    num: '02',
    title: 'Get scheduled',
    desc: 'Recall assigns your first revision in 3 days. After that: 7, 14, 30. The interval adapts to your recall confidence.',
  },
  {
    num: '03',
    title: 'Show up daily',
    desc: 'Open Daily Revision. Mark each problem Clean, Shaky, or Struggled. The algorithm adjusts. Your streak builds.',
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="how-it-works"
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        scrollMarginTop: '60px',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div
        style={{
          maxWidth: 'clamp(1280px, 92vw, 1800px)',
          margin: '0 auto',
          padding: '100px 40px',
        }}
        ref={ref}
      >
        <div
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '10px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '64px',
          }}
        >
          How It Works
        </div>

        {/* 3-column grid — gap IS the vertical border */}
        <div
          className="how-it-works-v2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'var(--border)',
          }}
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.1,
              }}
              style={{
                background: 'var(--bg)',
                padding: i === 0 ? '0 36px 0 0' : i === 1 ? '0 36px' : '0 0 0 36px',
              }}
            >
              <div style={{ paddingTop: '4px' }}>
                {/* Large typographic number */}
                <div
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '80px',
                    color: 'var(--border)',
                    lineHeight: 1,
                  }}
                >
                  {step.num}
                </div>

                {/* Title */}
                <div
                  style={{
                    fontFamily: 'var(--font-geist-sans), sans-serif',
                    fontSize: '22px',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    marginTop: '16px',
                    marginBottom: '12px',
                  }}
                >
                  {step.title}
                </div>

                {/* Description */}
                <p
                  style={{
                    fontFamily: 'var(--font-geist-sans), sans-serif',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .how-it-works-v2 {
            grid-template-columns: 1fr !important;
          }
          .how-it-works-v2 > div {
            padding: 32px 0 !important;
            border-bottom: 1px solid var(--border) !important;
          }
        }
      `}</style>
    </section>
  );
}
