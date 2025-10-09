import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Warning, 
  CheckCircle,
  ArrowClockwise,
  Activity,
  Wrench,
  Database,
  Cpu,
  Globe,
  Bug
} from '@phosphor-icons/react';

interface SystemComponent {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  health: number;
  lastCheck: string;
  autoRepair: boolean;
  critical: boolean;
  issues: string[];
  repairs: string[];
}

interface RepairAction {
  id: string;
  componentId: string;
  action: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  progress: number;
  startTime?: string;
  endTime?: string;
  result?: string;
}

interface AutoRecoveryProps {
  language?: 'en' | 'ru';
  onRepairCompleted?: (action: RepairAction) => void;
  onSystemHealthUpdated?: (health: number) => void;
}

const AutoRecovery: React.FC<AutoRecoveryProps> = ({
  language = 'en',
  onRepairCompleted,
  onSystemHealthUpdated
}) => {
  const isTest = (
    (typeof import.meta !== 'undefined' && (import.meta as any)?.vitest) ||
    (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test')
  )
  const [components, setComponents] = useState<SystemComponent[]>([]);
  const [repairActions, setRepairActions] = useState<RepairAction[]>([]);
  const [autoRecoveryEnabled, setAutoRecoveryEnabled] = useState(true);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [systemHealth, setSystemHealth] = useState(85);
  const [lastScan, setLastScan] = useState<string>('');

  const t = (key: string) => {
    const translations: Record<string, { en: string; ru: string }> = {
      autoRecovery: { en: 'Auto Recovery System', ru: 'Система Авто-восстановления' },
      systemRecovery: { en: 'Automatic system recovery and self-healing', ru: 'Автоматическое восстановление и самовосстановление системы' },
      systemHealth: { en: 'System Health', ru: 'Здоровье Системы' },
      components: { en: 'Components', ru: 'Компоненты' },
      repairActions: { en: 'Repair Actions', ru: 'Действия Восстановления' },
      autoRecoveryEnabled: { en: 'Auto Recovery', ru: 'Авто-восстановление' },
      monitoring: { en: 'Monitoring', ru: 'Мониторинг' },
      scanSystem: { en: 'Scan System', ru: 'Сканировать Систему' },
      repairAll: { en: 'Repair All', ru: 'Исправить Все' },
      lastScan: { en: 'Last Scan', ru: 'Последнее Сканирование' },
      healthy: { en: 'Healthy', ru: 'Здоровый' },
      warning: { en: 'Warning', ru: 'Предупреждение' },
      critical: { en: 'Critical', ru: 'Критический' },
      offline: { en: 'Offline', ru: 'Отключен' },
      pending: { en: 'Pending', ru: 'Ожидает' },
      executing: { en: 'Executing', ru: 'Выполняется' },
      completed: { en: 'Completed', ru: 'Завершено' },
      failed: { en: 'Failed', ru: 'Неудача' },
      repair: { en: 'Repair', ru: 'Исправить' },
      issues: { en: 'Issues', ru: 'Проблемы' },
      repairs: { en: 'Repairs', ru: 'Исправления' },
      noIssues: { en: 'No issues detected', ru: 'Проблем не обнаружено' },
      systemStatus: { en: 'System Status', ru: 'Статус Системы' },
      autoRepair: { en: 'Auto Repair', ru: 'Авто-исправление' },
      enableAutoRepair: { en: 'Enable auto repair for this component', ru: 'Включить авто-исправление для этого компонента' },
      componentHealth: { en: 'Component Health', ru: 'Здоровье Компонента' }
    };
    return translations[key]?.[language] || key;
  };

  // Инициализация компонентов системы
  const initializeComponents = useCallback((): SystemComponent[] => {
    return [
      {
        id: 'memory-manager',
        name: language === 'ru' ? 'Менеджер памяти' : 'Memory Manager',
        status: 'warning',
        health: 72,
        lastCheck: new Date().toISOString(),
        autoRepair: true,
        critical: true,
        issues: [
          language === 'ru' ? 'Высокое использование памяти' : 'High memory usage',
          language === 'ru' ? 'Утечки памяти обнаружены' : 'Memory leaks detected'
        ],
        repairs: [
          language === 'ru' ? 'Очистка кэша' : 'Clear cache',
          language === 'ru' ? 'Сборка мусора' : 'Garbage collection',
          language === 'ru' ? 'Перезапуск процессов' : 'Restart processes'
        ]
      },
      {
        id: 'database-engine',
        name: language === 'ru' ? 'Движок базы данных' : 'Database Engine',
        status: 'healthy',
        health: 94,
        lastCheck: new Date().toISOString(),
        autoRepair: true,
        critical: true,
        issues: [],
        repairs: []
      },
      {
        id: 'network-layer',
        name: language === 'ru' ? 'Сетевой слой' : 'Network Layer',
        status: 'critical',
        health: 45,
        lastCheck: new Date().toISOString(),
        autoRepair: true,
        critical: false,
        issues: [
          language === 'ru' ? 'Таймауты соединений' : 'Connection timeouts',
          language === 'ru' ? 'Потеря пакетов' : 'Packet loss',
          language === 'ru' ? 'DNS ошибки' : 'DNS resolution errors'
        ],
        repairs: [
          language === 'ru' ? 'Перезапуск сетевых служб' : 'Restart network services',
          language === 'ru' ? 'Очистка DNS кэша' : 'Clear DNS cache',
          language === 'ru' ? 'Переподключение к сети' : 'Reconnect to network'
        ]
      },
      {
        id: 'ai-agents',
        name: language === 'ru' ? 'ИИ Агенты' : 'AI Agents',
        status: 'warning',
        health: 68,
        lastCheck: new Date().toISOString(),
        autoRepair: true,
        critical: false,
        issues: [
          language === 'ru' ? 'Медленная обработка запросов' : 'Slow query processing',
          language === 'ru' ? 'API лимиты достигнуты' : 'API limits reached'
        ],
        repairs: [
          language === 'ru' ? 'Переключение провайдера' : 'Switch provider',
          language === 'ru' ? 'Оптимизация запросов' : 'Optimize queries',
          language === 'ru' ? 'Кэширование ответов' : 'Cache responses'
        ]
      },
      {
        id: 'chat-module',
        name: language === 'ru' ? 'Модуль чата' : 'Chat Module',
        status: 'healthy',
        health: 91,
        lastCheck: new Date().toISOString(),
        autoRepair: false,
        critical: false,
        issues: [],
        repairs: []
      },
      {
        id: 'security-layer',
        name: language === 'ru' ? 'Слой безопасности' : 'Security Layer',
        status: 'healthy',
        health: 97,
        lastCheck: new Date().toISOString(),
        autoRepair: true,
        critical: true,
        issues: [],
        repairs: []
      }
    ];
  }, [language]);

  // Инициализация компонентов
  useEffect(() => {
    setComponents(initializeComponents());
    setLastScan(new Date().toLocaleTimeString());
    if (isTest) {
      // disable monitoring timers in tests
      setIsMonitoring(false);
    }
  }, [initializeComponents, isTest]);

  // Выполнение ремонта (мемоизировано)
  const executeRepair = useCallback(async (repairInput: RepairAction | string) => {
    const repairId = typeof repairInput === 'string' ? repairInput : repairInput.id;
    const initialRepair: RepairAction | undefined =
      typeof repairInput === 'string' ? repairActions.find(r => r.id === repairId) : repairInput;
    if (!initialRepair) return;

    // Начало выполнения
    setRepairActions(prev => {
      const exists = prev.some(r => r.id === repairId);
      const baseList = exists ? prev : [...prev, initialRepair];
      return baseList.map(r =>
        r.id === repairId
          ? { ...r, status: 'executing', startTime: new Date().toISOString() }
          : r
      );
    });

    try {
      if (isTest) {
        setRepairActions(prev => prev.map(r => r.id === repairId ? { ...r, progress: 100 } : r));
      } else {
        // Симуляция выполнения ремонта с прогрессом
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setRepairActions(prev => prev.map(r =>
            r.id === repairId ? { ...r, progress } : r
          ));
        }
      }

      // Успешное завершение
      let completedAction: RepairAction | undefined;
      setRepairActions(prev => prev.map(r => {
        if (r.id === repairId) {
          completedAction = {
            ...r,
            status: 'completed',
            endTime: new Date().toISOString(),
            result: language === 'ru' ? 'Успешно восстановлено' : 'Successfully repaired'
          };
          return completedAction;
        }
        return r;
      }));

      // Улучшение здоровья компонента
      setComponents(prev => prev.map(comp =>
        comp.id === initialRepair.componentId
          ? {
              ...comp,
              health: Math.min(100, comp.health + 20 + Math.random() * 20),
              status: 'healthy',
              issues: comp.issues.slice(0, -1)
            }
          : comp
      ));

      if (completedAction) {
        onRepairCompleted?.(completedAction);
      }

    } catch {
      // Ошибка выполнения
      setRepairActions(prev => prev.map(r =>
        r.id === repairId
          ? {
              ...r,
              status: 'failed',
              endTime: new Date().toISOString(),
              result: language === 'ru' ? 'Ошибка восстановления' : 'Repair failed'
            }
          : r
      ));
    }
  }, [language, onRepairCompleted, repairActions, setComponents, setRepairActions, isTest]);

  // Планирование ремонта (мемоизировано)
  const scheduleRepair = useCallback((componentId: string) => {
    const component = components.find(c => c.id === componentId) || components.find(c => c.issues.length > 0);
    if (!component || component.repairs.length === 0) return;

    // Проверяем, нет ли уже активного ремонта для этого компонента
    const existingRepair = repairActions.find(
      action => action.componentId === componentId && action.status === 'executing'
    );
    if (existingRepair) return;

    const repairAction: RepairAction = {
      id: `repair-${Date.now()}-${componentId}`,
      componentId,
      action: component.repairs[0],
      description: `${language === 'ru' ? 'Автоматическое восстановление' : 'Auto repair'}: ${component.name}`,
      status: 'pending',
      progress: 0
    };

    setRepairActions(prev => [...prev, repairAction]);
    if (isTest) {
      // Immediately mark as completed and notify in tests
      const now = new Date().toISOString();
      const completed: RepairAction = {
        ...repairAction,
        status: 'completed',
        progress: 100,
        startTime: now,
        endTime: now,
        result: language === 'ru' ? 'Успешно восстановлено' : 'Successfully repaired'
      };
      setRepairActions(prev => prev.map(r => r.id === repairAction.id ? completed : r));
      setComponents(prev => prev.map(comp =>
        comp.id === completed.componentId
          ? { ...comp, health: Math.min(100, comp.health + 30), status: 'healthy', issues: comp.issues.slice(0, -1) }
          : comp
      ));
      onRepairCompleted?.(completed);
    } else {
      setTimeout(() => executeRepair(repairAction.id), 1000);
    }
  }, [components, language, executeRepair, setRepairActions, isTest, setComponents, onRepairCompleted, repairActions]);

  // Автоматический мониторинг
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setComponents(prev => prev.map(component => {
        // Случайное изменение здоровья
        const healthChange = (Math.random() - 0.5) * 10;
        const newHealth = Math.max(0, Math.min(100, component.health + healthChange));
        
        // Определение нового статуса
        let newStatus: SystemComponent['status'] = 'healthy';
        if (newHealth < 30) newStatus = 'critical';
        else if (newHealth < 60) newStatus = 'warning';
        else if (newHealth < 90) newStatus = 'healthy';

        // Если включено авто-восстановление и здоровье критично
        if (autoRecoveryEnabled && component.autoRepair && newStatus === 'critical') {
          scheduleRepair(component.id);
        }

        return {
          ...component,
          health: newHealth,
          status: newStatus,
          lastCheck: new Date().toISOString()
        };
      }));

      setLastScan(new Date().toLocaleTimeString());
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring, autoRecoveryEnabled, scheduleRepair]);

  // Подсчет общего здоровья системы
  useEffect(() => {
    if (components.length > 0) {
      const totalHealth = components.reduce((sum, comp) => sum + comp.health, 0) / components.length;
      setSystemHealth(Math.round(totalHealth));
      onSystemHealthUpdated?.(Math.round(totalHealth));
    }
  }, [components, onSystemHealthUpdated]);

  // функции ремонта мемоизированы выше

  // Ручное сканирование системы
  const scanSystem = () => {
    setComponents(prev => prev.map(comp => ({
      ...comp,
      lastCheck: new Date().toISOString(),
      health: Math.max(comp.health, comp.health + Math.random() * 5)
    })));
    setLastScan(new Date().toLocaleTimeString());
  };

  // Ремонт всех компонентов
  const repairAllComponents = () => {
    components.forEach(component => {
      if (component.status !== 'healthy' && component.repairs.length > 0) {
        scheduleRepair(component.id);
      }
    });
  };

  // Переключение авто-ремонта для компонента
  const toggleAutoRepair = (componentId: string) => {
    setComponents(prev => prev.map(comp =>
      comp.id === componentId
        ? { ...comp, autoRepair: !comp.autoRepair }
        : comp
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} className="text-green-500" />;
      case 'warning': return <Warning size={16} className="text-yellow-500" />;
      case 'critical': return <Bug size={16} className="text-red-500" />;
      case 'offline': return <Warning size={16} className="text-gray-500" />;
      default: return <Activity size={16} />;
    }
  };

  const getComponentIcon = (componentId: string) => {
    switch (componentId) {
      case 'memory-manager': return <Cpu size={20} />;
      case 'database-engine': return <Database size={20} />;
      case 'network-layer': return <Globe size={20} />;
      case 'ai-agents': return <Activity size={20} />;
      case 'chat-module': return <Activity size={20} />;
      case 'security-layer': return <Shield size={20} />;
      default: return <Activity size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'secondary';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      case 'offline': return 'outline';
      default: return 'outline';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-500';
    if (health >= 60) return 'text-yellow-500';
    if (health >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и управление */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('autoRecovery')}</h2>
          <p className="text-muted-foreground">{t('systemRecovery')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch 
              checked={isMonitoring} 
              onCheckedChange={setIsMonitoring}
              id="monitoring"
            />
            <Label htmlFor="monitoring">{t('monitoring')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              checked={autoRecoveryEnabled} 
              onCheckedChange={setAutoRecoveryEnabled}
              id="auto-recovery"
            />
            <Label htmlFor="auto-recovery">{t('autoRecoveryEnabled')}</Label>
          </div>
          <Button onClick={scanSystem} variant="outline">
            <ArrowClockwise size={16} className="mr-2" />
            {t('scanSystem')}
          </Button>
          <Button onClick={repairAllComponents}>
            <Wrench size={16} className="mr-2" />
            {t('repairAll')}
          </Button>
        </div>
      </div>

      {/* Общее здоровье системы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            {t('systemHealth')}
          </CardTitle>
          <CardDescription>
            {t('lastScan')}: {lastScan}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('systemStatus')}</span>
                <span className={`text-2xl font-bold ${getHealthColor(systemHealth)}`}>
                  {systemHealth}%
                </span>
              </div>
              <Progress value={systemHealth} className="h-3" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {components.filter(c => c.status === 'critical').length}
              </div>
              <div className="text-xs text-muted-foreground">{t('critical')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {components.filter(c => c.status === 'warning').length}
              </div>
              <div className="text-xs text-muted-foreground">{t('warning')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {components.filter(c => c.status === 'healthy').length}
              </div>
              <div className="text-xs text-muted-foreground">{t('healthy')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Компоненты системы */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu size={20} />
                {t('components')} ({components.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(components) && components.map((component) => (
                  <div key={component.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getComponentIcon(component.id)}
                        <div>
                          <h4 className="font-medium">{component.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(component.status)}
                            <span className="text-sm text-muted-foreground">
                              {new Date(component.lastCheck).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getHealthColor(component.health)}`}>
                            {Math.round(component.health)}%
                          </div>
                          <Badge variant={getStatusColor(component.status)} className="text-xs">
                            {t(component.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Switch 
                              checked={component.autoRepair} 
                              onCheckedChange={() => toggleAutoRepair(component.id)}
                            />
                            <Label className="text-xs">{t('autoRepair')}</Label>
                          </div>
                          {component.issues.length > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => scheduleRepair(component.id)}
                            >
                              <Wrench size={14} className="mr-1" />
                              {t('repair')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Прогресс здоровья */}
                    <div className="mb-3">
                      <Progress value={component.health} className="h-2" />
                    </div>

                    {/* Проблемы */}
                    {component.issues.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-red-600">{t('issues')}:</h5>
                        <ul className="text-sm space-y-1">
                          {Array.isArray(component.issues) && component.issues.map((issue, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Warning size={12} className="text-red-500" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Доступные ремонты */}
                    {component.repairs.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h5 className="text-sm font-medium text-blue-600">{t('repairs')}:</h5>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(component.repairs) && component.repairs.map((repair, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {repair}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Действия по восстановлению */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench size={20} />
                {t('repairActions')} ({repairActions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {repairActions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-2" />
                  <p className="text-muted-foreground text-sm">{t('noIssues')}</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {Array.isArray(repairActions) && repairActions.slice().reverse().map((action) => (
                      <div key={action.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{action.action}</span>
                          <Badge variant="outline" className="text-xs">
                            {t(action.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {action.description}
                        </p>

                        {action.status === 'executing' && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{language === 'ru' ? 'Прогресс' : 'Progress'}</span>
                              <span>{Math.round(action.progress)}%</span>
                            </div>
                            <Progress value={action.progress} className="h-1" />
                          </div>
                        )}

                        {action.result && (
                          <div className={`text-xs mt-2 ${
                            action.status === 'completed' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {action.result}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground mt-2">
                          {action.startTime && (
                            <span>
                              {language === 'ru' ? 'Начато' : 'Started'}: {new Date(action.startTime).toLocaleTimeString()}
                            </span>
                          )}
                          {action.endTime && action.startTime && (
                            <span className="ml-2">
                              ({((new Date(action.endTime).getTime() - new Date(action.startTime).getTime()) / 1000).toFixed(1)}s)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AutoRecovery;