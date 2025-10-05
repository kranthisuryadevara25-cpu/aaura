
'use client';

import { Header } from '@/app/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const channels = [
    { id: '1', name: 'Yoga with Adriene', description: 'High-quality yoga and meditation videos for all levels.', avatarUrl: 'https://picsum.photos/seed/adriene/200/200', imageHint: 'woman yoga' },
    { id: '2', name: 'Sadhguru', description: 'Wisdom from a mystic. Sadhguru offers profound insights into life.', avatarUrl: 'https://picsum.photos/seed/sadhguru/200/200', imageHint: 'guru man' },
    { id: '3', name: 'The Art of Living', description: 'Spiritual teachings and practices from Sri Sri Ravi Shankar.', avatarUrl: 'https://picsum.photos/seed/artofliving/200/200', imageHint: 'spiritual teacher' },
];


export default function ChannelsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">Creator Channels</h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Follow your favorite spiritual guides and teachers.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {channels.map((channel) => (
            <Card key={channel.id} className="flex flex-col text-center items-center p-6">
              <div className="relative mb-4">
                <Image
                    src={channel.avatarUrl}
                    alt={channel.name}
                    data-ai-hint={channel.imageHint}
                    width={128}
                    height={128}
                    className="rounded-full border-4 border-primary/20"
                />
              </div>
              <CardHeader className="p-0 mb-2">
                <CardTitle className="flex items-center justify-center gap-2">{channel.name} <CheckCircle className="text-blue-500 h-5 w-5" /></CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <CardDescription className="line-clamp-2 mb-4">{channel.description}</CardDescription>
                 <Button>Subscribe</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
