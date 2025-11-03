
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { BookHeart, Palmtree, Sparkles, Users, ArrowRight } from "lucide-react";
import { Icons } from "@/components/ui/icons";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";


const features = [
    {
        icon: Sparkles,
        title: "Explore Deities",
        description: "Discover the rich pantheon of Hindu gods and goddesses. Explore their stories, mantras, and significance in your spiritual journey.",
        image: {
            url: "https://picsum.photos/seed/feature-deities/1080/1920",
            hint: "vibrant hindu deity statue"
        }
    },
    {
        icon: Palmtree,
        title: "Discover Temples",
        description: "Explore the sacred geography of India. Discover ancient temples, their stories, and plan your next spiritual journey with our detailed guides.",
        image: {
            url: "https://picsum.photos/seed/feature-temples/1080/1920",
            hint: "ancient temple architecture"
        }
    },
    {
        icon: BookHeart,
        title: "Read Epic Sagas",
        description: "Immerse yourself in the timeless epics and mythological stories that have shaped generations of spiritual seekers and thinkers.",
        image: {
            url: "https://picsum.photos/seed/feature-sagas/1080/1920",
            hint: "ancient manuscript scroll"
        }
    },
    {
        icon: Users,
        title: "Join Communities",
        description: "Connect with fellow seekers in community groups. Share experiences, ask questions, and grow together on your spiritual path.",
        image: {
            url: "https://picsum.photos/seed/feature-community/1080/1920",
            hint: "diverse group meditation"
        }
    }
];

export default function LandingPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    if (!isClient) {
        return null;
    }

    return (
        <div className="h-screen w-full relative flex flex-col items-center justify-center text-center text-white bg-black p-4">
             <Image
                src="https://picsum.photos/seed/spirit/1920/1080"
                alt="Spiritual Background"
                fill
                sizes="100vw"
                className="object-cover opacity-30"
                data-ai-hint="spiritual abstract"
                priority
            />

            <div className="relative z-10 flex flex-col items-center justify-center">
                <Icons.logo className="w-20 h-20 text-primary drop-shadow-[0_5px_15px_rgba(var(--primary),0.5)]" />
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter font-headline text-primary mt-2 drop-shadow-lg">
                    Aaura
                </h1>
                <p className="max-w-[600px] text-white/90 md:text-lg mt-2 drop-shadow-md">
                    Your daily dose of spiritual wellness. Explore ancient wisdom, connect with communities, and deepen your practice.
                </p>
            </div>
            
            <Carousel
                opts={{ align: "start", loop: true }}
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl z-10 mt-8"
            >
                <CarouselContent>
                    {features.map((feature, index) => (
                        <CarouselItem key={index}>
                            <Card className="bg-black/40 border-primary/20 text-white backdrop-blur-sm">
                                <CardContent className="flex flex-col items-center text-center p-6 gap-4">
                                     <feature.icon className="w-12 h-12 mx-auto text-primary drop-shadow-lg" />
                                    <h2 className="text-2xl font-bold font-headline text-primary">{feature.title}</h2>
                                    <p className="text-sm text-white/80">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:inline-flex" />
                <CarouselNext className="hidden sm:inline-flex" />
            </Carousel>
             
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-8">
                <Button asChild size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground">
                    <Link href="/login">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
        </div>
    );
}
