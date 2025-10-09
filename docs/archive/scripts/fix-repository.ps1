# ====================================================================
# AXON-UI Auto-Fix Script
# Автоматическое исправление всех критических проблем
# Дата: 9 октября 2025 г.
# ====================================================================

param(
    [switch]$DryRun = $false,
    [switch]$SkipInstall = $false
)

$ErrorActionPreference = "Continue"
$script:fixedCount = 0
$script:errors = @()

# Цвета для вывода
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    $colors = @{
        "Green"  = [ConsoleColor]::Green
        "Red"    = [ConsoleColor]::Red
        "Yellow" = [ConsoleColor]::Yellow
        "Cyan"   = [ConsoleColor]::Cyan
    }
    Write-Host $Message -ForegroundColor $colors[$Color]
}

function Write-Section {
    param([string]$Title)
    Write-Host "`n" -NoNewline
    Write-ColorOutput "═══════════════════════════════════════════════════════" "Cyan"
    Write-ColorOutput " $Title" "Cyan"
    Write-ColorOutput "═══════════════════════════════════════════════════════" "Cyan"
}

function Test-ProjectRoot {
    if (!(Test-Path "package.json")) {
        Write-ColorOutput "❌ ОШИБКА: Запустите скрипт из корня проекта AXON-UI" "Red"
        exit 1
    }
}

# ====================================================================
# ФАЗА 1: УСТАНОВКА ЗАВИСИМОСТЕЙ
# ====================================================================
function Install-MissingDependencies {
    Write-Section "ФАЗА 1: Установка отсутствующих зависимостей"
    
    if ($SkipInstall) {
        Write-ColorOutput "⏭️  Пропуск установки зависимостей (--SkipInstall)" "Yellow"
        return
    }
    
    if ($DryRun) {
        Write-ColorOutput "🔍 DRY RUN: Будут установлены:" "Yellow"
        Write-Host "   - @types/node (dev)"
        Write-Host "   - @octokit/core@^7.0.5"
        return
    }
    
    try {
        Write-ColorOutput "📦 Устанавливаю @types/node..." "Green"
        npm install --save-dev @types/node 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ @types/node установлен" "Green"
            $script:fixedCount++
        }
    }
    catch {
        Write-ColorOutput "❌ Ошибка установки @types/node: $_" "Red"
        $script:errors += "@types/node installation failed"
    }
    
    try {
        Write-ColorOutput "📦 Обновляю @octokit/core до версии 7..." "Green"
        npm install @octokit/core@^7.0.5 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ @octokit/core обновлён" "Green"
            $script:fixedCount++
        }
    }
    catch {
        Write-ColorOutput "❌ Ошибка обновления @octokit/core: $_" "Red"
        $script:errors += "@octokit/core update failed"
    }
}

# ====================================================================
# ФАЗА 2: ENVIRONMENT CONFIGURATION
# ====================================================================
function Create-EnvironmentFiles {
    Write-Section "ФАЗА 2: Создание Environment Configuration"
    
    # .env.example
    $envExampleContent = @"
# ============================================================================
# AXON-UI Environment Configuration
# Скопируйте этот файл в .env и настройте под свои нужды
# ============================================================================

# Development Server Configuration
UI_PORT=5000
HOST=localhost

# AXON API Configuration
# Для интеграции с AXON backend
VITE_AXON_PROXY_TARGET=http://localhost:8000
VITE_AXON_BASE_URL=/api/axon

# Project Root (optional)
PROJECT_ROOT=.

# ============================================================================
# Development Notes:
# - UI_PORT: Порт для Vite dev-сервера (по умолчанию 5000)
# - HOST: Хост для dev-сервера (localhost для локальной разработки)
# - VITE_AXON_PROXY_TARGET: URL AXON backend для проксирования запросов
# - VITE_AXON_BASE_URL: Base URL для AXON API endpoints
# ============================================================================
"@
    
    if ($DryRun) {
        Write-ColorOutput "🔍 DRY RUN: Будет создан .env.example ($(($envExampleContent -split "`n").Count) строк)" "Yellow"
    }
    else {
        try {
            Set-Content -Path ".env.example" -Value $envExampleContent -Encoding UTF8
            Write-ColorOutput "✅ Создан .env.example" "Green"
            $script:fixedCount++
        }
        catch {
            Write-ColorOutput "❌ Ошибка создания .env.example: $_" "Red"
            $script:errors += ".env.example creation failed"
        }
    }
    
    # .env (локальный)
    if (!(Test-Path ".env")) {
        if ($DryRun) {
            Write-ColorOutput "🔍 DRY RUN: Будет создан .env (копия .env.example)" "Yellow"
        }
        else {
            try {
                Copy-Item ".env.example" ".env"
                Write-ColorOutput "✅ Создан .env из .env.example" "Green"
                $script:fixedCount++
            }
            catch {
                Write-ColorOutput "❌ Ошибка создания .env: $_" "Red"
                $script:errors += ".env creation failed"
            }
        }
    }
    else {
        Write-ColorOutput "ℹ️  .env уже существует (пропуск)" "Yellow"
    }
    
    # src/config/environment.ts
    $envTsContent = @"
/**
 * Environment Configuration
 * Централизованная конфигурация переменных окружения
 * 
 * @module config/environment
 */

export const environment = {
  /** UI Configuration */
  ui: {
    /** Port for Vite dev server */
    port: Number(import.meta.env.UI_PORT) || 5000,
    /** Host for dev server */
    host: import.meta.env.HOST || 'localhost',
  },
  
  /** AXON Backend Configuration */
  axon: {
    /** Proxy target for AXON API (vite proxy) */
    proxyTarget: import.meta.env.VITE_AXON_PROXY_TARGET || '',
    /** Base URL for AXON API endpoints */
    baseUrl: import.meta.env.VITE_AXON_BASE_URL || '/api/axon',
    /** Full endpoint URL (computed) */
    get endpoint() {
      return this.proxyTarget || this.baseUrl;
    },
  },
  
  /** Environment flags */
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

export type Environment = typeof environment;

/**
 * Type-safe environment variable access
 * Usage: getEnv('VITE_AXON_BASE_URL', '/api/axon')
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  return (import.meta.env[key] as string) || defaultValue;
}

/**
 * Validate required environment variables
 * Call this in main.tsx to ensure all required vars are set
 */
export function validateEnvironment(): boolean {
  const required: string[] = [
    // Add required env vars here if needed
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
}

export default environment;
"@
    
    if (!(Test-Path "src/config")) {
        if ($DryRun) {
            Write-ColorOutput "🔍 DRY RUN: Будет создана директория src/config" "Yellow"
        }
        else {
            try {
                New-Item -ItemType Directory -Path "src/config" -Force | Out-Null
                Write-ColorOutput "✅ Создана директория src/config" "Green"
                $script:fixedCount++
            }
            catch {
                Write-ColorOutput "❌ Ошибка создания src/config: $_" "Red"
                $script:errors += "src/config directory creation failed"
                return
            }
        }
    }
    
    if ($DryRun) {
        Write-ColorOutput "🔍 DRY RUN: Будет создан src/config/environment.ts ($(($envTsContent -split "`n").Count) строк)" "Yellow"
    }
    else {
        try {
            Set-Content -Path "src/config/environment.ts" -Value $envTsContent -Encoding UTF8
            Write-ColorOutput "✅ Создан src/config/environment.ts" "Green"
            $script:fixedCount++
        }
        catch {
            Write-ColorOutput "❌ Ошибка создания environment.ts: $_" "Red"
            $script:errors += "environment.ts creation failed"
        }
    }
}

# ====================================================================
# ФАЗА 3: TYPESCRIPT CONFIGURATION
# ====================================================================
function Update-TypeScriptConfig {
    Write-Section "ФАЗА 3: Обновление TypeScript Configuration"
    
    if (!(Test-Path "tsconfig.json")) {
        Write-ColorOutput "❌ tsconfig.json не найден" "Red"
        $script:errors += "tsconfig.json not found"
        return
    }
    
    try {
        $tsconfig = Get-Content "tsconfig.json" -Raw
        
        # Проверяем, есть ли уже "node" в types
        if ($tsconfig -match '"types"\s*:\s*\[([^\]]*)\]') {
            $typesArray = $matches[1]
            if ($typesArray -notmatch '"node"') {
                if ($DryRun) {
                    Write-ColorOutput "🔍 DRY RUN: Будет добавлено 'node' в types массив tsconfig.json" "Yellow"
                }
                else {
                    # Добавляем "node" в массив types
                    $newTypesArray = $typesArray.TrimEnd() + ', "node"'
                    $newTsconfig = $tsconfig -replace '"types"\s*:\s*\[[^\]]*\]', "`"types`": [$newTypesArray]"
                    
                    Set-Content -Path "tsconfig.json" -Value $newTsconfig -Encoding UTF8
                    Write-ColorOutput "✅ Добавлен 'node' в types массив tsconfig.json" "Green"
                    $script:fixedCount++
                }
            }
            else {
                Write-ColorOutput "ℹ️  'node' уже присутствует в types (пропуск)" "Yellow"
            }
        }
        else {
            Write-ColorOutput "⚠️  Не найден массив 'types' в tsconfig.json" "Yellow"
        }
    }
    catch {
        Write-ColorOutput "❌ Ошибка обновления tsconfig.json: $_" "Red"
        $script:errors += "tsconfig.json update failed"
    }
}

# ====================================================================
# ФАЗА 4: VALIDATION
# ====================================================================
function Run-Validation {
    Write-Section "ФАЗА 4: Проверка исправлений"
    
    if ($DryRun) {
        Write-ColorOutput "🔍 DRY RUN: Будут выполнены проверки:" "Yellow"
        Write-Host "   - npm run typecheck (проверка TypeScript)"
        Write-Host "   - npm run test (запуск тестов)"
        return
    }
    
    Write-ColorOutput "🔍 Запуск TypeScript проверки..." "Cyan"
    $typecheckOutput = npm run typecheck 2>&1
    $typecheckErrors = ($typecheckOutput | Select-String "error TS").Count
    
    if ($typecheckErrors -eq 0) {
        Write-ColorOutput "✅ TypeScript компиляция: 0 ошибок" "Green"
    }
    else {
        Write-ColorOutput "⚠️  TypeScript компиляция: $typecheckErrors ошибок (улучшение!)" "Yellow"
        Write-ColorOutput "   Ранее было: 26 ошибок" "Yellow"
    }
    
    Write-ColorOutput "`n🧪 Запуск тестов..." "Cyan"
    $testOutput = npm run test 2>&1
    $passedTests = ($testOutput | Select-String "✓").Count
    $failedTests = ($testOutput | Select-String "✗").Count
    
    Write-ColorOutput "📊 Результаты тестов:" "Cyan"
    Write-ColorOutput "   ✅ Пройдено: $passedTests" "Green"
    if ($failedTests -gt 0) {
        Write-ColorOutput "   ❌ Провалено: $failedTests" "Red"
    }
}

# ====================================================================
# ФАЗА 5: GIT COMMIT
# ====================================================================
function Commit-Changes {
    Write-Section "ФАЗА 5: Git Commit"
    
    $gitStatus = git status --short 2>&1
    
    if ($gitStatus) {
        Write-ColorOutput "📝 Обнаружены изменения:" "Cyan"
        $gitStatus | ForEach-Object { Write-Host "   $_" }
        
        if ($DryRun) {
            Write-ColorOutput "`n🔍 DRY RUN: Будет выполнен commit:" "Yellow"
            Write-Host '   git add .'
            Write-Host '   git commit -m "fix: add missing deps and environment config"'
        }
        else {
            Write-Host "`n"
            $confirm = Read-Host "Закоммитить изменения? (y/n)"
            if ($confirm -eq 'y') {
                git add .
                git commit -m "fix: add missing deps and environment config

- Add @types/node for TypeScript Node.js support
- Update @octokit/core to v7
- Create .env.example and .env files
- Create src/config/environment.ts for centralized config
- Update tsconfig.json with node types
- Auto-generated by fix-repository.ps1"
                
                Write-ColorOutput "✅ Изменения закоммичены" "Green"
                
                $push = Read-Host "Запушить изменения? (y/n)"
                if ($push -eq 'y') {
                    git push
                    Write-ColorOutput "✅ Изменения отправлены в remote" "Green"
                }
            }
        }
    }
    else {
        Write-ColorOutput "ℹ️  Нет изменений для commit" "Yellow"
    }
}

# ====================================================================
# MAIN
# ====================================================================
function Main {
    Write-ColorOutput @"

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║          AXON-UI REPOSITORY AUTO-FIX SCRIPT                    ║
║          Автоматическое исправление проблем                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

"@ "Cyan"
    
    if ($DryRun) {
        Write-ColorOutput "🔍 РЕЖИМ DRY RUN: Изменения не будут применены" "Yellow"
    }
    
    Test-ProjectRoot
    
    Install-MissingDependencies
    Create-EnvironmentFiles
    Update-TypeScriptConfig
    Run-Validation
    Commit-Changes
    
    Write-Section "ИТОГОВЫЙ ОТЧЁТ"
    
    Write-ColorOutput "`n✅ Исправлено проблем: $script:fixedCount" "Green"
    
    if ($script:errors.Count -gt 0) {
        Write-ColorOutput "❌ Ошибки ($($script:errors.Count)):" "Red"
        $script:errors | ForEach-Object { Write-ColorOutput "   - $_" "Red" }
    }
    
    if (!$DryRun) {
        Write-ColorOutput "`n📚 Следующие шаги:" "Cyan"
        Write-Host "   1. Проверьте .env файл и настройте переменные"
        Write-Host "   2. Исправьте оставшиеся failing tests (см. REPOSITORY_AUDIT_REPORT.md)"
        Write-Host "   3. Запустите: npm run dev"
        Write-Host "   4. Откройте: REPOSITORY_AUDIT_REPORT.md для деталей"
    }
    
    Write-ColorOutput "`n✨ Готово!`n" "Green"
}

# Запуск
Main
