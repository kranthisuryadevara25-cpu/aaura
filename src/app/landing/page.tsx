
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { BookHeart, Palmtree, Sparkles, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
        icon: Sparkles,
        title: "Explore Deities",
        description: "Discover the rich pantheon of Hindu gods and goddesses. Explore their stories, mantras, and significance."
    },
    {
        icon: Palmtree,
        title: "Discover Temples",
        description: "Explore the sacred geography of India. Discover temples, their stories, and plan your spiritual journey."
    },
    {
        icon: BookHeart,
        title: "Read Epic Sagas",
        description: "Immerse yourself in the timeless epics and mythological stories that have shaped generations."
    },
    {
        icon: Users,
        title: "Join Communities",
        description: "Connect with fellow seekers in community groups based on your interests and spiritual path."
    }
]

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-primary/10 to-background">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-primary">
                                        Welcome to Aaura
                                    </h1>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        Your daily dose of spiritual wellness. Explore ancient wisdom, connect with communities, and deepen your practice.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Button asChild size="lg">
                                        <Link href="/login">Get Started</Link>
                                    </Button>
                                </div>
                            </div>
                            <Image
                                src="https://picsum.photos/seed/landing-hero/1200/800"
                                alt="Hero"
                                width={1200}
                                height={800}
                                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                                data-ai-hint="spiritual abstract"
                            />
                        </div>
                    </div>
                </section>
                <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-primary">Discover Your Path</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Aaura is a comprehensive platform for anyone on a spiritual journey. Here's a glimpse of what you can explore.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                            {features.map((feature, index) => (
                                <Card key={index} className="bg-background">
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <feature.icon className="w-8 h-8 text-primary" />
                                        <CardTitle>{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription>{feature.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
                 <section className="w-full py-12 md:py-24 lg:py-32">
                    <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                                Ready to Begin Your Journey?
                            </h2>
                            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                Create an account to personalize your experience, track your progress, and join the community.
                            </p>
                        </div>
                        <div className="mx-auto w-full max-w-sm space-x-2">
                             <Button asChild size="lg">
                                <Link href="/login">
                                    Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
