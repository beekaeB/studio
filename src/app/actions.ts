'use server';

import { generateMidi, type GenerateMidiInput } from '@/ai/flows/generate-midi-from-prompt';

export async function generateMidiAction(input: GenerateMidiInput): Promise<{ midiData: string } | { error: string }> {
  try {
    const result = await generateMidi(input);
    if (!result.midiData) {
        throw new Error("AI did not return valid MIDI data. Please try a different prompt.");
    }
    return { midiData: result.midiData };
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : 'An unknown error occurred during MIDI generation.' };
  }
}
