'use server';

import {generateMidiFlow} from '@/ai/flows/generate-midi-from-prompt';
import {type GenerateMidiInput} from '@/ai/flows/types';

export async function generateMidiAction(
  input: GenerateMidiInput
): Promise<{midiData: string; description: string} | {error: string}> {
  try {
    const result = await generateMidiFlow(input);
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
