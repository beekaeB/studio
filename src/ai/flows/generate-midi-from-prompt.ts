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

const generateMidiPrompt = ai.definePrompt(
  {
    name: 'generateMidiPrompt',
    input: { schema: GenerateMidiInputSchema },
    output: { schema: GenerateMidiOutputSchema },
  },
  async (input) => ({
    messages: [
      {
        role: 'system',
        content: [{ text: `You are a creative MIDI music generation expert.
Your task is to generate a Javascript function that creates and returns an array of MidiWriter.Track objects.
You MUST use the midi-writer-js ^2.x API.
You will also write a brief, one-paragraph description of the musical piece you are creating.
The generated music should be approximately ${input.duration} seconds long.

The Javascript function you generate MUST be a complete, self-contained function that accepts one argument: 'MidiWriter'.
The function should not contain any markdown formatting.
Do not invoke the function, just define it.
The function body should only contain track creation and \`addEvent\` calls with \`NoteEvent\`. No other logic is allowed.

Example output format for midi-writer-js v2:
\`\`\`javascript
function(MidiWriter) {
  const track = new MidiWriter.Track();
  track.addEvent(new MidiWriter.NoteEvent({pitch: ['C4', 'E4', 'G4'], duration: '1'}));
  return [track];
}
\`\`\``}],
      },
      {
        role: 'user',
        content: [{ text: input.prompt }],
      },
    ],
  })
);

export const generateMidiFlow = ai.defineFlow(
  {
    name: 'generateMidiFlow',
    inputSchema: GenerateMidiInputSchema,
    outputSchema: GenerateMidiOutputSchema
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

    // Security validation: check for forbidden keywords in the generated code.
    const forbiddenKeywords = ['fetch', 'XMLHttpRequest', 'eval', 'Function', 'document', 'window', 'localStorage', 'sessionStorage', 'script', '<script>', 'import', 'require'];
    if (forbiddenKeywords.some(keyword => cleanedMidiData.includes(keyword))) {
        throw new Error('AI returned potentially unsafe code.');
    }

    return {
        description: output.description,
        midiData: cleanedMidiData,
    };
  }
);
