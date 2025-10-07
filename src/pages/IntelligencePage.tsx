import React from 'react';
import IntelligenceGathering from '../components/IntelligenceGathering';
import SourceCredibilityAssessment from '../components/SourceCredibilityAssessment';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@phosphor-icons/react';
import { toast } from 'sonner';

type Language = 'en' | 'ru';

interface Props {
  language: Language;
  projectId: string;
  onNavigate: (page: string) => void;
}

const translations: Record<string, { en: string; ru: string }> = {
  intelligenceGathering: { en: 'Intelligence Gathering', ru: 'Сбор разведданных' },
  backToOverview: { en: 'Back to Overview', ru: 'Назад к обзору' },
  intelligenceDescription: { 
    en: 'Collect and analyze intelligence data from various sources', 
    ru: 'Сбор и анализ разведывательных данных из различных источников' 
  }
};

export default function IntelligencePage({ language, projectId, onNavigate }: Props) {
  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <div className="module-intelligence space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('intelligenceGathering')}</h1>
          <p className="text-muted-foreground mt-1">{t('intelligenceDescription')}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => onNavigate('overview')}
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('backToOverview')}
        </Button>
      </div>

      {/* Intelligence Components */}
      <div className="space-y-6">
        <IntelligenceGathering
          language={language}
          projectId={projectId}
          onIntelligenceGathered={(data) => {
            toast.success(`Intelligence collected: ${data.method}`, {
              description: `${data.dataCollected} data points gathered`
            });
          }}
          onGapIdentified={(gap) => {
            toast.info(`Information gap identified: ${gap.area}`, {
              description: `Priority: ${gap.priority} - ${gap.estimatedResolution}`
            });
          }}
        />
        
        <SourceCredibilityAssessment
          language={language}
          projectId={projectId}
          onSourceAssessed={(source) => {
            toast.success(`Source assessed: ${source.name}`, {
              description: `Credibility score: ${source.credibilityScore.overall}%`
            });
          }}
          onVerificationCompleted={(verification) => {
            toast.info(`Verification completed: ${verification.method}`, {
              description: `Status: ${verification.status}`
            });
          }}
        />
      </div>
    </div>
  );
}