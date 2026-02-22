// app/api/ai-recommend/route.ts
// Real AI recommendation using Groq with natural language processing
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callGroq(messages: GroqMessage[], maxTokens = 500): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function searchTMDB(query: string, genreIds?: number[]): Promise<any[]> {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY || '',
    query,
    page: '1',
  });

  const searchRes = await fetch(`${TMDB_BASE}/search/tv?${params}`);
  const searchData = await searchRes.json();
  let results = searchData.results || [];

  // Also fetch by genres if provided
  if (genreIds && genreIds.length > 0) {
    const discoverParams = new URLSearchParams({
      api_key: TMDB_API_KEY || '',
      with_genres: genreIds.join(','),
      sort_by: 'vote_average.desc',
      'vote_count.gte': '100',
    });
    const discoverRes = await fetch(`${TMDB_BASE}/discover/tv?${discoverParams}`);
    const discoverData = await discoverRes.json();
    
    // Merge and deduplicate
    const existingIds = new Set(results.map((r: any) => r.id));
    for (const item of (discoverData.results || [])) {
      if (!existingIds.has(item.id)) {
        results.push(item);
        existingIds.add(item.id);
      }
    }
  }

  return results.slice(0, 20);
}

async function getTMDBGenres(): Promise<Record<string, number>> {
  const res = await fetch(`${TMDB_BASE}/genre/tv/list?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  const map: Record<string, number> = {};
  for (const g of (data.genres || [])) {
    map[g.name.toLowerCase()] = g.id;
  }
  return map;
}

export async function POST(request: NextRequest) {
  try {
    const { query, mood, history } = await request.json();

    if (!GROQ_API_KEY) {
      return NextResponse.json({ success: false, error: 'Groq API key not configured' }, { status: 500 });
    }

    // Step 1: Use Groq to parse the query into structured data
    const parsePrompt: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a TV show recommendation AI. Parse the user's query and extract:
- genres: array of genre names (e.g. ["thriller", "sci-fi", "mystery"])
- themes: array of themes/keywords (e.g. ["time travel", "mind-bending", "dark"])
- tone: one of [dark, light, action, dramatic, funny, romantic, scary, inspiring]
- searchTerms: 2-3 TV show search terms to find similar content
- explanation: brief explanation of what you understood

Respond ONLY with valid JSON. No markdown, no extra text.`
      },
      {
        role: 'user',
        content: `User query: "${query || mood || 'popular shows'}"
${history?.length ? `User has watched: ${history.join(', ')}` : ''}`
      }
    ];

    let parsed: any = {};
    try {
      const parseResponse = await callGroq(parsePrompt, 300);
      parsed = JSON.parse(parseResponse.replace(/```json|```/g, '').trim());
    } catch {
      parsed = {
        genres: ['drama', 'thriller'],
        themes: ['engaging'],
        tone: 'dramatic',
        searchTerms: [query || 'popular drama'],
        explanation: 'Finding great shows for you'
      };
    }

    // Step 2: Get TMDB genre IDs
    const genreMap = await getTMDBGenres();
    const genreIds = (parsed.genres || [])
      .map((g: string) => genreMap[g.toLowerCase()])
      .filter(Boolean);

    // Step 3: Fetch series from TMDB
    const searchTerm = (parsed.searchTerms || [query || 'popular'])[0];
    const tmdbResults = await searchTMDB(searchTerm, genreIds);

    // Step 4: Use Groq to rank and explain results
    if (tmdbResults.length === 0) {
      return NextResponse.json({ success: true, data: [], explanation: parsed.explanation });
    }

    const rankPrompt: GroqMessage[] = [
      {
        role: 'system',
        content: `You are a TV show recommendation AI. Given a user's query and a list of shows, select the best 8 matches and provide a short explanation (1-2 sentences) for each.

Respond ONLY with valid JSON array format:
[{"id": number, "explanation": "string", "matchScore": 0-100, "matchReasons": ["reason1", "reason2"]}]`
      },
      {
        role: 'user',
        content: `Query: "${query || mood}"
Parsed intent: ${JSON.stringify(parsed)}

Available shows:
${tmdbResults.slice(0, 15).map(s => `ID:${s.id} "${s.name}" (${s.first_air_date?.slice(0,4)}) Rating:${s.vote_average?.toFixed(1)} - ${s.overview?.slice(0, 100)}`).join('\n')}

Select best 8 matches with explanations.`
      }
    ];

    let rankings: any[] = [];
    try {
      const rankResponse = await callGroq(rankPrompt, 600);
      rankings = JSON.parse(rankResponse.replace(/```json|```/g, '').trim());
    } catch {
      rankings = tmdbResults.slice(0, 8).map((s, i) => ({
        id: s.id,
        explanation: `Highly rated ${parsed.genres?.[0] || 'drama'} series with strong reviews.`,
        matchScore: 90 - i * 5,
        matchReasons: ['Genre match', 'High rating'],
      }));
    }

    // Step 5: Merge TMDB data with AI rankings
    const enriched = rankings
      .map(r => {
        const series = tmdbResults.find(s => s.id === r.id);
        if (!series) return null;
        return {
          ...series,
          aiExplanation: r.explanation,
          matchScore: r.matchScore || 85,
          matchReasons: r.matchReasons || ['Great match'],
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: enriched,
      queryExplanation: parsed.explanation || `Found shows matching: ${query || mood}`,
      parsedIntent: parsed,
    });

  } catch (error) {
    console.error('AI recommend error:', error);
    return NextResponse.json(
      { success: false, error: 'AI recommendation failed' },
      { status: 500 }
    );
  }
}
