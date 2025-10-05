
'use client';

import Link from 'next/link';
import { Home, Compass, PlusSquare, Bell, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export function BottomNavigation() {
  const pathname = usePathname();
  const [user] = useAuthState(auth);

  if (!user) {
    return null;
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/explore', icon: Compass, label: 'Explore' },
    { href: '/upload', icon: PlusSquare, label: 'Add' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-20">
      <div className="grid h-full grid-cols-5">
        {navItems.map((item) => {
          const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
            >
              <item.icon
                className={cn(
                  'h-6 w-6',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className={cn(isActive ? 'font-bold text-primary' : '')}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
