'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';

export function RetentionChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const decayPathRef = useRef<SVGPathElement>(null);
  const spacedPathRef = useRef<SVGPathElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-80px' });

  const [decayLength, setDecayLength] = useState(650);
  const [spacedLength, setSpacedLength] = useState(800);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (decayPathRef.current) {
      try {
        setDecayLength(decayPathRef.current.getTotalLength());
      } catch (e) {}
    }
    if (spacedPathRef.current) {
      try {
        setSpacedLength(spacedPathRef.current.getTotalLength());
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (isInView && !animated) {
      setAnimated(true);
    }
  }, [isInView, animated]);

  const decayD = 'M 40 65 C 200 80, 350 180, 660 260';
  const spacedD = 'M 40 70 C 80 110, 140 160, 185 175 L 185 90 C 220 75, 280 120, 330 150 L 330 75 C 370 65, 430 100, 475 125 L 475 65 C 520 55, 600 70, 660 80';

  const markers = [
    { x: 40, day: 'Day 0', sub: 'Initial Solve', dotY: 70, dotColor: '#e5e5e5', delay: 0.5 },
    { x: 185, day: 'Day 3', sub: '1st Review', dotY: 90, dotColor: '#e5e5e5', delay: 1.0 },
    { x: 330, day: 'Day 7', sub: '2nd Review', dotY: 75, dotColor: '#e5e5e5', delay: 1.5 },
    { x: 475, day: 'Day 14', sub: '3rd Review', dotY: 65, dotColor: '#e5e5e5', delay: 2.0 },
    { x: 660, day: 'Day 30', sub: 'Mastered', dotY: 80, dotColor: '#4ade80', subColor: '#4ade80', delay: 2.5 },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        background: 'var(--surface)',
        padding: '24px 16px 16px',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        transition: 'background 0.2s ease',
      }}
    >
      <svg
        viewBox="0 0 700 360"
        style={{ width: '100%', height: '100%', display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
        aria-label="Ebbinghaus Forgetting Curve vs Spaced Repetition Chart"
        suppressHydrationWarning
      >
        {/* Legend */}
        <g>
          <line
            x1="40"
            y1="30"
            x2="60"
            y2="30"
            stroke="#f87171"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />
          <text
            x="68"
            y="33"
            fill="var(--text-secondary)"
            fontSize="10"
            fontFamily="var(--font-geist-mono), monospace"
          >
            Forgetting curve
          </text>

          <line
            x1="200"
            y1="30"
            x2="220"
            y2="30"
            stroke="var(--text-primary)"
            strokeWidth="2"
          />
          <text
            x="228"
            y="33"
            fill="var(--text-secondary)"
            fontSize="10"
            fontFamily="var(--font-geist-mono), monospace"
          >
            With spaced repetition
          </text>
        </g>

        {/* Horizontal grid lines */}
        {[100, 160, 220, 280].map((y) => (
          <line
            key={y}
            x1="40"
            y1={y}
            x2="660"
            y2={y}
            stroke="var(--border)"
            strokeWidth="1"
          />
        ))}

        {/* Forgetting curve — red dashed */}
        <path
          ref={decayPathRef}
          d={decayD}
          fill="none"
          stroke="#f87171"
          strokeWidth="1.5"
          strokeDasharray={`${decayLength} ${decayLength}`}
          strokeDashoffset={animated ? 0 : decayLength}
          style={{
            transition: animated ? 'stroke-dashoffset 1.5s ease-out 0s' : 'none',
          }}
          opacity="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          suppressHydrationWarning
        />

        {/* Spaced repetition curve — white/light */}
        <path
          ref={spacedPathRef}
          d={spacedD}
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="2"
          strokeDasharray={`${spacedLength} ${spacedLength}`}
          strokeDashoffset={animated ? 0 : spacedLength}
          style={{
            transition: animated ? 'stroke-dashoffset 2s ease-out 0.5s' : 'none',
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
          suppressHydrationWarning
        />

        {/* Review dots */}
        {markers.map((m) => (
          <circle
            key={m.day}
            cx={m.x}
            cy={m.dotY}
            r="5"
            fill={m.subColor || 'var(--text-primary)'}
            opacity={animated ? 1 : 0}
            style={{
              transition: animated ? `opacity 0.2s ease-out ${m.delay}s` : 'none',
            }}
          />
        ))}

        {/* X axis labels */}
        {markers.map((m) => (
          <g key={m.day}>
            <text
              x={m.x}
              y="300"
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize="10"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {m.day}
            </text>
            <text
              x={m.x}
              y="315"
              textAnchor="middle"
              fill={m.subColor || 'var(--text-tertiary)'}
              fontSize="10"
              fontFamily="var(--font-geist-mono), monospace"
            >
              {m.sub}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
