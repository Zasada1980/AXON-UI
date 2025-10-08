## 2025-10-08 — IKR Phase 1: Backend-only wiring for ACA/MTE

- AdvancedCognitiveAnalysis and MicroTaskExecutor refactored to call AXON via `axon.analyze` (static adapter import). UI remains thin; all heavy logic server-side per ТЗ.
- Added minimal tests:
  - `aca.mte.axon.integration.test.tsx` — verifies MTE posts to `/v1/chat/completions` through adapter. ACA start-analysis UI test is marked skipped due to flakiness in tab/list rendering; logic covered indirectly and will be unskipped later.
- Gates:
  - Tests: PASS (11 passed, 1 skipped)
  - Typecheck: PASS
  - Build: PASS (CSS optimizer warnings non-blocking)
- Notes:
  - Introduced `safeParseJSON` helpers in ACA/MTE to handle plain-text responses from AXON.
  - Kept `useKV` project scoping; no changes to keys besides existing prefixes.
  - Next: unskip ACA UI test once Radix Tabs interaction is stabilized in tests and/or add data-testid hooks.

## 2025-10-08 — Тесты стабилизированы (ACA UI unskip)

- В `AdvancedCognitiveAnalysis` добавлены data-testid для вкладок, карточек сессий и кнопок запуска.
- Тест `ACA starts analysis...` переписан на userEvent, создаёт сессию в builder (framework подставляется автоматически) и запускает анализ — без взаимодействия с Radix Select.
- MTE тест переведён на userEvent, предупреждения act снижены.
- Итог гейтов:
  - Tests: PASS (12/12)
  - Typecheck: PASS
  - Build: PASS

# ТЗ: Пошаговая интеграция модулей в AXON-UI

Документ описывает фазовый план интеграции файлов проекта (модулей) в UI, требования к качеству, критерии приемки, тестирование и риски. Ориентирован на стек: React 19 + Vite 6, Tailwind 4, Vitest 3, ESLint 9, реальный клиент AXON через `/v1/chat/completions` и `/health`.

## Цели
- Интегрировать ключевые модули поэтапно, сохраняя работоспособность UI на каждом шаге.
- Гарантировать «зелёный» CI (typecheck, build, unit tests) на каждом PR.
- Единый тип для `window.spark` (см. `src/types/spark.d.ts`) и единый real-only клиент AXON (см. `src/lib/axonClient.ts`, `src/services/axonAdapter.ts`, `src/types/axon.ts`).

## Контрольные артефакты
- Жизненно важные файлы:
  - Точки входа: `src/App.tsx`, `src/main.tsx`
  - Ошибки/границы: `src/ErrorFallback.tsx`
  - Клиент AXON: `src/lib/axonClient.ts`, `src/services/axonAdapter.ts`, `src/types/axon.ts`
  - Глобальные типы: `src/types/spark.d.ts`
  - Компоненты: `src/components/**`
  - Тесты: `src/__tests__/**`
  - Конфиги: `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `tailwind.config.js`

## Карта модулей → файлы → назначение
- Аналитика/ИКР: `KiplingQuestionnaire.tsx`, `IntelligenceGathering.tsx`, `AdvancedCognitiveAnalysis.tsx`, `MicroTaskExecutor.tsx`, `IKRDirective` страницы/вью (если есть: `src/pages/IKRDirectivePage.tsx`)
- Агенты/чат: `AIOrchestrator.tsx`, `AgentMemoryManager.tsx`, `DebateLogManager.tsx`
- Диагностика/автовосстановление: `SystemDiagnostics` (внутри может быть несколько файлов), `ErrorMonitoring.tsx`, `AutoRecovery.tsx`, `AutoBackupSystem.tsx`, `CheckpointSystem.tsx`
- Проектные панели/отчёты: `ProjectDashboard.tsx`, `ProjectRequirementsTracker.tsx`, `ProjectWorkStatusReport.tsx`, `MasterReportJournal.tsx`, `SystemCompletionReport.tsx`, `UIEvolutionAudit.tsx`
- Утилиты/UI: `FileUploadManager.tsx`, `AdvancedSearchFilter.tsx`, `NotificationSystem.tsx`, `NavigationMenu.tsx`, `NavigationGuide.tsx`, `GlobalProjectSettings.tsx`
- Безопасность/доступ: `AuthenticationSystem.tsx`, `SecureAPIKeyManager.tsx`
- Интеграции: `ExternalAPIIntegrator.tsx`, `CrossModuleIntegrator.tsx`
- E2E/интеграционные тесты: `E2ETestingSystem.tsx`

## Фазы интеграции (пошагово)

### Фаза 0. Базовая инфраструктура (ГОТОВО)
- Цель: Проверка окружения, прокси и health.
- Действия:
  - Убедиться, что `VITE_AXON_BASE_URL` или `VITE_AXON_PROXY_TARGET` корректны.
  - Проверить `axonAdapter.health()` отображением статуса в шапке/статус-виджете (минимальный виджет).
- Файлы: `src/services/axonAdapter.ts`, `src/lib/axonClient.ts`, `src/App.tsx` (или header-компонент).
- Тесты: unit тест на health (mock fetch), smoke UI тест.
- Acceptance: Health отображается, при недоступности — деградация без крэша.

Выполнено:
- В шапке приложения отображается состояние AXON (health через `axonAdapter.health()`).
- Добавлен unit-тест для health-виджета и smoke UI тесты.
- Настроен стабильный vitest setup (моки KV для `useKV`).

### Фаза 1. ИКР и аналитика (В РАБОТЕ)
- Цель: Сделать доступным маршрут IKR и базовые аналитические компоненты.
- Действия:
  - Подключить страницу/вью IKR (если нет — добавить), навигацию.
  - Интегрировать: `KiplingQuestionnaire`, `IntelligenceGathering`, `AdvancedCognitiveAnalysis`, `MicroTaskExecutor`.
  - Все обращения к LLM через `window.spark` (типизировать `Spark`).
- Файлы: `src/pages/IKRDirectivePage.tsx` (если есть), `src/App.tsx`, компоненты выше.
- Тесты: контрактный тест IKR (уже есть для `/v1/chat/completions`), snapshot на страницу IKR.
- Acceptance: форма IKR рендерится, отправка промпта уходит в AXON (или мок), нет ошибок TS.

Сделано на текущий момент:
- Маршрут IKR подключён; страница `IKRDirectivePage` вызывает `axon.analyze` через адаптер.
- Добавлены тесты: контракт на IKR, рендер IKR страницы, навигация до IKR.
- Унифицирован импорт `axonAdapter` (статический) для исключения смешанных импортов.

Дальше по фазе 1:
- Интегрировать и связать `KiplingQuestionnaire`, `IntelligenceGathering`, `AdvancedCognitiveAnalysis`, `MicroTaskExecutor` в пользовательский сценарий.
- Привести `useKV` ключи к неймингу с префиксом `projectId` для всех внутренних состояний IKR.
- Добавить по одному простому unit-тесту на каждую форму/вкладку I/K/R (моки LLM через `window.spark`).

### Фаза 2. Агенты и дебаты
- Цель: Добавить `AIOrchestrator`, `AgentMemoryManager`, `DebateLogManager`.
- Действия:
  - Встроить вкладки/секцию на главной панели или отдельные маршруты.
  - Storage через `useKV` из `@github/spark/hooks` согласовать по ключам (projectId scope).
- Файлы: соответствующие компоненты, возможно обновление `NavigationMenu.tsx`.
- Тесты: unit на сохранение/восстановление состояния (mock useKV), базовый UI smoke.
- Acceptance: агенты запускаются, логи дебатов видны, нет зависаний UI.

### Фаза 3. Диагностика/восстановление
- Цель: Отображать состояние системы и позволять ручные/авто действия.
- Действия:
  - Интегрировать `SystemDiagnostics`, `ErrorMonitoring`, `AutoRecovery`, `AutoBackupSystem`, `CheckpointSystem`.
- Файлы: компоненты диагностики, `ErrorFallback.tsx`
- Тесты: unit на отрисовку метрик, имитация ошибок (boundary), возврат в рабочее состояние.
- Acceptance: виджеты здоровья/ошибок доступны, fallback работает корректно.

### Фаза 4. Проектные панели и отчёты
- Цель: Дать пользователю управлять требованиями, статусом работ и отчётами.
- Действия:
  - Интегрировать `ProjectDashboard`, `ProjectRequirementsTracker`, `ProjectWorkStatusReport`, `MasterReportJournal`, `SystemCompletionReport`, `UIEvolutionAudit`.
- Файлы: перечисленные компоненты; обновление роутов/навигации.
- Тесты: unit на базовую отрисовку, функции генерации отчётов с LLM (моки).
- Acceptance: страницы доступны, основные сценарии (создание/просмотр) работают.

### Фаза 5. Утилиты
- Цель: Завершить полезные сервисы UI.
- Действия:
  - `FileUploadManager`, `AdvancedSearchFilter`, `NotificationSystem`, `NavigationGuide`, `GlobalProjectSettings`.
- Тесты: unit на фильтрацию/уведомления.
- Acceptance: загрузка файлов и поиск работают, уведомления корректны.

### Фаза 6. Безопасность/доступ
- Цель: Управление ключами/аутентификацией.
- Действия:
  - Интегрировать `AuthenticationSystem`, `SecureAPIKeyManager`.
  - Хранить секреты вне репо; валидировать ввод и доступ.
- Acceptance: ключи не попадают в сборку, UI корректно валидирует наличие ключей.

### Фаза 7. Интеграции/склейка
- Цель: Согласовать кросс-модульные связи и внешний API.
- Действия:
  - `ExternalAPIIntegrator`, `CrossModuleIntegrator` — изолировать интеграции и провода данных.
- Acceptance: интеграции не ломают доменные модули; таймауты/повторы предусмотрены.

### Фаза 8. Тестирование и CI-гейты
- Цель: Стандартизировать проверки на PR.
- Действия:
  - Unit tests: happy path + негативные кейсы по каждому новому модулю.
  - Контрактные тесты: уже есть для IKR/AXON; расширить по мере добавления.
  - E2E (минимально): smoke-скрипт через `E2ETestingSystem` (при необходимости — Playwright отдельно).
  - CI: `npm ci` (при валидном lock), `tsc --noEmit` (через build), `vite build`, `vitest run`.
- Acceptance: все гейты зелёные; покрытие — базовое (договоримся: ≥10–20% вначале, растёт).

### Фаза 9. Документация и флаги
- Цель: Обновить доки и добавить feature flags, если требуется поэтапный rollout.
- Действия:
  - Доки в `src/` и README (минимальные quick start/инструкции).
  - Флаги в `GlobalProjectSettings` или через env.
- Acceptance: новые участники могут локально поднять проект и пройти сценарий IKR.

## Общие требования к коду
- Единые типы для `window.spark` (см. `src/types/spark.d.ts`).
- Запрещено копировать секреты/API ключи в репозиторий.
- Все новые публичные функции — с минимальными тестами.
- Линт/типизация без ошибок; предупреждения — допустимы только оговорённо.

## Критерии приемки на фазу
- Typecheck: PASS
- Build: PASS
- Tests: PASS (новые тесты покрывают базовые сценарии)
- UI smoke: основная страница и новый маршрут открываются без ошибок.

## Риски и откаты
- Разрастание чанков (Vite предупреждения) — разбивать по роутам/динамические импорты.
- Внешние API нестабильны — ретраи/таймауты, graceful-degradation.
- Конфликты типов — использовать общие `.d.ts` и общие адаптеры.
- Откат: фичи за флагом; быстрый revert PR.

## Оценка и порядок работ
- Фаза 0–1: 1–2 дня (IKR + health + базовая навигация).
- Фаза 2–4: 3–5 дней (агенты, диагностика, проектные панели).
- Фаза 5–7: 2–4 дня (утилиты, интеграции, безопасность).
- Фаза 8–9: 1–2 дня (тесты, CI, доки, флаги).

## Чек-листы мини-задач (для PR)
- Обновлён маршрут/навигация.
- Компонент подключён, состояние сохранено в `useKV` с префиксом по `projectId`.
- Вызовы LLM через `spark: Spark`.
- При обращении к AXON — только через `axonAdapter`.
- Тесты добавлены и проходят.
- Нет дублирующих declare global/типов.

---
Примечания:
- Если в процессе всплывают дополнительные зависимости — генерировать lock через `npm install` и коммитить только `package-lock.json` вместе с изменениями.
- Контрактные тесты, затрагивающие API, писать так, чтобы они были детерминированны (моки fetch), а «живые» проверки оставлять опциональными/за флагом.

---
Журнал прогресса

- 2025-10-08:
  - Ветка PR #8 доведена до зелёного и смержена (tests/typecheck/build — PASS).
  - Создана рабочая ветка `feat/ikr-phase1` для выполнения Фазы 1 (IKR).
  - Валидация Фазы 0: выполнено (health виджет на базе `axonAdapter.health()`, unit/smoke тесты).
  - Старт Фазы 1: IKR-страница вызывает `axon.analyze` через адаптер, добавлены контрактный и рендер-тесты.
  - Двигаемся дальше по интеграции IKR-компонентов и покрытию тестами.
  - IKR: статический импорт `axon` применён в `IKRDirectivePage` для стабильной сборки.
  - IKR: ключи `useKV` унифицированы и имеют префикс по `projectId` (например, `ikr-analyses-${projectId}`, `current-ikr-${projectId}`).
  - IKR: добавлен unit-тест создания анализа `ikr.create-analysis.test.tsx` (открытие диалога, ввод Title/Description, сохранение, проверка отображения обзора и карточек I/K/R). Исправлена неоднозначность выборки кнопки через scoping внутри диалога.
  - Локальная проверка: Tests PASS (7/7), Typecheck PASS, Lint — без ошибок (только предупреждения), Build PASS.
  - Контекст PR #18: ветка `feat/ikr-phase1` обновлена (push выполнен). Готово к рассмотрению и слиянию: гейты (tests/typecheck/build) — PASS.
  - Конфликты PR #18: разрешены (src/App.tsx, src/pages/IKRDirectivePage.tsx, vitest.setup.ts). Повторная проверка: Tests PASS, Lint — WARN only, Build PASS.
  - IKR: в `IKRDirectivePage` встроены связанные модули — `IntelligenceGathering`, `KiplingQuestionnaire`, `AdvancedCognitiveAnalysis`, `MicroTaskExecutor` (projectId-скоуп, коллбеки без побочных эффектов).
  - Добавлены минимальные smoke-тесты для IKR tools: `src/__tests__/ikr.tools.smoke.test.tsx` (рендер на EN/RU). Локально: Tests PASS (9/9), Build PASS.
  - Добавлен presence-тест для IKR-инструментов после создания анализа: `src/__tests__/ikr.tools.presence.test.tsx` (проверка заголовков Intelligence Gathering / Kipling Questionnaire / Micro-Task Executor / Advanced Cognitive Analysis). Локально: Tests PASS (10/10), Build PASS.
