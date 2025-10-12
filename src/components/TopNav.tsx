
"use client";
import React from "react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { SearchBar, type SearchBarProps } from "@/components/SearchBar";
import Link from "next/link";
import { Button } from "./ui/button";
import { auth, db } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Upload, Film, MessageSquare } from "lucide-react";

const UserStats = () => {
    const [user] = useAuthState(auth);
    const userRef = user ? doc(db, 'users', user.uid) : undefined;
    const [userData] = useDocumentData(userRef);

    if (!userData) {
        return null;
    }

    return (
        <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
                <p className="font-bold">{userData.followerCount || 0}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
                <p className="font-bold">{userData.followingCount || 0}</p>
                <p className="text-xs text-muted-foreground">Following</p>
            </div>
        </div>
    )
}

export const TopNav = ({ onSearch }: { onSearch?: SearchBarProps['onSearch'] }) => {
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
        {user && <UserStats />}
        {user && (
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Upload className="h-5 w-5" />
                <span className="sr-only">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/upload">
                  <Film className="mr-2 h-4 w-4" />
                  <span>Upload Media</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/forum">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Create Post</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <LanguageSwitcher />
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
                    <Link href="/profile/setup">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
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
