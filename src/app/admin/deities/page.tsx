
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle, Trash2, Edit, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { deities as mockDeities } from '@/lib/deities';

export default function ManageDeitiesPage() {
  const { toast } = useToast();
  const [deities, setDeities] = useState(mockDeities);
  const { language } = useLanguage();
  const isLoading = false; // Using mock data

  const handleDelete = async (id: string) => {
    // This is a mock delete. In a real app, this would interact with a database.
    setDeities(prevDeities => prevDeities.filter(d => d.id !== id));
    toast({
      title: 'Deity Deleted (Mock)',
      description: 'The deity has been removed from the view.',
    });
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
                <Sparkles className="h-10 w-10" /> Manage Deities
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Add, edit, or remove deities from the database.
            </p>
        </div>
        <Button asChild>
          <Link href="/admin/deities/new">
            <PlusCircle className="mr-2" />
            Add New Deity
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deities?.map((deity: any) => (
            <Card key={deity.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{deity.name[language] || deity.name.en}</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/deities/edit/${deity.id}`}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon">
                             <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to delete {deity.name.en}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the deity
                              and remove its data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(deity.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-md overflow-hidden">
                    <Image 
                        src={deity.images[0].url} 
                        alt={deity.name.en}
                        data-ai-hint={deity.images[0].hint}
                        fill
                        className="object-cover"
                    />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
