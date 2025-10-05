import { Icons } from "@/app/components/icons";
import Link from "next/link";

export function Header() {
  return (
    <header className="py-8 px-4 md:px-6">
      <div className="container mx-auto flex items-center justify-center">
        <Link href="/" className="flex items-center gap-3 group">
          <Icons.logo className="h-8 w-8 text-accent transition-transform group-hover:rotate-12" />
          <span className="text-3xl font-headline font-bold text-foreground">
            Aura
          </span>
        </Link>
      </div>
    </header>
  );
}
