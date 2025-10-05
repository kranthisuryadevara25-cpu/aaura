
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import te from '@/locales/te.json';
import mr from '@/locales/mr.json';
import ta from '@/locales/ta.json';
import kn from '@/locales/kn.json';
import bn from '@/locales/bn.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    resources: {
      en: {
        translation: en,
      },
      hi: {
        translation: hi,
      },
      te: {
        translation: te,
      },
      mr: {
        translation: mr,
      },
      ta: {
        translation: ta,
      },
      kn: {
        translation: kn,
      },
      bn: {
        translation: bn,
      },
    },
  });

export default i18n;
