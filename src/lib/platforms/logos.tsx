import * as React from 'react';

// @ts-ignore
import HackerRankImg from '../../../utils/HackerRank.png';

export type PlatformLogoProps = {
  platform: string;
  size?: number;
  padding?: number;
  borderRadius?: number | string;
  background?: string;
  className?: string;
  style?: React.CSSProperties;
};

type LogoConfigItem = {
  light: string;
  dark: string;
  fallbackLight?: string;
  fallbackDark?: string;
  hasThemeVariant: boolean;
  opacity?: number;
};

const hackerRankSrc = typeof HackerRankImg === 'string' ? HackerRankImg : HackerRankImg?.src || '/HackerRank.png';

const LOGO_CONFIG: Record<string, LogoConfigItem> = {
  LEETCODE: {
    light: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/leetcode.svg',
    dark: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/leetcode-dark.svg',
    fallbackLight: '/leetcode.svg',
    fallbackDark: '/leetcode-dark.svg',
    hasThemeVariant: true,
  },
  CODEFORCES: {
    light: '/codeforces.svg',
    dark: '/codeforces.svg',
    fallbackLight: '/codeforces.svg',
    fallbackDark: '/codeforces.svg',
    hasThemeVariant: false,
  },
  GFG: {
    light: 'https://cdn.simpleicons.org/geeksforgeeks/2F8D46',
    dark: 'https://cdn.simpleicons.org/geeksforgeeks/2F8D46',
    fallbackLight: '/gfg.svg',
    fallbackDark: '/gfg.svg',
    hasThemeVariant: false,
  },
  HACKERRANK: {
    light: hackerRankSrc,
    dark: hackerRankSrc,
    fallbackLight: '/HackerRank.png',
    fallbackDark: '/HackerRank.png',
    hasThemeVariant: false,
  },
  CODECHEF: {
    light: 'https://cdn.simpleicons.org/codechef/000000',
    dark: 'https://cdn.simpleicons.org/codechef/FFFFFF',
    fallbackLight: '/codechef.svg',
    fallbackDark: '/codechef-dark.svg',
    hasThemeVariant: true,
  },
};

export function normalizePlatform(platform: string = ''): string {
  const p = (platform || '').trim().toUpperCase();
  if (p === 'GEEKSFORGEEKS' || p === 'GEEKS_FOR_GEEKS') return 'GFG';
  if (p === 'HACKER_RANK') return 'HACKERRANK';
  if (p === 'CODE_CHEF') return 'CODECHEF';
  if (p === 'CODE_FORCES') return 'CODEFORCES';
  if (p === 'LEET_CODE') return 'LEETCODE';
  return p;
}

export function PlatformLogo({
  platform = 'LEETCODE',
  size = 20,
  padding = 0,
  borderRadius = 4,
  background = 'transparent',
  className = '',
  style,
}: PlatformLogoProps) {
  const key = normalizePlatform(platform);
  const cfg = LOGO_CONFIG[key] || LOGO_CONFIG['LEETCODE'];
  const br = borderRadius ?? 4;

  const imgOpacity = cfg.opacity ?? 1;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background,
        borderRadius: br,
        padding,
        boxSizing: 'border-box',
        ...style,
      }}
      title={platform}
    >
      {cfg.hasThemeVariant ? (
        <>
          <img
            src={cfg.light}
            alt={platform}
            style={imgOpacity !== 1 ? { opacity: imgOpacity } : undefined}
            className="platform-logo-light block w-full h-full object-contain pointer-events-none"
            onError={(e) => {
              if (cfg.fallbackLight && !e.currentTarget.src.endsWith(cfg.fallbackLight)) {
                e.currentTarget.src = cfg.fallbackLight;
              }
            }}
          />
          <img
            src={cfg.dark}
            alt={platform}
            style={imgOpacity !== 1 ? { opacity: imgOpacity } : undefined}
            className="platform-logo-dark hidden w-full h-full object-contain pointer-events-none"
            onError={(e) => {
              if (cfg.fallbackDark && !e.currentTarget.src.endsWith(cfg.fallbackDark)) {
                e.currentTarget.src = cfg.fallbackDark;
              }
            }}
          />
        </>
      ) : (
        <img
          src={cfg.light}
          alt={platform}
          style={imgOpacity !== 1 ? { opacity: imgOpacity } : undefined}
          className="block w-full h-full object-contain pointer-events-none"
          onError={(e) => {
            if (cfg.fallbackLight && !e.currentTarget.src.endsWith(cfg.fallbackLight)) {
              e.currentTarget.src = cfg.fallbackLight;
            }
          }}
        />
      )}
    </span>
  );
}
