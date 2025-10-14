
"use client";
import React from "react";
import { useLanguage } from "@/hooks/use-language";
import Link from 'next/link';
import { Home, Sparkles, ScrollText, UserSquare, Palmtree, BookHeart, CalendarDays, PartyPopper, MessageCircle, Film, ShoppingCart, Upload, Settings, PlusCircle, Star, ShieldCheck, HandHeart, ListMusic, Trophy } from 'lucide-react';

const MENU_ITEMS = [
  { href: "/", label: "home", icon: Home },
  { href: "/virtual-pooja", label: "virtualPooja", icon: HandHeart },
  { href: "/deities", label: "deities", icon: Sparkles },
  { href: "/stories", label: "stories", icon: ScrollText },
  { href: "/characters", label: "characters", icon: UserSquare },
  { href: "/temples", label: "temples", icon: Palmtree },
  { href: "/rituals", label: "rituals", icon: BookHeart },
  { href: "/panchang", label: "panchang", icon: CalendarDays },
  { href: "/festivals", label: "festivals", icon: PartyPopper },
  { href: "/horoscope", label: "horoscope", icon: Star },
  { href: "/playlists", label: "playlists", icon: ListMusic },
  { href: "/challenges", label: "challenges", icon: Trophy },
  { href: "/forum", label: "forum", icon: MessageCircle },
  { href: "/channels", label: "channels", icon: PlusCircle },
  { href: "/media", label: "media", icon: Film },
  { href: "/shop", label: "shop", icon: ShoppingCart },
];

const ADMIN_MENU_ITEMS = [
  { href: "/upload", label: "upload", icon: Upload },
  { href: "/admin/content", label: "adminContent", icon: ShieldCheck },
  { href: "/admin/review", label: "adminReview", icon: ShieldCheck },
  { href: "/settings", label: "settings", icon: Settings },
];


export const Sidebar = () => {
  const { t } = useLanguage();

  return (
    <aside className="w-60 hidden md:block border-r p-4">
      <nav className="space-y-1">
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Discover</h3>
        {MENU_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 py-2 px-3 rounded-md text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Icon className="h-5 w-5" />
            <span>
              {t.sidebar[label as keyof typeof t.sidebar] || label.charAt(0).toUpperCase() + label.slice(1)}
            </span>
          </Link>
        ))}
        <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manage</h3>
         {ADMIN_MENU_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 py-2 px-3 rounded-md text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Icon className="h-5 w-5" />
            <span>
              {t.sidebar[label as keyof typeof t.sidebar] || label.charAt(0).toUpperCase() + label.slice(1)}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
