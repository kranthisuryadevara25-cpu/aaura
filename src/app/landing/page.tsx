
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { BookHeart, Palmtree, Sparkles, Users, ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";


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
    const plugin = useRef(
      Autoplay({ delay: 5000, stopOnInteraction: true })
    )

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
                 <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 256 256"
                    className="w-32 h-32 text-primary drop-shadow-[0_5px_15px_rgba(var(--primary),0.5)]"
                    fill="currentColor"
                  >
                    <path d="M221.5,103.2a84.1,84.1,0,0,0-167,0A83.8,83.8,0,0,0,32,128a83.8,83.8,0,0,0,22.5,56.8,84.1,84.1,0,0,0,167,0A83.8,83.8,0,0,0,244,128,83.8,83.8,0,0,0,221.5,103.2Zm-93.5,76.8A68,68,0,1,1,196,128,68.1,68.1,0,0,1,128,196Z"></path>
                    <path d="M128,52A76,76,0,1,0,204,128,76.1,76.1,0,0,0,128,52Zm0,140a64,64,0,1,1,64-64A64.1,64.1,0,0,1,128,192Z"></path>
                    <path d="M136,128.5a12,12,0,1,1-16.9-10.3,12,12,0,0,1,16.9,10.3Z"></path>
                    <path d="M168,100a12,12,0,1,0,12,12A12,12,0,0,0,168,100Z"></path>
                    <path d="M128,152a40,40,0,0,0,33.1-19.1,4,4,0,0,0-6.2-5A32,32,0,0,1,80,128a4,4,0,0,0-8,0,40,40,0,0,0,40,40A39.5,39.5,0,0,0,128,152Z"></path>
                    <path d="M172,128a4,4,0,0,0,4,4,44,44,0,0,1-88,0,4,4,0,0,0-8,0,52,52,0,0,0,104,0A4,4,0,0,0,172,128Z"></path>
                  </svg>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter font-headline text-primary mt-2 drop-shadow-lg">
                    aaura
                </h1>
                <p className="max-w-[600px] text-white/90 md:text-lg mt-2 drop-shadow-md">
                    Your daily dose of spiritual wellness. Explore ancient wisdom, connect with communities, and deepen your practice.
                </p>
            </div>
            
             {isClient && (
                <Carousel
                    opts={{ align: "start", loop: true }}
                    plugins={[plugin.current]}
                    className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl z-10 mt-8"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
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
                </Carousel>
            )}
             
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-8">
                <Button asChild size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground">
                    <Link href="/login">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
        </div>
    );
}
