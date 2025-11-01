
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
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (onFileSelect) {
            onFileSelect(selectedFile);
        }
        setFile(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        setFileUrl(objectUrl);
    }
  };

  // The upload function can be called externally if needed, e.g., on form submission.
  // For this component, let's keep it self-contained for now.

  const handleRemoveImage = () => {
    setFileUrl(null);
    setFile(null);
    if(onFileSelect) onFileSelect(null);
    if(onUploadComplete) onUploadComplete('');
  }

  // Display the selected image or the initial URL
  if (fileUrl) {
    return (
        <div className="relative w-full aspect-video rounded-md overflow-hidden border p-2">
            <Image src={fileUrl} alt="Image preview" layout="fill" className="object-contain rounded-md" />
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
      )}
    </div>
  );
}
