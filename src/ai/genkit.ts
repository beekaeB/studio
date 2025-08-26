import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

export const ai = genkit({
  plugins: [
    googleAI({
      // The API key is now passed in the action, not here.
      // This prevents the app from crashing on start if the key is missing.
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
