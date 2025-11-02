
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Icons } from '@/components/ui/icons';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user, loading] = useAuthState(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const checkAndRedirectUser = async (user: User) => {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists() && docSnap.data().profileComplete) {
      router.push('/feed');
    } else {
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            fullName: user.displayName,
            photoURL: user.photoURL,
            profileComplete: false,
            creationTimestamp: serverTimestamp(),
            followerCount: 0,
            followingCount: 0,
        }, { merge: true });
      }
      router.push('/profile/setup');
    }
  };

  useEffect(() => {
    if (!loading && user) {
      checkAndRedirectUser(user);
    }
  }, [user, loading, router, db]);
  
  const handleAuthAction = async (action: 'signIn' | 'signUp', data: FormValues) => {
    setIsSubmitting(true);
    try {
      let userCredential;
      if (action === 'signIn') {
        userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: 'Success!', description: 'You are now signed in.' });
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        toast({ title: 'Account Created!', description: 'Let\'s set up your profile.' });
      }
      // The useEffect will handle redirection.
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
      setIsSubmitting(true);
      const provider = new GoogleAuthProvider();
      try {
          await signInWithPopup(auth, provider);
          // On successful sign-in, the useEffect will trigger the redirect logic.
          toast({ title: 'Success!', description: 'You are now signed in with Google.' });
      } catch (error: any) {
          handleAuthError(error);
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleAuthError = (error: any) => {
      let description = 'An unexpected error occurred.';
      switch (error.code) {
        case 'auth/user-not-found':
          description = 'No account found with this email. Please sign up.';
          break;
        case 'auth/wrong-password':
          description = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          description = 'This email is already in use. Please sign in.';
          break;
        case 'auth/weak-password':
          description = 'The password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-credential':
           description = 'Invalid credentials. Please check your email and password.';
           break;
        case 'auth/popup-closed-by-user':
           description = 'Sign-in was cancelled.';
           break;
        default:
          description = error.message;
          break;
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: description,
      });
  }

  if (loading || user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex justify-center items-center">
        <Card className="w-full max-w-md bg-card">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in or create an account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icons.google className="mr-2 h-4 w-4" />}
                    Sign in with Google
                </Button>
                
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={form.handleSubmit((data) => handleAuthAction('signIn', data))}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={isSubmitting}
                    onClick={form.handleSubmit((data) => handleAuthAction('signUp', data))}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
  );
}
