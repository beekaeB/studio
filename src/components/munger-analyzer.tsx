'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Loader2,
  BookOpenCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { analyzeStockAction } from '@/app/munger/actions';
import type { MungerAnalysis } from '@/ai/munger/analyze-stock';
import { CHECKLIST_GROUPS, type ChecklistItem } from '@/ai/munger/checklist';
import { cn } from '@/lib/utils';

function riskBadgeClass(level: 'Low' | 'Medium' | 'High') {
  switch (level) {
    case 'Low':
      return 'bg-emerald-600/20 text-emerald-400 border-emerald-600/40';
    case 'Medium':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'High':
      return 'bg-rose-600/25 text-rose-300 border-rose-600/50';
  }
}

function recommendationBadgeClass(rec: 'Buy' | 'Hold' | 'Avoid') {
  switch (rec) {
    case 'Buy':
      return 'bg-emerald-600 text-white hover:bg-emerald-600';
    case 'Hold':
      return 'bg-amber-500 text-black hover:bg-amber-500';
    case 'Avoid':
      return 'bg-rose-600 text-white hover:bg-rose-600';
  }
}

function recommendationIcon(rec: 'Buy' | 'Hold' | 'Avoid') {
  switch (rec) {
    case 'Buy':
      return <TrendingUp className="h-6 w-6" />;
    case 'Hold':
      return <ShieldCheck className="h-6 w-6" />;
    case 'Avoid':
      return <TrendingDown className="h-6 w-6" />;
  }
}

export function MungerAnalyzer() {
  const [ticker, setTicker] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MungerAnalysis | null>(null);
  const [analyzedTicker, setAnalyzedTicker] = useState<string>('');
  const { toast } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker.trim()) return;
    setIsLoading(true);
    setAnalysis(null);

    const target = ticker.trim().toUpperCase();
    const result = await analyzeStockAction(target);

    if ('error' in result) {
      toast({
        variant: 'destructive',
        title: 'Analysis failed',
        description: result.error,
      });
    } else {
      setAnalysis(result.analysis);
      setAnalyzedTicker(target);
      toast({
        title: `Munger audit complete for ${target}`,
        description: `Recommendation: ${result.analysis.synthesis.recommendation}`,
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <span className="text-xs text-muted-foreground">
          Powered by Claude Sonnet 4.6
        </span>
      </div>

      <Card className="border-2 shadow-xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit shadow-lg">
            <BookOpenCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Charlie Munger Stock Analyzer
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground max-w-2xl mx-auto">
            Enter a ticker. An LLM walks the full 45-point Munger audit
            (25 psychological biases + 10 principles + 10 business-quality
            checks + 5 mental models) and returns a Buy / Hold / Avoid verdict.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Ticker, e.g. AAPL, BRK.B, KO"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="text-base flex-1"
              maxLength={10}
              disabled={isLoading}
              autoComplete="off"
              autoCapitalize="characters"
            />
            <Button
              type="submit"
              disabled={isLoading || !ticker.trim()}
              className="text-base py-6 sm:py-2 sm:px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Run Munger Audit'
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            Educational analysis using the model's training knowledge.
            Not financial advice.
          </p>
        </CardContent>
      </Card>

      {isLoading && <LoadingSkeleton />}

      {analysis && !isLoading && (
        <AnalysisView ticker={analyzedTicker} analysis={analysis} />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/4" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        Claude is walking all 45 checkpoints. This can take 20–60 seconds.
      </p>
    </div>
  );
}

function AnalysisView({
  ticker,
  analysis,
}: {
  ticker: string;
  analysis: MungerAnalysis;
}) {
  const { research, verdicts, synthesis } = analysis;

  const verdictById = new Map(verdicts.map((v) => [v.id, v] as const));

  const groupCounts = CHECKLIST_GROUPS.map((g) => {
    const risks = { Low: 0, Medium: 0, High: 0 };
    for (const item of g.items) {
      const v = verdictById.get(item.id);
      if (v) risks[v.riskLevel]++;
    }
    return { ...g, risks };
  });

  return (
    <div className="space-y-6">
      <ResearchCard research={research} ticker={ticker} />

      <Tabs defaultValue={CHECKLIST_GROUPS[0].key} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          {groupCounts.map((g) => (
            <TabsTrigger
              key={g.key}
              value={g.key}
              className="flex flex-col items-center gap-1 py-2"
            >
              <span className="font-semibold text-sm">{g.label}</span>
              <span className="text-xs text-muted-foreground">
                {g.items.length} items · {g.risks.High} high-risk
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {groupCounts.map((g) => (
          <TabsContent key={g.key} value={g.key} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{g.label}</CardTitle>
                <CardDescription>
                  {g.risks.Low} low · {g.risks.Medium} medium · {g.risks.High} high
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {g.items.map((item) => {
                    const v = verdictById.get(item.id);
                    return (
                      <CheckpointRow
                        key={item.id}
                        item={item}
                        verdict={v}
                      />
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <SynthesisCard synthesis={synthesis} ticker={ticker} />

      <Card className="border-dashed">
        <CardContent className="pt-6 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Disclaimer</p>
          <p>
            This analysis is generated by an LLM using its training knowledge
            and is intended for educational purposes only. It is not
            investment, legal, or tax advice. Figures may be out of date.
            Do your own research before making any investment decision.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ResearchCard({
  research,
  ticker,
}: {
  research: MungerAnalysis['research'];
  ticker: string;
}) {
  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-2xl">
              {research.companyName}{' '}
              <span className="text-muted-foreground text-lg font-mono">
                ({research.ticker || ticker})
              </span>
            </CardTitle>
            <CardDescription>{research.sector}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Knowledge cutoff: Claude Sonnet 4.6
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Section label="Business">{research.businessSummary}</Section>
        <Section label="Financial snapshot">
          {research.financialSnapshot}
        </Section>
        <Section label="Recent news & catalysts">
          {research.recentNewsAndCatalysts}
        </Section>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Section label="Bull case" icon={<TrendingUp className="h-4 w-4" />}>
            {research.bullCase}
          </Section>
          <Section
            label="Bear case"
            icon={<TrendingDown className="h-4 w-4" />}
          >
            {research.bearCase}
          </Section>
        </div>
        <p className="text-xs text-muted-foreground italic">
          {research.knowledgeCutoffNote}
        </p>
      </CardContent>
    </Card>
  );
}

function Section({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
        {icon}
        {label}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {children}
      </p>
    </div>
  );
}

function CheckpointRow({
  item,
  verdict,
}: {
  item: ChecklistItem;
  verdict:
    | {
        riskLevel: 'Low' | 'Medium' | 'High';
        evidence: string;
        verdict: string;
      }
    | undefined;
}) {
  return (
    <AccordionItem value={item.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3 text-left w-full pr-2">
          <span className="font-mono text-xs text-muted-foreground shrink-0 w-8">
            #{item.number}
          </span>
          <span className="font-medium flex-1">{item.title}</span>
          {verdict && (
            <Badge
              className={cn(
                'border shrink-0 font-semibold',
                riskBadgeClass(verdict.riskLevel),
              )}
              variant="outline"
            >
              {verdict.riskLevel}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-11 space-y-3">
        <p className="text-sm text-muted-foreground italic">{item.question}</p>
        {verdict ? (
          <>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Evidence
              </h4>
              <p className="text-sm leading-relaxed">{verdict.evidence}</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Munger's verdict
              </h4>
              <p className="text-sm leading-relaxed font-medium">
                {verdict.verdict}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No verdict returned for this checkpoint.
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

function SynthesisCard({
  synthesis,
  ticker,
}: {
  synthesis: MungerAnalysis['synthesis'];
  ticker: string;
}) {
  return (
    <Card className="border-2 border-primary/40">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              Lollapalooza Synthesis — {ticker}
            </CardTitle>
            <CardDescription>
              Combinations of biases and factors that compound.
            </CardDescription>
          </div>
          <Badge
            className={cn(
              'text-lg px-4 py-2 flex items-center gap-2',
              recommendationBadgeClass(synthesis.recommendation),
            )}
          >
            {recommendationIcon(synthesis.recommendation)}
            {synthesis.recommendation}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <Section label="Lollapalooza summary">{synthesis.lollapalooza}</Section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> Key reasons
            </h3>
            <ul className="text-sm space-y-1.5 text-muted-foreground list-disc pl-5">
              {synthesis.keyReasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4" /> Key risks
            </h3>
            <ul className="text-sm space-y-1.5 text-muted-foreground list-disc pl-5">
              {synthesis.keyRisks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <Section label="Margin of safety">{synthesis.marginOfSafety}</Section>
      </CardContent>
    </Card>
  );
}
