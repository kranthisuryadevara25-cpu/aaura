
"use client";
import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { RightSidebar } from "@/app/components/right-sidebar";
import { Feed } from "./components/feed";
import { CreateContent } from "./components/CreateContent";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user] = useAuthState(auth);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav onSearch={setSearchQuery} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:p-6">
          <div className="max-w-3xl mx-auto px-4 py-4 space-y-8">
            {user && <CreateContent />}
            <Feed searchQuery={searchQuery} />
          </div>
        </main>
        <aside className="hidden xl:block w-80 border-l p-4 shrink-0">
            <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
