"use client";
import React from "react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { SearchBar } from "@/components/SearchBar";
import Link from "next/link";
import { Icons } from "@/app/components/icons";
import { Button } from "./ui/button";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export const TopNav = () => {
  const [user] = useAuthState(auth);

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3 group">
            <Icons.logo className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline-block text-2xl font-headline font-bold text-foreground">
              aaura
            </span>
        </Link>
        <SearchBar />
      </div>

      <div className="flex items-center gap-3">
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
