"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const SearchBar = () => {
    const { t } = useLanguage();
    return (
        <div className="relative w-full max-w-lg hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t.topnav.searchPlaceholder} className="pl-10" />
        </div>
    );
};
