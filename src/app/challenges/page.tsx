
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Loader2 } from 'lucide-react';

export default function ChallengesPage() {

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center justify-center gap-3">
                <Trophy className="h-10 w-10" /> Community Challenges
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Join our spiritual challenges, grow your practice, and earn badges.
            </p>
        </div>

        <div className="flex justify-center items-center h-64">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Coming Soon!</CardTitle>
                    <CardDescription>
                        Exciting new challenges are being prepared. Check back soon to participate.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    </main>
  );
}
