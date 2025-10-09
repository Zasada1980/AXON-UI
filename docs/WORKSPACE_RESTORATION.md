# Восстановление Рабочей Области / Workspace Restoration

## 🇷🇺 Русский

### Как восстановить рабочую область в VS Code

Если вы работали вчера с этим репозиторием и хотите восстановить свою рабочую область:

#### Вариант 1: Открыть проект в VS Code

1. **Откройте папку проекта**:
   ```bash
   code /path/to/AXON-UI
   ```
   или через меню: File → Open Folder → выберите директорию AXON-UI

2. **VS Code автоматически восстановит**:
   - Открытые файлы и вкладки
   - Позиции курсора
   - Настройки рабочей области
   - История поиска
   - Состояние боковой панели

#### Вариант 2: Использовать резервное копирование проекта

Если вы использовали систему автоматического резервного копирования в приложении:

1. **Запустите приложение**:
   ```bash
   npm run dev
   ```

2. **Перейдите к Auto Backup System**:
   - Откройте боковое меню навигации
   - Найдите раздел "Auto Backup System"
   - Или перейдите напрямую к компоненту резервного копирования

3. **Восстановите последний бэкап**:
   - Нажмите "Быстрое восстановление" (Quick Restore)
   - Или выберите конкретный бэкап из списка
   - Нажмите "Восстановить" (Restore)

#### Вариант 3: Восстановить через Git

Если вы работали в определенной ветке:

```bash
# Посмотреть все ветки
git branch -a

# Переключиться на вашу рабочую ветку
git checkout your-branch-name

# Или посмотреть последние коммиты
git log --oneline --all --graph -10

# Восстановить незакоммиченные изменения (если есть stash)
git stash list
git stash apply
```

### Настройки VS Code для проекта

В проекте уже настроена конфигурация `.vscode/`:

- **settings.json** - рекомендуемые настройки редактора
- **extensions.json** - список рекомендуемых расширений
- **launch.json** - конфигурации для отладки

При первом открытии проекта VS Code предложит установить рекомендуемые расширения.

### Рекомендуемые расширения

- **ESLint** - линтинг кода
- **Prettier** - форматирование кода
- **Tailwind CSS IntelliSense** - автодополнение для Tailwind
- **GitHub Copilot** - AI-помощник
- **Error Lens** - встроенные подсказки об ошибках

### Восстановление состояния приложения

Приложение хранит данные в localStorage браузера:

- Проекты и их настройки
- История резервных копий
- Состояние модулей (Kipling, IKR, Audit)
- Настройки пользователя

**Важно**: localStorage привязан к домену (обычно `http://localhost:5173`). Если вы очистили кеш браузера или меняли порт, данные могут быть недоступны.

---

## 🇬🇧 English

### How to Restore Your Workspace in VS Code

If you were working yesterday with this repository and want to restore your workspace:

#### Option 1: Open Project in VS Code

1. **Open project folder**:
   ```bash
   code /path/to/AXON-UI
   ```
   or via menu: File → Open Folder → select AXON-UI directory

2. **VS Code will automatically restore**:
   - Open files and tabs
   - Cursor positions
   - Workspace settings
   - Search history
   - Sidebar state

#### Option 2: Use Project Backup System

If you used the automatic backup system in the application:

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Navigate to Auto Backup System**:
   - Open the navigation sidebar
   - Find "Auto Backup System" section
   - Or navigate directly to the backup component

3. **Restore latest backup**:
   - Click "Quick Restore"
   - Or select a specific backup from the list
   - Click "Restore"

#### Option 3: Restore via Git

If you were working in a specific branch:

```bash
# View all branches
git branch -a

# Switch to your working branch
git checkout your-branch-name

# Or view recent commits
git log --oneline --all --graph -10

# Restore uncommitted changes (if stashed)
git stash list
git stash apply
```

### VS Code Settings for Project

The project includes `.vscode/` configuration:

- **settings.json** - recommended editor settings
- **extensions.json** - list of recommended extensions
- **launch.json** - debugging configurations

When you first open the project, VS Code will prompt you to install recommended extensions.

### Recommended Extensions

- **ESLint** - code linting
- **Prettier** - code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocompletion
- **GitHub Copilot** - AI assistant
- **Error Lens** - inline error hints

### Restoring Application State

The application stores data in browser localStorage:

- Projects and their settings
- Backup history
- Module state (Kipling, IKR, Audit)
- User settings

**Important**: localStorage is tied to the domain (usually `http://localhost:5173`). If you cleared browser cache or changed the port, data may be unavailable.

---

## Быстрые команды / Quick Commands

```bash
# Установка зависимостей / Install dependencies
npm install

# Запуск dev-сервера / Start dev server
npm run dev

# Сборка проекта / Build project
npm run build

# Запуск тестов / Run tests
npm test

# Проверка типов / Type checking
npm run typecheck

# Линтинг / Linting
npm run lint
```

## Дополнительная помощь / Additional Help

- См. [README.md](../README.md) для общей информации о проекте
- См. [CONTRIBUTING.md](../CONTRIBUTING.md) для процесса разработки
- См. компонент `AutoBackupSystem.tsx` для деталей системы резервного копирования
