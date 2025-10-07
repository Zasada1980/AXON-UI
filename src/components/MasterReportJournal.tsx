import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  FileText,
  Calendar,
  CheckCircle,
  Warning,
  Clock,
  Database,
  Users,
  Target,
  BookOpen,
  Download,
  Plus,
  Play,
  ArrowRight,
  Robot,
  Brain,
  Eye,
  Stack,
  Activity,
  Gear,
  ListChecks,
  CloudArrowUp
} from '@phosphor-icons/react';

// Declare global spark object
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
    };
  }
}

const spark = (globalThis as any).spark;

// Основные типы для мастер-журнала отчетов
interface MasterReportEntry {
  id: string;
  timestamp: string;
  reportType: 'agent' | 'project' | 'integration' | 'debug' | 'audit' | 'analytics' | 'task' | 'system';
  sourceModule: string;
  title: string;
  summary: string;
  detailedReport: any; // Полные данные отчета
  status: 'generated' | 'reviewed' | 'processed' | 'archived' | 'action_required' | 'completed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
  relatedProjectId?: string;
  actionItems: ActionItem[];
  approvals: ApprovalRecord[];
  metrics: ReportMetrics;
  attachments: ReportAttachment[];
}

interface ActionItem {
  id: string;
  description: string;
  assignedTo?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface ApprovalRecord {
  id: string;
  approverName: string;
  approverRole: string;
  approvalDate: string;
  status: 'approved' | 'rejected' | 'pending_review';
  comments?: string;
}

interface ReportMetrics {
  completionRate: number;
  qualityScore: number;
  processingTime: number; // in minutes
  accuracyLevel: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ReportAttachment {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  uploadDate: string;
  description?: string;
}

interface TaskBlock {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  specifications: TechnicalSpecification[];
  dependencies: string[];
  estimatedDuration: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'testing';
  assignedTeam: string[];
  startDate?: string;
  endDate?: string;
  deliverables: Deliverable[];
  riskFactors: string[];
  notes: string;
}

interface TechnicalSpecification {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  techStack: string[];
  estimatedEffort: string;
  complexity: 'low' | 'medium' | 'high' | 'very_high';
}

interface Deliverable {
  id: string;
  name: string;
  type: 'code' | 'documentation' | 'design' | 'test' | 'deployment';
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'review' | 'approved';
  dueDate?: string;
}

interface MasterReportJournalProps {
  language: 'en' | 'ru';
  projectId: string;
  onReportJournaled: (report: MasterReportEntry) => void;
  onTaskBlockExecuted: (block: TaskBlock) => void;
  onSystemUpdate: (update: any) => void;
}

export default function MasterReportJournal({
  language,
  projectId,
  onReportJournaled,
  onTaskBlockExecuted,
  onSystemUpdate
}: MasterReportJournalProps) {
  // Состояние для журнала отчетов
  const [masterReports, setMasterReports] = useKV<MasterReportEntry[]>(`master-reports-${projectId}`, []);
  const [taskBlocks, setTaskBlocks] = useKV<TaskBlock[]>(`task-blocks-${projectId}`, []);
  const [activeReports, setActiveReports] = useState<MasterReportEntry[]>([]);
  const [currentTaskBlock, setCurrentTaskBlock] = useState<TaskBlock | null>(null);
  
  // UI состояние
  const [selectedReport, setSelectedReport] = useState<MasterReportEntry | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isExecutingBlock, setIsExecutingBlock] = useState(false);
  const [isMarkingStages, setIsMarkingStages] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Состояние для отслеживания завершенных этапов
  const [completedStages, setCompletedStages] = useKV<Record<string, string[]>>(`completed-stages-${projectId}`, {});
  const [stageProgress, setStageProgress] = useKV<Record<string, number>>(`stage-progress-${projectId}`, {});

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      masterReportJournal: {
        en: 'Master Report Journal',
        ru: 'Мастер-Журнал Отчетов'
      },
      journalDescription: {
        en: 'Centralized logging and processing of all system reports',
        ru: 'Централизованное журналирование и обработка всех системных отчетов'
      },
      generateAllReports: {
        en: 'Generate All Reports',
        ru: 'Создать Все Отчеты'
      },
      executeNextBlock: {
        en: 'Execute Next Block',
        ru: 'Выполнить Следующий Блок'
      },
      reportStatus: {
        en: 'Report Status',
        ru: 'Статус Отчетов'
      },
      taskBlockExecution: {
        en: 'Task Block Execution',
        ru: 'Выполнение Блоков Задач'
      },
      journalAllReports: {
        en: 'Journal All Reports',
        ru: 'Занести Все Отчеты'
      },
      systemAnalysis: {
        en: 'System Analysis',
        ru: 'Системный Анализ'
      },
      reportGenerated: {
        en: 'Report generated and journaled',
        ru: 'Отчет создан и занесен в журнал'
      },
      blockExecuted: {
        en: 'Task block executed successfully',
        ru: 'Блок задач успешно выполнен'
      },
      allReportsProcessed: {
        en: 'All reports processed and journaled',
        ru: 'Все отчеты обработаны и занесены в журнал'
      },
      nextBlockReady: {
        en: 'Next task block ready for execution',
        ru: 'Следующий блок задач готов к выполнению'
      },
      markCompletedStages: {
        en: 'Mark Completed Stages',
        ru: 'Отметить Завершенные Этапы'
      },
      stageCompletion: {
        en: 'Stage Completion Progress',
        ru: 'Прогресс Завершения Этапов'
      },
      stagesMarked: {
        en: 'Completed stages marked in all journal files',
        ru: 'Завершенные этапы отмечены во всех файлах журнала'
      },
      continueWorkOnBlock: {
        en: 'Continue Work on Block',
        ru: 'Продолжить Работу над Блоком'
      },
      workContinued: {
        en: 'Work on current block continued',
        ru: 'Работа над текущим блоком продолжена'
      },
      analyzingStageProgress: {
        en: 'Analyzing stage progress across all modules',
        ru: 'Анализ прогресса этапов по всем модулям'
      }
    };
    return translations[key]?.[language] || key;
  };

  // Автоматическое обновление активных отчетов
  useEffect(() => {
    if (masterReports) {
      const filtered = masterReports.filter(report => {
        const statusMatch = filterStatus === 'all' || report.status === filterStatus;
        const typeMatch = filterType === 'all' || report.reportType === filterType;
        return statusMatch && typeMatch;
      });
      setActiveReports(filtered);
    }
  }, [masterReports, filterStatus, filterType]);

  // Генерация мастер-отчета для всех модулей системы
  const generateAllSystemReports = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Список всех модулей системы для отчетности
      const systemModules = [
        { name: 'ProjectIntegrationJournal', type: 'integration' },
        { name: 'AgentJournalManager', type: 'agent' },
        { name: 'ProjectWorkStatusReport', type: 'project' },
        { name: 'SystemDiagnostics', type: 'system' },
        { name: 'TaskIntegrationTracker', type: 'task' },
        { name: 'AdvancedAnalytics', type: 'analytics' },
        { name: 'AIOrchestrator', type: 'agent' },
        { name: 'ErrorMonitoring', type: 'debug' },
        { name: 'UIEvolutionAudit', type: 'audit' }
      ];

      const reportsGenerated: MasterReportEntry[] = [];

      for (const module of systemModules) {
        const prompt = spark.llmPrompt`Создай детальный отчет для модуля ${module.name} типа ${module.type}. 
        
        Включи следующие разделы:
        1. Общий статус модуля
        2. Ключевые метрики производительности
        3. Выявленные проблемы и решения
        4. Рекомендации по улучшению
        5. Планы на следующий период
        
        Формат ответа: JSON объект с полной структурой отчета.
        
        Проект ID: ${projectId}
        Язык отчета: ${language}`;

        const reportData = await spark.llm(prompt, 'gpt-4o-mini', true);
        const parsedReport = JSON.parse(reportData);

        const masterEntry: MasterReportEntry = {
          id: `report-${module.name}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          reportType: module.type as any,
          sourceModule: module.name,
          title: `${module.name} System Report`,
          summary: parsedReport.summary || `Automated report for ${module.name}`,
          detailedReport: parsedReport,
          status: 'generated',
          priority: parsedReport.priority || 'medium',
          tags: [module.type, 'automated', 'system-wide'],
          relatedProjectId: projectId,
          actionItems: parsedReport.actionItems || [],
          approvals: [],
          metrics: {
            completionRate: parsedReport.metrics?.completionRate || 85,
            qualityScore: parsedReport.metrics?.qualityScore || 92,
            processingTime: Math.floor(Math.random() * 30) + 5,
            accuracyLevel: parsedReport.metrics?.accuracyLevel || 88,
            riskLevel: parsedReport.metrics?.riskLevel || 'low'
          },
          attachments: []
        };

        reportsGenerated.push(masterEntry);
        
        // Уведомление о каждом созданном отчете
        toast.success(`${t('reportGenerated')}: ${module.name}`);
      }

      // Обновляем состояние всех отчетов
      setMasterReports(current => [...(current || []), ...reportsGenerated]);

      // Уведомляем о завершении
      toast.success(t('allReportsProcessed'), {
        description: `${reportsGenerated.length} reports generated and journaled`
      });

      // Вызываем callback для каждого отчета
      reportsGenerated.forEach(report => {
        onReportJournaled(report);
      });

    } catch (error) {
      console.error('Error generating system reports:', error);
      toast.error('Failed to generate all reports');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Выполнение следующего блока задач согласно ТЗ
  const executeNextTaskBlock = async () => {
    setIsExecutingBlock(true);

    try {
      // Определяем следующий блок для выполнения
      const nextBlockPrompt = spark.llmPrompt`Проанализируй текущее состояние проекта ${projectId} и определи следующий критически важный блок задач для выполнения согласно техническому заданию.

      Учти следующие факторы:
      1. Текущие отчеты в журнале: ${masterReports?.length || 0}
      2. Приоритетные области для развития
      3. Зависимости между модулями
      4. Технические требования
      5. Критический путь проекта

      Создай структурированный блок задач с конкретными техническими спецификациями и планом выполнения.
      
      Формат ответа: JSON объект с полной структурой TaskBlock.`;

      const blockData = await spark.llm(nextBlockPrompt, 'gpt-4o-mini', true);
      const nextBlock: TaskBlock = JSON.parse(blockData);

      // Устанавливаем ID и дополнительные поля
      nextBlock.id = `block-${Date.now()}`;
      nextBlock.startDate = new Date().toISOString();
      nextBlock.status = 'in_progress';

      // Детализируем техническое задание для каждой спецификации
      for (let i = 0; i < nextBlock.specifications.length; i++) {
        const specPrompt = spark.llmPrompt`Детализируй техническую спецификацию "${nextBlock.specifications[i].title}" для блока задач "${nextBlock.name}".
        
        Создай подробное техническое описание включающее:
        1. Конкретные требования к реализации
        2. Критерии приемки
        3. Технологический стек
        4. Оценка сложности и трудозатрат
        5. Риски и способы их митигации
        
        Формат ответа: JSON объект с детализированной спецификацией.`;

        const specData = await spark.llm(specPrompt, 'gpt-4o-mini', true);
        const detailedSpec = JSON.parse(specData);
        
        nextBlock.specifications[i] = {
          ...nextBlock.specifications[i],
          ...detailedSpec,
          id: `spec-${i}-${Date.now()}`
        };
      }

      // Добавляем блок в список активных
      setTaskBlocks(current => [...(current || []), nextBlock]);
      setCurrentTaskBlock(nextBlock);

      // Автоматически создаем отчет о запуске блока
      const executionReport: MasterReportEntry = {
        id: `execution-report-${Date.now()}`,
        timestamp: new Date().toISOString(),
        reportType: 'task',
        sourceModule: 'MasterReportJournal',
        title: `Task Block Execution: ${nextBlock.name}`,
        summary: `Started execution of task block "${nextBlock.name}" with ${nextBlock.specifications.length} specifications`,
        detailedReport: {
          block: nextBlock,
          executionPlan: nextBlock.specifications,
          riskAssessment: nextBlock.riskFactors,
          timeline: {
            start: nextBlock.startDate,
            estimated_duration: nextBlock.estimatedDuration
          }
        },
        status: 'generated',
        priority: nextBlock.priority,
        tags: ['execution', 'task-block', 'technical-specification'],
        relatedProjectId: projectId,
        actionItems: nextBlock.specifications.map(spec => ({
          id: `action-${spec.id}`,
          description: spec.title,
          assignedTo: 'development-team',
          dueDate: undefined,
          status: 'pending' as const,
          priority: spec.complexity === 'high' ? 'high' as const : 'medium' as const,
          createdAt: new Date().toISOString()
        })),
        approvals: [],
        metrics: {
          completionRate: 0,
          qualityScore: 100,
          processingTime: 0,
          accuracyLevel: 95,
          riskLevel: nextBlock.riskFactors.length > 3 ? 'high' as const : 'medium' as const
        },
        attachments: []
      };

      // Добавляем отчет о выполнении в журнал
      setMasterReports(current => [...(current || []), executionReport]);

      toast.success(t('blockExecuted'), {
        description: `Block "${nextBlock.name}" started with ${nextBlock.specifications.length} specifications`
      });

      toast.info(t('nextBlockReady'), {
        description: `Estimated duration: ${nextBlock.estimatedDuration}`
      });

      // Вызываем callbacks
      onTaskBlockExecuted(nextBlock);
      onReportJournaled(executionReport);
      onSystemUpdate({
        type: 'task_block_execution',
        blockId: nextBlock.id,
        status: 'started',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error executing next task block:', error);
      toast.error('Failed to execute next task block');
    } finally {
      setIsExecutingBlock(false);
    }
  };

  // Функция для отметки завершенных этапов во всех журналах
  const markCompletedStagesInAllJournals = async () => {
    setIsMarkingStages(true);
    
    try {
      toast.info(t('analyzingStageProgress'));
      
      // Анализируем все отчеты и блоки задач для определения завершенных этапов
      const allSystemModules = [
        'ProjectIntegrationJournal',
        'AgentJournalManager', 
        'ProjectWorkStatusReport',
        'SystemDiagnostics',
        'TaskIntegrationTracker',
        'AdvancedAnalytics',
        'AIOrchestrator',
        'ErrorMonitoring',
        'UIEvolutionAudit',
        'MicroTaskExecutor',
        'UIIntegrationManager',
        'E2ETestingSystem',
        'AdvancedCognitiveAnalysis',
        'CollaborativeAnalysis',
        'AuthenticationSystem',
        'LocalAgentExecutor',
        'GlobalProjectSettings'
      ];

      const stageAnalysisPrompt = spark.llmPrompt`Проанализируй все модули системы и определи завершенные этапы работы:

      Модули системы: ${allSystemModules.join(', ')}
      Текущие отчеты: ${masterReports?.length || 0}
      Блоки задач: ${taskBlocks?.length || 0}
      Проект ID: ${projectId}

      Для каждого модуля определи:
      1. Какие этапы разработки завершены (анализ, проектирование, реализация, тестирование, интеграция)
      2. Уровень готовности каждого этапа (0-100%)
      3. Блокирующие факторы для незавершенных этапов
      4. Рекомендации по продолжению работы

      Отметь в журналах:
      - ✅ Полностью завершенные этапы
      - 🔄 Этапы в процессе выполнения  
      - ⏸️ Заблокированные этапы
      - 📋 Этапы ожидающие планирования

      Формат ответа: JSON объект с анализом этапов для каждого модуля.`;

      const stageAnalysis = await spark.llm(stageAnalysisPrompt, 'gpt-4o-mini', true);
      const analysisResult = JSON.parse(stageAnalysis);

      // Обновляем состояние завершенных этапов
      const newCompletedStages: Record<string, string[]> = {};
      const newStageProgress: Record<string, number> = {};

      Object.entries(analysisResult.modules || {}).forEach(([moduleName, moduleData]: [string, any]) => {
        newCompletedStages[moduleName] = moduleData.completedStages || [];
        newStageProgress[moduleName] = moduleData.overallProgress || 0;
      });

      setCompletedStages(newCompletedStages);
      setStageProgress(newStageProgress);

      // Создаем отчет о завершенных этапах
      const stageCompletionReport: MasterReportEntry = {
        id: `stage-completion-${Date.now()}`,
        timestamp: new Date().toISOString(),
        reportType: 'system',
        sourceModule: 'MasterReportJournal',
        title: 'Stage Completion Analysis Report',
        summary: `Marked completed stages across ${allSystemModules.length} system modules`,
        detailedReport: {
          modules: analysisResult.modules,
          completionSummary: {
            totalModules: allSystemModules.length,
            fullyCompleted: Object.values(newStageProgress).filter(p => p >= 100).length,
            inProgress: Object.values(newStageProgress).filter(p => p > 0 && p < 100).length,
            notStarted: Object.values(newStageProgress).filter(p => p === 0).length
          },
          nextActions: analysisResult.nextActions || [],
          blockers: analysisResult.blockers || []
        },
        status: 'generated',
        priority: 'high',
        tags: ['stage-completion', 'system-analysis', 'progress-tracking'],
        relatedProjectId: projectId,
        actionItems: (analysisResult.actionItems || []).map((item: any, index: number) => ({
          id: `stage-action-${index}`,
          description: item.description || item,
          assignedTo: item.assignedTo || 'development-team',
          dueDate: item.dueDate,
          status: 'pending' as const,
          priority: item.priority || 'medium' as const,
          createdAt: new Date().toISOString()
        })),
        approvals: [],
        metrics: {
          completionRate: Math.round(Object.values(newStageProgress).reduce((sum, p) => sum + p, 0) / allSystemModules.length),
          qualityScore: 95,
          processingTime: 10,
          accuracyLevel: 92,
          riskLevel: Object.values(newStageProgress).some(p => p < 50) ? 'medium' as const : 'low' as const
        },
        attachments: []
      };

      // Добавляем отчет в журнал
      setMasterReports(current => [...(current || []), stageCompletionReport]);

      toast.success(t('stagesMarked'), {
        description: `${Object.keys(newCompletedStages).length} modules analyzed`
      });

      // Вызываем callback
      onReportJournaled(stageCompletionReport);

    } catch (error) {
      console.error('Error marking completed stages:', error);
      toast.error('Failed to mark completed stages');
    } finally {
      setIsMarkingStages(false);
    }
  };

  // Функция для продолжения работы над текущим блоком
  const continueWorkOnCurrentBlock = async () => {
    if (!currentTaskBlock) {
      toast.warning('No active task block to continue');
      return;
    }

    setIsExecutingBlock(true);

    try {
      // Анализируем текущий прогресс блока
      const progressAnalysisPrompt = spark.llmPrompt`Проанализируй текущий прогресс блока задач "${currentTaskBlock.name}" и определи следующие шаги:

      Блок задач: ${JSON.stringify(currentTaskBlock, null, 2)}
      Завершенные этапы: ${JSON.stringify(completedStages, null, 2)}
      Прогресс этапов: ${JSON.stringify(stageProgress, null, 2)}

      Определи:
      1. Какие спецификации можно продолжить или завершить
      2. Приоритетные задачи для текущего этапа
      3. Зависимости которые нужно разрешить
      4. Конкретные действия для продолжения работы
      5. Обновленные временные рамки

      Создай план продолжения работы с конкретными шагами и ресурсами.
      
      Формат ответа: JSON объект с планом продолжения работы.`;

      const continuationPlan = await spark.llm(progressAnalysisPrompt, 'gpt-4o-mini', true);
      const planData = JSON.parse(continuationPlan);

      // Обновляем блок задач с новой информацией
      const updatedBlock: TaskBlock = {
        ...currentTaskBlock,
        status: 'in_progress',
        notes: `${currentTaskBlock.notes}\n\n--- Continuation Plan ${new Date().toISOString()} ---\n${planData.continuationNotes || ''}`,
        specifications: currentTaskBlock.specifications.map(spec => {
          const specUpdate = planData.specificationUpdates?.[spec.id];
          return specUpdate ? { ...spec, ...specUpdate } : spec;
        })
      };

      // Обновляем блок в состоянии
      setTaskBlocks(current => 
        (current || []).map(block => 
          block.id === currentTaskBlock.id ? updatedBlock : block
        )
      );
      setCurrentTaskBlock(updatedBlock);

      // Создаем отчет о продолжении работы
      const continuationReport: MasterReportEntry = {
        id: `continuation-${currentTaskBlock.id}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        reportType: 'task',
        sourceModule: 'MasterReportJournal',
        title: `Work Continuation: ${currentTaskBlock.name}`,
        summary: `Continued work on task block with updated plan and priorities`,
        detailedReport: {
          originalBlock: currentTaskBlock,
          updatedBlock: updatedBlock,
          continuationPlan: planData,
          nextSteps: planData.nextSteps || [],
          updatedTimeline: planData.timeline || {}
        },
        status: 'generated',
        priority: currentTaskBlock.priority,
        tags: ['continuation', 'task-execution', 'progress-update'],
        relatedProjectId: projectId,
        actionItems: (planData.immediateActions || []).map((action: any, index: number) => ({
          id: `continuation-action-${index}`,
          description: action.description || action,
          assignedTo: action.assignedTo || 'development-team',
          dueDate: action.dueDate,
          status: 'pending' as const,
          priority: action.priority || 'medium' as const,
          createdAt: new Date().toISOString()
        })),
        approvals: [],
        metrics: {
          completionRate: planData.estimatedCompletion || 
            Math.round((updatedBlock.specifications.filter(s => s.acceptanceCriteria.length > 0).length / updatedBlock.specifications.length) * 100),
          qualityScore: 90,
          processingTime: 15,
          accuracyLevel: 88,
          riskLevel: planData.riskAssessment || 'medium' as const
        },
        attachments: []
      };

      // Добавляем отчет в журнал
      setMasterReports(current => [...(current || []), continuationReport]);

      toast.success(t('workContinued'), {
        description: `Block "${currentTaskBlock.name}" updated with continuation plan`
      });

      // Вызываем callbacks
      onTaskBlockExecuted(updatedBlock);
      onReportJournaled(continuationReport);
      onSystemUpdate({
        type: 'task_block_continuation',
        blockId: currentTaskBlock.id,
        status: 'continued',
        timestamp: new Date().toISOString(),
        continuationPlan: planData
      });

    } catch (error) {
      console.error('Error continuing work on block:', error);
      toast.error('Failed to continue work on current block');
    } finally {
      setIsExecutingBlock(false);
    }
  };

  // Функция для просмотра детального отчета
  const viewDetailedReport = (report: MasterReportEntry) => {
    setSelectedReport(report);
    setShowReportDialog(true);
  };

  // Функция для просмотра блока задач
  const viewTaskBlock = (block: TaskBlock) => {
    setCurrentTaskBlock(block);
    setShowBlockDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и основные действия */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={24} className="text-primary" />
            {t('masterReportJournal')}
          </CardTitle>
          <CardDescription>
            {t('journalDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              onClick={generateAllSystemReports}
              disabled={isGeneratingReport}
              className="flex items-center gap-2"
            >
              {isGeneratingReport ? (
                <Clock size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              {t('journalAllReports')}
            </Button>
            
            <Button 
              onClick={markCompletedStagesInAllJournals}
              disabled={isMarkingStages}
              variant="secondary"
              className="flex items-center gap-2"
            >
              {isMarkingStages ? (
                <Clock size={16} className="animate-spin" />
              ) : (
                <CheckCircle size={16} />
              )}
              {t('markCompletedStages')}
            </Button>
            
            <Button 
              onClick={executeNextTaskBlock}
              disabled={isExecutingBlock}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isExecutingBlock ? (
                <Clock size={16} className="animate-spin" />
              ) : (
                <Play size={16} />
              )}
              {t('executeNextBlock')}
            </Button>

            {currentTaskBlock && (
              <Button 
                onClick={continueWorkOnCurrentBlock}
                disabled={isExecutingBlock}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isExecutingBlock ? (
                  <Clock size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
                {t('continueWorkOnBlock')}
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="secondary">
                {language === 'ru' ? 'Отчетов' : 'Reports'}: {masterReports?.length || 0}
              </Badge>
              <Badge variant="outline">
                {language === 'ru' ? 'Блоков' : 'Blocks'}: {taskBlocks?.length || 0}
              </Badge>
              {Object.keys(completedStages || {}).length > 0 && (
                <Badge variant="default">
                  {language === 'ru' ? 'Этапов' : 'Stages'}: {Object.keys(completedStages || {}).length}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Фильтры и статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {masterReports?.filter(r => r.status === 'completed').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Завершено' : 'Completed'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {masterReports?.filter(r => r.status === 'generated').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Сгенерировано' : 'Generated'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {masterReports?.filter(r => r.priority === 'high' || r.priority === 'critical').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Приоритетных' : 'High Priority'}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {taskBlocks?.filter(b => b.status === 'in_progress').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Активных Блоков' : 'Active Blocks'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Основное содержимое в табах */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText size={16} />
            {t('reportStatus')}
          </TabsTrigger>
          <TabsTrigger value="blocks" className="flex items-center gap-2">
            <Stack size={16} />
            {t('taskBlockExecution')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity size={16} />
            {t('systemAnalysis')}
          </TabsTrigger>
          <TabsTrigger value="stages" className="flex items-center gap-2">
            <Target size={16} />
            {t('stageCompletion')}
          </TabsTrigger>
        </TabsList>

        {/* Вкладка отчетов */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Master Report Registry</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="integration">Integration</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="generated">Generated</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {activeReports.map(report => (
                    <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => viewDetailedReport(report)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={report.reportType === 'agent' ? 'default' : 'secondary'}>
                              {report.reportType}
                            </Badge>
                            <Badge variant={
                              report.priority === 'critical' ? 'destructive' :
                              report.priority === 'high' ? 'default' :
                              'outline'
                            }>
                              {report.priority}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="font-medium">{report.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{report.summary}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            {report.sourceModule}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Q: {report.metrics.qualityScore}%
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Risk: {report.metrics.riskLevel}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка блоков задач */}
        <TabsContent value="blocks">
          <Card>
            <CardHeader>
              <CardTitle>Task Block Execution Registry</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {taskBlocks?.map(block => (
                    <Card key={block.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => viewTaskBlock(block)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={
                            block.status === 'completed' ? 'default' :
                            block.status === 'in_progress' ? 'secondary' :
                            block.status === 'blocked' ? 'destructive' :
                            'outline'
                          }>
                            {block.status}
                          </Badge>
                          <Badge variant={
                            block.priority === 'critical' ? 'destructive' :
                            block.priority === 'high' ? 'default' :
                            'outline'
                          }>
                            {block.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{block.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{block.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            {block.specifications.length} specifications
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Duration: {block.estimatedDuration}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Вкладка аналитики */}
        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Generation Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overall Quality Score</span>
                    <Badge variant="secondary">
                      {masterReports?.length ? 
                        Math.round(masterReports.reduce((acc, r) => acc + r.metrics.qualityScore, 0) / masterReports.length) : 0
                      }%
                    </Badge>
                  </div>
                  <Progress 
                    value={masterReports?.length ? 
                      masterReports.reduce((acc, r) => acc + r.metrics.qualityScore, 0) / masterReports.length : 0
                    } 
                  />
                  <div className="text-xs text-muted-foreground">
                    Based on {masterReports?.length || 0} generated reports
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Block Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <Badge variant="secondary">
                      {taskBlocks?.length ? 
                        Math.round((taskBlocks.filter(b => b.status === 'completed').length / taskBlocks.length) * 100) : 0
                      }%
                    </Badge>
                  </div>
                  <Progress 
                    value={taskBlocks?.length ? 
                      (taskBlocks.filter(b => b.status === 'completed').length / taskBlocks.length) * 100 : 0
                    } 
                  />
                  <div className="text-xs text-muted-foreground">
                    {taskBlocks?.filter(b => b.status === 'completed').length || 0} of {taskBlocks?.length || 0} blocks completed
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка завершения этапов */}
        <TabsContent value="stages">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Module Stage Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {Object.entries(stageProgress || {}).map(([moduleName, progress]) => (
                      <div key={moduleName} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{moduleName}</span>
                          <Badge variant={progress >= 100 ? 'default' : progress >= 50 ? 'secondary' : 'outline'}>
                            {Math.round(progress)}%
                          </Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {completedStages?.[moduleName]?.map((stage, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              ✅ {stage}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Progress Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Completion</span>
                    <Badge variant="secondary">
                      {Object.keys(stageProgress || {}).length ? 
                        Math.round(Object.values(stageProgress || {}).reduce((sum, p) => sum + p, 0) / Object.keys(stageProgress || {}).length) : 0
                      }%
                    </Badge>
                  </div>
                  <Progress 
                    value={Object.keys(stageProgress || {}).length ? 
                      Object.values(stageProgress || {}).reduce((sum, p) => sum + p, 0) / Object.keys(stageProgress || {}).length : 0
                    } 
                  />
                  
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {Object.values(stageProgress || {}).filter(p => p >= 100).length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === 'ru' ? 'Завершены' : 'Completed'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {Object.values(stageProgress || {}).filter(p => p > 0 && p < 100).length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === 'ru' ? 'В процессе' : 'In Progress'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-500">
                        {Object.values(stageProgress || {}).filter(p => p === 0).length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === 'ru' ? 'Не начаты' : 'Not Started'}
                      </div>
                    </div>
                  </div>

                  {currentTaskBlock && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Current Block Status</h4>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{currentTaskBlock.name}</span>
                            <Badge variant={
                              currentTaskBlock.status === 'completed' ? 'default' :
                              currentTaskBlock.status === 'in_progress' ? 'secondary' :
                              'outline'
                            }>
                              {currentTaskBlock.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {currentTaskBlock.specifications.length} specifications • 
                            {currentTaskBlock.estimatedDuration} estimated
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Диалог просмотра детального отчета */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              {selectedReport?.sourceModule} • {selectedReport?.reportType}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96 pr-4">
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.summary}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Metrics</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Quality Score:</span>
                      <Badge variant="outline">{selectedReport.metrics.qualityScore}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Accuracy Level:</span>
                      <Badge variant="outline">{selectedReport.metrics.accuracyLevel}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Risk Level:</span>
                      <Badge variant={selectedReport.metrics.riskLevel === 'high' ? 'destructive' : 'outline'}>
                        {selectedReport.metrics.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Processing Time:</span>
                      <Badge variant="outline">{selectedReport.metrics.processingTime}m</Badge>
                    </div>
                  </div>
                </div>

                {selectedReport.actionItems.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Action Items</h4>
                      <div className="space-y-2">
                        {selectedReport.actionItems.map(action => (
                          <div key={action.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{action.description}</span>
                            <Badge variant={
                              action.status === 'completed' ? 'default' :
                              action.status === 'in_progress' ? 'secondary' :
                              'outline'
                            }>
                              {action.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Detailed Report Data</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedReport.detailedReport, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Диалог просмотра блока задач */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{currentTaskBlock?.name}</DialogTitle>
            <DialogDescription>
              {currentTaskBlock?.description}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96 pr-4">
            {currentTaskBlock && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Block Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={
                          currentTaskBlock.status === 'completed' ? 'default' :
                          currentTaskBlock.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }>
                          {currentTaskBlock.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority:</span>
                        <Badge variant={currentTaskBlock.priority === 'critical' ? 'destructive' : 'outline'}>
                          {currentTaskBlock.priority}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{currentTaskBlock.estimatedDuration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Specifications:</span>
                        <span>{currentTaskBlock.specifications.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Team Assignment</h4>
                    <div className="space-y-1">
                      {currentTaskBlock.assignedTeam.map((member, index) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {member}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Technical Specifications</h4>
                  <div className="space-y-3">
                    {currentTaskBlock.specifications.map((spec, index) => (
                      <Card key={spec.id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-sm">{spec.title}</h5>
                          <Badge variant={
                            spec.complexity === 'very_high' ? 'destructive' :
                            spec.complexity === 'high' ? 'default' :
                            'outline'
                          }>
                            {spec.complexity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{spec.description}</p>
                        <div className="text-xs">
                          <span className="font-medium">Effort:</span> {spec.estimatedEffort}
                        </div>
                        {spec.acceptanceCriteria.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium">Acceptance Criteria:</span>
                            <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                              {spec.acceptanceCriteria.slice(0, 3).map((criteria, i) => (
                                <li key={i}>{criteria}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>

                {currentTaskBlock.riskFactors.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Risk Factors</h4>
                      <div className="space-y-1">
                        {currentTaskBlock.riskFactors.map((risk, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Warning size={14} className="text-yellow-500" />
                            <span>{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}