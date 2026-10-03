import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DSA Sheets',
  description:
    'Browse popular DSA problem sheets and add them to your spaced repetition tracker.',
};

export default function SheetsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
