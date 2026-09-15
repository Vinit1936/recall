'use client';

import { PlatformLogo } from '@/lib/platforms/logos';
import { Bookmark } from 'lucide-react';

export type TabKey =
  | 'all'
  | 'bookmarked'
  | 'due'
  | 'status'
  | 'topic'
  | 'LEETCODE'
  | 'CODEFORCES'
  | 'CODECHEF'
  | 'GFG'
  | 'HACKERRANK';

type TabBarProps = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
};

const TABS: { key: TabKey; label: string; isSmallIcon?: boolean; platform?: string; size?: number; padding?: number }[] = [
  { key: 'all', label: 'All Problems' },
  { key: 'due', label: 'Due Today' },
  { key: 'status', label: 'By Status' },
  { key: 'topic', label: 'By Topic' },
  { key: 'LEETCODE', label: 'LeetCode', platform: 'LEETCODE', size: 21, padding: 2 },
  { key: 'CODEFORCES', label: 'Codeforces', platform: 'CODEFORCES', size: 21, padding: 2 },
  { key: 'CODECHEF', label: 'CodeChef', platform: 'CODECHEF', size: 18, padding: 2 },
  { key: 'GFG', label: 'GeeksForGeeks', platform: 'GFG', size: 21, padding: 2 },
  { key: 'HACKERRANK', label: 'HackerRank', platform: 'HACKERRANK', size: 18, padding: 0 },
  { key: 'bookmarked', label: 'Bookmarked', isSmallIcon: true },
];

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div data-tab-bar-wrapper style={{ position: 'relative' }}>
      <div
        data-table-tabs
        data-tab-bar
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
        }}
      >
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const isPlatformTab = !!tab.platform;
        const isSmallIcon = !!tab.isSmallIcon;
        const defaultOpacity = isPlatformTab && !isActive ? 0.8 : 1;

        if (isSmallIcon) {
          return (
            <button
              key={tab.key}
              data-tab-item
              data-active={isActive ? 'true' : 'false'}
              onClick={() => onChange(tab.key)}
              title="Bookmarked problems"
              style={{
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                boxShadow: isActive ? 'inset 0 -2px 0 var(--foreground)' : 'none',
                color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                cursor: 'pointer',
                fontSize: 14,
                padding: '8px 10px',
                marginLeft: 2,
                marginRight: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--foreground)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--muted-foreground)';
              }}
            >
              <Bookmark size={15} fill={isActive ? 'currentColor' : 'none'} />
            </button>
          );
        }

        return (
          <button
            key={tab.key}
            data-tab-item
            data-active={isActive ? 'true' : 'false'}
            {...(isPlatformTab ? { 'data-platform-filter-icons': 'true' } : {})}
            onClick={() => onChange(tab.key)}
            title={tab.label}
            style={{
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: 'none',
              boxShadow: isActive ? 'inset 0 -2px 0 var(--foreground)' : 'none',
              color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              padding: isPlatformTab ? '8px 12px' : '8px 16px',
              marginLeft: 2,
              marginRight: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, box-shadow 0.15s, opacity 0.15s ease',
              opacity: defaultOpacity,
            }}
            onMouseEnter={(e) => {
              if (isPlatformTab && !isActive) e.currentTarget.style.opacity = '1';
              if (!isActive) e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              if (isPlatformTab && !isActive) e.currentTarget.style.opacity = '0.8';
              if (!isActive) e.currentTarget.style.color = 'var(--muted-foreground)';
            }}
          >
            {isPlatformTab ? (
              <PlatformLogo platform={tab.platform!} size={tab.size ?? 18} padding={tab.padding} />
            ) : (
              <span>{tab.label}</span>
            )}
          </button>
        );
      })}
    </div>
    </div>
  );
}
