import type { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import DotBackgroundDemo from '@/components/dot-background-demo';

export const metadata: Metadata = {
  title: 'About Us — The Science of Retaining Every Algorithm',
  description:
    'Discover how Recall solves the algorithmic forgetting curve with intelligent spaced repetition for LeetCode and DSA problems.',
  keywords: [
    'About Recall',
    'LeetCode spaced repetition',
    'DSA retention philosophy',
    'Ebbinghaus curve for coding',
    'Vinit Patil Recall',
  ],
};

const SECTIONS = [
  {
    num: '01',
    title: 'The forgetting curve in technical prep',
    desc: 'Most software engineers grind hundreds of coding problems in isolation. But human memory decays exponentially: without review, over 70% of new algorithmic concepts are lost within 48 hours. By the time interview season arrives, solutions solved weeks earlier feel completely unfamiliar.',
  },
  {
    num: '02',
    title: 'Cognitive spaced repetition (+3, +7, +14, +30d)',
    desc: 'Recall intercepts the forgetting curve just before a concept fades. When you solve a problem, Recall schedules reviews at increasing intervals: +3, +7, +14, and +30 days. When you mark a problem Clean, it advances to the next interval; if you struggled, it resets to day 3. This transforms short-term memorization into permanent intuition.',
  },
  {
    num: '03',
    title: 'Frictionless multi-platform support',
    desc: 'Recall connects seamlessly with LeetCode (2,800+ problem dataset for instant autofill), Codeforces, GeeksForGeeks, HackerRank, and CodeChef. Simply enter the problem number or URL — title, difficulty, and topics fill automatically with zero manual overhead.',
  },
  {
    num: '04',
    title: 'Open source & community driven',
    desc: 'Recall was designed and engineered by Vinit Patil out of personal frustration with messy spreadsheets and forgotten problem solutions. It is 100% free, open source, and built to help developers master coding interviews without burnout.',
  },
];

export default function AboutPage() {
  return (
    <DotBackgroundDemo>
      <Navbar />
      <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '100px' }}>
        <article
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '0 32px',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '10px',
              color: 'var(--text-secondary)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            About Recall
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(34px, 4vw, 46px)',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              margin: '0 0 24px',
            }}
          >
            The science of retaining every algorithm you solve.
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              margin: '0 0 56px',
            }}
          >
            Linear LeetCode grinding gives the illusion of progress, but without spaced reinforcement, problem intuition fades rapidly. Recall automates cognitive spaced repetition so you never have to re-learn a problem you already conquered.
          </p>

          {/* Editorial Sections */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {SECTIONS.map((sec, i) => (
              <div
                key={sec.num}
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '28px',
                  paddingBottom: '32px',
                  ...(i === SECTIONS.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-geist-mono), monospace',
                      fontSize: '11px',
                      color: '#ff6b00',
                    }}
                  >
                    {sec.num}
                  </span>
                  <h2
                    style={{
                      fontFamily: 'var(--font-geist-sans), sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {sec.title}
                  </h2>
                </div>

                <p
                  style={{
                    fontFamily: 'var(--font-geist-sans), sans-serif',
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.75,
                    margin: 0,
                    paddingLeft: '32px',
                  }}
                >
                  {sec.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div
            style={{
              marginTop: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <Link
              href="/dashboard"
              className="about-dashboard-btn"
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '12px',
                color: 'var(--foreground)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid var(--border)',
                background: 'var(--card)',
                padding: '10px 20px',
                borderRadius: '8px',
                transition: 'border-color 0.15s ease, background 0.15s ease',
              }}
            >
              Open Recall Dashboard →
            </Link>

            <a
              href="https://github.com/Vinit1936/Recall"
              target="_blank"
              rel="noopener noreferrer"
              className="about-github-link"
              style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
            >
              View source on GitHub ↗
            </a>
          </div>

          <style>{`
            .about-dashboard-btn:hover {
              border-color: var(--primary) !important;
            }
            .about-github-link:hover {
              color: var(--text-primary) !important;
            }
          `}</style>
        </article>
      </main>
      <Footer />
    </DotBackgroundDemo>
  );
}
