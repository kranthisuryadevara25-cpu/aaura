
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Flower, Flame, Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useFirestore } from '@/lib/firebase/provider';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { deities, type Deity } from '@/lib/deities'; 

const FallingFlower = ({ id, delay }: { id: number, delay: number }) => (
  <Flower
    key={id}
    className="absolute top-[-50px] w-8 h-8 text-yellow-400 animate-fall"
    style={{ 
        left: `${Math.random() * 90 + 5}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${Math.random() * 3 + 4}s`,
        filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))'
    }}
  />
);

export default function VirtualPoojaPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [user] = useAuthState(auth);

  const [selectedDeity, setSelectedDeity] = useState<Deity | null>(null);
  const [activeInteraction, setActiveInteraction] = useState<string | null>(null);
  const [flowers, setFlowers] = useState<number[]>([]);
  const [diyaLit, setDiyaLit] = useState(false);
  const [showAarti, setShowAarti] = useState(false);

  const handleInteraction = async (interaction: 'ring-bell' | 'offer-flower' | 'light-diya' | 'offer-aarti') => {
    if (!user && interaction !== 'ring-bell') {
      toast({
        variant: 'destructive',
        title: 'Please log in',
        description: 'You must be logged in to perform most virtual pooja actions.',
      });
      return;
    }
    
    setActiveInteraction(interaction);
    setTimeout(() => setActiveInteraction(null), 500);

    switch (interaction) {
      case 'ring-bell':
        new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_200821584b.mp3').play().catch(e => console.error("Error playing bell audio:", e));
        break;
      case 'offer-flower':
         const newFlowerId = Date.now();
         const newFlowers = Array.from({ length: 5 }, (_, i) => newFlowerId + i);
         setFlowers(prev => [...prev, ...newFlowers]);
         setTimeout(() => {
              setFlowers(prev => prev.filter(f => !newFlowers.includes(f)));
          }, 7000); 
         break;
      case 'light-diya':
        setDiyaLit(!diyaLit);
        break;
      case 'offer-aarti':
          if (showAarti) return;
          setShowAarti(true);
          new Audio('https://cdn.pixabay.com/audio/2022/11/17/audio_85d13f5139.mp3').play().catch(e => console.error("Error playing aarti audio:", e));
          setTimeout(() => setShowAarti(false), 5000);
          break;
    }
    
    if (interaction !== 'light-diya') { 
        toast({ title: `You performed: ${interaction.replace('-', ' ')}` });
    }

    if (user) {
        try {
          const offeringsCollection = collection(db, `users/${user.uid}/virtualOfferings`);
          await addDoc(offeringsCollection, {
            userId: user.uid,
            interaction: interaction,
            deity: selectedDeity?.slug || 'general',
            timestamp: serverTimestamp(),
          });
        } catch (error) {
          console.error("Failed to record interaction:", error);
          toast({ variant: "destructive", title: 'Something went wrong.', description: "Your interaction could not be saved." });
        }
    }
  };
  
  if (!selectedDeity) {
      return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-background dark:bg-gray-900 p-4">
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
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gray-900 p-4 [perspective:800px]">
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        {flowers.map((id, index) => (
          <FallingFlower key={id} id={id} delay={index * 0.1} />
        ))}
      </div>
      
       {showAarti && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="animate-aarti-path">
                 <Sparkle className="w-16 h-16 text-orange-400" style={{ filter: 'drop-shadow(0 0 10px #ffc107) drop-shadow(0 0 20px #ff9800)' }} />
            </div>
        </div>
      )}

      <Image
        src={selectedDeity.images[0].url}
        alt={selectedDeity.name.en}
        data-ai-hint={selectedDeity.images[0].hint}
        fill
        className="object-cover absolute inset-0 z-0 opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10" />

      <div className="relative z-20 text-center text-white mb-auto pt-20">
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

      <div className="relative z-20 grid grid-cols-4 gap-4 md:gap-8 w-full max-w-lg mb-8 mt-auto">
        <button onClick={() => handleInteraction('ring-bell')} className={cn("flex flex-col items-center p-2 rounded-lg transition-all duration-200 pooja-button", activeInteraction === 'ring-bell' && 'animate-wiggle')}>
            <Bell className="w-12 h-12 md:w-16 md:h-16 text-amber-300 drop-shadow-lg" />
            <p className="text-amber-200 mt-2 font-semibold text-xs md:text-sm">Ring Bell</p>
        </button>

        <button onClick={() => handleInteraction('offer-flower')} className={cn("flex flex-col items-center p-2 rounded-lg transition-all duration-200 pooja-button", activeInteraction === 'offer-flower' && 'scale-110')}>
            <Flower className="w-12 h-12 md:w-16 md:h-16 text-pink-300 drop-shadow-lg" />
            <p className="text-pink-200 mt-2 font-semibold text-xs md:text-sm">Offer Flowers</p>
        </button>

        <button onClick={() => handleInteraction('light-diya')} className={cn("flex flex-col items-center p-2 rounded-lg transition-all duration-200 pooja-button", activeInteraction === 'light-diya' && 'scale-110')}>
             <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                 {diyaLit ? (
                    <>
                        <div className="absolute bottom-2 md:bottom-4 w-8 h-3 bg-yellow-900/50 rounded-full" />
                        <div className="absolute bottom-3 md:bottom-5 w-4 h-4 animate-flicker" style={{ background: 'radial-gradient(circle, rgba(255,230,150,1) 0%, rgba(255,165,0,0.8) 40%, rgba(255,100,0,0.3) 80%, rgba(255,100,0,0) 100%)' }} />
                        <div className="absolute w-32 h-32 bg-orange-400 rounded-full blur-3xl animate-pulse-glow opacity-30" />
                    </>
                 ) : (
                    <Flame className="w-full h-full text-gray-400 transition-colors duration-1000 drop-shadow-lg" />
                 )}
            </div>
            <p className={cn("mt-2 font-semibold transition-colors text-xs md:text-sm", diyaLit ? "text-orange-200" : "text-gray-300")}>
              {diyaLit ? 'Diya is Lit' : 'Light Diya'}
            </p>
        </button>

        <button onClick={() => handleInteraction('offer-aarti')} className={cn("flex flex-col items-center p-2 rounded-lg transition-all duration-200 pooja-button", activeInteraction === 'offer-aarti' && 'scale-110')}>
            <Sparkle className="w-12 h-12 md:w-16 md:h-16 text-orange-400 drop-shadow-lg" />
            <p className="text-orange-300 mt-2 font-semibold text-xs md:text-sm">Offer Aarti</p>
        </button>
      </div>

       <style jsx>{`
        .pooja-button {
            transform-style: preserve-3d;
            transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
            animation: float 6s ease-in-out infinite;
        }
        .pooja-button:hover {
            transform: translateY(-5px) translateZ(10px);
        }
        .pooja-button:active {
            transform: translateY(1px) translateZ(0px) scale(0.95);
            box-shadow: 0 1px 2px rgba(0,0,0,0.5) inset;
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
        }
        .pooja-button:nth-child(2) { animation-delay: 1.5s; }
        .pooja-button:nth-child(3) { animation-delay: 3s; }
        .pooja-button:nth-child(4) { animation-delay: 4.5s; }
        
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
          0%, 100% { transform: scale(1, 1) rotate(2deg); opacity: 1; }
          50% { transform: scale(0.95, 1.05) rotate(-2deg); opacity: 0.85; }
        }
        .animate-flicker {
            animation: flicker 0.15s ease-in-out infinite;
        }
        @keyframes pulse-glow {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
        }
        .animate-pulse-glow {
            animation: pulse-glow 3s ease-in-out infinite;
        }
        @keyframes aarti-path {
            0% { transform: translate(-50px, 50px) scale(0.8) rotate(0deg); opacity: 0.7; }
            25% { transform: translate(50px, -50px) scale(1) rotate(90deg); opacity: 1; }
            50% { transform: translate(150px, 50px) scale(0.8) rotate(180deg); opacity: 0.7; }
            75% { transform: translate(50px, 150px) scale(0.6) rotate(270deg); opacity: 0.5; }
            100% { transform: translate(-50px, 50px) scale(0.8) rotate(360deg); opacity: 0.7; }
        }
        .animate-aarti-path {
            animation: aarti-path 5s ease-in-out forwards;
        }
      `}</style>
    </main>
  );
}
