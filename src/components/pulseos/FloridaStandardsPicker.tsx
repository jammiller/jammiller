import { useEffect, useMemo, useState } from 'react';

const DATASET_REVISION = 'e4ffcc2251d014e12fa9294bf4440eec9692982b';
const DATASET_BASE = `https://cdn.jsdelivr.net/gh/vrajshroff/Academic-Standards@${DATASET_REVISION}/standards/florida`;

const subjects = [
  { id: 'english-language-arts', label: 'English' },
  { id: 'mathematics', label: 'Math' },
  { id: 'science', label: 'Science' },
  { id: 'biology', label: 'Biology' },
  { id: 'social-studies', label: 'Social Studies' },
] as const;

const grades = ['K', ...Array.from({ length: 12 }, (_, index) => String(index + 1))];

type SubjectId = (typeof subjects)[number]['id'];
type StandardItem = {
  kind?: string;
  code?: string | null;
  title?: string;
  grades?: string[];
};
type StandardsShard = {
  frameworks?: Array<{ name?: string }>;
  items?: Record<string, StandardItem>;
};

interface Props {
  selectedStandards: string[];
  onAdd: (standard: string) => void;
}

export function FloridaStandardsPicker({ selectedStandards, onAdd }: Props) {
  const [subject, setSubject] = useState<SubjectId>('english-language-arts');
  const [grade, setGrade] = useState('all');
  const [query, setQuery] = useState('');
  const [shard, setShard] = useState<StandardsShard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataSubject = subject === 'biology' ? 'science' : subject;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setShard(null);

    fetch(`${DATASET_BASE}/${dataSubject}.json`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Standards data request failed (${response.status}).`);
        return response.json() as Promise<StandardsShard>;
      })
      .then(data => {
        if (!data.items || typeof data.items !== 'object') {
          throw new Error('The standards source returned an unsupported data format.');
        }
        setShard(data);
      })
      .catch(reason => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : 'Unable to load Florida standards.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [dataSubject]);

  const filteredStandards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return Object.values(shard?.items ?? {})
      .filter((item): item is StandardItem & { code: string; title: string } =>
        item.kind === 'Standard' && typeof item.code === 'string' && !!item.code && typeof item.title === 'string')
      .filter(item => subject !== 'biology' || /^SC\.912\.(L|N)\./i.test(item.code))
      .filter(item => grade === 'all' || item.grades?.includes(grade))
      .filter(item => !normalizedQuery
        || item.code.toLowerCase().includes(normalizedQuery)
        || item.title.toLowerCase().includes(normalizedQuery))
      .slice(0, 100);
  }, [grade, query, shard, subject]);

  function addStandard(standard: StandardItem & { code: string; title: string }) {
    const value = `${standard.code} — ${standard.title}`;
    const alreadySelected = selectedStandards.some(selected => selected === value || selected.startsWith(`${standard.code} — `));
    if (!alreadySelected) onAdd(value);
  }

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <h4 className="text-sm font-bold text-navy-900">Florida standards</h4>
        <p className="mt-1 text-xs text-slate-600">Browse by course and grade, then add standards to this unit.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <select aria-label="Standards course" value={subject} onChange={event => setSubject(event.target.value as SubjectId)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          {subjects.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
        <select aria-label="Standards grade" value={grade} onChange={event => setGrade(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="all">All grades</option>
          {grades.map(value => <option key={value} value={value}>{value === 'K' ? 'Kindergarten' : `Grade ${value}`}</option>)}
        </select>
        <input
          aria-label="Search Florida standards"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search code or text"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
      </div>
      {loading ? (
        <p className="text-xs text-slate-500">Loading standards…</p>
      ) : error ? (
        <p role="alert" className="text-xs text-rose-700">{error} Check your connection or use the manual standards field below.</p>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1" aria-live="polite">
          {filteredStandards.length === 0 ? (
            <p className="text-xs text-slate-500">No matching standards. Try another grade or search.</p>
          ) : filteredStandards.map((standard, index) => {
            const selected = selectedStandards.some(value => value.startsWith(`${standard.code} — `));
            return (
              <div key={`${standard.code}-${index}`} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-navy-900">{standard.code}</p>
                  <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600">{standard.title}</p>
                </div>
                <button
                  type="button"
                  disabled={selected}
                  onClick={() => addStandard(standard)}
                  className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-navy-800 hover:border-gold-400 disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {selected ? 'Added' : 'Add'}
                </button>
              </div>
            );
          })}
          {filteredStandards.length === 100 && <p className="text-xs text-slate-500">Showing the first 100 matches. Add a search term to narrow results.</p>}
        </div>
      )}
      <p className="text-[11px] leading-4 text-slate-500">
        Academic standards data provided by <a className="font-semibold underline" href="https://howtostudent.com" target="_blank" rel="noreferrer">How To Student</a> (CC BY 4.0).
        {' '}Verify current requirements with <a className="font-semibold underline" href="https://www.cpalms.org/Public/search/Standard" target="_blank" rel="noreferrer">CPALMS</a>, Florida’s official standards source.
      </p>
    </section>
  );
}
