import React from 'react';
import SystemDiagnostics from '../components/SystemDiagnostics';
import ErrorMonitoring from '@/components/ErrorMonitoring';
import AutoRecovery from '@/components/AutoRecovery';
import AutoBackupSystem from '@/components/AutoBackupSystem';
import CheckpointSystem from '@/components/CheckpointSystem';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Activity, Wrench, FloppyDisk, Database } from '@phosphor-icons/react';
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
  },
  tabOverview: { en: 'Overview', ru: 'Обзор' },
  tabRecovery: { en: 'Monitoring & Recovery', ru: 'Мониторинг и Восстановление' },
  tabBackups: { en: 'Backups', ru: 'Резервные копии' },
  tabCheckpoints: { en: 'Checkpoints', ru: 'Контрольные точки' }
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

      {/* Diagnostics Suite */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity size={16} /> {t('tabOverview')}
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-2">
            <Wrench size={16} /> {t('tabRecovery')}
          </TabsTrigger>
          <TabsTrigger value="backups" className="flex items-center gap-2">
            <FloppyDisk size={16} /> {t('tabBackups')}
          </TabsTrigger>
          <TabsTrigger value="checkpoints" className="flex items-center gap-2">
            <Database size={16} /> {t('tabCheckpoints')}
          </TabsTrigger>
        </TabsList>

        {/* Overview: metrics + issues + microtasks */}
        <TabsContent value="overview" className="mt-4">
          <SystemDiagnostics
            language={language}
            onIssueDetected={(issue) => {
              toast.warning(`System issue detected: ${issue.description}`);
            }}
            onTaskCompleted={(task) => {
              toast.success(`Task completed: ${task.title}`);
            }}
          />
        </TabsContent>

        {/* Recovery: Error monitoring + Auto recovery side by side */}
        <TabsContent value="recovery" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <ErrorMonitoring language={language} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <AutoRecovery language={language} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Backups: auto backup system */}
        <TabsContent value="backups" className="mt-4">
          <AutoBackupSystem
            language={language}
            projectId={projectId}
            onBackupCreated={() => {
              toast.success('Backup created');
            }}
            onRestoreCompleted={() => {
              toast.success('Restore completed');
            }}
          />
        </TabsContent>

        {/* Checkpoints */}
        <TabsContent value="checkpoints" className="mt-4">
          <CheckpointSystem language={language} />
        </TabsContent>
      </Tabs>
    </div>
  );
}