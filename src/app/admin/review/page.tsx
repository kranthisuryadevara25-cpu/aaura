
'use client';

import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, where, doc, updateDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface MediaItem extends DocumentData {
  id: string;
  title_en: string;
  description_en: string;
  mediaType: string;
}

export default function AdminReviewPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const pendingMediaQuery = query(collection(db, 'media'), where('status', '==', 'pending'));
  const [pendingMedia, isLoading] = useCollectionData(pendingMediaQuery, { idField: 'id' });

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const mediaRef = doc(db, 'media', id);
      await updateDoc(mediaRef, { status: status });
      toast({
        title: `Content ${status}`,
        description: `The media item has been successfully ${status}.`,
      });
    } catch (error) {
      console.error(`Failed to ${status} content:`, error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: `Could not update the media item's status.`,
      });
    }
  };

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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : pendingMedia && pendingMedia.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(pendingMedia as MediaItem[]).map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2">{item.title_en}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{item.mediaType}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-4">{item.description_en}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(item.id, 'rejected')}>
                  <XCircle className="mr-2" />
                  {t.buttons.reject}
                </Button>
                <Button size="sm" onClick={() => handleUpdateStatus(item.id, 'approved')}>
                  <CheckCircle className="mr-2" />
                  {t.buttons.approve}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <CheckCircle className="mx-auto h-24 w-24 text-muted-foreground/50" />
          <h2 className="mt-6 text-2xl font-semibold text-foreground">{t.admin.noPending}</h2>
        </div>
      )}
    </main>
  );
}
