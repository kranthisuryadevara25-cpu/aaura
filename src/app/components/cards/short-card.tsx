
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { placeholderImages } from '@/lib/placeholder-images';

export function ShortCard({ short }: { short: any }) {
    const shortImage = placeholderImages.find(p => p.id.startsWith('short-')) || placeholderImages[0];
    
    return (
        <Link href="#" className="group w-40 flex-shrink-0">
             <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg shadow-md transition-shadow group-hover:shadow-xl">
                <Image
                    src={short.thumbnailUrl || shortImage.imageUrl}
                    alt={short.title}
                    data-ai-hint="spiritual short video"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <div className="absolute bottom-0 left-0 p-2">
                    <h4 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                        {short.title}
                    </h4>
                 </div>
            </div>
        </Link>
    );
}
