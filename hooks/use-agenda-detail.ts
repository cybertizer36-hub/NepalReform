import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadAgendaDetailData } from '@/lib/i18n';
import { ManifestoDetailItem, ManifestoSummaryItem } from './use-manifesto-data';

// Combined item type for agenda pages
export interface CombinedManifestoItem extends ManifestoSummaryItem {
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

export function useAgendaDetail(agendaId: string, summaryData?: ManifestoSummaryItem) {
  const { i18n } = useTranslation();
  const [agendaDetail, setAgendaDetail] = useState<ManifestoDetailItem | null>(null);
  const [combinedData, setCombinedData] = useState<CombinedManifestoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const detailData = await loadAgendaDetailData(i18n.language, agendaId);
        
        if (!detailData) {
          setError(`Agenda ${agendaId} not found`);
          setLoading(false);
          return;
        }

        setAgendaDetail(detailData);

        // If we have summary data (from cache), combine it with detail data
        if (summaryData) {
          const combined: CombinedManifestoItem = {
            // Use summary data for common fields (already cached)
            id: summaryData.id,
            title: summaryData.title,
            description: summaryData.description,
            category: summaryData.category,
            priority: summaryData.priority,
            timeline: summaryData.timeline,
            performanceTargets: summaryData.performanceTargets,
            legalFoundation: summaryData.legalFoundation,
            
            // Combine short and long versions
            problem: {
              short: summaryData.problem.short,
              long: detailData.problem.long
            },
            solution: {
              short: summaryData.solution.short,
              long: detailData.solution.long
            },
            realWorldEvidence: {
              short: summaryData.realWorldEvidence.short,
              long: detailData.realWorldEvidence.long
            },
            implementation: {
              short: summaryData.implementation.short,
              long: detailData.implementation.long
            }
          };
          
          setCombinedData(combined);
        } else {
          // If no summary data, use detail data only (fallback)
          const fallbackCombined: CombinedManifestoItem = {
            id: detailData.id,
            title: detailData.title,
            description: detailData.description,
            category: detailData.category,
            priority: detailData.priority,
            timeline: detailData.timeline,
            performanceTargets: detailData.performanceTargets,
            legalFoundation: detailData.legalFoundation,
            
            problem: {
              short: '', // Not available in detail-only data
              long: detailData.problem.long
            },
            solution: {
              short: [], // Not available in detail-only data
              long: detailData.solution.long
            },
            realWorldEvidence: {
              short: [], // Not available in detail-only data
              long: detailData.realWorldEvidence.long
            },
            implementation: {
              short: [], // Not available in detail-only data
              long: detailData.implementation.long
            }
          };
          
          setCombinedData(fallbackCombined);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agenda data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [agendaId, i18n.language, summaryData]);

  return {
    agendaDetail,
    combinedData,
    loading,
    error,
    // Helper functions
    hasSummaryData: !!summaryData,
  };
}

// Hook to get summary data for a specific agenda (for use in agenda pages)
export function useAgendaSummary(agendaId: string) {
  const { i18n } = useTranslation();
  const [summaryData, setSummaryData] = useState<ManifestoSummaryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummaryData = async () => {
      try {
        // Check if summary data is already in i18n resources
        const existingBundle = i18n.getResourceBundle(i18n.language, 'manifesto-summary');
        if (existingBundle?.items) {
          const items = existingBundle.items.manifestoData || existingBundle.items;
          const item = items.find((item: ManifestoSummaryItem) => item.id === agendaId);
          if (item) {
            setSummaryData(item);
            setLoading(false);
            return;
          }
        }

        // If not in cache, load summary data
        const { loadManifestoSummaryData } = await import('@/lib/i18n');
        const data = await loadManifestoSummaryData(i18n.language);
        const item = data.find((item: ManifestoSummaryItem) => item.id === agendaId);
        setSummaryData(item || null);
      } catch (error) {
        console.error(`Failed to load summary data for agenda ${agendaId}:`, error);
        setSummaryData(null);
      } finally {
        setLoading(false);
      }
    };

    loadSummaryData();
  }, [agendaId, i18n.language]);

  return {
    summaryData,
    loading,
  };
}
