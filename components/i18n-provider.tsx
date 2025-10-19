"use client";

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { loadManifestoData, loadTranslations } from '@/lib/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure translations are loaded before rendering children
    const initializeTranslations = async () => {
      // Load common translations first
      await loadTranslations();
      
      // Then load manifesto data for the current language
      const currentLang = i18n.language || 'en';
      await loadManifestoData(currentLang);
      
      setIsReady(true);
    };

    initializeTranslations();

    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      loadManifestoData(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // Show loading state or render immediately
  // We render immediately to prevent flash, but translations will be ready soon
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
