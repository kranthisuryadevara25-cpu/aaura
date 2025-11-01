
'use client';

import { useParams, notFound } from 'next/navigation';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useDocument, useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, writeBatch, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Loader2, Trophy, Check, Circle, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTransition, useMemo, useEffect } from 'react';
import { Challenge, challengeConverter } from '@/lib/challenges';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';

function TaskLink({ taskType, contentId }: { taskType: string, contentId: string }) {
    const href = taskType === 'read-story' ? `/stories/${contentId}` : `/watch/${contentId}`;
    if (taskType === 'recite-mantra') {
        return <span className="text-sm italic text-muted-foreground">Recite: "{contentId}"</span>
    }
    return (
        <Button variant="link" size="sm" asChild className="p-0 h-auto">
            <Link href={href} target="_blank">
                View Task <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
        </Button>
    )
}

export default function ChallengeDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const db = useFirestore();
    const auth = useAuth();
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    const [isJoining, startJoinTransition] = useTransition();

    const challengeRef = useMemo(() => db ? doc(db, 'challenges', id).withConverter(challengeConverter) : null, [db, id]);
    const [challengeSnapshot, isLoadingChallenge, challengeError] = useDocument(challengeRef);
    const challenge = challengeSnapshot?.data();

    const progressRef = useMemo(() => user ? doc(db, `users/${user.uid}/challenges`, id) : null, [user, db, id]);
    const [progress, isLoadingProgress, progressError] = useDocumentData(progressRef);
    
    useEffect(() => {
        if(challengeError) {
             const permissionError = new FirestorePermissionError({ path: challengeRef!.path, operation: 'get' });
             errorEmitter.emit('permission-error', permissionError);
        }
        if(progressError) {
             const permissionError = new FirestorePermissionError({ path: progressRef!.path, operation: 'get' });
             errorEmitter.emit('permission-error', permissionError);
        }
    }, [challengeError, progressError, challengeRef, progressRef]);

    const handleJoinChallenge = () => {
        if (!user || !progressRef) {
            toast({ variant: 'destructive', title: 'You must be logged in to join.' });
            return;
        }
        startJoinTransition(async () => {
            const batch = writeBatch(db);
            const progressData = {
                challengeId: id,
                startedAt: new Date(),
                completedTasks: [],
                isCompleted: false,
            };

            if (progress) { // Leaving the challenge
                 batch.delete(progressRef);
            } else { // Joining the challenge
                batch.set(progressRef, progressData);
            }
             try {
                await batch.commit();
                toast({ title: progress ? 'You have left the challenge.' : 'Challenge Joined!', description: 'Good luck on your journey.' });
            } catch (error) {
                const permissionError = new FirestorePermissionError({
                    path: progressRef.path,
                    operation: progress ? 'delete' : 'create',
                    requestResourceData: progress ? undefined : progressData,
                });
                errorEmitter.emit('permission-error', permissionError);
            }
        });
    }

     const handleTaskToggle = async (day: number, isCompleted: boolean) => {
        if (!user || !progressRef) return;
        const taskData = { completedTasks: isCompleted ? arrayUnion(day) : arrayRemove(day) };
        
        try {
            await writeBatch(db).update(progressRef, taskData).commit();
        } catch (error) {
            const permissionError = new FirestorePermissionError({
                path: progressRef.path,
                operation: 'update',
                requestResourceData: taskData,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    }

    if (isLoadingChallenge || isLoadingProgress) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>
    }

    if (!challenge) {
        return notFound();
    }

    const completedTasksSet = new Set(progress?.completedTasks || []);
    const isChallengeCompleted = completedTasksSet.size === challenge.durationDays;

    return (
        <main className="container mx-auto py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader className="text-center">
                    <Trophy className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="text-3xl mt-4">{challenge.title_en}</CardTitle>
                    <CardDescription className="text-lg">{challenge.description_en}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {challenge.tasks.sort((a,b) => a.day - b.day).map(task => {
                        const isCompleted = completedTasksSet.has(task.day);
                        return (
                            <div key={task.day} className={`flex items-center gap-4 p-4 rounded-lg border ${isCompleted ? 'bg-green-100/50 dark:bg-green-900/20 border-green-500/30' : 'bg-secondary/50'}`}>
                                <Checkbox
                                    id={`task-${task.day}`}
                                    checked={isCompleted}
                                    onCheckedChange={(checked) => handleTaskToggle(task.day, !!checked)}
                                    disabled={!progress}
                                />
                                <div className="flex-1">
                                    <label htmlFor={`task-${task.day}`} className="font-semibold cursor-pointer">
                                        Day {task.day}: {task.title}
                                    </label>
                                    <div className="mt-1">
                                        <TaskLink taskType={task.taskType} contentId={task.contentId} />
                                    </div>
                                </div>
                                {isCompleted && <Check className="h-6 w-6 text-green-500" />}
                            </div>
                        )
                    })}
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                     {user && progress && isChallengeCompleted && (
                        <div className="text-center p-4 bg-yellow-100/50 dark:bg-yellow-900/20 rounded-lg">
                           <p className="font-bold text-yellow-600">Congratulations! You've earned the '{challenge.badgeId}' badge!</p>
                        </div>
                    )}
                    {user && (
                         <Button onClick={handleJoinChallenge} disabled={isJoining} className="w-full">
                            {isJoining ? <Loader2 className="animate-spin mr-2" /> : (progress ? <Circle className="mr-2"/> : <Trophy className="mr-2"/>)}
                            {progress ? "Leave Challenge" : "Join Challenge"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </main>
    )
}
