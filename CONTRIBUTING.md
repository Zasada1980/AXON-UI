# Руководство по внесению изменений (IKR процесс)

Добро пожаловать! Этот проект развивается по процессу IKR: интеграции ведутся маленькими проверяемыми шагами, приоритет — зелёные гейты и прозрачная документация.

## Основной рабочий процесс

- Мелкие, изолированные PR. Без смешивания фич/рефакторинга/процесса в одном PR.
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
См. также: `src/ui-integration-tz.md` (журнал интеграции) и `docs/IKR_CHECKPOINTS.md` (чекпоинты процесса).