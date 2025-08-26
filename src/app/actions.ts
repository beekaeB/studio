'use server';

import { generateMidi, type GenerateMidiInput } from '@/ai/flows/generate-midi-from-prompt';

export async function generateMidiAction(input: GenerateMidiInput): Promise<{ midiData: string; description: string; } | { error: string }> {
  try {
    const result = await generateMidi(input);
    // The flow now has its own internal checks and will throw an error if the output is invalid.
    // We can rely on the catch block to handle failures.
    return { midiData: result.midiData, description: result.description };
  } catch (e) {
    console.error("Error in generateMidiAction:", e);
    // Ensure a clear, serializable error message is always returned.
    const message = e instanceof Error ? e.message : 'An unknown error occurred during MIDI generation.';
    return { error: message };
  }
}
