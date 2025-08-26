'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating MIDI files from text prompts.
 *
 * The flow takes a text prompt and a desired duration as input. It uses the Gemini AI model 
 * to generate a description of the song and the corresponding MIDI data, which is then 
 * compiled into a playable .mid file that the user can download.
 *
 * @exports generateMidi - The main function to generate MIDI files from prompts.
 */

import {ai} from '@/ai/genkit';
import { GenerateMidiInputSchema, GenerateMidiOutputSchema, GenerateMidiInput, GenerateMidiOutput } from './types';


export async function generateMidi(input: GenerateMidiInput, options: {apiKey: string}): Promise<GenerateMidiOutput> {
  return generateMidiFlow(input, options);
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
\'\'\'javascript
function(MidiWriter) {
  const track = new MidiWriter.Track();
  track.addEvent(new MidiWriter.NoteEvent({pitch: ['C4', 'E4', 'G4'], duration: '1'}));
  return [track];
}
\'\'\'

User prompt: {{{prompt}}}
`,
});

const generateMidiFlow = ai.defineFlow(
  {
    name: 'generateMidiFlow',
    inputSchema: GenerateMidiInputSchema,
    outputSchema: GenerateMidiOutputSchema,
    rateLimit: {
        requests: 7,
        per: 'minute'
    }
  },
  async (input, options) => {
    const {output} = await generateMidiPrompt(input, {
        plugins: {
            googleai: {
                apiKey: options.apiKey,
            }
        }
    });
    
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
