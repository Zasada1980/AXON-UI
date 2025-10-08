import React, { useState } from 'react';
import IntelligenceGathering from '../components/IntelligenceGathering';
import SourceCredibilityAssessment from '../components/SourceCredibilityAssessment';
import SecureAPIKeyManager from '../components/SecureAPIKeyManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { axon } from '@/services/axonAdapter';
import { MagnifyingGlass } from '@phosphor-icons/react';

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

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string>('')
  const runQuickAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysis('')
    try {
      const res = await axon.analyze({ projectId, prompt: 'Identify top-3 intelligence gaps and propose next steps', mode: 'ikr', language })
      setAnalysis(res.content)
      toast.success(language === 'ru' ? 'Анализ выполнен' : 'Analysis completed')
    } catch (e: any) {
      toast.error(language === 'ru' ? 'Ошибка анализа' : 'Analysis failed', { description: String(e?.message || e) })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="module-intelligence space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('intelligenceGathering')}</h1>
          <p className="text-muted-foreground mt-1">{t('intelligenceDescription')}</p>
        </div>
        <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={() => onNavigate('overview')}
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('backToOverview')}
        </Button>
        <Button onClick={runQuickAnalysis} disabled={isAnalyzing} variant="secondary">
          {isAnalyzing ? <span className="flex items-center gap-2"><MagnifyingGlass size={16} className="animate-spin"/> {language==='ru'?'Анализ...':'Analyzing...'}</span> : <span className="flex items-center gap-2"><MagnifyingGlass size={16}/> {language==='ru'?'AXON анализ':'AXON Analyze'}</span>}
        </Button>
        </div>
      </div>

      {/* Intelligence Components */}
      <div className="space-y-6">
        {analysis && (
          <div className="rounded border p-3 text-sm whitespace-pre-line">
            <b>{language==='ru'?'Результат AXON анализа:':'AXON Analysis Result:'}</b>
            <div className="mt-2">{analysis}</div>
          </div>
        )}
        {/* Secure API Key Management */}
        <SecureAPIKeyManager
          language={language}
          projectId={projectId}
          onApiKeyUpdate={(provider, isValid) => {
            if (isValid) {
              toast.success(`${provider} API key configured successfully`);
            } else {
              toast.error(`Failed to configure ${provider} API key`);
            }
          }}
        />
        
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