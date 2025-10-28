"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Music, Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { generateMidiAction } from "@/app/actions";

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }).max(500, {
    message: "Prompt must not be longer than 500 characters."
  }),
  duration: z.number().min(5).max(600),
});

export function MidiGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [midiJsCode, setMidiJsCode] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const { toast } = useToast();
  const [MidiWriter, setMidiWriter] = useState<any>(null);

  useEffect(() => {
    import('midi-writer-js').then(module => {
      setMidiWriter(module.default);
    });
  }, []);

  const downloadMidi = useCallback((midiJsCode: string) => {
    if (!MidiWriter) {
        toast({
            variant: "destructive",
            title: "MIDI library not loaded",
            description: "The MIDI library is still loading. Please try again in a moment.",
        });
        return;
    }
    try {
      const track = new MidiWriter.Track();
      // This regex is intentionally simple. It looks for note events and extracts the content inside the parentheses.
      const noteEventRegex = /new MidiWriter\.NoteEvent\(([\s\S]*?)\)/g;
      
      let match;
      let hasEvents = false;

      // Extract all note events from the AI-generated Javascript code.
      while ((match = noteEventRegex.exec(midiJsCode)) !== null) {
        hasEvents = true;
        const objectStr = match[1];

        // Securely parse the pitch and duration from the note event string using regex.
        // This avoids using eval() or new Function(), which is a major security risk.
        const pitchMatch = /pitch\s*:\s*\[(.*?)\]/.exec(objectStr);
        const durationMatch = /duration\s*:\s*('(.*?)'|"(.*?)")/.exec(objectStr);

        if (pitchMatch && durationMatch) {
            const pitchStr = pitchMatch[1];
            const pitch = pitchStr.split(',').map(p => p.trim().replace(/['"]/g, ''));

            const duration = durationMatch[2] || durationMatch[3];
            track.addEvent(new MidiWriter.NoteEvent({ pitch, duration }));
        } else {
            console.warn("Could not parse a NoteEvent, skipping.", objectStr);
        }
      }

      if (!hasEvents) {
        throw new Error("No valid MIDI note events found in the generated code.");
      }

      const writer = new MidiWriter.Writer([track]);
      const dataUri = writer.dataUri();
      
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = 'MidiGenius_output.mid';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error processing generated MIDI code:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "There was an error creating the MIDI file from the generated code. The AI might have provided an invalid format.",
      });
    }
  }, [MidiWriter, toast]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      duration: 15,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setMidiJsCode(null);
    setDescription(null);

    const result = await generateMidiAction({ 
      prompt: values.prompt,
      duration: values.duration,
    });

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
    } else {
      setMidiJsCode(result.midiData);
      setDescription(result.description);
      toast({
        title: "Melody Generated!",
        description: "Your song description and MIDI file are ready.",
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-base">Your Musical Idea</FormLabel>
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

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-base">Song Length (seconds)</FormLabel>
                   <FormControl>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={5}
                        max={600}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="w-full"
                      />
                      <span className="font-mono text-lg w-12 text-center">{field.value}s</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || !MidiWriter}>
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

      {description && (
        <CardFooter className="flex flex-col gap-4 items-start border-t pt-6">
            <CardTitle className="flex items-center gap-2 text-2xl"><FileText className="h-6 w-6"/> Song Description</CardTitle>
            <p className="text-muted-foreground">{description}</p>
             {midiJsCode && (
                <Button onClick={handleDownload} className="w-full mt-4" variant="outline">
                    <Download className="mr-2 h-5 w-5" />
                    Download MIDI
                </Button>
            )}
        </CardFooter>
      )}
    </Card>
  );
}
