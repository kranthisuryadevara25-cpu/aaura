

"use client";
import React, { useState, useEffect } from "react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth, useFirestore } from "@/lib/firebase/provider";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';
import { doc, collection, query } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Upload, MessageSquare, Settings, ShoppingCart, Menu, X, Users } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { FollowListDialog } from "./FollowListDialog";
import { useLanguage } from "@/hooks/use-language";
import { Sidebar } from "./Sidebar";

const UserStats = () => {
    const auth = useAuth();
    const { t } = useLanguage();
    const db = useFirestore();
    const [user] = useAuthState(auth);
    const userRef = user ? doc(db, 'users', user.uid) : undefined;
    const [userData, loading] = useDocumentData(userRef);
    
    const channelRef = user ? doc(db, 'channels', user.uid) : undefined;
    const [channelData, loadingChannel] = useDocumentData(channelRef);

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="flex items-center gap-4"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /></div>; 
    }

    if (!user) {
        return null; 
    }

    if (loading) {
        return (
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
        )
    }

    if (!userData) {
        return null;
    }

    return (
        <div className="flex items-center gap-4 text-sm">
            <FollowListDialog 
                userId={user.uid} 
                type="followers" 
                trigger={
                    <div className="text-center cursor-pointer hover:bg-secondary p-2 rounded-md">
                        <p className="font-bold">{userData.followerCount || 0}</p>
                        <p className="text-xs text-muted-foreground">{t.topnav.followers}</p>
                    </div>
                }
            />
             <FollowListDialog 
                userId={user.uid} 
                type="following" 
                trigger={
                    <div className="text-center cursor-pointer hover:bg-secondary p-2 rounded-md">
                        <p className="font-bold">{userData.followingCount || 0}</p>
                        <p className="text-xs text-muted-foreground">{t.topnav.following}</p>
                    </div>
                }
            />
            {channelData && (
                 <div className="text-center p-2 rounded-md">
                    <p className="font-bold">{channelData.subscriberCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Subscribers</p>
                </div>
            )}
        </div>
    )
}

const CartButton = () => {
    const auth = useAuth();
    const db = useFirestore();
    const [user] = useAuthState(auth);
    const cartRef = user ? collection(db, 'users', user.uid, 'cart') : undefined;
    const [cartItems] = useCollectionData(cartRef);
    const itemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient || !user) {
        return null;
    }

    return (
        <Button asChild variant="ghost" size="icon">
            <Link href="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{itemCount}</Badge>
                )}
            </Link>
        </Button>
    )
}

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-2xl font-serif">Aaura</SheetTitle>
          <SheetDescription className="sr-only">Main Navigation</SheetDescription>
        </SheetHeader>
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}

export const TopNav = () => {
  const auth = useAuth();
  const [user, loading] = useAuthState(auth);
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <MobileNav />
        <Link href="/" className="text-2xl font-serif">Aaura</Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex">
          <UserStats />
        </div>
        <LanguageSwitcher />
        <CartButton />
        {isClient ? (
          <>
            {loading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ''} />
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.uid}`}>
                          <User className="mr-2 h-4 w-4" />
                          <span>My Profile</span>
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                      <Link href="/upload">
                          <Upload className="mr-2 h-4 w-4" />
                          <span>{t.sidebar.upload}</span>
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                      <Link href="/forum">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>{t.forum.createPostTitle}</span>
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                      <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t.sidebar.settings}</span>
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </>
        ) : (
          <Skeleton className="h-8 w-20" /> // Placeholder to prevent layout shift
        )}
      </div>
    </header>
  );
};
