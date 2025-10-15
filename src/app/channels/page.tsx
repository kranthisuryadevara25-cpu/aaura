
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, PlusCircle, Loader2, Users } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, query, type DocumentData, doc, writeBatch, increment } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useToast } from '@/hooks/use-toast';

interface Channel extends DocumentData {
  id: string;
  name: string;
  description_en: string;
  followerCount?: number;
  [key: string]: any;
}


function ChannelCard({ channel }: { channel: Channel }) {
  const { language, t } = useLanguage();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  
  const followingRef = user ? doc(db, `users/${user.uid}/following`, channel.id) : undefined;
  const [following, loadingFollowing] = useDocumentData(followingRef);
  
  const isFollowing = !!following;

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !channel.userId) {
        toast({ variant: 'destructive', title: "You must be logged in to follow a channel." });
        return;
    }
     if (user.uid === channel.userId) {
        toast({ variant: 'destructive', title: "You cannot follow your own channel." });
        return;
    }

    const currentUserRef = doc(db, 'users', user.uid);
    const targetUserRef = doc(db, 'users', channel.userId);
    const userFollowingRef = doc(db, `users/${user.uid}/following`, channel.id);
    const targetFollowerRef = doc(db, `users/${channel.userId}/followers`, user.uid);
    
    const batch = writeBatch(db);

    try {
        if (isFollowing) {
            batch.delete(userFollowingRef);
            batch.delete(targetFollowerRef);
            batch.update(currentUserRef, { followingCount: increment(-1) });
            batch.update(targetUserRef, { followerCount: increment(-1) });
            await batch.commit();
            toast({ title: "Unfollowed", description: `You have unfollowed ${channel.name}.` });
        } else {
            batch.set(userFollowingRef, { userId: channel.id, followedAt: new Date() });
            batch.set(targetFollowerRef, { userId: user.uid, followedAt: new Date() });
            batch.update(currentUserRef, { followingCount: increment(1) });
            batch.update(targetUserRef, { followerCount: increment(1) });
            await batch.commit();
            toast({ title: "Followed!", description: `You are now following ${channel.name}.` });
        }
    } catch (error) {
        console.error("Failed to follow/unfollow:", error);
        toast({ variant: 'destructive', title: 'An error occurred.' });
    }
  };


  const description = channel[`description_${language}`] || channel.description_en;
  
  return (
    <Link href={`/channels/${channel.id}`} className="group block h-full">
      <Card className="flex flex-col text-center items-center p-6 bg-card border-border hover:border-primary/50 transition-colors duration-300 h-full">
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
          <CardTitle className="flex items-center justify-center gap-2 text-foreground group-hover:text-primary">{channel.name} <CheckCircle className="text-blue-500 h-5 w-5" /></CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow">
          <CardDescription className="line-clamp-2 mb-4">{description}</CardDescription>
        </CardContent>
         <CardFooter className="flex-col w-full items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{channel.followerCount || 0} Followers</span>
            </div>
             {user && user.uid !== channel.userId && (
                <Button variant={isFollowing ? 'secondary' : 'default'} size="sm" onClick={handleFollow} disabled={loadingFollowing} className="w-full">
                    {loadingFollowing ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        isFollowing ? <><CheckCircle className="mr-2 h-4 w-4" /> {t.buttons.subscribed}</> : <><PlusCircle className="mr-2 h-4 w-4" /> {t.buttons.subscribe}</>
                    )}
                </Button>
            )}
         </CardFooter>
      </Card>
    </Link>
  );
}


export default function ChannelsPage() {
  const { t } = useLanguage();
  const db = useFirestore();
  const channelsQuery = query(collection(db, 'channels'));
  const [channels, isLoading] = useCollectionData(channelsQuery, { idField: 'id' });

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
            {channels && channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel as Channel} />
            ))}
          </div>
        )}
    </main>
  );
}
