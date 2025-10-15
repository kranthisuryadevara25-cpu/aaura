import { Feed } from "./components/feed";
import { CreateContent } from "./components/CreateContent";
import { getPersonalizedFeed, getTrendingContent } from '@/ai/flows/personalized-feed';
import { cookies } from 'next/headers';
import { auth, db } from '@/lib/firebase/admin';

async function getUserIdFromSession(): Promise<string | undefined> {
    try {
        const sessionCookie = cookies().get('__session')?.value;
        if (!sessionCookie) return undefined;
        const decodedIdToken = await auth.verifySessionCookie(sessionCookie, true);
        return decodedIdToken.uid;
    } catch (error) {
        return undefined;
    }
}

async function isProfileComplete(userId: string): Promise<boolean> {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        return userDoc.exists && userDoc.data()?.profileComplete === true;
    } catch {
        return false;
    }
}

export const revalidate = 60;

export default async function Page() {
  const userId = await getUserIdFromSession();
  
  let feed;
  if (userId && await isProfileComplete(userId)) {
      const result = await getPersonalizedFeed({ userId: userId });
      feed = result.feed;
  } else {
      const result = await getTrendingContent(db, 20);
      feed = result.feed;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-8">
      <CreateContent />
      <Feed items={feed} />
    </div>
  );
}
