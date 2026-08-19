#!/usr/bin/env node
// Бэкап всех таблиц Supabase в backups/<timestamp>/<table>.json
// Запуск: node scripts/backup.mjs
// До закрытия RLS работает с anon-ключом; после — задать SUPABASE_KEY (ключ залогиненного admin).

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.SUPABASE_URL ?? "https://smhbpqnumyeilrjpmlru.supabase.co";
const KEY  = process.env.SUPABASE_KEY ?? "sb_publishable_Z8uwbZMgT551IyevirwJyg_sig5-yr8";

const TABLES = [
  "machines","technicians","campaigns","contractors","franchise_leads",
  "legal_contracts","dev_projects","clients","notifications","content_items",
  "wash_stats","machine_logs","app_settings","machine_monthly",
  // появляются после миграций 003–006 (отсутствие таблицы — не ошибка):
  "profiles","user_roles","audit_log","locations","machine_location_history",
  "wash_transactions","import_log","tasks","task_comments","task_attachments",
  "task_activity","invoices","payments",
];

const PAGE = 1000;
const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "backups", stamp);
mkdirSync(root, { recursive: true });

let total = 0, failed = [];
for (const t of TABLES) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    let res = await fetch(`${BASE}/rest/v1/${t}?select=*&order=id`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + PAGE - 1}` },
    });
    if (res.status === 400) // нет колонки id (например, app_settings с PK key)
      res = await fetch(`${BASE}/rest/v1/${t}?select=*`, {
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + PAGE - 1}` },
      });
    if (!res.ok) { failed.push(`${t} (${res.status})`); break; }
    const chunk = await res.json();
    rows.push(...chunk);
    if (chunk.length < PAGE) {
      writeFileSync(join(root, `${t}.json`), JSON.stringify(rows, null, 1));
      console.log(`${t}: ${rows.length} строк`);
      total += rows.length;
      break;
    }
  }
}
console.log(`\nБэкап: ${root}\nВсего строк: ${total}` +
  (failed.length ? `\nНедоступны (ещё не созданы?): ${failed.join(", ")}` : ""));
