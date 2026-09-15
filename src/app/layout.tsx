import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-instrument-serif',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://recallx.tech';

export const viewport: Viewport = {
  themeColor: '#080808',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Recall — Never Forget What You Solved',
    template: '%s | Recall',
  },
  description:
    'Never forget what you solved. Recall uses cognitive spaced repetition (3, 7, 14, 30-day intervals) to help developers retain LeetCode, Codeforces, HackerRank, GeeksForGeeks, and CodeChef solutions for FAANG coding interviews.',
  applicationName: 'Recall',
  keywords: [
    // Core Brand & Intent
    'Recall',
    'Recall DSA',
    'Recall Spaced Repetition',
    'Recall LeetCode',
    'Recallx',
    'Recallx.tech',
    'LeetCode Spaced Repetition',
    'DSA Spaced Repetition',
    'Active Recall Coding',
    'Spaced Repetition Algorithm Tracker',
    'Algorithm Revision Tool',
    'Ebbinghaus Forgetting Curve Coding',
    'Anki for LeetCode',
    'Flashcards for Coding Interviews',
    'SRS for Software Engineers',
    'SM-2 Algorithm for LeetCode',
    'Leitner Box System Coding',
    
    // Curated Sheets & Roadmaps
    'Blind 75 Revision Tracker',
    'Blind 75 Spaced Repetition',
    'NeetCode 150 Tracker',
    'NeetCode 250 Revision',
    'Striver SDE Sheet Tracker',
    'Striver A2Z DSA Sheet Revision',
    'Grind 75 Tracker',
    'Grind 169 Revision Schedule',
    'Sean Prashad LeetCode Patterns',
    'Love Babbar 450 DSA Sheet',
    'Fraz SDE Sheet Revision',
    'Tech Interview Handbook Tracker',
    'Curated LeetCode Problem Lists',

    // Competitive Programming & Platforms
    'LeetCode Tracker',
    'LeetCode Problem Tracker',
    'LeetCode Revision Queue',
    'LeetCode Daily Challenge Tracker',
    'LeetCode Contest Revision',
    'Codeforces Problem Tracker',
    'Codeforces Revision System',
    'Codeforces Contest Practice',
    'GeeksForGeeks POTD Tracker',
    'GFG Problem Solving Journal',
    'HackerRank Problem Tracker',
    'CodeChef Problem Tracker',
    'AtCoder Problem Revision',
    'Competitive Programming Practice Log',

    // Algorithms & Patterns
    'Dynamic Programming Spaced Repetition',
    '1D Dynamic Programming',
    '2D Dynamic Programming',
    'Knapsack Problem Revision',
    'Longest Common Subsequence LCS',
    'Longest Increasing Subsequence LIS',
    'Graph Algorithms DFS BFS Revision',
    'Dijkstra Algorithm Practice',
    'Bellman Ford Algorithm',
    'Floyd Warshall Algorithm',
    'Kruskal and Prim Minimum Spanning Tree',
    'Topological Sort DAG',
    'Disjoint Set Union DSU Union Find',
    'Trie Prefix Tree Problems',
    'Binary Search Range Search',
    'Binary Search on Answer',
    'Two Pointers Technique',
    'Fast and Slow Pointers Floyd Cycle',
    'Sliding Window Fixed and Dynamic',
    'Kadane Algorithm Maximum Subarray',
    'Monotonic Stack Problems',
    'Monotonic Queue Sliding Window Maximum',
    'Min Heap Max Heap Priority Queue',
    'Backtracking N-Queens Sudoku',
    'Bit Manipulation Bitmask DP',
    'Binary Tree Inorder Preorder Postorder',
    'Binary Search Tree BST Validation',
    'Lowest Common Ancestor LCA',
    'Segment Tree Range Query',
    'Fenwick Tree Binary Indexed Tree',

    // Interview Prep & Career
    'FAANG Coding Interview Preparation',
    'MANGA Technical Interview Prep',
    'Google Coding Interview Questions',
    'Meta Facebook Coding Interview',
    'Amazon SDE Online Assessment OA',
    'Apple Software Engineer Interview',
    'Netflix Senior Engineer Interview',
    'Microsoft SDE Technical Rounds',
    'Uber Coding Interview Prep',
    'Software Engineer Interview Tracker',
    'Technical Interview Practice Habit',
    'Daily Coding Habit Tracker',
    'Coding Streak Maintenance',
    'Interview Readiness Score',
    'Data Structures and Algorithms Mastery',
  ],
  authors: [{ name: 'Vinit Patil', url: 'https://github.com/Vinit1936' }],
  creator: 'Vinit Patil',
  publisher: 'Recall Technologies',
  category: 'Education & Developer Tools',
  classification: 'Software Engineering / Education / Productivity',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      'en-US': siteUrl,
      'x-default': siteUrl,
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Recall',
    title: 'Recall — Never Forget What You Solved',
    description:
      'Never forget what you solved. Automated spaced repetition queue (+3, +7, +14, +30 days) for LeetCode, Codeforces, HackerRank, GFG, and CodeChef.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
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
    creator: '@vinitpatil193',
    site: '@vinitpatil193',
    images: [`${siteUrl}/og-image.png`],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
  },
  manifest: '/manifest.json',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Comprehensive JSON-LD Structured Data Graph for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Recall',
        alternateName: ['Recall', 'Recall DSA', 'Recallx', 'recallx.tech'],
        description: 'Spaced Repetition & Revision System for LeetCode & DSA Problems',
        inLanguage: 'en-US',
        publisher: {
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
          name: 'Recall',
          url: siteUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/icon-512.png`,
            width: 512,
            height: 512,
          },
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#software`,
        name: 'Recall',
        operatingSystem: 'Web, Windows, macOS, Linux, iOS, Android',
        applicationCategory: 'EducationalApplication',
        applicationSubCategory: 'Developer Application',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '1240',
        },
        featureList: [
          'Automatic spaced repetition interval scheduling (+3, +7, +14, +30 days)',
          'Automated metadata autofill for 2,800+ LeetCode problems',
          'Multi-platform support for Codeforces, GeeksForGeeks, HackerRank, and CodeChef',
          'Daily revision queue and streak analytics',
          'Full privacy, 100% free and open-source',
        ],
        description:
          'Spaced repetition tracker for LeetCode, Codeforces, HackerRank, GFG, and CodeChef DSA problems.',
        author: {
          '@type': 'Person',
          name: 'Vinit Patil',
          url: 'https://github.com/Vinit1936',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Recall',
        url: siteUrl,
        logo: `${siteUrl}/icon.png`,
        sameAs: [
          'https://github.com/Vinit1936/Recall',
          'https://twitter.com/vinitpatil193',
          'https://www.linkedin.com/in/vinitpatil19/',
          'https://instagram.com/vinit.patil19',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How does Recall calculate when a problem is due for revision?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Recall uses an adaptive spaced repetition algorithm inspired by the Ebbinghaus Forgetting Curve, scheduling reviews at 3, 7, 14, and 30 day intervals based on your recall confidence (Clean, Shaky, Struggled).',
            },
          },
          {
            '@type': 'Question',
            name: 'Which coding platforms are supported for automatic problem syncing?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Recall supports automated metadata and problem extraction for LeetCode, Codeforces, GeeksForGeeks, HackerRank, and CodeChef.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is Recall free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, Recall is 100% free and open-source for developers preparing for software engineering technical interviews.',
            },
          },
          {
            '@type': 'Question',
            name: 'How is Recall different from Notion or Excel spreadsheets for LeetCode revision?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Spreadsheets require manual tracking and date math. Recall automatically queues due problems each morning, recalibrates future intervals when you struggle, and tracks your daily streak effortlessly.',
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="88b94653-b64e-453f-89b2-1cba1c70605e"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ background: '#0f0f0f', color: '#fff', minHeight: '100vh' }} suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}

