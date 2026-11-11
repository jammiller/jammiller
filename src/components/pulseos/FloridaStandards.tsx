import { useState } from 'react';

const subjects = [
  'Computer Science', 'Dance', 'English Language Arts (B.E.S.T.)',
  'English Language Development', 'Gifted', 'Health Education',
  'Mathematics (B.E.S.T.)', 'Music', 'Physical Education', 'Theatre',
  'Science', 'Social Studies', 'Special Skills', 'Visual Art', 'World Languages',
];

export function FloridaStandards({ onAdd }: { onAdd: (entries: string[]) => void }) {
  const [subject, setSubject] = useState(subjects[0]);
  const [grade, setGrade] = useState('K');
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const add = () => {
    const entries = [...new Set(text.split('\n').map(line => line.trim()).filter(Boolean))];
    if (!entries.length) return;
    onAdd(entries.map(entry => `Florida | ${subject} | Grade ${grade} | ${entry}`));
    setText('');
    setMessage(`${entries.length} benchmark entries added. Use Save Stage 1 to persist them.`);
  };

  return (
    <section className="space-y-3 rounded-xl border border-navy-200 bg-navy-50 p-4" aria-label="Florida K–12 standards">
      <h4 className="text-sm font-bold text-navy-900">Florida K–12 standards — all subjects</h4>
      <p className="text-xs text-slate-600">Browse Florida’s official CPALMS catalog and select the subject and grade there. Copy the benchmark code and exact wording below, one benchmark per line. This is a source-assisted entry tool, not an imported catalog; verify the applicable course and standards version in CPALMS.</p>
      <a href="https://www.cpalms.org/Public/search/standard" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-navy-700 underline">Browse official CPALMS standards ↗</a>
      <div className="flex flex-wrap gap-3">
        <label className="text-xs font-semibold text-slate-600">Subject
          <select value={subject} onChange={event => setSubject(event.target.value)} className="mt-1 block rounded-lg border border-slate-200 bg-white p-2 text-sm">
            {subjects.map(value => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">Grade
          <select value={grade} onChange={event => setGrade(event.target.value)} className="mt-1 block rounded-lg border border-slate-200 bg-white p-2 text-sm">
            {['K', ...Array.from({ length: 12 }, (_, index) => String(index + 1))].map(value => <option key={value}>{value}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-xs font-semibold text-slate-600">Official benchmark codes and wording
        <textarea value={text} onChange={event => setText(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" placeholder="Paste one official benchmark per line" />
      </label>
      <button type="button" onClick={add} disabled={!text.trim()} className="rounded-lg bg-navy-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Add to standards alignment</button>
      <p role="status" className="text-xs text-slate-600">{message}</p>
    </section>
  );
}
