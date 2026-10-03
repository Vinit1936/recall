import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SheetDetail } from '@/components/sheets/sheet-detail';
import { getSheet, getSheetSummary, resolveSections } from '@/lib/sheets';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  // All seven sheets are known at build time, so the detail routes can be
  // prerendered. Note this does NOT pull every sheet into the page bundle —
  // getSheet still dynamic-imports each one on demand.
  const { SHEET_INDEX } = await import('@/lib/sheets');
  return SHEET_INDEX.sheets.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const sheet = getSheetSummary(slug);
  if (!sheet) return { title: 'Sheet not found' };

  return {
    title: sheet.title,
    description: `Browse all ${sheet.problemCount} problems in ${sheet.title} and add them to your spaced repetition tracker in one click.`,
  };
}

export default async function SheetPage({ params }: Params) {
  const { slug } = await params;

  const sheet = await getSheet(slug);
  if (!sheet) notFound();

  // Resolve the bare problem numbers against the sheet's metadata slice here on
  // the server, so the client component receives ready-to-render rows and the
  // first paint needs no data fetching.
  return <SheetDetail sheet={sheet} sections={resolveSections(sheet)} />;
}
