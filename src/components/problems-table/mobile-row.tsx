'use client';

import { PlatformLogo } from '@/lib/platforms/logos';
import { getDifficultyStyle } from './columns';
import { getTopicColor } from '@/lib/topic-colors';
import { Pill } from '@/components/ui/pill';
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

      {/* Line 3: Companies & Solution (Leet-Vision) */}
      {(() => {
        const rawCompanies = problem?.customFields?.companies ?? problem?.companies;
        const companies: string[] = Array.isArray(rawCompanies) ? rawCompanies : [];
        const customSolUrl = problem?.customFields?.solutionUrl ?? problem?.solutionUrl;
        const isLeetCode = problem?.platform === 'LEETCODE' && problem?.problemNumber > 0;
        const solutionUrl = customSolUrl || (isLeetCode ? `https://leet-vision.com/solution/${problem.problemNumber}` : null);

        if (companies.length === 0 && !solutionUrl) return null;

        return (
          <div
            style={{
              marginTop: 6,
              marginLeft: 26,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            {companies.slice(0, 2).map((comp: string) => (
              <span
                key={comp}
                style={{
                  fontSize: 10,
                  padding: '1px 6px',
                  borderRadius: 3,
                  background: 'rgba(56, 189, 248, 0.08)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  fontFamily: 'var(--font-geist-mono), monospace',
                }}
              >
                {comp}
              </span>
            ))}
            {companies.length > 2 && (
              <span style={{ fontSize: 9.5, color: '#888', fontFamily: 'var(--font-geist-mono), monospace' }}>
                +{companies.length - 2}
              </span>
            )}
            {solutionUrl && (
              <a
                href={solutionUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 4,
                  background: 'rgba(249, 115, 22, 0.1)',
                  color: '#fb923c',
                  border: '1px solid rgba(249, 115, 22, 0.25)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span>▶ Solution</span>
              </a>
            )}
          </div>
        );
      })()}
    </div>
  );
}
