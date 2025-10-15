
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, PlusCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { collection, query, getDocs, type DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/admin';

// This line disables caching, ensuring the channel list is always fresh.
export const revalidate = 0;

interface Channel extends DocumentData {
  id: string;
  name: string;
  description_en: string;
  followerCount?: number;
  [key: string]: any;
}

function ChannelCard({ channel }: { channel: Channel }) {
  const description = channel.description_en;
  
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
            {/* The subscription button requires client-side logic and hooks, which will be re-added later if needed. */}
         </CardFooter>
      </Card>
    </Link>
  );
}


export default async function ChannelsPage() {
  let channels: Channel[] = [];
  let fetchError: string | null = null;
  
  try {
    const channelsQuery = query(collection(db, 'channels'));
    const querySnapshot = await getDocs(channelsQuery);
    channels = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Channel));
  } catch (error: any) {
    console.error("Error fetching channels:", error);
    fetchError = "Could not load channels. Please try again later.";
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
                  <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">Creator Channels</h1>
                <Button asChild>
                    <Link href="/channels/create">
                        <PlusCircle className="mr-2" />
                        Create Channel
                    </Link>
                </Button>
            </div>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                Follow your favorite spiritual guides and teachers.
            </p>
        </div>

        {fetchError ? (
            <div className="text-center text-red-500">{fetchError}</div>
        ) : channels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Users className="mx-auto h-24 w-24 text-muted-foreground/50" />
                <h2 className="mt-6 text-2xl font-semibold text-foreground">No Channels Found</h2>
                <p className="mt-2 text-muted-foreground">
                    Be the first one to create a channel!
                </p>
            </div>
        )}
    </main>
  );
}
