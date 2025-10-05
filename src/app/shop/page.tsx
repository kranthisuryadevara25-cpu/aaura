
'use client';

import { Header } from '@/app/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Navigation } from '../navigation';

const products = [
    { id: '1', name: 'Handcrafted Ganesha Idol', price: 49.99, imageUrl: 'https://picsum.photos/seed/idol/400/400', imageHint: 'Ganesha idol', description: 'A beautiful, handcrafted Ganesha idol for your home altar.' },
    { id: '2', name: 'Premium Sandalwood Incense Sticks', price: 12.99, imageUrl: 'https://picsum.photos/seed/incense/400/400', imageHint: 'incense sticks', description: 'Create a serene atmosphere with these aromatic incense sticks.' },
    { id: '3', name: 'The Bhagavad Gita: A New Translation', price: 19.99, imageUrl: 'https://picsum.photos/seed/book/400/400', imageHint: 'spiritual book', description: 'A modern, accessible translation of the timeless Hindu scripture.' },
    { id: '4', name: 'Brass Pooja Thali Set', price: 79.99, imageUrl: 'https://picsum.photos/seed/thali/400/400', imageHint: 'pooja thali', description: 'A complete set for your daily pooja rituals, made from pure brass.' },
];


export default function ShopPage() {
  return (
    <SidebarProvider>
        <Sidebar>
            <Navigation />
        </Sidebar>
        <SidebarInset>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">Spiritual Marketplace</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
                        Find authentic items to support your spiritual practice.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    <Card key={product.id} className="flex flex-col overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors duration-300">
                    <CardContent className="p-0">
                        <div className="aspect-square relative">
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                data-ai-hint={product.imageHint}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    </CardContent>
                    <CardHeader>
                        <CardTitle className="text-foreground">{product.name}</CardTitle>
                        <CardDescription className="text-lg font-semibold text-primary">${product.price.toFixed(2)}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <Button className="w-full">
                            <ShoppingCart className="mr-2" />
                            Add to Cart
                        </Button>
                    </CardContent>
                    </Card>
                ))}
                </div>
            </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
