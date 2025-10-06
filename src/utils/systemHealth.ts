// System health monitoring utilities
export interface SystemHealthMetrics {
  memory: number;
  performance: number;
  storage: number;
  network: number;
  security: number;
  uptime: number;
}

export interface HealthThresholds {
  critical: number;
  warning: number;
  good: number;
}

export const defaultThresholds: HealthThresholds = {
  critical: 30,
  warning: 60,
  good: 80
};

export const getHealthStatus = (value: number, thresholds: HealthThresholds = defaultThresholds): 'critical' | 'warning' | 'good' => {
  if (value < thresholds.critical) return 'critical';
  if (value < thresholds.warning) return 'warning';
  return 'good';
};

export const getHealthColor = (status: 'critical' | 'warning' | 'good'): string => {
  switch (status) {
    case 'critical': return 'destructive';
    case 'warning': return 'secondary';
    case 'good': return 'default';
  }
};

export const calculateOverallHealth = (metrics: SystemHealthMetrics): number => {
  const weights = {
    memory: 0.2,
    performance: 0.25,
    storage: 0.15,
    network: 0.15,
    security: 0.2,
    uptime: 0.05
  };

  return Math.round(
    metrics.memory * weights.memory +
    metrics.performance * weights.performance +
    metrics.storage * weights.storage +
    metrics.network * weights.network +
    metrics.security * weights.security +
    metrics.uptime * weights.uptime
  );
};

export const generateHealthReport = (metrics: SystemHealthMetrics, language: 'en' | 'ru' = 'en') => {
  const overallHealth = calculateOverallHealth(metrics);
  const status = getHealthStatus(overallHealth);
  
  const messages = {
    en: {
      critical: 'System requires immediate attention',
      warning: 'System performance is degraded',
      good: 'System is operating normally'
    },
    ru: {
      critical: 'Система требует немедленного внимания',
      warning: 'Производительность системы снижена',
      good: 'Система работает нормально'
    }
  };

  return {
    overallHealth,
    status,
    message: messages[language][status],
    recommendations: generateRecommendations(metrics, language)
  };
};

const generateRecommendations = (metrics: SystemHealthMetrics, language: 'en' | 'ru') => {
  const recommendations: string[] = [];
  
  const messages = {
    en: {
      memory: 'Consider clearing cache or optimizing memory usage',
      performance: 'Review and optimize running processes',
      storage: 'Clean up unnecessary files and data',
      network: 'Check network connection and bandwidth',
      security: 'Update security configurations and patches'
    },
    ru: {
      memory: 'Рассмотрите очистку кэша или оптимизацию использования памяти',
      performance: 'Проверьте и оптимизируйте запущенные процессы',
      storage: 'Очистите ненужные файлы и данные',
      network: 'Проверьте сетевое подключение и пропускную способность',
      security: 'Обновите настройки безопасности и патчи'
    }
  };

  if (metrics.memory < 70) recommendations.push(messages[language].memory);
  if (metrics.performance < 70) recommendations.push(messages[language].performance);
  if (metrics.storage < 70) recommendations.push(messages[language].storage);
  if (metrics.network < 80) recommendations.push(messages[language].network);
  if (metrics.security < 85) recommendations.push(messages[language].security);

  return recommendations;
};