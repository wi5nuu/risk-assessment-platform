import { NextRequest, NextResponse } from 'next/server';
import { getGeminiAdvice } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const { prompt, context } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const advice = await getGeminiAdvice(prompt, context);
        return NextResponse.json({ advice });
    } catch (error: any) {
        console.error('AI Advisor API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get advice from AI Advisor' },
            { status: 500 }
        );
    }
}
