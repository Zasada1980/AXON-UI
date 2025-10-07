import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gear } from '@phosphor-icons/react';

type Language = 'en' | 'ru';

interface Props {
  language: Language;
  projectId: string;
  onNavigate: (page: string) => void;
}

const translations: Record<string, { en: string; ru: string }> = {
  pageTitle: { en: 'Page Under Development', ru: 'Страница в разработке' },
  backToOverview: { en: 'Back to Overview', ru: 'Назад к обзору' },
  description: { 
    en: 'This page will be available in the next update', 
    ru: 'Эта страница будет доступна в следующем обновлении' 
  }
};

interface PageProps extends Props {
  pageName: string;
}

export default function UnderDevelopmentPage({ language, projectId, onNavigate, pageName }: PageProps) {
  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {pageName || t('pageTitle')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => onNavigate('overview')}
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('backToOverview')}
        </Button>
      </div>

      {/* Content */}
      <div className="text-center py-12">
        <Gear size={64} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">
          {t('pageTitle')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t('description')}
        </p>
        <Button onClick={() => onNavigate('overview')}>
          {t('backToOverview')}
        </Button>
      </div>
    </div>
  );
}