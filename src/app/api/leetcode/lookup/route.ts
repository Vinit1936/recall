// POST /api/leetcode/lookup
// Body: { titleSlug?: string; query?: string }
// Returns: ProblemMeta | { error: string }
//
// This route is the live fallback — called when the local JSON dataset
// doesn't have the problem (e.g. brand-new problems not yet in the dataset).
// It queries LeetCode's public GraphQL API server-side.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

const SLUG_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      title
      titleSlug
      difficulty
      topicTags { name }
      isPaidOnly
    }
  }
`;

const SEARCH_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        frontendQuestionId: questionFrontendId
        title
        titleSlug
        difficulty
        topicTags { name }
        isPaidOnly
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const titleSlug = typeof body.titleSlug === 'string' ? body.titleSlug.trim() : '';
    const query = typeof body.query === 'string' ? body.query.trim() : '';

    if (!titleSlug && !query) {
      return NextResponse.json({ error: 'titleSlug or query required' }, { status: 400 });
    }

    let q: any = null;

    // 1. Try lookup by titleSlug if provided
    if (titleSlug) {
      const res = await fetch(LEETCODE_GRAPHQL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
        },
        body: JSON.stringify({ query: SLUG_QUERY, variables: { titleSlug } }),
      });

      const json = await res.json();
      q = json?.data?.question;
    }

    // 2. If no slug or slug query returned nothing, and a numeric query or query string was given
    if (!q && query) {
      const isNumeric = /^\d+$/.test(query);
      const res = await fetch(LEETCODE_GRAPHQL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
        },
        body: JSON.stringify({
          query: SEARCH_QUERY,
          variables: {
            categorySlug: '',
            limit: 5,
            skip: 0,
            filters: { searchKeywords: query },
          },
        }),
      });

      const json = await res.json();
      const list = json?.data?.problemsetQuestionList?.questions || [];
      if (isNumeric) {
        q = list.find((item: any) => item.frontendQuestionId === query) || list[0];
      } else {
        q = list[0];
      }
    }

    if (!q || q.isPaidOnly) {
      return NextResponse.json({ error: 'Problem not found or is premium' }, { status: 404 });
    }

    const difficulty = (q.difficulty as string).toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD';
    const topic = q.topicTags?.[0]?.name ?? 'General';
    const problemNumber = parseInt(q.questionFrontendId, 10);

    return NextResponse.json({
      problemNumber: isNaN(problemNumber) ? undefined : problemNumber,
      title: q.title,
      difficulty,
      topic,
      url: `https://leetcode.com/problems/${q.titleSlug}/`,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch from LeetCode' }, { status: 500 });
  }
}
