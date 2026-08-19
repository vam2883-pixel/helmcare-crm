# HELM CARE OS — План миграций Фазы 0 (на утверждение)
_2026-08-19 · Охват: P0.1 Auth · P0.2 RLS · P0.3 Audit Log · P0.4 Модель данных/импорт_

## 1. Порядок применения (важен!)

```
ШАГ 0  Бэкап всех таблиц (scripts/backup.mjs → backups/<дата>/*.json)
ШАГ 1  migration-003-auth-audit.sql        (профили, audit log — аддитивно, ничего не ломает)
ШАГ 2  Включить Email-провайдер в Supabase Auth; завести сотрудников (admin-скрипт)
ШАГ 3  Деплой фронтенда с Supabase Auth (переходный режим: старый вход убран, demo за фиче-флагом)
ШАГ 4  migration-004-statuses-locations.sql (статусы ×3, локации, история размещений)
ШАГ 5  migration-005-wash-transactions.sql  (транзакции, импорт, производные агрегаты)
ШАГ 6  Импорт 13 290 транзакций из Excel → проверка идемпотентности (повторный прогон: inserted=0, skipped=13290)
ШАГ 7  Сидирование locations + machine_location_history из маппинга; статусы из листа
ШАГ 8  migration-006-tasks-finance.sql      (задачи реляционно, счета/поступления, этапы cash-in)
ШАГ 9  Деплой фронтенда, читающего новые статусы (без ложных OFFLINE)
ШАГ 10 БЭКАП ещё раз → migration-007-rls-lockdown.sql (ЗАКРЫТИЕ БАЗЫ)
ШАГ 11 Верификация (см. §4) → ворота приёмки Фазы 0 (см. §5)
```

Каждая миграция — отдельный файл в `supabase/`, применяется целиком в SQL Editor.
Все миграции **аддитивные**: ни одна существующая колонка/таблица не удаляется.
Легаси-поля (`machines.status`, `machines.place`) живут до перевода UI в Фазе 1.

## 2. Матрица RLS (кто что может)

Чтение «👁 все» = любой залогиненный сотрудник. Anon-ключ после 007 не может НИЧЕГО.

| Таблица | Чтение | Запись |
|---|---|---|
| machines, wash_stats, machine_monthly | 👁 все | admin, ops, tech_manager (агрегаты — только через `refresh_wash_aggregates()`) |
| locations, machine_location_history | 👁 все | admin, ops |
| wash_transactions | 👁 все | admin (импорт) |
| import_log | ceo, coo, finance, admin, comm_dir | admin |
| technicians | 👁 все | admin, tech_manager |
| machine_logs | 👁 все | admin, tech_manager, technician |
| campaigns | 👁 все | admin, marketing, comm_dir |
| contractors (DOOH) | 👁 все | admin, dooh_sales, comm_dir |
| franchise_leads | 👁 все | admin, franchise_sales, comm_dir |
| legal_contracts | 👁 все | admin, legal |
| dev_projects | 👁 все | admin, dev |
| clients, notifications | 👁 все | admin, marketing |
| content_items | 👁 все | admin, marketing, ops |
| app_settings (цены, цели, пороги) | 👁 все | admin (изменения аудируются) |
| tasks | 👁 все | создать — любой; менять — исполнитель/автор/руководители; удалять — admin |
| task_comments/attachments/activity | 👁 все | добавить — любой; удалить коммент — автор/admin |
| **invoices, payments** | **только ceo, coo, finance, admin, comm_dir** | finance, admin |
| **audit_log** | **только ceo, admin** | никто (пишет security definer триггер) |
| **profiles** | 👁 все | admin |

Роли (13): ceo, coo, commercial_director, marketing, franchise_sales, dooh_sales,
tech_manager, technician, finance, legal, dev, ops, admin. Хранятся в `profiles.role`,
проверяются функцией `public.user_role()` (security definer, по auth.uid()).

## 3. Ключевые проектные решения (по корректировкам)

**№2 — Три статуса.** `operating_status` (active/storage/relocating/office/retired/unknown) —
жизненный цикл; `tech_status` (online/offline/repair/unknown) — только телеметрия или ручная
отметка, сейчас из листа партнёра, у 28 неразмещённых — `unknown`, НЕ offline;
`sales_activity` — не хранится, вычисляется из транзакций (active: мойка ≤3 дней,
quiet: ≤14, dormant: >14). UI перестаёт красить «offline» по отсутствию продаж.

**№3 — Транзакции.** `wash_transactions` c `doc_number unique` — идемпотентность на уровне БД
(`on conflict do nothing`). Повторная загрузка того же файла даёт 0 вставок. Типы честно
разделены: sale/storage/other; sale дополнительно paid/free/coupon. Агрегаты
(machine_monthly, wash_stats, счётчики в machines) пересобираются функцией
`refresh_wash_aggregates()` — единственный источник правды внизу.

**№4 — История размещений.** `machine_location_history` (machine, location_id, from_date,
to_date null=текущее; уникальный индекс «одно открытое размещение»). Атрибуция моек к
локации — join по дате транзакции. Сидирование: from_date = первая транзакция автомата.

**№5 — Задачи реляционно.** `tasks` + `task_comments` + `task_attachments` + `task_activity`.
OVERDUE вычисляется из deadline+status, не хранится.

**№6/№7 — Деньги.** `invoices` (kind: wash/dooh/franchise; статусы до overdue) + `payments`
(фактические поступления, `received_at`). Cash-in франшизы = сумма payments по лиду.
Этапы signed → deposit_paid → fully_paid добавлены полями лида; KPI ком. директора — от
payments, не от этапов воронки. Дебиторка = счета sent/partially_paid с due_date в прошлом.

**№1 — Audit log в Фазе 0.** Триггеры на machines, franchise_leads, legal_contracts,
contractors, app_settings, profiles, locations, history, tasks, invoices, payments.
Пишется actor (auth.uid + email), old/new jsonb, timestamp. Чтение: ceo/admin.

## 4. Верификация после закрытия (шаг 11)

```bash
# anon без логина — должен получить отказ/пусто:
curl -s "https://<proj>.supabase.co/rest/v1/machines?select=id" -H "apikey: <anon>"        # → []/401
curl -s -X POST ".../rest/v1/machines" -H "apikey: <anon>" -d '{"id":"HACK"}'              # → 401/403
curl -s -X DELETE ".../rest/v1/machines?id=eq.HC-001" -H "apikey: <anon>"                  # → 401/403
# залогиненный franchise_sales: читает машины, НЕ может писать в machines, может в лиды
# залогиненный technician: НЕ видит invoices/payments/audit_log
# повторный импорт того же xlsx: rows_inserted=0, rows_skipped=13290
```

## 5. Ворота приёмки Фазы 0 (корректировка №8)

- [ ] Audit log активен: изменение цены/лида/машины видно в audit_log с автором
- [ ] Идемпотентность импорта проверена двойным прогоном одного файла
- [ ] Маркировка источников работает: у транзакций source='imported', у демо-строк 'demo', бейдж в UI
- [ ] Ни одного ложного OFFLINE: tech_status='unknown' там, где нет данных
- [ ] Процедура бэкапа/отката задокументирована и прогнана (см. §6)
- [ ] Пароли исчезли из бандла; anon-ключ бесправен

## 6. Стратегия отката

**Бэкапы.** `scripts/backup.mjs` (будет создан): выгружает все таблицы в
`backups/<YYYY-MM-DD-HHmm>/<table>.json` через REST (пока open_access — anon-ключом,
после закрытия — под admin-логином). Папка в .gitignore (данные не в git).
Запускается: перед шагом 1, перед шагом 10 и далее перед любой миграцией.
Исходные Excel-файлы сохраняются в Downloads/облаке пользователя — сырьё восстановимо всегда.

**Откат миграций.** У каждого файла — блок `-down` в конце (закомментирован): полный
обратный SQL. Порядок отката — строго обратный порядку применения (007 → 006 → 005 → 004 → 003).

**Откат RLS (экстренный).** SQL Editor в Supabase работает под service_role и не подчиняется
RLS — доступ администратора потерять невозможно. Аварийный возврат open_access — 5 строк
в конце migration-007 (помечен «временно!»).

**Откат фронтенда.** Vercel хранит все деплои: Instant Rollback на предыдущий за один клик.
Переходный период: вход через Supabase Auth, демо-вход доступен только локально через
`VITE_DEMO_AUTH=1` (в прод-сборку не попадает).

**Совместимость.** Если после 007 что-то сломалось в UI — фронтенд откатывается на Vercel,
а базе временно возвращается open_access (5 минут на всё). Данные при этом не теряются ни
в одном сценарии: миграции не удаляют и не перезаписывают существующие строки.

## 7. Изменения фронтенда в Фазе 0 (для полноты картины)

- LoginPage → Supabase Auth (signInWithPassword); демо-подсказки паролей удаляются из прода
- AuthProvider → сессия supabase.auth, роль из profiles
- CrmProvider → загрузка данных после логина; + таблицы locations, history, tasks, invoices, payments
- MachinesSection/Overview → tech_status + sales_activity вместо единого status (без ложных OFFLINE)
- Страница «Импорт» (admin): xlsx → парсинг → батч-вставка wash_transactions → RPC refresh → журнал
- Бейджи источника данных (LIVE/IMPORTED/MANUAL/DEMO) на карточках/таблицах

## 8. Что нужно от бизнеса до шага 2

1. Список сотрудников: имя, email, роль (из 13) — минимум CEO + admin для старта
2. Решение по демо-данным разделов Маркетинг/Юр/Клиенты/Логи: удалить или пометить DEMO
3. (желательно) Доступ к API/экспорту вендинговой платформы — для автоимпорта вместо ручного xlsx
