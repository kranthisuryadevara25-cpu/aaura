
'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface FeedSidebarProps {
  items: any[];
  isLoading: boolean;
}

export function FeedSidebar({ items, isLoading }: FeedSidebarProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
        <h2 className="text-xl font-bold">Up Next</h2>
        {items.map(item => (
            <Link key={`${item.type}-${item.id}`} href={item.href} className="group">
              <div className="flex gap-3 hover:bg-secondary/50 p-2 rounded-lg cursor-pointer transition-colors">
                <div className="relative w-40 h-24 shrink-0">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="w-full h-full object-cover rounded-md"
                    />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{item.type}</p>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            </Link>
        ))}
    </div>
  );
}
