
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, useFirestore, useStorage } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { moderateContent } from '@/ai/ai-content-moderation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/use-language';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  title_en: z.string().min(5, { message: 'English title must be at least 5 characters.' }),
  title_hi: z.string().min(5, { message: 'Hindi title must be at least 5 characters.' }),
  title_te: z.string().min(5, { message: 'Telugu title must be at least 5 characters.' }),
  description_en: z.string().min(10, { message: 'English description must be at least 10 characters.' }),
  description_hi: z.string().min(10, { message: 'Hindi description must be at least 10 characters.' }),
  description_te: z.string().min(10, { message: 'Telugu description must be at least 10 characters.' }),
  media: z.any().refine((files) => files?.length === 1, 'A media file is required.'),
  mediaType: z.enum(['video', 'short', 'bhajan', 'podcast', 'pravachan', 'audiobook']),
});

type FormValues = z.infer<typeof formSchema>;

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const storage = useStorage();
  const [user] = useAuthState(auth);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_en: '',
      title_hi: '',
      title_te: '',
      description_en: '',
      description_hi: '',
      description_te: '',
      mediaType: 'video',
    }
  });

  const fileRef = form.register('media');

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
  });

  const onSubmit = (data: FormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to upload.' });
      return;
    }

    const mediaFile = data.media[0];
    if (!mediaFile) {
        toast({ variant: 'destructive', title: 'No file selected.' });
        return;
    }
    
    setIsUploading(true);

    startTransition(async () => {
      try {
        
        // Step 1: Create the Firestore document reference first to get an ID.
        const mediaCollection = collection(db, 'media');
        const newDocRef = doc(mediaCollection);
        
        // Step 2: Start the Firebase Storage upload immediately.
        const storageRef = ref(storage, `media/${user.uid}/${newDocRef.id}/${mediaFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, mediaFile);

        // Step 3: In parallel, run AI content moderation.
        const moderationPromise = moderateContent({
          videoDataUri: "data:text/plain;base64,aG9sZGluZw==", // Using a tiny placeholder as the content is not analyzed
          title: data.title_en,
          description: data.description_en,
        });

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          }, 
          (error) => {
            // Handle unsuccessful uploads
            console.error("Upload failed:", error);
            toast({ variant: "destructive", title: "File Upload Failed", description: "Could not upload your file. Please try again." });
            setIsUploading(false);
          }, 
          async () => {
            // Upload completed successfully, now get the download URL.
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Wait for the moderation to complete
            const moderationResult = await moderationPromise;

            if (!moderationResult.isAppropriate) {
              toast({
                variant: 'destructive',
                title: 'Content Moderation Failed',
                description: moderationResult.reason,
                duration: 9000,
              });
              // Note: You might want to delete the uploaded file from storage here.
              setIsUploading(false);
              return;
            }

            // Step 4: Update the Firestore document with all the metadata and the final URL.
            await setDoc(newDocRef, {
                id: newDocRef.id,
                userId: user.uid,
                title_en: data.title_en,
                title_hi: data.title_hi,
                title_te: data.title_te,
                description_en: data.description_en,
                description_hi: data.description_hi,
                description_te: data.description_te,
                mediaUrl: downloadURL,
                thumbnailUrl: `https://img.youtube.com/vi/${Math.random().toString(36).substring(7)}/0.jpg`,
                uploadDate: serverTimestamp(),
                mediaType: data.mediaType,
                status: 'approved', // Automatically approved
                duration: 0, 
                language: 'en',
                tags: [data.mediaType],
                likes: 0,
                views: 0,
            });
            
            toast({
                title: 'Upload Complete!',
                description: 'Your media has been published.',
            });
            setIsUploading(false);
            router.push('/media');
          }
        );

      } catch (error) {
        console.error('Upload process failed:', error);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'Something went wrong during the submission process. Please try again.',
        });
        setIsUploading(false);
      }
    });
  };

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center">
        <Card className="w-full max-w-2xl bg-card">
        <CardHeader>
            <CardTitle>Upload Media</CardTitle>
            <CardDescription>Share your spiritual, religious, and wellness content with the community. All content must be positive and uplifting.</CardDescription>
        </CardHeader>
        <CardContent>
            {isUploading ? (
                 <div className="flex flex-col items-center justify-center h-40">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground mb-2">Uploading... please wait.</p>
                    <Progress value={uploadProgress} className="w-full" />
                 </div>
            ) : (
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="title_en"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Title (English)</FormLabel>
                        <FormControl>
                            <Input placeholder="E.g., Morning Yoga for Positive Energy" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="title_hi"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Title (Hindi)</FormLabel>
                        <FormControl>
                            <Input placeholder="उदा., सकारात्मक ऊर्जा के लिए सुबह का योग" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="title_te"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Title (Telugu)</FormLabel>
                        <FormControl>
                            <Input placeholder="ఉదా., సానుకూల శక్తి కోసం ఉదయం యోగా" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="description_en"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description (English)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="A short summary of your media's positive message" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="description_hi"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description (Hindi)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="आपके मीडिया के सकारात्मक संदेश का संक्षिप्त सारांश" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="description_te"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description (Telugu)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="మీ మీడియా యొక్క సానుకూల సందేశం యొక్క చిన్న సారాంశం" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="mediaType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Media Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a media type" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="bhajan">Bhajan</SelectItem>
                            <SelectItem value="podcast">Podcast</SelectItem>
                            <SelectItem value="pravachan">Pravachan</SelectItem>
                            <SelectItem value="audiobook">Audiobook</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="media"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Media File</FormLabel>
                        <FormControl>
                            <Input type="file" accept="video/*,audio/*" {...fileRef} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isUploading || isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload & Publish
                    </Button>
                </form>
                </Form>
            )}
        </CardContent>
        </Card>
    </main>
  );
}

    