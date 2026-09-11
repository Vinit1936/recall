import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from './route';

describe('GET /api/github/stars', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns stargazers count when GitHub API succeeds', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ stargazers_count: 12 }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ stars: 12, isFallback: false });
  });

  it('returns fallback count when GitHub API returns non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ stars: 4, isFallback: true });
  });

  it('returns fallback count when GitHub API throws an error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ stars: 4, isFallback: true });
  });
});
