-- ═══════════════════════════════════════════════════════════════════
-- Миграция 007: ЗАКРЫТИЕ БАЗЫ — ролевые RLS-политики вместо open_access
-- P0.2 · ПРИМЕНЯТЬ ПОСЛЕДНЕЙ, только после того как:
--   1) фронтенд с Supabase Auth задеплоен и проверен
--   2) все сотрудники заведены в auth.users + profiles
--   3) сделан бэкап (scripts/backup.mjs)
-- После применения anon-ключ теряет ВСЕ права: без логина данных нет.
-- ═══════════════════════════════════════════════════════════════════

-- Все проверки прав — через public.has_any_role() / public.is_employee() (из 003):
-- авторитетный источник — user_roles; anon и деактивированные получают false.

do $$
declare t text;
begin
  -- 1. Снять open_access со всех рабочих таблиц
  foreach t in array array[
    'machines','technicians','campaigns','contractors','franchise_leads',
    'legal_contracts','dev_projects','clients','notifications','content_items',
    'wash_stats','machine_logs','app_settings','machine_monthly',
    'locations','machine_location_history','wash_transactions','import_log',
    'tasks','task_comments','task_attachments','task_activity','invoices','payments'
  ] loop
    execute format('drop policy if exists "open_access" on %I', t);
  end loop;

  -- 2. Чтение для всех сотрудников (кроме финансово-чувствительных таблиц)
  foreach t in array array[
    'machines','technicians','campaigns','contractors','franchise_leads',
    'legal_contracts','dev_projects','clients','notifications','content_items',
    'wash_stats','machine_logs','app_settings','machine_monthly',
    'locations','machine_location_history','wash_transactions',
    'tasks','task_comments','task_attachments','task_activity'
  ] loop
    execute format('drop policy if exists r_all on %I', t);
    execute format('create policy r_all on %I for select
                    using (public.is_employee())', t);
  end loop;
end $$;

-- 3. Запись по ролям (insert/update/delete)
-- Матрица: см. docs/HELMCARE_OS_MIGRATION_PLAN_P0.md
create or replace function public.can_write(tbl text) returns boolean
language sql stable security definer set search_path = public as $$
  select case tbl
    when 'machines'                 then public.has_any_role('admin','ops','tech_manager')
    when 'locations'                then public.has_any_role('admin','ops')
    when 'machine_location_history' then public.has_any_role('admin','ops')
    when 'technicians'              then public.has_any_role('admin','tech_manager')
    when 'machine_logs'             then public.has_any_role('admin','tech_manager','technician')
    when 'campaigns'                then public.has_any_role('admin','marketing','commercial_director')
    when 'contractors'              then public.has_any_role('admin','dooh_sales','commercial_director')
    when 'franchise_leads'          then public.has_any_role('admin','franchise_sales','commercial_director')
    when 'legal_contracts'          then public.has_any_role('admin','legal')
    when 'dev_projects'             then public.has_any_role('admin','dev')
    when 'clients'                  then public.has_any_role('admin','marketing')
    when 'notifications'            then public.has_any_role('admin','marketing')
    when 'content_items'            then public.has_any_role('admin','marketing','ops')
    when 'app_settings'             then public.has_any_role('admin')
    when 'wash_transactions'        then public.has_any_role('admin')          -- только импорт
    when 'import_log'               then public.has_any_role('admin')
    when 'machine_monthly'          then false                                    -- только refresh_wash_aggregates()
    when 'wash_stats'               then false
    else false end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'machines','locations','machine_location_history','technicians','machine_logs',
    'campaigns','contractors','franchise_leads','legal_contracts','dev_projects',
    'clients','notifications','content_items','app_settings',
    'wash_transactions','import_log','machine_monthly','wash_stats'
  ] loop
    execute format('drop policy if exists w_role on %I', t);
    execute format('create policy w_role on %I for insert with check (public.can_write(%L))', t, t);
    execute format('drop policy if exists u_role on %I', t);
    execute format('create policy u_role on %I for update using (public.can_write(%L))', t, t);
    execute format('drop policy if exists d_role on %I', t);
    execute format('create policy d_role on %I for delete using (public.can_write(%L))', t, t);
  end loop;
end $$;

-- 4. Финансы: чтение узким кругом, запись finance/admin
do $$
declare t text;
begin
  foreach t in array array['invoices','payments','import_log'] loop
    execute format('drop policy if exists r_fin on %I', t);
    execute format('create policy r_fin on %I for select
      using (public.has_any_role(''ceo'',''coo'',''finance'',''admin'',''commercial_director''))', t);
  end loop;
  foreach t in array array['invoices','payments'] loop
    execute format('drop policy if exists w_fin on %I', t);
    execute format('create policy w_fin on %I for all
      using (public.has_any_role(''finance'',''admin''))
      with check (public.has_any_role(''finance'',''admin''))', t);
  end loop;
end $$;

-- 5. Задачи: создавать может любой сотрудник; менять — исполнитель/автор/админ/руководители
drop policy if exists w_tasks on tasks;
create policy w_tasks on tasks for insert with check (public.is_employee());
drop policy if exists u_tasks on tasks;
create policy u_tasks on tasks for update using (
  auth.uid() in (assignee, creator)
  or public.has_any_role('admin','ceo','coo','commercial_director','tech_manager'));
drop policy if exists d_tasks on tasks;
create policy d_tasks on tasks for delete using (public.has_any_role('admin'));

drop policy if exists w_tc on task_comments;
create policy w_tc on task_comments for insert with check (public.is_employee());
drop policy if exists d_tc on task_comments;
create policy d_tc on task_comments for delete
  using (auth.uid() = author or public.has_any_role('admin'));
drop policy if exists w_ta on task_attachments;
create policy w_ta on task_attachments for insert with check (public.is_employee());
drop policy if exists w_tact on task_activity;
create policy w_tact on task_activity for insert with check (public.is_employee());

notify pgrst, 'reload schema';

-- ═══ ПРОВЕРКА ПОСЛЕ ПРИМЕНЕНИЯ ═════════════════════════════════════
-- curl anon-ключом: select → пусто/401, insert → 401/403 (см. план, раздел «Верификация»)

-- ═══ ЭКСТРЕННЫЙ ОТКАТ (migration-007-down) ═════════════════════════
-- Поправка №8: open_access НЕ является механизмом отката в проде.
-- SQL Editor работает под service_role и НЕ подчиняется RLS — доступ админа не теряется.
-- Порядок при инциденте после 007:
--   1) Откатить фронтенд на предыдущий деплой (Vercel Instant Rollback)
--   2) Диагностировать конкретную политику через SQL Editor
--   3) Точечно поправить ТОЛЬКО затронутую политику (например, вернуть select
--      конкретной таблице: create policy r_all on <t> for select
--      using (public.is_employee());)
--   4) При потере данных — восстановление из backups/<дата>/ (scripts/restore.mjs)
-- Полное открытие open_access допускается только в локальной/тестовой среде.
