import React, { useMemo } from 'react';
import ProjectRequirementsTracker from '@/components/ProjectRequirementsTracker';
import ProjectWorkStatusReport from '@/components/ProjectWorkStatusReport';
import MasterReportJournal from '@/components/MasterReportJournal';
import SystemCompletionReport from '@/components/SystemCompletionReport';
import UIEvolutionAudit from '@/components/UIEvolutionAudit';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type Language = 'en' | 'ru';

export type ReportsTab = 'requirements' | 'work-status' | 'journal' | 'system-completion' | 'ui-audit';

interface Props {
  language: Language;
  projectId: string;
  onNavigate: (page: string) => void;
  initialTab?: ReportsTab;
}

export default function ProjectReportsPage({ language, projectId, onNavigate: _onNavigate, initialTab = 'requirements' }: Props) {
  const t = useMemo(() => {
    const dict: Record<string, { en: string; ru: string }> = {
      title: { en: 'Project Reports', ru: 'Отчеты Проекта' },
      requirements: { en: 'Requirements', ru: 'Требования' },
      workStatus: { en: 'Work Status', ru: 'Статус Работ' },
      journal: { en: 'Master Journal', ru: 'Мастер-Журнал' },
      systemCompletion: { en: 'System Completion', ru: 'Завершенность Системы' },
      uiAudit: { en: 'UI Evolution Audit', ru: 'Аудит Эволюции UI' },
    };
    return (key: keyof typeof dict) => dict[key]?.[language] || String(key);
  }, [language]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
      </div>

      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="requirements">{t('requirements')}</TabsTrigger>
          <TabsTrigger value="work-status">{t('workStatus')}</TabsTrigger>
          <TabsTrigger value="journal">{t('journal')}</TabsTrigger>
          <TabsTrigger value="system-completion">{t('systemCompletion')}</TabsTrigger>
          <TabsTrigger value="ui-audit">{t('uiAudit')}</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="mt-4">
          <ProjectRequirementsTracker language={language} projectId={projectId} />
        </TabsContent>

        <TabsContent value="work-status" className="mt-4">
          <ProjectWorkStatusReport language={language} projectId={projectId} />
        </TabsContent>

        <TabsContent value="journal" className="mt-4">
          <MasterReportJournal
            language={language}
            projectId={projectId}
            onReportJournaled={() => {}}
            onTaskBlockExecuted={() => {}}
            onSystemUpdate={() => {}}
          />
        </TabsContent>

        <TabsContent value="system-completion" className="mt-4">
          <SystemCompletionReport language={language} projectId={projectId} />
        </TabsContent>

        <TabsContent value="ui-audit" className="mt-4">
          <UIEvolutionAudit language={language} projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
