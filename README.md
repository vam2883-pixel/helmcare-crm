# Helm Care CRM

Собственная CRM и управленческий дашборд Helm Care: автоматы-мойки, маркетинг, реклама на автоматах, продажа франшизы, юридический отдел, разработка.

## Стек

- **Frontend:** React 18 + Vite, recharts, lucide-react
- **База данных:** Supabase (PostgreSQL) — таблицы: machines, technicians, campaigns, contractors, franchise_leads, legal_contracts, dev_projects, clients, notifications, content_items, wash_stats, machine_logs, app_settings
- **Деплой:** Vercel (автодеплой из main)

## Запуск локально

```bash
npm install
npm run dev
```

→ открыть http://localhost:5173

## Настройка базы данных (один раз)

1. Открыть [Supabase Dashboard](https://supabase.com/dashboard) → проект → **SQL Editor**
2. **New query** → вставить содержимое `supabase/schema.sql` → **Run**
3. Скрипт создаёт все таблицы, включает RLS и заливает стартовые данные. Повторный запуск пересоздаёт всё заново.

Подключение (URL + publishable key) прописано в `src/lib/supabase.js`.

## Как это работает

- `src/lib/CrmProvider.jsx` — при старте загружает все таблицы из Supabase и подменяет fallback-данные (`src/data/fallback.js`) реальными. Если база недоступна — приложение работает на встроенных данных.
- CRUD-операции (`dbInsert` / `dbUpdate` / `dbRemove`) пишут в Supabase: добавление/удаление/релокация автоматов, кампании, контракторы, перемещение лидов по воронке, контент.
- Демо-авторизация (роли CEO / ком.директор / финансист / РОП / франчайзи / техник) пока локальная — переезд на Supabase Auth в плане.

## Демо-аккаунты

| Email | Пароль | Роль |
|---|---|---|
| ceo@co.ru | ceo123 | CEO — всё |
| director@co.ru | dir123 | Ком. директор |
| finance@co.ru | fin123 | Финансист |
| rop@co.ru | rop123 | РОП |
| franchise@co.ru | fr123 | Франчайзи |
| tech@co.ru | tech123 | Технический |
