export type TopicColor = { bg: string; text: string; border: string };

const TOPIC_COLOR_SLOTS = 12;

/**
 * Return the theme slot for a topic. The values are CSS variables rather than
 * literal colors so every caller follows the active light/dark theme.
 */
export function getTopicColor(topic: string): TopicColor {
  const normalizedTopic = topic.trim().toLowerCase();
  if (!normalizedTopic) {
    return { bg: 'var(--muted)', text: 'var(--muted-foreground)', border: 'var(--border)' };
  }

  let hash = 0;
  for (let i = 0; i < normalizedTopic.length; i++) {
    hash = normalizedTopic.charCodeAt(i) + ((hash << 5) - hash);
  }

  const slot = (Math.abs(hash) % TOPIC_COLOR_SLOTS) + 1;
  return {
    bg: `var(--topic-${slot}-bg)`,
    text: `var(--topic-${slot}-text)`,
    border: `var(--topic-${slot}-border)`,
  };
}
