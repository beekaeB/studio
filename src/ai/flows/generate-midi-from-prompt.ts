'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating MIDI files from text prompts.
 *
 * The flow takes a text prompt and a desired duration as input. It uses the Gemini AI model 
 * to generate a description of the song and the corresponding MIDI data, which is then 
 * compiled into a playable .mid file that the user can download.
 *
 * @exports generateMidiFlow - The main flow to generate MIDI files from prompts.
 */

import {ai} from '@/ai/genkit';
import { GenerateMidiInputSchema, GenerateMidiOutputSchema, GenerateMidiInput, GenerateMidiOutput } from './types';

const generateMidiPrompt = ai.definePrompt({
  name: 'generateMidiPrompt',
  input: {schema: GenerateMidiInputSchema},
  output: {schema: GenerateMidiOutputSchema},
  prompt: `You are a creative MIDI music generation expert.
Your task is to generate a Javascript function that creates and returns an array of MidiWriter.Track objects based on the user's prompt, and also write a brief, one-paragraph description of the musical piece.

You MUST return a valid JSON object with the following structure:
{
  "description": "A brief, one-paragraph description of the musical piece.",
  "midiData": "A string containing a self-contained Javascript function that uses the midi-writer-js ^2.x API to generate the MIDI music."
}

The Javascript function in the 'midiData' field MUST:
- Be a complete, self-contained function that accepts one argument: 'MidiWriter'.
- Not contain any markdown formatting (e.g., \`\`\`javascript).
- Not be invoked, only defined.

The generated music should be approximately {{{duration}}} seconds long.

Example Javascript function for the 'midiData' field:
"function(MidiWriter) { const track = new MidiWriter.Track(); track.addEvent(new MidiWriter.NoteEvent({pitch: ['C4', 'E4', 'G4'], duration: '1'})); return [track]; }"

User prompt: {{{prompt}}}
`,
});

export const generateMidiFlow = ai.defineFlow(
  {
    name: 'generateMidiFlow',
    inputSchema: GenerateMidiInputSchema,
    outputSchema: GenerateMidiOutputSchema,
    rateLimit: {
        requests: 7,
        per: 'minute'
    }
  },
  async (input) => {
    const {output} = await generateMidiPrompt(input);
    
    if (!output?.midiData || !output?.description) {
      throw new Error('AI failed to generate a valid response. Please try a different prompt.');
    }

    // The AI sometimes wraps the code in markdown, so we need to clean it.
    const cleanedMidiData = output.midiData.replace(/```javascript/g, '').replace(/```/g, '').trim();
    
    if (!cleanedMidiData.startsWith('function(MidiWriter)')) {
        throw new Error('AI returned MIDI data in an unexpected format. Please try again.');
    }

    return {
        description: output.description,
        midiData: cleanedMidiData,
    };
  }
);
