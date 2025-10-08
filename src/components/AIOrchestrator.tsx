import React, { useState } from 'react';
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
import { toast } from 'sonner';
import {
  Brain,
  Robot,
  Cpu,
  Eye,
  PaperPlaneTilt,
  ListChecks,
  Plus,
  FileText,
  Graph,
  Target,
  Shield,
  Users,
  Play,
  Stop,
  CheckCircle
} from '@phosphor-icons/react';
import { axon } from '@/services/axonAdapter'

// Access spark runtime (provided by @github/spark)
const spark = (globalThis as any).spark;

interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  specialization: 'analysis' | 'research' | 'synthesis' | 'critique' | 'execution' | 'monitoring';
}

interface OrchestrationWorkflow {
  id: string;
  name: string;
  description: string;
  agents: string[];
  sequence: WorkflowStep[];
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  currentStep: number;
  results: Record<string, any>;
  startTime?: string;
  endTime?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface WorkflowStep {
  id: string;
  agentId: string;
  action: string;
  input: any;
  output?: any;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration?: number;
  retryCount: number;
  maxRetries: number;
}

// removed unused CognitiveCapability interface

interface AIOrchestrator {
  language: string;
  projectId: string;
  onWorkflowCompleted?: (workflow: OrchestrationWorkflow) => void;
  onAgentResponse?: (agentId: string, response: any) => void;
  onError?: (error: string) => void;
}

const AIOrchestrator: React.FC<AIOrchestrator> = ({
  language: _language,
  projectId,
  onWorkflowCompleted,
  onAgentResponse,
  onError
}) => {

  // State management
  const [agentTemplates] = useKV<AgentTemplate[]>('ai-orchestrator-agents', []);
  const [workflows, setWorkflows] = useKV<OrchestrationWorkflow[]>('ai-orchestrator-workflows', []);
  
  const [, setActiveWorkflow] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [workflowBuilder, setWorkflowBuilder] = useState<{
    name: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>({
    name: '',
    description: '',
    priority: 'medium'
  });
  const [, setIsCreatingWorkflow] = useState(false);
  const [orchestrationMode, setOrchestrationMode] = useState<'sequential' | 'parallel' | 'conditional'>('sequential');

  // removed unused default agent initialization (unreachable without setter)

  // Create a new orchestration workflow
  const createWorkflow = async () => {
    if (!workflowBuilder.name.trim()) {
      toast.error('Workflow name is required');
      return;
    }

    if (selectedAgents.length === 0) {
      toast.error('Select at least one agent for the workflow');
      return;
    }

    const newWorkflow: OrchestrationWorkflow = {
      id: `workflow-${Date.now()}`,
      name: workflowBuilder.name,
      description: workflowBuilder.description,
      agents: selectedAgents,
      sequence: generateWorkflowSteps(selectedAgents),
      status: 'idle',
      currentStep: 0,
      results: {},
      priority: workflowBuilder.priority
    };

    setWorkflows(current => [...(current || []), newWorkflow]);
    setIsCreatingWorkflow(false);
    setWorkflowBuilder({ name: '', description: '', priority: 'medium' });
    setSelectedAgents([]);
    
    toast.success(`Workflow "${newWorkflow.name}" created successfully`);
  };

  // Generate workflow steps based on selected agents and mode
  const generateWorkflowSteps = (agentIds: string[]): WorkflowStep[] => {
    const steps: WorkflowStep[] = [];
    
    agentIds.forEach((agentId, index) => {
      const agent = agentTemplates?.find(a => a.id === agentId);
      if (!agent) return;

      const step: WorkflowStep = {
        id: `step-${index + 1}`,
        agentId,
        action: getDefaultActionForAgent(agent),
        input: {},
        dependencies: orchestrationMode === 'sequential' && index > 0 ? [`step-${index}`] : [],
        status: 'pending',
        retryCount: 0,
        maxRetries: 2
      };

      steps.push(step);
    });

    return steps;
  };

  // Get default action for agent based on specialization
  const getDefaultActionForAgent = (agent: AgentTemplate): string => {
    switch (agent.specialization) {
      case 'analysis': return 'analyze-situation';
      case 'research': return 'gather-information';
      case 'synthesis': return 'synthesize-findings';
      case 'critique': return 'evaluate-analysis';
      case 'execution': return 'create-action-plan';
      case 'monitoring': return 'monitor-progress';
      default: return 'process-input';
    }
  };

  // Execute a workflow
  const executeWorkflow = async (workflowId: string) => {
    const workflow = workflows?.find(w => w.id === workflowId);
    if (!workflow) return;

    // Update workflow status
    setWorkflows(current => 
      (current || []).map(w => 
        w.id === workflowId 
          ? { ...w, status: 'running', startTime: new Date().toISOString(), currentStep: 0 }
          : w
      )
    );

    setActiveWorkflow(workflowId);
    toast.info(`Starting workflow: ${workflow.name}`);

    try {
      // Execute steps based on orchestration mode
      if (orchestrationMode === 'sequential') {
        await executeSequential(workflow);
      } else if (orchestrationMode === 'parallel') {
        await executeParallel(workflow);
      } else {
        await executeConditional(workflow);
      }

      // Mark workflow as completed
      setWorkflows(current => 
        (current || []).map(w => 
          w.id === workflowId 
            ? { ...w, status: 'completed', endTime: new Date().toISOString() }
            : w
        )
      );

      toast.success(`Workflow "${workflow.name}" completed successfully`);
      
      if (onWorkflowCompleted) {
        onWorkflowCompleted(workflow);
      }

    } catch (error) {
      console.error('Workflow execution error:', error);
      
      setWorkflows(current => 
        (current || []).map(w => 
          w.id === workflowId 
            ? { ...w, status: 'failed', endTime: new Date().toISOString() }
            : w
        )
      );

      toast.error(`Workflow "${workflow.name}" failed`);
      
      if (onError) {
        onError(`Workflow execution failed: ${error}`);
      }
    } finally {
      setActiveWorkflow(null);
    }
  };

  // Execute workflow steps sequentially
  const executeSequential = async (workflow: OrchestrationWorkflow) => {
    for (let i = 0; i < workflow.sequence.length; i++) {
      const step = workflow.sequence[i];
      await executeStep(workflow, step, i);
    }
  };

  // Execute workflow steps in parallel
  const executeParallel = async (workflow: OrchestrationWorkflow) => {
    const promises = workflow.sequence.map((step, index) => 
      executeStep(workflow, step, index)
    );
    await Promise.all(promises);
  };

  // Execute workflow with conditional logic
  const executeConditional = async (workflow: OrchestrationWorkflow) => {
    // Implement conditional execution logic based on step results
    for (let i = 0; i < workflow.sequence.length; i++) {
      const step = workflow.sequence[i];
      
      // Check dependencies
      const dependenciesMet = step.dependencies.every(depId => {
        const depStep = workflow.sequence.find(s => s.id === depId);
        return depStep?.status === 'completed';
      });

      if (dependenciesMet) {
        await executeStep(workflow, step, i);
      } else {
        // Mark as skipped if dependencies not met
        setWorkflows(current => 
          (current || []).map(w => 
            w.id === workflow.id 
              ? {
                  ...w,
                  sequence: w.sequence.map(s => 
                    s.id === step.id ? { ...s, status: 'skipped' } : s
                  )
                }
              : w
          )
        );
      }
    }
  };

  // Execute individual workflow step
  const executeStep = async (workflow: OrchestrationWorkflow, step: WorkflowStep, stepIndex: number) => {
    const agent = agentTemplates?.find(a => a.id === step.agentId);
    if (!agent) return;

    // Update step status to running
    setWorkflows(current => 
      (current || []).map(w => 
        w.id === workflow.id 
          ? {
              ...w,
              currentStep: stepIndex,
              sequence: w.sequence.map(s => 
                s.id === step.id ? { ...s, status: 'running' } : s
              )
            }
          : w
      )
    );

    const startTime = Date.now();

    try {
      // Prepare context for the agent
      const context = {
        workflow: workflow.name,
        step: step.action,
        previousResults: workflow.results,
        projectId: projectId
      };
      // Try AXON backend first, fallback to local spark
      let response: string
      try {
        const chat = await axon.chat({
          projectId,
          model: agent.model,
          messages: [
            { role: 'system', content: agent.systemPrompt },
            { role: 'user', content: `Current task: ${step.action}\nContext: ${JSON.stringify(context, null, 2)}\n\nPlease complete this task and provide a structured response.` },
          ],
        })
        response = chat.message.content
      } catch {
        const prompt = spark.llmPrompt`${agent.systemPrompt}

Current task: ${step.action}
Context: ${JSON.stringify(context, null, 2)}

Please complete this task according to your specialization and provide a structured response.`
        response = await spark.llm(prompt, agent.model)
      }

      const duration = Date.now() - startTime;

      // Update step with results
      setWorkflows(current => 
        (current || []).map(w => 
          w.id === workflow.id 
            ? {
                ...w,
                sequence: w.sequence.map(s => 
                  s.id === step.id ? { 
                    ...s, 
                    status: 'completed', 
                    output: response,
                    duration 
                  } : s
                ),
                results: {
                  ...w.results,
                  [step.id]: response
                }
              }
            : w
        )
      );

      if (onAgentResponse) {
        onAgentResponse(agent.id, response);
      }

  toast.success(`${agent.name} completed: ${step.action}`);

    } catch (error) {
      console.error(`Step execution error for ${agent.name}:`, error);
      
      // Handle retry logic
      if (step.retryCount < step.maxRetries) {
        step.retryCount++;
        toast.warning(`Retrying ${agent.name} (attempt ${step.retryCount + 1})`);
        await executeStep(workflow, step, stepIndex);
      } else {
        // Mark step as failed
        setWorkflows(current => 
          (current || []).map(w => 
            w.id === workflow.id 
              ? {
                  ...w,
                  sequence: w.sequence.map(s => 
                    s.id === step.id ? { ...s, status: 'failed' } : s
                  )
                }
              : w
          )
        );

        throw error;
      }
    }
  };

  // Stop a running workflow
  const stopWorkflow = (workflowId: string) => {
    setWorkflows(current => 
      (current || []).map(w => 
        w.id === workflowId 
          ? { ...w, status: 'paused', endTime: new Date().toISOString() }
          : w
      )
    );
    
    setActiveWorkflow(null);
    toast.info('Workflow stopped');
  };

  // Get workflow status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'paused': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  // Get agent specialization icon
  const getSpecializationIcon = (specialization: string) => {
    switch (specialization) {
      case 'analysis': return <Brain size={16} />;
      case 'research': return <FileText size={16} />;
      case 'synthesis': return <Graph size={16} />;
      case 'critique': return <Eye size={16} />;
      case 'execution': return <Target size={16} />;
      case 'monitoring': return <Shield size={16} />;
      default: return <Robot size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu size={24} className="text-primary" />
            AI Orchestrator
          </CardTitle>
          <CardDescription>
            Coordinate multiple AI agents for comprehensive intelligence analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="workflows" className="space-y-4">
            <TabsList>
              <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
              <TabsTrigger value="agents">Agent Management</TabsTrigger>
              <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
              <TabsTrigger value="monitor">System Monitor</TabsTrigger>
            </TabsList>

            {/* Active Workflows Tab */}
            <TabsContent value="workflows" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Workflows</h3>
                <Button onClick={() => setIsCreatingWorkflow(true)}>
                  <Plus size={16} className="mr-2" />
                  Create Workflow
                </Button>
              </div>

              <div className="grid gap-4">
                {(workflows || []).map(workflow => (
                  <Card key={workflow.id} className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={workflow.priority === 'critical' ? 'destructive' : 'secondary'}>
                            {workflow.priority}
                          </Badge>
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-muted-foreground" />
                          <span className="text-sm">{workflow.agents.length} agents</span>
                          <Separator orientation="vertical" className="h-4" />
                          <ListChecks size={16} className="text-muted-foreground" />
                          <span className="text-sm">{workflow.sequence.length} steps</span>
                        </div>

                        {workflow.status === 'running' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{workflow.currentStep + 1}/{workflow.sequence.length}</span>
                            </div>
                            <Progress 
                              value={(workflow.currentStep / workflow.sequence.length) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {workflow.status === 'idle' && (
                            <Button 
                              size="sm" 
                              onClick={() => executeWorkflow(workflow.id)}
                            >
                              <Play size={16} className="mr-1" />
                              Start
                            </Button>
                          )}
                          {workflow.status === 'running' && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => stopWorkflow(workflow.id)}
                            >
                              <Stop size={16} className="mr-1" />
                              Stop
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye size={16} className="mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!workflows || workflows.length === 0) && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Robot size={48} className="text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No workflows created</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Create your first AI orchestration workflow to coordinate multiple agents
                      </p>
                      <Button onClick={() => setIsCreatingWorkflow(true)}>
                        <Plus size={16} className="mr-2" />
                        Create Workflow
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Agent Management Tab */}
            <TabsContent value="agents" className="space-y-4">
              <h3 className="text-lg font-semibold">Available Agents</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                {(agentTemplates || []).map(agent => (
                  <Card key={agent.id} className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {getSpecializationIcon(agent.specialization)}
                        <h4 className="font-medium">{agent.name}</h4>
                        <Badge variant="outline">{agent.role}</Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {agent.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Cpu size={12} />
                          <span>{agent.model}</span>
                          <Separator orientation="vertical" className="h-3" />
                          <span>T: {agent.temperature}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.slice(0, 3).map(cap => (
                            <Badge key={cap} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.capabilities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Workflow Builder Tab */}
            <TabsContent value="builder" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Workflow Builder</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Basic Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="workflow-name">Workflow Name</Label>
                        <Input
                          id="workflow-name"
                          value={workflowBuilder.name}
                          onChange={(e) => setWorkflowBuilder(prev => ({
                            ...prev,
                            name: e.target.value
                          }))}
                          placeholder="Enter workflow name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="workflow-description">Description</Label>
                        <Textarea
                          id="workflow-description"
                          value={workflowBuilder.description}
                          onChange={(e) => setWorkflowBuilder(prev => ({
                            ...prev,
                            description: e.target.value
                          }))}
                          placeholder="Describe the workflow purpose"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="workflow-priority">Priority</Label>
                        <Select
                          value={workflowBuilder.priority}
                          onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                            setWorkflowBuilder(prev => ({ ...prev, priority: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="orchestration-mode">Orchestration Mode</Label>
                        <Select
                          value={orchestrationMode}
                          onValueChange={(value: 'sequential' | 'parallel' | 'conditional') => 
                            setOrchestrationMode(value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sequential">Sequential</SelectItem>
                            <SelectItem value="parallel">Parallel</SelectItem>
                            <SelectItem value="conditional">Conditional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Agent Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(agentTemplates || []).map(agent => (
                          <div key={agent.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`agent-${agent.id}`}
                              checked={selectedAgents.includes(agent.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAgents(prev => [...prev, agent.id]);
                                } else {
                                  setSelectedAgents(prev => prev.filter(id => id !== agent.id));
                                }
                              }}
                              className="rounded border border-border"
                            />
                            <Label 
                              htmlFor={`agent-${agent.id}`}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              {getSpecializationIcon(agent.specialization)}
                              <span>{agent.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {agent.specialization}
                              </Badge>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setWorkflowBuilder({ name: '', description: '', priority: 'medium' });
                    setSelectedAgents([]);
                  }}>
                    Reset
                  </Button>
                  <Button onClick={createWorkflow}>
                    <PaperPlaneTilt size={16} className="mr-2" />
                    Create Workflow
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* System Monitor Tab */}
            <TabsContent value="monitor" className="space-y-4">
              <h3 className="text-lg font-semibold">System Monitor</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Workflows</p>
                        <p className="text-2xl font-bold">
                          {(workflows || []).filter(w => w.status === 'running').length}
                        </p>
                      </div>
                      <Play size={20} className="text-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Agents</p>
                        <p className="text-2xl font-bold">{(agentTemplates || []).length}</p>
                      </div>
                      <Robot size={20} className="text-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completed Today</p>
                        <p className="text-2xl font-bold">
                          {(workflows || []).filter(w => 
                            w.status === 'completed' && 
                            w.endTime && 
                            new Date(w.endTime).toDateString() === new Date().toDateString()
                          ).length}
                        </p>
                      </div>
                      <CheckCircle size={20} className="text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {(workflows || [])
                        .filter(w => w.startTime)
                        .sort((a, b) => new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime())
                        .slice(0, 10)
                        .map(workflow => (
                          <div key={workflow.id} className="flex items-center justify-between p-2 rounded border">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                workflow.status === 'completed' ? 'bg-green-500' :
                                workflow.status === 'running' ? 'bg-blue-500' :
                                workflow.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                              }`} />
                              <span className="text-sm font-medium">{workflow.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {workflow.startTime && new Date(workflow.startTime).toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIOrchestrator;