
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Flower, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';
import Link from 'next/link';
import { deities, type Deity } from '@/lib/deities'; // Import deities data

// Component for the falling flower animation
const FallingFlower = ({ id, delay }: { id: number, delay: number }) => (
  <Flower
    key={id}
    className="absolute top-[-50px] w-8 h-8 text-yellow-500 animate-fall"
    style={{ 
        left: `${Math.random() * 90 + 5}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${Math.random() * 3 + 4}s`,
        filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))'
    }}
  />
);


export default function VirtualPoojaPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);

  const [selectedDeity, setSelectedDeity] = useState<Deity | null>(null);
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
        deity: selectedDeity?.slug || 'general',
        timestamp: serverTimestamp(),
      });

      switch (interaction) {
        case 'ring-bell':
          setBellRinging(true);
          new Audio('https://www.myinstants.com/media/sounds/indian-temple-bell-sound-effect-2.mp3').play().catch(e => console.error("Error playing audio:", e));
          setTimeout(() => setBellRinging(false), 800); // Animation duration
          toast({ title: 'You rang the divine bell.' });
          break;
        case 'offer-flower':
           const newFlowerId = Date.now();
           // Add a small burst of flowers at once
           const newFlowers = Array.from({ length: 5 }, (_, i) => newFlowerId + i);
           setFlowers(prev => [...prev, ...newFlowers]);
           newFlowers.forEach(id => {
                setTimeout(() => {
                    setFlowers(prev => prev.filter(flowerId => flowerId !== id));
                }, 7000); // Remove flower after animation
           })
          toast({ title: 'You offered flowers to the divine.' });
          break;
        case 'light-diya':
          setDiyaLit(!diyaLit);
          toast({ title: diyaLit ? 'You extinguished the lamp.' : 'You lit the lamp, spreading light.' });
          break;
      }
    } catch (error) {
      console.error("Failed to record interaction:", error);
      toast({ variant: "destructive", title: 'Something went wrong.', description: "Your interaction could not be saved." });
    }
  };
  
  if (!selectedDeity) {
      return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
             <div className="text-center mb-8">
                <h1 className="text-3xl md:text-5xl font-headline font-bold tracking-tight text-primary">
                    Select a Deity for Pooja
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Choose a deity to begin your virtual worship.
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {deities.map(deity => (
                    <Card key={deity.id} onClick={() => setSelectedDeity(deity)} className="cursor-pointer group overflow-hidden border-primary/20 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                        <div className="aspect-square relative">
                            <Image src={deity.images[0].url} alt={deity.name.en} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <CardHeader className="p-3">
                            <CardTitle className="text-center text-md md:text-lg group-hover:text-primary transition-colors">
                                {deity.name.en}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </main>
      )
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gray-900 p-4">
      {/* This container is for the falling flowers */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        {flowers.map((id, index) => (
          <FallingFlower key={id} id={id} delay={index * 0.1} />
        ))}
      </div>

      <Image
        src={selectedDeity.images[0].url}
        alt={selectedDeity.name.en}
        data-ai-hint={selectedDeity.images[0].hint}
        fill
        className="object-cover absolute inset-0 z-0 opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10" />

      <div className="relative z-20 text-center text-white mb-8">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-primary">
          Virtual Pooja
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-amber-50">
          Offering prayers to {selectedDeity.name.en}
        </p>
         {!user && (
          <Button asChild className="mt-4">
            <Link href="/login">Login to Participate</Link>
          </Button>
        )}
      </div>
      
       <div className="absolute z-40 top-4 left-4">
        <Button variant="ghost" onClick={() => setSelectedDeity(null)} className="text-white hover:bg-white/10 hover:text-white">
            Change Deity
        </Button>
      </div>

      <div className="relative z-20 grid grid-cols-3 gap-4 md:gap-8 w-full max-w-4xl">
        {/* Ring Bell */}
        <div className="flex flex-col items-center justify-center p-4">
           <button onClick={() => handleInteraction('ring-bell')} className="group">
             <div className={cn("relative transition-transform group-hover:scale-110", bellRinging ? 'animate-swing' : '')}>
                <Bell className="w-16 h-16 md:w-24 md:h-24 text-amber-300 drop-shadow-lg" />
            </div>
           </button>
           <p className="text-amber-200 mt-2 font-semibold">Ring Bell</p>
        </div>

        {/* Offer Flowers */}
        <div className="relative flex flex-col items-center justify-center p-4">
           <button onClick={() => handleInteraction('offer-flower')} className="group">
            <div className="relative group-hover:scale-110 transition-transform">
                <Flower className="w-16 h-16 md:w-24 md:h-24 text-pink-300 drop-shadow-lg" />
            </div>
           </button>
            <p className="text-pink-200 mt-2 font-semibold">Offer Flowers</p>
        </div>

        {/* Light Diya */}
        <div className="flex flex-col items-center justify-center p-4">
           <button onClick={() => handleInteraction('light-diya')} className="group">
             <div className="relative group-hover:scale-110 transition-transform w-24 h-24 flex items-center justify-center">
                <Flame className={cn("w-16 h-16 md:w-24 md:h-24 transition-all duration-1000 drop-shadow-lg", diyaLit ? 'text-transparent' : 'text-gray-400')} />
                 {diyaLit && (
                    <>
                        <div className="absolute bottom-4 w-12 h-4 bg-yellow-900/50 rounded-full" />
                        <div className="absolute bottom-5 w-6 h-6 animate-flicker" style={{ background: 'radial-gradient(circle, rgba(255,230,150,1) 0%, rgba(255,165,0,0.8) 40%, rgba(255,100,0,0.3) 80%, rgba(255,100,0,0) 100%)' }} />
                        <div className="absolute bottom-0 w-48 h-48 bg-orange-400 rounded-full blur-3xl animate-pulse-glow opacity-30" />
                    </>
                 )}
            </div>
           </button>
           <p className={cn("mt-2 font-semibold transition-colors", diyaLit ? "text-orange-200" : "text-gray-300")}>
              {diyaLit ? 'Extinguish' : 'Light Diya'}
           </p>
        </div>
      </div>

       <style jsx>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        .animate-swing {
          animation: swing 0.8s ease-in-out;
        }
        @keyframes fall {
          from {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          to {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
        }
        @keyframes flicker {
          0%, 100% { transform: scale(1, 1); opacity: 1; }
          50% { transform: scale(0.95, 1.05); opacity: 0.85; }
        }
        .animate-flicker {
            animation: flicker 1.5s ease-in-out infinite;
        }

        @keyframes pulse-glow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-pulse-glow {
            animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
