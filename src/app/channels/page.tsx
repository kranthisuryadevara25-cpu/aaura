
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { useFirestore } from '@/lib/firebase/provider';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, DocumentData } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface Channel extends DocumentData {
  id: string;
  name: string;
  description_en: string;
  [key: string]: any;
}

export default function ChannelsPage() {
  const { language, t } = useLanguage();
  const db = useFirestore();
  const channelsQuery = query(collection(db, 'channels'));
  const [channels, isLoading] = useCollectionData(channelsQuery, {
    idField: 'id',
  });

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
                  <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">{t.channels.title}</h1>
                <Button asChild>
                    <Link href="/channels/create">
                        <PlusCircle className="mr-2" />
                        {t.channels.createButton}
                    </Link>
                </Button>
            </div>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                {t.channels.description}
            </p>
        </div>

        {isLoading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {channels && channels.map((channel: Channel) => {
            const description = channel[`description_${language}`] || channel.description_en;
            return (
            <Card key={channel.id} className="flex flex-col text-center items-center p-6 bg-card border-border hover:border-primary/50 transition-colors duration-300">
            <div className="relative mb-4">
                <Image
                    src={`https://picsum.photos/seed/${channel.id}/200/200`}
                    alt={channel.name}
                    data-ai-hint="spiritual teacher"
                    width={128}
                    height={128}
                    className="rounded-full border-4 border-accent/20"
                />
            </div>
            <CardHeader className="p-0 mb-2">
                <CardTitle className="flex items-center justify-center gap-2 text-foreground">{channel.name} <CheckCircle className="text-blue-500 h-5 w-5" /></CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <CardDescription className="line-clamp-2 mb-4">{description}</CardDescription>
                <Button>{t.buttons.subscribe}</Button>
            </CardContent>
            </Card>
        )})}
        </div>
        )}
    </main>
  );
}
