'use server';

import {researchFlow} from '@/ai/flows/research-flow';
import {type ResearchInput} from '@/ai/flows/research-flow';

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error(
      'The GEMINI_API_KEY environment variable is not set. Please add it to your .env file.'
    );
  }
  return apiKey;
}

export async function performResearchAction(
  input: ResearchInput
): Promise<{researchSummary: string} | {error: string}> {
  try {
    getApiKey(); // Check for key, but don't pass it explicitly
    const result = await researchFlow(input);
    return {researchSummary: result.researchSummary};
  } catch (e: any) {
    console.error('Error in performResearchAction:', e);
    const message =
      e instanceof Error
        ? e.message
        : 'An unknown error occurred during research.';
    return {error: message};
  }
}
