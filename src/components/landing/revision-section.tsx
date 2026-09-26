'use client';

import { useRef, type ComponentType } from 'react';
import { motion, useInView } from 'motion/react';
import Link from 'next/link';
import { Chrome } from './chrome';
import { useMediaQuery } from '@/hooks/use-media-query';
import { RevisionDemoMobile } from './revision-demo-mobile';

interface RevisionSectionProps {
  RevisionDemo: ComponentType;
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: 0.1 + i * 0.08,
    },
  }),
};

export function RevisionSection({ RevisionDemo }: RevisionSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const isMobile = useMediaQuery('(max-width: 1024px)');

  return (
    <section
      data-revision-section
      id="daily-revision"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'clip',
        padding: isMobile ? '48px 20px' : '64px 0 80px',
        scrollMarginTop: '60px',
      }}
    >
      <div
        ref={ref}
        data-revision-grid
        className="revision-v2-grid"
        style={{
          width: '100%',
          maxWidth: '1640px',
          margin: '0 auto',
          padding: isMobile ? '0' : '0 max(28px, calc((100vw - 1640px) / 2))',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.15fr) minmax(380px, 440px)',
          gap: isMobile ? '36px' : '56px',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Left column: Demo */}
        <div
          data-revision-left
          className="revision-v2-left"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {isMobile ? (
            <div data-mobile-demo style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}>
              <RevisionDemoMobile />
            </div>
          ) : (
            <motion.div
              data-desktop-demo
              initial={{ opacity: 0, x: -30, scale: 0.98 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -30, scale: 0.98 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
              style={{
                width: '100%',
                maxWidth: '800px',
              }}
            >
              <Chrome url="recallx.tech/daily" height={440}>
                <RevisionDemo />
              </Chrome>
            </motion.div>
          )}
        </div>

        {/* Right column: Text */}
        <div
          data-revision-right
          className="revision-v2-right"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Label / Eyebrow */}
          <motion.div
            custom={0}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={itemVariants}
            style={{ marginBottom: '16px' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Daily Revision
            </span>
          </motion.div>

          {/* Headline — lightweight (300), confident hero size fitting strictly in 2 lines */}
          <motion.div
            custom={1}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={itemVariants}
            style={{ marginBottom: '18px' }}
          >
            <h2 data-revision-title style={{ margin: 0, padding: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 300,
                  fontSize: 'clamp(30px, 3vw, 40px)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                }}
              >
                <span style={{ color: 'var(--text-primary)', display: 'block' }}>
                  Show up every day.
                </span>
                <span style={{ color: 'var(--hero-muted-text, #71717a)', display: 'block' }}>
                  Never wonder what to revise.
                </span>
              </span>
            </h2>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            custom={2}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={itemVariants}
            style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '14.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              letterSpacing: '-0.01em',
              maxWidth: '430px',
              margin: 0,
              marginBottom: '24px',
            }}
          >
            2 to 3 problems, automatically selected by your spaced repetition queue. Rate your confidence in one click, and Recall recalibrates the interval so you retain patterns effortlessly.
          </motion.p>

          {/* Feature Highlights */}
          <motion.div
            custom={3}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={itemVariants}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '28px',
            }}
          >
            {[
              { title: 'Confidence ratings', desc: 'Clean (+7d), Shaky (+1d), or Struggled (tomorrow)' },
              { title: 'Overdue prioritization', desc: 'Missed questions are queued first so patterns stay fresh' },
              { title: 'Streak motivation', desc: 'Visual daily streaks and completion states keep you consistent' },
            ].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--text-secondary)',
                    marginTop: '8px',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{feat.title}:</strong> {feat.desc}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            custom={4}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={itemVariants}
          >
            <Link
              href="/auth/login"
              style={{
                background: 'var(--text-primary)',
                color: 'var(--bg)',
                fontSize: '13px',
                fontWeight: 600,
                height: '40px',
                padding: '0 20px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                fontFamily: 'var(--font-geist-sans), sans-serif',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Try daily revision free →
            </Link>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .revision-v2-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            padding: 0 24px !important;
          }
          .revision-v2-left {
            order: 2;
          }
          .revision-v2-right {
            order: 1;
          }
        }
      `}</style>
    </section>
  );
}
