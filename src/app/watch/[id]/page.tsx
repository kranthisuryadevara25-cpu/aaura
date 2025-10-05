
'use client';
import { FeedSidebar } from "@/components/feed-sidebar";
import { VideoPlayer } from "@/components/video-player";

export default function WatchPage({ params }: { params: { id: string }}) {
  const { id } = params;

  return (
    <div className="flex w-full h-screen bg-background text-foreground">
      <div className="flex-1 p-4 overflow-y-auto">
        <VideoPlayer contentId={id} />
      </div>
      <aside className="w-[400px] border-l border-border overflow-y-auto hidden lg:block">
        <FeedSidebar currentId={id} />
      </aside>
    </div>
  );
}
