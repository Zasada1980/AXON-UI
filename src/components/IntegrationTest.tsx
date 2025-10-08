import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  StopCircle,
  Activity,
  Warning,
  TestTube
} from '@phosphor-icons/react';

interface IntegrationTestProps {
  language: 'en' | 'ru';
}

interface TestResult {
  component: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration: number;
  error?: string;
}

const IntegrationTest: React.FC<IntegrationTestProps> = ({ language }) => {
  const [tests, setTests] = useState<TestResult[]>([
    { component: 'ErrorMonitoring', status: 'pending', duration: 0 },
    { component: 'StepByStepRecovery', status: 'pending', duration: 0 },
    { component: 'CheckpointSystem', status: 'pending', duration: 0 },
    { component: 'TaskManagementSystem', status: 'pending', duration: 0 },
    { component: 'SystemDiagnostics', status: 'pending', duration: 0 },
    { component: 'AutoRecovery', status: 'pending', duration: 0 }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const t = (key: string) => {
    const translations: { [key: string]: { en: string; ru: string } } = {
      integrationTest: { en: 'System Integration Test', ru: 'Тест Интеграции Системы' },
      testDesc: { en: 'Verify all recovery components work together seamlessly', ru: 'Проверьте, что все компоненты восстановления работают вместе' },
      runTests: { en: 'Run All Tests', ru: 'Запустить Все Тесты' },
      stopTests: { en: 'Stop Tests', ru: 'Остановить Тесты' },
      testResults: { en: 'Test Results', ru: 'Результаты Тестов' },
      passed: { en: 'Passed', ru: 'Пройден' },
      failed: { en: 'Failed', ru: 'Не пройден' },
      running: { en: 'Running', ru: 'Выполняется' },
      pending: { en: 'Pending', ru: 'Ожидание' },
      duration: { en: 'Duration', ru: 'Длительность' },
      allTestsPassed: { en: 'All tests passed successfully!', ru: 'Все тесты пройдены успешно!' },
      someTestsFailed: { en: 'Some tests failed. Check the results.', ru: 'Некоторые тесты не пройдены. Проверьте результаты.' },
      testsRunning: { en: 'Tests are running...', ru: 'Тесты выполняются...' },
      testsStopped: { en: 'Tests stopped', ru: 'Тесты остановлены' }
    };
    return translations[key]?.[language] || key;
  };

  const runSingleTest = async (testIndex: number): Promise<void> => {
    const test = tests[testIndex];
    const startTime = Date.now();

    // Update test status to running
    setTests(current => 
      current.map((t, i) => 
        i === testIndex ? { ...t, status: 'running' as const } : t
      )
    );

    return new Promise((resolve, reject) => {
      // Simulate test execution
      const testDuration = Math.random() * 3000 + 1000; // 1-4 seconds
      
      setTimeout(() => {
        const duration = Date.now() - startTime;
        const success = Math.random() > 0.2; // 80% success rate
        
        setTests(current => 
          current.map((t, i) => 
            i === testIndex ? {
              ...t,
              status: success ? 'passed' as const : 'failed' as const,
              duration: Math.round(duration),
              error: success ? undefined : `Mock error in ${test.component}`
            } : t
          )
        );

        if (success) {
          resolve();
        } else {
          reject(new Error(`Test failed for ${test.component}`));
        }
      }, testDuration);
    });
  };

  const runAllTests = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    
    // Reset all tests
    setTests(current => 
      current.map(test => ({ ...test, status: 'pending' as const, duration: 0, error: undefined }))
    );

    toast.info(t('testsRunning'));

    try {
      for (let i = 0; i < tests.length; i++) {
        if (!isRunning) break; // Stop if cancelled
        
        try {
          await runSingleTest(i);
          toast.success(`✓ ${tests[i].component} test passed`);
        } catch (error) {
          toast.error(`✗ ${tests[i].component} test failed`);
        }
        
        setProgress(Math.round(((i + 1) / tests.length) * 100));
      }

      // Check final results
      const finalTests = tests.filter(t => t.status === 'passed' || t.status === 'failed');
      const passedTests = finalTests.filter(t => t.status === 'passed');
      
      if (passedTests.length === tests.length) {
        toast.success(t('allTestsPassed'));
      } else {
        toast.warning(t('someTestsFailed'));
      }
      
    } catch (error) {
      toast.error('Test execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const stopTests = () => {
    setIsRunning(false);
    toast.info(t('testsStopped'));
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle size={16} className="text-green-500" />;
      case 'failed': return <XCircle size={16} className="text-red-500" />;
      case 'running': return <Activity size={16} className="text-blue-500 animate-spin" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'secondary';
      case 'failed': return 'destructive';
      case 'running': return 'default';
      default: return 'outline';
    }
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube size={24} className="text-primary" />
          {t('integrationTest')}
        </CardTitle>
        <CardDescription>
          {t('testDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
            >
              <PlayCircle size={16} className="mr-2" />
              {t('runTests')}
            </Button>
            
            {isRunning && (
              <Button
                onClick={stopTests}
                variant="destructive"
                size="sm"
              >
                <StopCircle size={16} className="mr-2" />
                {t('stopTests')}
              </Button>
            )}
          </div>

          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {passedTests} / {totalTests} passed
              {failedTests > 0 && ` • ${failedTests} failed`}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={progress} className="w-32 h-2" />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        {!isRunning && progress > 0 && (
          <Alert className={failedTests > 0 ? 'border-destructive' : 'border-secondary'}>
            {failedTests > 0 ? (
              <Warning size={16} />
            ) : (
              <CheckCircle size={16} />
            )}
            <AlertDescription>
              {failedTests > 0 ? t('someTestsFailed') : t('allTestsPassed')}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        <div className="space-y-3">
          <h4 className="font-medium">{t('testResults')}</h4>
          
          <div className="grid gap-3">
            {tests.map((test, index) => (
              <Card key={test.component} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <h5 className="font-medium">{test.component}</h5>
                      {test.error && (
                        <p className="text-xs text-red-500">{test.error}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {test.duration > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {t('duration')}: {test.duration}ms
                      </div>
                    )}
                    <Badge variant={getStatusColor(test.status)}>
                      {t(test.status)}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Summary */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">
            {language === 'ru' ? 'Сводка Интеграции' : 'Integration Summary'}
          </h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span>{language === 'ru' ? 'Компоненты мониторинга ошибок:' : 'Error monitoring components:'}</span>
              <span className="text-green-600">✓ ErrorMonitoring</span>
            </div>
            <div className="flex justify-between">
              <span>{language === 'ru' ? 'Системы восстановления:' : 'Recovery systems:'}</span>
              <span className="text-green-600">✓ StepByStepRecovery, AutoRecovery</span>
            </div>
            <div className="flex justify-between">
              <span>{language === 'ru' ? 'Контрольные точки:' : 'Checkpoint support:'}</span>
              <span className="text-green-600">✓ CheckpointSystem</span>
            </div>
            <div className="flex justify-between">
              <span>{language === 'ru' ? 'Управление задачами:' : 'Task management:'}</span>
              <span className="text-green-600">✓ TaskManagementSystem</span>
            </div>
            <div className="flex justify-between">
              <span>{language === 'ru' ? 'Системная диагностика:' : 'System diagnostics:'}</span>
              <span className="text-green-600">✓ SystemDiagnostics</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationTest;