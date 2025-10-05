
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
  // Hardcoded English labels as i18next is removed to fix stability issues.
  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/deities", icon: LibraryBig, label: "Deities" },
    { href: "/stories", icon: ScrollText, label: "Stories" },
    { href: "/characters", icon: UserSquare, label: "Characters" },
    { href: "/temples", icon: Palmtree, label: "Temples & Pilgrimages" },
    { href: "/rituals", icon: BookHeart, label: "Rituals" },
    { href: "/panchang", icon: CalendarDays, label: "Daily Panchang" },
    { href: "/festivals", icon: PartyPopper, label: "Festivals & Events" },
    { href: "/forum", icon: MessageCircle, label: "Forum & Q&A" },
    { href: "/channels", icon: Users, label: "Channels" },
    { href: "/media", icon: Film, label: "Media" },
    { href: "/shop", icon: ShoppingBag, label: "Shop" },
    { href: "/upload", icon: Upload, label: "Upload" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <SidebarContent className="p-4">
      <SidebarMenu>
        {navItems.map(item => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild tooltip={item.label}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarContent>
  );
}
