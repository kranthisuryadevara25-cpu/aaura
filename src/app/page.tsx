
import { Feed } from "./components/feed";
import { CreateContent } from "./components/CreateContent";
import { getPersonalizedFeed } from '@/ai/flows/personalized-feed';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase/admin';

async function getUserIdFromSession(): Promise<string | undefined> {
    try {
        const sessionCookie = cookies().get('__session')?.value;
        if (!sessionCookie) return undefined;
        const decodedIdToken = await auth.verifySessionCookie(sessionCookie, true);
        return decodedIdToken.uid;
    } catch (error) {
        // Session cookie is invalid or expired.
        // console.error("Session cookie verification failed:", error);
    }
    return undefined;
}


// Revalidate the page every 60 seconds to fetch fresh content
export const revalidate = 60;

export default async function Page() {
  const userId = await getUserIdFromSession();
  
  const { feed } = await getPersonalizedFeed({ userId: userId });

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-8">
      <CreateContent />
      <Feed items={feed} isLoading={false} />
    </div>
  );
}
