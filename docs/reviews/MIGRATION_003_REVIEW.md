# РЕВЬЮ: migration-003-auth-audit.sql · Ревизия 3
_Бэкап: backups/2026-08-19-09-46 (824 строки) · НЕ ПРИМЕНЕНА, ждёт одобрения_

## Изменения по замечаниям ревью

1. **profiles.role → profiles.primary_role** (безопасно: таблица ещё не создана). Права из неё НЕ читаются — она только «должность» для UI (дашборд по умолчанию, подпись).
2. **user_roles — авторитетный источник прав.** Все политики (включая будущую 007) используют только `has_any_role()` → user_roles и `is_employee()`. Функция `user_role()` оставлена для UI-отображения с явной пометкой «не для авторизации».
3. **Провенанс ролей**: `user_roles.source` = 'primary' (создана синхронизацией) | 'manual' (выдана админом). Синхронизация трогает ТОЛЬКО 'primary'-строки.
4. **active=false** → `is_employee()`=false, `has_any_role(...)`=false, `user_role()`=null — мгновенно, во всех трёх.
5. **request_id/session_id** — задокументированы как диагностика; в авторизации не участвуют нигде.
6. **Запрет на аудит credentials-таблиц** — зафиксирован в шапке audit_change(); пароли живут в auth.users (управляет Supabase, наш триггер туда не вешается).
7. **Рекурсия невозможна**: на audit_log аудит-триггер не вешается; цепочка profiles→sync→user_roles→audit_log конечна.
8. **Отказ аудита роняет транзакцию**: insert в audit_log не обёрнут в exception-блок (защищён только парсинг заголовков) — критичное изменение без аудита невозможно.

## Полный SQL (ревизия 3)

```sql
-- ═══════════════════════════════════════════════════════════════════
-- Миграция 003: профили (Supabase Auth) + мульти-роли + Audit Log
-- P0.1 + P0.3 · Аддитивная, существующие таблицы не изменяет
-- Ревизия 3 (по ревью):
--   · profiles.primary_role (переименовано из role)
--   · user_roles — ЕДИНСТВЕННЫЙ источник прав (авторитетный)
--   · синхронизация не трогает независимо выданные роли (source='manual')
--   · active=false мгновенно обнуляет все права
--   · request_id/session_id — ТОЛЬКО диагностика, не авторизация
-- ═══════════════════════════════════════════════════════════════════

-- ─── Профили сотрудников ───────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  name         text not null,
  primary_role text not null default 'ops' check (primary_role in
    ('ceo','coo','commercial_director','marketing','franchise_sales','dooh_sales',
     'tech_manager','technician','finance','legal','dev','ops','admin')),
  avatar       text,
  active       boolean not null default true,
  created_at   timestamptz default now()
);
-- primary_role — отображаемая «должность» (дашборд по умолчанию, подпись в UI).
-- ПРАВА из неё НЕ читаются. Права — только из user_roles (см. has_any_role).

-- ─── Роли: авторитетный источник прав ──────────────────────────────
-- source='primary' — строка создана синхронизацией из profiles.primary_role
-- source='manual'  — роль выдана администратором независимо
create table if not exists user_roles (
  user_id    uuid not null references profiles(id) on delete cascade,
  role       text not null check (role in
    ('ceo','coo','commercial_director','marketing','franchise_sales','dooh_sales',
     'tech_manager','technician','finance','legal','dev','ops','admin')),
  source     text not null default 'manual' check (source in ('primary','manual')),
  granted_at timestamptz default now(),
  primary key (user_id, role)
);

-- ─── Синхронизация primary_role → user_roles ───────────────────────
-- Гарантии:
--   1) primary_role всегда представлена в user_roles;
--   2) смена primary_role удаляет ТОЛЬКО авто-строку старой роли (source='primary');
--      роли, выданные вручную (source='manual'), никогда не удаляются синхронизацией;
--   3) если новая primary_role уже выдана вручную — строка остаётся 'manual'
--      (роль останется у пользователя, даже когда primary сменится ещё раз).
create or replace function public.sync_primary_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and old.primary_role is distinct from new.primary_role then
    delete from user_roles
      where user_id = new.id and role = old.primary_role and source = 'primary';
  end if;
  insert into user_roles (user_id, role, source)
  values (new.id, new.primary_role, 'primary')
  on conflict (user_id, role) do nothing;   -- существующая manual-строка не понижается
  return new;
end $$;
drop trigger if exists sync_primary_role on profiles;
create trigger sync_primary_role after insert or update of primary_role on profiles
  for each row execute function public.sync_primary_role();

-- ─── Функции проверки прав (единый интерфейс всех RLS-политик) ─────
-- active=false → сотрудник мгновенно теряет ВСЕ права (обе функции).
create or replace function public.is_employee() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and active) $$;

create or replace function public.has_any_role(variadic roles text[]) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (
     select 1 from user_roles ur
     join profiles p on p.id = ur.user_id
     where ur.user_id = auth.uid() and p.active and ur.role = any(roles)) $$;

-- Отображаемая роль (для UI; НЕ использовать в политиках доступа)
create or replace function public.user_role() returns text
language sql stable security definer set search_path = public as
$$ select primary_role from profiles where id = auth.uid() and active $$;

-- Автосоздание профиля при регистрации (primary_role по умолчанию 'ops')
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Audit Log ─────────────────────────────────────────────────────
-- ВАЖНО (политика применения):
--   · audit_change() копирует ПОЛНУЮ строку в audit_log. ЗАПРЕЩЕНО вешать этот
--     триггер на таблицы с паролями, токенами, секретами и прочими credentials —
--     для таких таблиц (если появятся) нужен отдельный триггер с маскированием.
--   · request_id/session_id — диагностические поля корреляции. Приходят от клиента,
--     могут быть подделаны. НИКОГДА не использовать их в авторизации/безопасности.
--   · Отказ записи аудита РОНЯЕТ исходную транзакцию (исключение не глотается):
--     критичное изменение без аудита невозможно.
--   · Рекурсия исключена: на audit_log аудит-триггер не вешается.
create table if not exists audit_log (
  id          bigint generated by default as identity primary key,
  actor       uuid,
  actor_email text,
  action      text not null,          -- INSERT / UPDATE / DELETE
  table_name  text not null,
  object_id   text,
  old_data    jsonb,
  new_data    jsonb,
  request_id  text,                   -- диагностика (x-request-id), не авторизация
  session_id  text,                   -- диагностика (x-client-session), не авторизация
  at          timestamptz default now()
);
create index if not exists audit_log_table_at on audit_log(table_name, at desc);
create index if not exists audit_log_actor_at on audit_log(actor, at desc);

create or replace function public.audit_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  oid text;
  hdrs jsonb;
begin
  oid := coalesce(
    case when tg_op = 'DELETE' then (to_jsonb(old)->>'id') else (to_jsonb(new)->>'id') end, '');
  -- только парсинг заголовков защищён; сам insert НЕ защищён намеренно (см. политику выше)
  begin
    hdrs := nullif(current_setting('request.headers', true), '')::jsonb;
  exception when others then hdrs := null;
  end;
  insert into audit_log (actor, actor_email, action, table_name, object_id,
                         old_data, new_data, request_id, session_id)
  values (
    auth.uid(),
    coalesce((select email from profiles where id = auth.uid()), 'anon/system'),
    tg_op, tg_table_name, oid,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end,
    hdrs->>'x-request-id',
    hdrs->>'x-client-session'
  );
  return coalesce(new, old);
end $$;

-- Аудит существующих чувствительных таблиц + ролевых таблиц.
-- Ни одна из них не содержит credentials (профили — без паролей, пароли в auth.users,
-- управляется Supabase и НЕ аудируется этим триггером).
do $$
declare t text;
begin
  foreach t in array array['machines','franchise_leads','legal_contracts','contractors',
                           'app_settings','profiles','user_roles']
  loop
    execute format('drop trigger if exists audit_%I on %I', t, t);
    execute format('create trigger audit_%I after insert or update or delete on %I
                    for each row execute function public.audit_change()', t, t);
  end loop;
end $$;

-- ─── RLS новых таблиц ──────────────────────────────────────────────
-- (существующие таблицы не трогаем — их open_access закрывается в 007)
alter table profiles enable row level security;
drop policy if exists profiles_read on profiles;
create policy profiles_read on profiles for select using (public.is_employee());
drop policy if exists profiles_admin_write on profiles;
create policy profiles_admin_write on profiles for all
  using (public.has_any_role('admin')) with check (public.has_any_role('admin'));
-- Тест D: обычный сотрудник НЕ может менять primary_role (нет политики update для не-админа)

alter table user_roles enable row level security;
drop policy if exists user_roles_read on user_roles;
create policy user_roles_read on user_roles for select using (public.is_employee());
drop policy if exists user_roles_admin_write on user_roles;
create policy user_roles_admin_write on user_roles for all
  using (public.has_any_role('admin')) with check (public.has_any_role('admin'));
-- Тест D: самовыдача ролей невозможна — insert/update/delete только admin;
-- синхронизация из primary_role работает через security definer триггер.

alter table audit_log enable row level security;
drop policy if exists audit_read on audit_log;
create policy audit_read on audit_log for select using (public.has_any_role('ceo','admin'));
-- Политик на запись НЕТ: пишет только security definer триггер.
-- actor хранится как uuid без FK на profiles: история аудита переживает удаление пользователя.

notify pgrst, 'reload schema';
```

## SQL отката

```sql
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
do $$ declare t text; begin
  foreach t in array array['machines','franchise_leads','legal_contracts','contractors',
                           'app_settings','profiles','user_roles'] loop
    execute format('drop trigger if exists audit_%I on %I', t, t);
  end loop; end $$;
drop function if exists public.audit_change();
drop table if exists audit_log;
drop function if exists public.has_any_role(variadic text[]);
drop function if exists public.is_employee();
drop function if exists public.user_role();
drop trigger if exists sync_primary_role on profiles;
drop function if exists public.sync_primary_role();
drop table if exists user_roles;
drop table if exists profiles;
notify pgrst, 'reload schema';
```

## Чек-лист тестирования (расширен по ревью)

Базовые:
- [ ] Прод работает без изменений (open_access не тронут): вход, разделы, CRUD лида
- [ ] Повторный прогон миграции — идемпотентен, без ошибок
- [ ] Изменение лида/цены через UI → запись в audit_log (old/new, actor)
- [ ] REST anon: GET /machines работает (80), GET /profiles|audit_log пусто, POST /audit_log → 401/403

**Тест A — мульти-роль (синхронизация не съедает выданное вручную):**
```sql
-- дано: пользователь U, primary_role='commercial_director'
insert into user_roles (user_id, role, source) values ('<U>', 'admin', 'manual');
update profiles set primary_role = 'coo' where id = '<U>';
select role, source from user_roles where user_id = '<U>' order by role;
-- ОЖИДАНИЕ: ('admin','manual') + ('coo','primary'). commercial_director удалена, admin ЦЕЛА.
```

**Тест A2 — ручная роль совпала с primary:**
```sql
-- дано: U2 primary_role='finance'; админ дополнительно выдал finance вручную ранее (source='manual')
update profiles set primary_role = 'legal' where id = '<U2>';
-- ОЖИДАНИЕ: finance остаётся (source='manual'), legal добавлена — независимая выдача пережила смену primary.
```

**Тест B — деактивация:**
```sql
update profiles set active = false where id = '<U>';
-- под сессией U: select public.has_any_role('admin');  → false
--                select public.is_employee();          → false
--                select public.user_role();            → null
-- и любой запрос к защищённым таблицам возвращает пусто/403
```

**Тест C — удаление пользователя:**
```sql
delete from auth.users where id = '<U>';
-- ОЖИДАНИЕ: profiles-строка удалена (cascade), user_roles удалены (cascade),
-- строки audit_log с actor='<U>' СОХРАНИЛИСЬ (actor без FK — история не теряется).
```

**Тест D — самовольная эскалация прав (под сессией обычного сотрудника, не admin):**
```sql
insert into user_roles (user_id, role) values (auth.uid(), 'admin');      -- → 403 (RLS)
update user_roles set role='admin' where user_id = auth.uid();            -- → 403 / 0 строк
update profiles set primary_role='admin' where id = auth.uid();           -- → 403 / 0 строк
-- ОЖИДАНИЕ: все три запрещены; менять роли может только admin.
```

**Тест E — отказ аудита роняет транзакцию:**
```sql
-- временно: alter table audit_log add constraint fail_test check (false) not valid;
-- alter table audit_log validate... (или проще: revoke insert — недоступно для definer)
-- практический вариант: переименовать audit_log → audit_log_x; update franchise_leads ... → ОШИБКА, лид не изменён;
-- вернуть имя таблицы, повторить → успех + запись аудита.
```
