import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  BellSlash, 
  Clock, 
  Warning, 
  CheckCircle, 
  Info,
  X,
  Gear
} from '@phosphor-icons/react';
import { toast } from 'sonner';

type Language = 'en' | 'ru';

interface NotificationSettings {
  taskCompletion: boolean;
  blockerAlerts: boolean;
  overdueReminders: boolean;
  weeklyReports: boolean;
  integrationStatus: boolean;
  auditResults: boolean;
}

interface Notification {
  id: string;
  type: 'task' | 'blocker' | 'overdue' | 'report' | 'integration' | 'audit';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  actionUrl?: string;
}

interface NotificationSystemProps {
  language: Language;
  projectId?: string;
  onNotificationClick?: (notification: Notification) => void;
}

const translations = {
  // Notification System
  notificationSystem: { en: 'Notification System', ru: 'Система Уведомлений' },
  notificationSettings: { en: 'Notification Settings', ru: 'Настройки Уведомлений' },
  allNotifications: { en: 'All Notifications', ru: 'Все Уведомления' },
  unreadNotifications: { en: 'Unread Notifications', ru: 'Непрочитанные' },
  markAllRead: { en: 'Mark All Read', ru: 'Отметить Прочитанным' },
  clearAll: { en: 'Clear All', ru: 'Очистить Все' },
  
  // Settings
  taskCompletionNotifs: { en: 'Task Completion', ru: 'Завершение Задач' },
  blockerAlerts: { en: 'Blocker Alerts', ru: 'Алерты Блокеров' },
  overdueReminders: { en: 'Overdue Reminders', ru: 'Напоминания о Просрочке' },
  weeklyReports: { en: 'Weekly Reports', ru: 'Еженедельные Отчеты' },
  integrationStatus: { en: 'Integration Status', ru: 'Статус Интеграции' },
  auditResults: { en: 'Audit Results', ru: 'Результаты Аудита' },
  
  // Types
  task: { en: 'Task', ru: 'Задача' },
  blocker: { en: 'Blocker', ru: 'Блокер' },
  overdue: { en: 'Overdue', ru: 'Просрочка' },
  report: { en: 'Report', ru: 'Отчет' },
  integration: { en: 'Integration', ru: 'Интеграция' },
  audit: { en: 'Audit', ru: 'Аудит' },
  
  // Priority
  low: { en: 'Low', ru: 'Низкий' },
  medium: { en: 'Medium', ru: 'Средний' },
  high: { en: 'High', ru: 'Высокий' },
  critical: { en: 'Critical', ru: 'Критический' },
  
  // Messages
  noNotifications: { en: 'No notifications', ru: 'Нет уведомлений' },
  notificationsCleared: { en: 'All notifications cleared', ru: 'Все уведомления очищены' },
  notificationsMarkedRead: { en: 'All notifications marked as read', ru: 'Все уведомления отмечены прочитанными' },
  settingsUpdated: { en: 'Notification settings updated', ru: 'Настройки уведомлений обновлены' },
  
  // Time
  now: { en: 'now', ru: 'сейчас' },
  minutesAgo: { en: 'min ago', ru: 'мин назад' },
  hoursAgo: { en: 'h ago', ru: 'ч назад' },
  daysAgo: { en: 'd ago', ru: 'д назад' }
};

const useTranslation = (language: Language) => {
  return (key: string): string => {
    return translations[key]?.[language] || key;
  };
};

export default function NotificationSystem({ 
  language, 
  projectId,
  onNotificationClick 
}: NotificationSystemProps) {
  const t = useTranslation(language);
  
  // Persistent storage
  const [notifications, setNotifications] = useKV<Notification[]>('axon-notifications', []);
  const [settings, setSettings] = useKV<NotificationSettings>('axon-notification-settings', {
    taskCompletion: true,
    blockerAlerts: true,
    overdueReminders: true,
    weeklyReports: false,
    integrationStatus: true,
    auditResults: true
  });
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  // Get icon for notification type
  const getNotificationIcon = (type: string, priority: string) => {
    const iconProps = { 
      size: 16, 
      className: priority === 'critical' ? 'text-destructive' : 
                  priority === 'high' ? 'text-orange-500' :
                  priority === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'
    };
    
    switch (type) {
      case 'task': return <CheckCircle {...iconProps} />;
      case 'blocker': return <Warning {...iconProps} />;
      case 'overdue': return <Clock {...iconProps} />;
      case 'audit': return <Warning {...iconProps} />;
      default: return <Info {...iconProps} />;
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return t('now');
    if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
    return `${diffDays} ${t('daysAgo')}`;
  };
  
  // Add notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(current => [newNotification, ...(current || [])]);
    
    // Show toast for high priority notifications
    if (notification.priority === 'critical' || notification.priority === 'high') {
      toast.error(notification.title, {
        description: notification.message
      });
    }
  };
  
  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(current => 
      (current || []).map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(current => 
      (current || []).map(n => ({ ...n, read: true }))
    );
    toast.success(t('notificationsMarkedRead'));
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success(t('notificationsCleared'));
  };
  
  // Remove notification
  const removeNotification = (notificationId: string) => {
    setNotifications(current => 
      (current || []).filter(n => n.id !== notificationId)
    );
  };
  
  // Update settings
  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(current => {
      const newSettings = { ...(current || {}) } as NotificationSettings;
      newSettings[key] = value;
      return {
        taskCompletion: newSettings.taskCompletion ?? true,
        blockerAlerts: newSettings.blockerAlerts ?? true,
        overdueReminders: newSettings.overdueReminders ?? true,
        weeklyReports: newSettings.weeklyReports ?? false,
        integrationStatus: newSettings.integrationStatus ?? true,
        auditResults: newSettings.auditResults ?? true
      };
    });
    toast.success(t('settingsUpdated'));
  };
  
  // Filter notifications
  const filteredNotifications = (notifications || []).filter(n => {
    if (filter === 'unread') return !n.read;
    if (projectId) return !n.projectId || n.projectId === projectId;
    return true;
  });
  
  const unreadCount = (notifications || []).filter(n => !n.read).length;
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };
  
  // Expose add notification function globally for other components
  useEffect(() => {
    (window as any).addNotification = addNotification;
    return () => {
      delete (window as any).addNotification;
    };
  }, []);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={24} className="text-primary" />
              <div>
                <CardTitle>{t('notificationSystem')}</CardTitle>
                <CardDescription>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount} {t('unreadNotifications').toLowerCase()}
                    </Badge>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Gear size={16} className="mr-2" />
                {t('notificationSettings')}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Settings Panel */}
        {showSettings && (
          <>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="task-completion">{t('taskCompletionNotifs')}</Label>
                  <Switch
                    id="task-completion"
                    checked={settings?.taskCompletion || false}
                    onCheckedChange={(checked) => updateSetting('taskCompletion', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="blocker-alerts">{t('blockerAlerts')}</Label>
                  <Switch
                    id="blocker-alerts"
                    checked={settings?.blockerAlerts || false}
                    onCheckedChange={(checked) => updateSetting('blockerAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="overdue-reminders">{t('overdueReminders')}</Label>
                  <Switch
                    id="overdue-reminders"
                    checked={settings?.overdueReminders || false}
                    onCheckedChange={(checked) => updateSetting('overdueReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-reports">{t('weeklyReports')}</Label>
                  <Switch
                    id="weekly-reports"
                    checked={settings?.weeklyReports || false}
                    onCheckedChange={(checked) => updateSetting('weeklyReports', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="integration-status">{t('integrationStatus')}</Label>
                  <Switch
                    id="integration-status"
                    checked={settings?.integrationStatus || false}
                    onCheckedChange={(checked) => updateSetting('integrationStatus', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="audit-results">{t('auditResults')}</Label>
                  <Switch
                    id="audit-results"
                    checked={settings?.auditResults || false}
                    onCheckedChange={(checked) => updateSetting('auditResults', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </>
        )}
        
        <Separator />
        
        {/* Notifications Controls */}
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                {t('allNotifications')}
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                {t('unreadNotifications')} {unreadCount > 0 && `(${unreadCount})`}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCircle size={16} className="mr-2" />
                  {t('markAllRead')}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                <X size={16} className="mr-2" />
                {t('clearAll')}
              </Button>
            </div>
          </div>
          
          {/* Notifications List */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BellSlash size={48} className="mx-auto mb-4 opacity-50" />
                  <p>{t('noNotifications')}</p>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <Card 
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.read ? 'bg-muted/50 border-primary/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type, notification.priority)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {t(notification.type)}
                              </Badge>
                              <Badge 
                                variant={
                                  notification.priority === 'critical' ? 'destructive' :
                                  notification.priority === 'high' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {t(notification.priority)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions for other components to use
export const createNotification = (
  type: Notification['type'],
  title: string,
  message: string,
  priority: Notification['priority'] = 'medium',
  projectId?: string,
  actionUrl?: string
) => {
  if (typeof window !== 'undefined' && (window as any).addNotification) {
    (window as any).addNotification({
      type,
      title,
      message,
      priority,
      projectId,
      actionUrl
    });
  }
};

// Specific notification creators
export const notifyTaskCompleted = (taskTitle: string, projectId?: string) => {
  createNotification('task', 'Task Completed', `"${taskTitle}" has been completed`, 'low', projectId);
};

export const notifyBlockerDetected = (blockerDescription: string, projectId?: string) => {
  createNotification('blocker', 'Blocker Detected', blockerDescription, 'high', projectId);
};

export const notifyTaskOverdue = (taskTitle: string, projectId?: string) => {
  createNotification('overdue', 'Task Overdue', `"${taskTitle}" is overdue`, 'high', projectId);
};

export const notifyIntegrationComplete = (integrationName: string, projectId?: string) => {
  createNotification('integration', 'Integration Complete', `"${integrationName}" integration completed successfully`, 'medium', projectId);
};

export const notifyAuditResult = (agentName: string, findings: number, projectId?: string) => {
  const priority = findings > 5 ? 'high' : findings > 0 ? 'medium' : 'low';
  createNotification('audit', 'Audit Completed', `${agentName} found ${findings} issues`, priority, projectId);
};