import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`, // 환경 변수를 통해 키 보호
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      return NextResponse.json({ error: errorDetails }, { status: response.status });
    }
    
    const data = await response.json();
    console.log(data)
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in GPT API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

