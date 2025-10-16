
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronsUpDown, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { stories as allSagas } from '@/lib/stories';

export default function NewStoryPage() {
  const router = useRouter();
  const { language } = useLanguage();
  
  // Use local mock data instead of Firestore
  const stories = allSagas;
  const isLoading = false;

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleSelect = (currentValue: string) => {
    setValue(currentValue);
    setOpen(false);
    if (currentValue) {
      router.push(`/admin/stories/edit/${currentValue}`);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Content
        </Button>
        
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Claim a New Saga</CardTitle>
                <CardDescription>Select a pre-approved saga stub from the master list to fill out its details. This prevents duplicate content.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between h-12 text-lg"
                            >
                            {value
                                ? stories?.find((story) => story.slug === value)?.title.en
                                : "Select a saga to claim..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search saga..." />
                                <CommandEmpty>No unclaimed sagas found.</CommandEmpty>
                                <CommandGroup>
                                {stories?.map((story) => (
                                    <CommandItem
                                    key={story.id}
                                    value={story.slug}
                                    onSelect={handleSelect}
                                    >
                                    <Check
                                        className={cn(
                                        "mr-2 h-4 w-4",
                                        value === story.slug ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {story.title[language] || story.title.en}
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
                 <p className="text-sm text-muted-foreground mt-4">
                    If you don't see the saga you want to add, ask the super admin to add it to the Content Planning list.
                </p>
            </CardContent>
        </Card>
    </main>
  )
}
