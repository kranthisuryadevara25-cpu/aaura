
'use client';

import { useParams, notFound } from 'next/navigation';
import { useFirestore, useAuth } from '@/lib/firebase/provider';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { doc, collection, query, orderBy, serverTimestamp, addDoc, updateDoc, increment, deleteDoc, setDoc, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageCircle, ThumbsUp, Send, Users, CheckCircle, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Comments } from '@/components/comments';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTransition, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getGroupById } from '@/lib/groups';
import { getPostsByGroupId, type Post } from '@/lib/posts';
import { Posts } from '@/components/Posts';


export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.postId as string; // Route uses [postId] but it's the groupId
  
  const group = getGroupById(groupId);
  
  if (!group) {
    notFound();
  }

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-primary">{group.name}</h1>
            <p className="mt-2 text-muted-foreground">{group.description}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" /> {group.memberCount || 0} members
            </div>
        </div>
        
        <Posts contextId={groupId} contextType="group" />
      </div>
    </main>
  );
}
