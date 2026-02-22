// app/api/ai-summary/route.ts
// Generate AI summary: Groq when available, else structured fallback (plot + themes + mood + recommendation)
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

function buildFallbackSummary(
  seriesName: string,
  overview: string | undefined,
  genres: string[] | undefined,
  rating: number | undefined,
  year: string | undefined
): string {
  const plot = overview?.trim() || `${seriesName} is a series worth exploring.`;
  const themeStr = genres?.length ? genres.join(', ') : 'drama';
  const moodMap: Record<string, string> = {
    comedy: 'Light and fun',
    drama: 'Emotional and engaging',
    thriller: 'Tense and gripping',
    'sci-fi': 'Thought-provoking and immersive',
    mystery: 'Intriguing and suspenseful',
    action: 'High-energy and exciting',
    horror: 'Atmospheric and intense',
    romance: 'Warm and heartfelt',
  };
  const firstGenre = (genres?.[0] || 'drama').toLowerCase();
  const mood = moodMap[firstGenre] || 'Engaging and memorable';
  const score = rating != null ? `${rating.toFixed(1)}/10` : 'N/A';
  const rec = rating != null && rating >= 7.5
    ? `Worth a watch — strong ${themeStr} pick.`
    : `Solid choice for fans of ${themeStr}.`;

  return [
    `**Plot:** ${plot.slice(0, 300)}${plot.length > 300 ? '...' : ''}`,
    `**Themes:** ${themeStr}.`,
    `**Mood:** ${mood}.`,
    `**Verdict:** ${score}. ${rec}`,
  ].join('\n\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const seriesName = body.seriesName ?? '';
    const overview = body.overview ?? '';
    const genres = Array.isArray(body.genres) ? body.genres : [];
    const rating = typeof body.rating === 'number' ? body.rating : undefined;
    const year = typeof body.year === 'string' ? body.year : undefined;

    if (GROQ_API_KEY) {
      try {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              {
                role: 'system',
                content:
                  'You are a TV critic. Reply with exactly 4 short paragraphs separated by newlines: 1) Plot summary (2-3 sentences), 2) Themes (e.g. family, power), 3) Mood (e.g. dark, uplifting), 4) Recommendation (who will love it). Be specific and concise. No markdown headers.',
              },
              {
                role: 'user',
                content: `Title: ${seriesName}. Year: ${year || 'Unknown'}. Rating: ${rating ?? 'N/A'}/10. Genres: ${genres.join(', ') || 'Unknown'}. Overview: ${overview || 'No overview'}.`,
              },
            ],
            max_tokens: 280,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();
          if (content) {
            return NextResponse.json({ success: true, summary: content });
          }
        }
      } catch {
        // fall through to fallback
      }
    }

    const summary = buildFallbackSummary(seriesName, overview, genres, rating, year);
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('AI summary error:', error);
    const summary = buildFallbackSummary(
      'This series',
      'No overview available.',
      [],
      undefined,
      undefined
    );
    return NextResponse.json({ success: true, summary });
  }
}
