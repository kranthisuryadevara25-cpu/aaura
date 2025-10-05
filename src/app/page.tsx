"use client";
import React from "react";
import { Feed } from "@/app/components/feed";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { RightSidebar } from "@/app/components/right-sidebar";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Feed />
        </main>
        <aside className="hidden xl:block w-80 border-l p-4">
            <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
