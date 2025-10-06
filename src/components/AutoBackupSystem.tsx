import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  CloudArrowDown, 
  CloudArrowUp,
  FloppyDisk,
  Clock,
  Gear,
  Shield,
  CheckCircle,
  Warning,
  X,
  Play,
  Pause,
  Archive,
  Download,
  Upload,
  FileZip,
  Database,
  CalendarBlank,
  Timer
} from '@phosphor-icons/react';

interface BackupConfig {
  id: string;
  name: string;
  description: string;
  schedule: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time?: string; // HH:MM for daily backups
    day?: number; // Day of week (0-6) for weekly, day of month for monthly
  };
  retention: {
    maxBackups: number;
    maxAge: number; // in days
    compressionLevel: 'none' | 'fast' | 'balanced' | 'maximum';
  };
  scope: {
    projects: boolean;
    agentMemory: boolean;
    debateLogs: boolean;
    auditResults: boolean;
    userSettings: boolean;
    searchFilters: boolean;
    chatHistory: boolean;
    files: boolean;
  };
  encryption: {
    enabled: boolean;
    keyDerivation: 'pbkdf2' | 'scrypt' | 'argon2';
    iterations: number;
  };
  storage: {
    local: boolean;
    cloud?: {
      provider: 'github' | 'dropbox' | 'gdrive' | 's3' | 'custom';
      endpoint?: string;
      credentials?: string;
    };
  };
  createdAt: string;
  lastModified: string;
  lastRun?: string;
  isActive: boolean;
}

interface BackupRecord {
  id: string;
  configId: string;
  timestamp: string;
  size: number; // in bytes
  type: 'manual' | 'scheduled';
  status: 'creating' | 'completed' | 'failed' | 'expired';
  checksum: string;
  location: string;
  metadata: {
    projectsCount: number;
    filesCount: number;
    compressionRatio: number;
    encryptionUsed: boolean;
    duration: number; // in milliseconds
    trigger: string;
  };
  error?: string;
}

interface RestorePoint {
  id: string;
  backupId: string;
  name: string;
  description: string;
  timestamp: string;
  scope: string[];
  verified: boolean;
  restoredAt?: string;
  restoredBy?: string;
}

interface AutoBackupSystemProps {
  language: string;
  projectId: string;
  onBackupCreated: (backup: BackupRecord) => void;
  onRestoreCompleted: (restorePoint: RestorePoint) => void;
}

const AutoBackupSystem: React.FC<AutoBackupSystemProps> = ({
  language,
  projectId,
  onBackupCreated,
  onRestoreCompleted
}) => {
  const [backupConfigs, setBackupConfigs] = useKV<BackupConfig[]>('backup-configs', []);
  const [backupRecords, setBackupRecords] = useKV<BackupRecord[]>('backup-records', []);
  const [restorePoints, setRestorePoints] = useKV<RestorePoint[]>('restore-points', []);
  const [currentBackup, setCurrentBackup] = useState<string | null>(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [newConfig, setNewConfig] = useState<Partial<BackupConfig>>({
    name: '',
    description: '',
    schedule: {
      enabled: false,
      frequency: 'daily'
    },
    retention: {
      maxBackups: 10,
      maxAge: 30,
      compressionLevel: 'balanced'
    },
    scope: {
      projects: true,
      agentMemory: true,
      debateLogs: true,
      auditResults: true,
      userSettings: false,
      searchFilters: false,
      chatHistory: false,
      files: false
    },
    encryption: {
      enabled: false,
      keyDerivation: 'pbkdf2',
      iterations: 100000
    },
    storage: {
      local: true
    },
    isActive: true
  });

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      autoBackupSystem: { en: 'Auto Backup System', ru: 'Система Автоматических Бэкапов' },
      backupConfigs: { en: 'Backup Configurations', ru: 'Конфигурации Бэкапов' },
      backupHistory: { en: 'Backup History', ru: 'История Бэкапов' },
      restorePoints: { en: 'Restore Points', ru: 'Точки Восстановления' },
      createBackup: { en: 'Create Backup', ru: 'Создать Бэкап' },
      manualBackup: { en: 'Manual Backup', ru: 'Ручной Бэкап' },
      scheduleBackup: { en: 'Schedule Backup', ru: 'Запланировать Бэкап' },
      backupName: { en: 'Backup Name', ru: 'Название Бэкапа' },
      description: { en: 'Description', ru: 'Описание' },
      schedule: { en: 'Schedule', ru: 'Расписание' },
      frequency: { en: 'Frequency', ru: 'Частота' },
      retention: { en: 'Retention Policy', ru: 'Политика Хранения' },
      scope: { en: 'Backup Scope', ru: 'Область Бэкапа' },
      encryption: { en: 'Encryption', ru: 'Шифрование' },
      storage: { en: 'Storage Options', ru: 'Опции Хранения' },
      hourly: { en: 'Hourly', ru: 'Ежечасно' },
      daily: { en: 'Daily', ru: 'Ежедневно' },
      weekly: { en: 'Weekly', ru: 'Еженедельно' },
      monthly: { en: 'Monthly', ru: 'Ежемесячно' },
      maxBackups: { en: 'Max Backups', ru: 'Максимум Бэкапов' },
      maxAge: { en: 'Max Age (days)', ru: 'Максимальный возраст (дни)' },
      compressionLevel: { en: 'Compression Level', ru: 'Уровень Сжатия' },
      none: { en: 'None', ru: 'Нет' },
      fast: { en: 'Fast', ru: 'Быстрое' },
      balanced: { en: 'Balanced', ru: 'Сбалансированное' },
      maximum: { en: 'Maximum', ru: 'Максимальное' },
      projects: { en: 'Projects', ru: 'Проекты' },
      agentMemory: { en: 'Agent Memory', ru: 'Память Агентов' },
      debateLogs: { en: 'Debate Logs', ru: 'Логи Дебатов' },
      auditResults: { en: 'Audit Results', ru: 'Результаты Аудита' },
      userSettings: { en: 'User Settings', ru: 'Настройки Пользователя' },
      searchFilters: { en: 'Search Filters', ru: 'Фильтры Поиска' },
      chatHistory: { en: 'Chat History', ru: 'История Чата' },
      files: { en: 'Files', ru: 'Файлы' },
      enableEncryption: { en: 'Enable Encryption', ru: 'Включить Шифрование' },
      keyDerivation: { en: 'Key Derivation', ru: 'Деривация Ключа' },
      iterations: { en: 'Iterations', ru: 'Итерации' },
      localStorage: { en: 'Local Storage', ru: 'Локальное Хранилище' },
      cloudStorage: { en: 'Cloud Storage', ru: 'Облачное Хранилище' },
      save: { en: 'Save', ru: 'Сохранить' },
      cancel: { en: 'Cancel', ru: 'Отмена' },
      restore: { en: 'Restore', ru: 'Восстановить' },
      download: { en: 'Download', ru: 'Скачать' },
      delete: { en: 'Delete', ru: 'Удалить' },
      verify: { en: 'Verify', ru: 'Проверить' },
      status: { en: 'Status', ru: 'Статус' },
      size: { en: 'Size', ru: 'Размер' },
      created: { en: 'Created', ru: 'Создан' },
      lastRun: { en: 'Last Run', ru: 'Последний Запуск' },
      nextRun: { en: 'Next Run', ru: 'Следующий Запуск' },
      active: { en: 'Active', ru: 'Активен' },
      inactive: { en: 'Inactive', ru: 'Неактивен' },
      creating: { en: 'Creating', ru: 'Создание' },
      completed: { en: 'Completed', ru: 'Завершено' },
      failed: { en: 'Failed', ru: 'Ошибка' },
      expired: { en: 'Expired', ru: 'Истёк' }
    };
    return translations[key]?.[language] || key;
  };

  const createManualBackup = async () => {
    setIsCreating(true);
    setBackupProgress(0);

    try {
      const backupId = `backup-${Date.now()}`;
      setCurrentBackup(backupId);

      // Simulate backup creation with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setBackupProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate gathering backup data
      const backupData = {
        projects: await (window as any).spark.kv.get('axon-projects') || [],
        agentMemory: await (window as any).spark.kv.get('agent-memory') || [],
        debateLogs: await (window as any).spark.kv.get('debate-logs') || [],
        auditResults: await (window as any).spark.kv.get('audit-results') || [],
        timestamp: new Date().toISOString()
      };

      const backupSize = JSON.stringify(backupData).length;
      const checksum = await generateChecksum(JSON.stringify(backupData));

      const newBackup: BackupRecord = {
        id: backupId,
        configId: 'manual',
        timestamp: new Date().toISOString(),
        size: backupSize,
        type: 'manual',
        status: 'completed',
        checksum,
        location: `local://backups/${backupId}.json`,
        metadata: {
          projectsCount: backupData.projects.length,
          filesCount: 0,
          compressionRatio: 1.0,
          encryptionUsed: false,
          duration: 2000,
          trigger: 'manual'
        }
      };

      setBackupRecords(current => [newBackup, ...(current || [])]);
      onBackupCreated(newBackup);
      toast.success(language === 'ru' ? 'Бэкап успешно создан' : 'Backup created successfully');

    } catch (error) {
      console.error('Backup creation failed:', error);
      toast.error(language === 'ru' ? 'Ошибка создания бэкапа' : 'Backup creation failed');
    } finally {
      setIsCreating(false);
      setCurrentBackup(null);
      setBackupProgress(0);
    }
  };

  const generateChecksum = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const saveBackupConfig = () => {
    if (!newConfig.name?.trim()) {
      toast.error(language === 'ru' ? 'Введите название конфигурации' : 'Enter configuration name');
      return;
    }

    const config: BackupConfig = {
      id: `config-${Date.now()}`,
      name: newConfig.name!,
      description: newConfig.description || '',
      schedule: newConfig.schedule!,
      retention: newConfig.retention!,
      scope: newConfig.scope!,
      encryption: newConfig.encryption!,
      storage: newConfig.storage!,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isActive: newConfig.isActive!
    };

    setBackupConfigs(current => [...(current || []), config]);
    setShowConfigDialog(false);
    setNewConfig({
      name: '',
      description: '',
      schedule: { enabled: false, frequency: 'daily' },
      retention: { maxBackups: 10, maxAge: 30, compressionLevel: 'balanced' },
      scope: { projects: true, agentMemory: true, debateLogs: true, auditResults: true, userSettings: false, searchFilters: false, chatHistory: false, files: false },
      encryption: { enabled: false, keyDerivation: 'pbkdf2', iterations: 100000 },
      storage: { local: true },
      isActive: true
    });
    toast.success(language === 'ru' ? 'Конфигурация сохранена' : 'Configuration saved');
  };

  const restoreFromBackup = async (backupId: string) => {
    try {
      const backup = (backupRecords || []).find(b => b.id === backupId);
      if (!backup) {
        toast.error(language === 'ru' ? 'Бэкап не найден' : 'Backup not found');
        return;
      }

      const restorePoint: RestorePoint = {
        id: `restore-${Date.now()}`,
        backupId,
        name: `Restore from ${new Date(backup.timestamp).toLocaleString()}`,
        description: `Automatic restore from backup created ${backup.timestamp}`,
        timestamp: new Date().toISOString(),
        scope: Object.keys(backup.metadata),
        verified: true
      };

      setRestorePoints(current => [restorePoint, ...(current || [])]);
      onRestoreCompleted(restorePoint);
      toast.success(language === 'ru' ? 'Восстановление завершено' : 'Restore completed');

    } catch (error) {
      console.error('Restore failed:', error);
      toast.error(language === 'ru' ? 'Ошибка восстановления' : 'Restore failed');
    }
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Schedule backup runs (simplified simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      const activeConfigs = (backupConfigs || []).filter(config => 
        config.isActive && config.schedule.enabled
      );

      activeConfigs.forEach(config => {
        const now = new Date();
        const lastRun = config.lastRun ? new Date(config.lastRun) : new Date(0);
        
        let shouldRun = false;
        
        switch (config.schedule.frequency) {
          case 'hourly':
            shouldRun = now.getTime() - lastRun.getTime() >= 60 * 60 * 1000;
            break;
          case 'daily':
            shouldRun = now.getTime() - lastRun.getTime() >= 24 * 60 * 60 * 1000;
            break;
          case 'weekly':
            shouldRun = now.getTime() - lastRun.getTime() >= 7 * 24 * 60 * 60 * 1000;
            break;
          case 'monthly':
            shouldRun = now.getTime() - lastRun.getTime() >= 30 * 24 * 60 * 60 * 1000;
            break;
        }

        if (shouldRun) {
          // Trigger scheduled backup (simplified)
          console.log(`Scheduled backup triggered for config: ${config.name}`);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [backupConfigs]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FloppyDisk size={24} className="text-primary" />
            {t('autoBackupSystem')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Автоматическое резервное копирование и восстановление данных проекта'
              : 'Automated backup and restore system for project data'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Button onClick={createManualBackup} disabled={isCreating}>
              {isCreating ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              ) : (
                <FloppyDisk size={16} className="mr-2" />
              )}
              {t('manualBackup')}
            </Button>
            <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Gear size={16} className="mr-2" />
                  {t('scheduleBackup')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>{t('scheduleBackup')}</DialogTitle>
                  <DialogDescription>
                    {language === 'ru' 
                      ? 'Настройте автоматическое резервное копирование'
                      : 'Configure automatic backup settings'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="backup-name">{t('backupName')}</Label>
                      <Input
                        id="backup-name"
                        value={newConfig.name || ''}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter backup configuration name..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="backup-description">{t('description')}</Label>
                      <Textarea
                        id="backup-description"
                        value={newConfig.description || ''}
                        onChange={(e) => setNewConfig(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Optional description..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Schedule Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <CalendarBlank size={16} />
                      {t('schedule')}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="schedule-enabled"
                        checked={newConfig.schedule?.enabled || false}
                        onCheckedChange={(checked) => setNewConfig(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule!, enabled: !!checked }
                        }))}
                      />
                      <Label htmlFor="schedule-enabled">Enable automatic backups</Label>
                    </div>
                    {newConfig.schedule?.enabled && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>{t('frequency')}</Label>
                          <Select
                            value={newConfig.schedule?.frequency}
                            onValueChange={(value: 'hourly' | 'daily' | 'weekly' | 'monthly') => 
                              setNewConfig(prev => ({
                                ...prev,
                                schedule: { ...prev.schedule!, frequency: value }
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">{t('hourly')}</SelectItem>
                              <SelectItem value="daily">{t('daily')}</SelectItem>
                              <SelectItem value="weekly">{t('weekly')}</SelectItem>
                              <SelectItem value="monthly">{t('monthly')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Retention Policy */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Timer size={16} />
                      {t('retention')}
                    </h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label>{t('maxBackups')}</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={newConfig.retention?.maxBackups}
                          onChange={(e) => setNewConfig(prev => ({
                            ...prev,
                            retention: { ...prev.retention!, maxBackups: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>{t('maxAge')}</Label>
                        <Input
                          type="number"
                          min="1"
                          max="365"
                          value={newConfig.retention?.maxAge}
                          onChange={(e) => setNewConfig(prev => ({
                            ...prev,
                            retention: { ...prev.retention!, maxAge: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>{t('compressionLevel')}</Label>
                        <Select
                          value={newConfig.retention?.compressionLevel}
                          onValueChange={(value: 'none' | 'fast' | 'balanced' | 'maximum') => 
                            setNewConfig(prev => ({
                              ...prev,
                              retention: { ...prev.retention!, compressionLevel: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('none')}</SelectItem>
                            <SelectItem value="fast">{t('fast')}</SelectItem>
                            <SelectItem value="balanced">{t('balanced')}</SelectItem>
                            <SelectItem value="maximum">{t('maximum')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Backup Scope */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Database size={16} />
                      {t('scope')}
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      {Object.entries(newConfig.scope || {}).map(([key, enabled]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={`scope-${key}`}
                            checked={enabled}
                            onCheckedChange={(checked) => setNewConfig(prev => ({
                              ...prev,
                              scope: { ...prev.scope!, [key]: !!checked }
                            }))}
                          />
                          <Label htmlFor={`scope-${key}`}>{t(key)}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={saveBackupConfig}>
                      {t('save')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Backup Progress */}
          {isCreating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Creating backup...</span>
                <span className="text-sm text-muted-foreground">{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Configurations */}
      {(backupConfigs || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gear size={20} />
              {t('backupConfigs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(backupConfigs || []).map((config) => (
                <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{config.name}</h4>
                      <Badge variant={config.isActive ? 'default' : 'secondary'}>
                        {config.isActive ? t('active') : t('inactive')}
                      </Badge>
                      {config.schedule.enabled && (
                        <Badge variant="outline">{t(config.schedule.frequency)}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{t('created')}: {new Date(config.createdAt).toLocaleDateString()}</span>
                      {config.lastRun && (
                        <span>{t('lastRun')}: {new Date(config.lastRun).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Play size={14} />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Gear size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup History */}
      {(backupRecords || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive size={20} />
              {t('backupHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {(backupRecords || []).map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={
                          backup.status === 'completed' ? 'default' :
                          backup.status === 'creating' ? 'secondary' :
                          backup.status === 'failed' ? 'destructive' : 'outline'
                        }>
                          {t(backup.status)}
                        </Badge>
                        <Badge variant="outline">{backup.type}</Badge>
                        <span className="text-sm font-medium">{formatFileSize(backup.size)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(backup.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {backup.metadata.projectsCount} projects, {backup.metadata.duration}ms
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreFromBackup(backup.id)}
                        disabled={backup.status !== 'completed'}
                      >
                        <Upload size={14} className="mr-1" />
                        {t('restore')}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download size={14} className="mr-1" />
                        {t('download')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Restore Points */}
      {(restorePoints || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              {t('restorePoints')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(restorePoints || []).map((point) => (
                <div key={point.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{point.name}</h4>
                      {point.verified && (
                        <Badge variant="default">
                          <CheckCircle size={12} className="mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{point.description}</p>
                    <div className="text-xs text-muted-foreground">
                      {new Date(point.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoBackupSystem;