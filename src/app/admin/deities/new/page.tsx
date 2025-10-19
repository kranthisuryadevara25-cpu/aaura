

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { deities as allDeities } from '@/lib/deities';
import { MultiSelect } from '@/components/ui/MultiSelect';


export default function NewDeityPage() {
  const router = useRouter();
  const { language } = useLanguage();
  
  const deities = allDeities;
  const isLoading = false;

  const [selectedDeity, setSelectedDeity] = useState<string[]>([]);

  const handleSelect = (slugs: string[]) => {
    // Since we only want to select one, we'll take the last selected item.
    const slug = slugs.at(-1);
    if (slug) {
        // We only allow selecting one, so we redirect immediately.
        router.push(`/admin/deities/edit/${slug}`);
    }
  };

  const deityOptions = deities.map(deity => ({
      value: deity.slug,
      label: deity.name[language] || deity.name.en,
  }));

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content
        </Button>
        
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Claim a New Deity</CardTitle>
                <CardDescription>Select a pre-approved deity stub from the master list to fill out its details. This prevents duplicate content.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <MultiSelect
                        options={deityOptions}
                        selected={selectedDeity}
                        onChange={handleSelect}
                        className="w-full"
                        placeholder="Select a deity to claim..."
                    />
                )}
                 <p className="text-sm text-muted-foreground mt-4">
                    If you don't see the deity you want to add, ask the super admin to add it to the Content Planning list.
                </p>
            </CardContent>
        </Card>
    </main>
  )
}
