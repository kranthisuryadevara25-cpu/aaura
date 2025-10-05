
'use client';

import { Icons } from "@/app/components/icons";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Languages, Search, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language.tsx";

export function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const { t } = useTranslation();
  const { setLanguage } = useLanguage();

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
  };
  
  return (
    <header className="py-2 px-4 md:px-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-20">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          { user && <SidebarTrigger /> }
          <Link href="/" className="flex items-center gap-3 group">
            <Icons.logo className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline-block text-2xl font-headline font-bold text-foreground">
              aaura
            </span>
          </Link>
        </div>
        
        <div className="flex-1 flex justify-center px-4 lg:px-16">
            <div className="relative w-full max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t('header.search_placeholder')} className="pl-10" />
            </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
           <Button variant="ghost" size="icon" title={t('header.notifications')}>
              <Bell className="h-5 w-5" />
              <span className="sr-only">{t('header.notifications')}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">{t('header.select_language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('header.select_language')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setLanguage('en')}>English</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLanguage('hi')}>हिन्दी (Hindi)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                  <span>{t('header.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
