import type { Metadata } from 'next';
import { SheetsCatalog } from '@/components/sheets/catalog';

export const metadata: Metadata = {
  title: 'DSA Sheets',
  description:
    'Browse popular DSA problem sheets — Striver, NeetCode, Blind 75, Love Babbar and more — and add them to your spaced repetition tracker.',
};

export default function SheetsPage() {
  return <SheetsCatalog />;
}
