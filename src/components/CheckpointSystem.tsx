import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  FloppyDisk,
  UploadSimple,
  TrashSimple,
  CheckCircle,
  Clock,
  FolderOpen,
  Copy,
  ArrowsClockwise,
  Database,
  CloudArrowUp
} from '@phosphor-icons/react';

interface Checkpoint {
  id: string;
  name: string;
  description: string;
  timestamp: string;
  type: 'manual' | 'auto' | 'pre-operation' | 'recovery-point';
  data: {
    systemState: any;
    userProgress: any;
    applicationState: any;
    configurationSnapshot: any;
  };
  size: number; // в байтах
  integrity: boolean;
  tags: string[];
}

interface CheckpointSystemProps {
  language: 'en' | 'ru';
  onCheckpointCreated?: (checkpoint: Checkpoint) => void;
  onCheckpointRestored?: (checkpoint: Checkpoint) => void;
}

const CheckpointSystem: React.FC<CheckpointSystemProps> = ({
  language,
  onCheckpointCreated,
  onCheckpointRestored
}) => {
  const [checkpoints, setCheckpoints] = useKV<Checkpoint[]>('system-checkpoints', []);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCheckpointName, setNewCheckpointName] = useState('');
  const [newCheckpointDescription, setNewCheckpointDescription] = useState('');
  const [newCheckpointTags, setNewCheckpointTags] = useState('');
  const [autoCheckpointEnabled, setAutoCheckpointEnabled] = useKV<boolean>('auto-checkpoint-enabled', true);
  const [maxCheckpoints, setMaxCheckpoints] = useKV<number>('max-checkpoints', 10);

  const t = (key: string) => {
    const translations: { [key: string]: { en: string; ru: string } } = {
      checkpointSystem: { en: 'Checkpoint System', ru: 'Система Контрольных Точек' },
      checkpointDesc: { en: 'Save and restore system state at any point', ru: 'Сохранение и восстановление состояния системы в любой момент' },
      createCheckpoint: { en: 'Create Checkpoint', ru: 'Создать Контрольную Точку' },
      restoreCheckpoint: { en: 'Restore Checkpoint', ru: 'Восстановить Контрольную Точку' },
      checkpointName: { en: 'Checkpoint Name', ru: 'Имя Контрольной Точки' },
      checkpointDescription: { en: 'Description', ru: 'Описание' },
      tags: { en: 'Tags', ru: 'Теги' },
      tagsPlaceholder: { en: 'Enter tags separated by commas', ru: 'Введите теги через запятую' },
      manual: { en: 'Manual', ru: 'Ручная' },
      auto: { en: 'Auto', ru: 'Автоматическая' },
      preOperation: { en: 'Pre-Operation', ru: 'Перед Операцией' },
      recoveryPoint: { en: 'Recovery Point', ru: 'Точка Восстановления' },
      create: { en: 'Create', ru: 'Создать' },
      cancel: { en: 'Cancel', ru: 'Отмена' },
      restore: { en: 'Restore', ru: 'Восстановить' },
      delete: { en: 'Delete', ru: 'Удалить' },
      copy: { en: 'Copy', ru: 'Копировать' },
      export: { en: 'Export', ru: 'Экспорт' },
      noCheckpoints: { en: 'No checkpoints available', ru: 'Нет доступных контрольных точек' },
      autoCheckpoint: { en: 'Auto Checkpoint', ru: 'Автоматические Контрольные Точки' },
      maxCheckpoints: { en: 'Max Checkpoints', ru: 'Максимум Контрольных Точек' },
      settings: { en: 'Settings', ru: 'Настройки' },
      size: { en: 'Size', ru: 'Размер' },
      integrity: { en: 'Integrity', ru: 'Целостность' },
      verified: { en: 'Verified', ru: 'Проверена' },
      corrupted: { en: 'Corrupted', ru: 'Повреждена' },
      creating: { en: 'Creating checkpoint...', ru: 'Создание контрольной точки...' },
      restoring: { en: 'Restoring checkpoint...', ru: 'Восстановление контрольной точки...' },
      created: { en: 'Checkpoint created successfully', ru: 'Контрольная точка успешно создана' },
      restored: { en: 'Checkpoint restored successfully', ru: 'Контрольная точка успешно восстановлена' },
      deleted: { en: 'Checkpoint deleted', ru: 'Контрольная точка удалена' },
      nameRequired: { en: 'Name is required', ru: 'Имя обязательно' }
    };
    return translations[key]?.[language] || key;
  };

  // Автоматическое создание контрольных точек
  useEffect(() => {
    if (autoCheckpointEnabled) {
      const interval = setInterval(() => {
        createAutoCheckpoint();
      }, 300000); // Каждые 5 минут

      return () => clearInterval(interval);
    }
  }, [autoCheckpointEnabled]);

  // Управление максимальным количеством контрольных точек
  useEffect(() => {
    const maxLimit = maxCheckpoints || 10;
    if (checkpoints && checkpoints.length > maxLimit) {
      const sortedCheckpoints = [...checkpoints].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const checkpointsToKeep = sortedCheckpoints.slice(-maxLimit);
      setCheckpoints(checkpointsToKeep);
    }
  }, [checkpoints, maxCheckpoints]);

  const generateSystemSnapshot = () => {
    // Симуляция снимка состояния системы
    return {
      systemState: {
        timestamp: new Date().toISOString(),
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
        activeProcesses: Math.floor(Math.random() * 50) + 10,
        networkConnections: Math.floor(Math.random() * 20) + 5
      },
      userProgress: {
        currentProject: 'sample-project',
        completedTasks: Math.floor(Math.random() * 10),
        activeModules: ['overview', 'kipling', 'ikr'],
        lastActivity: new Date().toISOString()
      },
      applicationState: {
        version: '1.0.0',
        configuration: {
          language: language,
          theme: 'dark',
          autoSave: true
        },
        sessionData: {
          loginTime: new Date().toISOString(),
          sessionId: Math.random().toString(36),
          preferences: {}
        }
      },
      configurationSnapshot: {
        moduleSettings: {},
        userPreferences: {},
        systemSettings: {}
      }
    };
  };

  const createCheckpoint = async (name: string, description: string, tags: string[], type: Checkpoint['type'] = 'manual') => {
    if (!name.trim()) {
      toast.error(t('nameRequired'));
      return null;
    }

    setIsCreating(true);
    
    try {
      const data = generateSystemSnapshot();
      const dataString = JSON.stringify(data);
      const size = new Blob([dataString]).size;
      
      const checkpoint: Checkpoint = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        timestamp: new Date().toISOString(),
        type,
        data,
        size,
        integrity: true,
        tags
      };

      setCheckpoints(current => [...(current || []), checkpoint]);
      onCheckpointCreated?.(checkpoint);
      toast.success(t('created'));
      
      // Очистка формы
      setNewCheckpointName('');
      setNewCheckpointDescription('');
      setNewCheckpointTags('');
      setShowCreateDialog(false);
      
      return checkpoint;
    } catch (error) {
      toast.error(`Failed to create checkpoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const createAutoCheckpoint = async () => {
    const name = `Auto Checkpoint ${new Date().toLocaleString()}`;
    const description = `Automatic checkpoint created at ${new Date().toLocaleString()}`;
    
    await createCheckpoint(name, description, ['auto', 'system'], 'auto');
  };

  const restoreCheckpoint = async (checkpoint: Checkpoint) => {
    if (!checkpoint || isRestoring) return;

    setIsRestoring(true);
    
    try {
      // Симуляция процесса восстановления
      toast.info(t('restoring'));
      
      // Имитация времени восстановления
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Проверка целостности
      if (!checkpoint.integrity) {
        throw new Error('Checkpoint integrity check failed');
      }
      
      // Применение состояния (здесь была бы реальная логика восстановления)
      console.log('Restoring system state:', checkpoint.data);
      
      onCheckpointRestored?.(checkpoint);
      toast.success(t('restored'));
      
    } catch (error) {
      toast.error(`Failed to restore checkpoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const deleteCheckpoint = (checkpointId: string) => {
    setCheckpoints(current => 
      (current || []).filter(cp => cp.id !== checkpointId)
    );
    toast.success(t('deleted'));
  };

  const duplicateCheckpoint = async (checkpoint: Checkpoint) => {
    const name = `${checkpoint.name} (Copy)`;
    const description = `Copy of ${checkpoint.description}`;
    
    await createCheckpoint(name, description, [...checkpoint.tags, 'copy'], 'manual');
  };

  const exportCheckpoint = (checkpoint: Checkpoint) => {
    const dataStr = JSON.stringify(checkpoint, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkpoint-${checkpoint.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Checkpoint exported');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: Checkpoint['type']) => {
    switch (type) {
      case 'manual': return 'default';
      case 'auto': return 'secondary';
      case 'pre-operation': return 'outline';
      case 'recovery-point': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={24} className="text-primary" />
            {t('checkpointSystem')}
          </CardTitle>
          <CardDescription>
            {t('checkpointDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <FloppyDisk size={16} className="mr-2" />
                    {t('createCheckpoint')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('createCheckpoint')}</DialogTitle>
                    <DialogDescription>
                      {language === 'ru' 
                        ? 'Создайте новую контрольную точку для сохранения текущего состояния системы'
                        : 'Create a new checkpoint to save the current system state'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="checkpoint-name">{t('checkpointName')}</Label>
                      <Input
                        id="checkpoint-name"
                        value={newCheckpointName}
                        onChange={(e) => setNewCheckpointName(e.target.value)}
                        placeholder={language === 'ru' ? 'Введите имя контрольной точки' : 'Enter checkpoint name'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkpoint-description">{t('checkpointDescription')}</Label>
                      <Input
                        id="checkpoint-description"
                        value={newCheckpointDescription}
                        onChange={(e) => setNewCheckpointDescription(e.target.value)}
                        placeholder={language === 'ru' ? 'Введите описание (необязательно)' : 'Enter description (optional)'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkpoint-tags">{t('tags')}</Label>
                      <Input
                        id="checkpoint-tags"
                        value={newCheckpointTags}
                        onChange={(e) => setNewCheckpointTags(e.target.value)}
                        placeholder={t('tagsPlaceholder')}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        {t('cancel')}
                      </Button>
                      <Button 
                        onClick={() => createCheckpoint(
                          newCheckpointName, 
                          newCheckpointDescription, 
                          newCheckpointTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                        )}
                        disabled={isCreating || !newCheckpointName.trim()}
                      >
                        {isCreating ? (
                          <>
                            <ArrowsClockwise size={16} className="mr-2 animate-spin" />
                            {t('creating')}
                          </>
                        ) : (
                          <>
                            <FloppyDisk size={16} className="mr-2" />
                            {t('create')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={createAutoCheckpoint}
                variant="outline"
                disabled={isCreating}
              >
                <Clock size={16} className="mr-2" />
                Auto Checkpoint
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {(checkpoints || []).length} / {maxCheckpoints || 10} checkpoints
              </div>
              <Progress 
                value={((checkpoints || []).length / (maxCheckpoints || 10)) * 100} 
                className="w-20 h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-checkpoint">{t('autoCheckpoint')}</Label>
              <Button
                variant={autoCheckpointEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoCheckpointEnabled(!autoCheckpointEnabled)}
              >
                {autoCheckpointEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="max-checkpoints">{t('maxCheckpoints')}</Label>
              <Input
                id="max-checkpoints"
                type="number"
                value={maxCheckpoints}
                onChange={(e) => setMaxCheckpoints(parseInt(e.target.value) || 10)}
                className="w-20"
                min="1"
                max="50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkpoint List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen size={24} className="text-primary" />
            Checkpoints ({(checkpoints || []).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(checkpoints || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database size={48} className="mx-auto mb-4 opacity-50" />
              <p>{t('noCheckpoints')}</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {(checkpoints || []).slice().reverse().map(checkpoint => (
                  <Card 
                    key={checkpoint.id}
                    className={`cursor-pointer transition-all ${
                      selectedCheckpoint?.id === checkpoint.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedCheckpoint(checkpoint)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{checkpoint.name}</h4>
                            <Badge variant={getTypeColor(checkpoint.type)}>
                              {t(checkpoint.type)}
                            </Badge>
                            <Badge variant={checkpoint.integrity ? 'secondary' : 'destructive'}>
                              {checkpoint.integrity ? t('verified') : t('corrupted')}
                            </Badge>
                          </div>
                          
                          {checkpoint.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {checkpoint.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(checkpoint.timestamp).toLocaleString()}
                            </span>
                            <span>
                              {t('size')}: {formatFileSize(checkpoint.size)}
                            </span>
                          </div>
                          
                          {checkpoint.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {checkpoint.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreCheckpoint(checkpoint);
                            }}
                            size="sm"
                            variant="outline"
                            disabled={isRestoring || !checkpoint.integrity}
                          >
                            <UploadSimple size={14} className="mr-1" />
                            {t('restore')}
                          </Button>
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateCheckpoint(checkpoint);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <Copy size={14} />
                          </Button>
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportCheckpoint(checkpoint);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <CloudArrowUp size={14} />
                          </Button>
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCheckpoint(checkpoint.id);
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <TrashSimple size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckpointSystem;