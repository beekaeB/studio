"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Search, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { performResearchAction } from "@/app/actions";

const formSchema = z.object({
  topic: z.string().min(5, {
    message: "Topic must be at least 5 characters.",
  }).max(100, {
    message: "Topic must not be longer than 100 characters."
  }),
});

export function ResearchAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [researchSummary, setResearchSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResearchSummary(null);

    const result = await performResearchAction({
      topic: values.topic,
    });

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Research Failed",
        description: result.error,
      });
    } else {
      setResearchSummary(result.researchSummary);
      toast({
        title: "Research Complete!",
        description: "Your summary is ready.",
      });
    }
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-3xl shadow-2xl border-2">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4 shadow-lg">
            <Search className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Research Assistant</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">Your AI-powered research partner.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-base">Research Topic</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., The impact of AI on modern economics"
                      className="min-h-[100px] resize-none text-base focus-visible:ring-accent"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Researching...
                </>
              ) : (
                "Start Research"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      {researchSummary && (
        <CardFooter className="flex flex-col gap-4 items-start border-t pt-6">
            <CardTitle className="flex items-center gap-2 text-2xl"><FileText className="h-6 w-6"/> Research Summary</CardTitle>
            <p className="text-muted-foreground whitespace-pre-wrap">{researchSummary}</p>
        </CardFooter>
      )}
    </Card>
  );
}
