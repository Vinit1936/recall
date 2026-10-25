import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendDailyGoalEmail, GoalProblemItem, getOfficialProblemUrl, OFFICIAL_APP_URL } from './mail';

describe('sendDailyGoalEmail', () => {
  const sampleProblems: GoalProblemItem[] = [
    {
      id: 'p1',
      platform: 'LEETCODE',
      problemNumber: 1,
      title: 'Two Sum',
      url: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'EASY',
      topic: 'Array',
    },
    {
      id: 'p2',
      platform: 'LEETCODE',
      problemNumber: 15,
      title: '3Sum',
      url: 'https://leetcode.com/problems/3sum/',
      difficulty: 'MEDIUM',
      topic: 'Two Pointers',
    },
    {
      id: 'p3',
      platform: 'LEETCODE',
      problemNumber: 42,
      title: 'Trapping Rain Water',
      url: 'https://leetcode.com/problems/trapping-rain-water/',
      difficulty: 'HARD',
      topic: 'Dynamic Programming',
    },
  ];

  it('enforces official platform URL and never returns localhost links', () => {
    expect(OFFICIAL_APP_URL).toBe('https://recallx.tech');

    // Localhost problem URL should be replaced with official platform link
    const localhostProblem = {
      id: 'p4',
      platform: 'LEETCODE',
      problemNumber: 1,
      title: 'Two Sum',
      url: 'http://localhost:3000/problems/1',
      difficulty: 'EASY',
      topic: 'Array',
    };
    const officialUrl = getOfficialProblemUrl(localhostProblem);
    expect(officialUrl).not.toContain('localhost');
    expect(officialUrl).toBe('https://leetcode.com/problems/two-sum/');

    // Missing URL should fallback to official Recall daily queue
    const missingUrlProblem = {
      id: 'p5',
      platform: 'CODEFORCES',
      problemNumber: 100,
      title: '',
      url: '',
      difficulty: 'MEDIUM',
      topic: 'Math',
    };
    expect(getOfficialProblemUrl(missingUrlProblem)).toBe('https://recallx.tech/daily');

    // Valid external problem URL is preserved as official link
    expect(getOfficialProblemUrl(sampleProblems[0])).toBe('https://leetcode.com/problems/two-sum/');
  });

  it('runs without throwing when sending daily goal email', async () => {
    const result = await sendDailyGoalEmail({
      email: 'test@example.com',
      name: 'Vinit',
      targetCount: 5,
      streak: 4,
      problems: sampleProblems,
    });

    expect(typeof result.success).toBe('boolean');
  });

  it('handles empty problem queue gracefully', async () => {
    const result = await sendDailyGoalEmail({
      email: 'test@example.com',
      name: 'Vinit',
      targetCount: 5,
      streak: 7,
      problems: [],
    });

    expect(typeof result.success).toBe('boolean');
  });
});
