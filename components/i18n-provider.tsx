"use client";

import React, { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { loadManifestoData, loadTranslations } from '@/lib/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Load translations asynchronously without blocking render
    loadTranslations().catch(err => {
      console.error('Failed to load translations:', err);
    });

    // Listen for language changes
    const handleLanguageChange = (lng: string) => {
      loadManifestoData(lng).catch(err => {
        console.error('Failed to load manifesto data:', err);
      });
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // Render immediately without blocking - translations will load in background
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
