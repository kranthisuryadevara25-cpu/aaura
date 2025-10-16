
'use client';

import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, query, where, limit, doc, runTransaction, serverTimestamp, increment, DocumentData } from 'firebase/firestore';
import { Loader2, Trophy, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTransition, useState, useEffect } from 'react';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

function ContestContent({ activeContest, user }: { activeContest: DocumentData, user: any }) {
    const db = useFirestore();
    const { toast } = useToast();
    const [isChanting, startChantTransition] = useTransition();
    const [userProgressRef, setUserProgressRef] = useState<DocumentData | undefined>(undefined);

    useEffect(() => {
        if (user && activeContest?.id) {
            const ref = doc(db, `users/${user.uid}/contestProgress`, activeContest.id);
            setUserProgressRef(ref);
        }
    }, [db, user, activeContest]);

    const [userProgress, loadingUserProgress] = useDocumentData(userProgressRef);

    const handleChant = () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in to chant.' });
            return;
        }

        if (!activeContest?.id) {
            toast({ variant: 'destructive', title: 'Contest not active', description: "There doesn't seem to be an active contest right now." });
            return;
        }

        // Now we know we have a user and an active contest.
        // We can safely create the reference for the transaction.
        const currentUserProgressRef = doc(db, `users/${user.uid}/contestProgress`, activeContest.id);

        startChantTransition(async () => {
             try {
                await runTransaction(db, async (transaction) => {
                    const contestRef = doc(db, 'contests', activeContest.id);
                    
                    transaction.update(contestRef, { totalChants: increment(1) });
                    
                    const userProgressDoc = await transaction.get(currentUserProgressRef);
                    
                    if (userProgressDoc.exists()) {
                        transaction.update(currentUserProgressRef, {
                            chants: increment(1),
                            lastChantedAt: serverTimestamp(),
                        });
                    } else {
                         transaction.set(currentUserProgressRef, {
                            chants: 1,
                            lastChantedAt: serverTimestamp(),
                            displayName: user.displayName || 'Anonymous',
                        });
                    }
                });
             } catch (error: any) {
                 const permissionError = new FirestorePermissionError({
                    path: currentUserProgressRef.path,
                    operation: 'write',
                    requestResourceData: {
                         chants: userProgress ? userProgress.chants + 1 : 1,
                         lastChantedAt: new Date(),
                         displayName: user.displayName,
                    }
                });
                errorEmitter.emit('permission-error', permissionError);
             }
        });
    };
    
    const progressPercentage = (activeContest.totalChants / activeContest.goal) * 100;

    return (
        <Card className="w-full max-w-2xl text-center shadow-2xl bg-gradient-to-br from-primary/10 to-background border-primary/20">
            <CardHeader>
                <Trophy className="mx-auto h-12 w-12 text-yellow-400" />
                <CardTitle className="text-3xl font-headline text-primary mt-2">{activeContest.title}</CardTitle>
                <CardDescription className="text-lg">Join the global chant and feel the divine energy!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <p className="text-5xl font-bold tracking-tighter text-foreground">
                        {(activeContest.totalChants || 0).toLocaleString()}
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
                        You have contributed {userProgress?.chants || 0} times.
                    </p>
                )}
                 {user && loadingUserProgress && <Loader2 className="mx-auto h-4 w-4 animate-spin" />}
            </CardContent>
        </Card>
    )
}

export default function ContestsPage() {
    const db = useFirestore();
    const auth = useAuth();
    const [user] = useAuthState(auth);

    const contestsQuery = query(
        collection(db, 'contests'), 
        where('status', '==', 'active'),
        limit(1)
    );
    const [contests, loadingContests] = useCollectionData(contestsQuery, { idField: 'id' });
    
    if (loadingContests) {
        return (
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </main>
        );
    }
    
    const activeContest = contests?.[0];

    if (!activeContest) {
         return (
             <main className="flex-grow container mx-auto px-4 py-8 md:py-16 text-center">
                <Trophy className="mx-auto h-24 w-24 text-muted-foreground/50" />
                <h1 className="mt-6 text-2xl font-semibold text-foreground">No Active Contests</h1>
                <p className="mt-2 text-muted-foreground">Check back soon for the next global chant challenge!</p>
            </main>
         )
    }

    return (
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
            <ContestContent activeContest={activeContest} user={user} />
        </main>
    );
}
