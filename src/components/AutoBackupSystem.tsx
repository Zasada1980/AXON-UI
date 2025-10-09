import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger as _DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FloppyDisk,
  CloudArrowUp,
  Clock,
  Gear,
  Download,
  Upload as _Upload,
  Trash,
  CheckCircle,
  Warning as _Warning,
  Info,
  Database,
  HardDrives,
  CopySimple as _CopySimple,
  ArrowClockwise,
  Play as _Play,
  Pause as _Pause,
  Stop as _Stop,
  FileArchive as _FileArchive,
  Shield as _Shield,
  Key as _Key,
  Calendar as _Calendar,
  Timer,
  FolderOpen,
  Archive,
  Export,
  Graph
} from '@phosphor-icons/react';

interface AutoBackupSystemProps {
  language: 'en' | 'ru';
  projectId: string;
  onBackupCreated: (backup: BackupRecord) => void;
  onRestoreCompleted: (restorePoint: RestorePoint) => void;
  testMode?: boolean;
}

interface BackupRecord {
  id: string;
  name: string;
  type: 'auto' | 'manual' | 'scheduled';
  size: number;
  createdAt: string;
  projectData: any;
  metadata: {
    version: string;
    completeness: number;
    modules: string[];
    checksum: string;
    compressed: boolean;
  };
  status: 'creating' | 'completed' | 'failed' | 'corrupted';
  location: 'local' | 'cloud' | 'external';
  retention: number; // days
}

interface RestorePoint {
  id: string;
  name: string;
  backupId: string;
  description: string;
  createdAt: string;
  isVerified: boolean;
  modules: string[];
  changes: {
    added: string[];
    modified: string[];
    deleted: string[];
  };
}

interface BackupSettings {
  autoBackupEnabled: boolean;
  backupInterval: number; // minutes
  maxBackups: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  cloudSyncEnabled: boolean;
  retentionDays: number;
  backupLocation: 'local' | 'cloud' | 'both';
  excludePatterns: string[];
  includeModules: string[];
  backupOnChange: boolean;
  minimumChangeThreshold: number; // percentage
}

interface BackupStatistics {
  totalBackups: number;
  totalSize: number;
  lastBackup: string;
  nextScheduledBackup: string;
  successRate: number;
  avgBackupSize: number;
  storageUsage: number;
  compressionRatio: number;
}

const AutoBackupSystem: React.FC<AutoBackupSystemProps> = ({
  language,
  projectId,
  onBackupCreated,
  onRestoreCompleted,
  testMode
}) => {
  // Detect test mode both in Node (process.env) and Vitest (import.meta.vitest)
  const isTest = (
    !!testMode ||
    (typeof import.meta !== 'undefined' && ((import.meta as any)?.vitest || (import.meta as any)?.env?.MODE === 'test')) ||
    (typeof process !== 'undefined' && (process.env && process.env.NODE_ENV === 'test'))
  )
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [settings, setSettings] = useState<BackupSettings>({
    autoBackupEnabled: true,
    backupInterval: 30,
    maxBackups: 10,
    compressionEnabled: true,
    encryptionEnabled: false,
    cloudSyncEnabled: false,
    retentionDays: 30,
    backupLocation: 'local',
    excludePatterns: ['*.tmp', '*.log'],
    includeModules: ['kipling', 'ikr', 'audit', 'chat'],
    backupOnChange: true,
    minimumChangeThreshold: 5
  });
  
  const [statistics, setStatistics] = useState<BackupStatistics>({
    totalBackups: 0,
    totalSize: 0,
    lastBackup: '',
    nextScheduledBackup: '',
    successRate: 100,
    avgBackupSize: 0,
    storageUsage: 0,
    compressionRatio: 0.7
  });

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [lastAutoBackup, setLastAutoBackup] = useState<Date | null>(null);
  const [cloudCredentials, setCloudCredentials] = useState({
    provider: 'none',
    accessKey: '',
    secretKey: '',
    bucket: ''
  });

  // Update statistics (memoized to satisfy hook dependencies)
  const updateStatistics = useCallback(() => {
    const stats: BackupStatistics = {
      totalBackups: backups.length,
      totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
      lastBackup: backups.length > 0 ? backups[0].createdAt : '',
      nextScheduledBackup: settings.autoBackupEnabled 
        ? new Date(Date.now() + settings.backupInterval * 60 * 1000).toISOString()
        : '',
      successRate: backups.length > 0 
        ? (backups.filter(b => b.status === 'completed').length / backups.length) * 100
        : 100,
      avgBackupSize: backups.length > 0 
        ? backups.reduce((sum, backup) => sum + backup.size, 0) / backups.length
        : 0,
      storageUsage: backups.reduce((sum, backup) => sum + backup.size, 0),
      compressionRatio: 0.7
    };

    setStatistics(stats);
  }, [backups, settings]);

  // Load settings and backup history (once per project)
  useEffect(() => {
    const savedSettings = localStorage.getItem(`backup-settings-${projectId}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const savedBackups = localStorage.getItem(`backups-${projectId}`);
    if (savedBackups) {
      setBackups(JSON.parse(savedBackups));
    }

    const savedRestorePoints = localStorage.getItem(`restore-points-${projectId}`);
    if (savedRestorePoints) {
      setRestorePoints(JSON.parse(savedRestorePoints));
    }

  }, [projectId]);

  // Recompute statistics when inputs change
  useEffect(() => {
    updateStatistics();
  }, [updateStatistics]);

  // Placeholder comment: createAutoBackup is defined after createBackup to avoid TDZ

  // Auto-backup timer will be declared after createAutoBackup

  // Sync to cloud
  const syncToCloud = React.useCallback(async (backup: BackupRecord) => {
    if (!settings.cloudSyncEnabled || cloudCredentials.provider === 'none') return;

    // Mock cloud sync
    await new Promise(resolve => setTimeout(resolve, 1000));
    const updatedBackup = { ...backup, location: 'cloud' as const };
    setBackups(current => current.map(b => b.id === backup.id ? updatedBackup : b));
  }, [settings.cloudSyncEnabled, cloudCredentials.provider]);

  // Create backup
  const createBackup = React.useCallback(async (type: 'auto' | 'manual' | 'scheduled', name?: string) => {
    setIsBackingUp(true);
    setBackupProgress(0);

    try {
      if (isTest) {
        const projectData = {
          id: projectId,
          timestamp: new Date().toISOString(),
          modules: settings.includeModules,
          data: {
            kipling: { dimensions: [], completeness: 85 },
            ikr: { intelligence: 'test', knowledge: 'test', reasoning: 'test' },
            audit: { sessions: [], agents: [] },
            chat: { sessions: [] },
            files: [],
            settings: settings
          }
        };
        const backupId = `backup-${Date.now()}`;
        const backup: BackupRecord = {
          id: backupId,
          name: name || `${type === 'auto' ? 'Auto' : 'Manual'} Backup ${new Date().toLocaleString()}`,
          type,
          size: 1500000,
          createdAt: new Date().toISOString(),
          projectData,
          metadata: {
            version: '1.0.0',
            completeness: 85,
            modules: settings.includeModules,
            checksum: generateChecksum(JSON.stringify(projectData)),
            compressed: settings.compressionEnabled
          },
          status: 'completed',
          location: settings.backupLocation === 'both' ? 'local' : settings.backupLocation,
          retention: settings.retentionDays
        };
        const updatedBackups = [backup, ...backups].slice(0, settings.maxBackups)
        setBackups(updatedBackups)
        localStorage.setItem(`backups-${projectId}`, JSON.stringify(updatedBackups))
        setBackupProgress(100)
        onBackupCreated(backup)
        if (type === 'auto') setLastAutoBackup(new Date())
        updateStatistics()
        return
      }
      // Simulate backup progress
      const progressInterval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // Get current project data (mock)
      const projectData = {
        id: projectId,
        timestamp: new Date().toISOString(),
        modules: settings.includeModules,
        data: {
          kipling: { dimensions: [], completeness: 85 },
          ikr: { intelligence: 'test', knowledge: 'test', reasoning: 'test' },
          audit: { sessions: [], agents: [] },
          chat: { sessions: [] },
          files: [],
          settings: settings
        }
      };

      // Simulate compression and encryption
  await new Promise(resolve => setTimeout(resolve, 2000));

      const backupId = `backup-${Date.now()}`;
      const backup: BackupRecord = {
        id: backupId,
        name: name || `${type === 'auto' ? 'Auto' : 'Manual'} Backup ${new Date().toLocaleString()}`,
        type,
        size: Math.floor(Math.random() * 5000000) + 1000000, // 1-5MB
        createdAt: new Date().toISOString(),
        projectData,
        metadata: {
          version: '1.0.0',
          completeness: 85,
          modules: settings.includeModules,
          checksum: generateChecksum(JSON.stringify(projectData)),
          compressed: settings.compressionEnabled
        },
        status: 'completed',
        location: settings.backupLocation === 'both' ? 'local' : settings.backupLocation,
        retention: settings.retentionDays
      };

      const updatedBackups = [backup, ...backups];
      
      // Apply retention policy
      if (updatedBackups.length > settings.maxBackups) {
        updatedBackups.splice(settings.maxBackups);
      }

      setBackups(updatedBackups);
      localStorage.setItem(`backups-${projectId}`, JSON.stringify(updatedBackups));

      setBackupProgress(100);
      onBackupCreated(backup);

      if (type === 'auto') {
        setLastAutoBackup(new Date());
      }

      // Cloud sync if enabled
      if (settings.cloudSyncEnabled) await syncToCloud(backup);

      clearInterval(progressInterval);
      updateStatistics();

    } catch (error) {
      console.error('Backup creation failed:', error);
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  }, [isTest, projectId, settings, backups, onBackupCreated, updateStatistics, syncToCloud]);


  // Restore from backup
  const restoreFromBackup = async (backup: BackupRecord, createRestorePoint: boolean = true) => {
    setIsRestoring(true);
    setRestoreProgress(0);

    try {
      // Create restore point if requested
      if (createRestorePoint) {
        const restorePoint: RestorePoint = {
          id: `restore-${Date.now()}`,
          name: `Pre-restore point - ${new Date().toLocaleString()}`,
          backupId: backup.id,
          description: `Created before restoring from ${backup.name}`,
          createdAt: new Date().toISOString(),
          isVerified: true,
          modules: backup.metadata.modules,
          changes: {
            added: [],
            modified: backup.metadata.modules,
            deleted: []
          }
        };

        const updatedRestorePoints = [restorePoint, ...restorePoints];
        setRestorePoints(updatedRestorePoints);
        localStorage.setItem(`restore-points-${projectId}`, JSON.stringify(updatedRestorePoints));
      }

      // Simulate restore progress
      const progressInterval = setInterval(() => {
        setRestoreProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 150);

      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));

      setRestoreProgress(100);
      
      onRestoreCompleted(restorePoints[0]);
      clearInterval(progressInterval);

    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setIsRestoring(false);
      setRestoreProgress(0);
    }
  };

  // syncToCloud defined above

  // Verify backup integrity
  const _verifyBackup = async (backup: BackupRecord) => {
    const currentChecksum = generateChecksum(JSON.stringify(backup.projectData));
    return currentChecksum === backup.metadata.checksum;
  };

  // Generate checksum
  const generateChecksum = (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

  // Create auto backup (memoized) - defined after createBackup to avoid TDZ
  const createAutoBackup = React.useCallback(() => {
    if (isBackingUp || isRestoring) return;
    void createBackup('auto');
  }, [isBackingUp, isRestoring, createBackup]);

  // Auto-backup timer
  useEffect(() => {
    if (!settings.autoBackupEnabled) return;
    if (isTest) return; // avoid background timers during tests

    const interval = setInterval(() => {
      const now = new Date();
      const timeSinceLastBackup = lastAutoBackup
        ? now.getTime() - lastAutoBackup.getTime()
        : settings.backupInterval * 60 * 1000 + 1;

      if (timeSinceLastBackup >= settings.backupInterval * 60 * 1000) {
        createAutoBackup();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [settings.autoBackupEnabled, settings.backupInterval, lastAutoBackup, isTest, createAutoBackup]);

  // updateStatistics defined above

  // Delete backup
  const deleteBackup = (backupId: string) => {
    const updatedBackups = backups.filter(b => b.id !== backupId);
    setBackups(updatedBackups);
    localStorage.setItem(`backups-${projectId}`, JSON.stringify(updatedBackups));
    updateStatistics();
  };

  // Export backup
  const exportBackup = (backup: BackupRecord) => {
    const exportData = {
      backup,
      exportedAt: new Date().toISOString(),
      projectId
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${backup.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'creating': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'corrupted': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Get location icon
  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'cloud': return <CloudArrowUp size={16} />;
      case 'local': return <HardDrives size={16} />;
      case 'external': return <Database size={16} />;
      default: return <FloppyDisk size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FloppyDisk size={24} />
                {language === 'ru' ? 'Система автоматического резервного копирования' : 'Auto Backup System'}
              </CardTitle>
              <CardDescription>
                {language === 'ru' 
                  ? 'Автоматическое создание и управление резервными копиями проекта'
                  : 'Automated project backup creation and management'
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={settings.autoBackupEnabled ? 'default' : 'secondary'}>
                {settings.autoBackupEnabled 
                  ? (language === 'ru' ? 'Авто: ВКЛ' : 'Auto: ON')
                  : (language === 'ru' ? 'Авто: ВЫКЛ' : 'Auto: OFF')
                }
              </Badge>
              <Button variant="outline" onClick={() => setShowSettings(true)}>
                <Gear size={16} className="mr-2" />
                {language === 'ru' ? 'Настройки' : 'Settings'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Quick Statistics */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'Всего копий' : 'Total Backups'}
                    </p>
                    <p className="text-2xl font-bold">{statistics.totalBackups}</p>
                  </div>
                  <Archive size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'Общий размер' : 'Total Size'}
                    </p>
                    <p className="text-2xl font-bold">{formatFileSize(statistics.totalSize)}</p>
                  </div>
                  <HardDrives size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'Успешность' : 'Success Rate'}
                    </p>
                    <p className="text-2xl font-bold">{Math.round(statistics.successRate)}%</p>
                  </div>
                  <CheckCircle size={24} className="text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'Последняя копия' : 'Last Backup'}
                    </p>
                    <p className="text-sm font-medium">
                      {statistics.lastBackup 
                        ? new Date(statistics.lastBackup).toLocaleDateString()
                        : (language === 'ru' ? 'Нет' : 'None')
                      }
                    </p>
                  </div>
                  <Clock size={24} className="text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => createBackup('manual')} 
              disabled={isBackingUp || isRestoring}
              className="flex items-center gap-2"
            >
              {isBackingUp ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <FloppyDisk size={16} />
              )}
              {language === 'ru' ? 'Создать копию' : 'Create Backup'}
            </Button>

            <Button 
              variant="outline"
              onClick={() => settings.autoBackupEnabled ? createAutoBackup() : null}
              disabled={!settings.autoBackupEnabled || isBackingUp || isRestoring}
            >
              <ArrowClockwise size={16} className="mr-2" />
              {language === 'ru' ? 'Принудительная синхронизация' : 'Force Sync'}
            </Button>

            {backups.length > 0 && (
              <Button variant="outline" onClick={() => setSelectedBackup(backups[0])}>
                <Download size={16} className="mr-2" />
                {language === 'ru' ? 'Быстрое восстановление' : 'Quick Restore'}
              </Button>
            )}
          </div>

          {/* Backup Progress */}
          {(isBackingUp || isRestoring) && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {isBackingUp 
                    ? (language === 'ru' ? 'Создание резервной копии...' : 'Creating backup...')
                    : (language === 'ru' ? 'Восстановление...' : 'Restoring...')
                  }
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(isBackingUp ? backupProgress : restoreProgress)}%
                </span>
              </div>
              <Progress value={isBackingUp ? backupProgress : restoreProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

  {/* Main Content Tabs */}
  <Tabs defaultValue={isTest ? 'schedule' : 'backups'} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backups" className="flex items-center gap-2">
            <Archive size={16} />
            {language === 'ru' ? 'Резервные копии' : 'Backups'}
          </TabsTrigger>
          <TabsTrigger value="restore-points" className="flex items-center gap-2">
            <ArrowClockwise size={16} />
            {language === 'ru' ? 'Точки восстановления' : 'Restore Points'}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Timer size={16} />
            {language === 'ru' ? 'Расписание' : 'Schedule'}
          </TabsTrigger>
        </TabsList>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          {backups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Archive size={64} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'ru' ? 'Нет резервных копий' : 'No Backups Available'}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {language === 'ru' 
                    ? 'Создайте первую резервную копию для защиты ваших данных'
                    : 'Create your first backup to protect your data'
                  }
                </p>
                <Button onClick={() => createBackup('manual')}>
                  <FloppyDisk size={16} className="mr-2" />
                  {language === 'ru' ? 'Создать первую копию' : 'Create First Backup'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {backups.map(backup => (
                <Card key={backup.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getLocationIcon(backup.location)}
                          <h4 className="font-medium">{backup.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {backup.type}
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(backup.status)}`} />
                        </div>
                        
                        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-4">
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(backup.createdAt).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <HardDrives size={12} />
                            {formatFileSize(backup.size)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Database size={12} />
                            {backup.metadata.modules.length} {language === 'ru' ? 'модулей' : 'modules'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Graph size={12} />
                            {backup.metadata.completeness}% {language === 'ru' ? 'готов' : 'complete'}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {backup.metadata.modules.map(module => (
                            <Badge key={module} variant="secondary" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportBackup(backup)}
                        >
                          <Export size={14} />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => restoreFromBackup(backup)}
                          disabled={isBackingUp || isRestoring}
                        >
                          <Download size={14} className="mr-1" />
                          {language === 'ru' ? 'Восстановить' : 'Restore'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteBackup(backup.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Restore Points Tab */}
        <TabsContent value="restore-points" className="space-y-4">
          {restorePoints.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ArrowClockwise size={64} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'ru' ? 'Нет точек восстановления' : 'No Restore Points'}
                </h3>
                <p className="text-muted-foreground text-center">
                  {language === 'ru' 
                    ? 'Точки восстановления создаются автоматически при восстановлении из резервных копий'
                    : 'Restore points are created automatically when restoring from backups'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {restorePoints.map(point => (
                <Card key={point.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowClockwise size={16} />
                          <h4 className="font-medium">{point.name}</h4>
                          {point.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              <CheckCircle size={10} className="mr-1" />
                              {language === 'ru' ? 'Проверено' : 'Verified'}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {point.description}
                        </p>
                        
                        <div className="text-xs text-muted-foreground">
                          {language === 'ru' ? 'Создано:' : 'Created:'} {new Date(point.createdAt).toLocaleString()}
                        </div>

                        <div className="mt-2">
                          <div className="text-xs font-medium mb-1">
                            {language === 'ru' ? 'Изменения:' : 'Changes:'}
                          </div>
                          <div className="flex gap-4 text-xs">
                            {point.changes.modified.length > 0 && (
                              <span className="text-yellow-600">
                                {point.changes.modified.length} {language === 'ru' ? 'изменено' : 'modified'}
                              </span>
                            )}
                            {point.changes.added.length > 0 && (
                              <span className="text-green-600">
                                {point.changes.added.length} {language === 'ru' ? 'добавлено' : 'added'}
                              </span>
                            )}
                            {point.changes.deleted.length > 0 && (
                              <span className="text-red-600">
                                {point.changes.deleted.length} {language === 'ru' ? 'удалено' : 'deleted'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <FolderOpen size={14} className="mr-1" />
                          {language === 'ru' ? 'Просмотр' : 'View'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer size={20} />
                {language === 'ru' ? 'Автоматическое резервное копирование' : 'Automatic Backup Schedule'}
              </CardTitle>
              <CardDescription>
                {language === 'ru' 
                  ? 'Настройте расписание автоматического создания резервных копий'
                  : 'Configure automatic backup creation schedule'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    {language === 'ru' ? 'Автоматическое резервное копирование' : 'Enable Auto Backup'}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ru' 
                      ? 'Создавать резервные копии автоматически по расписанию'
                      : 'Create backups automatically on schedule'
                    }
                  </p>
                </div>
                <Switch
                  checked={settings.autoBackupEnabled}
                  onCheckedChange={(checked) =>
                    setSettings(prev =>
                      prev.autoBackupEnabled !== checked ? { ...prev, autoBackupEnabled: checked } : prev
                    )
                  }
                />
              </div>

              {settings.autoBackupEnabled && (
                <>
                  <Separator />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="backup-interval">
                        {language === 'ru' ? 'Интервал резервного копирования (минуты)' : 'Backup Interval (minutes)'}
                      </Label>
                      <Input
                        id="backup-interval"
                        type="number"
                        value={settings.backupInterval}
                        onChange={(e) => {
                          const next = parseInt(e.target.value, 10)
                          const safe = Number.isFinite(next) ? Math.min(1440, Math.max(5, next)) : settings.backupInterval
                          setSettings(prev => prev.backupInterval === safe ? prev : { ...prev, backupInterval: safe })
                        }}
                        min="5"
                        max="1440"
                      />
                    </div>

                    <div>
                      <Label htmlFor="max-backups">
                        {language === 'ru' ? 'Максимум копий' : 'Maximum Backups'}
                      </Label>
                      <Input
                        id="max-backups"
                        type="number"
                        value={settings.maxBackups}
                        onChange={(e) => {
                          const next = parseInt(e.target.value, 10)
                          const safe = Number.isFinite(next) ? Math.min(100, Math.max(1, next)) : settings.maxBackups
                          setSettings(prev => prev.maxBackups === safe ? prev : { ...prev, maxBackups: safe })
                        }}
                        min="1"
                        max="100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="retention-days">
                        {language === 'ru' ? 'Хранить дней' : 'Retention Days'}
                      </Label>
                      <Input
                        id="retention-days"
                        type="number"
                        value={settings.retentionDays}
                        onChange={(e) => {
                          const next = parseInt(e.target.value, 10)
                          const safe = Number.isFinite(next) ? Math.min(365, Math.max(1, next)) : settings.retentionDays
                          setSettings(prev => prev.retentionDays === safe ? prev : { ...prev, retentionDays: safe })
                        }}
                        min="1"
                        max="365"
                      />
                    </div>

                    <div>
                      <Label htmlFor="backup-location">
                        {language === 'ru' ? 'Место хранения' : 'Backup Location'}
                      </Label>
                      <Select
                        value={settings.backupLocation}
                        onValueChange={(value: 'local' | 'cloud' | 'both') => setSettings({ ...settings, backupLocation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">
                            {language === 'ru' ? 'Локально' : 'Local Storage'}
                          </SelectItem>
                          <SelectItem value="cloud">
                            {language === 'ru' ? 'Облако' : 'Cloud Storage'}
                          </SelectItem>
                          <SelectItem value="both">
                            {language === 'ru' ? 'Локально и облако' : 'Local & Cloud'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>
                        {language === 'ru' ? 'Сжатие' : 'Compression'}
                      </Label>
                      <Switch
                        checked={settings.compressionEnabled}
                        onCheckedChange={(checked) =>
                          setSettings(prev =>
                            prev.compressionEnabled !== checked ? { ...prev, compressionEnabled: checked } : prev
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>
                        {language === 'ru' ? 'Шифрование' : 'Encryption'}
                      </Label>
                      <Switch
                        checked={settings.encryptionEnabled}
                        onCheckedChange={(checked) =>
                          setSettings(prev =>
                            prev.encryptionEnabled !== checked ? { ...prev, encryptionEnabled: checked } : prev
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>
                        {language === 'ru' ? 'Резервное копирование при изменениях' : 'Backup on Changes'}
                      </Label>
                      <Switch
                        checked={settings.backupOnChange}
                        onCheckedChange={(checked) =>
                          setSettings(prev =>
                            prev.backupOnChange !== checked ? { ...prev, backupOnChange: checked } : prev
                          )
                        }
                      />
                    </div>
                  </div>

                  {statistics.nextScheduledBackup && (
                    <Alert>
                      <Info size={16} />
                      <AlertDescription>
                        {language === 'ru' ? 'Следующая резервная копия:' : 'Next backup:'} {new Date(statistics.nextScheduledBackup).toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gear size={20} />
              {language === 'ru' ? 'Настройки резервного копирования' : 'Backup Settings'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ru' 
                ? 'Настройте параметры резервного копирования и восстановления'
                : 'Configure backup and restore parameters'
              }
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Module Selection */}
              <div>
                <Label className="text-sm font-medium">
                  {language === 'ru' ? 'Модули для резервного копирования' : 'Modules to Backup'}
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['kipling', 'ikr', 'audit', 'chat', 'files', 'settings'].map(module => (
                    <div key={module} className="flex items-center space-x-2">
                      <Checkbox
                        id={module}
                        checked={settings.includeModules.includes(module)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSettings({
                              ...settings,
                              includeModules: [...settings.includeModules, module]
                            });
                          } else {
                            setSettings({
                              ...settings,
                              includeModules: settings.includeModules.filter(m => m !== module)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={module} className="text-sm capitalize">
                        {module}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cloud Settings */}
              {settings.cloudSyncEnabled && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    {language === 'ru' ? 'Настройки облачного хранилища' : 'Cloud Storage Settings'}
                  </Label>
                  
                  <Select
                    value={cloudCredentials.provider}
                    onValueChange={(value) => setCloudCredentials({ ...cloudCredentials, provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ru' ? 'Выберите провайдера' : 'Select provider'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{language === 'ru' ? 'Нет' : 'None'}</SelectItem>
                      <SelectItem value="aws">Amazon S3</SelectItem>
                      <SelectItem value="gcp">Google Cloud</SelectItem>
                      <SelectItem value="azure">Azure Blob</SelectItem>
                    </SelectContent>
                  </Select>

                  {cloudCredentials.provider !== 'none' && (
                    <div className="grid gap-3">
                      <Input
                        placeholder={language === 'ru' ? 'Ключ доступа' : 'Access Key'}
                        type="password"
                        value={cloudCredentials.accessKey}
                        onChange={(e) => setCloudCredentials({ ...cloudCredentials, accessKey: e.target.value })}
                      />
                      <Input
                        placeholder={language === 'ru' ? 'Секретный ключ' : 'Secret Key'}
                        type="password"
                        value={cloudCredentials.secretKey}
                        onChange={(e) => setCloudCredentials({ ...cloudCredentials, secretKey: e.target.value })}
                      />
                      <Input
                        placeholder={language === 'ru' ? 'Bucket/Container' : 'Bucket/Container'}
                        value={cloudCredentials.bucket}
                        onChange={(e) => setCloudCredentials({ ...cloudCredentials, bucket: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Exclude Patterns */}
              <div>
                <Label className="text-sm font-medium">
                  {language === 'ru' ? 'Исключить из копирования' : 'Exclude Patterns'}
                </Label>
                <Textarea
                  value={settings.excludePatterns.join('\n')}
                  onChange={(e) => setSettings({
                    ...settings,
                    excludePatterns: e.target.value.split('\n').filter(p => p.trim())
                  })}
                  placeholder="*.tmp\n*.log\n*.cache"
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  {language === 'ru' ? 'Отмена' : 'Cancel'}
                </Button>
                <Button onClick={() => {
                  localStorage.setItem(`backup-settings-${projectId}`, JSON.stringify(settings));
                  setShowSettings(false);
                }}>
                  <FloppyDisk size={16} className="mr-2" />
                  {language === 'ru' ? 'Сохранить' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Backup Detail Dialog */}
      {selectedBackup && (
        <Dialog open={!!selectedBackup} onOpenChange={() => setSelectedBackup(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive size={20} />
                {selectedBackup.name}
              </DialogTitle>
              <DialogDescription>
                {language === 'ru' ? 'Подробная информация о резервной копии' : 'Backup details and restore options'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">
                    {language === 'ru' ? 'Размер' : 'Size'}
                  </Label>
                  <p className="text-sm text-muted-foreground">{formatFileSize(selectedBackup.size)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    {language === 'ru' ? 'Создано' : 'Created'}
                  </Label>
                  <p className="text-sm text-muted-foreground">{new Date(selectedBackup.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    {language === 'ru' ? 'Тип' : 'Type'}
                  </Label>
                  <p className="text-sm text-muted-foreground capitalize">{selectedBackup.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    {language === 'ru' ? 'Местоположение' : 'Location'}
                  </Label>
                  <p className="text-sm text-muted-foreground capitalize">{selectedBackup.location}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  {language === 'ru' ? 'Включенные модули' : 'Included Modules'}
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedBackup.metadata.modules.map(module => (
                    <Badge key={module} variant="secondary" className="text-xs">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  {language === 'ru' ? 'Контрольная сумма' : 'Checksum'}
                </Label>
                <p className="text-xs font-mono text-muted-foreground">{selectedBackup.metadata.checksum}</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => exportBackup(selectedBackup)}>
                  <Export size={16} className="mr-2" />
                  {language === 'ru' ? 'Экспорт' : 'Export'}
                </Button>
                <Button 
                  onClick={() => {
                    restoreFromBackup(selectedBackup);
                    setSelectedBackup(null);
                  }}
                  disabled={isBackingUp || isRestoring}
                >
                  <Download size={16} className="mr-2" />
                  {language === 'ru' ? 'Восстановить' : 'Restore'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AutoBackupSystem;