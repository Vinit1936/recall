'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Chrome } from './chrome';
import { RetentionChart } from './retention-chart';

export function Science() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const BULLETS = [
    { color: '#f87171', bold: '90% lost', rest: ' within 7 days without timely revision.' },
    { color: '#4ade80', bold: '4 reviews', rest: ' build permanent pattern retention.' },
    { color: '#818cf8', bold: 'Adaptive intervals', rest: ' recalculate based on confidence.' },
  ];

  return (
    <section data-science-section id="science" style={{ maxWidth: 'clamp(1280px, 92vw, 1800px)', margin: '0 auto', padding: '120px 40px', scrollMarginTop: '60px' }}>
      <div
        ref={ref}
        data-science-grid
        className="science-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
        }}
      >
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '10px',
              color: 'var(--text-secondary)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '24px',
            }}
          >
            The Science
          </div>

          <h2 style={{ margin: 0 }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-display), Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '48px',
                lineHeight: 1.1,
                color: 'var(--text-primary)',
                paddingBottom: '8px',
              }}
            >
              Why traditional
            </span>
            <div style={{ width: '100%', height: '1px', background: 'var(--border)', marginBottom: '8px' }} />
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-display), Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '48px',
                lineHeight: 1.1,
                color: 'var(--text-primary)',
                paddingTop: '4px',
              }}
            >
              cramming fails.
            </span>
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              marginTop: '24px',
              maxWidth: '380px',
              margin: '24px 0 0',
            }}
          >
            Hermann Ebbinghaus proved memory decays exponentially after you learn something. Without timely
            revision, 90% is lost within a week. Spaced repetition interrupts the decay curve — each review
            resets the clock before the concept fades.
          </p>

          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {BULLETS.map((b) => (
              <div key={b.bold} style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: b.color,
                    flexShrink: 0,
                    marginTop: '2px',
                    alignSelf: 'center',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-geist-sans), sans-serif',
                    fontSize: '13px',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: b.color, fontWeight: 700 }}>{b.bold}</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>{b.rest}</span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — chart */}
        <motion.div
          data-science-chart
          className="science-chart"
          initial={{ opacity: 0, x: 20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <Chrome url="recallx.tech/science" height={380}>
            <RetentionChart />
          </Chrome>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #science { padding: 80px 24px !important; }
          .science-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .science-chart { display: none !important; }
        }
      `}</style>
    </section>
  );
}
