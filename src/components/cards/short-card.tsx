
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';

export function ShortCard({ short }: { short: any }) {
    const { language } = useLanguage();
    const title = short[`title_${language}`] || short.title_en;

    return (
        <Link href={`/watch/${short.id}`} className="block w-40 shrink-0">
            <div className="aspect-[9/16] relative rounded-lg overflow-hidden group">
                 <Image
                    src={short.thumbnailUrl || 'https://picsum.photos/seed/short-placeholder/270/480'}
                    alt={title}
                    fill
                    className="object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                 <div className="absolute bottom-2 left-2 text-white">
                    <p className="text-sm font-semibold line-clamp-2">{title}</p>
                 </div>
            </div>
        </Link>
    )
}
