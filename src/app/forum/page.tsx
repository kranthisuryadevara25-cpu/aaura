
'use client';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, doc, writeBatch, increment } from 'firebase/firestore';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Users, Loader2, PlusCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

function GroupCard({ group }: { group: any }) {
    const { t } = useLanguage();
    const auth = useAuth();
    const db = useFirestore();
    const [user] = useAuthState(auth);
    const { toast } = useToast();
    
    const [loadingMembership, setLoadingMembership] = useState(false);
    
    const memberRef = user ? doc(db, `groups/${group.id}/members/${user.uid}`) : undefined;
    const [memberDoc] = useCollectionData(memberRef ? collection(db, `groups/${group.id}/members`) : undefined);
    const isMember = memberDoc?.some((m: any) => m.id === user?.uid);


    const handleJoinLeave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !memberRef) {
            toast({ variant: 'destructive', title: 'You must be logged in to join a group.' });
            return;
        }
        
        setLoadingMembership(true);
        const batch = writeBatch(db);
        const groupRef = doc(db, 'groups', group.id);

        try {
            if (isMember) {
                // Leave group
                batch.delete(memberRef);
                batch.update(groupRef, { memberCount: increment(-1) });
                toast({ title: `You have left the "${group.name}" group.` });
            } else {
                // Join group
                batch.set(memberRef, { joinedAt: new Date() });
                batch.update(groupRef, { memberCount: increment(1) });
                toast({ title: `Welcome to the "${group.name}" group!` });
            }
            await batch.commit();
        } catch (error) {
            const permissionError = new FirestorePermissionError({
                path: memberRef.path,
                operation: isMember ? 'delete' : 'create',
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setLoadingMembership(false);
        }
    };

    return (
        <Card className="overflow-hidden border-primary/20 hover:border-primary/50 transition-colors duration-300 h-full flex flex-col">
            <Link href={`/forum/${group.id}`} className="group block flex flex-col flex-grow">
                <div className="relative aspect-video bg-secondary">
                    <Image src={group.coverImageUrl || `https://picsum.photos/seed/${group.id}/600/400`} alt={group.name} fill className="object-cover" />
                </div>
                <CardHeader>
                    <CardTitle className="text-md font-semibold leading-tight line-clamp-2 text-foreground group-hover:text-primary">
                        {group.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {group.description}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{group.memberCount || 0} Members</span>
                    </div>
                </CardFooter>
            </Link>
             {user && (
                <CardFooter>
                     <Button variant={isMember ? 'secondary' : 'default'} size="sm" onClick={handleJoinLeave} disabled={loadingMembership} className="w-full">
                        {loadingMembership ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                            isMember ? <><CheckCircle className="mr-2 h-4 w-4" /> Joined</> : <><PlusCircle className="mr-2 h-4 w-4" /> Join</>
                        )}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}


export default function ForumPage() {
    const { t } = useLanguage();
    const db = useFirestore();
    const groupsQuery = query(collection(db, 'groups'));
    const [groups, isLoading] = useCollectionData(groupsQuery, { idField: 'id' });

    return (
        <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                <div className="text-left">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
                        <Users className="h-10 w-10" /> Community Groups
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
                        Find and join groups based on your interests to connect with fellow seekers.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/groups/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Group
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            ) : groups && groups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                       <GroupCard key={group.id} group={group} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Users className="mx-auto h-24 w-24 text-muted-foreground/50" />
                    <h2 className="mt-6 text-2xl font-semibold text-foreground">No Groups Found</h2>
                    <p className="mt-2 text-muted-foreground">
                        It looks like there are no community groups yet.
                    </p>
                </div>
            )}
        </main>
    );
}
