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
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  ClockCounterClockwise,
  Tag as TagIcon,
  ArrowLeft,
  ArrowRight,
  Eye,
  Copy,
  Download,
  FileText,
  Calendar,
  User,
  CheckCircle,
  Warning,
  X,
  Plus,
  Minus,
  FileCode as Diff,
  Archive
} from '@phosphor-icons/react';

interface VersionControl {
  id: string;
  timestamp: string;
  version: string;
  author: string;
  message: string;
  changes: {
    type: 'create' | 'update' | 'delete' | 'rename';
    path: string;
    before?: any;
    after?: any;
    size: number;
  }[];
  parentVersion?: string;
  tags: string[];
  branch: string;
  commitHash: string;
  metadata: {
    filesChanged: number;
    insertions: number;
    deletions: number;
    totalSize: number;
    duration: number;
  };
}

interface Branch {
  id: string;
  name: string;
  description: string;
  baseBranch: string;
  headCommit: string;
  isDefault: boolean;
  isProtected: boolean;
  createdAt: string;
  lastCommit: string;
  ahead: number;
  behind: number;
}

interface Tag {
  id: string;
  name: string;
  description: string;
  commitHash: string;
  version: string;
  createdAt: string;
  author: string;
  isRelease: boolean;
}

interface MergeRequest {
  id: string;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  author: string;
  status: 'open' | 'merged' | 'closed' | 'conflict';
  createdAt: string;
  mergedAt?: string;
  commits: string[];
  conflicts: {
    path: string;
    type: 'content' | 'rename' | 'delete';
    description: string;
  }[];
}

interface RollbackOperation {
  id: string;
  type: 'revert' | 'reset' | 'cherry-pick';
  targetCommit: string;
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  author: string;
  affectedFiles: string[];
  backupCreated: boolean;
  error?: string;
}

interface VersionControlSystemProps {
  language: string;
  projectId: string;
  onVersionCreated: (version: VersionControl) => void;
  onRollbackCompleted: (rollback: RollbackOperation) => void;
  onBranchCreated: (branch: Branch) => void;
}

const VersionControlSystem: React.FC<VersionControlSystemProps> = ({
  language,
  projectId,
  onVersionCreated,
  onRollbackCompleted,
  onBranchCreated
}) => {
  const [versions, setVersions] = useKV<VersionControl[]>(`versions-${projectId}`, []);
  const [branches, setBranches] = useKV<Branch[]>(`branches-${projectId}`, []);
  const [tags, setTags] = useKV<Tag[]>(`tags-${projectId}`, []);
  const [mergeRequests, setMergeRequests] = useKV<MergeRequest[]>(`merge-requests-${projectId}`, []);
  const [rollbacks, setRollbacks] = useKV<RollbackOperation[]>(`rollbacks-${projectId}`, []);
  const [currentBranch, setCurrentBranch] = useKV<string>(`current-branch-${projectId}`, 'main');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [commitDescription, setCommitDescription] = useState('');
  const [newBranch, setNewBranch] = useState({ name: '', description: '', baseBranch: 'main' });
  const [newTag, setNewTag] = useState({ name: '', description: '', version: '', isRelease: false });
  const [newMergeRequest, setNewMergeRequest] = useState({ title: '', description: '', sourceBranch: '', targetBranch: 'main' });
  const [diffData, setDiffData] = useState<{ before: any; after: any; path: string } | null>(null);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      versionControlSystem: { en: 'Version Control System', ru: 'Система Управления Версиями' },
      commitHistory: { en: 'Commit History', ru: 'История Коммитов' },
      branches: { en: 'Branches', ru: 'Ветки' },
      tags: { en: 'Tags', ru: 'Теги' },
      mergeRequests: { en: 'Merge Requests', ru: 'Запросы на Слияние' },
      rollbackOperations: { en: 'Rollback Operations', ru: 'Операции Отката' },
      createCommit: { en: 'Create Commit', ru: 'Создать Коммит' },
      newBranch: { en: 'New Branch', ru: 'Новая Ветка' },
      newTag: { en: 'New Tag', ru: 'Новый Тег' },
      newMergeRequest: { en: 'New Merge Request', ru: 'Новый Запрос на Слияние' },
      commitMessage: { en: 'Commit Message', ru: 'Сообщение Коммита' },
      commitDescription: { en: 'Commit Description', ru: 'Описание Коммита' },
      branchName: { en: 'Branch Name', ru: 'Название Ветки' },
      branchDescription: { en: 'Branch Description', ru: 'Описание Ветки' },
      baseBranch: { en: 'Base Branch', ru: 'Базовая Ветка' },
      tagName: { en: 'Tag Name', ru: 'Название Тега' },
      tagDescription: { en: 'Tag Description', ru: 'Описание Тега' },
      version: { en: 'Version', ru: 'Версия' },
      isRelease: { en: 'Is Release', ru: 'Это Релиз' },
      sourceBranch: { en: 'Source Branch', ru: 'Исходная Ветка' },
      targetBranch: { en: 'Target Branch', ru: 'Целевая Ветка' },
      title: { en: 'Title', ru: 'Заголовок' },
      description: { en: 'Description', ru: 'Описание' },
      author: { en: 'Author', ru: 'Автор' },
      timestamp: { en: 'Timestamp', ru: 'Временная Метка' },
      changes: { en: 'Changes', ru: 'Изменения' },
      filesChanged: { en: 'Files Changed', ru: 'Файлов Изменено' },
      insertions: { en: 'Insertions', ru: 'Добавления' },
      deletions: { en: 'Удаления', ru: 'Удаления' },
      revert: { en: 'Revert', ru: 'Откатить' },
      reset: { en: 'Reset', ru: 'Сброс' },
      cherryPick: { en: 'Cherry Pick', ru: 'Выборочное Применение' },
      viewDiff: { en: 'View Diff', ru: 'Посмотреть Различия' },
      compare: { en: 'Compare', ru: 'Сравнить' },
      merge: { en: 'Merge', ru: 'Слить' },
      switch: { en: 'Switch', ru: 'Переключить' },
      delete: { en: 'Delete', ru: 'Удалить' },
      save: { en: 'Save', ru: 'Сохранить' },
      cancel: { en: 'Cancel', ru: 'Отмена' },
      commit: { en: 'Commit', ru: 'Коммит' },
      create: { en: 'Create', ru: 'Создать' },
      currentBranch: { en: 'Current Branch', ru: 'Текущая Ветка' },
      defaultBranch: { en: 'Default', ru: 'По умолчанию' },
      protectedBranch: { en: 'Protected', ru: 'Защищённая' },
      ahead: { en: 'ahead', ru: 'впереди' },
      behind: { en: 'behind', ru: 'позади' },
      open: { en: 'Open', ru: 'Открыт' },
      merged: { en: 'Merged', ru: 'Слит' },
      closed: { en: 'Closed', ru: 'Закрыт' },
      conflict: { en: 'Conflict', ru: 'Конфликт' },
      pending: { en: 'Pending', ru: 'Ожидает' },
      completed: { en: 'Completed', ru: 'Завершено' },
      failed: { en: 'Failed', ru: 'Не удалось' },
      createBackup: { en: 'Create Backup', ru: 'Создать Резервную Копию' },
      rollbackReason: { en: 'Rollback Reason', ru: 'Причина Отката' }
    };
    return translations[key]?.[language] || key;
  };

  // Initialize default branch
  useEffect(() => {
    if (!branches || branches.length === 0) {
      const mainBranch: Branch = {
        id: 'branch-main',
        name: 'main',
        description: 'Main development branch',
        baseBranch: '',
        headCommit: '',
        isDefault: true,
        isProtected: true,
        createdAt: new Date().toISOString(),
        lastCommit: new Date().toISOString(),
        ahead: 0,
        behind: 0
      };
      setBranches([mainBranch]);
    }
  }, [branches, setBranches]);

  const generateCommitHash = (): string => {
    return Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  const createCommit = async () => {
    if (!commitMessage.trim()) {
      toast.error(language === 'ru' ? 'Введите сообщение коммита' : 'Enter commit message');
      return;
    }

    try {
      // Simulate gathering changes
      const changes: Array<{
        type: 'create' | 'update' | 'delete' | 'rename';
        path: string;
        before?: any;
        after?: any;
        size: number;
      }> = [
        {
          type: 'update',
          path: 'src/App.tsx',
          before: { content: 'old content' },
          after: { content: 'new content' },
          size: 1234
        },
        {
          type: 'create',
          path: 'src/components/NewComponent.tsx',
          after: { content: 'new component content' },
          size: 567
        }
      ];

      const commitHash = generateCommitHash();
      const newVersion: VersionControl = {
        id: `commit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: `v1.${(versions || []).length + 1}.0`,
        author: 'Current User',
        message: commitMessage,
        changes,
        parentVersion: (versions || [])[0]?.id,
        tags: [],
        branch: currentBranch || 'main',
        commitHash,
        metadata: {
          filesChanged: changes.length,
          insertions: changes.reduce((sum, change) => {
            return sum + (change.type !== 'delete' ? 1 : 0);
          }, 0),
          deletions: changes.reduce((sum, change) => {
            return sum + (change.type === 'delete' ? 1 : 0);
          }, 0),
          totalSize: changes.reduce((sum, change) => sum + change.size, 0),
          duration: 1500
        }
      };

      setVersions(current => [newVersion, ...(current || [])]);
      onVersionCreated(newVersion);
      
      // Update branch head commit
      setBranches(current => 
        (current || []).map(branch => 
          branch.name === currentBranch 
            ? { ...branch, headCommit: commitHash, lastCommit: new Date().toISOString() }
            : branch
        )
      );

      setShowCommitDialog(false);
      setCommitMessage('');
      setCommitDescription('');
      toast.success(language === 'ru' ? 'Коммит создан' : 'Commit created');

    } catch (error) {
      console.error('Failed to create commit:', error);
      toast.error(language === 'ru' ? 'Ошибка создания коммита' : 'Failed to create commit');
    }
  };

  const createBranch = () => {
    if (!newBranch.name.trim()) {
      toast.error(language === 'ru' ? 'Введите название ветки' : 'Enter branch name');
      return;
    }

    if ((branches || []).some(b => b.name === newBranch.name)) {
      toast.error(language === 'ru' ? 'Ветка с таким именем уже существует' : 'Branch with this name already exists');
      return;
    }

    const branch: Branch = {
      id: `branch-${Date.now()}`,
      name: newBranch.name,
      description: newBranch.description,
      baseBranch: newBranch.baseBranch,
      headCommit: '',
      isDefault: false,
      isProtected: false,
      createdAt: new Date().toISOString(),
      lastCommit: new Date().toISOString(),
      ahead: 0,
      behind: 0
    };

    setBranches(current => [...(current || []), branch]);
    onBranchCreated(branch);
    setShowBranchDialog(false);
    setNewBranch({ name: '', description: '', baseBranch: 'main' });
    toast.success(language === 'ru' ? 'Ветка создана' : 'Branch created');
  };

  const createTag = () => {
    if (!newTag.name.trim() || !selectedVersion) {
      toast.error(language === 'ru' ? 'Заполните обязательные поля' : 'Fill required fields');
      return;
    }

    const version = (versions || []).find(v => v.id === selectedVersion);
    if (!version) return;

    const tag: Tag = {
      id: `tag-${Date.now()}`,
      name: newTag.name,
      description: newTag.description,
      commitHash: version.commitHash,
      version: newTag.version || version.version,
      createdAt: new Date().toISOString(),
      author: 'Current User',
      isRelease: newTag.isRelease
    };

    setTags(current => [...(current || []), tag]);
    
    // Add tag to version
    setVersions(current => 
      (current || []).map(v => 
        v.id === selectedVersion 
          ? { ...v, tags: [...v.tags, newTag.name] }
          : v
      )
    );

    setShowTagDialog(false);
    setNewTag({ name: '', description: '', version: '', isRelease: false });
    setSelectedVersion(null);
    toast.success(language === 'ru' ? 'Тег создан' : 'Tag created');
  };

  const revertCommit = async (versionId: string) => {
    const version = (versions || []).find(v => v.id === versionId);
    if (!version) return;

    const rollback: RollbackOperation = {
      id: `rollback-${Date.now()}`,
      type: 'revert',
      targetCommit: version.commitHash,
      reason: `Revert commit: ${version.message}`,
      status: 'pending',
      timestamp: new Date().toISOString(),
      author: 'Current User',
      affectedFiles: version.changes.map(c => c.path),
      backupCreated: true
    };

    setRollbacks(current => [rollback, ...(current || [])]);

    try {
      // Simulate rollback operation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create revert commit
      const revertCommit: VersionControl = {
        id: `commit-revert-${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: `v1.${(versions || []).length + 1}.0`,
        author: 'Current User',
        message: `Revert "${version.message}"`,
        changes: version.changes.map(change => ({
          ...change,
          type: change.type === 'create' ? 'delete' as const : 
                change.type === 'delete' ? 'create' as const : 'update' as const,
          before: change.after,
          after: change.before
        })),
        parentVersion: (versions || [])[0]?.id,
        tags: [],
        branch: currentBranch || 'main',
        commitHash: generateCommitHash(),
        metadata: {
          filesChanged: version.changes.length,
          insertions: 0,
          deletions: version.changes.length,
          totalSize: version.metadata.totalSize,
          duration: 2000
        }
      };

      setVersions(current => [revertCommit, ...(current || [])]);
      setRollbacks(current => 
        (current || []).map(r => 
          r.id === rollback.id 
            ? { ...r, status: 'completed' }
            : r
        )
      );

      onRollbackCompleted({ ...rollback, status: 'completed' });
      toast.success(language === 'ru' ? 'Коммит откачен' : 'Commit reverted');

    } catch (error) {
      setRollbacks(current => 
        (current || []).map(r => 
          r.id === rollback.id 
            ? { ...r, status: 'failed', error: 'Rollback failed' }
            : r
        )
      );
      toast.error(language === 'ru' ? 'Ошибка отката' : 'Rollback failed');
    }
  };

  const switchBranch = (branchName: string) => {
    setCurrentBranch(branchName);
    toast.success(language === 'ru' ? `Переключено на ветку ${branchName}` : `Switched to branch ${branchName}`);
  };

  const viewDiff = (version: VersionControl, change: VersionControl['changes'][0]) => {
    setDiffData({
      before: change.before,
      after: change.after,
      path: change.path
    });
    setShowDiffDialog(true);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch size={24} className="text-primary" />
            {t('versionControlSystem')}
          </CardTitle>
          <CardDescription>
            {language === 'ru' 
              ? 'Управление версиями проекта, ветками и откатом изменений'
              : 'Project version control, branching, and rollback management'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Branch and Quick Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GitBranch size={16} />
                <span className="font-medium">{t('currentBranch')}:</span>
                <Badge variant="default">{currentBranch}</Badge>
              </div>
              {(branches || []).find(b => b.name === currentBranch)?.isDefault && (
                <Badge variant="outline">{t('defaultBranch')}</Badge>
              )}
              {(branches || []).find(b => b.name === currentBranch)?.isProtected && (
                <Badge variant="secondary">{t('protectedBranch')}</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <GitCommit size={16} className="mr-2" />
                    {t('createCommit')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('createCommit')}</DialogTitle>
                    <DialogDescription>
                      {language === 'ru' 
                        ? 'Создайте новый коммит с текущими изменениями'
                        : 'Create a new commit with current changes'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t('commitMessage')}</Label>
                      <Input
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        placeholder="Enter commit message..."
                      />
                    </div>
                    <div>
                      <Label>{t('commitDescription')}</Label>
                      <Textarea
                        value={commitDescription}
                        onChange={(e) => setCommitDescription(e.target.value)}
                        placeholder="Optional detailed description..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCommitDialog(false)}>
                        {t('cancel')}
                      </Button>
                      <Button onClick={createCommit}>
                        {t('commit')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <GitBranch size={16} className="mr-2" />
                    {t('newBranch')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('newBranch')}</DialogTitle>
                    <DialogDescription>
                      {language === 'ru' 
                        ? 'Создайте новую ветку для разработки'
                        : 'Create a new branch for development'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t('branchName')}</Label>
                      <Input
                        value={newBranch.name}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="feature/new-feature"
                      />
                    </div>
                    <div>
                      <Label>{t('branchDescription')}</Label>
                      <Input
                        value={newBranch.description}
                        onChange={(e) => setNewBranch(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description of the branch purpose"
                      />
                    </div>
                    <div>
                      <Label>{t('baseBranch')}</Label>
                      <Select 
                        value={newBranch.baseBranch} 
                        onValueChange={(value) => setNewBranch(prev => ({ ...prev, baseBranch: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(branches || []).map(branch => (
                            <SelectItem key={branch.id} value={branch.name}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowBranchDialog(false)}>
                        {t('cancel')}
                      </Button>
                      <Button onClick={createBranch}>
                        {t('create')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branches */}
      {(branches || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch size={20} />
              {t('branches')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(branches || []).map((branch) => (
                <div key={branch.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{branch.name}</h4>
                      {branch.isDefault && <Badge variant="default">{t('defaultBranch')}</Badge>}
                      {branch.isProtected && <Badge variant="secondary">{t('protectedBranch')}</Badge>}
                      {branch.name === currentBranch && <Badge variant="outline">Current</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{branch.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: {new Date(branch.createdAt).toLocaleDateString()}</span>
                      <span>Last commit: {new Date(branch.lastCommit).toLocaleDateString()}</span>
                      {branch.ahead > 0 && <span>{branch.ahead} {t('ahead')}</span>}
                      {branch.behind > 0 && <span>{branch.behind} {t('behind')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {branch.name !== currentBranch && (
                      <Button size="sm" variant="outline" onClick={() => switchBranch(branch.name)}>
                        {t('switch')}
                      </Button>
                    )}
                    {!branch.isDefault && (
                      <Button size="sm" variant="outline">
                        {t('delete')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commit History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommit size={20} />
            {t('commitHistory')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {(versions || []).map((version) => (
                <div key={version.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {version.commitHash}
                      </Badge>
                      <Badge variant="secondary">{version.branch}</Badge>
                      {version.tags.map(tag => (
                        <Badge key={tag} variant="default">
                          <TagIcon size={12} className="mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h4 className="font-medium mb-1">{version.message}</h4>
                    <div className="text-sm text-muted-foreground mb-2">
                      {version.author} • {new Date(version.timestamp).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{version.metadata.filesChanged} {t('filesChanged')}</span>
                      <span className="text-green-600">+{version.metadata.insertions} {t('insertions')}</span>
                      <span className="text-red-600">-{version.metadata.deletions} {t('deletions')}</span>
                      <span>{formatFileSize(version.metadata.totalSize)}</span>
                    </div>
                    
                    {/* Changes */}
                    <div className="mt-3 space-y-1">
                      {version.changes.slice(0, 3).map((change, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                            {change.type === 'create' ? <Plus size={10} className="text-green-600" /> :
                             change.type === 'delete' ? <Minus size={10} className="text-red-600" /> :
                             <Diff size={10} className="text-blue-600" />}
                          </Badge>
                          <span className="font-mono">{change.path}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => viewDiff(version, change)}
                          >
                            <Eye size={12} />
                          </Button>
                        </div>
                      ))}
                      {version.changes.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{version.changes.length - 3} more files
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedVersion(version.id)}
                        >
                          <TagIcon size={14} className="mr-1" />
                          {t('newTag')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('newTag')}</DialogTitle>
                          <DialogDescription>
                            {language === 'ru' 
                              ? 'Создайте тег для этого коммита'
                              : 'Create a tag for this commit'
                            }
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>{t('tagName')}</Label>
                            <Input
                              value={newTag.name}
                              onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="v1.0.0"
                            />
                          </div>
                          <div>
                            <Label>{t('version')}</Label>
                            <Input
                              value={newTag.version}
                              onChange={(e) => setNewTag(prev => ({ ...prev, version: e.target.value }))}
                              placeholder="1.0.0"
                            />
                          </div>
                          <div>
                            <Label>{t('tagDescription')}</Label>
                            <Textarea
                              value={newTag.description}
                              onChange={(e) => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Tag description..."
                              rows={2}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="is-release"
                              checked={newTag.isRelease}
                              onChange={(e) => setNewTag(prev => ({ ...prev, isRelease: e.target.checked }))}
                            />
                            <Label htmlFor="is-release">{t('isRelease')}</Label>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
                              {t('cancel')}
                            </Button>
                            <Button onClick={createTag}>
                              {t('create')}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => revertCommit(version.id)}
                    >
                      <ClockCounterClockwise size={14} className="mr-1" />
                      {t('revert')}
                    </Button>
                    
                    <Button size="sm" variant="outline">
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Tags */}
      {(tags || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TagIcon size={20} />
              {t('tags')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {(tags || []).map((tag) => (
                <div key={tag.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{tag.name}</h4>
                    {tag.isRelease && <Badge variant="default">Release</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{tag.description}</p>
                  <div className="text-xs text-muted-foreground">
                    <div>Version: {tag.version}</div>
                    <div>Commit: {tag.commitHash}</div>
                    <div>Created: {new Date(tag.createdAt).toLocaleDateString()}</div>
                    <div>Author: {tag.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rollback Operations */}
      {(rollbacks || []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockCounterClockwise size={20} />
              {t('rollbackOperations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(rollbacks || []).map((rollback) => (
                <div key={rollback.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{rollback.type}</Badge>
                      <Badge variant={
                        rollback.status === 'completed' ? 'default' :
                        rollback.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {t(rollback.status)}
                      </Badge>
                      {rollback.backupCreated && (
                        <Badge variant="outline">
                          <Archive size={12} className="mr-1" />
                          Backup
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm mb-1">{rollback.reason}</p>
                    <div className="text-xs text-muted-foreground">
                      <div>Target: {rollback.targetCommit}</div>
                      <div>Files: {rollback.affectedFiles.length}</div>
                      <div>Time: {new Date(rollback.timestamp).toLocaleString()}</div>
                      <div>Author: {rollback.author}</div>
                      {rollback.error && <div className="text-destructive">Error: {rollback.error}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diff Dialog */}
      <Dialog open={showDiffDialog} onOpenChange={setShowDiffDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{t('viewDiff')}</DialogTitle>
            <DialogDescription>
              {diffData?.path}
            </DialogDescription>
          </DialogHeader>
          {diffData && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Before</h4>
                  <pre className="text-xs bg-muted p-3 rounded border overflow-auto max-h-64">
                    {JSON.stringify(diffData.before, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-green-600">After</h4>
                  <pre className="text-xs bg-muted p-3 rounded border overflow-auto max-h-64">
                    {JSON.stringify(diffData.after, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VersionControlSystem;