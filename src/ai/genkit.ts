import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {nextjs} from '@genkit-ai/next';
import {z} from 'genkit';

export const ai = genkit({
  plugins: [
    nextjs(),
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
