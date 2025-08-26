'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating MIDI files from text prompts.
 *
 * The flow takes a text prompt as input and uses the Gemini AI model to generate MIDI data,
 * which is then compiled into a playable .mid file that the user can download.
 *
 * @exports generateMidi - The main function to generate MIDI files from prompts.
 * @exports GenerateMidiInput - The input type for the generateMidi function.
 * @exports GenerateMidiOutput - The return type for the generateMidi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMidiInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing a musical idea.'),
});
export type GenerateMidiInput = z.infer<typeof GenerateMidiInputSchema>;

const GenerateMidiOutputSchema = z.object({
  midiData: z.string().describe('The generated MIDI data as a Base64 string.'),
});
export type GenerateMidiOutput = z.infer<typeof GenerateMidiOutputSchema>;

export async function generateMidi(input: GenerateMidiInput): Promise<GenerateMidiOutput> {
  return generateMidiFlow(input);
}

const generateMidiPrompt = ai.definePrompt({
  name: 'generateMidiPrompt',
  input: {schema: GenerateMidiInputSchema},
  output: {schema: GenerateMidiOutputSchema},
  prompt: `You are a music expert. Based on the user's request: '{{{prompt}}}', generate only the JavaScript code for an array of tracks compatible with the midi-writer-js library. Example: new MidiWriter.Track().addEvent(new MidiWriter.NoteEvent(...)); Do not include any comments or explanations, only the javascript code. Return the result as a JSON object with a single key 'midiData' that contains the javascript code string.
`
});

const generateMidiFlow = ai.defineFlow(
  {
    name: 'generateMidiFlow',
    inputSchema: GenerateMidiInputSchema,
    outputSchema: GenerateMidiOutputSchema,
  },
  async input => {
    const {output} = await generateMidiPrompt(input);
    return output!;
  }
);
