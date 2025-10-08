# AXON-UI (Clean UI)

Минимальный UI‑шаблон без внешних интеграций и журналов. Готов к быстрому запуску и расширению.

## Возможности
- React + Vite
- Tailwind CSS
- Компонентная архитектура (src/components)
- Без внешних секретов и интеграционных тестов

## Быстрый старт
1) Установка зависимостей:
   npm install
2) Запуск dev‑сервера:
   npm run dev
3) Сборка:
   npm run build
4) Просмотр собранной версии:
   npm run preview

## Структура
- src/ — исходники UI (компоненты, стили)
- index.html — входная страница
- vite.config.ts, tsconfig.json — конфигурации сборки/TS
- tailwind.config.js, theme.json — стили, тема

## Примечания
- Все рабочие журналы и отчёты разработок удалены, чтобы держать репозиторий лёгким.
- Для интеграций используйте отдельные адаптеры в src/services и храните секреты вне репозитория.# ✨ Spark UI Template (Clean)

Самодостаточный UI-шаблон на React + Vite для быстрых прототипов. Проект не содержит бэкенда и внешних API-зависимостей: все интеграции эмулируются через локальные моки.

## Что внутри
- React 19 + Vite 6
- Tailwind CSS 4
- Vitest + jsdom + Testing Library (минимальный smoke-тест)
- ESLint v9 (Flat config) — сфокусирован на `src/`
- Mock-адаптер AXON (`src/services/axonAdapter.ts`) без сетевых вызовов

## Быстрый старт
- Установка зависимостей: `npm install`
- Dev-сервер: `npm run dev` (откроется на http://localhost:5173)
- Сборка: `npm run build`
- Превью сборки: `npm run preview`
- Тесты: `npm test`
- Линт: `npm run lint`

## Интеграция с AXON (реальный клиент)
UI использует реальный HTTP‑клиент (без заглушек). Для работы нужен доступный бэкенд AXON. Настройте одно из:
   - VITE_AXON_PROXY_TARGET=http://localhost:8787 — dev‑proxy через Vite (эндпоинт UI: `/api/axon`)
   - или VITE_AXON_BASE_URL=https://axon.example.com — прямой URL без прокси

## Структура
- `src/__tests__/smoke.app.test.tsx` — минимальный smoke-тест UI

## UX-флаг: авто‑выбор фреймворка в ACA

Advanced Cognitive Analysis (ACA) поддерживает UX-флаг автоматического выбора первого доступного фреймворка при создании сессии анализа.

- Где менять: `GlobalProjectSettings` → вкладка Project → секция UX → переключатель “ACA: Auto-pick first framework”.
- Хранение: `useKV` по ключу `project-settings-<projectId>`, поле `ux.acaAutoPickFramework` (boolean).
- Поведение по умолчанию: включено (true). Можно отключить, чтобы требовать явный выбор пользователем.

## Заметки по линту и тестам
- Линт настроен на предупреждения для неиспользуемых переменных, чтобы упростить прототипирование
- Ошибок линта нет (warning’и допустимы на ранних этапах)
- Тесты не обращаются к сети и проходят локально

## Лицензия на шаблон Spark
Файлы и ресурсы Spark Template от GitHub лицензированы по MIT. Copyright © GitHub, Inc.
