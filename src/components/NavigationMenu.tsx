import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ChartLine,
  Users,
  Target,
  Shield,
  ChatCircle,
  Brain,
  ListChecks,
  FileText,
  Gear,
  Graph,
  Bug,
  Bell,
  MagnifyingGlass,
  FloppyDisk,
  CloudArrowUp,
  Eye,
  Robot,
  Database,
  Play,
  Lightbulb,
  House,
  ArrowLeft
} from '@phosphor-icons/react';

interface NavigationMenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'core' | 'ai' | 'system' | 'advanced';
  status?: 'stable' | 'beta' | 'experimental';
  hasNotification?: boolean;
}

interface NavigationMenuProps {
  language: 'en' | 'ru';
  currentPage: string;
  onNavigate: (pageId: string) => void;
  onBack: () => void;
  systemHealth?: {
    overall: number;
    components: {
      storage: number;
      ai: number;
      ui: number;
      memory: number;
    };
    issues: string[];
  };
  projectTitle?: string;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  language,
  currentPage,
  onNavigate,
  onBack,
  systemHealth,
  projectTitle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const t = (key: string) => {
    const translations: Record<string, { en: string; ru: string }> = {
      // Navigation
      navigationMenu: { en: 'Navigation Menu', ru: 'Меню Навигации' },
      searchPages: { en: 'Search pages...', ru: 'Поиск страниц...' },
      backToProject: { en: 'Back to Project', ru: 'Назад к Проекту' },
      allCategories: { en: 'All Categories', ru: 'Все Категории' },
      
      // Categories
      coreAnalysis: { en: 'Core Analysis', ru: 'Основной Анализ' },
      aiTools: { en: 'AI Tools', ru: 'Инструменты ИИ' },
      systemTools: { en: 'System Tools', ru: 'Системные Инструменты' },
      advancedFeatures: { en: 'Advanced Features', ru: 'Расширенные Возможности' },
      
      // Pages
      overview: { en: 'Analysis Overview', ru: 'Обзор Анализа' },
      overviewDesc: { en: 'Project dashboard and progress tracking', ru: 'Панель проекта и отслеживание прогресса' },
      
      intelligence: { en: 'Intelligence Gathering', ru: 'Сбор Разведданных' },
      intelligenceDesc: { en: 'Systematic information collection and analysis', ru: 'Систематический сбор и анализ информации' },
      
      kipling: { en: 'Kipling Protocol', ru: 'Протокол Киплинга' },
      kiplingDesc: { en: 'Six-dimensional analysis framework', ru: 'Шестимерная система анализа' },
      
      ikr: { en: 'IKR Directive', ru: 'Директива IKR' },
      ikrDesc: { en: 'Intelligence-Knowledge-Reasoning methodology', ru: 'Методология Разведка-Знания-Рассуждения' },
      
      audit: { en: 'AI Audit', ru: 'Аудит ИИ' },
      auditDesc: { en: 'Automated system auditing and validation', ru: 'Автоматизированный аудит и валидация системы' },
      
      debate: { en: 'Agent Debate', ru: 'Дебаты Агентов' },
      debateDesc: { en: 'Multi-agent debate and consensus systems', ru: 'Системы дебатов и консенсуса агентов' },
      
      executor: { en: 'Task Executor', ru: 'Исполнитель Задач' },
      executorDesc: { en: 'Automated task execution and management', ru: 'Автоматическое выполнение и управление задачами' },
      
      memory: { en: 'Agent Memory', ru: 'Память Агентов' },
      memoryDesc: { en: 'Knowledge retention and learning systems', ru: 'Системы сохранения знаний и обучения' },
      
      chat: { en: 'AI Assistant', ru: 'ИИ Помощник' },
      chatDesc: { en: 'Interactive AI analysis assistant', ru: 'Интерактивный ИИ помощник для анализа' },
      
      files: { en: 'File Management', ru: 'Управление Файлами' },
      filesDesc: { en: 'Document upload and analysis', ru: 'Загрузка и анализ документов' },
      
      diagnostics: { en: 'System Diagnostics', ru: 'Диагностика Системы' },
      diagnosticsDesc: { en: 'System health and recovery tools', ru: 'Инструменты здоровья и восстановления системы' },
      
      // Status
      stable: { en: 'Stable', ru: 'Стабильно' },
      beta: { en: 'Beta', ru: 'Бета' },
      experimental: { en: 'Experimental', ru: 'Экспериментально' },
      
      systemHealthGood: { en: 'System Health: Good', ru: 'Состояние Системы: Хорошее' },
      systemHealthWarning: { en: 'System Health: Warning', ru: 'Состояние Системы: Предупреждение' },
      systemHealthCritical: { en: 'System Health: Critical', ru: 'Состояние Системы: Критическое' },
    };
    
    return translations[key]?.[language] || key;
  };

  const menuItems: NavigationMenuItem[] = [
    // Core Analysis
    {
      id: 'overview',
      title: t('overview'),
      description: t('overviewDesc'),
      icon: <House size={20} />,
      category: 'core',
      status: 'stable'
    },
    {
      id: 'intelligence',
      title: t('intelligence'),
      description: t('intelligenceDesc'),
      icon: <MagnifyingGlass size={20} />,
      category: 'core',
      status: 'stable'
    },
    {
      id: 'kipling',
      title: t('kipling'),
      description: t('kiplingDesc'),
      icon: <Users size={20} />,
      category: 'core',
      status: 'stable'
    },
    {
      id: 'ikr',
      title: t('ikr'),
      description: t('ikrDesc'),
      icon: <Target size={20} />,
      category: 'core',
      status: 'stable'
    },
    
    // AI Tools
    {
      id: 'audit',
      title: t('audit'),
      description: t('auditDesc'),
      icon: <Shield size={20} />,
      category: 'ai',
      status: 'stable',
      hasNotification: systemHealth && systemHealth.issues.length > 0
    },
    {
      id: 'debate',
      title: t('debate'),
      description: t('debateDesc'),
      icon: <Users size={20} />,
      category: 'ai',
      status: 'beta'
    },
    {
      id: 'executor',
      title: t('executor'),
      description: t('executorDesc'),
      icon: <Play size={20} />,
      category: 'ai',
      status: 'stable'
    },
    {
      id: 'memory',
      title: t('memory'),
      description: t('memoryDesc'),
      icon: <Brain size={20} />,
      category: 'ai',
      status: 'beta'
    },
    {
      id: 'chat',
      title: t('chat'),
      description: t('chatDesc'),
      icon: <ChatCircle size={20} />,
      category: 'ai',
      status: 'stable'
    },
    
    // System Tools
    {
      id: 'files',
      title: t('files'),
      description: t('filesDesc'),
      icon: <FileText size={20} />,
      category: 'system',
      status: 'stable'
    },
    {
      id: 'diagnostics',
      title: t('diagnostics'),
      description: t('diagnosticsDesc'),
      icon: <Gear size={20} />,
      category: 'system',
      status: 'stable',
      hasNotification: systemHealth && systemHealth.overall < 80
    },
    
    // Advanced Features
    {
      id: 'journal',
      title: language === 'ru' ? 'Журнал Проекта' : 'Project Journal',
      description: language === 'ru' ? 'Журналирование и интеграция проекта' : 'Project journaling and integration',
      icon: <FileText size={20} />,
      category: 'advanced',
      status: 'stable'
    },
    {
      id: 'microtasks',
      title: language === 'ru' ? 'Микро-Задачи' : 'Micro Tasks',
      description: language === 'ru' ? 'Управление мелкими задачами' : 'Micro task management',
      icon: <ListChecks size={20} />,
      category: 'advanced',
      status: 'beta'
    },
    {
      id: 'integration',
      title: language === 'ru' ? 'Интеграция' : 'Integration',
      description: language === 'ru' ? 'Системная интеграция и тестирование' : 'System integration and testing',
      icon: <Graph size={20} />,
      category: 'advanced',
      status: 'beta'
    },
    {
      id: 'testing',
      title: language === 'ru' ? 'E2E Тестирование' : 'E2E Testing',
      description: language === 'ru' ? 'Сквозное тестирование системы' : 'End-to-end system testing',
      icon: <Bug size={20} />,
      category: 'advanced',
      status: 'experimental'
    },
    {
      id: 'analytics',
      title: language === 'ru' ? 'Аналитика' : 'Analytics',
      description: language === 'ru' ? 'Расширенная аналитика проекта' : 'Advanced project analytics',
      icon: <ChartLine size={20} />,
      category: 'advanced',
      status: 'stable'
    },
    {
      id: 'notifications',
      title: language === 'ru' ? 'Уведомления' : 'Notifications',
      description: language === 'ru' ? 'Система уведомлений и alerts' : 'Notification and alert system',
      icon: <Bell size={20} />,
      category: 'advanced',
      status: 'stable'
    }
  ];

  const categories = [
    { id: 'all', title: t('allCategories'), count: menuItems.length },
    { id: 'core', title: t('coreAnalysis'), count: menuItems.filter(item => item.category === 'core').length },
    { id: 'ai', title: t('aiTools'), count: menuItems.filter(item => item.category === 'ai').length },
    { id: 'system', title: t('systemTools'), count: menuItems.filter(item => item.category === 'system').length },
    { id: 'advanced', title: t('advancedFeatures'), count: menuItems.filter(item => item.category === 'advanced').length }
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'beta': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'experimental': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft size={16} className="mr-2" />
              {t('backToProject')}
            </Button>
            <div>
              <h1 className="text-xl font-bold">{t('navigationMenu')}</h1>
              {projectTitle && (
                <p className="text-sm text-muted-foreground">{projectTitle}</p>
              )}
            </div>
          </div>
          
          {/* System Health Indicator */}
          {systemHealth && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                systemHealth.overall >= 90 ? 'bg-green-500' :
                systemHealth.overall >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              } ${systemHealth.overall < 100 ? 'animate-pulse' : ''}`} />
              <span className="text-xs text-muted-foreground">
                {systemHealth.overall >= 90 ? t('systemHealthGood') :
                 systemHealth.overall >= 70 ? t('systemHealthWarning') : t('systemHealthCritical')}
              </span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPages')}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.title}
              <Badge variant="secondary" className="ml-2 text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Navigation Grid */}
      <ScrollArea className="h-[calc(100vh-200px)] p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map(item => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                currentPage === item.id ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-primary/10 text-primary ${
                      currentPage === item.id ? 'bg-primary text-primary-foreground' : ''
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {item.hasNotification && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                    {item.status && (
                      <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                        {t(item.status)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                
                {currentPage === item.id && (
                  <div className="mt-3 text-xs text-primary font-medium">
                    {language === 'ru' ? 'Текущая страница' : 'Current page'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <MagnifyingGlass size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {language === 'ru' ? 'Страницы не найдены' : 'No pages found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ru' 
                ? 'Попробуйте изменить поисковый запрос или фильтр категорий'
                : 'Try adjusting your search query or category filter'
              }
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NavigationMenu;