
'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuth } from '@/lib/firebase/provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Video } from 'lucide-react';
import Link from 'next/link';

export function CreateContent() {
  const auth = useAuth();
  const [user] = useAuthState(auth);

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-muted-foreground">
            What's on your mind, {user.displayName || 'Creator'}?
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Button variant="outline" asChild>
            <Link href="/forum">
              <MessageSquare className="mr-2 h-4 w-4" />
              Create Post
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/upload">
              <Video className="mr-2 h-4 w-4" />
              Upload Video
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
