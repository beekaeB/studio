"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import MidiWriter from "midi-writer-js";
import { Loader2, Music, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateMidiAction } from "@/app/actions";

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }).max(500, {
    message: "Prompt must not be longer than 500 characters."
  }),
});

const downloadMidi = (midiJsCode: string) => {
    try {
      const buildTracks = new Function('MidiWriter', `return (${midiJsCode})`);
      const tracks = buildTracks(MidiWriter);
      
      const writer = new MidiWriter.Writer(tracks);
      const dataUri = writer.dataUri();
      
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = 'MidiGenius_output.mid';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error processing generated MIDI code:", error);
      throw new Error("There was an error creating the MIDI file from the generated code. The AI might have provided an invalid format.");
    }
}

export function MidiGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [midiJsCode, setMidiJsCode] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMidiJsCode(null);

    const result = await generateMidiAction({ prompt: values.prompt });

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
    } else {
      setMidiJsCode(result.midiData);
      toast({
        title: "Melody Generated!",
        description: "Your MIDI file is ready for download.",
      });
    }
    setIsLoading(false);
  }

  function handleDownload() {
    if (!midiJsCode) return;
    try {
      downloadMidi(midiJsCode);
    } catch (e: any) {
       toast({
        variant: "destructive",
        title: "Download Failed",
        description: e.message,
      });
    }
  }

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-2">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4 shadow-lg">
            <Music className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">MidiGenius</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">Turn your ideas into melodies.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., a fast, ascending A minor harmonic scale on a violin"
                      className="min-h-[120px] resize-none text-base focus-visible:ring-accent"
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
                  Generating...
                </>
              ) : (
                "Generate Melody"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      {midiJsCode && (
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={handleDownload} className="w-full" variant="outline">
            <Download className="mr-2 h-5 w-5" />
            Download MIDI
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
