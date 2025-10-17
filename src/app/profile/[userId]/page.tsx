
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import Image from 'next/image';
import { Loader2, User, CheckCircle, PlusCircle, UserPlus, Mail, Cake } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { FollowListDialog } from '@/components/FollowListDialog';
import { FirestorePermissionError } from '@/lib/firebase/errors';
import { errorEmitter } from '@/lib/firebase/error-emitter';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { language, t } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  const [currentUser] = useAuthState(auth);
  const { toast } = useToast();

  const profileRef = doc(db, 'users', userId);
  const [profile, loadingProfile] = useDocumentData(profileRef);

  const followingRef = currentUser ? doc(db, `users/${currentUser.uid}/following`, userId) : undefined;
  const [following, loadingFollowing] = useDocumentData(followingRef);
  const isFollowing = !!following;
  const isOwner = currentUser?.uid === userId;

  const handleFollow = async () => {
    if (!currentUser || !profileRef || !followingRef) {
      toast({ variant: 'destructive', title: 'You must be logged in to follow a user.' });
      return;
    }
     if (isOwner) {
        toast({ variant: 'destructive', title: "You cannot follow yourself." });
        return;
    }

    const currentUserRef = doc(db, 'users', currentUser.uid);
    const targetUserRef = doc(db, 'users', userId);
    const followerRef = doc(db, `users/${userId}/followers`, currentUser.uid);
    
    const batch = writeBatch(db);

    if (isFollowing) {
      batch.delete(followingRef);
      batch.delete(followerRef);
      batch.update(currentUserRef, { followingCount: increment(-1) });
      batch.update(targetUserRef, { followerCount: increment(-1) });
    } else {
      batch.set(followingRef, { userId: userId, followedAt: serverTimestamp() });
      batch.set(followerRef, { userId: currentUser.uid, followedAt: serverTimestamp() });
      batch.update(currentUserRef, { followingCount: increment(1) });
      batch.update(targetUserRef, { followerCount: increment(1) });
    }

    batch.commit()
    .then(() => {
        toast({
          title: isFollowing ? 'Unfollowed' : 'Followed!',
          description: `You are ${isFollowing ? 'no longer following' : 'now following'} ${profile?.fullName}.`
        });
    })
    .catch((serverError) => {
        const operation = isFollowing ? 'delete' : 'create';
        const permissionError = new FirestorePermissionError({
            path: followingRef.path,
            operation: operation
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  if (loadingProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full bg-secondary">
            <Image
                src={`https://picsum.photos/seed/${userId}-banner/1200/400`}
                alt={`${profile.fullName} banner`}
                data-ai-hint="abstract spiritual background"
                layout="fill"
                objectFit="cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 -mt-20">
            <div className="relative h-32 w-32 shrink-0 rounded-full border-4 border-background bg-secondary mx-auto sm:mx-0">
              <Image
                src={profile.photoURL || `https://picsum.photos/seed/${userId}/200/200`}
                alt={profile.fullName}
                data-ai-hint="spiritual person"
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <div className="flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <CardTitle className="text-3xl font-bold flex items-center justify-center sm:justify-start gap-2">
                        {profile.fullName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        {currentUser && !isOwner && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant={isFollowing ? 'secondary' : 'default'} size="lg" disabled={loadingFollowing} >
                                        {loadingFollowing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                                            isFollowing ? <><CheckCircle className="mr-2 h-4 w-4" /> Following</> : <><UserPlus className="mr-2 h-4 w-4" /> Follow</>
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {isFollowing ? "Unfollow" : "Follow"} {profile.fullName}?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            You can always change your mind later.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t.buttons.cancel}</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleFollow}>{isFollowing ? 'Unfollow' : 'Follow'}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        {isOwner && (
                             <Button variant="outline" onClick={() => router.push('/settings')}>
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>
                 <div className="mt-4 flex justify-center sm:justify-start items-center gap-6 text-sm">
                    <FollowListDialog userId={userId} type="followers" trigger={<div className="text-center cursor-pointer"><p className="font-bold text-lg">{profile.followerCount || 0}</p><p className="text-muted-foreground">{t.topnav.followers}</p></div>} />
                    <FollowListDialog userId={userId} type="following" trigger={<div className="text-center cursor-pointer"><p className="font-bold text-lg">{profile.followingCount || 0}</p><p className="text-muted-foreground">{t.topnav.following}</p></div>} />
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>About {profile.fullName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4"/>
                        <span>{profile.email}</span>
                    </div>
                    {profile.birthDate && (
                         <div className="flex items-center gap-3">
                            <Cake className="h-4 w-4"/>
                            <span>Born on {format(new Date(profile.birthDate), 'MMMM d, yyyy')}</span>
                        </div>
                    )}
                    {profile.zodiacSign && (
                         <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4"/>
                            <span>{profile.zodiacSign}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Activity Feed</h3>
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-2xl font-semibold text-foreground">Coming Soon</h2>
                <p className="mt-2 text-muted-foreground">This user's recent posts and manifestations will appear here.</p>
            </div>
        </div>
      </div>

    </main>
  );
}

