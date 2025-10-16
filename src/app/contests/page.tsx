
'use client';

import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, limit, doc, runTransaction, serverTimestamp, increment, DocumentData, Timestamp, orderBy, addDoc } from 'firebase/firestore';
import { Loader2, Trophy, Send, Calendar } from 'lucide-react';
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
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

const chantSchema = z.object({
  mantra: z.string().min(1, "Mantra cannot be empty.").max(100, "Mantra is too long."),
});
type ChantFormValues = z.infer<typeof chantSchema>;

function RecentChants({ contestId }: { contestId: string }) {
    const db = useFirestore();
    const recentChantsQuery = useMemo(() => 
        query(
            collection(db, `contests/${contestId}/chants`), 
            orderBy('createdAt', 'desc'), 
            limit(10)
        ), [db, contestId]
    );
    const [recentChants, loading] = useCollectionData(recentChantsQuery);

    if (loading) {
        return <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
    }

    return (
        <div className="space-y-4 mt-6">
            <h4 className="font-semibold text-center text-muted-foreground">Recent Chants</h4>
            {recentChants && recentChants.length > 0 ? recentChants.map((chant, index) => (
                <div key={index} className="flex items-center gap-3 text-sm bg-secondary/50 p-2 rounded-lg">
                    <Avatar className="h-8 w-8">
                         <AvatarImage src={`https://picsum.photos/seed/${chant.authorId}/40`} />
                        <AvatarFallback>{chant.displayName?.[0] || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold text-foreground">{chant.displayName}</p>
                        <p className="text-sm text-primary font-medium">{chant.text}</p>
                    </div>
                    <p className="text-xs text-muted-foreground self-start">
                        {chant.createdAt ? formatDistanceToNow(chant.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                    </p>
                </div>
            )) : <p className="text-sm text-muted-foreground text-center">No chants yet. Be the first!</p>}
        </div>
    )
}

function ContestContent({ contest }: { contest: DocumentData }) {
    const db = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();
    const [isChanting, startChantTransition] = useTransition();

    const form = useForm<ChantFormValues>({
        resolver: zodResolver(chantSchema),
        defaultValues: { mantra: "" },
    });

    const handleChant = (data: ChantFormValues) => {
         const currentUser = auth.currentUser;
         if (!currentUser) {
            toast({ variant: 'destructive', title: 'You must be logged in to chant.' });
            return;
        }
        
        startChantTransition(async () => {
            const contestRef = doc(db, 'contests', contest.id);
            const chantsCollectionRef = collection(db, `contests/${contest.id}/chants`);
            const chantData = {
                authorId: currentUser.uid,
                displayName: currentUser.displayName || 'Anonymous User',
                text: data.mantra,
                createdAt: serverTimestamp(),
            };

            try {
                // We use a transaction to ensure both writes happen or neither do.
                await runTransaction(db, async (transaction) => {
                    transaction.set(doc(chantsCollectionRef), chantData);
                    transaction.update(contestRef, { totalChants: increment(1) });
                });
                form.reset({ mantra: "Jai Shri Ram" });
             } catch (error: any) {
                 const permissionError = new FirestorePermissionError({
                    path: contestRef.path,
                    operation: 'write',
                    requestResourceData: chantData
                 });
                 errorEmitter.emit('permission-error', permissionError);
            }
        });
    };
    
    const progressPercentage = (contest.totalChants / contest.goal) * 100;
    const isCompleted = contest.status === 'completed' || progressPercentage >= 100;
    const createdAtDate = contest.createdAt?.toDate ? format(contest.createdAt.toDate(), 'MMMM d, yyyy') : 'Recently';

    
    return (
        <Card className="w-full max-w-3xl shadow-2xl overflow-hidden border-primary/20">
            <div className="relative h-64 w-full">
                <Image 
                    src={contest.imageUrl || `https://picsum.photos/seed/${contest.id}/1200/400`} 
                    alt={contest.title}
                    data-ai-hint={contest.imageHint || "spiritual event"}
                    layout="fill"
                    objectFit="cover"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                 <div className="absolute bottom-4 left-4 text-white">
                    <h1 className="text-3xl font-headline font-bold tracking-tight text-white drop-shadow-md">{contest.title}</h1>
                    <p className="text-sm text-white/90 drop-shadow-sm flex items-center gap-1"><Calendar size={14}/> Created on {createdAtDate}</p>
                 </div>
            </div>
            <CardHeader className="text-center">
                <CardDescription className="text-lg">
                    {contest.description || "Join the community in a collective chant!"}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <p className="text-5xl font-bold tracking-tighter text-foreground">
                        {(contest.totalChants || 0).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                       of {contest.goal.toLocaleString()} chants
                    </p>
                </div>

                <Progress value={progressPercentage} className="h-4" />

                 {isCompleted ? (
                    <div className="font-semibold text-green-600">
                        Contest Completed! Thank you for your participation.
                    </div>
                 ) : auth.currentUser ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleChant)} className="flex items-start gap-2 max-w-lg mx-auto">
                             <FormField
                                control={form.control}
                                name="mantra"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                    <FormControl>
                                        <Textarea
                                            placeholder="Jai Shri Ram"
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
                <RecentChants contestId={contest.id} />
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
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-start">
            <ContestContent contest={activeContest} />
        </main>
    );
}
