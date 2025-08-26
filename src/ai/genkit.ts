'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

// Helper function to get the API key from environment variables.
// Throws an error if the key is not found.
function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Missing GEMINI_API_KEY environment variable.');
    throw new Error(
      'The GEMINI_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }
  return apiKey;
}

export const ai = genkit({
  plugins: [
    googleAI({
      // Pass the API key explicitly to the plugin.
      // The function will throw an error if the key is not set.
      apiKey: getApiKey(),
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
