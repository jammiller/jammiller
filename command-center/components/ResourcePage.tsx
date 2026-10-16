"use client";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Row = Record<string, unknown> & { id: string };

export type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "email" | "datetime-local" | "select" | "textarea" | "boolean";
  options?: readonly string[];
  required?: boolean;
  readOnly?: boolean;
  step?: string;
  format?: (v: unknown) => string;
};

type Props = {
  title: string;
  table: string;
  fields: Field[];
  orderBy?: string;
};

const input =
  "w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none";

export default function ResourcePage({ title, table, fields, orderBy = "created_at" }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data, error } = await getSupabase()
        .from(table).select("*").order(orderBy, { ascending: false });
      if (error) setError(error.message);
      else setRows((data as Row[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setLoading(false);
  }, [table, orderBy]);

  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: Record<string, string | number | boolean> = {};
    for (const f of fields) {
      if (f.readOnly) continue;
      const v = form[f.key];
      if (f.type === "boolean") {
        payload[f.key] = v === "true";
      } else if (v !== undefined && v !== "") {
        payload[f.key] = f.type === "number" ? Number(v) : v;
      }
    }
    try {
      const { error } = await getSupabase().from(table).insert(payload);
      if (error) return setError(error.message);
    } catch (err) {
      return setError(err instanceof Error ? err.message : String(err));
    }
    setForm({});
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this record?")) return;
    try {
      const { error } = await getSupabase().from(table).delete().eq("id", id);
      if (error) setError(error.message);
      else load();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const set = (key: string, value: string) => setForm({ ...form, [key]: value });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
        >
          {showForm ? "Close" : "+ Add"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={submit}
          className="mb-6 grid gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {fields.filter((f) => !f.readOnly).map((f) => (
            <label key={f.key} className={`text-xs text-slate-400 ${f.type === "textarea" ? "sm:col-span-2 lg:col-span-3" : ""}`}>
              {f.label}
              <div className="mt-1">
                {f.type === "boolean" ? (
                  <input
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 accent-cyan-500"
                    type="checkbox"
                    checked={form[f.key] === "true"}
                    onChange={(e) => set(f.key, String(e.target.checked))}
                  />
                ) : f.type === "select" ? (
                  <select
                    className={input}
                    required={f.required}
                    value={form[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                  >
                    <option value="">—</option>
                    {f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    className={input} rows={2}
                    value={form[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                ) : (
                  <input
                    className={input}
                    type={f.type ?? "text"}
                    step={f.step ?? (f.type === "number" ? "0.01" : undefined)}
                    required={f.required}
                    value={form[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                )}
              </div>
            </label>
          ))}
          <div className="flex items-end">
            <button className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400">
              Save
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              {fields.map((f) => <th key={f.key} className="px-4 py-3">{f.label}</th>)}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-slate-500" colSpan={fields.length + 1}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-6 text-slate-500" colSpan={fields.length + 1}>No records yet.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-800/60 text-slate-300 hover:bg-slate-800/30">
                  {fields.map((f) => (
                    <td key={f.key} className="max-w-xs truncate px-4 py-3">
                      {f.format ? f.format(r[f.key]) : String(r[f.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(r.id)} className="text-xs text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
