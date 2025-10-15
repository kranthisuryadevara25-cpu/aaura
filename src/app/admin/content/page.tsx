
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle, Trash2, Edit, Sparkles, BookOpen, UserSquare, Palmtree } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import { collection, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import type { Deity } from '@/lib/deities';
import type { Story } from '@/lib/stories';
import type { EpicHero } from '@/lib/characters';
import type { Temple } from '@/lib/temples';

// Define DB references outside of the components
const db = useFirestore();
const deitiesRef = collection(db, 'deities');
const storiesRef = collection(db, 'stories');
const charactersRef = collection(db, 'epicHeroes');
const templesRef = collection(db, 'temples');


function DeitiesTabContent() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [deities, isLoading] = useCollectionData(deitiesRef, { idField: 'id' });

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'deities', id));
      toast({ title: 'Deity Deleted', description: 'The deity has been removed from the database.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete deity.' });
    }
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">Manage the gods and goddesses in the app.</p>
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
          {(deities as Deity[] | undefined)?.map((deity) => (
            <Card key={deity.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{deity.name[language] || deity.name.en}</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/deities/edit/${deity.slug}`}>
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
                              This action cannot be undone. This will permanently delete the deity.
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
    </div>
  )
}

function StoriesTabContent() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [stories, isLoading] = useCollectionData(storiesRef, { idField: 'id' });

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'stories', id));
      toast({ title: 'Story Deleted', description: 'The story has been removed.' });
    } catch {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete story.' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage the episodic stories in the app.</p>
        <Button asChild>
          <Link href="/admin/stories/new">
            <PlusCircle className="mr-2" />
            Add New Story
          </Link>
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(stories as Story[] | undefined)?.map((story) => (
            <Card key={story.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{story.title[language] || story.title.en}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/stories/edit/${story.slug}`}>
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
                        <AlertDialogTitle>Are you sure you want to delete this story?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the story.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(story.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-md overflow-hidden">
                  <Image
                    src={story.image.url}
                    alt={story.title.en}
                    data-ai-hint={story.image.hint}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CharactersTabContent() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [characters, isLoading] = useCollectionData(charactersRef, { idField: 'id' });


  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'epicHeroes', id));
      toast({ title: 'Character Deleted', description: 'The character has been removed.' });
    } catch {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete character.' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage the mythological characters in the app.</p>
        <Button asChild>
          <Link href="/admin/characters/new">
            <PlusCircle className="mr-2" />
            Add New Character
          </Link>
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(characters as EpicHero[] | undefined)?.map((character) => (
            <Card key={character.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{character.name[language] || character.name.en}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/characters/edit/${character.slug}`}>
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
                        <AlertDialogTitle>Are you sure you want to delete this character?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the character.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(character.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-md overflow-hidden">
                  <Image
                    src={character.imageUrl}
                    alt={character.name.en}
                    data-ai-hint={character.imageHint}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplesTabContent() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [temples, isLoading] = useCollectionData(templesRef, { idField: 'id' });

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'temples', id));
      toast({ title: 'Temple Deleted', description: 'The temple has been removed.' });
    } catch {
       toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete temple.' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Manage the temples and pilgrimage sites.</p>
        <Button asChild>
          <Link href="/admin/temples/new">
            <PlusCircle className="mr-2" />
            Add New Temple
          </Link>
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(temples as Temple[] | undefined)?.map((temple) => (
            <Card key={temple.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{temple.name[language] || temple.name.en}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/temples/edit/${temple.slug}`}>
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
                        <AlertDialogTitle>Are you sure you want to delete this temple?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the temple data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(temple.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-md overflow-hidden">
                  <Image
                    src={temple.media.images[0].url}
                    alt={temple.name.en}
                    data-ai-hint={temple.media.images[0].hint}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ContentManagementPage() {
  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="text-left mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary flex items-center gap-3">
              Content Management
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Add, edit, and manage all the core content of the Aaura application.
          </p>
      </div>

       <Tabs defaultValue="deities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deities"><Sparkles className="mr-2 h-4 w-4" />Deities</TabsTrigger>
            <TabsTrigger value="stories"><BookOpen className="mr-2 h-4 w-4" />Epic Sagas</TabsTrigger>
            <TabsTrigger value="characters"><UserSquare className="mr-2 h-4 w-4" />Epic Heroes</TabsTrigger>
            <TabsTrigger value="temples"><Palmtree className="mr-2 h-4 w-4" />Temples</TabsTrigger>
        </TabsList>
        <TabsContent value="deities" className="mt-6">
            <DeitiesTabContent />
        </TabsContent>
        <TabsContent value="stories" className="mt-6">
            <StoriesTabContent />
        </TabsContent>
        <TabsContent value="characters" className="mt-6">
            <CharactersTabContent />
        </TabsContent>
         <TabsContent value="temples" className="mt-6">
            <TemplesTabContent />
        </TabsContent>
        </Tabs>
      
    </main>
  );
}
