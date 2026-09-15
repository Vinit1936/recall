'use client';

import { useRef, type ComponentType } from 'react';
import { motion, useInView } from 'motion/react';
import { Chrome } from './chrome';
import { useMediaQuery } from '@/hooks/use-media-query';
import { RevisionDemoMobile } from './revision-demo-mobile';

interface RevisionSectionProps {
  RevisionDemo: ComponentType;
}

export function RevisionSection({ RevisionDemo }: RevisionSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <section
      data-revision-section
      id="daily-revision"
      style={{ maxWidth: 'clamp(1280px, 92vw, 1800px)', margin: '0 auto', padding: '120px 40px', scrollMarginTop: '60px' }}
    >
      <div ref={ref}>
        {/* Top text — centered */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center' }}
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
            Daily Revision
          </div>

          <h2 data-revision-title style={{ margin: 0 }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-display), Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '56px',
                lineHeight: 1.1,
                color: 'var(--text-primary)',
                paddingBottom: '8px',
              }}
            >
              Show up.
            </span>
            {/* Editorial rule */}
            <div
              style={{
                width: '240px',
                height: '1px',
                background: 'var(--border)',
                margin: '0 auto',
                marginBottom: '8px',
              }}
            />
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-display), Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '56px',
                lineHeight: 1.1,
                color: 'var(--text-primary)',
                paddingTop: '4px',
              }}
            >
              Every day.
            </span>
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '15px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              maxWidth: '400px',
              margin: '20px auto 48px',
              lineHeight: 1.7,
            }}
          >
            2–3 problems, automatically selected by your schedule. Mark each one and you&apos;re done.
          </p>
        </motion.div>

        {/* Chrome demo — centered, contained */}
        {isMobile ? (
          <div data-mobile-demo style={{ maxWidth: '340px', margin: '0 auto' }}>
            <RevisionDemoMobile />
          </div>
        ) : (
          <motion.div
            data-desktop-demo
            data-revision-chrome
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ maxWidth: '820px', margin: '0 auto' }}
          >
            <Chrome url="recallx.tech/daily" height={420}>
              <RevisionDemo />
            </Chrome>
          </motion.div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #how-it-works { padding: 80px 24px !important; }
        }
      `}</style>
    </section>
  );
}
