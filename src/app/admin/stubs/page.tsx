
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle, Trash2, Edit, Sparkles, BookOpen, UserSquare, Palmtree, ListPlus } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import { collection, deleteDoc, doc, DocumentData, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';


const stubSchema = z.object({
  name: z.string().min(3, "Name is required."),
  slug: z.string().min(3, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens."),
});

type StubFormValues = z.infer<typeof stubSchema>;

interface StubCreatorProps {
    collectionName: 'deities' | 'stories' | 'temples';
    itemType: string;
}

function StubCreator({ collectionName, itemType }: StubCreatorProps) {
    const db = useFirestore();
    const { toast } = useToast();
    
    const form = useForm<StubFormValues>({
        resolver: zodResolver(stubSchema),
        defaultValues: { name: '', slug: '' }
    });

    const onSubmit = async (data: StubFormValues) => {
        const collectionRef = collection(db, collectionName);
        const newStub = {
            name: { en: data.name },
            slug: data.slug,
            status: 'unclaimed',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        try {
            await addDoc(collectionRef, newStub);
            toast({ title: `${itemType} Stub Created`, description: `"${data.name}" has been added to the master list.` });
            form.reset();
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: `Error creating ${itemType} stub.` });
        }
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Add New {itemType} Stub</CardTitle>
                <CardDescription>Pre-populate content that creators can then claim and build out.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-4 items-end">
                        <FormField name="name" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} placeholder={`E.g., Name of the ${itemType}`} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField name="slug" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} placeholder={`e.g., name-of-the-${itemType}`} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit"><PlusCircle className="mr-2" /> Add Stub</Button>
                    </form>
                 </Form>
            </CardContent>
        </Card>
    );
}

interface StubListProps {
    collectionName: 'deities' | 'stories' | 'temples';
}

function StubList({ collectionName }: StubListProps) {
    const db = useFirestore();
    const stubsQuery = query(collection(db, collectionName));
    const [stubs, isLoading] = useCollectionData(stubsQuery, { idField: 'id' });

    return (
        <div>
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-2">
                    {stubs?.map((stub) => (
                        <Card key={stub.id} className="flex justify-between items-center p-4">
                            <div>
                                <p className="font-semibold">{stub.name.en}</p>
                                <p className="text-sm text-muted-foreground">{stub.slug}</p>
                            </div>
                            <Badge variant={stub.status === 'unclaimed' ? 'destructive' : 'secondary'}>{stub.status}</Badge>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function ContentStubsPage() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="text-left mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
              <ListPlus className="h-10 w-10" />
              Content Planning
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Create content stubs here. This acts as a master list for creators to choose from, preventing duplicate entries.
          </p>
      </div>

       <Tabs defaultValue="temples" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="temples"><Palmtree className="mr-2 h-4 w-4" />Temples</TabsTrigger>
            <TabsTrigger value="deities"><Sparkles className="mr-2 h-4 w-4" />Deities</TabsTrigger>
            <TabsTrigger value="sagas"><BookOpen className="mr-2 h-4 w-4" />Epic Sagas</TabsTrigger>
        </TabsList>
        <TabsContent value="temples" className="mt-6">
            <StubCreator collectionName="temples" itemType="Temple" />
            <StubList collectionName="temples" />
        </TabsContent>
        <TabsContent value="deities" className="mt-6">
            <StubCreator collectionName="deities" itemType="Deity" />
            <StubList collectionName="deities" />
        </TabsContent>
         <TabsContent value="sagas" className="mt-6">
            <StubCreator collectionName="stories" itemType="Saga" />
            <StubList collectionName="stories" />
        </TabsContent>
        </Tabs>
      
    </main>
  );
}

