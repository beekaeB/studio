'use server';

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { ALL_CHECKPOINTS, type ChecklistGroup } from './checklist';

const RISK_LEVELS = ['Low', 'Medium', 'High'] as const;
const RECOMMENDATIONS = ['Buy', 'Hold', 'Avoid'] as const;

const ResearchSchema = z.object({
  companyName: z.string(),
  ticker: z.string(),
  sector: z.string(),
  businessSummary: z.string(),
  financialSnapshot: z.string(),
  recentNewsAndCatalysts: z.string(),
  bullCase: z.string(),
  bearCase: z.string(),
  knowledgeCutoffNote: z.string(),
});

const VerdictSchema = z.object({
  id: z.string(),
  riskLevel: z.enum(RISK_LEVELS),
  evidence: z.string(),
  verdict: z.string(),
});

const SynthesisSchema = z.object({
  lollapalooza: z.string(),
  recommendation: z.enum(RECOMMENDATIONS),
  keyReasons: z.array(z.string()),
  keyRisks: z.array(z.string()),
  marginOfSafety: z.string(),
});

const AnalysisSchema = z.object({
  research: ResearchSchema,
  verdicts: z.array(VerdictSchema),
  synthesis: SynthesisSchema,
});

export type MungerResearch = z.infer<typeof ResearchSchema>;
export type MungerVerdict = z.infer<typeof VerdictSchema> & {
  group: ChecklistGroup;
  number: number;
  title: string;
};
export type MungerSynthesis = z.infer<typeof SynthesisSchema>;

export interface MungerAnalysis {
  research: MungerResearch;
  verdicts: MungerVerdict[];
  synthesis: MungerSynthesis;
}

const checklistSpec = ALL_CHECKPOINTS.map(
  (item) =>
    `  - ${item.id} | ${item.group} | ${item.title} — ${item.question}`,
).join('\n');

const SYSTEM_PROMPT = `You are Charlie Munger performing a rigorous psychological-and-business audit of a publicly traded company. You think in terms of the 25 Standard Causes of Human Misjudgment from Poor Charlie's Almanack plus Munger's broader investing principles, business-quality filters, and mental models.

Your knowledge is limited to your training data. Do not fabricate events, prices, or filings that may have occurred after your cutoff. When citing specific figures, note that they are "as of training data." If you are uncertain, say so. Never invent numbers.

You will be asked to analyze a single ticker. You must walk through EVERY one of the 45 checkpoints listed below, in order, producing a concise, honest verdict for each. Tie the verdict to the specific company — generic filler is useless.

The 45 checkpoints (id | group | title — question):
${checklistSpec}

Output requirements (strict):
- Return a valid JSON object matching the schema you are given.
- \`research\` covers overview, financials, recent news, bull and bear case.
- \`verdicts\` MUST contain exactly 45 entries, one per checkpoint id above, in the same order.
- For each verdict: \`riskLevel\` is one of "Low", "Medium", "High"; \`evidence\` is 1-3 sentences grounded in the specific company; \`verdict\` is 1-2 sentences in Munger's plainspoken style.
- \`synthesis.recommendation\` is one of "Buy", "Hold", "Avoid".
- \`synthesis.lollapalooza\` names which combinations of biases and factors compound for or against this stock.
- \`keyReasons\` and \`keyRisks\` each have 2-3 bullet-style strings.
- \`marginOfSafety\` describes a rough price or valuation level that would offer adequate downside protection (qualitative is fine).
- Always include a brief cutoff disclaimer in \`research.knowledgeCutoffNote\`.
- This is an educational Munger-style review, not personalized financial advice.`;

function getClient(apiKey: string) {
  return new Anthropic({ apiKey });
}

function buildUserMessage(ticker: string): string {
  return `Perform a complete Charlie Munger audit of the publicly traded company with ticker: ${ticker}.

Walk through every one of the 45 checkpoints in order (ids match the system prompt). Be specific to this company. If a checkpoint genuinely does not apply, say so plainly and mark risk as "Low" — do not pad with filler.

Return ONLY the JSON object matching the required schema. No markdown, no prose outside the JSON.`;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return trimmed;
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }
  return trimmed;
}

export async function analyzeStock(
  ticker: string,
  apiKey: string,
): Promise<MungerAnalysis> {
  const client = getClient(apiKey);
  const cleanTicker = ticker.trim().toUpperCase();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: buildUserMessage(cleanTicker),
      },
    ],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text',
  );

  if (!textBlock) {
    throw new Error(
      'The model returned no text content. Please try again in a moment.',
    );
  }

  const jsonText = extractJson(textBlock.text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(
      'The model returned malformed JSON. Please retry the analysis.',
    );
  }

  const result = AnalysisSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `The model response did not match the expected schema: ${result.error.issues
        .slice(0, 3)
        .map((i) => i.path.join('.') + ': ' + i.message)
        .join('; ')}`,
    );
  }

  const byId = new Map(
    result.data.verdicts.map((v) => [v.id, v] as const),
  );

  const verdicts: MungerVerdict[] = ALL_CHECKPOINTS.map((item) => {
    const found = byId.get(item.id);
    if (!found) {
      return {
        id: item.id,
        group: item.group,
        number: item.number,
        title: item.title,
        riskLevel: 'Medium',
        evidence: 'The model did not return a verdict for this checkpoint.',
        verdict: 'Re-run the analysis to get coverage of this item.',
      };
    }
    return {
      ...found,
      group: item.group,
      number: item.number,
      title: item.title,
    };
  });

  return {
    research: result.data.research,
    verdicts,
    synthesis: result.data.synthesis,
  };
}
