'use server';

import {
  generateMidi,
} from '@/ai/flows/generate-midi-from-prompt';
import { type GenerateMidiInput } from '@/ai/flows/types';

// Helper function to get the API key from environment variables.
// Throws an error if the key is not found.
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
    const result = await generateMidi(input, {apiKey});
    if (!result.midiData || !result.description) {
      throw new Error('AI failed to generate a valid response. Please try a different prompt.');
    }
    return {midiData: result.midiData, description: result.description};
  } catch (e: any) {
    console.error('Error in generateMidiAction:', e);
    const message =
      e instanceof Error
        ? e.message
        : 'An unknown error occurred during MIDI generation.';
    return {error: message};
  }
}
