import { useState } from 'react';
import {
  Plus, Trash2, Target, FileText, BookOpen, ChevronRight, Layers,
  CheckCircle2, AlertCircle, Brain, Save,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type {
  Program, Course, UbDUnit, Lesson, Stage1, Stage2, Stage3,
} from '../../lib/pulseos-types';
import { emptyStage1, emptyStage2, emptyStage3, ubdCompleteness } from '../../lib/pulseos-types';

interface Props {
  units: UbDUnit[];
  courses: Course[];
  programs: Program[];
  lessons: Lesson[];
  selectedUnit: UbDUnit | null;
  onSelectUnit: (id: string | null) => void;
  onRefetch: () => void;
}

type StageTab = 1 | 2 | 3;

export function UnitBuilder({
  units, courses, programs, lessons, selectedUnit, onSelectUnit, onRefetch,
}: Props) {
  const [stageTab, setStageTab] = useState<StageTab>(1);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [showProgramForm, setShowProgramForm] = useState(false);
  const [newProgramTitle, setNewProgramTitle] = useState('');
  const [newProgramSubject, setNewProgramSubject] = useState('');
  const [newProgramGrade, setNewProgramGrade] = useState('');

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseProgramId, setNewCourseProgramId] = useState('');

  async function createProgram() {
    if (!newProgramTitle.trim()) return;
    await supabase.from('pulseos_programs').insert({
      title: newProgramTitle,
      subject: newProgramSubject || null,
      grade_band: newProgramGrade || null,
    });
    setNewProgramTitle(''); setNewProgramSubject(''); setNewProgramGrade('');
    setShowProgramForm(false);
    onRefetch();
  }

  async function createCourse() {
    if (!newCourseTitle.trim() || !newCourseProgramId) return;
    await supabase.from('pulseos_courses').insert({
      program_id: newCourseProgramId,
      title: newCourseTitle,
    });
    setNewCourseTitle(''); setNewCourseProgramId('');
    setShowCourseForm(false);
    onRefetch();
  }

  async function createUnit(courseId: string) {
    const { data, error } = await supabase
      .from('pulseos_units')
      .insert({
        course_id: courseId,
        title: 'New UbD Unit',
        stage1: emptyStage1, stage2: emptyStage2, stage3: emptyStage3,
        status: 'draft', version: 1,
      })
      .select().single();
    if (!error && data) { onRefetch(); onSelectUnit(data.id); }
  }

  async function deleteUnit(id: string) {
    await supabase.from('pulseos_units').delete().eq('id', id);
    onSelectUnit(null);
    onRefetch();
  }

  async function saveUnit(unit: UbDUnit) {
    setSaving(true); setSaveMsg(null);
    const { error } = await supabase
      .from('pulseos_units')
      .update({
        title: unit.title,
        description: unit.description,
        stage1: unit.stage1,
        stage2: unit.stage2,
        stage3: unit.stage3,
        status: unit.status,
      })
      .eq('id', unit.id);
    setSaving(false);
    setSaveMsg(error ? `Error: ${error.message}` : 'Saved successfully');
    setTimeout(() => setSaveMsg(null), 3000);
    onRefetch();
  }

  async function updateStatus(unit: UbDUnit, status: string) {
    await supabase.from('pulseos_units').update({ status }).eq('id', unit.id);
    onRefetch();
  }

  async function logAnalytics(unitId: string, eventType: string) {
    await supabase.from('pulseos_analytics_events').insert({
      unit_id: unitId, event_type: eventType,
    });
  }

  // ---- Unit Editor ----
  if (selectedUnit) {
    const completeness = ubdCompleteness(selectedUnit);
    const unitLessons = lessons.filter(l => l.unit_id === selectedUnit.id);
    const statusColors: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-600',
      in_review: 'bg-amber-100 text-amber-700',
      published: 'bg-green-100 text-green-700',
      archived: 'bg-rose-100 text-rose-700',
    };

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => onSelectUnit(null)} className="font-semibold text-navy-700 hover:text-gold-700">
            All Units
          </button>
          <ChevronRight className="h-4 w-4 text-slate-400" />
          <span className="text-slate-500">{selectedUnit.title}</span>
        </div>

        {/* Unit header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <input
                type="text"
                value={selectedUnit.title}
                onChange={(e) => {
                  selectedUnit.title = e.target.value;
                  onSelectUnit(selectedUnit.id);
                }}
                onBlur={() => saveUnit(selectedUnit)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xl font-bold text-navy-900 focus:border-gold-400 focus:outline-none"
                placeholder="Unit title"
              />
              <textarea
                value={selectedUnit.description ?? ''}
                onChange={(e) => { selectedUnit.description = e.target.value; }}
                onBlur={() => saveUnit(selectedUnit)}
                placeholder="Unit description..."
                className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-gold-400 focus:outline-none"
                rows={2}
              />
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[selectedUnit.status]}`}>
                {selectedUnit.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">Version {selectedUnit.version}</span>
            </div>
          </div>

          {/* UbD completeness bar */}
          <div className="mt-5 rounded-xl bg-softgray p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-navy-700">UbD Completeness</span>
              <span className="text-xs font-bold text-navy-900">{completeness.stage}/3 Stages</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-2 flex-1 rounded-full ${s <= completeness.stage ? 'bg-gold-500' : 'bg-slate-200'}`} />
              ))}
            </div>
            {completeness.details.length > 0 && (
              <div className="mt-3 space-y-1">
                {completeness.details.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-amber-700">
                    <AlertCircle className="h-3.5 w-3.5" /> {d}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status controls */}
          <div className="mt-4 flex flex-wrap gap-2">
            {['draft', 'in_review', 'published', 'archived'].map(s => (
              <button
                key={s}
                onClick={() => updateStatus(selectedUnit, s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedUnit.status === s
                    ? 'bg-navy-900 text-white'
                    : 'border border-slate-200 text-slate-600 hover:border-navy-300'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
            <button
              onClick={() => deleteUnit(selectedUnit.id)}
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Stage tabs */}
        <div className="flex gap-2">
          {[
            { num: 1, label: 'Stage 1 — Desired Results', icon: Target },
            { num: 2, label: 'Stage 2 — Evidence', icon: FileText },
            { num: 3, label: 'Stage 3 — Learning Plan', icon: BookOpen },
          ].map(tab => (
            <button
              key={tab.num}
              onClick={() => { setStageTab(tab.num as StageTab); logAnalytics(selectedUnit.id, 'view'); }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                stageTab === tab.num
                  ? 'bg-navy-900 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-navy-300'
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Stage content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {stageTab === 1 && <Stage1Editor unit={selectedUnit} onSave={saveUnit} />}
          {stageTab === 2 && <Stage2Editor unit={selectedUnit} onSave={saveUnit} />}
          {stageTab === 3 && <Stage3Editor unit={selectedUnit} onSave={saveUnit} />}
        </div>

        {/* Lessons */}
        <LessonManager
          unitId={selectedUnit.id}
          lessons={unitLessons}
          onRefetch={onRefetch}
        />

        {/* Save indicator */}
        {saving && <p className="text-center text-sm text-slate-500">Saving...</p>}
        {saveMsg && (
          <p className={`text-center text-sm ${saveMsg.startsWith('Error') ? 'text-rose-600' : 'text-green-600'}`}>
            {saveMsg}
          </p>
        )}
      </div>
    );
  }

  // ---- Unit List ----
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy-900">UbD Units</h2>
      </div>

      {/* Programs & Courses management */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Programs</h3>
            <button onClick={() => setShowProgramForm(!showProgramForm)} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-gold-700">
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>
          {showProgramForm && (
            <div className="mb-3 space-y-2 rounded-lg bg-softgray p-3">
              <input value={newProgramTitle} onChange={e => setNewProgramTitle(e.target.value)} placeholder="Program title" className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm" />
              <input value={newProgramSubject} onChange={e => setNewProgramSubject(e.target.value)} placeholder="Subject (optional)" className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm" />
              <input value={newProgramGrade} onChange={e => setNewProgramGrade(e.target.value)} placeholder="Grade band (optional)" className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm" />
              <button onClick={createProgram} className="w-full rounded bg-navy-900 py-1.5 text-xs font-semibold text-white hover:bg-navy-800">Create Program</button>
            </div>
          )}
          {programs.length === 0 ? (
            <p className="text-xs text-slate-400">No programs yet.</p>
          ) : (
            <div className="space-y-1">
              {programs.map(p => (
                <div key={p.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-softgray">
                  <Layers className="h-3.5 w-3.5 text-navy-500" />
                  <span className="font-medium text-navy-800">{p.title}</span>
                  {p.subject && <span className="text-xs text-slate-400">/ {p.subject}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Courses</h3>
            <button onClick={() => setShowCourseForm(!showCourseForm)} className="inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-gold-700">
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>
          {showCourseForm && (
            <div className="mb-3 space-y-2 rounded-lg bg-softgray p-3">
              <select value={newCourseProgramId} onChange={e => setNewCourseProgramId(e.target.value)} className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm">
                <option value="">Select program...</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <input value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} placeholder="Course title" className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm" />
              <button onClick={createCourse} className="w-full rounded bg-navy-900 py-1.5 text-xs font-semibold text-white hover:bg-navy-800">Create Course</button>
            </div>
          )}
          {courses.length === 0 ? (
            <p className="text-xs text-slate-400">No courses yet. Create a program first.</p>
          ) : (
            <div className="space-y-1">
              {courses.map(c => {
                const prog = programs.find(p => p.id === c.program_id);
                return (
                  <div key={c.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-softgray">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-navy-500" />
                      <span className="font-medium text-navy-800">{c.title}</span>
                    </div>
                    <span className="text-xs text-slate-400">{prog?.title ?? '—'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Units list */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-navy-900">All Units</h3>
        {units.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Brain className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No UbD units yet.</p>
            {courses.length > 0 ? (
              <button onClick={() => createUnit(courses[0].id)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
                <Plus className="h-4 w-4" /> Create First Unit
              </button>
            ) : (
              <p className="mt-2 text-xs text-slate-400">Create a program and course above first.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {units.map(unit => {
              const course = courses.find(c => c.id === unit.course_id);
              const program = programs.find(p => p.id === course?.program_id);
              const comp = ubdCompleteness(unit);
              const statusColors: Record<string, string> = {
                draft: 'bg-slate-100 text-slate-600',
                in_review: 'bg-amber-100 text-amber-700',
                published: 'bg-green-100 text-green-700',
                archived: 'bg-rose-100 text-rose-700',
              };
              return (
                <button
                  key={unit.id}
                  onClick={() => { onSelectUnit(unit.id); logAnalytics(unit.id, 'view'); }}
                  className="group rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[unit.status]}`}>
                      {unit.status.replace('_', ' ')}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1.5 w-6 rounded-full ${s <= comp.stage ? 'bg-gold-500' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-navy-900 group-hover:text-gold-700">{unit.title}</h4>
                  <p className="mt-1 text-xs text-slate-500">{program?.title ?? '—'} / {course?.title ?? '—'}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                    {comp.stage === 3 ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                    {comp.stage}/3 stages complete
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Stage Editors ----

function StringListEditor({
  items, onChange, placeholder, label,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-navy-700">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <input
              type="text"
              value={item}
              onChange={e => { const next = [...items]; next[i] = e.target.value; onChange(next); }}
              placeholder={placeholder}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
            />
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button onClick={() => onChange([...items, ''])} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-navy-700 hover:border-gold-400 hover:text-gold-700">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
    </div>
  );
}

function LessonManager({
  unitId, lessons, onRefetch,
}: {
  unitId: string;
  lessons: Lesson[];
  onRefetch: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [essentialQuestion, setEssentialQuestion] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [plan, setPlan] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setTitle(''); setEssentialQuestion(''); setObjectives([]); setPlan([]); setResources([]);
    setEditingId(null); setShowForm(false);
  }

  function startEdit(l: Lesson) {
    setEditingId(l.id);
    setTitle(l.title);
    setEssentialQuestion(l.essential_question ?? '');
    setObjectives(l.objectives ?? []);
    setPlan(l.plan ?? []);
    setResources(l.resources ?? []);
    setShowForm(true);
  }

  async function saveLesson() {
    if (!title.trim()) return;
    setSaving(true);
    if (editingId) {
      await supabase.from('pulseos_lessons').update({
        title, essential_question: essentialQuestion || null,
        objectives, plan, resources,
      }).eq('id', editingId);
    } else {
      await supabase.from('pulseos_lessons').insert({
        unit_id: unitId, title, essential_question: essentialQuestion || null,
        objectives, plan, resources,
      });
    }
    setSaving(false);
    resetForm();
    onRefetch();
  }

  async function deleteLesson(id: string) {
    await supabase.from('pulseos_lessons').delete().eq('id', id);
    onRefetch();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-navy-900">Lessons in this Unit</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{lessons.length} lessons</span>
          {!showForm && (
            <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800">
              <Plus className="h-3.5 w-3.5" /> Add Lesson
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-softgray p-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Lesson title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" />
          <input value={essentialQuestion} onChange={e => setEssentialQuestion(e.target.value)} placeholder="Essential question (optional)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" />
          <StringListEditor items={objectives} onChange={setObjectives} placeholder="Objective..." label="Objectives" />
          <StringListEditor items={plan} onChange={setPlan} placeholder="Step in lesson plan..." label="Lesson Plan" />
          <StringListEditor items={resources} onChange={setResources} placeholder="Resource (title, link, or description)..." label="Resources" />
          <div className="flex gap-2">
            <button onClick={saveLesson} disabled={saving || !title.trim()} className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:opacity-50">
              <Save className="h-4 w-4" /> {editingId ? 'Update Lesson' : 'Create Lesson'}
            </button>
            <button onClick={resetForm} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {lessons.length === 0 && !showForm ? (
        <p className="text-sm text-slate-400">No lessons created yet for this unit.</p>
      ) : (
        <div className="space-y-2">
          {lessons.map(l => (
            <div key={l.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
              <BookOpen className="h-4 w-4 text-navy-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy-900">{l.title}</p>
                {l.essential_question && <p className="text-xs text-slate-500">EQ: {l.essential_question}</p>}
                {(l.objectives?.length ?? 0) > 0 && (
                  <p className="text-xs text-slate-400">{l.objectives!.length} objectives</p>
                )}
              </div>
              <button onClick={() => startEdit(l)} className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-50 hover:text-navy-700">
                <FileText className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => deleteLesson(l.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stage1Editor({ unit, onSave }: { unit: UbDUnit; onSave: (u: UbDUnit) => void }) {
  const s1 = unit.stage1;
  const update = (patch: Partial<Stage1>) => { unit.stage1 = { ...s1, ...patch }; };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-navy-50 p-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-navy-700" />
          <h3 className="text-sm font-bold text-navy-900">Stage 1 — Desired Results</h3>
        </div>
        <p className="mt-1 text-xs text-slate-600">Define what learners should understand, know, and be able to do. This is the foundation of backward design.</p>
      </div>
      <StringListEditor items={s1.big_ideas} onChange={v => update({ big_ideas: v })} placeholder="Big idea..." label="Big Ideas" />
      <StringListEditor items={s1.understandings} onChange={v => update({ understandings: v })} placeholder="Students will understand that..." label="Understandings" />
      <StringListEditor items={s1.essential_questions} onChange={v => update({ essential_questions: v })} placeholder="Essential question..." label="Essential Questions" />
      <StringListEditor items={s1.knowledge_skills} onChange={v => update({ knowledge_skills: v })} placeholder="Knowledge / skill..." label="Knowledge & Skills" />
      <StringListEditor items={s1.standards} onChange={v => update({ standards: v })} placeholder="Standard (e.g., CCSS.RL.6.1)..." label="Standards Alignment" />
      <button onClick={() => onSave(unit)} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
        <Save className="h-4 w-4" /> Save Stage 1
      </button>
    </div>
  );
}

function Stage2Editor({ unit, onSave }: { unit: UbDUnit; onSave: (u: UbDUnit) => void }) {
  const s2 = unit.stage2;
  const update = (patch: Partial<Stage2>) => { unit.stage2 = { ...s2, ...patch }; };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-navy-50 p-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-navy-700" />
          <h3 className="text-sm font-bold text-navy-900">Stage 2 — Evidence</h3>
        </div>
        <p className="mt-1 text-xs text-slate-600">Design assessments and performance tasks that provide evidence of understanding. This is where you prove learning happened.</p>
      </div>
      <StringListEditor items={s2.performance_tasks} onChange={v => update({ performance_tasks: v })} placeholder="Performance task description..." label="Performance Tasks" />
      <StringListEditor items={s2.summative_assessments} onChange={v => update({ summative_assessments: v })} placeholder="Summative assessment..." label="Summative Assessments" />
      <StringListEditor items={s2.formative_checks} onChange={v => update({ formative_checks: v })} placeholder="Formative check..." label="Formative Checks" />
      <StringListEditor items={s2.rubrics} onChange={v => update({ rubrics: v })} placeholder="Rubric criteria..." label="Rubrics" />
      <button onClick={() => onSave(unit)} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
        <Save className="h-4 w-4" /> Save Stage 2
      </button>
    </div>
  );
}

function Stage3Editor({ unit, onSave }: { unit: UbDUnit; onSave: (u: UbDUnit) => void }) {
  const s3 = unit.stage3;
  const update = (patch: Partial<Stage3>) => { unit.stage3 = { ...s3, ...patch }; };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-navy-50 p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-navy-700" />
          <h3 className="text-sm font-bold text-navy-900">Stage 3 — Learning Plan</h3>
        </div>
        <p className="mt-1 text-xs text-slate-600">Plan the learning experiences, sequence, and resources that will get learners to the desired results. This is the instructional roadmap.</p>
      </div>
      <StringListEditor items={s3.learning_experiences} onChange={v => update({ learning_experiences: v })} placeholder="Learning experience..." label="Learning Experiences" />
      <StringListEditor items={s3.sequence} onChange={v => update({ sequence: v })} placeholder="Step in sequence..." label="Sequence" />
      <StringListEditor items={s3.resources} onChange={v => update({ resources: v })} placeholder="Resource (title, link, or description)..." label="Resources" />
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-navy-700">Differentiation Notes</label>
        <textarea
          value={s3.differentiation_notes}
          onChange={e => update({ differentiation_notes: e.target.value })}
          placeholder="How will you differentiate instruction for diverse learners?"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
          rows={4}
        />
      </div>
      <button onClick={() => onSave(unit)} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800">
        <Save className="h-4 w-4" /> Save Stage 3
      </button>
    </div>
  );
}
