import { Sidebar } from '@/components/sidebar';
import { Providers } from '@/components/providers';
import { MobileNav } from '@/components/app/mobile-nav';
import '@/app/mobile.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main
          data-main-content
          style={{
            marginLeft: 240,
            flex: 1,
            minHeight: '100vh',
            background: 'var(--background)',
            color: 'var(--foreground)',
            padding: '32px 40px',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
        <MobileNav />
      </div>
    </Providers>
  );
}
