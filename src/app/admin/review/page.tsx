

'use client';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, doc, updateDoc, DocumentData } from 'firebase/firestore';
import { useFirestore } from '@/lib/firebase/provider';
import { Loader2, CheckCircle, XCircle, Sparkles, BookOpen, UserSquare, Palmtree, Film } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransition, useMemo } from 'react';

type ContentType = 'media' | 'stories' | 'deities' | 'temples' | 'epicHeroes';

interface ReviewItem extends DocumentData {
  id: string;
  title?: string;
  name?: { en: string };
  title_en?: string;
  description_en?: string;
  summary?: { en: string };
  mediaType?: string;
}

function ReviewCard({ item, collectionName }: { item: ReviewItem, collectionName: ContentType }) {
  const { toast } = useToast();
  const db = useFirestore();
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (status: 'published' | 'unclaimed') => {
    startTransition(async () => {
        if (!db) return;
        try {
            const itemRef = doc(db, collectionName, item.id);
            await updateDoc(itemRef, { status: status });
            toast({
                title: `Content ${status === 'published' ? 'Approved' : 'Rejected'}`,
                description: `The item has been successfully updated.`,
            });
        } catch (error) {
            console.error(`Failed to update status:`, error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: `Could not update the item's status.`,
            });
        }
    });
  };

  const title = item.title_en || item.title?.en || item.name?.en || 'No Title';
  const description = item.description_en || item.summary?.en || `Type: ${collectionName}`;
  const badgeText = item.mediaType || collectionName.replace(/([A-Z])/g, ' $1').slice(0, -1);


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        <CardDescription>
          <Badge variant="secondary">{badgeText}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-4">{description}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus('unclaimed')} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4" />}
          Reject
        </Button>
        <Button size="sm" onClick={() => handleUpdateStatus('published')} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4" />}
          Approve
        </Button>
      </CardFooter>
    </Card>
  );
}


function ReviewTabContent({ collectionName, icon: Icon }: { collectionName: ContentType, icon: React.ElementType }) {
    const db = useFirestore();
    const pendingQuery = useMemo(() => {
        if (!db) return undefined;
        return query(collection(db, collectionName), where('status', '==', 'pending'))
    }, [db, collectionName]);

    const [pendingItems, isLoading] = useCollectionData(pendingQuery, { idField: 'id' });

    return (
        <div>
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        ) : pendingItems && pendingItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(pendingItems as ReviewItem[]).map((item) => (
                <ReviewCard key={item.id} item={item} collectionName={collectionName} />
            ))}
            </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Icon className="mx-auto h-24 w-24 text-muted-foreground/50" />
            <h2 className="mt-6 text-2xl font-semibold text-foreground">No Pending Content</h2>
            <p className="mt-2 text-muted-foreground">There are no pending items in this category.</p>
            </div>
        )}
        </div>
    )
}


export default function AdminReviewPage() {
  const { t } = useLanguage();

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">
          {t.admin.reviewTitle}
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          {t.admin.reviewDescription}
        </p>
      </div>

      <Tabs defaultValue="sagas" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="media"><Film className="mr-2 h-4 w-4" />Media</TabsTrigger>
            <TabsTrigger value="sagas"><BookOpen className="mr-2 h-4 w-4" />Sagas</TabsTrigger>
            <TabsTrigger value="deities"><Sparkles className="mr-2 h-4 w-4" />Deities</TabsTrigger>
            <TabsTrigger value="heroes"><UserSquare className="mr-2 h-4 w-4" />Heroes</TabsTrigger>
            <TabsTrigger value="temples"><Palmtree className="mr-2 h-4 w-4" />Temples</TabsTrigger>
        </TabsList>
        <TabsContent value="media" className="mt-6">
            <ReviewTabContent collectionName="media" icon={Film} />
        </TabsContent>
        <TabsContent value="sagas" className="mt-6">
            <ReviewTabContent collectionName="stories" icon={BookOpen} />
        </TabsContent>
        <TabsContent value="deities" className="mt-6">
            <ReviewTabContent collectionName="deities" icon={Sparkles} />
        </TabsContent>
         <TabsContent value="heroes" className="mt-6">
            <ReviewTabContent collectionName="epicHeroes" icon={UserSquare} />
        </TabsContent>
         <TabsContent value="temples" className="mt-6">
            <ReviewTabContent collectionName="temples" icon={Palmtree} />
        </TabsContent>
      </Tabs>
      
    </main>
  );
}
