'use client';

import { PlatformLogo } from '@/lib/platforms/logos';
import { getDifficultyStyle, getTopicColor, Pill } from './columns';
import { StatusCell } from './row';
import { Star } from 'lucide-react';

type MobileRowProps = {
  problem: any;
  isSelected?: boolean;
  onStarToggle: (id: string, current: boolean) => void;
};

export function MobileRow({ problem, isSelected, onStarToggle }: MobileRowProps) {
  const diffStyle = getDifficultyStyle(problem.difficulty);
  const topicColor = getTopicColor(problem.topic || '');

  const handleClick = () => {
    if (problem.url) {
      window.open(problem.url, '_blank', 'noopener,noreferrer');
    }
  };

  const problemCode = typeof problem.problemNumber === 'number' && problem.problemNumber > 0 
    ? String(problem.problemNumber) 
    : (problem.code || '');

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #141414',
        background: isSelected ? '#161618' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Line 1: Platform logo, Problem number/code, Title, Star icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <PlatformLogo platform={problem.platform} size={18} />
        {problemCode && (
          <span
            style={{
              fontSize: 12,
              color: '#666666',
              fontFamily: 'var(--font-geist-mono), monospace',
              flexShrink: 0,
            }}
          >
            {problemCode}
          </span>
        )}
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#e5e5e5',
            fontFamily: 'var(--font-geist-sans), sans-serif',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {problem.title}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStarToggle(problem.id, problem.isFavorite);
          }}
          title={problem.isFavorite ? 'Unstar problem' : 'Star problem'}
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            minWidth: 32,
            minHeight: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Star
            size={16}
            fill={problem.isFavorite ? '#eab308' : 'none'}
            color={problem.isFavorite ? '#eab308' : '#444444'}
          />
        </button>
      </div>

      {/* Line 2: Difficulty pill, Topic pill, Status */}
      <div
        style={{
          marginTop: 6,
          marginLeft: 26,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 10 }}>
          <Pill bg={diffStyle.bg} text={diffStyle.text} border={diffStyle.border}>
            {problem.difficulty ? problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase() : '—'}
          </Pill>
        </span>
        {problem.topic && (
          <span style={{ fontSize: 10 }}>
            <Pill bg={topicColor.bg} text={topicColor.text} border={topicColor.border}>
              {problem.topic}
            </Pill>
          </span>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <StatusCell problem={problem} />
        </div>
      </div>
    </div>
  );
}
