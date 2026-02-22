// app/api/watch-now/route.ts
// Suggest what to watch based on available time, mood, and genre
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

const MOOD_TO_GENRES: Record<string, number[]> = {
  exciting: [28, 10759, 80],
  relaxing: [35, 10751, 10402],
  mysterious: [9648, 18, 10765],
  funny: [35, 10751],
  dramatic: [18, 10768, 80],
};

export async function POST(request: NextRequest) {
  try {
    const { availableTime, mood, genreId } = await request.json();

    // Fetch series based on mood/genre
    const genreIds = genreId ? [genreId] : MOOD_TO_GENRES[mood] || [18];
    
    const params = new URLSearchParams({
      api_key: TMDB_API_KEY || '',
      with_genres: genreIds.join(','),
      sort_by: 'vote_average.desc',
      'vote_count.gte': '200',
      page: '1',
    });

    const tmdbRes = await fetch(`${TMDB_BASE}/discover/tv?${params}`);
    const tmdbData = await tmdbRes.json();
    const candidates = (tmdbData.results || []).slice(0, 12);

    if (!GROQ_API_KEY || candidates.length === 0) {
      // Fallback without AI
      const picks = candidates.slice(0, 3).map((s: any) => ({
        ...s,
        suggestion: `A great ${mood} pick for your available time.`,
        episodeRecommendation: availableTime < 60 
          ? 'Watch 1 episode to get started' 
          : `Watch ${Math.floor(availableTime / 45)} episodes`,
      }));
      return NextResponse.json({ success: true, data: picks });
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
      picks = candidates.slice(0, 3).map((s: any) => ({
        ...s,
        suggestion: `Perfect for a ${mood} ${availableTime}-minute session.`,
        episodeRecommendation: `Watch ${Math.max(1, Math.floor(availableTime / 45))} episode(s)`,
      }));
    }

    return NextResponse.json({ success: true, data: picks });
  } catch (error) {
    console.error('Watch now error:', error);
    return NextResponse.json({ success: false, error: 'Failed to get suggestions' }, { status: 500 });
  }
}
