import React from 'react';
import SystemDiagnostics from '../components/SystemDiagnostics';
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
  systemDiagnostics: { en: 'System Diagnostics', ru: 'Системная диагностика' },
  backToOverview: { en: 'Back to Overview', ru: 'Назад к обзору' },
  diagnosticsDescription: { 
    en: 'Monitor system health and performance metrics', 
    ru: 'Мониторинг состояния системы и метрик производительности' 
  }
};

export default function DiagnosticsPage({ language, projectId, onNavigate }: Props) {
  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <div className="module-diagnostics space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('systemDiagnostics')}</h1>
          <p className="text-muted-foreground mt-1">{t('diagnosticsDescription')}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => onNavigate('overview')}
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('backToOverview')}
        </Button>
      </div>

      {/* System Diagnostics Component */}
      <SystemDiagnostics
        language={language}
        onIssueDetected={(issue) => {
          toast.warning(`System issue detected: ${issue.description}`);
        }}
        onTaskCompleted={(task) => {
          toast.success(`Task completed: ${task.title}`);
        }}
      />
    </div>
  );
}