
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { RightSidebar } from "@/app/components/right-sidebar";
import { Feed } from "./components/feed";
import { CreateContent } from "./components/CreateContent";
import { getPersonalizedFeed as getPersonalizedFeedFlow } from '@/ai/flows/personalized-feed';

export default async function Page() {
  // Fetch data directly on the server
  const { feed } = await getPersonalizedFeedFlow({ userId: undefined });

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
