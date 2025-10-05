
'use client';

import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, LibraryBig, ScrollText, UserSquare, Palmtree, BookHeart, CalendarDays, PartyPopper, MessageCircle, Users, Film, ShoppingBag, Upload, Settings } from 'lucide-react';
import Link from 'next/link';

export function Navigation() {
  return (
    <SidebarContent className="p-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Home">
            <Link href="/">
              <Home />
              <span>Home</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Deities">
            <Link href="/deities">
              <LibraryBig />
              <span>Deities</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Stories">
            <Link href="/stories">
              <ScrollText />
              <span>Stories</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Characters">
            <Link href="/characters">
              <UserSquare />
              <span>Characters</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Temples & Pilgrimages">
            <Link href="/temples">
              <Palmtree />
              <span>Temples</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Rituals">
            <Link href="/rituals">
              <BookHeart />
              <span>Rituals</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Daily Panchang">
            <Link href="/panchang">
              <CalendarDays />
              <span>Panchang</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Festivals & Events">
            <Link href="/festivals">
              <PartyPopper />
              <span>Festivals</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Forum & Q&A">
            <Link href="/forum">
              <MessageCircle />
              <span>Forum</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Channels">
            <Link href="/channels">
              <Users />
              <span>Channels</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Media">
            <Link href="/media">
              <Film />
              <span>Media</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Shop">
            <Link href="/shop">
              <ShoppingBag />
              <span>Shop</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Upload">
            <Link href="/upload">
              <Upload />
              <span>Upload</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Settings">
            <Link href="/settings">
              <Settings />
              <span>Settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
  );
}
