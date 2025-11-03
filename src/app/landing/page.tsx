
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
                    viewBox="0 0 128 128"
                    className="w-24 h-24 text-primary drop-shadow-[0_5px_15px_rgba(var(--primary),0.5)]"
                    fill="currentColor"
                  >
                    <path d="M64 5.33C31.64 5.33 5.33 31.64 5.33 64s26.31 58.67 58.67 58.67 58.67-26.31 58.67-58.67S96.36 5.33 64 5.33zm0 106.67c-26.51 0-48-21.49-48-48s21.49-48 48-48 48 21.49 48 48-21.49 48-48 48z"/>
                    <path d="M62.99 26.66c-13.23 0-23.99 10.77-23.99 24s10.76 24 23.99 24c5.8 0 11.08-2.07 15.11-5.54-1.28 7.37-7.46 13.06-15.11 13.06-8.84 0-16-7.16-16-16 0-1.89.34-3.7.94-5.38-4.71-3.7-7.94-9.33-7.94-15.62 0-10.47 8.52-19 19-19s19 8.53 19 19c0 3.99-1.23 7.68-3.33 10.66 4.93-3.14 8.33-8.51 8.33-14.66.01-9.94-8.05-18-18-18z"/>
                    <path d="M89.33 66.66c0 6.6-5.4 12-12 12s-12-5.4-12-12 5.4-12 12-12c.93 0 1.83.11 2.69.31.83-10.35-7.23-19.01-17.69-19.01-10.47 0-19 8.53-19 19s8.53 19 19 19c2.08 0 4.05-.34 5.88-.97 2.45 3.59 6.51 6.07 11.12 6.07 7.36 0 13.33-5.97 13.33-13.33s-5.97-13.34-13.33-13.34c-1.48 0-2.89.24-4.22.69.48-4.27 4.14-7.69 8.55-7.69 4.97 0 9 4.03 9 9s-4.03 9-9 9c-.28 0-.55-.01-.82-.04-.51 5.37 3.44 10.04 8.5 10.04z"/>
                </svg>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter font-headline text-primary mt-2 drop-shadow-lg">
                    Aaura
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

    