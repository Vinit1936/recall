'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Chrome } from './chrome';
import type { ComponentType } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { TableDemoMobile } from './table-demo-mobile';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 + i * 0.1 },
  }),
};

interface HeroProps {
  TableDemo: ComponentType;
}

export function Hero({ TableDemo }: HeroProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <section style={{ position: 'relative' }}>
      {/* Main grid */}
      <div
        data-hero-grid
        className="hero-v2-grid"
        style={{
          minHeight: '100vh',
          paddingTop: '52px',
          display: 'grid',
          gridTemplateColumns: '420px 1fr',
          gap: 0,
          maxWidth: 'clamp(1280px, 92vw, 1800px)',
          margin: '0 auto',
          paddingLeft: '40px',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Left column */}
        <div
          data-hero-left
          style={{
            paddingRight: '48px',
            paddingTop: '80px',
            paddingBottom: '80px',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {/* Label */}
          <motion.div custom={0} initial="hidden" animate="visible" variants={itemVariants} style={{ marginBottom: '20px' }}>
            <span
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '11px',
                color: '#888',
                letterSpacing: '0.1em',
              }}
            >
              Spaced repetition for DSA
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={itemVariants} style={{ marginBottom: '24px' }}>
            <h1 data-hero-title style={{ margin: 0, padding: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: '64px',
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: '#f0f0f0',
                  paddingBottom: '10px',
                }}
              >
                Never forget
              </span>
              {/* Editorial rule between lines */}
              <div style={{ width: '100%', height: '1px', background: '#1e1e1e', marginBottom: '10px' }} />
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: '64px',
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: '#f0f0f0',
                  paddingTop: '4px',
                }}
              >
                what you solved.
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '15px',
              color: '#555',
              lineHeight: 1.7,
              maxWidth: '320px',
              margin: 0,
              marginBottom: '40px',
            }}
          >
            Recall schedules your DSA revision automatically.
            <br />
            Solve once. Remember forever.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            data-hero-cta
            custom={3}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            style={{
              marginTop: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/auth/login"
              style={{
                background: '#f0f0f0',
                color: '#080808',
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
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Start tracking free →
            </Link>

            <a
              href="https://www.producthunt.com/products/recall-27?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-recall-81d0b196-22e4-4d6e-9c06-12f568e670a5"
              target="_blank"
              rel="noopener noreferrer"
              data-hero-producthunt
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '40px',
                borderRadius: '8px',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.filter = 'brightness(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              <img
                alt="recall. - Never forget your solved DSA questions. | Product Hunt"
                width={250}
                height={54}
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1238527&theme=light&t=1789143552040"
                style={{
                  height: '40px',
                  width: 'auto',
                  borderRadius: '8px',
                  display: 'block',
                }}
              />
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            style={{ marginTop: '32px' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '10px',
                color: '#2a2a2a',
                letterSpacing: '0.05em',
              }}
            >
              Built by a student, for students grinding DSA
            </span>
          </motion.div>

          {/* Mobile Demo — Centered below CTA */}
          {isMobile && (
            <div data-mobile-demo style={{ marginTop: '32px', width: '100%' }}>
              <TableDemoMobile />
            </div>
          )}
        </div>

        {/* Right column — demo bleeds right edge */}
        <div
          data-hero-right
          className="hero-v2-right"
          style={{
            height: '100vh',
            paddingTop: '52px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '40px',
          }}
        >
          {!isMobile && (
            <motion.div
              data-desktop-demo
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay: 0.5 }}
              style={{ width: '100%', marginRight: '-40px' }}
            >
              <Chrome url="recallx.tech" height={480}>
                <TableDemo />
              </Chrome>
            </motion.div>
          )}
        </div>
      </div>

      {/* Stats bar — Horizontally moving ticker with latest capabilities */}
      <div
        data-hero-stats
        style={{
          borderTop: '1px solid #111',
          borderBottom: '1px solid #111',
          padding: '24px 0',
          overflow: 'hidden',
          position: 'relative',
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ repeat: Infinity, ease: 'linear', duration: 35 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '56px',
            width: 'max-content',
            whiteSpace: 'nowrap',
          }}
        >
          {[
            { number: '3,400+', label: 'LeetCode problems indexed' },
            { number: '5 platforms', label: 'LeetCode, Codeforces, GFG & more' },
            { number: '+3 → +30 days', label: 'Automatic revision schedule' },
            { number: '3 confidence levels', label: 'Clean, Shaky, Struggled' },
            { number: 'Smart auto-fill', label: 'Instant title & topic import' },
            { number: 'Daily revision queue', label: 'Never miss a problem review' },
            { number: 'Streak tracking', label: 'Heatmaps & activity logs' },
            { number: '100% free', label: 'No credit card required' },
            // Repeated for infinite seamless loop
            { number: '3,400+', label: 'LeetCode problems indexed' },
            { number: '5 platforms', label: 'LeetCode, Codeforces, GFG & more' },
            { number: '+3 → +30 days', label: 'Automatic revision schedule' },
            { number: '3 confidence levels', label: 'Clean, Shaky, Struggled' },
            { number: 'Smart auto-fill', label: 'Instant title & topic import' },
            { number: 'Daily revision queue', label: 'Never miss a problem review' },
            { number: 'Streak tracking', label: 'Heatmaps & activity logs' },
            { number: '100% free', label: 'No credit card required' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '56px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display), Georgia, serif',
                    fontStyle: 'italic',
                    fontSize: '34px',
                    color: '#e5e5e5',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.number}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '10px',
                    color: '#555',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  color: '#262626',
                  fontSize: '24px',
                  userSelect: 'none',
                }}
              >
                ·
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-v2-grid {
            grid-template-columns: 1fr !important;
            padding-left: 0 !important;
          }
          .hero-v2-right { display: none !important; }
          .hero-v2-grid > div:first-child {
            padding: 80px 24px 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
