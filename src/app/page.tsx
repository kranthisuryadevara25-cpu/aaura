import { Header } from "@/app/components/header";
import { HoroscopeForm } from "@/app/components/horoscope-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
            Your Daily Aura
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Connect with the cosmos and unveil the guidance the stars have for you. A moment of reflection, powered by celestial wisdom.
          </p>
        </div>
        <HoroscopeForm />
      </main>
      <footer className="text-center p-6 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Aura. All rights reserved.</p>
      </footer>
    </div>
  );
}
