
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();

  const [language, setLanguageState] = useState(i18n.language.split('-')[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Path to the user's language preference document
  const preferenceRef = useMemo(() => {
    if (user && firestore) {
      return doc(firestore, `users/${user.uid}/preferences/default`);
    }
    return null;
  }, [user, firestore]);
  
  const { data: preferenceData, isLoading: isPreferenceLoading } = useDoc(preferenceRef);

  // Effect to initialize language from Firestore or browser settings
  useEffect(() => {
    if (!isPreferenceLoading) {
      const savedLanguage = preferenceData?.language;
      const browserLanguage = i18n.language.split('-')[0];
      const initialLang = savedLanguage || browserLanguage;
      
      if (initialLang !== i18n.language) {
        i18n.changeLanguage(initialLang).then(() => {
            setLanguageState(initialLang);
        });
      }
      setIsLoading(false);
    }
  }, [isPreferenceLoading, preferenceData, i18n]);

  const setLanguage = useCallback((lang: string) => {
    if (lang === i18n.language) return;

    setIsLoading(true);
    i18n.changeLanguage(lang).then(() => {
      setLanguageState(lang);
      setIsLoading(false);
      // Persist to Firestore if user is logged in
      if (user && firestore && preferenceRef) {
        setDocumentNonBlocking(preferenceRef, { language: lang }, { merge: true });
      }
    });
  }, [i18n, user, firestore, preferenceRef]);
  
  const value = useMemo(() => ({ language, setLanguage, isLoading }), [language, setLanguage, isLoading]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
