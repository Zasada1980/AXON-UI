import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Stop, 
  CheckCircle, 
  Warning, 
  Clock,
  Eye,
  Bug,
  ArrowsCounterClockwise,
  TrendUp,
  FileText
} from '@phosphor-icons/react';
import { toast } from 'sonner';

type Language = 'en' | 'ru';

interface E2ETestCase {
  id: string;
  name: string;
  description: string;
  type: 'integration' | 'regression' | 'performance' | 'user-flow' | 'security' | 'accessibility';
  steps: TestStep[];
  expectedResults: string[];
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  lastRun?: string;
  executionTime?: number;
  errorMessage?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  coverage: {
    modules: string[];
    features: string[];
    percentage: number;
  };
  dependencies: string[];
  environment: 'development' | 'staging' | 'production';
  retryCount: number;
  flakiness: number; // percentage indicating test stability
}

interface TestStep {
  id: string;
  action: string;
  target: string;
  value?: string;
  expected: string;
  actual?: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCases: string[]; // Test case IDs
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  results: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  startTime?: string;
  endTime?: string;
  duration?: number;
}

interface E2ETestingSystemProps {
  language: Language;
  projectId: string;
  onTestCompleted?: (testCase: E2ETestCase) => void;
  onSuiteCompleted?: (suite: TestSuite) => void;
  onIssueDetected?: (issue: { test: string; error: string; severity: string }) => void;
}

const translations = {
  // Main titles
  e2eTestingSystem: { en: 'E2E Testing System', ru: 'Система E2E Тестирования' },
  automatedTesting: { en: 'Automated Testing', ru: 'Автоматизированное Тестирование' },
  testSuites: { en: 'Test Suites', ru: 'Наборы Тестов' },
  testCases: { en: 'Test Cases', ru: 'Тест-кейсы' },
  testResults: { en: 'Test Results', ru: 'Результаты Тестов' },
  
  // Test types
  integration: { en: 'Integration', ru: 'Интеграция' },
  regression: { en: 'Regression', ru: 'Регрессия' },
  performance: { en: 'Performance', ru: 'Производительность' },
  userFlow: { en: 'User Flow', ru: 'Пользовательский Поток' },
  
  // Actions
  createTestCase: { en: 'Create Test Case', ru: 'Создать Тест-кейс' },
  createTestSuite: { en: 'Create Test Suite', ru: 'Создать Набор Тестов' },
  runTests: { en: 'Run Tests', ru: 'Запустить Тесты' },
  runSuite: { en: 'Run Suite', ru: 'Запустить Набор' },
  stopTests: { en: 'Stop Tests', ru: 'Остановить Тесты' },
  viewResults: { en: 'View Results', ru: 'Просмотр Результатов' },
  generateReport: { en: 'Generate Report', ru: 'Создать Отчет' },
  
  // Status
  pending: { en: 'Pending', ru: 'Ожидает' },
  running: { en: 'Running', ru: 'Выполняется' },
  passed: { en: 'Passed', ru: 'Пройден' },
  failed: { en: 'Failed', ru: 'Провален' },
  skipped: { en: 'Skipped', ru: 'Пропущен' },
  idle: { en: 'Idle', ru: 'Ожидание' },
  completed: { en: 'Completed', ru: 'Завершен' },
  
  // Priority
  low: { en: 'Low', ru: 'Низкий' },
  medium: { en: 'Medium', ru: 'Средний' },
  high: { en: 'High', ru: 'Высокий' },
  critical: { en: 'Critical', ru: 'Критический' },
  
  // Form fields
  testName: { en: 'Test Name', ru: 'Название Теста' },
  testDescription: { en: 'Test Description', ru: 'Описание Теста' },
  testType: { en: 'Test Type', ru: 'Тип Теста' },
  testPriority: { en: 'Test Priority', ru: 'Приоритет Теста' },
  testCategory: { en: 'Test Category', ru: 'Категория Теста' },
  testSteps: { en: 'Test Steps', ru: 'Шаги Теста' },
  expectedResults: { en: 'Expected Results', ru: 'Ожидаемые Результаты' },
  tags: { en: 'Tags', ru: 'Теги' },
  
  // Step fields
  stepAction: { en: 'Action', ru: 'Действие' },
  stepTarget: { en: 'Target', ru: 'Цель' },
  stepValue: { en: 'Value', ru: 'Значение' },
  stepExpected: { en: 'Expected Result', ru: 'Ожидаемый Результат' },
  
  // Messages
  testCreated: { en: 'Test case created', ru: 'Тест-кейс создан' },
  suiteCreated: { en: 'Test suite created', ru: 'Набор тестов создан' },
  testsStarted: { en: 'Tests started', ru: 'Тесты запущены' },
  testsStopped: { en: 'Tests stopped', ru: 'Тесты остановлены' },
  allTestsPassed: { en: 'All tests passed', ru: 'Все тесты пройдены' },
  someTestsFailed: { en: 'Some tests failed', ru: 'Некоторые тесты провалены' },
  
  // Statistics
  totalTests: { en: 'Total Tests', ru: 'Всего Тестов' },
  passedTests: { en: 'Passed', ru: 'Пройдено' },
  failedTests: { en: 'Failed', ru: 'Провалено' },
  skippedTests: { en: 'Skipped', ru: 'Пропущено' },
  executionTime: { en: 'Execution Time', ru: 'Время Выполнения' },
  successRate: { en: 'Success Rate', ru: 'Процент Успеха' },
  
  // Categories
  ui: { en: 'UI Tests', ru: 'UI Тесты' },
  api: { en: 'API Tests', ru: 'API Тесты' },
  database: { en: 'Database Tests', ru: 'Тесты БД' },
  security: { en: 'Security Tests', ru: 'Тесты Безопасности' },
  
  // Actions for steps
  click: { en: 'Click', ru: 'Клик' },
  type: { en: 'Type', ru: 'Ввод' },
  wait: { en: 'Wait', ru: 'Ожидание' },
  verify: { en: 'Verify', ru: 'Проверка' },
  navigate: { en: 'Navigate', ru: 'Переход' }
};

const useTranslation = (language: Language) => {
  return (key: string): string => {
    return translations[key]?.[language] || key;
  };
};

export default function E2ETestingSystem({ 
  language, 
  projectId,
  onTestCompleted,
  onSuiteCompleted,
  onIssueDetected
}: E2ETestingSystemProps) {
  const t = useTranslation(language);
  
  // Persistent storage
  const [testCases, setTestCases] = useKV<E2ETestCase[]>(`e2e-tests-${projectId}`, []);
  const [testSuites, setTestSuites] = useKV<TestSuite[]>(`e2e-suites-${projectId}`, []);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'cases' | 'suites' | 'results'>('cases');
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [isCreatingSuite, setIsCreatingSuite] = useState(false);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  
  // Form state
  const [newTest, setNewTest] = useState<Partial<E2ETestCase>>({
    name: '',
    description: '',
    type: 'integration',
    priority: 'medium',
    category: 'ui',
    steps: [],
    expectedResults: [],
    tags: []
  });
  
  const [newSuite, setNewSuite] = useState<Partial<TestSuite>>({
    name: '',
    description: '',
    testCases: []
  });
  
  // Get test statistics
  const getTestStats = () => {
    const total = testCases?.length || 0;
    const passed = testCases?.filter(t => t.status === 'passed').length || 0;
    const failed = testCases?.filter(t => t.status === 'failed').length || 0;
    const pending = testCases?.filter(t => t.status === 'pending').length || 0;
    const successRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    return { total, passed, failed, pending, successRate };
  };
  
  // Create new test case
  const createTestCase = () => {
    if (!newTest.name || !newTest.description) {
      toast.error('Name and description are required');
      return;
    }
    
    const testCase: E2ETestCase = {
      id: Date.now().toString(),
      name: newTest.name,
      description: newTest.description,
      type: newTest.type as E2ETestCase['type'],
      priority: newTest.priority as E2ETestCase['priority'],
      category: newTest.category || 'ui',
      steps: newTest.steps || [],
      expectedResults: newTest.expectedResults || [],
      tags: newTest.tags || [],
      status: 'pending',
      coverage: {
        modules: ['authentication', 'memory', 'analysis'],
        features: ['kipling-protocol', 'ikr-directive', 'ai-audit'],
        percentage: 75
      },
      dependencies: [],
      environment: 'development',
      retryCount: 0,
      flakiness: 0
    };
    
    setTestCases(current => [...(current || []), testCase]);
    setNewTest({
      name: '',
      description: '',
      type: 'integration',
      priority: 'medium',
      category: 'ui',
      steps: [],
      expectedResults: [],
      tags: []
    });
    setIsCreatingTest(false);
    toast.success(t('testCreated'));
  };
  
  // Run individual test
  const runTest = async (testId: string) => {
    const test = testCases?.find(t => t.id === testId);
    if (!test) return;
    
    setRunningTests(current => new Set([...current, testId]));
    
    // Update test status to running
    setTestCases(current => 
      (current || []).map(t => 
        t.id === testId 
          ? { ...t, status: 'running', lastRun: new Date().toISOString() }
          : t
      )
    );
    
    // Simulate test execution
    const startTime = Date.now();
    
    try {
      // Simulate test steps
      for (let i = 0; i < test.steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second per step
        
        // Simulate random failure (10% chance)
        if (Math.random() < 0.1) {
          throw new Error(`Step ${i + 1} failed: Unexpected result`);
        }
      }
      
      const executionTime = Date.now() - startTime;
      
      // Test passed
      setTestCases(current => 
        (current || []).map(t => 
          t.id === testId 
            ? { 
                ...t, 
                status: 'passed', 
                executionTime,
                errorMessage: undefined
              }
            : t
        )
      );
      
      if (onTestCompleted) {
        onTestCompleted(test);
      }
      
      toast.success(`Test "${test.name}" passed`);
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Test failed
      setTestCases(current => 
        (current || []).map(t => 
          t.id === testId 
            ? { 
                ...t, 
                status: 'failed', 
                executionTime,
                errorMessage
              }
            : t
        )
      );
      
      if (onIssueDetected) {
        onIssueDetected({
          test: test.name,
          error: errorMessage,
          severity: test.priority
        });
      }
      
      toast.error(`Test "${test.name}" failed: ${errorMessage}`);
    }
    
    setRunningTests(current => {
      const newSet = new Set(current);
      newSet.delete(testId);
      return newSet;
    });
  };
  
  // Run test suite
  const runTestSuite = async (suiteId: string) => {
    const suite = testSuites?.find(s => s.id === suiteId);
    if (!suite) return;
    
    const startTime = Date.now();
    
    // Update suite status
    setTestSuites(current => 
      (current || []).map(s => 
        s.id === suiteId 
          ? { 
              ...s, 
              status: 'running', 
              progress: 0,
              startTime: new Date().toISOString()
            }
          : s
      )
    );
    
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    
    // Run each test in the suite
    for (let i = 0; i < suite.testCases.length; i++) {
      const testId = suite.testCases[i];
      const progress = ((i + 1) / suite.testCases.length) * 100;
      
      // Update progress
      setTestSuites(current => 
        (current || []).map(s => 
          s.id === suiteId 
            ? { ...s, progress }
            : s
        )
      );
      
      try {
        await runTest(testId);
        const test = testCases?.find(t => t.id === testId);
        if (test?.status === 'passed') passed++;
        else if (test?.status === 'failed') failed++;
        else skipped++;
      } catch (error) {
        failed++;
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Update suite completion
    setTestSuites(current => 
      (current || []).map(s => 
        s.id === suiteId 
          ? {
              ...s,
              status: 'completed',
              progress: 100,
              endTime: new Date().toISOString(),
              duration,
              results: {
                total: suite.testCases.length,
                passed,
                failed,
                skipped
              }
            }
          : s
      )
    );
    
    if (onSuiteCompleted) {
      const updatedSuite = testSuites?.find(s => s.id === suiteId);
      if (updatedSuite) {
        onSuiteCompleted(updatedSuite);
      }
    }
    
    if (failed === 0) {
      toast.success(t('allTestsPassed'));
    } else {
      toast.warning(t('someTestsFailed'));
    }
  };
  
  const stats = getTestStats();

  // Initialize comprehensive test scenarios
  useEffect(() => {
    if (!testCases || testCases.length === 0) {
      const comprehensiveTestCases: E2ETestCase[] = [
        // Authentication Flow Tests
        {
          id: 'auth-001',
          name: 'GitHub Spark User Authentication',
          description: 'Test authentication flow with GitHub Spark user API integration',
          type: 'integration',
          priority: 'critical',
          category: 'authentication',
          steps: [
            { id: 'step-1', action: 'Load application', target: 'main-app', expected: 'App loads successfully', status: 'pending' },
            { id: 'step-2', action: 'Check user authentication', target: 'auth-system', expected: 'User is authenticated via Spark API', status: 'pending' },
            { id: 'step-3', action: 'Verify role-based access', target: 'user-permissions', expected: 'User permissions match role', status: 'pending' }
          ],
          expectedResults: ['User authenticated', 'Permissions verified', 'Access granted'],
          tags: ['auth', 'github', 'integration'],
          status: 'pending',
          coverage: {
            modules: ['authentication', 'authorization', 'user-management'],
            features: ['github-integration', 'role-based-access', 'session-management'],
            percentage: 85
          },
          dependencies: ['spark-api'],
          environment: 'development',
          retryCount: 0,
          flakiness: 5
        },
        
        // Kipling Protocol Tests
        {
          id: 'kipling-001',
          name: 'Complete Kipling Protocol Analysis',
          description: 'Test full workflow from dimension creation to insights generation',
          type: 'user-flow',
          priority: 'high',
          category: 'analysis',
          steps: [
            { id: 'step-1', action: 'Create new project', target: 'project-creation', expected: 'Project created successfully', status: 'pending' },
            { id: 'step-2', action: 'Fill Kipling dimensions', target: 'kipling-dimensions', expected: 'All 6 dimensions filled', status: 'pending' },
            { id: 'step-3', action: 'Generate insights', target: 'insights-generation', expected: 'AI insights generated', status: 'pending' },
            { id: 'step-4', action: 'Export analysis', target: 'export-functionality', expected: 'Analysis exported successfully', status: 'pending' }
          ],
          expectedResults: ['Project created', 'Dimensions completed', 'Insights generated', 'Export successful'],
          tags: ['kipling', 'analysis', 'workflow'],
          status: 'pending',
          coverage: {
            modules: ['kipling-protocol', 'project-management', 'insights'],
            features: ['dimension-analysis', 'ai-insights', 'export'],
            percentage: 90
          },
          dependencies: ['llm-api'],
          environment: 'development',
          retryCount: 0,
          flakiness: 10
        },

        // Memory System Tests
        {
          id: 'memory-001',
          name: 'Agent Memory Compression and Persistence',
          description: 'Test memory compression algorithms and cross-session persistence',
          type: 'performance',
          priority: 'high',
          category: 'memory',
          steps: [
            { id: 'step-1', action: 'Create memory file', target: 'memory-manager', expected: 'Memory file created', status: 'pending' },
            { id: 'step-2', action: 'Add large dataset', target: 'memory-data', expected: 'Data stored successfully', status: 'pending' },
            { id: 'step-3', action: 'Trigger compression', target: 'compression-algorithm', expected: 'Memory compressed', status: 'pending' },
            { id: 'step-4', action: 'Verify persistence', target: 'cross-session', expected: 'Data persists across sessions', status: 'pending' }
          ],
          expectedResults: ['Memory created', 'Data stored', 'Compression applied', 'Persistence verified'],
          tags: ['memory', 'compression', 'persistence'],
          status: 'pending',
          coverage: {
            modules: ['agent-memory', 'compression', 'persistence'],
            features: ['memory-compression', 'cross-session-persistence', 'performance-optimization'],
            percentage: 80
          },
          dependencies: ['kv-storage'],
          environment: 'development',
          retryCount: 0,
          flakiness: 15
        },

        // Security Tests
        {
          id: 'security-001',
          name: 'Role-Based Access Control',
          description: 'Test security measures and role-based access restrictions',
          type: 'security',
          priority: 'critical',
          category: 'security',
          steps: [
            { id: 'step-1', action: 'Login as viewer', target: 'auth-system', expected: 'Viewer role assigned', status: 'pending' },
            { id: 'step-2', action: 'Try admin action', target: 'admin-panel', expected: 'Access denied', status: 'pending' },
            { id: 'step-3', action: 'Switch to admin', target: 'role-change', expected: 'Admin access granted', status: 'pending' },
            { id: 'step-4', action: 'Perform admin action', target: 'admin-functionality', expected: 'Action successful', status: 'pending' }
          ],
          expectedResults: ['Role verification', 'Access control enforced', 'Permission escalation works', 'Admin actions available'],
          tags: ['security', 'rbac', 'access-control'],
          status: 'pending',
          coverage: {
            modules: ['authentication', 'authorization', 'security'],
            features: ['role-based-access', 'permission-control', 'security-audit'],
            percentage: 95
          },
          dependencies: ['auth-system'],
          environment: 'development',
          retryCount: 0,
          flakiness: 3
        },

        // Performance Tests
        {
          id: 'perf-001',
          name: 'System Performance Under Load',
          description: 'Test system performance with multiple concurrent operations',
          type: 'performance',
          priority: 'medium',
          category: 'performance',
          steps: [
            { id: 'step-1', action: 'Create multiple projects', target: 'project-system', expected: 'Projects created quickly', status: 'pending' },
            { id: 'step-2', action: 'Run concurrent audits', target: 'audit-system', expected: 'Audits complete within limits', status: 'pending' },
            { id: 'step-3', action: 'Stress test memory', target: 'memory-system', expected: 'Memory handles load', status: 'pending' },
            { id: 'step-4', action: 'Check response times', target: 'ui-performance', expected: 'UI remains responsive', status: 'pending' }
          ],
          expectedResults: ['Fast project creation', 'Concurrent processing', 'Memory efficiency', 'Responsive UI'],
          tags: ['performance', 'load', 'stress'],
          status: 'pending',
          coverage: {
            modules: ['all-modules'],
            features: ['concurrent-processing', 'memory-management', 'ui-performance'],
            percentage: 70
          },
          dependencies: ['system-resources'],
          environment: 'development',
          retryCount: 0,
          flakiness: 25
        },

        // Accessibility Tests
        {
          id: 'a11y-001',
          name: 'Accessibility Compliance',
          description: 'Test accessibility features and WCAG compliance',
          type: 'accessibility',
          priority: 'medium',
          category: 'accessibility',
          steps: [
            { id: 'step-1', action: 'Test keyboard navigation', target: 'keyboard-nav', expected: 'All elements accessible via keyboard', status: 'pending' },
            { id: 'step-2', action: 'Check color contrast', target: 'color-contrast', expected: 'WCAG AA compliance', status: 'pending' },
            { id: 'step-3', action: 'Verify screen reader', target: 'aria-labels', expected: 'Content readable by screen readers', status: 'pending' },
            { id: 'step-4', action: 'Test focus indicators', target: 'focus-states', expected: 'Clear focus indicators visible', status: 'pending' }
          ],
          expectedResults: ['Keyboard accessibility', 'Color compliance', 'Screen reader support', 'Focus visibility'],
          tags: ['accessibility', 'wcag', 'a11y'],
          status: 'pending',
          coverage: {
            modules: ['ui-components', 'navigation', 'forms'],
            features: ['keyboard-navigation', 'color-contrast', 'aria-support'],
            percentage: 60
          },
          dependencies: ['accessibility-tools'],
          environment: 'development',
          retryCount: 0,
          flakiness: 8
        }
      ];

      setTestCases(comprehensiveTestCases);
      
      // Create default test suite
      const defaultSuite: TestSuite = {
        id: 'suite-critical',
        name: 'Critical Path Test Suite',
        description: 'Essential tests for core functionality',
        testCases: ['auth-001', 'kipling-001', 'security-001'],
        status: 'idle',
        progress: 0,
        results: {
          total: 3,
          passed: 0,
          failed: 0,
          skipped: 0
        }
      };

      setTestSuites([defaultSuite]);
    }
  }, []);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug size={24} className="text-primary" />
            {t('e2eTestingSystem')}
          </CardTitle>
          <CardDescription>
            {t('automatedTesting')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Statistics Overview */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('totalTests')}</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText size={32} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('passedTests')}</p>
                    <p className="text-2xl font-bold text-green-500">{stats.passed}</p>
                  </div>
                  <CheckCircle size={32} className="text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('failedTests')}</p>
                    <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
                  </div>
                  <Warning size={32} className="text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('successRate')}</p>
                    <p className="text-2xl font-bold">{stats.successRate}%</p>
                  </div>
                  <TrendUp size={32} className="text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'cases' ? 'default' : 'outline'}
              onClick={() => setActiveTab('cases')}
            >
              {t('testCases')}
            </Button>
            <Button
              variant={activeTab === 'suites' ? 'default' : 'outline'}
              onClick={() => setActiveTab('suites')}
            >
              {t('testSuites')}
            </Button>
            <Button
              variant={activeTab === 'results' ? 'default' : 'outline'}
              onClick={() => setActiveTab('results')}
            >
              {t('testResults')}
            </Button>
          </div>
          
          {/* Test Cases Tab */}
          {activeTab === 'cases' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t('testCases')}</h3>
                <Button onClick={() => setIsCreatingTest(true)}>
                  {t('createTestCase')}
                </Button>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {(testCases || []).map(test => (
                    <Card key={test.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{test.name}</h4>
                            <Badge variant="outline">{t(test.type)}</Badge>
                            <Badge variant={
                              test.priority === 'critical' ? 'destructive' :
                              test.priority === 'high' ? 'default' : 'secondary'
                            }>
                              {t(test.priority)}
                            </Badge>
                            <Badge variant={
                              test.status === 'passed' ? 'secondary' :
                              test.status === 'failed' ? 'destructive' :
                              test.status === 'running' ? 'default' : 'outline'
                            }>
                              {t(test.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                          {test.lastRun && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last run: {new Date(test.lastRun).toLocaleString()}
                              {test.executionTime && ` (${test.executionTime}ms)`}
                            </p>
                          )}
                          {test.errorMessage && (
                            <p className="text-xs text-red-500 mt-1">{test.errorMessage}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => runTest(test.id)}
                            disabled={runningTests.has(test.id)}
                          >
                            {runningTests.has(test.id) ? (
                              <ArrowsCounterClockwise size={16} className="animate-spin" />
                            ) : (
                              <Play size={16} />
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* Test Suites Tab */}
          {activeTab === 'suites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{t('testSuites')}</h3>
                <Button onClick={() => setIsCreatingSuite(true)}>
                  {t('createTestSuite')}
                </Button>
              </div>
              
              <div className="space-y-3">
                {(testSuites || []).map(suite => (
                  <Card key={suite.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{suite.name}</h4>
                          <Badge variant={
                            suite.status === 'completed' ? 'secondary' :
                            suite.status === 'running' ? 'default' : 'outline'
                          }>
                            {t(suite.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{suite.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {suite.testCases.length} tests
                        </p>
                        
                        {suite.status === 'running' && (
                          <div className="mt-2">
                            <Progress value={suite.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round(suite.progress)}% complete
                            </p>
                          </div>
                        )}
                        
                        {suite.results && (
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-green-500">
                              ✓ {suite.results.passed}
                            </span>
                            <span className="text-red-500">
                              ✗ {suite.results.failed}
                            </span>
                            <span className="text-yellow-500">
                              ⊝ {suite.results.skipped}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => runTestSuite(suite.id)}
                          disabled={suite.status === 'running'}
                        >
                          {suite.status === 'running' ? (
                            <ArrowsCounterClockwise size={16} className="animate-spin" />
                          ) : (
                            <Play size={16} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('testResults')}</h3>
              
              {/* Detailed test results would go here */}
              <div className="text-center py-8 text-muted-foreground">
                <Eye size={48} className="mx-auto mb-4 opacity-50" />
                <p>Detailed test results and reports will be displayed here</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Create Test Case Dialog would go here */}
      {/* Create Test Suite Dialog would go here */}
    </div>
  );
}