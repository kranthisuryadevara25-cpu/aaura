
'use client';

import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, Video, Images, Sparkles, ShoppingBag, Settings, Upload, LibraryBig, Users, Palmtree } from 'lucide-react';
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
          <SidebarMenuButton asChild tooltip="Temples">
            <Link href="/temples">
              <Palmtree />
              <span>Temples</span>
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

    