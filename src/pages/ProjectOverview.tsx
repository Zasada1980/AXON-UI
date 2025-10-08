import React from 'react';
import { useKV } from '@github/spark/hooks';
import ProjectDashboard from '../components/ProjectDashboard';

type Language = 'en' | 'ru';

interface AnalysisProject {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  lastModified: string;
  completeness: number;
  dimensions: any[];
  ikrDirective: {
    intelligence: string;
    knowledge: string;
    reasoning: string;
  };
  auditAgents: any[];
  auditSessions: any[];
  chatSessions: any[];
}

interface Props {
  language: Language;
  projectId: string;
  onNavigate: (page: string) => void;
}

export default function ProjectOverview({ language, projectId, onNavigate }: Props) {
  const [projects] = useKV<AnalysisProject[]>('axon-projects', []);
  const [systemHealth] = useKV<{
    overall: number;
    components: {
      storage: number;
      ai: number;
      ui: number;
      memory: number;
    };
    lastCheck: string;
    issues: string[];
  }>('system-health', {
    overall: 100,
    components: { storage: 100, ai: 100, ui: 100, memory: 100 },
    lastCheck: new Date().toISOString(),
    issues: []
  });

  // Get current project data
  const projectData = projects?.find(p => p.id === projectId);

  // Calculate overall project completeness
  const calculateCompleteness = (proj: AnalysisProject) => {
    const dimensions = proj.dimensions || [];
    const dimensionCompleteness = dimensions.length > 0 
      ? dimensions.reduce((sum, d) => sum + (d.completeness || 0), 0) / dimensions.length
      : 0;
    const ikrDirective = proj.ikrDirective || { intelligence: '', knowledge: '', reasoning: '' };
    const ikrCompleteness = Object.values(ikrDirective).reduce((sum, value) => 
      sum + ((value || '').length > 50 ? 100 : (value || '').length * 2), 0
    ) / 3;
    return Math.round((dimensionCompleteness + ikrCompleteness) / 2);
  };

  if (!projectData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">
          {language === 'ru' ? 'Проект не найден' : 'Project not found'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ru' 
            ? 'Выбранный проект не существует' 
            : 'The selected project does not exist'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="module-overview">
      <ProjectDashboard
        language={language}
        project={projectData}
        onNavigate={onNavigate}
        systemHealth={systemHealth}
        calculateCompleteness={calculateCompleteness}
      />
    </div>
  );
}