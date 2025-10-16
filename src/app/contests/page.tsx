
'use client';

import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, query, where, limit, doc, runTransaction, serverTimestamp, increment } from 'firebase/firestore';
import { Loader2, Trophy, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTransition } from 'react';

export default function ContestsPage() {
    const db = useFirestore();
    const auth = useAuth();
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    const [isChanting, startChantTransition] = useTransition();

    const contestsQuery = query(
        collection(db, 'contests'), 
        where('status', '==', 'active'),
        limit(1)
    );
    const [contests, loadingContests] = useCollectionData(contestsQuery, { idField: 'id' });
    const activeContest = contests?.[0];

    const userProgressRef = user && activeContest ? doc(db, `users/${user.uid}/contestProgress`, activeContest.id) : undefined;
    const [userProgress, loadingUserProgress] = useDocumentData(userProgressRef);

    const handleChant = () => {
        if (!user || !activeContest || !userProgressRef) {
            toast({ variant: 'destructive', title: 'You must be logged in to chant.' });
            return;
        }

        startChantTransition(async () => {
             try {
                await runTransaction(db, async (transaction) => {
                    const contestRef = doc(db, 'contests', activeContest.id);
                    
                    transaction.update(contestRef, { currentCount: increment(1) });
                    
                    const userProgressDoc = await transaction.get(userProgressRef);

                    if (userProgressDoc.exists()) {
                        transaction.update(userProgressRef, {
                            chantCount: increment(1),
                            lastChanted: serverTimestamp(),
                        });
                    } else {
                         transaction.set(userProgressRef, {
                            contestId: activeContest.id,
                            userId: user.uid,
                            chantCount: 1,
                            lastChanted: serverTimestamp(),
                        });
                    }
                });
             } catch (error) {
                 console.error("Chant transaction failed: ", error);
                 toast({ variant: 'destructive', title: 'Chant failed', description: 'Could not record your chant. Please try again.' });
             }
        });
    };

    if (loadingContests) {
        return (
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </main>
        );
    }
    
    if (!activeContest) {
         return (
             <main className="flex-grow container mx-auto px-4 py-8 md:py-16 text-center">
                <Trophy className="mx-auto h-24 w-24 text-muted-foreground/50" />
                <h1 className="mt-6 text-2xl font-semibold text-foreground">No Active Contests</h1>
                <p className="mt-2 text-muted-foreground">Check back soon for the next global chant challenge!</p>
            </main>
         )
    }

    const progressPercentage = (activeContest.currentCount / activeContest.goal) * 100;

    return (
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
            <Card className="w-full max-w-2xl text-center shadow-2xl bg-gradient-to-br from-primary/10 to-background border-primary/20">
                <CardHeader>
                    <Trophy className="mx-auto h-12 w-12 text-yellow-400" />
                    <CardTitle className="text-3xl font-headline text-primary mt-2">{activeContest.title}</CardTitle>
                    <CardDescription className="text-lg">{activeContest.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="text-5xl font-bold tracking-tighter text-foreground">
                            {activeContest.currentCount.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">
                           of {activeContest.goal.toLocaleString()} chants
                        </p>
                    </div>

                    <Progress value={progressPercentage} className="h-4" />
                    
                    <Button 
                        size="lg" 
                        className="w-full h-16 text-2xl font-bold rounded-full shadow-lg transform active:scale-95 transition-transform duration-150"
                        onClick={handleChant}
                        disabled={!user || isChanting}
                    >
                        {isChanting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Heart className="mr-3 h-6 w-6 fill-current" />}
                        Jai Shri Ram
                    </Button>

                    {user && !loadingUserProgress && (
                         <p className="text-muted-foreground">
                            You have contributed {userProgress?.chantCount || 0} times.
                        </p>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
