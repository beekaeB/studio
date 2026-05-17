'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Download, Loader2, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const VOICES = [
  { value: 'Aoede', label: 'Aoede', description: 'Warm & expressive' },
  { value: 'Charon', label: 'Charon', description: 'Deep & authoritative' },
  { value: 'Fenrir', label: 'Fenrir', description: 'Clear & confident' },
  { value: 'Kore', label: 'Kore', description: 'Gentle & smooth' },
  { value: 'Puck', label: 'Puck', description: 'Bright & lively' },
];

const ACCEPTED_TYPES = ['.pdf', '.docx', '.doc', '.txt', '.md'];

type Stage = 'idle' | 'uploading' | 'converting' | 'done' | 'error';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AudiobookConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [voice, setVoice] = useState('Aoede');
  const [apiKey, setApiKey] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState('audiobook.wav');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const acceptFile = (f: File) => {
    const ext = '.' + f.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      toast({ variant: 'destructive', title: 'Unsupported file type', description: `Please upload: ${ACCEPTED_TYPES.join(', ')}` });
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Maximum file size is 20 MB' });
      return;
    }
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(f);
    setStage('idle');
    setDownloadUrl(null);
    setErrorMsg('');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) acceptFile(dropped);
  }, [downloadUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const startFakeProgress = (from: number, to: number, durationMs: number) => {
    const steps = 30;
    const interval = durationMs / steps;
    const increment = (to - from) / steps;
    let current = from;
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      current += increment;
      if (current >= to) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setProgress(to);
      } else {
        setProgress(Math.round(current));
      }
    }, interval);
  };

  const convert = async () => {
    if (!file) return;
    if (!apiKey.trim()) {
      toast({ variant: 'destructive', title: 'API key required', description: 'Enter your Google AI API key to continue.' });
      return;
    }

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setStage('uploading');
    setProgress(0);
    setErrorMsg('');

    startFakeProgress(0, 15, 800);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('voice', voice);
    formData.append('apiKey', apiKey);

    try {
      setStage('converting');
      startFakeProgress(15, 90, 45000);

      const res = await fetch('/api/convert', { method: 'POST', body: formData });

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Conversion failed');
      }

      setProgress(95);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const name = file.name.replace(/\.[^.]+$/, '') + '-audiobook.wav';

      setProgress(100);
      setDownloadUrl(url);
      setDownloadName(name);
      setStage('done');
      toast({ title: 'Audiobook ready!', description: 'Your WAV file is ready to download.' });
    } catch (err: unknown) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setErrorMsg(msg);
      setStage('error');
      toast({ variant: 'destructive', title: 'Conversion failed', description: msg });
    }
  };

  const reset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setStage('idle');
    setDownloadUrl(null);
    setErrorMsg('');
    setProgress(0);
  };

  const isProcessing = stage === 'uploading' || stage === 'converting';

  return (
    <div className="w-full max-w-xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <BookOpen className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">AudioBook Converter</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Upload a PDF, Word doc, or text file and convert it to a downloadable WAV audiobook
        </p>
      </div>

      {/* API Key */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Google AI API Key</CardTitle>
          <CardDescription className="text-xs">
            Required for Gemini TTS. Get one free at{' '}
            <span className="text-primary font-mono">aistudio.google.com</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="password"
            placeholder="AIza..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Document</CardTitle>
          <CardDescription className="text-xs">
            PDF, DOCX, DOC, TXT, or MD · Max 20 MB · For Google Docs, export as DOCX or PDF first
          </CardDescription>
        </CardHeader>
        <CardContent>
          {file ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              {!isProcessing && (
                <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              )}
            >
              <Upload className="h-8 w-8" />
              <div>
                <p className="text-sm font-medium">Drop your file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">{ACCEPTED_TYPES.join(', ')}</p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); }}
          />
        </CardContent>
      </Card>

      {/* Voice Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Narrator Voice</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={voice} onValueChange={setVoice} disabled={isProcessing}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICES.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  <span className="font-medium">{v.label}</span>
                  <span className="ml-2 text-muted-foreground text-xs">— {v.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              {stage === 'uploading' ? 'Uploading and extracting text…' : 'Generating audio with Gemini TTS…'}
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stage === 'converting'
                ? 'Large documents may take a minute or two. Please keep this tab open.'
                : 'Processing your document…'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {stage === 'error' && errorMsg && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{errorMsg}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {stage !== 'done' && (
          <Button
            onClick={convert}
            disabled={!file || isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting…
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Convert to Audiobook
              </>
            )}
          </Button>
        )}

        {stage === 'done' && downloadUrl && (
          <>
            <a href={downloadUrl} download={downloadName} className="block w-full">
              <Button className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download WAV Audiobook
              </Button>
            </a>
            <Button variant="outline" onClick={reset} className="w-full">
              Convert another file
            </Button>
          </>
        )}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground">
        Powered by Gemini 2.5 Flash TTS · Audio generated server-side · Your API key is never stored
      </p>
    </div>
  );
}
