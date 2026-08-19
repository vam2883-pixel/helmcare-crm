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

-- ─── Явная операция выдачи роли администратором ────────────────────
-- Если выдаваемая роль совпадает с текущей primary — строка КОНВЕРТИРУЕТСЯ
-- в manual (независимая выдача переживёт последующую смену primary_role).
create or replace function public.admin_grant_role(target uuid, r text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_any_role('admin') then
    raise exception 'only admin can grant roles';
  end if;
  insert into user_roles (user_id, role, source) values (target, r, 'manual')
  on conflict (user_id, role) do update set source = 'manual';
end $$;

-- Отзыв роли: manual-строка удаляется; если роль является текущей primary —
-- строка не удаляется, а понижается обратно до source='primary'.
create or replace function public.admin_revoke_role(target uuid, r text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_any_role('admin') then
    raise exception 'only admin can revoke roles';
  end if;
  if exists (select 1 from profiles where id = target and primary_role = r) then
    update user_roles set source = 'primary' where user_id = target and role = r;
  else
    delete from user_roles where user_id = target and role = r;
  end if;
end $$;

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

-- ─── Минимизация прав на функции (по ревью, пункт 3) ───────────────
-- Триггерные и служебные функции недоступны для прямого вызова кем-либо:
revoke execute on function public.sync_primary_role() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.audit_change() from public, anon, authenticated;
-- Функции проверки прав нужны политикам RLS (выполняются под ролью запроса):
revoke execute on function public.is_employee() from public;
revoke execute on function public.has_any_role(variadic text[]) from public;
revoke execute on function public.user_role() from public;
grant execute on function public.is_employee() to authenticated, anon;
grant execute on function public.has_any_role(variadic text[]) to authenticated, anon;
grant execute on function public.user_role() to authenticated, anon;
-- Админ-операции: вызывать может любой залогиненный, внутри — проверка admin:
revoke execute on function public.admin_grant_role(uuid, text) from public, anon;
revoke execute on function public.admin_revoke_role(uuid, text) from public, anon;
grant execute on function public.admin_grant_role(uuid, text) to authenticated;
grant execute on function public.admin_revoke_role(uuid, text) to authenticated;

notify pgrst, 'reload schema';
