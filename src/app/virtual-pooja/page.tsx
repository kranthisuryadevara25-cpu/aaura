
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Flower, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';

// Component for the floating flower animation
const FloatingFlower = ({ id }: { id: number }) => (
  <Flower
    key={id}
    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 text-pink-400 animate-float-up"
    style={{ animationDelay: `${id * 0.1}s` }}
  />
);

export default function VirtualPoojaPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);

  const [bellRinging, setBellRinging] = useState(false);
  const [flowers, setFlowers] = useState<number[]>([]);
  const [diyaLit, setDiyaLit] = useState(false);

  const handleInteraction = async (interaction: 'ring-bell' | 'offer-flower' | 'light-diya') => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You must be logged in to perform virtual pooja.',
      });
      return;
    }

    try {
      const offeringsCollection = collection(db, `users/${user.uid}/virtualOfferings`);
      await addDoc(offeringsCollection, {
        userId: user.uid,
        interaction: interaction,
        timestamp: serverTimestamp(),
      });

      switch (interaction) {
        case 'ring-bell':
          setBellRinging(true);
          // Using a reliable, publicly available sound file
          new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_28b1b172f3.mp3').play().catch(e => console.error("Error playing audio:", e));
          setTimeout(() => setBellRinging(false), 500);
          toast({ title: 'You rang the divine bell.' });
          break;
        case 'offer-flower':
          setFlowers(prev => [...prev, Date.now()]);
          toast({ title: 'You offered flowers to the divine.' });
          break;
        case 'light-diya':
          setDiyaLit(!diyaLit);
          toast({ title: diyaLit ? 'You extinguished the lamp.' : 'You lit the lamp, spreading light.' });
          break;
      }
    } catch (error) {
      console.error("Failed to record interaction:", error);
      toast({ variant: 'destructive', title: 'Something went wrong.', description: "Your interaction could not be saved." });
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gray-900 p-4">
      <Image
        src="https://picsum.photos/seed/temple-interior/1920/1080"
        alt="Temple Interior"
        data-ai-hint="temple interior"
        fill
        className="object-cover absolute inset-0 z-0 opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50 z-10" />

      <div className="relative z-20 text-center text-white mb-8">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">
          Virtual Pooja
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-amber-50">
          Take a moment to connect with the divine. Perform a digital offering.
        </p>
         {!user && (
          <Button asChild className="mt-4">
            <Link href="/login">Login to Participate</Link>
          </Button>
        )}
      </div>
      
      <div className="relative z-20 grid grid-cols-3 gap-4 md:gap-8 w-full max-w-4xl">
        {/* Ring Bell */}
        <Card className="bg-black/50 border-amber-200/20 text-white flex flex-col items-center justify-center p-4 aspect-square">
          <CardContent className="flex flex-col items-center justify-center p-0">
             <div className={cn("relative transition-transform", bellRinging ? 'animate-swing' : '')}>
                <Bell className="w-16 h-16 md:w-24 md:h-24 text-amber-300" />
            </div>
            <Button variant="outline" className="mt-4 bg-transparent border-amber-300 text-amber-300 hover:bg-amber-300/10 hover:text-amber-200" onClick={() => handleInteraction('ring-bell')}>
              Ring Bell
            </Button>
          </CardContent>
        </Card>

        {/* Offer Flowers */}
        <Card className="relative bg-black/50 border-amber-200/20 text-white flex flex-col items-center justify-center p-4 aspect-square overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center p-0">
            <div className="relative">
                <Flower className="w-16 h-16 md:w-24 md:h-24 text-pink-300 transition-all duration-500" />
                 {flowers.map((id) => (
                  <FloatingFlower key={id} id={id} />
                ))}
            </div>
            <Button variant="outline" className="mt-4 bg-transparent border-pink-300 text-pink-300 hover:bg-pink-300/10 hover:text-pink-200" onClick={() => handleInteraction('offer-flower')}>
              Offer Flowers
            </Button>
          </CardContent>
        </Card>

        {/* Light Diya */}
        <Card className="bg-black/50 border-amber-200/20 text-white flex flex-col items-center justify-center p-4 aspect-square">
          <CardContent className="flex flex-col items-center justify-center p-0">
             <div className="relative">
                <Flame className={cn("w-16 h-16 md:w-24 md:h-24 transition-all duration-1000", diyaLit ? 'text-orange-400' : 'text-gray-400')} />
                 {diyaLit && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-400 rounded-full blur-2xl opacity-50" />}
            </div>
            <Button variant="outline" className="mt-4 bg-transparent border-orange-300 text-orange-300 hover:bg-orange-300/10 hover:text-orange-200" onClick={() => handleInteraction('light-diya')}>
              {diyaLit ? 'Extinguish' : 'Light Diya'}
            </Button>
          </CardContent>
        </Card>
      </div>

       <style jsx>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-swing {
          animation: swing 0.5s ease-in-out;
        }
        @keyframes float-up {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(-150px) scale(0.5);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
      `}</style>
    </main>
  );
}
