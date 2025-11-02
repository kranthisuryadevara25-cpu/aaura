
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { BookHeart, Palmtree, Sparkles, Users, ArrowDown, ArrowRight, Mouse } from "lucide-react";
import { Icons } from "@/components/ui/icons";

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
    return (
        <div className="h-screen snap-y snap-mandatory overflow-y-scroll overflow-x-hidden">
            {/* Hero Section */}
            <section className="h-screen w-full snap-start relative flex flex-col items-center justify-center text-center text-white bg-black p-4">
                <Image
                    src="https://picsum.photos/seed/spirit/600/400"
                    alt="Spiritual Background"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-40"
                    data-ai-hint="spiritual abstract"
                    priority
                />
                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                    <Icons.logo className="w-24 h-24 text-primary drop-shadow-[0_5px_15px_rgba(var(--primary),0.5)]" />
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter font-headline text-primary mt-4 drop-shadow-lg">
                        Aaura
                    </h1>
                    <p className="max-w-[600px] text-white/90 md:text-xl mt-4 drop-shadow-md">
                        Your daily dose of spiritual wellness. Explore ancient wisdom, connect with communities, and deepen your practice.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Button asChild size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground">
                            <Link href="/login">Get Started</Link>
                        </Button>
                         <Button asChild size="lg" variant="outline" className="bg-transparent border-primary text-primary hover:bg-primary/10">
                            <Link href="/login">Log In</Link>
                        </Button>
                    </div>
                     <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce">
                        <Mouse className="w-6 h-6" />
                        <span className="text-sm">Scroll to discover</span>
                        <ArrowDown className="w-5 h-5" />
                    </div>
                </div>
            </section>

            {/* Features Sections */}
            {features.map((feature, index) => (
                 <section key={index} className="h-screen w-full snap-start relative flex items-center justify-center text-center text-white bg-black p-4">
                     <Image
                        src={feature.image.url}
                        alt={feature.title}
                        fill
                        sizes="100vw"
                        className="object-cover opacity-30"
                        data-ai-hint={feature.image.hint}
                    />
                    <div className="relative z-10 p-8 max-w-2xl rounded-xl">
                        <feature.icon className="w-16 h-16 mx-auto text-primary drop-shadow-lg" />
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 font-headline text-primary">{feature.title}</h2>
                        <p className="mt-4 text-lg text-white/90 drop-shadow-md">{feature.description}</p>
                    </div>
                 </section>
            ))}

             {/* Final CTA Section */}
            <section className="h-screen w-full snap-start relative flex flex-col items-center justify-center text-center text-white bg-black p-4">
                 <Image
                    src="https://picsum.photos/seed/final-cta-bg/1080/1920"
                    alt="Final Call to Action Background"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-40"
                    data-ai-hint="celestial stars"
                />
                 <div className="relative z-10 flex flex-col items-center">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary font-headline">
                        Ready to Begin Your Journey?
                    </h2>
                    <p className="mt-4 max-w-[600px] text-white/90 md:text-xl">
                        Create an account to personalize your experience, track your progress, and join the community.
                    </p>
                    <Button asChild size="lg" className="mt-8">
                        <Link href="/login">
                            Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
