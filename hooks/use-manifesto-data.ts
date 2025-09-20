import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadManifestoData } from '@/lib/i18n';

export interface ManifestoItem {
  id: string;
  title: string;
  description: string;
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
  performanceTargets: string[];
  category: string;
  priority: "High" | "Medium" | "Low";
  timeline: string;
  legalFoundation?: string;
}

export function useManifestoData() {
  const { i18n } = useTranslation();
  const [manifestoData, setManifestoData] = useState<ManifestoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await loadManifestoData(i18n.language);
      setManifestoData(data);
      setLoading(false);
    };

    loadData();
  }, [i18n.language]);

  const getManifestoItemById = (id: string): ManifestoItem | undefined => {
    return manifestoData.find((item) => item.id === id);
  };

  const getManifestoItemsByCategory = (category: string): ManifestoItem[] => {
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
