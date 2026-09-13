import type { Metadata } from 'next';
import { Instrument_Serif } from 'next/font/google';
import '@/app/mobile.css';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: {
    absolute: 'Recall — Never Forget What You Solved',
  },
  description:
    'Automated spaced repetition queue for LeetCode, Codeforces, GFG, HackerRank, and CodeChef. Never forget what you solved.',
  keywords: [
    'DSA revision',
    'spaced repetition',
    'LeetCode tracker',
    'LeetCode spaced repetition',
    'Codeforces tracker',
    'GeeksforGeeks tracker',
    'HackerRank tracker',
    'CodeChef tracker',
    'DSA preparation',
    'coding interview prep',
    'algorithm revision',
    'Blind 75 revision',
    'NeetCode 150',
    'NeetCode 250',
    'Striver SDE sheet',
    'Striver A2Z DSA',
    'Grind 75',
    'active recall coding',
    'Ebbinghaus forgetting curve',
    'dynamic programming practice',
    'FAANG interview prep',
  ],
  openGraph: {
    type: 'website',
    url: 'https://recallx.tech',
    siteName: 'Recall',
    title: 'Recall — Never Forget What You Solved',
    description:
      'Automated spaced repetition queue for LeetCode, Codeforces, GFG, HackerRank, and CodeChef.',
    images: [
      {
        url: 'https://recallx.tech/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Recall — Never Forget What You Solved',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recall — Never Forget What You Solved',
    description:
      'Automated spaced repetition queue for LeetCode, Codeforces, GFG, HackerRank, and CodeChef.',
    images: ['https://recallx.tech/og-image.png'],
    creator: '@vinitpatil193',
    site: '@vinitpatil193',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={instrumentSerif.variable}
      style={{
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
        overflowX: 'hidden',
        WebkitFontSmoothing: 'antialiased',
        transition: 'background 0.2s ease, color 0.2s ease',
      }}
    >
      <style>{`
        :root {
          --bg: #ffffff;
          --surface: #ffffff;
          --border: #e4e4e7;
          --border-subtle: #f4f4f5;
          --text-primary: #09090b;
          --text-secondary: #64748b;
          --text-tertiary: #94a3b8;
          --text-disabled: #cbd5e1;
          --easy-bg: rgba(34, 197, 94, 0.14);
          --easy-text: #16a34a;
          --easy-border: rgba(34, 197, 94, 0.28);
          --medium-bg: rgba(249, 115, 22, 0.14);
          --medium-text: #ea580c;
          --medium-border: rgba(249, 115, 22, 0.28);
           --hard-bg: rgba(239, 68, 68, 0.14);
           --hard-text: #dc2626;
           --hard-border: rgba(239, 68, 68, 0.28);
           --demo-bg: #ffffff;
           --demo-surface: #fafafa;
           --demo-surface-raised: #f4f4f5;
           --demo-surface-hover: #e4e4e7;
           --demo-border: #e4e4e7;
           --demo-border-subtle: #f1f1f3;
           --demo-text: #18181b;
           --demo-text-muted: #64748b;
           --demo-text-faint: #94a3b8;
           --demo-placeholder: #a1a1aa;
           --demo-control: #f4f4f5;
           --demo-control-active: #e4e4e7;
           --demo-control-border: #d4d4d8;
           --demo-dropdown: #ffffff;
           --demo-dropdown-border: #d4d4d8;
         }
         .dark {
          --bg: #080808;
          --surface: #0f0f0f;
          --border: #1a1a1a;
          --border-subtle: #111111;
          --text-primary: #f0f0f0;
          --text-secondary: #888888;
          --text-tertiary: #444444;
          --text-disabled: #2a2a2a;
          --easy-bg: #1c3a1c;
          --easy-text: #4ade80;
          --easy-border: #2d5a2d;
          --medium-bg: #3a2a0d;
          --medium-text: #fb923c;
          --medium-border: #5a3d10;
           --hard-bg: #3a0f0f;
           --hard-text: #f87171;
           --hard-border: #5a1a1a;
           --demo-bg: #0a0a0b;
           --demo-surface: #0d0d0e;
           --demo-surface-raised: #161618;
           --demo-surface-hover: #252528;
           --demo-border: #18181a;
           --demo-border-subtle: #151517;
           --demo-text: #ececec;
           --demo-text-muted: #888888;
           --demo-text-faint: #555555;
           --demo-placeholder: #444444;
           --demo-control: #1e1e1e;
           --demo-control-active: #1a1a20;
           --demo-control-border: #33333a;
           --demo-dropdown: #161618;
           --demo-dropdown-border: #26262a;
         }
        * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
        html { scroll-behavior: auto; }
        body { background: var(--bg); color: var(--text-primary); margin: 0; overflow-x: hidden; }
        ::selection { background: rgba(247, 152, 30, 0.2); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
      `}</style>
      {children}
    </div>
  );
}
