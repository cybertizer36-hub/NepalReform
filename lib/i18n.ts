import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: 'en', // default language
    debug: false,
    supportedLngs: ['en', 'np'],
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    resources: {
      en: {
        manifesto: {}, // Will be loaded dynamically
        common: {}     // Will be loaded dynamically
      },
      np: {
        manifesto: {}, // Will be loaded dynamically
        common: {}     // Will be loaded dynamically
      }
    }
  });

// Function to load summary manifesto data (for ManifestoCard)
export async function loadManifestoSummaryData(language: string) {
  try {
    const response = await fetch(`/locales/${language}/summary.json`);
    const data = await response.json();
    
    // Add to i18n resources for caching
    i18n.addResourceBundle(language, 'manifesto-summary', { items: data }, true, true);
    
    return data.manifestoData || data;
  } catch (error) {
    console.error(`Failed to load manifesto summary data for language: ${language}`, error);
    return [];
  }
}

// Function to load individual agenda detail data
export async function loadAgendaDetailData(language: string, agendaId: string) {
  try {
    const response = await fetch(`/locales/${language}/agenda/${agendaId}.json`);
    const data = await response.json();
    
    // Add to i18n resources for caching
    i18n.addResourceBundle(language, `agenda-${agendaId}`, data, true, true);
    
    return data;
  } catch (error) {
    console.error(`Failed to load agenda detail data for ${agendaId} in language: ${language}`, error);
    return null;
  }
}

// Function to load manifesto data (legacy support)
export async function loadManifestoData(language: string) {
  try {
    // Try to load from summary first (new structure)
    const summaryData = await loadManifestoSummaryData(language);
    if (summaryData && summaryData.length > 0) {
      return summaryData;
    }
    
    // Fallback to old structure if summary doesn't exist
    const response = await fetch(`/locales/${language}/manifesto.json`);
    const data = await response.json();
    
    i18n.addResourceBundle(language, 'manifesto', { items: data }, true, true);
    
    return data.manifestoData || data;
  } catch (error) {
    console.error(`Failed to load manifesto data for language: ${language}`, error);
    return [];
  }
}

// Function to load common translations
export async function loadCommonTranslations(language: string) {
  try {
    const response = await fetch(`/locales/${language}/common.json`);
    const data = await response.json();
    
    i18n.addResourceBundle(language, 'common', data, true, true);
    
    return data;
  } catch (error) {
    console.error(`Failed to load common translations for language: ${language}`, error);
    return {};
  }
}

export default i18n;
