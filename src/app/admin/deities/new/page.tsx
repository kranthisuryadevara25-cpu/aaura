
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronsUpDown, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import { deities as allDeities } from '@/lib/deities';

export default function NewDeityPage() {
  const router = useRouter();
  const { language } = useLanguage();
  
  const deities = allDeities;
  const isLoading = false;

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleSelect = (slug: string) => {
    setValue(slug);
    setOpen(false);
    if (slug) {
      router.push(`/admin/deities/edit/${slug}`);
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
                <CardTitle>Claim a New Deity</CardTitle>
                <CardDescription>Select a pre-approved deity stub from the master list to fill out its details. This prevents duplicate content.</CardDescription>
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
                                ? deities?.find((deity) => deity.slug === value)?.name.en
                                : "Select a deity to claim..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput placeholder="Search deity..." />
                                <CommandList>
                                    <CommandEmpty>No unclaimed deities found.</CommandEmpty>
                                    <CommandGroup>
                                    {deities?.map((deity) => (
                                        <CommandItem
                                        key={deity.slug}
                                        value={deity.name.en}
                                        onSelect={() => handleSelect(deity.slug)}
                                        >
                                        <Check
                                            className={cn(
                                            "mr-2 h-4 w-4",
                                            value === deity.slug ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {deity.name[language] || deity.name.en}
                                        </CommandItem>
                                    ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
                 <p className="text-sm text-muted-foreground mt-4">
                    If you don't see the deity you want to add, ask the super admin to add it to the Content Planning list.
                </p>
            </CardContent>
        </Card>
    </main>
  )
}
