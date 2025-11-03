
'use client';

import { useState, useEffect } from 'react';
import { useStorage } from '@/lib/firebase/provider';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, UploadCloud, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onUploadComplete?: (url: string) => void;
  onFileSelect?: (file: File | null) => void;
  initialUrl?: string | null;
  folderName?: string;
}

export function ImageUpload({ onFileSelect, initialUrl, }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);

  useEffect(() => {
    // Sync with initialUrl prop if it changes
    setPreviewUrl(initialUrl || null);
  }, [initialUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (onFileSelect) {
            onFileSelect(selectedFile);
        }
        // Create a temporary URL for the selected file to show a preview
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if(onFileSelect) {
        onFileSelect(null);
    }
  }

  // Display the selected image preview or the initial URL
  if (previewUrl) {
    return (
        <div className="relative w-full aspect-video rounded-md overflow-hidden border p-2 bg-secondary/30">
             {/* 
                Use a standard `<img>` tag for blob URLs (local previews) 
                and next/image for remote URLs to avoid configuration errors.
             */}
            {previewUrl.startsWith('blob:') ? (
                <img src={previewUrl} alt="Image preview" className="object-contain w-full h-full rounded-md" />
            ) : (
                <Image src={previewUrl} alt="Image preview" layout="fill" className="object-contain rounded-md" />
            )}
            <Button
                type="button"
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
        <div className="flex flex-col items-center gap-2">
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to browse
          </p>
          <Input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
           <Button asChild variant="outline" type="button">
              <label htmlFor="file-upload" className="cursor-pointer">
                Browse Files
              </label>
            </Button>
        </div>
    </div>
  );
}
