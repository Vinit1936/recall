import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Get in Touch',
  description:
    'Have feedback, bug reports, feature requests, or questions about spaced repetition algorithms? Reach out directly.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
