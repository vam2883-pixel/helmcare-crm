// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase.js";
import { hydrate } from "../data/fallback.js";
import { C } from "./theme.js";

// ─── Маппинг: колонки БД (snake_case) ↔ поля приложения ──────────────────────
const fromDb = {
  machines:        r => ({ ...r, mapsUrl: r.maps_url }),
  campaigns:       r => ({ ...r, start: r.start_date, end: r.end_date }),
  contractors:     r => ({ ...r, payForm: r.pay_form, dueDate: r.due_date, start: r.start_date, end: r.end_date }),
  franchise_leads: r => ({ ...r }),
  legal_contracts: r => ({ ...r }),
  dev_projects:    r => ({ ...r, tasks: Array.isArray(r.tasks) ? r.tasks : [] }),
  clients:         r => ({ ...r }),
  notifications:   r => ({ ...r }),
  content_items:   r => ({ ...r, assigned: Array.isArray(r.assigned) ? r.assigned : [] }),
  technicians:     r => ({ ...r }),
  machine_logs:    r => ({ ...r }),
  wash_stats:      r => ({ d: r.d, w: r.w, r: r.r }),
};

const toDb = {
  machines: p => {
    const { mapsUrl, created_at, ...rest } = p;
    return { ...rest, ...(mapsUrl !== undefined ? { maps_url: mapsUrl } : {}) };
  },
  campaigns: p => {
    const { start, end, created_at, ...rest } = p;
    return { ...rest, ...(start !== undefined ? { start_date: start } : {}), ...(end !== undefined ? { end_date: end } : {}) };
  },
  contractors: p => {
    const { payForm, dueDate, start, end, created_at, ...rest } = p;
    return {
      ...rest,
      ...(payForm !== undefined ? { pay_form: payForm } : {}),
      ...(dueDate !== undefined ? { due_date: dueDate } : {}),
      ...(start !== undefined ? { start_date: start } : {}),
      ...(end !== undefined ? { end_date: end } : {}),
    };
  },
};
const mapToDb = (table, p) => (toDb[table] ? toDb[table](p) : (({ created_at, ...rest }) => rest)(p));
const mapFromDb = (table, r) => (fromDb[table] ? fromDb[table](r) : r);

const TABLES = {
  machines:        { key: "machines",      order: "id" },
  technicians:     { key: "technicians",   order: "id" },
  campaigns:       { key: "campaigns",     order: "id" },
  contractors:     { key: "contractors",   order: "id" },
  franchise_leads: { key: "frLeads",       order: "id" },
  legal_contracts: { key: "legal",         order: "id" },
  dev_projects:    { key: "devProjects",   order: "id" },
  clients:         { key: "clients",       order: "id" },
  notifications:   { key: "notifications", order: "id" },
  content_items:   { key: "content",       order: "id" },
  machine_logs:    { key: "logs",          order: "id" },
  wash_stats:      { key: "washTrend",     order: "id" },
};

const CrmCtx = createContext(null);
export const useCrm = () => useContext(CrmCtx);

export function CrmProvider({ children }) {
  const [status, setStatus] = useState("loading"); // loading | live | offline
  const [, setVersion] = useState(0);
  const dataRef = useRef({});

  const loadAll = useCallback(async () => {
    const names = Object.keys(TABLES);
    const results = await Promise.all(
      names.map(t => supabase.from(t).select("*").order(TABLES[t].order, { ascending: true }))
    );
    const failed = results.filter(r => r.error);
    if (failed.length === names.length) throw new Error(failed[0].error.message);

    const data = {};
    names.forEach((t, i) => {
      if (!results[i].error) data[TABLES[t].key] = (results[i].data || []).map(r => mapFromDb(t, r));
    });
    const settings = await supabase.from("app_settings").select("*");
    if (!settings.error) {
      const pricing = (settings.data || []).find(s => s.key === "pricing");
      if (pricing) data.pricing = pricing.value;
    }
    dataRef.current = data;
    hydrate(data);
  }, []);

  useEffect(() => {
    loadAll()
      .then(() => setStatus("live"))
      .catch(e => { console.warn("Supabase недоступен, работаем на локальных данных:", e.message); setStatus("offline"); });
  }, [loadAll]);

  const refresh = useCallback(async (table) => {
    const { data, error } = await supabase.from(table).select("*").order(TABLES[table].order, { ascending: true });
    if (!error) {
      dataRef.current[TABLES[table].key] = (data || []).map(r => mapFromDb(table, r));
      hydrate(dataRef.current);
      setVersion(v => v + 1);
    }
  }, []);

  // CRUD: пишет в Supabase и возвращает сохранённую строку (в формате приложения).
  // При недоступности БД возвращает null — UI продолжает работать на локальном state.
  const dbInsert = useCallback(async (table, row) => {
    const { data, error } = await supabase.from(table).insert(mapToDb(table, row)).select().single();
    if (error) { console.warn(`insert ${table}:`, error.message); return null; }
    await refresh(table);
    return mapFromDb(table, data);
  }, [refresh]);

  const dbUpdate = useCallback(async (table, id, patch) => {
    const { data, error } = await supabase.from(table).update(mapToDb(table, patch)).eq("id", id).select().single();
    if (error) { console.warn(`update ${table}:`, error.message); return null; }
    await refresh(table);
    return mapFromDb(table, data);
  }, [refresh]);

  const dbRemove = useCallback(async (table, id) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { console.warn(`delete ${table}:`, error.message); return false; }
    await refresh(table);
    return true;
  }, [refresh]);

  if (status === "loading") {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: C.bg }}>
        <div style={{ width: 34, height: 34, border: `3px solid ${C.border}`, borderTopColor: C.cyan, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
        <div style={{ color: C.muted, fontSize: 13, fontFamily: "sans-serif" }}>Загрузка данных...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <CrmCtx.Provider value={{ live: status === "live", dbInsert, dbUpdate, dbRemove, refresh }}>
      {children}
    </CrmCtx.Provider>
  );
}
