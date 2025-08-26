'use server';

import {generateMidiFlow} from '@/ai/flows/generate-midi-from-prompt';
import {type GenerateMidiInput} from '@/ai/flows/types';

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error(
      'The GEMINI_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }
  return apiKey;
}

export async function generateMidiAction(
  input: GenerateMidiInput
): Promise<{midiData: string; description: string} | {error: string}> {
  try {
    const apiKey = getApiKey();
    const result = await generateMidiFlow(input, {apiKey});
    // The result from the flow is already validated, so we can return it directly.
    return {midiData: result.midiData, description: result.description};
  } catch (e: any) {
    console.error('Error in generateMidiAction:', e);
    // Ensure a user-friendly message is always returned.
    const message =
      e instanceof Error
        ? e.message
        : 'An unknown error occurred during MIDI generation.';
    return {error: message};
  }
}
