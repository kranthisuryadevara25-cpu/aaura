
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection, query, limit, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Feed } from './feed';
import { format } from 'date-fns';

export function Dashboard() {
    const { user } = useUser();
    
    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">Welcome back, {user?.displayName?.split(' ')[0] || 'Seeker'}!</h2>
                    <p className="text-muted-foreground">Here's your spiritual feed for {format(new Date(), 'MMMM do, yyyy')}</p>
                </div>
                <Feed />
            </div>
        </main>
    );
}
