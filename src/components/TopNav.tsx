
"use client";
import React, { useState, useEffect } from "react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { SearchBar, type SearchBarProps } from "@/components/SearchBar";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Upload, MessageSquare, Settings, ShoppingCart } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { FollowListDialog } from "./FollowListDialog";


const UserStats = () => {
    const auth = useAuth();
    const db = useFirestore();
    const [user] = useAuthState(auth);
    const userRef = user ? doc(db, 'users', user.uid) : undefined;
    const [userData, loading] = useDocumentData(userRef);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="flex items-center gap-4"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></div>; 
    }

    if (!user) {
        return null; 
    }

    if (loading) {
        return (
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
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
                        <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                }
            />
             <FollowListDialog 
                userId={user.uid} 
                type="following" 
                trigger={
                    <div className="text-center cursor-pointer hover:bg-secondary p-2 rounded-md">
                        <p className="font-bold">{userData.followingCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                }
            />
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

export const TopNav = ({ onSearch }: { onSearch?: SearchBarProps['onSearch'] }) => {
  const auth = useAuth();
  const [user] = useAuthState(auth);

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-2xl font-serif">Aaura</Link>
        <SearchBar onSearch={onSearch} />
      </div>

      <div className="flex items-center gap-3">
        <UserStats />
        <LanguageSwitcher />
        <CartButton />
        {user ? (
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
                    <Link href="/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Upload Content</span>
                    </Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/forum">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Create Post</span>
                    </Link>
                 </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
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
      </div>
    </header>
  );
};
