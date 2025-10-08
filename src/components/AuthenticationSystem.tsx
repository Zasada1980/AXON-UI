import React, { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Shield,
  Key,
  User,
  Users,
  Lock,
  Eye,
  EyeSlash,
  CheckCircle,
  Warning,
  Clock,
  SecurityCamera,
  Fingerprint,
  Globe
} from '@phosphor-icons/react';

// Types for authentication system
interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer' | 'guest';
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
  twoFactorEnabled: boolean;
  avatar?: string;
}

interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  lastActivity: string;
}

interface SecurityAuditEvent {
  id: string;
  userId?: string;
  eventType: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'data_access' | 'settings_change';
  timestamp: string;
  ipAddress: string;
  details: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface AuthenticationSystemProps {
  language: 'en' | 'ru';
  projectId: string;
  onUserAuthenticated?: (user: AuthUser) => void;
  onSecurityEvent?: (event: SecurityAuditEvent) => void;
  onPermissionChanged?: (userId: string, permissions: string[]) => void;
}

const AuthenticationSystem: React.FC<AuthenticationSystemProps> = ({
  language,
  projectId,
  onUserAuthenticated,
  onSecurityEvent,
  onPermissionChanged
}) => {
  // Translation helper
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      // Authentication & Security
      authSystem: { en: 'Authentication System', ru: 'Система Аутентификации' },
      securityManagement: { en: 'Security Management', ru: 'Управление Безопасностью' },
      userManagement: { en: 'User Management', ru: 'Управление Пользователями' },
      sessionManagement: { en: 'Session Management', ru: 'Управление Сессиями' },
      securityAudit: { en: 'Security Audit', ru: 'Аудит Безопасности' },
      
      // Authentication
      login: { en: 'Login', ru: 'Вход' },
      logout: { en: 'Logout', ru: 'Выход' },
      username: { en: 'Username', ru: 'Имя пользователя' },
      password: { en: 'Password', ru: 'Пароль' },
      email: { en: 'Email', ru: 'Электронная почта' },
      twoFactor: { en: 'Two-Factor Authentication', ru: 'Двухфакторная Аутентификация' },
      enabled: { en: 'Enabled', ru: 'Включено' },
      disabled: { en: 'Disabled', ru: 'Отключено' },
      
      // Roles
      admin: { en: 'Administrator', ru: 'Администратор' },
      analyst: { en: 'Analyst', ru: 'Аналитик' },
      viewer: { en: 'Viewer', ru: 'Наблюдатель' },
      guest: { en: 'Guest', ru: 'Гость' },
      
      // Security levels
      low: { en: 'Low', ru: 'Низкий' },
      medium: { en: 'Medium', ru: 'Средний' },
      high: { en: 'High', ru: 'Высокий' },
      critical: { en: 'Critical', ru: 'Критический' },
      
      // Status
      active: { en: 'Active', ru: 'Активен' },
      inactive: { en: 'Inactive', ru: 'Неактивен' },
      online: { en: 'Online', ru: 'Онлайн' },
      offline: { en: 'Офлайн', ru: 'Офлайн' },
      
      // Actions
      createUser: { en: 'Create User', ru: 'Создать Пользователя' },
      editUser: { en: 'Edit User', ru: 'Редактировать Пользователя' },
      deleteUser: { en: 'Delete User', ru: 'Удалить Пользователя' },
      resetPassword: { en: 'Reset Password', ru: 'Сбросить Пароль' },
      terminateSession: { en: 'Terminate Session', ru: 'Завершить Сессию' },
      
      // Messages
      userCreated: { en: 'User created successfully', ru: 'Пользователь успешно создан' },
      userUpdated: { en: 'User updated successfully', ru: 'Пользователь успешно обновлен' },
      sessionTerminated: { en: 'Session terminated', ru: 'Сессия завершена' },
      securityEventLogged: { en: 'Security event logged', ru: 'Событие безопасности зафиксировано' },
      
      // Placeholders
      enterUsername: { en: 'Enter username', ru: 'Введите имя пользователя' },
      enterEmail: { en: 'Enter email address', ru: 'Введите адрес электронной почты' },
      enterPassword: { en: 'Enter password', ru: 'Введите пароль' }
    };
    
    return translations[key]?.[language] || key;
  };

  // State management
  const [users, setUsers] = useKV<AuthUser[]>(`auth-users-${projectId}`, []);
  const [sessions, setSessions] = useKV<AuthSession[]>(`auth-sessions-${projectId}`, []);
  const [auditEvents, setAuditEvents] = useKV<SecurityAuditEvent[]>(`security-audit-${projectId}`, []);
  const [currentUser, setCurrentUser] = useKV<AuthUser | null>(`current-user-${projectId}`, null);
  const [sparkUser, setSparkUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  // UI state
  const [activeTab, setActiveTab] = useState('users');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'viewer' as AuthUser['role'],
    securityLevel: 'medium' as AuthUser['securityLevel']
  });
  const [showPassword, setShowPassword] = useState(false);

  // Initialize demo data and Spark user integration
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoadingAuth(true);
      
      try {
        // Get current Spark user
        const sparkUserData = await (globalThis as any).spark?.user?.();
        if (sparkUserData) {
          setSparkUser(sparkUserData);
          
          // Convert Spark user to AuthUser format
          const sparkAuthUser: AuthUser = {
            id: `spark-${sparkUserData.id}`,
            username: sparkUserData.login,
            email: sparkUserData.email,
            role: sparkUserData.isOwner ? 'admin' : 'analyst',
            permissions: sparkUserData.isOwner 
              ? ['read', 'write', 'delete', 'admin', 'security', 'audit']
              : ['read', 'write', 'analyze', 'export'],
            lastLogin: new Date().toISOString(),
            isActive: true,
            securityLevel: sparkUserData.isOwner ? 'critical' : 'high',
            twoFactorEnabled: true, // Assume GitHub has 2FA
            avatar: sparkUserData.avatarUrl
          };
          
          // Set as current user
          setCurrentUser(sparkAuthUser);
          
          // Add to users list if not exists
          if (!users?.find(u => u.id === sparkAuthUser.id)) {
            setUsers(current => [...(current || []), sparkAuthUser]);
          }
          
          // Log authentication event
          logSecurityEvent('login', `Spark user authenticated: ${sparkUserData.login}`, 'low', sparkAuthUser.id);
          onUserAuthenticated?.(sparkAuthUser);
        }
      } catch (error) {
        console.error('Failed to get Spark user:', error);
        // Fallback to demo users if Spark user API fails
        initializeDemoData();
      } finally {
        setIsLoadingAuth(false);
      }
    };

    const initializeDemoData = () => {
      if (!users || users.length === 0) {
        const demoUsers: AuthUser[] = [
          {
            id: 'user-1',
            username: 'admin',
            email: 'admin@axon.ai',
            role: 'admin',
            permissions: ['read', 'write', 'delete', 'admin', 'security'],
            lastLogin: new Date().toISOString(),
            isActive: true,
            securityLevel: 'critical',
            twoFactorEnabled: true,
            avatar: undefined
          },
          {
            id: 'user-2',
            username: 'analyst_1',
            email: 'analyst@axon.ai',
            role: 'analyst',
            permissions: ['read', 'write', 'analyze'],
            lastLogin: new Date(Date.now() - 3600000).toISOString(),
            isActive: true,
            securityLevel: 'high',
            twoFactorEnabled: false
          },
          {
            id: 'user-3',
            username: 'viewer_1',
            email: 'viewer@axon.ai',
            role: 'viewer',
            permissions: ['read'],
            lastLogin: new Date(Date.now() - 86400000).toISOString(),
            isActive: true,
            securityLevel: 'medium',
            twoFactorEnabled: false
          }
        ];
        setUsers(demoUsers);
        setCurrentUser(demoUsers[0]); // Set admin as current user for demo
      }
    };

    initializeAuth();
  }, []);

  // Role-based access control
  const hasPermission = (permission: string): boolean => {
    return currentUser?.permissions.includes(permission) || false;
  };

  const canManageUsers = (): boolean => {
    return hasPermission('admin') || hasPermission('security');
  };

  const canViewAudit = (): boolean => {
    return hasPermission('admin') || hasPermission('security') || hasPermission('audit');
  };

  // Security event logging
  const logSecurityEvent = (
    eventType: SecurityAuditEvent['eventType'],
    details: string,
    riskLevel: SecurityAuditEvent['riskLevel'] = 'low',
    userId?: string
  ) => {
    const event: SecurityAuditEvent = {
      id: `event-${Date.now()}`,
      userId,
      eventType,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100', // Mock IP
      details,
      riskLevel
    };
    
    setAuditEvents(current => [...(current || []), event]);
    onSecurityEvent?.(event);
  };

  // Create new user
  const createUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error(language === 'ru' ? 'Заполните все обязательные поля' : 'Fill in all required fields');
      return;
    }

    const user: AuthUser = {
      id: `user-${Date.now()}`,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      permissions: getRolePermissions(newUser.role),
      lastLogin: new Date().toISOString(),
      isActive: true,
      securityLevel: newUser.securityLevel,
      twoFactorEnabled: false
    };

    setUsers(current => [...(current || []), user]);
    setNewUser({ username: '', email: '', password: '', role: 'viewer', securityLevel: 'medium' });
    setIsCreatingUser(false);
    
    logSecurityEvent('data_access', `User created: ${user.username}`, 'medium', currentUser?.id);
    toast.success(t('userCreated'));
    onUserAuthenticated?.(user);
  };

  // Get role permissions
  const getRolePermissions = (role: AuthUser['role']): string[] => {
    const permissionMap = {
      admin: ['read', 'write', 'delete', 'admin', 'security', 'audit'],
      analyst: ['read', 'write', 'analyze', 'export'],
      viewer: ['read', 'export'],
      guest: ['read']
    };
    return permissionMap[role] || [];
  };

  // Toggle user active status
  const toggleUserStatus = (userId: string) => {
    setUsers(current => 
      (current || []).map(user => 
        user.id === userId 
          ? { ...user, isActive: !user.isActive }
          : user
      )
    );
    
    const user = users?.find(u => u.id === userId);
    if (user) {
      logSecurityEvent(
        'settings_change', 
        `User ${user.username} status changed to ${!user.isActive ? 'active' : 'inactive'}`,
        'medium',
        currentUser?.id
      );
    }
  };

  // Terminate session
  const terminateSession = (sessionId: string) => {
    setSessions(current => 
      (current || []).map(session => 
        session.id === sessionId 
          ? { ...session, isActive: false }
          : session
      )
    );
    
    logSecurityEvent('logout', `Session terminated: ${sessionId}`, 'low', currentUser?.id);
    toast.success(t('sessionTerminated'));
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: AuthUser['role']) => {
    const variants = {
      admin: 'destructive',
      analyst: 'default',
      viewer: 'secondary',
      guest: 'outline'
    };
    return variants[role] as 'destructive' | 'default' | 'secondary' | 'outline';
  };

  // Get security level color
  const getSecurityLevelColor = (level: AuthUser['securityLevel']) => {
    const colors = {
      low: 'text-green-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      critical: 'text-red-500'
    };
    return colors[level];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="cyber-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-primary" />
              <div>
                <CardTitle>{t('authSystem')}</CardTitle>
                <CardDescription>{t('securityManagement')}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoadingAuth ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              ) : currentUser ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                  {sparkUser?.avatarUrl ? (
                    <img 
                      src={sparkUser.avatarUrl} 
                      alt={currentUser.username}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <User size={16} />
                  )}
                  <span className="text-sm font-medium">{currentUser.username}</span>
                  <Badge variant={getRoleBadgeVariant(currentUser.role)}>
                    {t(currentUser.role)}
                  </Badge>
                  {sparkUser && (
                    <Badge variant="outline" className="text-xs">
                      <Globe size={12} className="mr-1" />
                      GitHub
                    </Badge>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            {t('userManagement')}
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Clock size={16} />
            {t('sessionManagement')}
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <SecurityCamera size={16} />
            {t('securityAudit')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Key size={16} />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('userManagement')}</h3>
            {canManageUsers() && (
              <Button onClick={() => setIsCreatingUser(true)}>
                <User size={16} className="mr-2" />
                {t('createUser')}
              </Button>
            )}
          </div>

          {/* Permission Check Alert */}
          {!canManageUsers() && (
            <Alert>
              <Warning size={16} />
              <AlertDescription>
                {language === 'ru' 
                  ? 'У вас нет прав для управления пользователями. Обратитесь к администратору.'
                  : 'You do not have permission to manage users. Contact an administrator.'
                }
              </AlertDescription>
            </Alert>
          )}

          {/* User Creation Form */}
          {isCreatingUser && (
            <Card>
              <CardHeader>
                <CardTitle>{t('createUser')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="username">{t('username')}</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                      placeholder={t('enterUsername')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={t('enterEmail')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">{t('password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        placeholder={t('enterPassword')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={newUser.role} onValueChange={(value: AuthUser['role']) => 
                      setNewUser(prev => ({ ...prev, role: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t('admin')}</SelectItem>
                        <SelectItem value="analyst">{t('analyst')}</SelectItem>
                        <SelectItem value="viewer">{t('viewer')}</SelectItem>
                        <SelectItem value="guest">{t('guest')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={createUser}>
                    <CheckCircle size={16} className="mr-2" />
                    {t('createUser')}
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreatingUser(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <div className="grid gap-4">
            {(users || []).map(user => (
              <Card key={user.id} className="cyber-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{user.username}</h4>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {t(user.role)}
                          </Badge>
                          <Badge variant={user.isActive ? 'default' : 'outline'}>
                            {user.isActive ? t('active') : t('inactive')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs ${getSecurityLevelColor(user.securityLevel)}`}>
                            {t(user.securityLevel)} security
                          </span>
                          {user.twoFactorEnabled && (
                            <Badge variant="outline" className="text-xs">
                              <Fingerprint size={12} className="mr-1" />
                              2FA
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Last: {new Date(user.lastLogin).toLocaleDateString()}
                      </span>
                      {canManageUsers() && user.id !== currentUser?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.isActive ? <Lock size={16} /> : <Lock size={16} className="opacity-50" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Session Management Tab */}
        <TabsContent value="sessions" className="space-y-4">
          {!canManageUsers() ? (
            <Alert>
              <Warning size={16} />
              <AlertDescription>
                {language === 'ru' 
                  ? 'У вас нет прав для управления сессиями. Обратитесь к администратору.'
                  : 'You do not have permission to manage sessions. Contact an administrator.'
                }
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('sessionManagement')}</h3>
                <Badge variant="secondary">
                  {(sessions || []).filter(s => s.isActive).length} {t('active')} sessions
                </Badge>
              </div>

              {/* Active Sessions */}
              <div className="grid gap-4">
                {(sessions || []).filter(s => s.isActive).map(session => {
                  const user = users?.find(u => u.id === session.userId);
                  return (
                    <Card key={session.id} className="cyber-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <div>
                              <h4 className="font-medium">{user?.username || 'Unknown User'}</h4>
                              <p className="text-sm text-muted-foreground">
                                IP: {session.ipAddress} • {new Date(session.lastActivity).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {session.userAgent.substring(0, 50)}...
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => terminateSession(session.id)}
                          >
                            {t('terminateSession')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* Security Audit Tab */}
        <TabsContent value="audit" className="space-y-4">
          {!canViewAudit() ? (
            <Alert>
              <Warning size={16} />
              <AlertDescription>
                {language === 'ru' 
                  ? 'У вас нет прав для просмотра аудита безопасности. Обратитесь к администратору.'
                  : 'You do not have permission to view security audit. Contact an administrator.'
                }
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('securityAudit')}</h3>
                <Badge variant="secondary">
                  {(auditEvents || []).length} events logged
                </Badge>
              </div>

              {/* Security Events */}
              <div className="space-y-3">
                {(auditEvents || []).slice().reverse().slice(0, 20).map(event => {
                  const user = users?.find(u => u.id === event.userId);
                  return (
                    <Card key={event.id} className="cyber-border">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              event.riskLevel === 'critical' ? 'bg-red-500' :
                              event.riskLevel === 'high' ? 'bg-orange-500' :
                              event.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{event.eventType}</span>
                                <Badge variant="outline" className="text-xs">
                                  {t(event.riskLevel)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.details}</p>
                              <p className="text-xs text-muted-foreground">
                                {user?.username || 'System'} • {event.ipAddress} • {new Date(event.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <h3 className="text-lg font-semibold">Security Settings</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Password Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Minimum length</span>
                  <Badge>8 characters</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Require uppercase</span>
                  <Badge variant="default">Yes</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Require numbers</span>
                  <Badge variant="default">Yes</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Special characters</span>
                  <Badge variant="secondary">Optional</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Session Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Session timeout</span>
                  <Badge>24 hours</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Concurrent sessions</span>
                  <Badge>3 max</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Auto logout</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Shield size={16} />
            <AlertDescription>
              {language === 'ru' 
                ? 'Система аутентификации находится в режиме разработки. Все пароли шифруются, но рекомендуется использовать надежные пароли.'
                : 'Authentication system is in development mode. All passwords are encrypted, but strong passwords are recommended.'
              }
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthenticationSystem;