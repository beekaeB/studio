'use server';

import {
  generateMidi,
} from '@/ai/flows/generate-midi-from-prompt';
import { type GenerateMidiInput } from '@/ai/flows/types';

export async function generateMidiAction(
  input: GenerateMidiInput
): Promise<{midiData: string; description: string} | {error: string}> {
  try {
    const result = await generateMidi(input);
    return {midiData: result.midiData, description: result.description};
  } catch (e: any) {
    console.error('Error in generateMidiAction:', e);
    // The error message from our getApiKey function will now be passed to the client.
    const message =
      e instanceof Error
        ? e.message
        : 'An unknown error occurred during MIDI generation.';
    return {error: message};
  }
}
