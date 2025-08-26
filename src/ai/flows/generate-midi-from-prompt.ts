'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating MIDI files from text prompts.
 *
 * The flow takes a text prompt and a desired duration as input. It uses the Gemini AI model 
 * to generate a description of the song and the corresponding MIDI data, which is then 
 * compiled into a playable .mid file that the user can download.
 *
 * @exports generateMidi - The main function to generate MIDI files from prompts.
 * @exports GenerateMidiInput - The input type for the generateMidi function.
 * @exports GenerateMidiOutput - The return type for the generateMidi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMidiInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing a musical idea.'),
  duration: z.number().describe('The desired duration of the song in seconds.'),
});
export type GenerateMidiInput = z.infer<typeof GenerateMidiInputSchema>;

const GenerateMidiOutputSchema = z.object({
  description: z.string().describe('A textual description of the generated musical piece.'),
  midiData: z.string().describe('A self-contained Javascript function that returns an array of MidiWriter.Track objects.'),
});
export type GenerateMidiOutput = z.infer<typeof GenerateMidiOutputSchema>;

export async function generateMidi(input: GenerateMidiInput): Promise<GenerateMidiOutput> {
  return generateMidiFlow(input);
}

const generateMidiPrompt = ai.definePrompt({
  name: 'generateMidiPrompt',
  input: {schema: GenerateMidiInputSchema},
  output: {schema: GenerateMidiOutputSchema},
  prompt: `You are a creative MIDI music generation expert.
Your task is to generate a Javascript function that creates and returns an array of MidiWriter.Track objects based on the user's prompt.
You MUST use the midi-writer-js ^2.x API.
You will also write a brief, one-paragraph description of the musical piece you are creating.
The generated music should be approximately {{{duration}}} seconds long.

The Javascript function you generate MUST be a complete, self-contained function that accepts one argument: 'MidiWriter'.
The function should not contain any markdown formatting.
Do not invoke the function, just define it.

Example output format for midi-writer-js v2:
\`\`\`javascript
function(MidiWriter) {
  const track = new MidiWriter.Track();
  track.addEvent(new MidiWriter.NoteEvent({pitch: ['C4', 'E4', 'G4'], duration: '1'}));
  return [track];
}
\`\`\`

User prompt: {{{prompt}}}
`,
});

const generateMidiFlow = ai.defineFlow(
  {
    name: 'generateMidiFlow',
    inputSchema: GenerateMidiInputSchema,
    outputSchema: GenerateMidiOutputSchema,
  },
  async (input) => {
    const {output} = await generateMidiPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate MIDI data.');
    }
    // The AI sometimes wraps the code in markdown, so we need to clean it.
    const cleanedMidiData = output.midiData.replace(/```javascript/g, '').replace(/```/g, '').trim();
    return {
        ...output,
        midiData: cleanedMidiData,
    };
  }
);
