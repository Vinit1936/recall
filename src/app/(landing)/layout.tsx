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
    absolute: 'Recall | Turn Solved Problems Into Lasting Intuition',
  },
  description:
    'Automated spaced repetition queue for LeetCode, Codeforces, and DSA. Revisit questions right before you forget them, so you remember patterns in your interviews.',
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
    title: 'Recall | Turn Solved Problems Into Lasting Intuition',
    description:
      'Automated spaced repetition queue for LeetCode, Codeforces, GFG, HackerRank, and CodeChef.',
    images: [
      {
        url: 'https://recallx.tech/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Recall | Turn Solved Problems Into Lasting Intuition',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recall | Turn Solved Problems Into Lasting Intuition',
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
          --bg: #fcfcfb;
          --background: #fcfcfb;
          --surface: #ffffff;
          --nav-bg: rgba(252, 252, 251, 0.85);
          --border: #e4e4e7;
          --border-subtle: #f4f4f5;
          --text-primary: #09090b;
          --text-secondary: #64748b;
          --text-tertiary: #64748b;
          --text-disabled: #cbd5e1;
          --easy-bg: rgba(34, 197, 94, 0.14);
          --easy-text: #15803d;
          --easy-border: rgba(34, 197, 94, 0.28);
          --medium-bg: rgba(249, 115, 22, 0.14);
          --medium-text: #c2410c;
          --medium-border: rgba(249, 115, 22, 0.28);
           --hard-bg: rgba(239, 68, 68, 0.14);
           --hard-text: #b91c1c;
           --hard-border: rgba(239, 68, 68, 0.28);
           --demo-bg: #ffffff;
           --demo-surface: #fafafa;
           --demo-surface-raised: #f4f4f5;
           --demo-surface-hover: #e4e4e7;
           --demo-border: #e4e4e7;
           --demo-border-subtle: #f1f1f3;
           --demo-text: #18181b;
           --demo-text-muted: #64748b;
           --demo-text-faint: #64748b;
           --demo-placeholder: #a1a1aa;
           --demo-control: #f4f4f5;
           --demo-control-active: #e4e4e7;
           --demo-control-border: #d4d4d8;
           --demo-dropdown: #ffffff;
           --demo-dropdown-border: #d4d4d8;
         }
         .dark {
          --bg: #0a0a0a;
          --background: #0a0a0a;
          --surface: #0f0f0f;
          --nav-bg: rgba(10, 10, 10, 0.85);
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
          --demo-bg: #121214;
          --demo-surface: #18181b;
          --demo-surface-raised: #1c1c20;
          --demo-surface-hover: #27272a;
          --demo-border: #27272a;
          --demo-border-subtle: #1f1f23;
          --demo-text: #f4f4f5;
          --demo-text-muted: #a1a1aa;
          --demo-text-faint: #71717a;
          --demo-placeholder: #52525b;
          --demo-control: #1f1f23;
          --demo-control-active: #27272a;
          --demo-control-border: #3f3f46;
          --demo-dropdown: #18181b;
          --demo-dropdown-border: #3f3f46;
         }
        * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
        html { scroll-behavior: auto; }
        body { background: var(--bg); color: var(--text-primary); margin: 0; overflow-x: hidden; }
        ::selection { background: rgba(247, 152, 30, 0.2); }
        .dark ::selection { background: rgba(255, 255, 255, 0.08); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
        .dark ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 2px; }
      `}</style>
      {children}
    </div>
  );
}
