import React, { useState, useEffect, useCallback } from 'react';
import { axon } from '@/services/axonAdapter';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Brain,
  Graph,
  Eye,
  Lightbulb,
  Play,
  ArrowRight,
  Plus,
  FloppyDisk
} from '@phosphor-icons/react';

// All heavy logic delegated to AXON backend via adapter

interface CognitiveFramework {
  id: string;
  name: string;
  description: string;
  methodology: string;
  dimensions: CognitiveDimension[];
  status: 'active' | 'inactive' | 'completed';
  lastUsed: string;
  effectiveness: number;
}

interface CognitiveDimension {
  id: string;
  name: string;
  question: string;
  analysisMethod: string;
  output: any;
  confidence: number;
  dependencies: string[];
  completeness: number;
}

interface AnalysisSession {
  id: string;
  frameworkId: string;
  title: string;
  description: string;
  status: 'planning' | 'analyzing' | 'synthesizing' | 'completed' | 'failed';
  currentDimension: number;
  results: Record<string, any>;
  insights: string[];
  recommendations: string[];
  startTime: string;
  endTime?: string;
  confidence: number;
}

interface CognitivePattern {
  id: string;
  name: string;
  pattern: string;
  frequency: number;
  context: string[];
  implications: string[];
  detectedIn: string[];
}

interface AdvancedCognitiveAnalysisProps {
  language: string;
  projectId: string;
  onAnalysisCompleted?: (session: AnalysisSession) => void;
  onPatternDetected?: (pattern: CognitivePattern) => void;
  onInsightGenerated?: (insight: string) => void;
}

const AdvancedCognitiveAnalysis: React.FC<AdvancedCognitiveAnalysisProps> = ({
  language,
  projectId,
  onAnalysisCompleted,
  onPatternDetected,
  onInsightGenerated
}) => {
  const _t = (key: string) => key; // Simplified translation function (unused for now)

  // State management
  const [frameworks, setFrameworks] = useKV<CognitiveFramework[]>('cognitive-frameworks', []);
  const [analysisSessions, setAnalysisSessions] = useKV<AnalysisSession[]>('analysis-sessions', []);
  const [cognitivePatterns, setCognitivePatterns] = useKV<CognitivePattern[]>('cognitive-patterns', []);
  
  const [_activeSession, setActiveSession] = useState<string | null>(null);
  const [sessionBuilder, setSessionBuilder] = useState({
    title: '',
    description: '',
    frameworkId: ''
  });
  const [_isCreatingSession, setIsCreatingSession] = useState(false);
  const [analysisDepth, setAnalysisDepth] = useState<'surface' | 'deep' | 'comprehensive'>('deep');

  const initializeDefaultFrameworks = useCallback(() => {
    const defaultFrameworks: CognitiveFramework[] = [
      {
        id: 'systems-thinking',
        name: 'Systems Thinking Analysis',
        description: 'Analyze complex systems and their interconnections',
        methodology: 'Systems dynamics and complexity theory',
        dimensions: [
          {
            id: 'system-structure',
            name: 'System Structure',
            question: 'What are the key components and their relationships?',
            analysisMethod: 'structural-mapping',
            output: null,
            confidence: 0,
            dependencies: [],
            completeness: 0
          },
          {
            id: 'feedback-loops',
            name: 'Feedback Loops',
            question: 'What reinforcing and balancing loops exist?',
            analysisMethod: 'loop-identification',
            output: null,
            confidence: 0,
            dependencies: ['system-structure'],
            completeness: 0
          },
          {
            id: 'emergence',
            name: 'Emergent Properties',
            question: 'What properties emerge from system interactions?',
            analysisMethod: 'emergence-analysis',
            output: null,
            confidence: 0,
            dependencies: ['system-structure', 'feedback-loops'],
            completeness: 0
          },
          {
            id: 'leverage-points',
            name: 'Leverage Points',
            question: 'Where can small changes create big impacts?',
            analysisMethod: 'leverage-identification',
            output: null,
            confidence: 0,
            dependencies: ['feedback-loops', 'emergence'],
            completeness: 0
          }
        ],
        status: 'active',
        lastUsed: new Date().toISOString(),
        effectiveness: 85
      },
      {
        id: 'cognitive-bias-analysis',
        name: 'Cognitive Bias Analysis',
        description: 'Identify and mitigate cognitive biases in analysis',
        methodology: 'Behavioral psychology and decision science',
        dimensions: [
          {
            id: 'confirmation-bias',
            name: 'Confirmation Bias',
            question: 'Are we seeking information that confirms existing beliefs?',
            analysisMethod: 'bias-detection',
            output: null,
            confidence: 0,
            dependencies: [],
            completeness: 0
          },
          {
            id: 'anchoring-bias',
            name: 'Anchoring Bias',
            question: 'Are initial assumptions overly influencing analysis?',
            analysisMethod: 'anchor-identification',
            output: null,
            confidence: 0,
            dependencies: [],
            completeness: 0
          },
          {
            id: 'availability-heuristic',
            name: 'Availability Heuristic',
            question: 'Are recent or memorable events biasing probability estimates?',
            analysisMethod: 'availability-assessment',
            output: null,
            confidence: 0,
            dependencies: [],
            completeness: 0
          },
          {
            id: 'groupthink',
            name: 'Groupthink',
            question: 'Is group harmony suppressing critical evaluation?',
            analysisMethod: 'group-dynamics-analysis',
            output: null,
            confidence: 0,
            dependencies: ['confirmation-bias'],
            completeness: 0
          }
        ],
        status: 'active',
        lastUsed: new Date().toISOString(),
        effectiveness: 92
      },
      {
        id: 'scenario-analysis',
        name: 'Scenario Analysis Framework',
        description: 'Explore multiple future scenarios and their implications',
        methodology: 'Scenario planning and futures thinking',
        dimensions: [
          {
            id: 'driving-forces',
            name: 'Driving Forces',
            question: 'What are the key forces shaping future outcomes?',
            analysisMethod: 'force-identification',
            output: null,
            confidence: 0,
            dependencies: [],
            completeness: 0
          },
          {
            id: 'scenario-construction',
            name: 'Scenario Construction',
            question: 'What are the plausible future scenarios?',
            analysisMethod: 'scenario-building',
            output: null,
            confidence: 0,
            dependencies: ['driving-forces'],
            completeness: 0
          },
          {
            id: 'impact-assessment',
            name: 'Impact Assessment',
            question: 'What are the potential impacts of each scenario?',
            analysisMethod: 'impact-analysis',
            output: null,
            confidence: 0,
            dependencies: ['scenario-construction'],
            completeness: 0
          },
          {
            id: 'strategic-implications',
            name: 'Strategic Implications',
            question: 'What strategies work across multiple scenarios?',
            analysisMethod: 'strategy-synthesis',
            output: null,
            confidence: 0,
            dependencies: ['impact-assessment'],
            completeness: 0
          }
        ],
        status: 'active',
        lastUsed: new Date().toISOString(),
        effectiveness: 88
      }
    ];

    setFrameworks(defaultFrameworks);
  }, [setFrameworks]);

  // Initialize default cognitive frameworks
  useEffect(() => {
    if (!frameworks || frameworks.length === 0) {
      initializeDefaultFrameworks();
    }
  }, [frameworks, initializeDefaultFrameworks]);

  // Create a new analysis session
  const createAnalysisSession = async () => {
    if (!sessionBuilder.title.trim()) {
      toast.error('Session title is required');
      return;
    }
    if (!sessionBuilder.frameworkId) {
      toast.error('Please select a cognitive framework');
      return;
    }

    const framework = frameworks?.find(f => f.id === sessionBuilder.frameworkId);
    if (!framework) {
      toast.error('Selected framework not found');
      return;
    }

    const newSession: AnalysisSession = {
      id: `session-${Date.now()}`,
      frameworkId: sessionBuilder.frameworkId,
      title: sessionBuilder.title,
      description: sessionBuilder.description,
      status: 'planning',
      currentDimension: 0,
      results: {},
      insights: [],
      recommendations: [],
      startTime: new Date().toISOString(),
      confidence: 0
    };

    setAnalysisSessions(current => [...(current || []), newSession]);
    setActiveSession(newSession.id);
    setIsCreatingSession(false);
    setSessionBuilder({ title: '', description: '', frameworkId: '' });
    
    toast.success(`Analysis session "${newSession.title}" created`);
  };

  // Start analysis for a session
  const startAnalysis = async (sessionId: string) => {
    const session = analysisSessions?.find(s => s.id === sessionId);
    if (!session) return;

    const framework = frameworks?.find(f => f.id === session.frameworkId);
    if (!framework) return;

    // Update session status
    setAnalysisSessions(current => 
      (current || []).map(s => 
        s.id === sessionId 
          ? { ...s, status: 'analyzing', currentDimension: 0 }
          : s
      )
    );

    toast.info(`Starting analysis: ${session.title}`);

    try {
      // Process each dimension
      for (let i = 0; i < framework.dimensions.length; i++) {
        const dimension = framework.dimensions[i];
        
        // Check dependencies
        const dependenciesMet = dimension.dependencies.every(depId => {
          const depDimension = framework.dimensions.find(d => d.id === depId);
          return depDimension && session.results[depId];
        });

        if (!dependenciesMet && dimension.dependencies.length > 0) {
          toast.warning(`Skipping ${dimension.name} - dependencies not met`);
          continue;
        }

        // Update current dimension
        setAnalysisSessions(current => 
          (current || []).map(s => 
            s.id === sessionId 
              ? { ...s, currentDimension: i }
              : s
          )
        );

        // Process dimension
        await processDimension(sessionId, dimension, framework, analysisDepth);
      }

      // Generate synthesis
      await generateSynthesis(sessionId);

      // Mark as completed
      setAnalysisSessions(current => 
        (current || []).map(s => 
          s.id === sessionId 
            ? { 
                ...s, 
                status: 'completed', 
                endTime: new Date().toISOString(),
                confidence: calculateSessionConfidence(s)
              }
            : s
        )
      );

      const completedSession = analysisSessions?.find(s => s.id === sessionId);
      if (completedSession && onAnalysisCompleted) {
        onAnalysisCompleted(completedSession);
      }

      toast.success(`Analysis completed: ${session.title}`);

    } catch (error) {
      console.error('Analysis error:', error);
      
      setAnalysisSessions(current => 
        (current || []).map(s => 
          s.id === sessionId 
            ? { ...s, status: 'failed', endTime: new Date().toISOString() }
            : s
        )
      );

      toast.error(`Analysis failed: ${session.title}`);
    }
  };

  // Process individual dimension
  const processDimension = async (
    sessionId: string, 
    dimension: CognitiveDimension, 
    framework: CognitiveFramework,
    depth: string
  ) => {
    const session = analysisSessions?.find(s => s.id === sessionId);
    if (!session) return;

    const contextualData = {
      framework: framework.name,
      methodology: framework.methodology,
      dimension: dimension.name,
      question: dimension.question,
      analysisMethod: dimension.analysisMethod,
      previousResults: session.results,
      analysisDepth: depth,
      projectContext: projectId
    };

    const prompt = [
      'You are an expert cognitive analyst using advanced analytical frameworks.',
      '',
      `Framework: ${framework.name}`,
      `Methodology: ${framework.methodology}`,
      `Current Dimension: ${dimension.name}`,
      '',
      `Question to analyze: ${dimension.question}`,
      `Analysis Method: ${dimension.analysisMethod}`,
      `Analysis Depth: ${depth}`,
      '',
      `Context: ${JSON.stringify(contextualData, null, 2)}`,
      '',
      'Please provide a comprehensive analysis for this dimension. Structure your response as JSON with the following format:',
      '{',
      '  "analysis": "detailed analysis response",',
      '  "key_findings": ["finding 1", "finding 2", "finding 3"],',
      '  "confidence": 85,',
      '  "patterns": ["pattern 1", "pattern 2"],',
      '  "implications": ["implication 1", "implication 2"],',
      '  "next_steps": ["step 1", "step 2"]',
      '}'
    ].join('\n');

    try {
      const res = await axon.analyze({ projectId, prompt, mode: 'general', language: (language === 'ru' ? 'ru' : 'en') });
      const result = safeParseJSON(res.content);

      // Update session with dimension results
      setAnalysisSessions(current => 
        (current || []).map(s => 
          s.id === sessionId 
            ? {
                ...s,
                results: {
                  ...s.results,
                  [dimension.id]: result
                }
              }
            : s
        )
      );

      // Check for patterns
      if (result.patterns && result.patterns.length > 0) {
        await detectCognitivePatterns(result.patterns, sessionId);
      }

      toast.info(`Completed: ${dimension.name}`);

    } catch (error) {
      console.error(`Error processing dimension ${dimension.name}:`, error);
      throw error;
    }
  };

  // Generate synthesis from all dimensions
  const generateSynthesis = async (sessionId: string) => {
    const session = analysisSessions?.find(s => s.id === sessionId);
    if (!session) return;

    const framework = frameworks?.find(f => f.id === session.frameworkId);
    if (!framework) return;

    const synthesisPrompt = [
      'You are a master analyst synthesizing complex cognitive analysis results.',
      '',
      `Framework: ${framework.name}`,
      `Analysis Results: ${JSON.stringify(session.results, null, 2)}`,
      '',
      'Please synthesize these findings into:',
      '1. Key insights that emerge from the analysis',
      '2. Strategic recommendations',
      '3. Areas requiring further investigation',
      '4. Overall confidence assessment',
      '',
      'Provide response as JSON:',
      '{',
      '  "insights": ["insight 1", "insight 2", "insight 3"],',
      '  "recommendations": ["recommendation 1", "recommendation 2"],',
      '  "further_investigation": ["area 1", "area 2"],',
      '  "overall_confidence": 88,',
      '  "synthesis_summary": "comprehensive summary"',
      '}'
    ].join('\n');

    try {
  const res = await axon.analyze({ projectId, prompt: synthesisPrompt, mode: 'general', language: (language === 'ru' ? 'ru' : 'en') });
  const synthesis = safeParseJSON(res.content);

      // Update session with synthesis
      setAnalysisSessions(current => 
        (current || []).map(s => 
          s.id === sessionId 
            ? {
                ...s,
                status: 'synthesizing',
                insights: synthesis.insights || [],
                recommendations: synthesis.recommendations || [],
                confidence: synthesis.overall_confidence || 0
              }
            : s
        )
      );

      // Notify insights
      if (synthesis.insights && onInsightGenerated) {
        synthesis.insights.forEach((insight: string) => {
          onInsightGenerated(insight);
        });
      }

    } catch (error) {
      console.error('Synthesis error:', error);
      throw error;
    }
  };

  // Detect cognitive patterns
  const detectCognitivePatterns = async (patterns: string[], sessionId: string) => {
    patterns.forEach(patternText => {
      const existingPattern = cognitivePatterns?.find(p => 
        p.pattern.toLowerCase().includes(patternText.toLowerCase())
      );

      if (existingPattern) {
        // Update frequency
        setCognitivePatterns(current => 
          (current || []).map(p => 
            p.id === existingPattern.id 
              ? { 
                  ...p, 
                  frequency: p.frequency + 1,
                  detectedIn: [...p.detectedIn, sessionId]
                }
              : p
          )
        );
      } else {
        // Create new pattern
        const newPattern: CognitivePattern = {
          id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: patternText.substring(0, 50),
          pattern: patternText,
          frequency: 1,
          context: [projectId],
          implications: [],
          detectedIn: [sessionId]
        };

        setCognitivePatterns(current => [...(current || []), newPattern]);
        
        if (onPatternDetected) {
          onPatternDetected(newPattern);
        }
      }
    });
  };

  // Calculate session confidence
  const calculateSessionConfidence = (session: AnalysisSession): number => {
    const results = Object.values(session.results);
    if (results.length === 0) return 0;
    
    const confidenceSum = results.reduce((sum, result: any) => 
      sum + (result.confidence || 0), 0
    );
    
    return Math.round(confidenceSum / results.length);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzing': return 'text-blue-500';
      case 'synthesizing': return 'text-purple-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={24} className="text-primary" />
            Advanced Cognitive Analysis
          </CardTitle>
          <CardDescription>
            Apply sophisticated cognitive frameworks for deep analytical insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sessions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sessions">Analysis Sessions</TabsTrigger>
              <TabsTrigger value="frameworks">Cognitive Frameworks</TabsTrigger>
              <TabsTrigger value="patterns">Pattern Detection</TabsTrigger>
              <TabsTrigger value="builder">Session Builder</TabsTrigger>
            </TabsList>

            {/* Analysis Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Analysis Sessions</h3>
                <Button onClick={() => setIsCreatingSession(true)}>
                  <Plus size={16} className="mr-2" />
                  New Session
                </Button>
              </div>

              <div className="grid gap-4">
                {(analysisSessions || []).map(session => {
                  const framework = frameworks?.find(f => f.id === session.frameworkId);
                  return (
                    <Card key={session.id} className="cyber-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{session.title}</h4>
                            <p className="text-sm text-muted-foreground">{session.description}</p>
                            {framework && (
                              <p className="text-xs text-muted-foreground">
                                Framework: {framework.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                            {session.confidence > 0 && (
                              <Badge variant="outline">
                                {session.confidence}% confidence
                              </Badge>
                            )}
                          </div>
                        </div>

                        {session.status === 'analyzing' && framework && (
                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{session.currentDimension + 1}/{framework.dimensions.length}</span>
                            </div>
                            <Progress 
                              value={(session.currentDimension / framework.dimensions.length) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}

                        {session.insights.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Key Insights:</p>
                            <ul className="text-sm space-y-1">
                              {session.insights.slice(0, 2).map((insight, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Lightbulb size={12} className="text-accent mt-0.5 flex-shrink-0" />
                                  <span>{insight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {session.status === 'planning' && (
                            <Button 
                              size="sm" 
                              onClick={() => startAnalysis(session.id)}
                            >
                              <Play size={16} className="mr-1" />
                              Start Analysis
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye size={16} className="mr-1" />
                            View Details
                          </Button>
                          {session.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              <FloppyDisk size={16} className="mr-1" />
                              Export Results
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {(!analysisSessions || analysisSessions.length === 0) && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Brain size={48} className="text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No analysis sessions</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Create your first cognitive analysis session to begin deep analytical insights
                      </p>
                      <Button onClick={() => setIsCreatingSession(true)}>
                        <Plus size={16} className="mr-2" />
                        Create Session
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Cognitive Frameworks Tab */}
            <TabsContent value="frameworks" className="space-y-4">
              <h3 className="text-lg font-semibold">Available Cognitive Frameworks</h3>
              
              <div className="grid gap-4">
                {(frameworks || []).map(framework => (
                  <Card key={framework.id} className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{framework.name}</h4>
                          <p className="text-sm text-muted-foreground">{framework.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Methodology: {framework.methodology}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={framework.status === 'active' ? 'default' : 'secondary'}>
                            {framework.status}
                          </Badge>
                          <Badge variant="outline">
                            {framework.effectiveness}% effective
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Dimensions ({framework.dimensions.length}):
                        </p>
                        <div className="grid gap-2 md:grid-cols-2">
                          {framework.dimensions.map(dimension => (
                            <div key={dimension.id} className="p-2 border rounded text-sm">
                              <div className="font-medium">{dimension.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {dimension.question}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Pattern Detection Tab */}
            <TabsContent value="patterns" className="space-y-4">
              <h3 className="text-lg font-semibold">Detected Cognitive Patterns</h3>
              
              <div className="grid gap-4">
                {(cognitivePatterns || []).map(pattern => (
                  <Card key={pattern.id} className="cyber-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{pattern.name}</h4>
                          <p className="text-sm text-muted-foreground">{pattern.pattern}</p>
                        </div>
                        <Badge variant="outline">
                          Frequency: {pattern.frequency}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {pattern.context.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Context:</p>
                            <div className="flex flex-wrap gap-1">
                              {pattern.context.map((ctx, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {ctx}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {pattern.implications.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Implications:</p>
                            <ul className="text-xs space-y-1">
                              {pattern.implications.map((implication, i) => (
                                <li key={i} className="flex items-start gap-1">
                                  <ArrowRight size={10} className="mt-0.5 flex-shrink-0" />
                                  <span>{implication}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {(!cognitivePatterns || cognitivePatterns.length === 0) && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Graph size={48} className="text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No patterns detected</h3>
                      <p className="text-muted-foreground text-center">
                        Patterns will be automatically detected as you run cognitive analyses
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Session Builder Tab */}
            <TabsContent value="builder" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Create Analysis Session</h3>
                
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="session-title">Session Title</Label>
                      <Input
                        id="session-title"
                        value={sessionBuilder.title}
                        onChange={(e) => setSessionBuilder(prev => ({
                          ...prev,
                          title: e.target.value
                        }))}
                        placeholder="Enter analysis session title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="session-description">Description</Label>
                      <Textarea
                        id="session-description"
                        value={sessionBuilder.description}
                        onChange={(e) => setSessionBuilder(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                        placeholder="Describe what you want to analyze"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="framework-selection">Cognitive Framework</Label>
                      <Select
                        value={sessionBuilder.frameworkId}
                        onValueChange={(value) => setSessionBuilder(prev => ({
                          ...prev,
                          frameworkId: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a cognitive framework" />
                        </SelectTrigger>
                        <SelectContent>
                          {(frameworks || []).map(framework => (
                            <SelectItem key={framework.id} value={framework.id}>
                              <div className="flex items-center gap-2">
                                <Brain size={16} />
                                <div>
                                  <div>{framework.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {framework.effectiveness}% effectiveness
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="analysis-depth">Analysis Depth</Label>
                      <Select
                        value={analysisDepth}
                        onValueChange={(value: 'surface' | 'deep' | 'comprehensive') => 
                          setAnalysisDepth(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="surface">Surface Analysis</SelectItem>
                          <SelectItem value="deep">Deep Analysis</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {
                        setSessionBuilder({ title: '', description: '', frameworkId: '' });
                      }}>
                        Reset
                      </Button>
                      <Button onClick={createAnalysisSession}>
                        <Plus size={16} className="mr-2" />
                        Create Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedCognitiveAnalysis;

// Local util: parse JSON or fallback to object with content
function safeParseJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return { content: text };
  }
}