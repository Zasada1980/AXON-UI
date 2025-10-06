# AXON Chat Module Integration

## Overview
Интеграция модуля ИИ-чата в платформу AXON для контекстного анализа проектов. Чат предоставляет интеллектуальную помощь в работе с данными проекта, используя контекст из всех модулей системы.

## Architecture

### Core Components

#### 1. Chat Message Interface
```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: {
    module: string;
    data?: any;
  };
}
```

#### 2. Chat Session Management
```typescript
interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  lastActive: string;
}
```

#### 3. Project Integration
- Интеграция в `AnalysisProject` интерфейс
- Автоматическая синхронизация с данными проекта
- Сохранение истории чата в localStorage через `useKV`

### Module Connection Logic

#### 1. Context-Aware Responses
Чат автоматически получает контекст из:
- **Kipling Dimensions**: Анализ по 6 измерениям (Who, What, When, Where, Why, How)
- **IKR Directive**: Intelligence, Knowledge, Reasoning данные
- **Audit Results**: Результаты проверок ИИ-агентов
- **Project Metadata**: Название, описание, прогресс выполнения

#### 2. Active Module Integration
```typescript
const projectContext = {
  title: project.title,
  description: project.description,
  completeness: calculateCompleteness(project),
  dimensions: project.dimensions.map(d => ({
    dimension: d.title,
    content: d.content,
    insights: d.insights,
    priority: d.priority,
    completeness: d.completeness
  })),
  ikrDirective: project.ikrDirective,
  auditResults: project.auditSessions.filter(s => s.status === 'completed'),
  activeModule: activeTab
};
```

#### 3. Smart Response Generation
```typescript
const generateChatResponse = async (userMessage: string, session: ChatSession) => {
  const prompt = spark.llmPrompt`You are an AI assistant specialized in intelligence analysis using the AXON platform...

Current project context: ${JSON.stringify(projectContext, null, 2)}

User message: ${userMessage}

Please provide a helpful, contextual response that:
1. References specific data from the user's project when relevant
2. Suggests actionable insights or next steps
3. Helps the user understand their analysis better`;

  const response = await spark.llm(prompt, 'gpt-4o-mini');
  // Add response to chat history
};
```

### UI Components

#### 1. Chat Interface
- **Scrollable Message Area**: Отображение истории сообщений
- **Message Types**: Различные стили для user/assistant/system сообщений
- **Loading States**: Индикатор загрузки при генерации ответов
- **Timestamps**: Время отправки и контекстная информация

#### 2. Input Controls
- **Text Input**: Основное поле ввода с поддержкой Enter
- **Voice Input**: Кнопка записи голоса (симуляция)
- **Send Button**: Отправка сообщений
- **Clear Chat**: Очистка истории чата

#### 3. Contextual Actions
Быстрые кнопки для типичных запросов:
- **Analyze Progress**: Анализ прогресса проекта
- **Help with Dimensions**: Помощь с незавершенными измерениями Киплинга
- **IKR Insights**: Генерация идей по IKR директиве
- **Audit Summary**: Сводка результатов аудита

#### 4. Context Panel
Отображение текущего контекста:
- Активный модуль
- Прогресс проекта
- Статус измерений Киплинга
- Количество завершенных аудитов

### Color Theme Integration

#### Chat Module Colors
```css
.module-chat {
  --color-module-primary: oklch(65% 0.2 280);    /* Purple primary */
  --color-module-secondary: oklch(45% 0.12 300); /* Dark purple secondary */
  --color-module-accent: oklch(75% 0.25 260);    /* Light purple accent */
  --color-module-background: oklch(20% 0.03 280); /* Dark purple background */
}
```

#### Dynamic Color Application
Цвета автоматически применяются при переключении на вкладку Chat:
```typescript
case 'chat':
  root.style.setProperty('--module-primary', settings.chat.primary);
  root.style.setProperty('--module-secondary', settings.chat.secondary);
  root.style.setProperty('--module-accent', settings.chat.accent);
  root.style.setProperty('--module-background', settings.chat.background);
  break;
```

### Data Flow

#### 1. Message Flow
```
User Input → Chat Session → Context Building → LLM Processing → Response → UI Update → Data Persistence
```

#### 2. Context Synchronization
```
Project Data Changes → Context Update → Active Chat Session → Real-time Context Display
```

#### 3. Module Integration
```
Tab Switch → Color Theme Change → Context Update → Available Actions Update
```

### Features

#### 1. Intelligent Context Awareness
- Автоматическое распознавание активного модуля
- Ссылки на конкретные данные проекта
- Адаптивные предложения на основе состояния проекта

#### 2. Multi-Modal Input
- Текстовый ввод с поддержкой клавиш
- Голосовой ввод (симуляция)
- Контекстные быстрые действия

#### 3. Session Management
- Сохранение истории чата
- Создание новых сессий
- Очистка истории

#### 4. Responsive Design
- Адаптивная сетка для различных размеров экрана
- Scrollable контент для длинных разговоров
- Оптимизированный мобильный интерфейс

### Integration with AXON Repository Logic

Чат-модуль создан с учетом архитектуры репозитория AXON:

#### 1. Модульная Архитектура
- Независимый функциональный модуль
- Интеграция через единый интерфейс проекта
- Переиспользование существующих UI компонентов

#### 2. Data Persistence Strategy
- Использование `useKV` для сохранения чата
- Синхронизация с общими данными проекта
- Backward compatibility с существующими проектами

#### 3. Theme System Integration
- Расширение существующей системы модульных цветов
- Совместимость с настройками цветов
- Автоматическое применение темы при переключении модулей

#### 4. API Integration
- Использование глобального `spark.llm` API
- Поддержка различных моделей ИИ
- Обработка ошибок и состояний загрузки

Эта интеграция обеспечивает seamless соединение чат-функциональности с существующей архитектурой AXON, предоставляя пользователям мощный инструмент для интеллектуального анализа данных.