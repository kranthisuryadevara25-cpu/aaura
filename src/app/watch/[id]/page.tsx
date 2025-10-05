
'use client';

import { FeedSidebar } from "@/components/feed-sidebar";
import { VideoPlayer } from "@/components/video-player";

export default function WatchPage({ params }: { params: { id: string }}) {
  const { id } = params;

  return (
    <div className="flex w-full h-screen bg-background text-foreground">
      {/* LEFT: main player and comments */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <VideoPlayer contentId={id} />
      </div>

      {/* RIGHT: mixed Up Next feed */}
      <aside className="w-[400px] border-l border-border overflow-y-auto hidden lg:block">
        <FeedSidebar currentId={id} />
      </aside>
    </div>
  );
}
