import React, { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Flag,
  Plus,
  Trash,
  Eye,
  EyeSlash,
  CheckCircle,
  Warning,
  Info,
  Download,
  Upload,
  Percent,
  Users,
  Calendar,
  Tag,
  FloppyDisk,
  MagnifyingGlass
} from '@phosphor-icons/react';

/**
 * Feature Flag Types
 */
type FlagStatus = 'enabled' | 'disabled' | 'rollout';
type FlagEnvironment = 'development' | 'staging' | 'production' | 'all';
type FlagCategory = 'feature' | 'experiment' | 'killswitch' | 'operational';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  status: FlagStatus;
  category: FlagCategory;
  environment: FlagEnvironment;
  rolloutPercentage?: number; // For gradual rollout (0-100)
  enabledForUsers?: string[]; // User IDs or emails
  metadata?: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    owner: string;
    jiraTicket?: string;
    expiresAt?: string;
  };
  dependencies?: string[]; // IDs of flags this depends on
  tags?: string[];
}

interface FeatureFlagsManagerProps {
  projectId: string;
  locale?: 'en' | 'ru';
}

/**
 * FeatureFlagsManager Component
 * 
 * Comprehensive feature flags management system for controlled feature rollouts.
 * 
 * Features:
 * - Enable/disable features without code changes
 * - Gradual rollout (percentage-based)
 * - User-specific targeting
 * - Environment-based flags (dev/staging/prod)
 * - Flag categories and dependencies
 * - Import/export configuration
 * - Audit trail
 */
export const FeatureFlagsManager: React.FC<FeatureFlagsManagerProps> = ({ 
  projectId,
  locale = 'en' 
}) => {
  // Memoize KV keys to prevent infinite loops
  const flagsKey = useMemo(() => `feature-flags-${projectId}`, [projectId]);
  const auditKey = useMemo(() => `feature-flags-audit-${projectId}`, [projectId]);

  // State
  const [flags, setFlags] = useKV<FeatureFlag[]>(flagsKey, []);
  const [auditLog, setAuditLog] = useKV<any[]>(auditKey, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FlagStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<FlagCategory | 'all'>('all');
  const [filterEnvironment, setFilterEnvironment] = useState<FlagEnvironment | 'all'>('all');
  const [newFlagDialogOpen, setNewFlagDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  // New flag form state
  const [newFlag, setNewFlag] = useState<Partial<FeatureFlag>>({
    name: '',
    description: '',
    status: 'disabled',
    category: 'feature',
    environment: 'all',
    rolloutPercentage: 0,
    tags: []
  });

  // Translations
  const t = {
    en: {
      title: 'Feature Flags Manager',
      subtitle: 'Control feature rollouts and experiments',
      addFlag: 'Add Flag',
      search: 'Search flags...',
      filterStatus: 'Filter by Status',
      filterCategory: 'Filter by Category',
      filterEnvironment: 'Filter by Environment',
      all: 'All',
      enabled: 'Enabled',
      disabled: 'Disabled',
      rollout: 'Rollout',
      feature: 'Feature',
      experiment: 'Experiment',
      killswitch: 'Kill Switch',
      operational: 'Operational',
      development: 'Development',
      staging: 'Staging',
      production: 'Production',
      noFlags: 'No feature flags found',
      createFirst: 'Create your first feature flag to get started',
      flagName: 'Flag Name',
      description: 'Description',
      status: 'Status',
      category: 'Category',
      environment: 'Environment',
      rolloutPercentage: 'Rollout Percentage',
      tags: 'Tags (comma separated)',
      owner: 'Owner',
      jiraTicket: 'JIRA Ticket',
      expiresAt: 'Expires At',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      export: 'Export',
      import: 'Import',
      auditLog: 'Audit Log',
      createdAt: 'Created',
      updatedAt: 'Updated',
      createdBy: 'Created By',
      confirmDelete: 'Are you sure you want to delete this flag?',
      deleteSuccess: 'Flag deleted successfully',
      saveSuccess: 'Flag saved successfully',
      importSuccess: 'Flags imported successfully',
      exportSuccess: 'Flags exported successfully',
      validation: {
        nameRequired: 'Flag name is required',
        nameDuplicate: 'Flag name already exists',
        descriptionRequired: 'Description is required',
        rolloutRange: 'Rollout percentage must be between 0 and 100'
      }
    },
    ru: {
      title: 'Менеджер Feature Flags',
      subtitle: 'Управление выкаткой функций и экспериментами',
      addFlag: 'Добавить флаг',
      search: 'Поиск флагов...',
      filterStatus: 'Фильтр по статусу',
      filterCategory: 'Фильтр по категории',
      filterEnvironment: 'Фильтр по окружению',
      all: 'Все',
      enabled: 'Включено',
      disabled: 'Отключено',
      rollout: 'Постепенная выкатка',
      feature: 'Функция',
      experiment: 'Эксперимент',
      killswitch: 'Аварийный выключатель',
      operational: 'Операционный',
      development: 'Разработка',
      staging: 'Тестирование',
      production: 'Продакшен',
      noFlags: 'Feature flags не найдены',
      createFirst: 'Создайте первый feature flag для начала работы',
      flagName: 'Имя флага',
      description: 'Описание',
      status: 'Статус',
      category: 'Категория',
      environment: 'Окружение',
      rolloutPercentage: 'Процент выкатки',
      tags: 'Теги (через запятую)',
      owner: 'Владелец',
      jiraTicket: 'JIRA тикет',
      expiresAt: 'Истекает',
      save: 'Сохранить',
      cancel: 'Отмена',
      edit: 'Редактировать',
      delete: 'Удалить',
      export: 'Экспорт',
      import: 'Импорт',
      auditLog: 'Журнал аудита',
      createdAt: 'Создано',
      updatedAt: 'Обновлено',
      createdBy: 'Создал',
      confirmDelete: 'Вы уверены, что хотите удалить этот флаг?',
      deleteSuccess: 'Флаг успешно удален',
      saveSuccess: 'Флаг успешно сохранен',
      importSuccess: 'Флаги успешно импортированы',
      exportSuccess: 'Флаги успешно экспортированы',
      validation: {
        nameRequired: 'Имя флага обязательно',
        nameDuplicate: 'Флаг с таким именем уже существует',
        descriptionRequired: 'Описание обязательно',
        rolloutRange: 'Процент выкатки должен быть от 0 до 100'
      }
    }
  };

  const text = t[locale];

  // Filter flags based on search and filters
  const filteredFlags = useMemo(() => {
    if (!flags) return [];
    
    return flags.filter(flag => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus = filterStatus === 'all' || flag.status === filterStatus;

      // Category filter
      const matchesCategory = filterCategory === 'all' || flag.category === filterCategory;

      // Environment filter
      const matchesEnvironment = filterEnvironment === 'all' || 
        flag.environment === filterEnvironment || 
        flag.environment === 'all';

      return matchesSearch && matchesStatus && matchesCategory && matchesEnvironment;
    });
  }, [flags, searchQuery, filterStatus, filterCategory, filterEnvironment]);

  // Validate flag
  const validateFlag = (flag: Partial<FeatureFlag>): string | null => {
    if (!flag.name || flag.name.trim() === '') {
      return text.validation.nameRequired;
    }

    // Check for duplicate name (excluding the flag being edited)
    const isDuplicate = flags?.some(f => 
      f.name === flag.name && (!editingFlag || f.id !== editingFlag.id)
    );
    if (isDuplicate) {
      return text.validation.nameDuplicate;
    }

    if (!flag.description || flag.description.trim() === '') {
      return text.validation.descriptionRequired;
    }

    if (flag.rolloutPercentage !== undefined && 
        (flag.rolloutPercentage < 0 || flag.rolloutPercentage > 100)) {
      return text.validation.rolloutRange;
    }

    return null;
  };

  // Add audit log entry
  const addAuditEntry = (action: string, flagId: string, details: any) => {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      flagId,
      details,
      user: 'current-user' // In real app, get from auth context
    };

    setAuditLog(prev => [entry, ...(prev || [])].slice(0, 100)); // Keep last 100 entries
  };

  // Save flag (create or update)
  const handleSaveFlag = () => {
    const validationError = validateFlag(newFlag);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const now = new Date().toISOString();
    
    if (editingFlag) {
      // Update existing flag
      const updatedFlag: FeatureFlag = {
        ...editingFlag,
        ...newFlag,
        metadata: {
          ...editingFlag.metadata,
          updatedAt: now
        }
      } as FeatureFlag;

      setFlags(prev => prev?.map(f => f.id === editingFlag.id ? updatedFlag : f) || []);
      addAuditEntry('update', updatedFlag.id, { before: editingFlag, after: updatedFlag });
      toast.success(text.saveSuccess);
    } else {
      // Create new flag
      const flagId = `flag-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const createdFlag: FeatureFlag = {
        id: flagId,
        name: newFlag.name!,
        description: newFlag.description!,
        status: newFlag.status || 'disabled',
        category: newFlag.category || 'feature',
        environment: newFlag.environment || 'all',
        rolloutPercentage: newFlag.rolloutPercentage || 0,
        tags: newFlag.tags || [],
        metadata: {
          createdAt: now,
          updatedAt: now,
          createdBy: 'current-user',
          owner: newFlag.metadata?.owner || 'current-user'
        }
      };

      setFlags(prev => [...(prev || []), createdFlag]);
      addAuditEntry('create', createdFlag.id, createdFlag);
      toast.success(text.saveSuccess);
    }

    // Reset form
    setNewFlagDialogOpen(false);
    setEditingFlag(null);
    setNewFlag({
      name: '',
      description: '',
      status: 'disabled',
      category: 'feature',
      environment: 'all',
      rolloutPercentage: 0,
      tags: []
    });
  };

  // Delete flag
  const handleDeleteFlag = (flagId: string) => {
    const flag = flags?.find(f => f.id === flagId);
    if (!flag) return;

    if (window.confirm(text.confirmDelete)) {
      setFlags(prev => prev?.filter(f => f.id !== flagId) || []);
      addAuditEntry('delete', flagId, flag);
      toast.success(text.deleteSuccess);
    }
  };

  // Toggle flag status
  const handleToggleFlag = (flagId: string) => {
    const flag = flags?.find(f => f.id === flagId);
    if (!flag) return;

    const newStatus: FlagStatus = flag.status === 'enabled' ? 'disabled' : 'enabled';
    const updatedFlag: FeatureFlag = {
      ...flag,
      status: newStatus,
      metadata: {
        ...flag.metadata!,
        updatedAt: new Date().toISOString()
      }
    };

    setFlags(prev => prev?.map(f => f.id === flagId ? updatedFlag : f) || []);
    addAuditEntry('toggle', flagId, { from: flag.status, to: newStatus });
    toast.success(`Flag ${newStatus === 'enabled' ? 'enabled' : 'disabled'}`);
  };

  // Edit flag
  const handleEditFlag = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setNewFlag({
      name: flag.name,
      description: flag.description,
      status: flag.status,
      category: flag.category,
      environment: flag.environment,
      rolloutPercentage: flag.rolloutPercentage,
      tags: flag.tags,
      metadata: flag.metadata
    });
    setNewFlagDialogOpen(true);
  };

  // Export flags
  const handleExportFlags = () => {
    const dataStr = JSON.stringify({ flags, auditLog }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feature-flags-${projectId}-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(text.exportSuccess);
  };

  // Import flags
  const handleImportFlags = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.flags && Array.isArray(data.flags)) {
          setFlags(data.flags);
          if (data.auditLog && Array.isArray(data.auditLog)) {
            setAuditLog(data.auditLog);
          }
          toast.success(text.importSuccess);
        } else {
          toast.error('Invalid file format');
        }
      } catch {
        toast.error('Failed to parse file');
      }
    };
    reader.readAsText(file);
  };

  // Get status badge
  const getStatusBadge = (status: FlagStatus) => {
    const variants: Record<FlagStatus, any> = {
      enabled: 'default',
      disabled: 'destructive',
      rollout: 'secondary'
    };

    return (
      <Badge variant={variants[status]}>
        {text[status]}
      </Badge>
    );
  };

  const getCategoryIcon = (category: FlagCategory) => {
    switch (category) {
      case 'feature':
        return <Flag className="w-4 h-4" />;
      case 'experiment':
        return <Info className="w-4 h-4" />;
      case 'killswitch':
        return <Warning className="w-4 h-4" />;
      case 'operational':
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Flag className="w-8 h-8 text-purple-500" weight="duotone" />
          <h1 className="text-3xl font-bold">{text.title}</h1>
        </div>
        <p className="text-muted-foreground">{text.subtitle}</p>
      </div>

      <Tabs defaultValue="flags" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flags" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {text.auditLog}
          </TabsTrigger>
        </TabsList>

        {/* Flags Tab */}
        <TabsContent value="flags" className="space-y-6">
          {/* Toolbar */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={text.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FlagStatus | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder={text.filterStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{text.all}</SelectItem>
                    <SelectItem value="enabled">{text.enabled}</SelectItem>
                    <SelectItem value="disabled">{text.disabled}</SelectItem>
                    <SelectItem value="rollout">{text.rollout}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as FlagCategory | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder={text.filterCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{text.all}</SelectItem>
                    <SelectItem value="feature">{text.feature}</SelectItem>
                    <SelectItem value="experiment">{text.experiment}</SelectItem>
                    <SelectItem value="killswitch">{text.killswitch}</SelectItem>
                    <SelectItem value="operational">{text.operational}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Environment Filter */}
                <Select value={filterEnvironment} onValueChange={(v) => setFilterEnvironment(v as FlagEnvironment | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder={text.filterEnvironment} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{text.all}</SelectItem>
                    <SelectItem value="development">{text.development}</SelectItem>
                    <SelectItem value="staging">{text.staging}</SelectItem>
                    <SelectItem value="production">{text.production}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="my-4" />

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Dialog open={newFlagDialogOpen} onOpenChange={setNewFlagDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingFlag(null);
                      setNewFlag({
                        name: '',
                        description: '',
                        status: 'disabled',
                        category: 'feature',
                        environment: 'all',
                        rolloutPercentage: 0,
                        tags: []
                      });
                    }}>
                      <Plus className="w-4 h-4 mr-2" />
                      {text.addFlag}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingFlag ? text.edit : text.addFlag}</DialogTitle>
                      <DialogDescription>
                        {editingFlag ? 'Update feature flag configuration' : 'Create a new feature flag'}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* Flag Name */}
                      <div>
                        <Label htmlFor="flag-name">{text.flagName}</Label>
                        <Input
                          id="flag-name"
                          value={newFlag.name || ''}
                          onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
                          placeholder="e.g., new-dashboard-ui"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <Label htmlFor="flag-description">{text.description}</Label>
                        <Textarea
                          id="flag-description"
                          value={newFlag.description || ''}
                          onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
                          placeholder="Describe what this flag controls"
                          rows={3}
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <Label htmlFor="flag-status">{text.status}</Label>
                        <Select
                          value={newFlag.status || 'disabled'}
                          onValueChange={(v) => setNewFlag({ ...newFlag, status: v as FlagStatus })}
                        >
                          <SelectTrigger id="flag-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="enabled">{text.enabled}</SelectItem>
                            <SelectItem value="disabled">{text.disabled}</SelectItem>
                            <SelectItem value="rollout">{text.rollout}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Category */}
                      <div>
                        <Label htmlFor="flag-category">{text.category}</Label>
                        <Select
                          value={newFlag.category || 'feature'}
                          onValueChange={(v) => setNewFlag({ ...newFlag, category: v as FlagCategory })}
                        >
                          <SelectTrigger id="flag-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="feature">{text.feature}</SelectItem>
                            <SelectItem value="experiment">{text.experiment}</SelectItem>
                            <SelectItem value="killswitch">{text.killswitch}</SelectItem>
                            <SelectItem value="operational">{text.operational}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Environment */}
                      <div>
                        <Label htmlFor="flag-environment">{text.environment}</Label>
                        <Select
                          value={newFlag.environment || 'all'}
                          onValueChange={(v) => setNewFlag({ ...newFlag, environment: v as FlagEnvironment })}
                        >
                          <SelectTrigger id="flag-environment">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{text.all}</SelectItem>
                            <SelectItem value="development">{text.development}</SelectItem>
                            <SelectItem value="staging">{text.staging}</SelectItem>
                            <SelectItem value="production">{text.production}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Rollout Percentage (show only if status is 'rollout') */}
                      {newFlag.status === 'rollout' && (
                        <div>
                          <Label htmlFor="flag-rollout">{text.rolloutPercentage}: {newFlag.rolloutPercentage}%</Label>
                          <Input
                            id="flag-rollout"
                            type="number"
                            min="0"
                            max="100"
                            value={newFlag.rolloutPercentage || 0}
                            onChange={(e) => setNewFlag({ ...newFlag, rolloutPercentage: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      )}

                      {/* Tags */}
                      <div>
                        <Label htmlFor="flag-tags">{text.tags}</Label>
                        <Input
                          id="flag-tags"
                          value={newFlag.tags?.join(', ') || ''}
                          onChange={(e) => setNewFlag({ 
                            ...newFlag, 
                            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                          })}
                          placeholder="analytics, ui, experiment"
                        />
                      </div>

                      {/* Owner */}
                      <div>
                        <Label htmlFor="flag-owner">{text.owner}</Label>
                        <Input
                          id="flag-owner"
                          value={newFlag.metadata?.owner || ''}
                          onChange={(e) => setNewFlag({ 
                            ...newFlag, 
                            metadata: { 
                              ...(newFlag.metadata || { createdAt: '', updatedAt: '', createdBy: '', owner: '' }), 
                              owner: e.target.value 
                            }
                          })}
                          placeholder="team-name or user-email"
                        />
                      </div>

                      {/* JIRA Ticket */}
                      <div>
                        <Label htmlFor="flag-jira">{text.jiraTicket}</Label>
                        <Input
                          id="flag-jira"
                          value={newFlag.metadata?.jiraTicket || ''}
                          onChange={(e) => setNewFlag({ 
                            ...newFlag, 
                            metadata: { 
                              ...(newFlag.metadata || { createdAt: '', updatedAt: '', createdBy: '', owner: '' }), 
                              jiraTicket: e.target.value 
                            }
                          })}
                          placeholder="PROJ-123"
                        />
                      </div>

                      {/* Expires At */}
                      <div>
                        <Label htmlFor="flag-expires">{text.expiresAt}</Label>
                        <Input
                          id="flag-expires"
                          type="date"
                          value={newFlag.metadata?.expiresAt || ''}
                          onChange={(e) => setNewFlag({ 
                            ...newFlag, 
                            metadata: { 
                              ...(newFlag.metadata || { createdAt: '', updatedAt: '', createdBy: '', owner: '' }), 
                              expiresAt: e.target.value 
                            }
                          })}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewFlagDialogOpen(false)}>
                        {text.cancel}
                      </Button>
                      <Button onClick={handleSaveFlag}>
                        <FloppyDisk className="w-4 h-4 mr-2" />
                        {text.save}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={handleExportFlags}>
                  <Download className="w-4 h-4 mr-2" />
                  {text.export}
                </Button>

                <Button variant="outline" asChild>
                  <label>
                    <Upload className="w-4 h-4 mr-2" />
                    {text.import}
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportFlags}
                    />
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Flags List */}
          <div className="space-y-4">
            {!flags || flags.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Flag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" weight="duotone" />
                  <h3 className="text-lg font-semibold mb-2">{text.noFlags}</h3>
                  <p className="text-muted-foreground">{text.createFirst}</p>
                </CardContent>
              </Card>
            ) : filteredFlags.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MagnifyingGlass className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No flags match your filters</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              filteredFlags.map(flag => (
                <Card key={flag.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getCategoryIcon(flag.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{flag.name}</CardTitle>
                            {getStatusBadge(flag.status)}
                            {flag.status === 'rollout' && (
                              <Badge variant="outline">
                                <Percent className="w-3 h-3 mr-1" />
                                {flag.rolloutPercentage}%
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{flag.description}</CardDescription>
                          
                          {/* Tags */}
                          {flag.tags && flag.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {flag.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {flag.metadata?.owner || 'Unassigned'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(flag.metadata?.updatedAt || '').toLocaleDateString()}
                            </div>
                            {flag.metadata?.jiraTicket && (
                              <div className="flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                {flag.metadata.jiraTicket}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleFlag(flag.id)}
                        >
                          {flag.status === 'enabled' ? (
                            <EyeSlash className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditFlag(flag)}
                        >
                          {text.edit}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteFlag(flag.id)}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Track all changes to feature flags
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!auditLog || auditLog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No audit entries yet
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLog.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{entry.action}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          Flag: <code className="text-xs bg-muted px-1 py-0.5 rounded">{entry.flagId}</code>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          By: {entry.user}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeatureFlagsManager;
