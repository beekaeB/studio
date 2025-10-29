'use server';
/**
 * @fileOverview This file defines a Genkit flow for conducting research on a given topic.
 *
 * The flow takes a topic as input and uses the Gemini AI model to generate a
 * comprehensive summary of the latest information on that topic. It then applies
 * Charlie Munger's latticework of mental models to the research.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ResearchInputSchema = z.object({
  topic: z.string().describe('The topic to research.'),
});
export type ResearchInput = z.infer<typeof ResearchInputSchema>;

export const ResearchOutputSchema = z.object({
  researchSummary: z.string().describe('A detailed summary of the research, including the application of mental models.'),
});
export type ResearchOutput = z.infer<typeof ResearchOutputSchema>;

const researchPrompt = ai.definePrompt({
  name: 'researchPrompt',
  input: {schema: ResearchInputSchema},
  output: {schema: ResearchOutputSchema},
  prompt: `You are a world-class researcher and analyst.
Your task is to perform a deep, up-to-date research on the given topic: {{{topic}}}.
After conducting the research, you must analyze the findings through the lens of Charlie Munger's latticework of mental models.
Provide a comprehensive summary of your research and analysis.
The output should be a single, well-structured text block.
`,
});

export const researchFlow = ai.defineFlow(
  {
    name: 'researchFlow',
    inputSchema: ResearchInputSchema,
    outputSchema: ResearchOutputSchema,
  },
  async (input) => {
    const {output} = await researchPrompt(input);

    if (!output?.researchSummary) {
      throw new Error('AI failed to generate a valid response. Please try a different topic.');
    }

    return {
        researchSummary: output.researchSummary,
    };
  }
);