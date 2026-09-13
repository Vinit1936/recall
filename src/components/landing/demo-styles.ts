import { getTopicColor } from '@/lib/topic-colors';

export { getTopicColor };

export function getDifficultyStyle(difficulty: string): { bg: string; text: string; border: string } {
  switch (difficulty.toUpperCase()) {
    case 'EASY':
      return { bg: 'var(--easy-bg)', text: 'var(--easy-text)', border: 'var(--easy-border)' };
    case 'MEDIUM':
      return { bg: 'var(--medium-bg)', text: 'var(--medium-text)', border: 'var(--medium-border)' };
    case 'HARD':
      return { bg: 'var(--hard-bg)', text: 'var(--hard-text)', border: 'var(--hard-border)' };
    default:
      return { bg: 'var(--demo-surface-raised)', text: 'var(--demo-text-muted)', border: 'var(--demo-control-border)' };
  }
}

export const CONF_BUTTONS = {
  CLEAN: {
    label: 'Clean',
    symbol: '✓',
    doneBg: 'rgba(74, 222, 128, 0.1)',
    doneBorder: 'rgba(74, 222, 128, 0.3)',
    doneText: '#4ade80',
    hoverBorder: '#4ade80',
  },
  SHAKY: {
    label: 'Shaky',
    symbol: '~',
    doneBg: 'rgba(251, 146, 60, 0.1)',
    doneBorder: 'rgba(251, 146, 60, 0.3)',
    doneText: '#fb923c',
    hoverBorder: '#fb923c',
  },
  STRUGGLED: {
    label: 'Struggled',
    symbol: '✗',
    doneBg: 'rgba(248, 113, 113, 0.1)',
    doneBorder: 'rgba(248, 113, 113, 0.3)',
    doneText: '#f87171',
    hoverBorder: '#f87171',
  },
};
