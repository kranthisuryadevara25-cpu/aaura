
"use client";
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { RightSidebar } from "@/app/components/right-sidebar";
import { Feed } from "./components/feed";
import { CreateContent } from "./components/CreateContent";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAuth, useFirestore } from "@/lib/firebase/provider";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, updateDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";


const WelcomeAlert = ({ user }: { user: any }) => {
    const db = useFirestore();
    const userRef = user ? doc(db, 'users', user.uid) : undefined;
    const [userData, loading] = useDocumentData(userRef);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (userData && userData.welcomeMessage) {
            setIsVisible(true);
        }
    }, [userData]);

    const handleDismiss = async () => {
        if (userRef) {
            await updateDoc(userRef, { welcomeMessage: null });
            setIsVisible(false);
        }
    };
    
    if (loading || !isVisible) {
        return null;
    }

    return (
        <Alert className="mb-6 bg-primary/10 border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary font-bold">A Welcome from the Cosmos!</AlertTitle>
            <AlertDescription>
                {userData.welcomeMessage}
            </AlertDescription>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="mt-2 text-primary hover:text-primary/80">
                Dismiss
            </Button>
        </Alert>
    );
};


export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const auth = useAuth();
  const [user] = useAuthState(auth);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav onSearch={setSearchQuery} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:p-6">
          <div className="max-w-3xl mx-auto px-4 py-4 space-y-8">
            {user && <WelcomeAlert user={user} />}
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
