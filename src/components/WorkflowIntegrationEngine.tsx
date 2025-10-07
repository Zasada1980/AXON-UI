import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Cpu,
  Graph,
  Play,
  Pause,
  Stop,
  CheckCircle,
  Warning,
  Clock,
  Target,
  Brain,
  Robot,
  Gear,
  ArrowRight,
  Plus,
  Eye,
  Shield,
  ListChecks,
  FileText,
  ChartLine,
  Users,
  Database,
  CloudArrowUp,
  Lightbulb
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

interface WorkflowNode {
  id: string;
  type: 'kipling' | 'ikr' | 'audit' | 'debate' | 'analysis' | 'synthesis' | 'report';
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'blocked';
  dependencies: string[];
  outputs: Record<string, any>;
  config: Record<string, any>;
  estimatedDuration: number;
  actualDuration?: number;
  progress: number;
  errors: string[];
  warnings: string[];
}

interface IntegratedWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  status: 'draft' | 'ready' | 'running' | 'completed' | 'failed' | 'paused';
  currentNode?: string;
  startTime?: string;
  endTime?: string;
  totalProgress: number;
  autoMode: boolean;
  rollbackEnabled: boolean;
  checkpointInterval: number;
  lastCheckpoint?: string;
}

interface WorkflowConnection {
  id: string;
  fromNode: string;
  toNode: string;
  condition?: string;
  dataMapping: Record<string, string>;
  type: 'sequential' | 'parallel' | 'conditional';
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'intelligence' | 'analysis' | 'audit' | 'synthesis' | 'research';
  workflow: Partial<IntegratedWorkflow>;
  requiredInputs: string[];
  expectedOutputs: string[];
  complexity: 'low' | 'medium' | 'high' | 'expert';
  estimatedTime: number;
}

interface WorkflowIntegrationEngineProps {
  language: 'en' | 'ru';
  projectId: string;
  onWorkflowCompleted?: (workflow: IntegratedWorkflow) => void;
  onNodeCompleted?: (nodeId: string, outputs: Record<string, any>) => void;
  onError?: (error: string) => void;
}

const WorkflowIntegrationEngine: React.FC<WorkflowIntegrationEngineProps> = ({
  language,
  projectId,
  onWorkflowCompleted,
  onNodeCompleted,
  onError
}) => {
  const [workflows, setWorkflows] = useKV<IntegratedWorkflow[]>(`workflows-${projectId}`, []);
  const [templates, setTemplates] = useKV<WorkflowTemplate[]>(`workflow-templates`, getDefaultTemplates());
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [executionLog, setExecutionLog] = useKV<Array<{
    timestamp: string;
    workflowId: string;
    nodeId: string;
    event: string;
    data?: any;
  }>>(`execution-log-${projectId}`, []);

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      workflowEngine: {
        en: 'Workflow Integration Engine',
        ru: 'Движок Интеграции Процессов'
      },
      createWorkflow: {
        en: 'Create Workflow',
        ru: 'Создать Процесс'
      },
      templates: {
        en: 'Templates',
        ru: 'Шаблоны'
      },
      activeWorkflows: {
        en: 'Active Workflows',
        ru: 'Активные Процессы'
      },
      executionHistory: {
        en: 'Execution History',
        ru: 'История Выполнения'
      },
      runWorkflow: {
        en: 'Run Workflow',
        ru: 'Запустить Процесс'
      },
      pauseWorkflow: {
        en: 'Pause Workflow',
        ru: 'Приостановить Процесс'
      },
      stopWorkflow: {
        en: 'Stop Workflow',
        ru: 'Остановить Процесс'
      },
      intelligence: {
        en: 'Intelligence Analysis',
        ru: 'Анализ Разведданных'
      },
      analysis: {
        en: 'Data Analysis',
        ru: 'Анализ Данных'
      },
      audit: {
        en: 'System Audit',
        ru: 'Системный Аудит'
      },
      synthesis: {
        en: 'Information Synthesis',
        ru: 'Синтез Информации'
      },
      research: {
        en: 'Research Process',
        ru: 'Исследовательский Процесс'
      }
    };

    return translations[key]?.[language] || key;
  };

  function getDefaultTemplates(): WorkflowTemplate[] {
    return [
      {
        id: 'comprehensive-intelligence',
        name: language === 'ru' ? 'Комплексный анализ разведданных' : 'Comprehensive Intelligence Analysis',
        description: language === 'ru' 
          ? 'Полный цикл анализа от сбора данных до стратегических рекомендаций'
          : 'Complete cycle from data collection to strategic recommendations',
        category: 'intelligence',
        workflow: {
          name: 'Intelligence Analysis Workflow',
          nodes: [
            {
              id: 'data-collection',
              type: 'kipling',
              name: 'Data Collection',
              description: 'Gather and organize intelligence using Kipling method',
              status: 'idle',
              dependencies: [],
              outputs: {},
              config: { method: 'kipling', depth: 'comprehensive' },
              estimatedDuration: 30,
              progress: 0,
              errors: [],
              warnings: []
            },
            {
              id: 'ikr-processing',
              type: 'ikr',
              name: 'IKR Processing',
              description: 'Process through Intelligence-Knowledge-Reasoning',
              status: 'idle',
              dependencies: ['data-collection'],
              outputs: {},
              config: { stages: ['intelligence', 'knowledge', 'reasoning'] },
              estimatedDuration: 45,
              progress: 0,
              errors: [],
              warnings: []
            },
            {
              id: 'security-audit',
              type: 'audit',
              name: 'Security Audit',
              description: 'Comprehensive security and bias analysis',
              status: 'idle',
              dependencies: ['ikr-processing'],
              outputs: {},
              config: { agents: ['security', 'bias'], depth: 'full' },
              estimatedDuration: 20,
              progress: 0,
              errors: [],
              warnings: []
            },
            {
              id: 'synthesis-report',
              type: 'synthesis',
              name: 'Final Synthesis',
              description: 'Generate comprehensive intelligence report',
              status: 'idle',
              dependencies: ['security-audit'],
              outputs: {},
              config: { format: 'comprehensive', export: true },
              estimatedDuration: 25,
              progress: 0,
              errors: [],
              warnings: []
            }
          ],
          connections: [
            {
              id: 'c1',
              fromNode: 'data-collection',
              toNode: 'ikr-processing',
              type: 'sequential',
              dataMapping: { 'kipling-data': 'intelligence-input' }
            },
            {
              id: 'c2',
              fromNode: 'ikr-processing',
              toNode: 'security-audit',
              type: 'sequential',
              dataMapping: { 'ikr-output': 'audit-input' }
            },
            {
              id: 'c3',
              fromNode: 'security-audit',
              toNode: 'synthesis-report',
              type: 'sequential',
              dataMapping: { 'audit-results': 'synthesis-input' }
            }
          ],
          status: 'draft',
          totalProgress: 0,
          autoMode: true,
          rollbackEnabled: true,
          checkpointInterval: 5
        },
        requiredInputs: ['initial-data', 'analysis-scope'],
        expectedOutputs: ['intelligence-report', 'recommendations', 'risk-assessment'],
        complexity: 'high',
        estimatedTime: 120
      },
      {
        id: 'quick-audit',
        name: language === 'ru' ? 'Быстрый аудит' : 'Quick Audit',
        description: language === 'ru' 
          ? 'Ускоренная проверка системы и данных'
          : 'Rapid system and data verification',
        category: 'audit',
        workflow: {
          name: 'Quick Audit Workflow',
          nodes: [
            {
              id: 'system-scan',
              type: 'audit',
              name: 'System Scan',
              description: 'Quick system health and security scan',
              status: 'idle',
              dependencies: [],
              outputs: {},
              config: { type: 'quick', agents: ['security', 'performance'] },
              estimatedDuration: 10,
              progress: 0,
              errors: [],
              warnings: []
            },
            {
              id: 'issue-analysis',
              type: 'analysis',
              name: 'Issue Analysis',
              description: 'Analyze detected issues and prioritize',
              status: 'idle',
              dependencies: ['system-scan'],
              outputs: {},
              config: { focus: 'critical-issues', 'auto-prioritize': true },
              estimatedDuration: 15,
              progress: 0,
              errors: [],
              warnings: []
            }
          ],
          connections: [
            {
              id: 'c1',
              fromNode: 'system-scan',
              toNode: 'issue-analysis',
              type: 'sequential',
              dataMapping: { 'scan-results': 'analysis-input' }
            }
          ],
          status: 'draft',
          totalProgress: 0,
          autoMode: true,
          rollbackEnabled: false,
          checkpointInterval: 10
        },
        requiredInputs: ['system-scope'],
        expectedOutputs: ['audit-report', 'issue-list', 'recommendations'],
        complexity: 'low',
        estimatedTime: 25
      }
    ];
  }

  // Create workflow from template
  const createWorkflowFromTemplate = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (!template) return;

    const newWorkflow: IntegratedWorkflow = {
      id: `workflow-${Date.now()}`,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      nodes: template.workflow.nodes || [],
      connections: template.workflow.connections || [],
      status: 'ready',
      totalProgress: 0,
      autoMode: template.workflow.autoMode || false,
      rollbackEnabled: template.workflow.rollbackEnabled || false,
      checkpointInterval: template.workflow.checkpointInterval || 5
    };

    setWorkflows(current => [...(current || []), newWorkflow]);
    setIsCreatingWorkflow(false);
    
    toast.success(language === 'ru' ? 'Процесс создан' : 'Workflow created');
  };

  // Execute workflow node
  const executeNode = async (workflowId: string, nodeId: string) => {
    const workflow = workflows?.find(w => w.id === workflowId);
    const node = workflow?.nodes.find(n => n.id === nodeId);
    
    if (!workflow || !node) return;

    // Update node status to running
    setWorkflows(current =>
      (current || []).map(w =>
        w.id === workflowId
          ? {
              ...w,
              nodes: w.nodes.map(n =>
                n.id === nodeId
                  ? { ...n, status: 'running', progress: 0 }
                  : n
              ),
              currentNode: nodeId
            }
          : w
      )
    );

    // Log execution start
    const logEntry = {
      timestamp: new Date().toISOString(),
      workflowId,
      nodeId,
      event: 'node-started',
      data: { nodeType: node.type, config: node.config }
    };

    setExecutionLog(current => [...(current || []), logEntry]);

    try {
      const startTime = Date.now();
      let outputs: Record<string, any> = {};

      // Execute based on node type
      switch (node.type) {
        case 'kipling':
          outputs = await executeKiplingNode(node);
          break;
        case 'ikr':
          outputs = await executeIKRNode(node);
          break;
        case 'audit':
          outputs = await executeAuditNode(node);
          break;
        case 'analysis':
          outputs = await executeAnalysisNode(node);
          break;
        case 'synthesis':
          outputs = await executeSynthesisNode(node);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      const actualDuration = (Date.now() - startTime) / 1000;

      // Update node with results
      setWorkflows(current =>
        (current || []).map(w =>
          w.id === workflowId
            ? {
                ...w,
                nodes: w.nodes.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        status: 'completed',
                        progress: 100,
                        outputs,
                        actualDuration
                      }
                    : n
                )
              }
            : w
        )
      );

      // Log completion
      setExecutionLog(current => [
        ...(current || []),
        {
          timestamp: new Date().toISOString(),
          workflowId,
          nodeId,
          event: 'node-completed',
          data: { duration: actualDuration, outputs }
        }
      ]);

      onNodeCompleted?.(nodeId, outputs);

      // Check if workflow is complete
      const updatedWorkflow = workflows?.find(w => w.id === workflowId);
      if (updatedWorkflow && updatedWorkflow.nodes.every(n => n.status === 'completed')) {
        setWorkflows(current =>
          (current || []).map(w =>
            w.id === workflowId
              ? { ...w, status: 'completed', endTime: new Date().toISOString() }
              : w
          )
        );
        onWorkflowCompleted?.(updatedWorkflow);
        toast.success(language === 'ru' ? 'Процесс завершен!' : 'Workflow completed!');
      }

    } catch (error) {
      // Handle node failure
      setWorkflows(current =>
        (current || []).map(w =>
          w.id === workflowId
            ? {
                ...w,
                nodes: w.nodes.map(n =>
                  n.id === nodeId
                    ? {
                        ...n,
                        status: 'failed',
                        errors: [...n.errors, error instanceof Error ? error.message : String(error)]
                      }
                    : n
                )
              }
            : w
        )
      );

      setExecutionLog(current => [
        ...(current || []),
        {
          timestamp: new Date().toISOString(),
          workflowId,
          nodeId,
          event: 'node-failed',
          data: { error: error instanceof Error ? error.message : String(error) }
        }
      ]);

      onError?.(error instanceof Error ? error.message : String(error));
      toast.error(language === 'ru' ? 'Ошибка выполнения узла' : 'Node execution failed');
    }
  };

  // Node execution implementations
  const executeKiplingNode = async (node: WorkflowNode): Promise<Record<string, any>> => {
    const prompt = spark.llmPrompt`Execute Kipling analysis (5W1H) for this workflow node:
Configuration: ${JSON.stringify(node.config)}

Generate comprehensive analysis covering:
- Who: Stakeholders and actors
- What: Key issues and events
- When: Timeline and critical dates
- Where: Locations and contexts
- Why: Motivations and causes
- How: Methods and processes

Return as JSON with keys: who, what, when, where, why, how`;

    const response = await spark.llm(prompt, 'gpt-4o-mini', true);
    return JSON.parse(response);
  };

  const executeIKRNode = async (node: WorkflowNode): Promise<Record<string, any>> => {
    const prompt = spark.llmPrompt`Execute IKR (Intelligence-Knowledge-Reasoning) processing:
Configuration: ${JSON.stringify(node.config)}

Process through three stages:
1. Intelligence: Gather and assess raw information
2. Knowledge: Synthesize patterns and relationships
3. Reasoning: Draw conclusions and recommendations

Return as JSON with keys: intelligence, knowledge, reasoning`;

    const response = await spark.llm(prompt, 'gpt-4o-mini', true);
    return JSON.parse(response);
  };

  const executeAuditNode = async (node: WorkflowNode): Promise<Record<string, any>> => {
    const prompt = spark.llmPrompt`Execute system audit analysis:
Configuration: ${JSON.stringify(node.config)}

Perform comprehensive audit covering:
- Security vulnerabilities
- Performance issues
- Bias detection
- Compliance checks
- Risk assessment

Return as JSON with keys: security, performance, bias, compliance, risks`;

    const response = await spark.llm(prompt, 'gpt-4o-mini', true);
    return JSON.parse(response);
  };

  const executeAnalysisNode = async (node: WorkflowNode): Promise<Record<string, any>> => {
    const prompt = spark.llmPrompt`Execute data analysis:
Configuration: ${JSON.stringify(node.config)}

Perform analytical processing including:
- Pattern recognition
- Trend analysis
- Correlation identification
- Statistical insights
- Predictive indicators

Return as JSON with keys: patterns, trends, correlations, statistics, predictions`;

    const response = await spark.llm(prompt, 'gpt-4o-mini', true);
    return JSON.parse(response);
  };

  const executeSynthesisNode = async (node: WorkflowNode): Promise<Record<string, any>> => {
    const prompt = spark.llmPrompt`Execute information synthesis:
Configuration: ${JSON.stringify(node.config)}

Synthesize collected information into:
- Executive summary
- Key findings
- Strategic recommendations
- Risk assessment
- Next steps

Return as JSON with keys: summary, findings, recommendations, risks, nextSteps`;

    const response = await spark.llm(prompt, 'gpt-4o-mini', true);
    return JSON.parse(response);
  };

  // Run entire workflow
  const runWorkflow = async (workflowId: string) => {
    const workflow = workflows?.find(w => w.id === workflowId);
    if (!workflow) return;

    setWorkflows(current =>
      (current || []).map(w =>
        w.id === workflowId
          ? { ...w, status: 'running', startTime: new Date().toISOString() }
          : w
      )
    );

    setActiveWorkflow(workflowId);

    // Execute nodes in dependency order
    const executeInOrder = async (nodes: WorkflowNode[]) => {
      for (const node of nodes) {
        // Check if dependencies are met
        const dependenciesMet = node.dependencies.every(depId =>
          workflow.nodes.find(n => n.id === depId)?.status === 'completed'
        );

        if (dependenciesMet && node.status === 'idle') {
          await executeNode(workflowId, node.id);
        }
      }
    };

    await executeInOrder(workflow.nodes);
  };

  // Get workflow status summary
  const getWorkflowSummary = (workflow: IntegratedWorkflow) => {
    const totalNodes = workflow.nodes.length;
    const completedNodes = workflow.nodes.filter(n => n.status === 'completed').length;
    const failedNodes = workflow.nodes.filter(n => n.status === 'failed').length;
    const runningNodes = workflow.nodes.filter(n => n.status === 'running').length;
    
    const overallProgress = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;

    return {
      totalNodes,
      completedNodes,
      failedNodes,
      runningNodes,
      overallProgress
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu size={24} className="text-primary" />
            {t('workflowEngine')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Оркестрация и автоматизация сложных аналитических процессов'
              : 'Orchestrate and automate complex analytical workflows'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                {(workflows || []).length} {language === 'ru' ? 'процессов' : 'workflows'}
              </Badge>
              <Badge variant="outline">
                {(workflows || []).filter(w => w.status === 'running').length} {language === 'ru' ? 'активных' : 'active'}
              </Badge>
              <Badge variant="default">
                {(workflows || []).filter(w => w.status === 'completed').length} {language === 'ru' ? 'завершенных' : 'completed'}
              </Badge>
            </div>
            
            <Button onClick={() => setIsCreatingWorkflow(true)}>
              <Plus size={16} className="mr-2" />
              {t('createWorkflow')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">{t('activeWorkflows')}</TabsTrigger>
          <TabsTrigger value="templates">{t('templates')}</TabsTrigger>
          <TabsTrigger value="history">{t('executionHistory')}</TabsTrigger>
        </TabsList>

        {/* Active Workflows */}
        <TabsContent value="active" className="space-y-4">
          {(workflows || []).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {language === 'ru' 
                    ? 'Нет активных процессов. Создайте процесс из шаблона.'
                    : 'No active workflows. Create a workflow from templates.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {(workflows || []).map(workflow => {
                const summary = getWorkflowSummary(workflow);
                return (
                  <Card key={workflow.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Graph size={20} />
                            {workflow.name}
                          </CardTitle>
                          <CardDescription>{workflow.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            workflow.status === 'completed' ? 'default' :
                            workflow.status === 'failed' ? 'destructive' :
                            workflow.status === 'running' ? 'secondary' : 'outline'
                          }>
                            {workflow.status}
                          </Badge>
                          {workflow.status === 'ready' && (
                            <Button onClick={() => runWorkflow(workflow.id)} size="sm">
                              <Play size={16} className="mr-2" />
                              {t('runWorkflow')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {summary.completedNodes} / {summary.totalNodes} {language === 'ru' ? 'узлов завершено' : 'nodes completed'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(summary.overallProgress)}% {language === 'ru' ? 'прогресс' : 'progress'}
                          </div>
                        </div>
                        
                        <Progress value={summary.overallProgress} className="w-full" />
                        
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                          {workflow.nodes.map(node => (
                            <div key={node.id} className="flex items-center gap-2 p-2 border rounded">
                              <div className={`w-2 h-2 rounded-full ${
                                node.status === 'completed' ? 'bg-green-500' :
                                node.status === 'running' ? 'bg-blue-500 animate-pulse' :
                                node.status === 'failed' ? 'bg-red-500' :
                                'bg-gray-300'
                              }`} />
                              <div className="text-xs">
                                <div className="font-medium">{node.name}</div>
                                <div className="text-muted-foreground">{node.progress}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {(templates || []).map(template => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} />
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{language === 'ru' ? 'Категория:' : 'Category:'}</span>
                      <Badge variant="outline">{t(template.category)}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{language === 'ru' ? 'Сложность:' : 'Complexity:'}</span>
                      <Badge variant={template.complexity === 'high' ? 'destructive' : 'secondary'}>
                        {template.complexity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{language === 'ru' ? 'Время:' : 'Time:'}</span>
                      <span className="text-muted-foreground">{template.estimatedTime} {language === 'ru' ? 'мин' : 'min'}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => createWorkflowFromTemplate(template.id)}
                    className="w-full mt-4"
                    variant="outline"
                  >
                    <Plus size={16} className="mr-2" />
                    {language === 'ru' ? 'Создать из шаблона' : 'Create from Template'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Execution History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                {t('executionHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {(executionLog || []).slice().reverse().map((entry, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 border rounded text-sm">
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {entry.nodeId}
                      </Badge>
                      <div className="flex-1">{entry.event}</div>
                      {entry.event === 'node-failed' && (
                        <Warning size={16} className="text-destructive" />
                      )}
                      {entry.event === 'node-completed' && (
                        <CheckCircle size={16} className="text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowIntegrationEngine;