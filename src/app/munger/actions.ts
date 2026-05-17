'use server';

import { analyzeStock, type MungerAnalysis } from '@/ai/munger/analyze-stock';

function getApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error(
      'The ANTHROPIC_API_KEY environment variable is not set. Please add it to your .env file.',
    );
  }
  return apiKey;
}

export async function analyzeStockAction(
  ticker: string,
): Promise<{ analysis: MungerAnalysis } | { error: string }> {
  try {
    const cleaned = ticker.trim();
    if (!cleaned) {
      return { error: 'Please enter a stock ticker.' };
    }
    if (!/^[A-Za-z.\-]{1,10}$/.test(cleaned)) {
      return {
        error:
          'Invalid ticker format. Use letters only (e.g. AAPL, BRK.B, RY).',
      };
    }
    const apiKey = getApiKey();
    const analysis = await analyzeStock(cleaned, apiKey);
    return { analysis };
  } catch (e: unknown) {
    console.error('Error in analyzeStockAction:', e);
    const message =
      e instanceof Error
        ? e.message
        : 'An unknown error occurred during stock analysis.';
    return { error: message };
  }
}
