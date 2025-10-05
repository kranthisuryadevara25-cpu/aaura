
"use client";
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export interface SearchBarProps {
    onSearch?: (query: string) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        if (onSearch) {
            onSearch(newQuery);
        }
    };

    return (
        <div className="relative w-full max-w-lg hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder={t.topnav.searchPlaceholder} 
                className="pl-10"
                value={query}
                onChange={handleInputChange}
            />
        </div>
    );
};
