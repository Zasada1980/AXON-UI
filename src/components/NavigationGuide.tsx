import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Question,
  Brain,
  Users,
  FileText,
  Shield,
  Robot,
  Database,
  Gear,
  ChatCircle,
  Play,
  ArrowRight,
  ListChecks,
  Target,
  CheckCircle
} from '@phosphor-icons/react';

interface NavigationGuideProps {
  language: 'en' | 'ru';
  currentModule?: string;
}

// Переводы для системы навигации
const navTranslations = {
  en: {
    navigationGuide: 'Navigation Guide',
    navigationDesc: 'Comprehensive instructions for all AXON platform functionality',
    moduleOverview: 'Module Overview',
    stepByStepGuide: 'Step-by-Step Guide',
    quickReference: 'Quick Reference',
    troubleshooting: 'Troubleshooting',
    bestPractices: 'Best Practices',
    overview: 'Analysis Overview',
    kipling: 'Kipling Protocol',
    ikr: 'IKR Directive',
    audit: 'AI Audit',
    debate: 'Agent Debate',
    executor: 'Task Executor',
    memory: 'Agent Memory',
    diagnostics: 'System Diagnostics',
    chat: 'AI Chat',
    settings: 'Settings',
    moduleDescription: 'Module Description',
    keyFeatures: 'Key Features',
    commonTasks: 'Common Tasks',
    tips: 'Tips & Tricks',
    warnings: 'Important Warnings'
  },
  ru: {
    navigationGuide: 'Руководство по Навигации',
    navigationDesc: 'Исчерпывающие инструкции по всему функционалу платформы АКСОН',
    moduleOverview: 'Обзор Модулей',
    stepByStepGuide: 'Пошаговое Руководство',
    quickReference: 'Быстрый Справочник',
    troubleshooting: 'Решение Проблем',
    bestPractices: 'Лучшие Практики',
    overview: 'Обзор Анализа',
    kipling: 'Протокол Киплинга',
    ikr: 'Директива IKR',
    audit: 'Аудит ИИ',
    debate: 'Дебаты Агентов',
    executor: 'Исполнитель Задач',
    memory: 'Память Агентов',
    diagnostics: 'Диагностика Системы',
    chat: 'ИИ Чат',
    settings: 'Настройки',
    moduleDescription: 'Описание Модуля',
    keyFeatures: 'Ключевые Функции',
    commonTasks: 'Частые Задачи',
    tips: 'Советы и Хитрости',
    warnings: 'Важные Предупреждения'
  }
};

// Данные о модулях
const moduleData = {
  overview: {
    icon: <Brain size={20} />,
    description: {
      en: 'Central dashboard showing project progress and dimension completion status',
      ru: 'Центральная панель, показывающая прогресс проекта и статус завершения измерений'
    },
    features: {
      en: [
        'Project completion tracking',
        'Dimension progress overview',
        'Key insights preview',
        'Priority indicators'
      ],
      ru: [
        'Отслеживание завершения проекта',
        'Обзор прогресса измерений',
        'Предпросмотр ключевых выводов',
        'Индикаторы приоритета'
      ]
    },
    tasks: {
      en: [
        'Monitor overall project health',
        'Identify incomplete dimensions',
        'Review generated insights',
        'Navigate to specific modules'
      ],
      ru: [
        'Мониторинг общего состояния проекта',
        'Выявление незавершенных измерений',
        'Просмотр сгенерированных выводов',
        'Навигация к конкретным модулям'
      ]
    }
  },
  kipling: {
    icon: <Users size={20} />,
    description: {
      en: 'Systematic analysis using the six-question framework: Who, What, When, Where, Why, How',
      ru: 'Систематический анализ с использованием структуры шести вопросов: Кто, Что, Когда, Где, Почему, Как'
    },
    features: {
      en: [
        'Six-dimension analysis framework',
        'Content input and editing',
        'AI-powered insight generation',
        'Completion tracking per dimension'
      ],
      ru: [
        'Структура анализа по шести измерениям',
        'Ввод и редактирование содержания',
        'Генерация выводов с помощью ИИ',
        'Отслеживание завершения по измерениям'
      ]
    },
    tasks: {
      en: [
        'Fill in analysis content for each dimension',
        'Generate AI insights for completed sections',
        'Track completion progress',
        'Review and refine insights'
      ],
      ru: [
        'Заполните содержание анализа для каждого измерения',
        'Сгенерируйте выводы ИИ для завершенных разделов',
        'Отслеживайте прогресс завершения',
        'Просматривайте и дорабатывайте выводы'
      ]
    }
  },
  ikr: {
    icon: <Target size={20} />,
    description: {
      en: 'Intelligence-Knowledge-Reasoning framework for structured analysis progression',
      ru: 'Структура Разведка-Знания-Рассуждения для структурированного развития анализа'
    },
    features: {
      en: [
        'Intelligence collection documentation',
        'Knowledge synthesis tools',
        'Strategic reasoning framework',
        'Progressive analysis structure'
      ],
      ru: [
        'Документирование сбора разведданных',
        'Инструменты синтеза знаний',
        'Структура стратегических рассуждений',
        'Прогрессивная структура анализа'
      ]
    },
    tasks: {
      en: [
        'Document intelligence sources and methods',
        'Synthesize collected information into knowledge',
        'Apply reasoning to derive strategic insights',
        'Develop actionable recommendations'
      ],
      ru: [
        'Документируйте источники и методы разведки',
        'Синтезируйте собранную информацию в знания',
        'Применяйте рассуждения для получения стратегических выводов',
        'Разрабатывайте практические рекомендации'
      ]
    }
  },
  audit: {
    icon: <Shield size={20} />,
    description: {
      en: 'AI system auditing with specialized agents for security, bias, performance, and compliance',
      ru: 'Аудит систем ИИ со специализированными агентами по безопасности, предвзятости, производительности и соответствию'
    },
    features: {
      en: [
        'Four specialized audit agents',
        'Configurable audit parameters',
        'Real-time audit monitoring',
        'Comprehensive audit reporting'
      ],
      ru: [
        'Четыре специализированных агента аудита',
        'Настраиваемые параметры аудита',
        'Мониторинг аудита в реальном времени',
        'Комплексная отчетность аудита'
      ]
    },
    tasks: {
      en: [
        'Configure API settings for audit agents',
        'Adjust sensitivity and depth parameters',
        'Run different types of audits',
        'Review audit findings and recommendations'
      ],
      ru: [
        'Настройте параметры API для агентов аудита',
        'Отрегулируйте параметры чувствительности и глубины',
        'Запускайте различные типы аудитов',
        'Просматривайте результаты аудита и рекомендации'
      ]
    }
  },
  memory: {
    icon: <Database size={20} />,
    description: {
      en: 'Agent memory management system with automated curation and verification cycles',
      ru: 'Система управления памятью агентов с автоматическим курированием и циклами верификации'
    },
    features: {
      en: [
        'Agent memory file creation',
        'Debate log collection and processing',
        'Silent verification pipeline',
        'AI-driven memory curation',
        'Agent journal management'
      ],
      ru: [
        'Создание файлов памяти агентов',
        'Сбор и обработка логов дебатов',
        'Конвейер тихой верификации',
        'Курирование памяти с помощью ИИ',
        'Управление журналами агентов'
      ]
    },
    tasks: {
      en: [
        'Create memory files from debate logs',
        'Monitor memory processing pipelines',
        'Review agent journal entries',
        'Export memory data for analysis'
      ],
      ru: [
        'Создавайте файлы памяти из логов дебатов',
        'Мониторьте конвейеры обработки памяти',
        'Просматривайте записи журналов агентов',
        'Экспортируйте данные памяти для анализа'
      ]
    }
  },
  chat: {
    icon: <ChatCircle size={20} />,
    description: {
      en: 'Contextual AI assistant for project analysis and guidance',
      ru: 'Контекстный помощник ИИ для анализа проекта и руководства'
    },
    features: {
      en: [
        'Context-aware conversations',
        'Project-specific insights',
        'Voice input support',
        'Contextual action shortcuts'
      ],
      ru: [
        'Контекстно-зависимые разговоры',
        'Выводы, специфичные для проекта',
        'Поддержка голосового ввода',
        'Контекстные ярлыки действий'
      ]
    },
    tasks: {
      en: [
        'Ask questions about your analysis',
        'Get suggestions for incomplete dimensions',
        'Request progress summaries',
        'Get help with platform features'
      ],
      ru: [
        'Задавайте вопросы о вашем анализе',
        'Получайте предложения для незавершенных измерений',
        'Запрашивайте сводки прогресса',
        'Получайте помощь с функциями платформы'
      ]
    }
  }
};

export default function NavigationGuide({ language, currentModule }: NavigationGuideProps) {
  const t = (key: keyof typeof navTranslations.en) => navTranslations[language][key];
  
  const [selectedModule, setSelectedModule] = useState<keyof typeof moduleData>(currentModule as keyof typeof moduleData || 'overview');

  const modules = Object.keys(moduleData) as Array<keyof typeof moduleData>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Question size={24} className="text-primary" />
          {t('navigationGuide')}
        </CardTitle>
        <CardDescription>
          {t('navigationDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('moduleOverview')}</TabsTrigger>
            <TabsTrigger value="stepbystep">{t('stepByStepGuide')}</TabsTrigger>
            <TabsTrigger value="reference">{t('quickReference')}</TabsTrigger>
            <TabsTrigger value="troubleshooting">{t('troubleshooting')}</TabsTrigger>
          </TabsList>

          {/* Module Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {modules.map(moduleKey => {
                const module = moduleData[moduleKey];
                return (
                  <Card key={moduleKey} className={`cursor-pointer transition-all ${selectedModule === moduleKey ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedModule(moduleKey)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        {module.icon}
                        <h4 className="font-medium">{t(moduleKey as keyof typeof navTranslations.en)}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {module.description[language]}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Selected Module Details */}
            {selectedModule && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {moduleData[selectedModule].icon}
                    {t(selectedModule as keyof typeof navTranslations.en)} - {t('moduleDescription')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('keyFeatures')}</h4>
                    <ul className="space-y-1">
                      {moduleData[selectedModule].features[language].map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle size={16} className="text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">{t('commonTasks')}</h4>
                    <ul className="space-y-1">
                      {moduleData[selectedModule].tasks[language].map((task, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <ArrowRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Step-by-Step Guide */}
          <TabsContent value="stepbystep" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'ru' ? 'Пошаговое руководство по работе с системой памяти агентов' : 'Step-by-Step Guide for Agent Memory System'}
                </h3>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-medium mb-2">
                      {language === 'ru' ? 'Шаг 1: Создание файла памяти' : 'Step 1: Creating Memory File'}
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>{language === 'ru' ? 'Перейдите в модуль "Память Агентов"' : 'Navigate to "Agent Memory" module'}</li>
                      <li>{language === 'ru' ? 'Нажмите кнопку "Создать Файл Памяти"' : 'Click "Create Memory File" button'}</li>
                      <li>{language === 'ru' ? 'Выберите агента из списка' : 'Select an agent from the list'}</li>
                      <li>{language === 'ru' ? 'Введите название и описание файла памяти' : 'Enter memory file name and description'}</li>
                      <li>{language === 'ru' ? 'Включите тихую верификацию (рекомендуется)' : 'Enable silent verification (recommended)'}</li>
                    </ol>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium mb-2">
                      {language === 'ru' ? 'Шаг 2: Мониторинг конвейера обработки' : 'Step 2: Monitoring Processing Pipeline'}
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>{language === 'ru' ? 'Перейдите на вкладку "Конвейер Верификации"' : 'Go to "Verification Pipeline" tab'}</li>
                      <li>{language === 'ru' ? 'Наблюдайте за этапами: Сбор логов → Тихая верификация → Курирование аудитом → Создание памяти' : 'Watch stages: Log Collection → Silent Verification → Audit Curation → Memory Creation'}</li>
                      <li>{language === 'ru' ? 'Дождитесь завершения всех этапов' : 'Wait for all stages to complete'}</li>
                    </ol>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium mb-2">
                      {language === 'ru' ? 'Шаг 3: Работа с логами дебатов' : 'Step 3: Working with Debate Logs'}
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>{language === 'ru' ? 'Запустите сессию дебатов кнопкой "Начать Новые Дебаты"' : 'Start debate session with "Start New Debate" button'}</li>
                      <li>{language === 'ru' ? 'Дождитесь завершения дебатов между агентами' : 'Wait for completion of agent debates'}</li>
                      <li>{language === 'ru' ? 'Нажмите "Извлечь Память" для создания записей памяти из логов' : 'Click "Extract Memories" to create memory entries from logs'}</li>
                    </ol>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-medium mb-2">
                      {language === 'ru' ? 'Шаг 4: Управление журналами агентов' : 'Step 4: Managing Agent Journals'}
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>{language === 'ru' ? 'Добавляйте записи в журналы с помощью кнопки "Добавить Запись"' : 'Add journal entries using "Add Entry" button'}</li>
                      <li>{language === 'ru' ? 'Выберите категорию: Дебаты, Аудит, Решение, Обучение, Ошибка, Успех' : 'Choose category: Debate, Audit, Decision, Learning, Error, Success'}</li>
                      <li>{language === 'ru' ? 'Установите уровень важности: Низкая, Средняя, Высокая, Критическая' : 'Set importance level: Low, Medium, High, Critical'}</li>
                      <li>{language === 'ru' ? 'Добавьте теги для лучшей организации' : 'Add tags for better organization'}</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Reference */}
          <TabsContent value="reference" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{language === 'ru' ? 'Быстрые действия' : 'Quick Actions'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Play size={16} className="text-green-500" />
                    <span>{language === 'ru' ? 'Ctrl/Cmd + M - Создать файл памяти' : 'Ctrl/Cmd + M - Create memory file'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Database size={16} className="text-blue-500" />
                    <span>{language === 'ru' ? 'Ctrl/Cmd + L - Просмотр логов' : 'Ctrl/Cmd + L - View logs'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText size={16} className="text-purple-500" />
                    <span>{language === 'ru' ? 'Ctrl/Cmd + J - Добавить запись в журнал' : 'Ctrl/Cmd + J - Add journal entry'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{language === 'ru' ? 'Статусы памяти' : 'Memory Statuses'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">Pending</Badge>
                    <span>{language === 'ru' ? 'Ожидает обработки' : 'Awaiting processing'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">Verifying</Badge>
                    <span>{language === 'ru' ? 'Проходит верификацию' : 'Under verification'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="default">Active</Badge>
                    <span>{language === 'ru' ? 'Готов к использованию' : 'Ready for use'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Troubleshooting */}
          <TabsContent value="troubleshooting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ru' ? 'Частые проблемы и решения' : 'Common Issues and Solutions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-orange-600">
                    {language === 'ru' ? 'Проблема: Не удается создать файл памяти' : 'Issue: Cannot create memory file'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'ru' 
                      ? 'Убедитесь, что выбран агент и введено название файла'
                      : 'Ensure an agent is selected and file name is entered'
                    }
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• {language === 'ru' ? 'Проверьте выбор агента в выпадающем списке' : 'Check agent selection in dropdown'}</li>
                    <li>• {language === 'ru' ? 'Введите уникальное название файла' : 'Enter unique file name'}</li>
                    <li>• {language === 'ru' ? 'Убедитесь в наличии прав доступа' : 'Ensure proper access permissions'}</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-red-600">
                    {language === 'ru' ? 'Проблема: Конвейер обработки завис' : 'Issue: Processing pipeline stuck'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'ru' 
                      ? 'Если этап обработки не продвигается более 5 минут'
                      : 'If processing stage does not progress for more than 5 minutes'
                    }
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• {language === 'ru' ? 'Обновите страницу браузера' : 'Refresh browser page'}</li>
                    <li>• {language === 'ru' ? 'Проверьте подключение к интернету' : 'Check internet connection'}</li>
                    <li>• {language === 'ru' ? 'Перезапустите процесс создания памяти' : 'Restart memory creation process'}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}