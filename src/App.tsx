import React, { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Brain,
  Users,
  FileText,
  Calendar,
  MapPin,
  Lightbulb,
  Gear,
  FloppyDisk,
  Eye,
  Download,
  Plus,
  ChartLine,
  Graph,
  Target,
  ArrowRight,
  CheckCircle,
  Warning,
  Star
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

// Access spark from global window object
const spark = (globalThis as any).spark;

// Type definitions for analysis structure
interface KiplingDimension {
  id: string;
  title: string;
  question: string;
  content: string;
  insights: string[];
  priority: 'high' | 'medium' | 'low';
  completeness: number;
  icon: React.ReactNode;
}

interface AnalysisProject {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  lastModified: string;
  completeness: number;
  dimensions: KiplingDimension[];
  ikrDirective: {
    intelligence: string;
    knowledge: string;
    reasoning: string;
  };
}

function App() {
  // Persistent storage for analysis projects
  const [projects, setProjects] = useKV<AnalysisProject[]>('axon-projects', []);
  const [currentProject, setCurrentProject] = useKV<string | null>('current-project', null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Get current project data
  const project = projects?.find(p => p.id === currentProject);

  // Initialize default Kipling dimensions
  const defaultDimensions: KiplingDimension[] = [
    {
      id: 'who',
      title: 'Who',
      question: 'Who are the key stakeholders, actors, and decision-makers involved?',
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0,
      icon: <Users size={20} />
    },
    {
      id: 'what',
      title: 'What',
      question: 'What is happening, what are the core issues, and what needs to be addressed?',
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0,
      icon: <FileText size={20} />
    },
    {
      id: 'when',
      title: 'When',
      question: 'When did this occur, when must decisions be made, and what are the timelines?',
      content: '',
      insights: [],
      priority: 'medium',
      completeness: 0,
      icon: <Calendar size={20} />
    },
    {
      id: 'where',
      title: 'Where',
      question: 'Where is this taking place, what are the geographical or contextual locations?',
      content: '',
      insights: [],
      priority: 'medium',
      completeness: 0,
      icon: <MapPin size={20} />
    },
    {
      id: 'why',
      title: 'Why',
      question: 'Why is this happening, what are the underlying causes and motivations?',
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0,
      icon: <Lightbulb size={20} />
    },
    {
      id: 'how',
      title: 'How',
      question: 'How is this being executed, what are the methods and mechanisms?',
      content: '',
      insights: [],
      priority: 'high',
      completeness: 0,
      icon: <Gear size={20} />
    }
  ];

  // Create new analysis project
  const createProject = () => {
    if (!newProjectTitle.trim()) {
      toast.error('Project title is required');
      return;
    }

    const newProject: AnalysisProject = {
      id: Date.now().toString(),
      title: newProjectTitle,
      description: newProjectDescription,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      completeness: 0,
      dimensions: defaultDimensions,
      ikrDirective: {
        intelligence: '',
        knowledge: '',
        reasoning: ''
      }
    };

    setProjects(current => [...(current || []), newProject]);
    setCurrentProject(newProject.id);
    setNewProjectTitle('');
    setNewProjectDescription('');
    setIsCreatingProject(false);
    toast.success('Analysis project created successfully');
  };

  // Update dimension content
  const updateDimension = (dimensionId: string, field: keyof KiplingDimension, value: any) => {
    if (!project) return;

    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              lastModified: new Date().toISOString(),
              dimensions: p.dimensions.map(d => 
                d.id === dimensionId 
                  ? { 
                      ...d, 
                      [field]: value,
                      completeness: field === 'content' ? Math.min(100, (value as string).length / 10) : d.completeness
                    }
                  : d
              )
            }
          : p
      )
    );
  };

  // Update IKR directive
  const updateIKR = (field: keyof AnalysisProject['ikrDirective'], value: string) => {
    if (!project) return;

    setProjects(current => 
      (current || []).map(p => 
        p.id === project.id 
          ? {
              ...p,
              lastModified: new Date().toISOString(),
              ikrDirective: { ...p.ikrDirective, [field]: value }
            }
          : p
      )
    );
  };

  // Calculate overall project completeness
  const calculateCompleteness = (proj: AnalysisProject) => {
    const dimensionCompleteness = proj.dimensions.reduce((sum, d) => sum + d.completeness, 0) / proj.dimensions.length;
    const ikrCompleteness = Object.values(proj.ikrDirective).reduce((sum, value) => 
      sum + (value.length > 50 ? 100 : value.length * 2), 0
    ) / 3;
    return Math.round((dimensionCompleteness + ikrCompleteness) / 2);
  };

  // Generate insights using LLM
  const generateInsights = async (dimensionId: string) => {
    if (!project) return;
    
    const dimension = project.dimensions.find(d => d.id === dimensionId);
    if (!dimension || !dimension.content) {
      toast.error('Add content first before generating insights');
      return;
    }

    try {
      const prompt = spark.llmPrompt`Based on this ${dimension.title} analysis: "${dimension.content}", generate 3-5 key insights or action items. Focus on actionable intelligence that follows the IKR directive. Return as a JSON object with a single property called "insights" containing an array of insight strings.`;
      
      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const result = JSON.parse(response);
      
      updateDimension(dimensionId, 'insights', result.insights || []);
      toast.success('Insights generated successfully');
    } catch (error) {
      toast.error('Failed to generate insights');
      console.error('Error generating insights:', error);
    }
  };

  // Export analysis report
  const exportReport = async () => {
    if (!project) return;

    const reportData = {
      project: project.title,
      completeness: calculateCompleteness(project),
      timestamp: new Date().toISOString(),
      ikrDirective: project.ikrDirective,
      kiplingAnalysis: project.dimensions.map(d => ({
        dimension: d.title,
        question: d.question,
        analysis: d.content,
        insights: d.insights,
        priority: d.priority
      }))
    };

    // Create downloadable JSON file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axon-analysis-${project.title.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analysis report exported');
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain size={32} className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">AXON</h1>
                <p className="text-sm text-muted-foreground">Intelligence Analysis Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {project && (
                <>
                  <Badge variant="secondary" className="text-xs">
                    {calculateCompleteness(project)}% Complete
                  </Badge>
                  <Button onClick={exportReport} variant="outline" size="sm">
                    <Download size={16} className="mr-2" />
                    Export
                  </Button>
                </>
              )}
              
              <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus size={16} className="mr-2" />
                    New Analysis
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Analysis Project</DialogTitle>
                    <DialogDescription>
                      Start a new systematic analysis using the IKR directive and Kipling protocol
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Project Title</Label>
                      <Input
                        id="title"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder="Enter analysis project title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        placeholder="Brief description of what you're analyzing"
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreatingProject(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createProject}>Create Project</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {!project ? (
          // Project Selection Screen
          <div className="text-center py-12">
            <ChartLine size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Welcome to AXON</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Begin your systematic intelligence analysis using the IKR directive and Kipling protocol framework
            </p>
            
            {(projects || []).length > 0 && (
              <div className="max-w-2xl mx-auto mb-8">
                <h3 className="text-lg font-medium mb-4">Recent Projects</h3>
                <div className="grid gap-3">
                  {(projects || []).map(proj => (
                    <Card key={proj.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setCurrentProject(proj.id)}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="text-left">
                          <h4 className="font-medium">{proj.title}</h4>
                          <p className="text-sm text-muted-foreground">{proj.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={calculateCompleteness(proj)} className="w-20" />
                          <ArrowRight size={20} className="text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            <Button onClick={() => setIsCreatingProject(true)} size="lg">
              <Plus size={20} className="mr-2" />
              Create New Analysis
            </Button>
          </div>
        ) : (
          // Analysis Interface
          <div className="space-y-6">
            {/* Project Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">{project.title}</h2>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={calculateCompleteness(project)} className="w-32" />
                <Badge variant={calculateCompleteness(project) > 80 ? 'default' : 'secondary'}>
                  {calculateCompleteness(project)}% Complete
                </Badge>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Analysis Overview</TabsTrigger>
                <TabsTrigger value="kipling">Kipling Protocol</TabsTrigger>
                <TabsTrigger value="ikr">IKR Directive</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {project.dimensions.map(dimension => (
                    <Card key={dimension.id} className="kipling-dimension">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {dimension.icon}
                            <CardTitle className="text-lg">{dimension.title}</CardTitle>
                          </div>
                          <Badge variant={dimension.priority === 'high' ? 'default' : 'secondary'}>
                            {dimension.priority}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {dimension.question}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Progress value={dimension.completeness} className="h-1" />
                          <p className="text-sm text-muted-foreground">
                            {dimension.content ? 
                              `${dimension.content.substring(0, 100)}${dimension.content.length > 100 ? '...' : ''}` :
                              'No analysis content yet'
                            }
                          </p>
                          {dimension.insights.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-accent">Key Insights:</p>
                              <ul className="text-xs space-y-1">
                                {dimension.insights.slice(0, 2).map((insight, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <Star size={12} className="text-accent mt-0.5 flex-shrink-0" />
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Kipling Protocol Tab */}
              <TabsContent value="kipling" className="space-y-6">
                <div className="grid gap-6">
                  {project.dimensions.map(dimension => (
                    <Card key={dimension.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          {dimension.icon}
                          <div>
                            <CardTitle className="text-xl">{dimension.title}</CardTitle>
                            <CardDescription>{dimension.question}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor={`content-${dimension.id}`}>Analysis Content</Label>
                          <Textarea
                            id={`content-${dimension.id}`}
                            value={dimension.content}
                            onChange={(e) => updateDimension(dimension.id, 'content', e.target.value)}
                            placeholder={`Provide detailed analysis for: ${dimension.question}`}
                            rows={6}
                            className="mt-2"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Progress value={dimension.completeness} className="w-32" />
                            <span className="text-sm text-muted-foreground">
                              {Math.round(dimension.completeness)}% complete
                            </span>
                          </div>
                          <Button 
                            onClick={() => generateInsights(dimension.id)}
                            variant="outline" 
                            size="sm"
                            disabled={!dimension.content}
                          >
                            <Brain size={16} className="mr-2" />
                            Generate Insights
                          </Button>
                        </div>

                        {dimension.insights.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Star size={16} className="text-accent" />
                                Generated Insights
                              </h4>
                              <ul className="space-y-2">
                                {dimension.insights.map((insight, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* IKR Directive Tab */}
              <TabsContent value="ikr" className="space-y-6">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target size={24} className="text-primary" />
                        Intelligence Collection & Assessment
                      </CardTitle>
                      <CardDescription>
                        Document the intelligence gathering process and raw information collected
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={project.ikrDirective.intelligence}
                        onChange={(e) => updateIKR('intelligence', e.target.value)}
                        placeholder="Describe intelligence sources, collection methods, and raw data gathered. Include credibility assessments and information gaps."
                        rows={6}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Graph size={24} className="text-primary" />
                        Knowledge Synthesis & Integration
                      </CardTitle>
                      <CardDescription>
                        Synthesize information into coherent knowledge patterns and relationships
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={project.ikrDirective.knowledge}
                        onChange={(e) => updateIKR('knowledge', e.target.value)}
                        placeholder="Synthesize patterns, connections, and relationships from the intelligence. Identify what we now know that we didn't know before."
                        rows={6}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb size={24} className="text-primary" />
                        Reasoning & Strategic Assessment
                      </CardTitle>
                      <CardDescription>
                        Apply analytical reasoning to derive strategic insights and recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={project.ikrDirective.reasoning}
                        onChange={(e) => updateIKR('reasoning', e.target.value)}
                        placeholder="Apply logical reasoning to the knowledge base. What are the implications, predictions, and recommended actions?"
                        rows={6}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => setCurrentProject(null)}>
                <ArrowRight size={16} className="mr-2 rotate-180" />
                Back to Projects
              </Button>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={exportReport}>
                  <Download size={16} className="mr-2" />
                  Export Report
                </Button>
                <Button onClick={() => toast.success('Analysis saved automatically')}>
                  <FloppyDisk size={16} className="mr-2" />
                  Save Progress
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;