
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/lib/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2, Edit } from 'lucide-react';
import type { DocumentData } from 'firebase/firestore';

interface ManagePlaylistsDialogProps {
  allPlaylists: DocumentData[];
  featuredIds: string[];
  channelId: string;
}

export function ManagePlaylistsDialog({ allPlaylists, featuredIds, channelId }: ManagePlaylistsDialogProps) {
  const { toast } = useToast();
  const db = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>(featuredIds);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const channelRef = doc(db, 'channels', channelId);
      await updateDoc(channelRef, {
        featuredPlaylists: selectedPlaylists,
      });
      toast({ title: 'Success', description: 'Your featured playlists have been updated.' });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update playlists:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update your playlists.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckboxChange = (playlistId: string, checked: boolean) => {
    setSelectedPlaylists(prev => 
      checked ? [...prev, playlistId] : prev.filter(id => id !== playlistId)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Manage Playlists
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Featured Playlists</DialogTitle>
          <DialogDescription>
            Select the playlists you want to feature on your channel page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {allPlaylists.length > 0 ? (
            allPlaylists.map(playlist => (
              <div key={playlist.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary">
                <Checkbox
                  id={playlist.id}
                  checked={selectedPlaylists.includes(playlist.id)}
                  onCheckedChange={(checked) => handleCheckboxChange(playlist.id, !!checked)}
                />
                <Label htmlFor={playlist.id} className="font-normal cursor-pointer flex-grow">
                  {playlist.title}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center">You haven't created any public playlists yet.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
