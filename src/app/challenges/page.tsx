
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Trophy, Loader2, Users } from 'lucide-react';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import { collection, query } from 'firebase/firestore';
import { useMemo } from 'react';
import { Challenge, challengeConverter } from '@/lib/challenges';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ChallengesPage() {
    const db = useFirestore();
    const challengesQuery = useMemo(() => db ? query(collection(db, 'challenges').withConverter(challengeConverter)) : null, [db]);
    const [snapshot, isLoading] = useCollection(challengesQuery);
    const challenges = useMemo(() => snapshot?.docs.map(doc => doc.data()) || [], [snapshot]);

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

        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        ) : challenges.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {challenges.map(challenge => (
                    <Link href={`/challenges/${challenge.id}`} key={challenge.id}>
                        <Card className="h-full hover:border-primary/80 hover:shadow-lg transition-all">
                            <CardHeader>
                                <CardTitle>{challenge.title_en}</CardTitle>
                                <CardDescription>{challenge.description_en}</CardDescription>
                            </CardHeader>
                            <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>{challenge.durationDays} Days</span>
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" /> 0 participants
                                </div>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        ) : (
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
        )}
    </main>
  );
}
