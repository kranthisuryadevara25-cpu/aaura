
"use client";
import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { RightSidebar } from "@/app/components/right-sidebar";
import { Dashboard } from "./components/dashboard";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav onSearch={setSearchQuery} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Dashboard />
        </main>
        <aside className="hidden xl:block w-80 border-l p-4 shrink-0">
            <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
