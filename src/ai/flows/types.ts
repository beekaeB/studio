import {z} from 'genkit';

export const GenerateMidiInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing a musical idea.'),
  duration: z.number().describe('The desired duration of the song in seconds.'),
});
export type GenerateMidiInput = z.infer<typeof GenerateMidiInputSchema>;

export const GenerateMidiOutputSchema = z.object({
  description: z.string().describe('A textual description of the generated musical piece.'),
  midiData: z.string().describe('A self-contained Javascript function that returns an array of MidiWriter.Track objects.'),
});
export type GenerateMidiOutput = z.infer<typeof GenerateMidiOutputSchema>;
