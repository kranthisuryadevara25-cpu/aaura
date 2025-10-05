
"use client";

import { useLanguage, LanguageCode } from "@/hooks/use-language";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";
import { Button } from "./button";

const languages: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "bn", label: "বাংলা" },
];

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as LanguageCode)}>
      <SelectTrigger asChild>
         <Button variant="ghost" size="icon">
            <Languages className="h-5 w-5" />
            <span className="sr-only">Select Language</span>
          </Button>
      </SelectTrigger>
      <SelectContent align="end">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
