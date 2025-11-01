
'use client';

import { useState } from 'react';
import { useStorage } from '@/lib/firebase/provider';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, UploadCloud, Image as ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void;
  onFileSelect?: (file: File | null) => void;
  initialUrl?: string | null;
  folderName?: string;
}

export function ImageUpload({ onUploadComplete, onFileSelect, initialUrl, folderName = 'content-images' }: ImageUploadProps) {
  const { toast } = useToast();
  const storage = useStorage();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState<string | null>(initialUrl || null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (onFileSelect) {
      onFileSelect(file || null);
    } else if (file && onUploadComplete) {
      handleUpload(file);
    }
  };

  const handleUpload = (file: File) => {
    setIsUploading(true);
    setProgress(0);

    const storageRef = ref(storage, `${folderName}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        setIsUploading(false);
        console.error('Upload failed:', error);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: 'There was an error uploading your image. Please try again.',
        });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFileUrl(downloadURL);
          if (onUploadComplete) {
            onUploadComplete(downloadURL);
          }
          setIsUploading(false);
          toast({
            title: 'Upload Complete',
            description: 'Your image has been uploaded successfully.',
          });
        });
      }
    );
  };

  const handleRemoveImage = () => {
    // Note: This only removes the image from the form state, not from Firebase Storage.
    // A more robust solution would involve deleting the file from Storage as well.
    setFileUrl(null);
    if(onUploadComplete) onUploadComplete('');
    if(onFileSelect) onFileSelect(null);
  }

  // Use the local initialUrl state for previewing, which can be updated by the parent form
  if (initialUrl) {
    return (
        <div className="relative w-full aspect-video rounded-md overflow-hidden border p-2">
            <Image src={initialUrl} alt="Uploaded image" layout="fill" className="object-contain rounded-md" />
            <Button
                variant="destructive"
                size="icon"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 z-10"
            >
                <Trash2 className="h-4 w-4"/>
            </Button>
        </div>
    )
  }

  return (
    <div className="w-full p-4 border-2 border-dashed rounded-lg text-center">
      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
          <Progress value={progress} className="w-full mt-2" />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to upload
          </p>
          <Input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
           <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Browse Files
              </label>
            </Button>
        </div>
      )}
    </div>
  );
}
