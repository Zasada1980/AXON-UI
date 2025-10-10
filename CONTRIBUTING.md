# Руководство по внесению изменений (IKR процесс)

Добро пожаловать! Этот проект развивается по процессу IKR: интеграции ведутся маленькими проверяемыми шагами, приоритет — зелёные гейты и прозрачная документация.

## 🌳 Стратегия ветвления (ОБНОВЛЕНО 2025-10-10)

### Золотая ветка: `main`
- **Назначение**: Только production-ready код
- **Защита**: ⚠️ **ЗАЩИЩЕНА** - Прямые коммиты запрещены
- **Обновления**: Только через Pull Requests из `develop`
- **Статус**: Всегда готова к deployment в production

### Рабочая ветка: `develop`
- **Назначение**: Интеграционная ветка для всей разработки
- **Защита**: Опционально (рекомендуется: требовать PR reviews)
- **Обновления**: Принимает PRs из feature веток
- **Статус**: Последние интегрированные фичи, pre-release

### Feature ветки
- **Именование**: `feat/<feature-name>` или `fix/<bug-name>`
- **Источник**: Создаются от `develop`
- **Merge**: PR в `develop` (НЕ в `main`)
- **Очистка**: Удаляются после merge

## Основной рабочий процесс

**ВАЖНО**: Вся разработка теперь ведется через `develop` ветку!

```bash
# 1. Переключиться на develop
git checkout develop
git pull origin develop

# 2. Создать feature ветку
git checkout -b feat/my-feature

# 3. Внести изменения и закоммитить
git add .
git commit -m "feat: add my feature"

# 4. Отправить на GitHub
git push origin feat/my-feature

# 5. Создать PR: feat/my-feature → develop
#    (НЕ в main!)
```

### Правила PR
- Мелкие, изолированные PR. Без смешивания фич/рефакторинга/процесса в одном PR.
- **Base branch**: ВСЕГДА `develop` (не `main`)
- Каждому PR — краткое резюме, зачем и как проверить. Используйте шаблон PR.
- Все обращения к LLM/AXON — через адаптеры, UI остаётся «тонким».
- После мержа агент обновляет журналы/индикаторы по IKR.

## Ветвление и коммиты

- Ветви: `<type>/<scope>[-деталь]`.
  - Примеры: `feat/agents-phase2`, `chore/ikr-checkpoint-2-2025-10-08`, `docs/readme-quickstart`.
- Коммиты: Conventional Commits.
  - Примеры: `feat(debate): deep-link readonly mode`, `fix(tests): add MutationObserver polyfill`, `docs(ikr): add checkpoints`.

## Правила для PR

Перед отправкой:
- Обновите или добавьте короткие «How to verify» шаги.
- Убедитесь, что PR не расширяет IKR UI без явного запроса — приоритет процессу/интеграциям.
- Проверьте зелёные гейты локально.

Каденс PR по фазам (политика):
- На одну фазу допускаются два PR:
  1) Промежуточный PR при готовности ≥50% по журналу ТЗ (фиксирует достигнутые результаты и гейты на этот момент).
  2) Завершающий PR при полной готовности фазы (Acceptance из ТЗ выполнены; обновлены журналы/чекпоинты).
- После каждого merge агент обновляет `src/ui-integration-tz.md` и `docs/IKR_CHECKPOINTS.md`.

Шаблон PR находится в `.github/pull_request_template.md` и содержит:
- Summary/Why/Changes
- Quality Gates (Tests/Typecheck/Build)
- How to verify
- Risks/Mitigations
- Post-merge actions (обновить журналы и чекпоинты)

## Качество: гейты

- Typecheck: `npm run typecheck` — без ошибок.
- Build: `npm run build` — сборка проходит; предупреждения допустимы, если оговорены.
- Tests: `npm test` — «зелёные». Добавляйте минимум 1–2 теста на публичное поведение.

## Тесты: стабильность

- jsdom: полифиллы ResizeObserver/MutationObserver подключены в `vitest.setup.ts`.
- Используйте `data-testid` для нестабильных UI-узлов (Radix/shadcn).
- Сетевые вызовы — детерминированные мок-сценарии.

## Безопасность и ключи

- Никогда не коммитьте секреты. Ключи — только через окружение/секреты CI.
- Вызовы AXON — через `src/services/axonAdapter.ts`.

## Локальный старт

- Установка: `npm install`
- Дев-сервер: `npm run dev`
- Типы/сборка/тесты: `npm run typecheck`, `npm run build`, `npm test`

---
См. также: 
- `src/ui-integration-tz.md` (журнал интеграции)
- `docs/IKR_CHECKPOINTS.md` (чекпоинты процесса)
- `.github/BRANCH_PROTECTION.md` (⭐ NEW: Подробные правила защиты веток и workflow)
- `docs/audits/MAIN_BRANCH_AUDIT.md` (⭐ NEW: Полный аудит main ветки)