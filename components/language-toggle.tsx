"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'np', name: 'नेपाली', flag: '🇳🇵' },
];

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'en' ? 'np' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('i18nextLng', newLang);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const otherLanguage = languages.find(lang => lang.code !== i18n.language) || languages[1];

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="flex items-center gap-2 hover:bg-accent/50 transition-colors"
    >
      <span className="text-sm">{currentLanguage.flag}</span>
      <span className="text-sm font-medium">{currentLanguage.name}</span>
      <span className="text-xs text-muted-foreground">→</span>
      <span className="text-sm opacity-60">{otherLanguage.flag}</span>
    </Button>
  );
}
