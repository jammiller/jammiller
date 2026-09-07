import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  FileText,
  Package,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type Module = 'overview' | 'entry' | 'churn' | 'inventory';

type Customer = {
  id: string;
  name: string;
  email: string | null;
  purchase_count: number;
  total_spend: number;
  engagement_score: number;
  days_since_last_purchase: number;
  churn_score: number;
  churn_risk: 'low' | 'medium' | 'high';
};

type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  current_stock: number;
  reorder_point: number;
  avg_daily_usage: number;
  lead_time_days: number;
  forecast_30d: number;
  forecast_60d: number;
  forecast_90d: number;
  recommendation: string | null;
};

type DataEntry = {
  id: string;
  raw_input: string;
  category: string;
  confidence: number;
  extracted_fields: Record<string, string>;
  validated: boolean;
  validation_notes: string | null;
  created_at: string;
};

type CustomerDraft = {
  name: string;
  email: string;
  purchase_count: number;
  total_spend: number;
  engagement_score: number;
  days_since_last_purchase: number;
};

type InventoryDraft = {
  sku: string;
  name: string;
  current_stock: number;
  reorder_point: number;
  avg_daily_usage: number;
  lead_time_days: number;
};

const keywordGroups: Record<string, string[]> = {
  sales: ['order', 'purchase', 'invoice', 'payment', 'transaction', 'sold'],
  support: ['help', 'issue', 'problem', 'ticket', 'complaint', 'bug', 'error'],
  billing: ['charge', 'refund', 'credit', 'subscription', 'billing', 'invoice'],
  shipping: ['delivery', 'ship', 'track', 'address', 'package', 'dispatch'],
};

function classifyInput(rawInput: string) {
  const text = rawInput.toLowerCase();
  const scores = Object.fromEntries(Object.entries(keywordGroups).map(([category, words]) => [category, words.filter(word => text.includes(word)).length]));
  const maxScore = Math.max(...Object.values(scores));
  const category = maxScore > 0 ? Object.entries(scores).find(([, score]) => score === maxScore)?.[0] ?? 'other' : 'other';
  const confidence = maxScore > 0 ? Math.min(0.98, 0.58 + maxScore * 0.1) : 0.5;
  const extractedFields: Record<string, string> = {};
  const patterns: Record<string, RegExp> = {
    email: /[\w.+-]+@[\w-]+\.[\w.-]+/,
    amount: /\$[\d,]+(?:\.\d{2})?/,
    order_id: /#\s?([\w-]+)/,
    phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/,
  };
  Object.entries(patterns).forEach(([field, pattern]) => {
    const match = rawInput.match(pattern);
    if (match) extractedFields[field] = match[1] ?? match[0];
  });
  const validationNotes = rawInput.trim().length < 10 ? 'Add at least 10 characters.' : 'Input passed the basic length check.';
  return { category, confidence, extractedFields, validated: rawInput.trim().length >= 10, validationNotes };
}

function scoreCustomer(customer: Pick<Customer, 'purchase_count' | 'total_spend' | 'engagement_score' | 'days_since_last_purchase'>) {
  const recency = Math.max(0, 100 - customer.days_since_last_purchase * 1.5);
  const frequency = Math.min(100, customer.purchase_count * 5);
  const spend = Math.min(100, Number(customer.total_spend) / 50);
  const engagement = Math.max(0, Math.min(100, customer.engagement_score));
  const score = Math.max(0, Math.min(100, Math.round(100 - (recency * 0.35 + frequency * 0.2 + spend * 0.2 + engagement * 0.25))));
  return { score, risk: score >= 65 ? 'high' : score >= 35 ? 'medium' : 'low' } as const;
}

function forecastInventory(item: Pick<InventoryItem, 'current_stock' | 'reorder_point' | 'avg_daily_usage' | 'lead_time_days'>) {
  const usage = Math.max(0.1, Number(item.avg_daily_usage));
  const f30 = Math.ceil(usage * 30);
  const f60 = Math.ceil(usage * 60);
  const f90 = Math.ceil(usage * 90);
  const reorderQuantity = Math.max(0, f30 + Math.ceil(usage * item.lead_time_days * 1.5) - item.current_stock);
  const recommendation = item.current_stock <= item.reorder_point
    ? `Reorder ${reorderQuantity} units now.`
    : `Stock covers approximately ${Math.floor(item.current_stock / usage)} days at the recorded usage rate.`;
  return { f30, f60, f90, recommendation };
}

const emptyCustomer: CustomerDraft = { name: '', email: '', purchase_count: 0, total_spend: 0, engagement_score: 50, days_since_last_purchase: 0 };
const emptyInventory: InventoryDraft = { sku: '', name: '', current_stock: 0, reorder_point: 10, avg_daily_usage: 1, lead_time_days: 7 };

export function VoltEcho() {
  const [module, setModule] = useState<Module>('overview');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [lastAnalysis, setLastAnalysis] = useState<ReturnType<typeof classifyInput> | null>(null);
  const [customerDraft, setCustomerDraft] = useState<CustomerDraft>(emptyCustomer);
  const [inventoryDraft, setInventoryDraft] = useState<InventoryDraft>(emptyInventory);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    const [customerResult, inventoryResult, entryResult] = await Promise.all([
      supabase.from('voltecho_customers').select('*').order('created_at', { ascending: false }),
      supabase.from('voltecho_inventory').select('*').order('created_at', { ascending: false }),
      supabase.from('voltecho_data_entries').select('*').order('created_at', { ascending: false }).limit(25),
    ]);
    const firstError = customerResult.error ?? inventoryResult.error ?? entryResult.error;
    if (firstError) setError(firstError.message);
    setCustomers((customerResult.data ?? []) as Customer[]);
    setInventory((inventoryResult.data ?? []) as InventoryItem[]);
    setEntries((entryResult.data ?? []) as DataEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const highRisk = useMemo(() => customers.filter(customer => customer.churn_risk === 'high').length, [customers]);
  const urgentReorders = useMemo(() => inventory.filter(item => item.current_stock <= item.reorder_point).length, [inventory]);
  const validatedEntries = useMemo(() => entries.filter(entry => entry.validated).length, [entries]);

  const processEntry = async () => {
    if (rawInput.trim().length < 10) return;
    const analysis = classifyInput(rawInput);
    const { error: insertError } = await supabase.from('voltecho_data_entries').insert({
      raw_input: rawInput.trim(), category: analysis.category, confidence: analysis.confidence,
      extracted_fields: analysis.extractedFields, validated: analysis.validated, validation_notes: analysis.validationNotes,
    });
    if (insertError) { setError(insertError.message); return; }
    setLastAnalysis(analysis);
    setRawInput('');
    await loadData();
  };

  const addCustomer = async () => {
    if (!customerDraft.name.trim()) return;
    const scored = scoreCustomer(customerDraft);
    const { error: insertError } = await supabase.from('voltecho_customers').insert({
      ...customerDraft, name: customerDraft.name.trim(), email: customerDraft.email.trim() || null,
      ...{ churn_score: scored.score, churn_risk: scored.risk, status: scored.risk === 'high' ? 'at-risk' : 'active' },
    });
    if (insertError) { setError(insertError.message); return; }
    setCustomerDraft(emptyCustomer); setShowCustomerForm(false); await loadData();
  };

  const addInventory = async () => {
    if (!inventoryDraft.sku.trim() || !inventoryDraft.name.trim()) return;
    const forecast = forecastInventory(inventoryDraft as InventoryItem);
    const { error: insertError } = await supabase.from('voltecho_inventory').insert({
      ...inventoryDraft, sku: inventoryDraft.sku.trim(), name: inventoryDraft.name.trim(),
      forecast_30d: forecast.f30, forecast_60d: forecast.f60, forecast_90d: forecast.f90, recommendation: forecast.recommendation,
    });
    if (insertError) { setError(insertError.message); return; }
    setInventoryDraft(emptyInventory); setShowInventoryForm(false); await loadData();
  };

  const recomputeCustomer = async (customer: Customer) => {
    const scored = scoreCustomer(customer);
    const { error: updateError } = await supabase.from('voltecho_customers').update({ churn_score: scored.score, churn_risk: scored.risk, status: scored.risk === 'high' ? 'at-risk' : 'active' }).eq('id', customer.id);
    if (updateError) setError(updateError.message); else await loadData();
  };

  const recomputeInventory = async (item: InventoryItem) => {
    const forecast = forecastInventory(item);
    const { error: updateError } = await supabase.from('voltecho_inventory').update({ forecast_30d: forecast.f30, forecast_60d: forecast.f60, forecast_90d: forecast.f90, recommendation: forecast.recommendation }).eq('id', item.id);
    if (updateError) setError(updateError.message); else await loadData();
  };

  const removeRow = async (table: 'voltecho_customers' | 'voltecho_inventory' | 'voltecho_data_entries', id: string) => {
    const { error: deleteError } = await supabase.from(table).delete().eq('id', id);
    if (deleteError) setError(deleteError.message); else await loadData();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => setModule('overview')} className="flex items-center gap-3" aria-label="VoltEcho overview">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-black"><Zap className="h-5 w-5" /></span>
            <span className="font-mono text-sm font-bold tracking-[0.14em]">VOLTECHO</span>
          </button>
          <nav className="hidden gap-6 md:flex">
            {([['entry', 'Data entry'], ['churn', 'Churn prediction'], ['inventory', 'Inventory forecast']] as [Module, string][]).map(([value, label]) => (
              <button key={value} onClick={() => setModule(value)} className={`text-sm transition-colors ${module === value ? 'text-cyan-300' : 'text-slate-400 hover:text-white'}`}>{label}</button>
            ))}
          </nav>
          <span className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Live database</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {error && <div className="mb-6 flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
        {loading ? <div className="flex justify-center py-24"><RefreshCw className="h-6 w-6 animate-spin text-cyan-400" /></div> : (
          <>
            {module === 'overview' && <Overview customers={customers} inventory={inventory} entries={entries} highRisk={highRisk} urgentReorders={urgentReorders} validatedEntries={validatedEntries} onOpen={setModule} />}
            {module === 'entry' && <EntryModule rawInput={rawInput} setRawInput={setRawInput} lastAnalysis={lastAnalysis} entries={entries} onProcess={processEntry} onDelete={id => removeRow('voltecho_data_entries', id)} />}
            {module === 'churn' && <ChurnModule customers={customers} showForm={showCustomerForm} setShowForm={setShowCustomerForm} draft={customerDraft} setDraft={setCustomerDraft} onAdd={addCustomer} onRecompute={recomputeCustomer} onDelete={id => removeRow('voltecho_customers', id)} />}
            {module === 'inventory' && <InventoryModule inventory={inventory} showForm={showInventoryForm} setShowForm={setShowInventoryForm} draft={inventoryDraft} setDraft={setInventoryDraft} onAdd={addInventory} onRecompute={recomputeInventory} onDelete={id => removeRow('voltecho_inventory', id)} />}
          </>
        )}
      </main>
    </div>
  );
}

function Overview({ customers, inventory, entries, highRisk, urgentReorders, validatedEntries, onOpen }: { customers: Customer[]; inventory: InventoryItem[]; entries: DataEntry[]; highRisk: number; urgentReorders: number; validatedEntries: number; onOpen: (module: Module) => void }) {
  return <div className="space-y-10">
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-black to-slate-900 px-6 py-16 text-center sm:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.14),transparent_55%)]" />
      <div className="relative"><span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300"><Activity className="h-4 w-4 text-cyan-300" /> ML-powered operations for entrepreneurs</span><h1 className="mx-auto mt-10 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">Run your business on <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">intelligent autopilot.</span></h1><p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-slate-400">VoltEcho is a single hub that houses smart algorithms for data entry automation, customer churn prediction, and inventory forecasting.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={() => onOpen('entry')} className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:bg-cyan-300">Launch the dashboard</button><button onClick={() => onOpen('churn')} className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:border-cyan-300">Explore modules</button></div></div>
    </section>
    <div className="grid gap-4 sm:grid-cols-3"><Metric icon={Database} label="Records in database" value={customers.length + inventory.length + entries.length} /><Metric icon={TrendingDown} label="High churn risk" value={highRisk} /><Metric icon={Package} label="Urgent reorders" value={urgentReorders} /></div>
    <div className="grid gap-5 md:grid-cols-3"><ModuleCard icon={FileText} title="Data entry automation" text="Classify raw text, extract fields, and validate real entries." count={`${entries.length} records`} onClick={() => onOpen('entry')} /><ModuleCard icon={TrendingDown} title="Customer churn prediction" text="Score customers from the purchase and engagement data you provide." count={`${customers.length} customers`} onClick={() => onOpen('churn')} /><ModuleCard icon={Package} title="Inventory forecasting" text="Calculate 30, 60, and 90-day demand from recorded usage." count={`${validatedEntries} validated entries`} onClick={() => onOpen('inventory')} /></div>
    {customers.length + inventory.length + entries.length === 0 && <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100"><strong>No source data yet.</strong> VoltEcho is intentionally showing an empty state. Add or import real customer and inventory records before using recommendations or forecasts.</div>}
  </div>;
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) { return <div className="rounded-2xl border border-white/10 bg-slate-950 p-5"><Icon className="h-5 w-5 text-cyan-300" /><p className="mt-4 text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>; }
function ModuleCard({ icon: Icon, title, text, count, onClick }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string; count: string; onClick: () => void }) { return <button onClick={onClick} className="group rounded-2xl border border-white/10 bg-slate-950 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-400/40"><Icon className="h-7 w-7 text-cyan-300" /><h2 className="mt-6 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p><span className="mt-6 inline-flex items-center gap-2 text-sm text-cyan-300">{count}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></button>; }

function EntryModule({ rawInput, setRawInput, lastAnalysis, entries, onProcess, onDelete }: { rawInput: string; setRawInput: (value: string) => void; lastAnalysis: ReturnType<typeof classifyInput> | null; entries: DataEntry[]; onProcess: () => void; onDelete: (id: string) => void }) { return <section className="space-y-6"><ModuleTitle icon={FileText} title="Data entry automation" text="Analyze only the text you submit. Every result is saved to the live database." /><div className="rounded-2xl border border-white/10 bg-slate-950 p-6"><textarea value={rawInput} onChange={event => setRawInput(event.target.value)} className="h-36 w-full rounded-xl border border-white/10 bg-black p-4 text-sm text-white outline-none focus:border-cyan-300" placeholder="Paste a real order, support request, billing note, or shipping record here..." /><div className="mt-3 flex justify-between text-xs text-slate-500"><span>{rawInput.length} characters</span><button onClick={onProcess} disabled={rawInput.trim().length < 10} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40">Process entry</button></div></div>{lastAnalysis && <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-6"><p className="text-sm text-cyan-200">Detected category: <strong>{lastAnalysis.category}</strong> · {Math.round(lastAnalysis.confidence * 100)}% confidence</p><p className="mt-2 text-sm text-slate-300">{lastAnalysis.validationNotes}</p><div className="mt-4 flex flex-wrap gap-2">{Object.entries(lastAnalysis.extractedFields).map(([key, value]) => <span key={key} className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300">{key}: {value}</span>)}</div></div>}<div className="space-y-3">{entries.map(entry => <div key={entry.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950 p-4"><div className="min-w-0"><div className="flex gap-3 text-xs"><span className="text-cyan-300">{entry.category}</span><span className={entry.validated ? 'text-emerald-300' : 'text-amber-300'}>{entry.validated ? 'validated' : 'needs review'}</span></div><p className="mt-2 truncate text-sm text-slate-300">{entry.raw_input}</p></div><button onClick={() => onDelete(entry.id)} className="text-slate-500 hover:text-rose-300" aria-label="Delete entry"><Trash2 className="h-4 w-4" /></button></div>)}</div></section>; }

function ChurnModule({ customers, showForm, setShowForm, draft, setDraft, onAdd, onRecompute, onDelete }: { customers: Customer[]; showForm: boolean; setShowForm: (value: boolean) => void; draft: CustomerDraft; setDraft: (value: CustomerDraft) => void; onAdd: () => void; onRecompute: (customer: Customer) => void; onDelete: (id: string) => void }) { return <section className="space-y-6"><ModuleTitle icon={TrendingDown} title="Customer churn prediction" text="Scores are derived from each customer's recency, frequency, spend, and engagement fields." /><button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-black"><Plus className="h-4 w-4" /> Add real customer</button>{showForm && <CustomerForm draft={draft} setDraft={setDraft} onAdd={onAdd} />}{customers.length === 0 ? <Empty text="No customer records available. Add a real customer to produce a score." /> : <div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-slate-500"><tr>{['Customer', 'Purchases', 'Spend', 'Engagement', 'Days inactive', 'Score', 'Risk', ''].map(label => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{customers.map(customer => <tr key={customer.id} className="border-b border-white/5"><td className="px-4 py-4"><p className="font-medium">{customer.name}</p><p className="text-xs text-slate-500">{customer.email}</p></td><td className="px-4">{customer.purchase_count}</td><td className="px-4">${Number(customer.total_spend).toLocaleString()}</td><td className="px-4">{customer.engagement_score}</td><td className="px-4">{customer.days_since_last_purchase}</td><td className="px-4 font-bold">{Math.round(Number(customer.churn_score))}</td><td className="px-4"><span className={customer.churn_risk === 'high' ? 'text-rose-300' : customer.churn_risk === 'medium' ? 'text-amber-300' : 'text-emerald-300'}>{customer.churn_risk}</span></td><td className="px-4"><button onClick={() => onRecompute(customer)} className="mr-2 text-slate-500 hover:text-cyan-300"><RefreshCw className="h-4 w-4" /></button><button onClick={() => onDelete(customer.id)} className="text-slate-500 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>}</section>; }

function CustomerForm({ draft, setDraft, onAdd }: { draft: CustomerDraft; setDraft: (value: CustomerDraft) => void; onAdd: () => void }) { return <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950 p-5 sm:grid-cols-2 lg:grid-cols-3">{([['name', 'Name'], ['email', 'Email'], ['purchase_count', 'Purchase count'], ['total_spend', 'Total spend'], ['engagement_score', 'Engagement 0-100'], ['days_since_last_purchase', 'Days since purchase']] as [keyof CustomerDraft, string][]).map(([key, label]) => <label key={key} className="text-xs text-slate-500">{label}<input value={draft[key]} onChange={event => setDraft({ ...draft, [key]: key === 'name' || key === 'email' ? event.target.value : Number(event.target.value) })} type={key === 'name' || key === 'email' ? 'text' : 'number'} className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white" /></label>)}<button onClick={onAdd} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-black">Save customer</button></div>; }

function InventoryModule({ inventory, showForm, setShowForm, draft, setDraft, onAdd, onRecompute, onDelete }: { inventory: InventoryItem[]; showForm: boolean; setShowForm: (value: boolean) => void; draft: InventoryDraft; setDraft: (value: InventoryDraft) => void; onAdd: () => void; onRecompute: (item: InventoryItem) => void; onDelete: (id: string) => void }) { return <section className="space-y-6"><ModuleTitle icon={Package} title="Inventory forecasting" text="Forecasts use the recorded average daily usage and lead time for each SKU." /><button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-black"><Plus className="h-4 w-4" /> Add real inventory</button>{showForm && <InventoryForm draft={draft} setDraft={setDraft} onAdd={onAdd} />}{inventory.length === 0 ? <Empty text="No inventory records available. Add a real SKU to produce a forecast." /> : <div className="grid gap-4 lg:grid-cols-2">{inventory.map(item => <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950 p-5"><div className="flex justify-between"><div><p className="font-mono text-xs text-slate-500">{item.sku}</p><h3 className="mt-1 font-bold">{item.name}</h3></div><div><button onClick={() => onRecompute(item)} className="mr-2 text-slate-500 hover:text-cyan-300"><RefreshCw className="h-4 w-4" /></button><button onClick={() => onDelete(item.id)} className="text-slate-500 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button></div></div><div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs"><span className="rounded-lg bg-black p-3"><b className="block text-lg">{item.current_stock}</b>stock</span><span className="rounded-lg bg-black p-3"><b className="block text-lg">{item.avg_daily_usage}</b>daily use</span><span className="rounded-lg bg-black p-3"><b className="block text-lg">{item.forecast_30d}</b>30d need</span><span className="rounded-lg bg-black p-3"><b className="block text-lg">{item.forecast_90d}</b>90d need</span></div><p className={`mt-4 rounded-lg border p-3 text-sm ${item.current_stock <= item.reorder_point ? 'border-rose-400/30 text-rose-200' : 'border-emerald-400/30 text-emerald-200'}`}>{item.recommendation ?? 'No recommendation yet.'}</p></div>)}</div>}</section>; }

function InventoryForm({ draft, setDraft, onAdd }: { draft: InventoryDraft; setDraft: (value: InventoryDraft) => void; onAdd: () => void }) { return <div className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950 p-5 sm:grid-cols-2 lg:grid-cols-3">{([['sku', 'SKU'], ['name', 'Product name'], ['current_stock', 'Current stock'], ['reorder_point', 'Reorder point'], ['avg_daily_usage', 'Average daily usage'], ['lead_time_days', 'Lead time days']] as [keyof InventoryDraft, string][]).map(([key, label]) => <label key={key} className="text-xs text-slate-500">{label}<input value={draft[key]} onChange={event => setDraft({ ...draft, [key]: key === 'sku' || key === 'name' ? event.target.value : Number(event.target.value) })} type={key === 'sku' || key === 'name' ? 'text' : 'number'} className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white" /></label>)}<button onClick={onAdd} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-black">Save inventory</button></div>; }
function ModuleTitle({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) { return <div className="flex items-start gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300"><Icon className="h-6 w-6" /></span><div><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-slate-400">{text}</p></div></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-sm text-amber-100"><AlertTriangle className="mb-3 h-5 w-5" />{text}</div>; }
