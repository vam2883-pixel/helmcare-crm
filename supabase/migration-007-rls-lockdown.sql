-- ═══════════════════════════════════════════════════════════════════
-- Миграция 007: ЗАКРЫТИЕ БАЗЫ — ролевые RLS-политики вместо open_access
-- P0.2 · ПРИМЕНЯТЬ ПОСЛЕДНЕЙ, только после того как:
--   1) фронтенд с Supabase Auth задеплоен и проверен
--   2) все сотрудники заведены в auth.users + profiles
--   3) сделан бэкап (scripts/backup.mjs)
-- После применения anon-ключ теряет ВСЕ права: без логина данных нет.
-- ═══════════════════════════════════════════════════════════════════

-- Хелперы читаемости
-- (public.user_role() создан в 003; null для anon → все проверки падают в false)

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
                    using (public.user_role() is not null)', t);
  end loop;
end $$;

-- 3. Запись по ролям (insert/update/delete)
-- Матрица: см. docs/HELMCARE_OS_MIGRATION_PLAN_P0.md
create or replace function public.can_write(tbl text) returns boolean
language sql stable security definer set search_path = public as $$
  select case tbl
    when 'machines'                 then public.user_role() in ('admin','ops','tech_manager')
    when 'locations'                then public.user_role() in ('admin','ops')
    when 'machine_location_history' then public.user_role() in ('admin','ops')
    when 'technicians'              then public.user_role() in ('admin','tech_manager')
    when 'machine_logs'             then public.user_role() in ('admin','tech_manager','technician')
    when 'campaigns'                then public.user_role() in ('admin','marketing','commercial_director')
    when 'contractors'              then public.user_role() in ('admin','dooh_sales','commercial_director')
    when 'franchise_leads'          then public.user_role() in ('admin','franchise_sales','commercial_director')
    when 'legal_contracts'          then public.user_role() in ('admin','legal')
    when 'dev_projects'             then public.user_role() in ('admin','dev')
    when 'clients'                  then public.user_role() in ('admin','marketing')
    when 'notifications'            then public.user_role() in ('admin','marketing')
    when 'content_items'            then public.user_role() in ('admin','marketing','ops')
    when 'app_settings'             then public.user_role() in ('admin')
    when 'wash_transactions'        then public.user_role() in ('admin')          -- только импорт
    when 'import_log'               then public.user_role() in ('admin')
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
      using (public.user_role() in (''ceo'',''coo'',''finance'',''admin'',''commercial_director''))', t);
  end loop;
  foreach t in array array['invoices','payments'] loop
    execute format('drop policy if exists w_fin on %I', t);
    execute format('create policy w_fin on %I for all
      using (public.user_role() in (''finance'',''admin''))
      with check (public.user_role() in (''finance'',''admin''))', t);
  end loop;
end $$;

-- 5. Задачи: создавать может любой сотрудник; менять — исполнитель/автор/админ/руководители
drop policy if exists w_tasks on tasks;
create policy w_tasks on tasks for insert with check (public.user_role() is not null);
drop policy if exists u_tasks on tasks;
create policy u_tasks on tasks for update using (
  auth.uid() in (assignee, creator)
  or public.user_role() in ('admin','ceo','coo','commercial_director','tech_manager'));
drop policy if exists d_tasks on tasks;
create policy d_tasks on tasks for delete using (public.user_role() = 'admin');

drop policy if exists w_tc on task_comments;
create policy w_tc on task_comments for insert with check (public.user_role() is not null);
drop policy if exists d_tc on task_comments;
create policy d_tc on task_comments for delete
  using (auth.uid() = author or public.user_role() = 'admin');
drop policy if exists w_ta on task_attachments;
create policy w_ta on task_attachments for insert with check (public.user_role() is not null);
drop policy if exists w_tact on task_activity;
create policy w_tact on task_activity for insert with check (public.user_role() is not null);

notify pgrst, 'reload schema';

-- ═══ ПРОВЕРКА ПОСЛЕ ПРИМЕНЕНИЯ ═════════════════════════════════════
-- curl anon-ключом: select → пусто/401, insert → 401/403 (см. план, раздел «Верификация»)

-- ═══ ЭКСТРЕННЫЙ ОТКАТ (migration-007-down) ═════════════════════════
-- SQL Editor работает под service_role и НЕ подчиняется RLS — доступ не потеряется.
-- Вернуть открытый режим (временно!):
-- do $$ declare t text; begin
--   foreach t in array array['machines', ... /* список из шага 1 */] loop
--     execute format('create policy "open_access" on %I for all using (true) with check (true)', t);
--   end loop; end $$;
