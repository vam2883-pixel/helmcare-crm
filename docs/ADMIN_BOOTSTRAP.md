# Первичное назначение администратора (Admin Bootstrap)

Единственный доверенный путь создания ПЕРВОГО администратора — Supabase SQL Editor
(выполняется под service_role, RLS не действует). **Из фронтенда пути самоэскалации нет
и быть не должно**: политики user_roles/profiles разрешают запись только admin, а функция
admin_grant_role() требует уже существующей admin-роли.

## Процедура

1. Создать пользователя: Supabase Dashboard → Authentication → Users → **Add user**
   (email + пароль, поставить Auto Confirm). Профиль появится автоматически
   (триггер on_auth_user_created) с primary_role='ops'.

2. В SQL Editor выполнить (подставить email):

```sql
update profiles set primary_role = 'admin', name = 'Имя Фамилия'
where email = 'admin@example.com';
-- синхронизация сама создаст user_roles ('admin', source='primary')

-- проверка:
select p.email, p.primary_role, ur.role, ur.source
from profiles p join user_roles ur on ur.user_id = p.id
where p.email = 'admin@example.com';
```

3. Дальнейшие назначения ролей выполняет этот администратор из приложения
   (через admin_grant_role / admin_revoke_role) или SQL Editor.

## Правила

- Никогда не выдавать admin через прямые INSERT из приложения в обход admin_grant_role.
- Деактивация сотрудника: `update profiles set active=false where email='...'` —
  мгновенно отключает все права (is_employee/has_any_role/user_role).
- Второго администратора держать как резерв (bus-factor), выдавать той же процедурой.
- Все изменения profiles/user_roles попадают в audit_log автоматически.
