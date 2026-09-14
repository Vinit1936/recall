import * as React from 'react';

// @ts-ignore
import LeetCodeImg from '../../../utils/LeetCode.png';
// @ts-ignore
import CodeforcesImg from '../../../utils/Codeforces.png';
// @ts-ignore
import GFGImg from '../../../utils/gfg.png';
// @ts-ignore
import HackerRankImg from '../../../utils/HackerRank.png';
// @ts-ignore
import CodeChefImg from '../../../utils/CodeChef.png';

type PlatformLogoProps = {
  platform: string;
  size?: number;
  padding?: number;
  borderRadius?: number | string;
};

const LOGO_CONFIG: Record<string, { img: any; bg: string; padding: number }> = {
  LEETCODE:   { img: LeetCodeImg,   bg: 'var(--accent)', padding: 3 },
  CODEFORCES: { img: CodeforcesImg, bg: 'var(--accent)', padding: 3 },
  GFG:        { img: GFGImg,        bg: 'var(--accent)', padding: 3 },
  HACKERRANK: { img: HackerRankImg, bg: 'transparent', padding: 0 },
  CODECHEF:   { img: CodeChefImg,   bg: '#f5f0eb', padding: 3 },
};

function normalizePlatform(platform: string = ''): string {
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
  size = 24,
  padding,
  borderRadius = 4,
}: PlatformLogoProps) {
  const key = normalizePlatform(platform);
  const cfg = LOGO_CONFIG[key] || LOGO_CONFIG['LEETCODE'];

  const pad = padding ?? cfg.padding;
  const src = typeof cfg.img === 'string' ? cfg.img : cfg.img?.src;
  const br = borderRadius ?? 4;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        background: cfg.bg,
        borderRadius: br,
        padding: pad,
        flexShrink: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      title={platform}
    >
      <img
        src={src}
        alt={platform}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: typeof br === 'number' ? `${Math.max(0, br - 1)}px` : br,
        }}
      />
    </span>
  );
}
