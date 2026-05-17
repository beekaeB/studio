export type ChecklistGroup = "bias" | "principle" | "quality" | "model";

export interface ChecklistItem {
  id: string;
  group: ChecklistGroup;
  number: number;
  title: string;
  question: string;
}

export const BIASES: ChecklistItem[] = [
  {
    id: "bias-1",
    group: "bias",
    number: 1,
    title: "Reward & Punishment Superresponse Tendency",
    question:
      "Are management incentives (comp, options, buybacks) aligned with long-term shareholder value or with gaming short-term metrics?",
  },
  {
    id: "bias-2",
    group: "bias",
    number: 2,
    title: "Liking / Loving Tendency",
    question:
      "Are bulls excusing flaws because the brand, CEO, or story is charismatic?",
  },
  {
    id: "bias-3",
    group: "bias",
    number: 3,
    title: "Disliking / Hating Tendency",
    question:
      "Are bears dismissing legitimate strengths because they loathe the sector, CEO, or ideology?",
  },
  {
    id: "bias-4",
    group: "bias",
    number: 4,
    title: "Doubt-Avoidance Tendency",
    question:
      "Is the thesis rushing to a conclusion to resolve discomfort rather than sitting with uncertainty?",
  },
  {
    id: "bias-5",
    group: "bias",
    number: 5,
    title: "Inconsistency-Avoidance Tendency",
    question:
      "Are holders anchored to a prior commitment (public calls, cost basis) rather than re-evaluating fresh?",
  },
  {
    id: "bias-6",
    group: "bias",
    number: 6,
    title: "Curiosity Tendency",
    question:
      "Has the investor actually dug into unglamorous details (10-K footnotes, segment data, customer concentration)?",
  },
  {
    id: "bias-7",
    group: "bias",
    number: 7,
    title: "Kantian Fairness Tendency",
    question:
      "Does the company treat employees, suppliers, and customers fairly enough to sustain durable relationships?",
  },
  {
    id: "bias-8",
    group: "bias",
    number: 8,
    title: "Envy / Jealousy Tendency",
    question:
      "Is demand for this stock driven by FOMO vs. peers rather than intrinsic value?",
  },
  {
    id: "bias-9",
    group: "bias",
    number: 9,
    title: "Reciprocation Tendency",
    question:
      "Are sell-side analysts, board members, or auditors captured by favors or fees that color their opinions?",
  },
  {
    id: "bias-10",
    group: "bias",
    number: 10,
    title: "Influence-from-Mere-Association Tendency",
    question:
      "Is the stock benefitting (or suffering) from a label (AI, meme, ESG, China-exposed) rather than fundamentals?",
  },
  {
    id: "bias-11",
    group: "bias",
    number: 11,
    title: "Simple, Pain-Avoiding Psychological Denial",
    question:
      "Is management (or the market) denying an obvious bad trend — declining TAM, secular headwind, cash burn?",
  },
  {
    id: "bias-12",
    group: "bias",
    number: 12,
    title: "Excessive Self-Regard Tendency",
    question:
      "Is the CEO empire-building via overpriced M&A or buying back overvalued stock?",
  },
  {
    id: "bias-13",
    group: "bias",
    number: 13,
    title: "Overoptimism Tendency",
    question:
      "Are guidance, consensus, or TAM estimates leaning Demosthenes-style — 'what a man wishes, that he also believes'?",
  },
  {
    id: "bias-14",
    group: "bias",
    number: 14,
    title: "Deprival-Superreaction Tendency (Loss Aversion)",
    question:
      "Are holders refusing to sell a broken thesis because they hate realizing the loss?",
  },
  {
    id: "bias-15",
    group: "bias",
    number: 15,
    title: "Social-Proof Tendency",
    question:
      "Is the price being driven by herding (retail momentum, index inclusion, passive flows) rather than cash flows?",
  },
  {
    id: "bias-16",
    group: "bias",
    number: 16,
    title: "Contrast-Misreaction Tendency",
    question:
      "Does it look cheap only relative to an inflated peer or prior peak — a false anchor?",
  },
  {
    id: "bias-17",
    group: "bias",
    number: 17,
    title: "Stress-Influence Tendency",
    question:
      "Is the market pricing under acute stress (macro panic, forced selling) that distorts price vs. value?",
  },
  {
    id: "bias-18",
    group: "bias",
    number: 18,
    title: "Availability-Misweighing Tendency",
    question:
      "Are recent headlines (earnings beat, scandal) being overweighted vs. the base rate?",
  },
  {
    id: "bias-19",
    group: "bias",
    number: 19,
    title: "Use-It-or-Lose-It Tendency",
    question:
      "Is the company's competitive skill/moat atrophying from neglected R&D, talent loss, or cultural decay?",
  },
  {
    id: "bias-20",
    group: "bias",
    number: 20,
    title: "Drug-Misinfluence Tendency",
    question:
      "Are decision-makers impaired by substance issues, known scandals, or equivalent judgment-destroyers?",
  },
  {
    id: "bias-21",
    group: "bias",
    number: 21,
    title: "Senescence-Misinfluence Tendency",
    question:
      "Is there succession risk or cognitive decline at the top — aging founder, no bench, stale strategy?",
  },
  {
    id: "bias-22",
    group: "bias",
    number: 22,
    title: "Authority-Misinfluence Tendency",
    question:
      "Are investors over-deferring to a guru CEO, famous fund holder, or rating agency instead of verifying?",
  },
  {
    id: "bias-23",
    group: "bias",
    number: 23,
    title: "Twaddle Tendency",
    question:
      "Are investor communications full of buzzword fog (synergies, platform, ecosystem) that hides weak substance?",
  },
  {
    id: "bias-24",
    group: "bias",
    number: 24,
    title: "Reason-Respecting Tendency",
    question:
      "Are stated reasons for the stock's move actually causal, or just plausible-sounding narratives the market accepts?",
  },
  {
    id: "bias-25",
    group: "bias",
    number: 25,
    title: "Lollapalooza Tendency",
    question:
      "Which combinations of the above biases are compounding (e.g., social proof + overoptimism + authority) to produce an extreme?",
  },
];

export const PRINCIPLES: ChecklistItem[] = [
  {
    id: "principle-1",
    group: "principle",
    number: 1,
    title: "Risk First",
    question:
      "What is the worst plausible outcome? Begin by measuring reputational and permanent-loss risk before anything else.",
  },
  {
    id: "principle-2",
    group: "principle",
    number: 2,
    title: "Independence",
    question:
      "Is the thesis an independent judgment, or is it mimicking a herd — analyst consensus, fund flows, social media?",
  },
  {
    id: "principle-3",
    group: "principle",
    number: 3,
    title: "Preparation",
    question:
      "Has the investor done the reading — 10-K, 10-Q, proxy, earnings calls — or is this a shortcut?",
  },
  {
    id: "principle-4",
    group: "principle",
    number: 4,
    title: "Intellectual Humility",
    question:
      "What is unknown? Is this company inside the investor's circle of competence?",
  },
  {
    id: "principle-5",
    group: "principle",
    number: 5,
    title: "Analytic Rigor",
    question:
      "Is the thesis falsifiable and supported by base rates and the scientific method, or is it just storytelling?",
  },
  {
    id: "principle-6",
    group: "principle",
    number: 6,
    title: "Allocation",
    question:
      "Is buying this the best use of marginal capital versus existing holdings, index alternatives, or cash?",
  },
  {
    id: "principle-7",
    group: "principle",
    number: 7,
    title: "Patience",
    question:
      "Is action being taken from boredom or compulsion, or because the pitch is genuinely in the strike zone?",
  },
  {
    id: "principle-8",
    group: "principle",
    number: 8,
    title: "Decisiveness",
    question:
      "If the thesis is clear and the price is right, is position sizing appropriate, or is timidity diluting the bet?",
  },
  {
    id: "principle-9",
    group: "principle",
    number: 9,
    title: "Change",
    question:
      "Is the business adapting to unavoidable secular change — technology, regulation, demographics?",
  },
  {
    id: "principle-10",
    group: "principle",
    number: 10,
    title: "Focus",
    question:
      "Is the portfolio concentrated on a few well-understood ideas, or diluted across too many positions?",
  },
];

export const BUSINESS_QUALITY: ChecklistItem[] = [
  {
    id: "quality-1",
    group: "quality",
    number: 1,
    title: "Circle of Competence",
    question:
      "Can a reasonable investor explain — in plain language — exactly how this business makes money across a full cycle?",
  },
  {
    id: "quality-2",
    group: "quality",
    number: 2,
    title: "Durable Moat",
    question:
      "Which moats apply — brand, network effects, switching costs, low-cost production, regulatory, scale — and are they widening or shrinking?",
  },
  {
    id: "quality-3",
    group: "quality",
    number: 3,
    title: "Pricing Power",
    question:
      "Can the company raise prices at or above inflation without losing customers?",
  },
  {
    id: "quality-4",
    group: "quality",
    number: 4,
    title: "Return on Invested Capital",
    question:
      "Is ROIC consistently above cost of capital? What is the 5-10 year trend?",
  },
  {
    id: "quality-5",
    group: "quality",
    number: 5,
    title: "Reinvestment Runway",
    question:
      "Can retained earnings be redeployed at similar high returns, or does excess cash pile up with no place to go?",
  },
  {
    id: "quality-6",
    group: "quality",
    number: 6,
    title: "Free Cash Flow Quality",
    question:
      "Is reported earnings backed by owner earnings — free cash flow after maintenance capex?",
  },
  {
    id: "quality-7",
    group: "quality",
    number: 7,
    title: "Balance Sheet Strength",
    question:
      "Net debt / EBITDA, interest coverage, off-balance-sheet liabilities, pension gaps — is the balance sheet sound?",
  },
  {
    id: "quality-8",
    group: "quality",
    number: 8,
    title: "Capital Allocation Track Record",
    question:
      "Are buybacks done at sensible prices, M&A earning its cost of capital, dividends reasonable?",
  },
  {
    id: "quality-9",
    group: "quality",
    number: 9,
    title: "Management Quality & Integrity",
    question:
      "Are managers owner-operators? Honest in past communications? Meaningful insider ownership and skin in the game?",
  },
  {
    id: "quality-10",
    group: "quality",
    number: 10,
    title: "Accounting Red Flags",
    question:
      "Aggressive revenue recognition, frequent restatements, growing GAAP vs non-GAAP gap, auditor turnover?",
  },
];

export const MENTAL_MODELS: ChecklistItem[] = [
  {
    id: "model-1",
    group: "model",
    number: 1,
    title: "Inversion — Always Invert",
    question:
      "How could this investment fail? What would have to be true for the stock to halve over the next 3 years?",
  },
  {
    id: "model-2",
    group: "model",
    number: 2,
    title: "Opportunity Cost",
    question:
      "Compared to the best alternative already available (index, existing holding, cash), is this clearly better?",
  },
  {
    id: "model-3",
    group: "model",
    number: 3,
    title: "Margin of Safety",
    question:
      "At today's price, what is the gap between price and conservative intrinsic value? Is it large enough to absorb errors?",
  },
  {
    id: "model-4",
    group: "model",
    number: 4,
    title: "Industry Structure (Porter's Five Forces)",
    question:
      "Buyer power, supplier power, threat of entry, threat of substitutes, rivalry — is the industry economically attractive?",
  },
  {
    id: "model-5",
    group: "model",
    number: 5,
    title: "Mispriced Bet (Parimutuel Thinking)",
    question:
      "Is the market's implied odds clearly wrong, or is this a fair-priced consensus name with no edge?",
  },
];

export const ALL_CHECKPOINTS: ChecklistItem[] = [
  ...BIASES,
  ...PRINCIPLES,
  ...BUSINESS_QUALITY,
  ...MENTAL_MODELS,
];

export const CHECKLIST_GROUPS: {
  key: ChecklistGroup;
  label: string;
  items: ChecklistItem[];
}[] = [
  { key: "bias", label: "Psychological Biases", items: BIASES },
  { key: "principle", label: "Munger Principles", items: PRINCIPLES },
  { key: "quality", label: "Business Quality", items: BUSINESS_QUALITY },
  { key: "model", label: "Mental Models", items: MENTAL_MODELS },
];
