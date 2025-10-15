
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { RightSidebar } from "@/app/components/right-sidebar";
import { Feed } from "./components/feed";
import { CreateContent } from "./components/CreateContent";
import { getPersonalizedFeed } from '@/ai/flows/personalized-feed';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { adminApp } from '@/lib/firebase/admin';

// This function attempts to get the UID from the session cookie
// It's a simplified example; a real app would use a more robust session management solution
async function getUserIdFromSession(): Promise<string | undefined> {
    try {
        const sessionCookie = cookies().get('__session')?.value;
        if (!sessionCookie) return undefined;
        // This checks if the admin app is initialized, which is necessary for verifySessionCookie
        if (adminApp.name) {
            const decodedIdToken = await getAuth(adminApp).verifySessionCookie(sessionCookie, true);
            return decodedIdToken.uid;
        }
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
  
  // Fetch data directly on the server. This is much faster.
  const { feed } = await getPersonalizedFeed({ userId: userId });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:p-6">
          <div className="max-w-3xl mx-auto px-4 py-4 space-y-8">
            <CreateContent />
            <Feed items={feed} isLoading={false} />
          </div>
        </main>
        <aside className="hidden xl:block w-80 border-l p-4 shrink-0">
            <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
