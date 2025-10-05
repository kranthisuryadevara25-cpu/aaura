
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Supported languages
export type LanguageCode = "en" | "hi" | "te" | "mr" | "ta" | "kn" | "bn";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
    document.documentElement.lang = lang;
  };

  // Load saved language from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("app-language") as LanguageCode;
    if (saved) setLanguage(saved);
  }, []);

  const value = { language, setLanguage };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
