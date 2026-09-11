// GET /api/github/stars — returns current GitHub stars count for Vinit1936/Recall

export const revalidate = 3600;

export async function GET() {
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Recall-App',
      Accept: 'application/vnd.github+json',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch('https://api.github.com/repos/Vinit1936/Recall', {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return Response.json(
        { stars: 4, isFallback: true },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
          },
        }
      );
    }

    const data = await res.json();
    const stars = typeof data.stargazers_count === 'number' ? data.stargazers_count : 4;

    return Response.json(
      { stars, isFallback: false },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching GitHub stars:', error);
    return Response.json(
      { stars: 4, isFallback: true },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
        },
      }
    );
  }
}
