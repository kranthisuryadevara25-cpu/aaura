

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { temples as allTemples } from '@/lib/temples';
import { MultiSelect } from '@/components/ui/MultiSelect';


export default function NewTemplePage() {
  const router = useRouter();
  const { language } = useLanguage();
  
  const temples = allTemples;
  const isLoading = false;

  const [selectedTemple, setSelectedTemple] = useState<string[]>([]);

  const handleSelect = (slugs: string[]) => {
    const slug = slugs[0];
    if (slug) {
        setSelectedTemple(slugs);
        router.push(`/admin/temples/edit/${slug}`);
    } else {
        setSelectedTemple([]);
    }
  };

  const templeOptions = temples.map(temple => ({
      value: temple.slug,
      label: temple.name[language] || temple.name.en,
  }));

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content
        </Button>
        
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Claim a New Temple</CardTitle>
                <CardDescription>Select a pre-approved temple stub from the master list to fill out its details. This prevents duplicate content.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <MultiSelect
                        options={templeOptions}
                        selected={selectedTemple}
                        onChange={handleSelect}
                        className="w-full"
                        placeholder="Select a temple to claim..."
                    />
                )}
                 <p className="text-sm text-muted-foreground mt-4">
                    If you don't see the temple you want to add, ask the super admin to add it to the Content Planning list.
                </p>
            </CardContent>
        </Card>
    </main>
  )
}
