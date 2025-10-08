import React from 'react';
import FileUploadManager from '../components/FileUploadManager';
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
  fileManagement: { en: 'File Management', ru: 'Управление файлами' },
  backToOverview: { en: 'Back to Overview', ru: 'Назад к обзору' },
  fileDescription: { 
    en: 'Upload, manage and analyze files for your intelligence project', 
    ru: 'Загрузка, управление и анализ файлов для вашего проекта анализа' 
  }
};

export default function FilesPage({ language, projectId, onNavigate }: Props) {
  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <div className="module-files space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('fileManagement')}</h1>
          <p className="text-muted-foreground mt-1">{t('fileDescription')}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => onNavigate('overview')}
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('backToOverview')}
        </Button>
      </div>

      {/* File Upload Manager */}
      <FileUploadManager
        language={language}
        projectId={projectId}
        onFileUploaded={(file) => {
          toast.success(`File uploaded: ${file.name}`);
        }}
        onFileAnalyzed={(analysis) => {
          toast.success(`File analysis completed: ${analysis.analysisType}`);
        }}
      />
    </div>
  );
}