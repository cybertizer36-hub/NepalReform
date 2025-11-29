import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadManifestoSummaryData } from '@/lib/i18n';

// Summary item interface (used in ManifestoCard)
export interface ManifestoSummaryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  timeline: string;
  problem: {
    short: string;
  };
  solution: {
    short: string[];
  };
  performanceTargets: string[];
  realWorldEvidence: {
    short: string[];
  };
  implementation: {
    short: string[];
  };
  legalFoundation?: string;
}

// Full item interface (backward compatibility)
export interface ManifestoItem extends ManifestoSummaryItem {
  problem: {
    short: string;
    long: string;
  };
  solution: {
    short: string[];
    long: {
      phases: Array<{
        phase: string;
        title: string;
        items: string[];
      }>;
    };
  };
  realWorldEvidence: {
    short: string[];
    long: Array<{
      country: string;
      details: string;
      impact: string;
    }>;
  };
  implementation: {
    short: string[];
    long: Array<{
      timeline: string;
      description: string;
      details: string[];
    }>;
  };
}

// Detail item interface (used in agenda pages)
export interface ManifestoDetailItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  timeline: string;
  updatedOn?: string;
  problem: {
    long: string;
  };
  solution: {
    long: {
      phases: Array<{
        phase: string;
        title: string;
        items: string[];
      }>;
    };
  };
  realWorldEvidence: {
    long: Array<{
      country: string;
      details: string;
      impact: string;
    }>;
  };
  implementation: {
    long: Array<{
      timeline: string;
      description: string;
      details: string[];
    }>;
  };
  performanceTargets: string[];
  legalFoundation?: string;
}

// Cache manifesto data in memory to avoid reloading
const manifestoCache: Record<string, ManifestoSummaryItem[]> = {};

export function useManifestoData() {
  const { i18n } = useTranslation();
  const [manifestoData, setManifestoData] = useState<ManifestoSummaryItem[]>(() => {
    // Initialize with cached data if available
    return manifestoCache[i18n.language] || [];
  });
  const [loading, setLoading] = useState(!manifestoCache[i18n.language]);

  useEffect(() => {
    // If data is already cached, don't reload
    if (manifestoCache[i18n.language]) {
      setManifestoData(manifestoCache[i18n.language]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const data = await loadManifestoSummaryData(i18n.language);
      manifestoCache[i18n.language] = data; // Cache the data
      setManifestoData(data);
      setLoading(false);
    };

    loadData();
  }, [i18n.language]);

  const getManifestoItemById = (id: string): ManifestoSummaryItem | undefined => {
    return manifestoData.find((item) => item.id === id);
  };

  const getManifestoItemsByCategory = (category: string): ManifestoSummaryItem[] => {
    return manifestoData.filter((item) => item.category === category);
  };

  const getAllCategories = (): string[] => {
    return [...new Set(manifestoData.map((item) => item.category))];
  };

  return {
    manifestoData,
    loading,
    getManifestoItemById,
    getManifestoItemsByCategory,
    getAllCategories,
  };
}
