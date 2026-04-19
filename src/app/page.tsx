import Link from 'next/link';
import { BookOpenCheck } from 'lucide-react';

import { MidiGenerator } from '@/components/midi-generator';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button asChild variant="outline">
          <Link href="/munger" className="flex items-center gap-2">
            <BookOpenCheck className="h-4 w-4" />
            Munger Stock Analyzer
          </Link>
        </Button>
      </div>
      <MidiGenerator />
    </main>
  );
}
