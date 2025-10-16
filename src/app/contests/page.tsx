
'use client';

import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, query, where, limit, doc, runTransaction, serverTimestamp, increment, DocumentData, Timestamp, orderBy } from 'firebase/firestore';
import { Loader2, Trophy, Heart, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTransition, useState, useEffect, useMemo } from 'react';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

const chantSchema = z.object({
  mantra: z.string().min(1, "Mantra cannot be empty."),
});
type ChantFormValues = z.infer<typeof chantSchema>;

function RecentChants({ contestId }: { contestId: string }) {
    const db = useFirestore();
    const recentChantsQuery = useMemo(() => 
        query(
            collection(db, `contests/${contestId}/leaderboard`), 
            orderBy('lastChantedAt', 'desc'), 
            limit(5)
        ), [db, contestId]
    );
    const [recentChants, loading] = useCollectionData(recentChantsQuery);

    if (loading) {
        return <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
    }

    return (
        <div className="space-y-3 mt-6">
            <h4 className="font-semibold text-center text-muted-foreground">Recent Activity</h4>
            {recentChants && recentChants.map((chant, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                    <Avatar className="h-8 w-8">
                         <AvatarImage src={`https://picsum.photos/seed/${chant.userId}/40`} />
                        <AvatarFallback>{chant.displayName?.[0] || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold text-foreground">{chant.displayName}</p>
                        <p className="text-xs text-muted-foreground">{chant.mantra}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {chant.lastChantedAt ? formatDistanceToNow(chant.lastChantedAt.toDate(), { addSuffix: true }) : 'just now'}
                    </p>
                </div>
            ))}
        </div>
    )
}


function ContestContent({ contestId }: { contestId: string, }) {
    const db = useFirestore();
    const auth = useAuth();
    const [user, loadingUser] = useAuthState(auth);
    const { toast } = useToast();
    const [isChanting, startChantTransition] = useTransition();

    const contestRef = doc(db, 'contests', contestId);
    const [activeContest, loadingContest] = useDocumentData(contestRef);

    const form = useForm<ChantFormValues>({
        resolver: zodResolver(chantSchema),
        defaultValues: { mantra: "Jai Shri Ram" },
    });


    const handleChant = (data: ChantFormValues) => {
         if (!user) {
            toast({ variant: 'destructive', title: 'You must be logged in to chant.' });
            return;
        }

        if (!activeContest) {
            toast({ variant: 'destructive', title: 'Contest not active', description: "There doesn't seem to be an active contest right now." });
            return;
        }
        
        startChantTransition(async () => {
             try {
                await runTransaction(db, async (transaction) => {
                    const userProgressRef = doc(db, `users/${user.uid}/contestProgress`, activeContest.id);
                    const contestLeaderboardRef = doc(db, `contests/${activeContest.id}/leaderboard`, user.uid);
                    
                    transaction.update(contestRef, { totalChants: increment(1) });
                    transaction.set(userProgressRef, {
                        chants: increment(1),
                        lastChantedAt: serverTimestamp(),
                        displayName: user.displayName || 'Anonymous',
                    }, { merge: true });
                     transaction.set(contestLeaderboardRef, {
                        userId: user.uid,
                        chants: increment(1),
                        lastChantedAt: serverTimestamp(),
                        displayName: user.displayName || 'Anonymous',
                        mantra: data.mantra,
                    }, { merge: true });

                });
                 form.reset({ mantra: "Jai Shri Ram" });
             } catch (error: any) {
                 const permissionError = new FirestorePermissionError({
                    path: contestRef.path,
                    operation: 'write',
                 });
                errorEmitter.emit('permission-error', permissionError);
             }
        });
    };
    
    if (loadingContest) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
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

    const progressPercentage = (activeContest.totalChants / activeContest.goal) * 100;
    const isCompleted = activeContest.status === 'completed' || progressPercentage >= 100;
    
    return (
        <Card className="w-full max-w-2xl text-center shadow-2xl bg-gradient-to-br from-primary/10 to-background border-primary/20">
            <CardHeader>
                <Trophy className="mx-auto h-12 w-12 text-yellow-400" />
                <CardTitle className="text-3xl font-headline text-primary mt-2">{activeContest.title}</CardTitle>
                <CardDescription className="text-lg">
                    Chant to contribute to the global goal!
                </CardDescription>
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

                 {isCompleted ? (
                    <div className="font-semibold text-green-600">
                        Contest Completed!
                    </div>
                 ) : user ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleChant)} className="flex items-start gap-2">
                             <FormField
                                control={form.control}
                                name="mantra"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                    <FormControl>
                                        <Textarea
                                            placeholder="Type your mantra..."
                                            className="resize-none text-center text-lg"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" size="lg" disabled={isChanting}>
                                {isChanting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </Button>
                        </form>
                    </Form>
                 ) : (
                    <p className="text-muted-foreground">Please log in to participate.</p>
                 )}
                <RecentChants contestId={contestId} />
            </CardContent>
        </Card>
    )
}

export default function ContestsPage() {
    const db = useFirestore();

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
            <ContestContent contestId={activeContest.id} />
        </main>
    );
}

