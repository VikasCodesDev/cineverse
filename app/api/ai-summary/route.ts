// app/api/ai-summary/route.ts
// Generate AI summary/analysis for a series using Groq
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { seriesName, overview, genres, rating, year } = await request.json();

    if (!GROQ_API_KEY) {
      return NextResponse.json({ 
        success: false, 
        summary: 'AI summary unavailable - Groq API key not configured' 
      });
    }

    const response = await fetch(GROQ_API_URL, {
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
            content: `You are a brilliant TV critic and AI assistant. Generate an insightful, engaging analysis of a TV series. Be concise (3-4 sentences max), specific, and intriguing. Highlight what makes the show unique, who it's for, and what emotional journey it offers. Avoid generic phrases.`
          },
          {
            role: 'user',
            content: `Analyze this series:
Title: ${seriesName}
Year: ${year || 'Unknown'}
Rating: ${rating}/10
Genres: ${genres?.join(', ') || 'Unknown'}
Overview: ${overview || 'No overview available'}

Give a sharp, insightful AI analysis.`
          }
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq API error');
    }

    const data = await response.json();
    const summary = data.choices[0].message.content;

    return NextResponse.json({ success: true, summary });

  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json({
      success: false,
      summary: 'Unable to generate AI summary at this time.'
    });
  }
}
