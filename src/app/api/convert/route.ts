import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractTextFromFile } from '@/lib/text-extraction';
import { pcmToWav, chunkText } from '@/lib/audio-utils';

export const maxDuration = 300;

const VOICES = ['Aoede', 'Charon', 'Fenrir', 'Kore', 'Puck'] as const;

async function generateAudioChunk(
  genAI: GoogleGenerativeAI,
  text: string,
  voice: string
): Promise<Buffer | null> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-tts',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (model as any).generateContent({
    contents: [{ role: 'user', parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const part = result?.response?.candidates?.[0]?.content?.parts?.[0];
  if (!part?.inlineData?.data) return null;
  return Buffer.from(part.inlineData.data, 'base64');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const voice = (formData.get('voice') as string) || 'Aoede';
    const apiKey = (formData.get('apiKey') as string) || process.env.GOOGLE_GENAI_API_KEY || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!VOICES.includes(voice as (typeof VOICES)[number])) {
      return NextResponse.json({ error: 'Invalid voice selection' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google AI API key is required. Provide it in the form or set GOOGLE_GENAI_API_KEY.' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'docx', 'doc', 'txt', 'md'];
    if (!ext || !allowed.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type. Please upload: ${allowed.join(', ')}` },
        { status: 400 }
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 20 MB' }, { status: 400 });
    }

    const text = await extractTextFromFile(file);
    if (!text.trim()) {
      return NextResponse.json({ error: 'No readable text found in the file' }, { status: 422 });
    }

    const chunks = chunkText(text);
    const genAI = new GoogleGenerativeAI(apiKey);
    const pcmParts: Buffer[] = [];

    for (const chunk of chunks) {
      const pcm = await generateAudioChunk(genAI, chunk, voice);
      if (pcm) pcmParts.push(pcm);
    }

    if (pcmParts.length === 0) {
      return NextResponse.json({ error: 'Audio generation produced no output' }, { status: 500 });
    }

    const wavBuffer = pcmToWav(Buffer.concat(pcmParts));
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.[^.]+$/, '');

    return new NextResponse(wavBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': `attachment; filename="${safeName}-audiobook.wav"`,
        'Content-Length': String(wavBuffer.length),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    console.error('[convert]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
