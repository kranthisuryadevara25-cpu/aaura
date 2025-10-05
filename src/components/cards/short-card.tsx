
// This is a placeholder file for a new component.
// You can add your component code here.
// For example:

'use client';

import Link from 'next/link';
import Image from 'next/image';

export function ShortCard({ short }: { short: any }) {

    return (
        <Link href={`/watch/${short.id}`} className="block w-40 shrink-0">
            <div className="aspect-[9/16] relative rounded-lg overflow-hidden group">
                 <Image
                    src={short.thumbnailUrl || 'https://picsum.photos/seed/short-placeholder/270/480'}
                    alt={short.title_en}
                    fill
                    className="object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute bottom-2 left-2 text-white">
                    <p className="text-sm font-semibold line-clamp-2">{short.title_en}</p>
                 </div>
            </div>
        </Link>
    )
}
