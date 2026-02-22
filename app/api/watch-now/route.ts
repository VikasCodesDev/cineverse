// app/api/watch-now/route.ts
// Suggest what to watch based on available time, mood, and genre
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

// TMDB genre IDs (tv): Action=10759, Comedy=35, Drama=18, Sci-Fi=10765, Mystery=9648, etc.
const MOOD_TO_GENRES: Record<string, number[]> = {
  exciting: [10759, 10765, 80],      // Action/Adventure, Sci-Fi, Crime
  relaxing: [35, 10751, 99],        // Comedy, Family, Documentary
  mysterious: [9648, 18, 10765],    // Mystery, Drama, Sci-Fi
  funny: [35, 10751, 16],           // Comedy, Family, Animation
  dramatic: [18, 10768, 80],        // Drama, War, Crime
};

const MOOD_KEYWORDS: Record<string, string> = {
  exciting: 'action thriller',
  relaxing: 'comedy light',
  mysterious: 'mystery thriller',
  funny: 'comedy',
  dramatic: 'drama',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const availableTime = typeof body.availableTime === 'number' ? body.availableTime : 60;
    const mood = typeof body.mood === 'string' ? body.mood.toLowerCase() : 'exciting';
    const genreId = body.genreId;

    const genreIds = genreId ? [Number(genreId)] : MOOD_TO_GENRES[mood] || MOOD_TO_GENRES.exciting;
    const apiKey = TMDB_API_KEY || '';

    const params = new URLSearchParams({
      api_key: apiKey,
      with_genres: genreIds.join(','),
      sort_by: 'vote_average.desc',
      'vote_count.gte': '50',
      page: '1',
    });

    const tmdbRes = await fetch(`${TMDB_BASE}/discover/tv?${params}`);
    const tmdbData = await tmdbRes.json().catch(() => ({ results: [] }));
    let candidates = (tmdbData.results || []).slice(0, 12);

    if (candidates.length === 0 && apiKey) {
      const kw = MOOD_KEYWORDS[mood] || 'drama';
      const searchRes = await fetch(`${TMDB_BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(kw)}&page=1`);
      const searchData = await searchRes.json().catch(() => ({ results: [] }));
      candidates = (searchData.results || []).slice(0, 12);
    }

    const episodeCount = Math.max(1, Math.floor(availableTime / 45));
    const defaultPicks = candidates.slice(0, 5).map((s: { id: number; name: string; vote_average?: number; overview?: string }) => ({
      ...s,
      suggestion: `A great ${mood} pick for your available time.`,
      episodeRecommendation: availableTime < 60 ? 'Watch 1 episode to get started' : `Watch ${episodeCount} episode(s)`,
    }));

    if (candidates.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }
    if (!GROQ_API_KEY) {
      return NextResponse.json({ success: true, data: defaultPicks.slice(0, 3) });
    }

    // Use Groq to pick the best options
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: `You are an AI TV recommendation assistant. Pick the 3 best shows from a list based on the user's available time and mood. For each, provide a short suggestion and episode recommendation. Respond ONLY in valid JSON array: [{"id": number, "suggestion": "string", "episodeRecommendation": "string"}]`
          },
          {
            role: 'user',
            content: `Available time: ${availableTime} minutes
Mood: ${mood}

Shows to pick from:
${candidates.map((s: any) => `ID:${s.id} "${s.name}" Rating:${s.vote_average?.toFixed(1)} - ${s.overview?.slice(0,80)}`).join('\n')}

Pick 3 best shows with suggestions.`
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    let picks: any[] = [];
    try {
      const groqData = await groqRes.json();
      const content = groqData.choices[0].message.content;
      const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
      
      picks = parsed.map((p: any) => {
        const series = candidates.find((s: any) => s.id === p.id);
        if (!series) return null;
        return { ...series, suggestion: p.suggestion, episodeRecommendation: p.episodeRecommendation };
      }).filter(Boolean);
    } catch {
      picks = defaultPicks.slice(0, 3);
    }

    return NextResponse.json({ success: true, data: picks });
  } catch (error) {
    console.error('Watch now error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get suggestions' }, { status: 500 });
  }
}
