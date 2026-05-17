import { AudiobookConverter } from '@/components/audiobook-converter';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-6">
      <AudiobookConverter />
    </main>
  );
}
