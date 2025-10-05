
'use client';

import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Home, LibraryBig, ScrollText, UserSquare, Palmtree, BookHeart, CalendarDays, PartyPopper, MessageCircle, Users, Film, ShoppingBag, Upload, Settings } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';

export function Navigation() {
  const { t } = useLanguage();

  const navItems = [
    { href: "/", icon: Home, label: t.sidebar.home },
    { href: "/deities", icon: LibraryBig, label: t.sidebar.deities },
    { href: "/stories", icon: ScrollText, label: t.sidebar.stories },
    { href: "/characters", icon: UserSquare, label: t.sidebar.characters },
    { href: "/temples", icon: Palmtree, label: t.sidebar.temples },
    { href: "/rituals", icon: BookHeart, label: t.sidebar.rituals },
    { href: "/panchang", icon: CalendarDays, label: t.sidebar.panchang },
    { href: "/festivals", icon: PartyPopper, label: t.sidebar.festivals },
    { href: "/forum", icon: MessageCircle, label: t.sidebar.forum },
    { href: "/channels", icon: Users, label: t.sidebar.channels },
    { href: "/media", icon: Film, label: t.sidebar.media },
    { href: "/shop", icon: ShoppingBag, label: t.sidebar.shop },
    { href: "/upload", icon: Upload, label: t.sidebar.upload },
    { href: "/settings", icon: Settings, label: t.sidebar.settings },
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
