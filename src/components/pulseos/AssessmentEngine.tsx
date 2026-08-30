import { useState } from 'react';
import {
  Plus, Trash2, ClipboardList, ChevronRight, Save, Award,
  User, BookPlus,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type {
  UbDUnit, Assessment, AssessmentSubmission, AssessmentQuestion, Course,
} from '../../lib/pulseos-types';
import { emptyStage1, emptyStage2, emptyStage3 } from '../../lib/pulseos-types';

interface Props {
  assessments: Assessment[];
  units: UbDUnit[];
  submissions: AssessmentSubmission[];
  courses: Course[];
  onRefetch: () => void;
}

export function AssessmentEngine({ assessments, units, submissions, courses, onRefetch }: Props) {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'summative' | 'formative' | 'performance'>('formative');
  const [newUnitId, setNewUnitId] = useState('');
  const [saving, setSaving] = useState(false);
  const [showInlineUnitForm, setShowInlineUnitForm] = useState(false);
  const [inlineUnitTitle, setInlineUnitTitle] = useState('');
  const [inlineUnitCourseId, setInlineUnitCourseId] = useState('');

  const selected = assessments.find(a => a.id === selectedAssessmentId) ?? null;

  async function createInlineUnit() {
    if (!inlineUnitTitle.trim() || !inlineUnitCourseId) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('pulseos_units')
      .insert({
        course_id: inlineUnitCourseId,
        title: inlineUnitTitle,
        stage1: emptyStage1, stage2: emptyStage2, stage3: emptyStage3,
        status: 'draft', version: 1,
      })
      .select().single();
    setSaving(false);
    if (!error && data) {
      setNewUnitId(data.id);
      setInlineUnitTitle('');
      setInlineUnitCourseId('');
      setShowInlineUnitForm(false);
      onRefetch();
    }
  }

  async function createAssessment() {
    if (!newTitle.trim() || !newUnitId) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('pulseos_assessments')
      .insert({
        unit_id: newUnitId,
        type: newType,
        title: newTitle,
        questions: [],
        rubric: [],
      })
      .select().single();
    setSaving(false);
    if (!error && data) {
      setNewTitle(''); setNewUnitId(''); setShowCreateForm(false);
      onRefetch();
      setSelectedAssessmentId(data.id);
    }
  }

  async function deleteAssessment(id: string) {
    await supabase.from('pulseos_assessments').delete().eq('id', id);
    setSelectedAssessmentId(null);
    onRefetch();
  }

  async function saveAssessment(assessment: Assessment) {
    setSaving(true);
    await supabase
      .from('pulseos_assessments')
      .update({
        title: assessment.title,
        description: assessment.description,
        questions: assessment.questions,
        rubric: assessment.rubric,
      })
      .eq('id', assessment.id);
    setSaving(false);
    onRefetch();
  }

  async function submitAssessment(assessment: Assessment, respondentName: string, answers: Record<string, string>) {
    let score: number | null = null;
    const graded = assessment.questions.filter(q => q.type === 'multiple_choice' || q.type === 'true_false');
    if (graded.length > 0) {
      let correct = 0;
      for (const q of graded) {
        if (answers[q.id] === q.correct_answer) correct++;
      }
      score = Math.round((correct / graded.length) * 100);
    }
    await supabase.from('pulseos_assessment_submissions').insert({
      assessment_id: assessment.id,
      respondent_name: respondentName,
      answers,
      score,
    });
    await supabase.from('pulseos_analytics_events').insert({
      assessment_id: assessment.id,
      event_type: 'score',
      value: score,
    });
    onRefetch();
  }

  // ---- Assessment Detail View ----
  if (selected) {
    const unit = units.find(u => u.id === selected.unit_id);
    const assessmentSubs = submissions.filter(s => s.assessment_id === selected.id);

    return (
      <AssessmentDetail
        assessment={selected}
        unit={unit}
        submissions={assessmentSubs}
        onBack={() => setSelectedAssessmentId(null)}
        onSave={saveAssessment}
        onDelete={deleteAssessment}
        onSubmit={submitAssessment}
        saving={saving}
      />
    );
  }

  // ---- Assessment List ----
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-navy-900">Assessment Engine</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          <Plus className="h-4 w-4" /> New Assessment
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-navy-900">Create New Assessment</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-700">Title</label>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Assessment title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-700">Unit</label>
              <div className="flex gap-2">
                <select value={newUnitId} onChange={e => setNewUnitId(e.target.value)} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none">
                  <option value="">Select unit...</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setShowInlineUnitForm(!showInlineUnitForm)}
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-navy-700 hover:border-gold-400 hover:text-gold-700"
                  title="Create a new unit"
                >
                  <BookPlus className="h-3.5 w-3.5" /> New Unit
                </button>
              </div>
              {showInlineUnitForm && (
                <div className="mt-2 space-y-2 rounded-lg bg-softgray p-3">
                  <select value={inlineUnitCourseId} onChange={e => setInlineUnitCourseId(e.target.value)} className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm">
                    <option value="">Select course...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  <input value={inlineUnitTitle} onChange={e => setInlineUnitTitle(e.target.value)} placeholder="New unit title" className="w-full rounded border border-slate-200 px-2 py-1.5 text-sm" />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={createInlineUnit}
                      disabled={saving || !inlineUnitTitle.trim() || !inlineUnitCourseId}
                      className="inline-flex items-center gap-1.5 rounded bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-800 disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" /> Create Unit
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInlineUnitForm(false)}
                      className="rounded border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-700">Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value as 'summative' | 'formative' | 'performance')} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none">
                <option value="formative">Formative</option>
                <option value="summative">Summative</option>
                <option value="performance">Performance</option>
              </select>
            </div>
          </div>
          <button onClick={createAssessment} disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:opacity-50">
            {saving ? 'Creating...' : 'Create Assessment'}
          </button>
        </div>
      )}

      {assessments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No assessments yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assessments.map(a => {
            const unit = units.find(u => u.id === a.unit_id);
            const subs = submissions.filter(s => s.assessment_id === a.id);
            const typeColors: Record<string, string> = {
              formative: 'bg-blue-100 text-blue-700',
              summative: 'bg-navy-100 text-navy-700',
              performance: 'bg-gold-100 text-gold-700',
            };
            return (
              <button
                key={a.id}
                onClick={() => setSelectedAssessmentId(a.id)}
                className="group rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[a.type]}`}>
                    {a.type}
                  </span>
                  <span className="text-xs text-slate-400">{a.questions.length} Qs</span>
                </div>
                <h4 className="text-sm font-bold text-navy-900 group-hover:text-gold-700">{a.title}</h4>
                <p className="mt-1 text-xs text-slate-500">{unit?.title ?? '—'}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
                  <User className="h-3.5 w-3.5" /> {subs.length} submission{subs.length !== 1 ? 's' : ''}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AssessmentDetail({
  assessment, unit, submissions, onBack, onSave, onDelete, onSubmit, saving,
}: {
  assessment: Assessment;
  unit: UbDUnit | undefined;
  submissions: AssessmentSubmission[];
  onBack: () => void;
  onSave: (a: Assessment) => void;
  onDelete: (id: string) => void;
  onSubmit: (a: Assessment, name: string, answers: Record<string, string>) => void;
  saving: boolean;
}) {
  const [showTakeForm, setShowTakeForm] = useState(false);
  const [respondentName, setRespondentName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  function addQuestion() {
    const newQ: AssessmentQuestion = {
      id: crypto.randomUUID(),
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      points: 1,
    };
    assessment.questions = [...assessment.questions, newQ];
    onSave(assessment);
  }

  function updateQuestion(idx: number, patch: Partial<AssessmentQuestion>) {
    const next = [...assessment.questions];
    next[idx] = { ...next[idx], ...patch };
    assessment.questions = next;
  }

  function deleteQuestion(idx: number) {
    assessment.questions = assessment.questions.filter((_, i) => i !== idx);
    onSave(assessment);
  }

  function handleTakeSubmit() {
    if (!respondentName.trim()) return;
    onSubmit(assessment, respondentName, answers);
    setRespondentName(''); setAnswers({}); setShowTakeForm(false);
  }

  const typeColors: Record<string, string> = {
    formative: 'bg-blue-100 text-blue-700',
    summative: 'bg-navy-100 text-navy-700',
    performance: 'bg-gold-100 text-gold-700',
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={onBack} className="font-semibold text-navy-700 hover:text-gold-700">All Assessments</button>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="text-slate-500">{assessment.title}</span>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[assessment.type]}`}>
                {assessment.type}
              </span>
              <span className="text-xs text-slate-400">{unit?.title ?? '—'}</span>
            </div>
            <input
              type="text"
              value={assessment.title}
              onChange={e => { assessment.title = e.target.value; }}
              onBlur={() => onSave(assessment)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xl font-bold text-navy-900 focus:border-gold-400 focus:outline-none"
            />
            <textarea
              value={assessment.description ?? ''}
              onChange={e => { assessment.description = e.target.value; }}
              onBlur={() => onSave(assessment)}
              placeholder="Assessment description..."
              className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-gold-400 focus:outline-none"
              rows={2}
            />
          </div>
          <button onClick={() => onDelete(assessment.id)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-navy-900">Questions ({assessment.questions.length})</h3>
          <button onClick={addQuestion} className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-3 py-2 text-xs font-semibold text-white hover:bg-navy-800">
            <Plus className="h-3.5 w-3.5" /> Add Question
          </button>
        </div>

        {assessment.questions.length === 0 ? (
          <p className="text-sm text-slate-400">No questions yet. Add one to build this assessment.</p>
        ) : (
          <div className="space-y-4">
            {assessment.questions.map((q, idx) => (
              <div key={q.id} className="rounded-xl border border-slate-100 bg-softgray p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-700">Q{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={q.type}
                      onChange={e => {
                        const type = e.target.value as AssessmentQuestion['type'];
                        updateQuestion(idx, { type, options: type === 'open_response' ? undefined : q.options ?? ['', '', '', ''] });
                      }}
                      className="rounded border border-slate-200 px-2 py-1 text-xs"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True / False</option>
                      <option value="open_response">Open Response</option>
                    </select>
                    <button onClick={() => deleteQuestion(idx)} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={q.question}
                  onChange={e => updateQuestion(idx, { question: e.target.value })}
                  onBlur={() => onSave(assessment)}
                  placeholder="Question text..."
                  className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none"
                />
                {q.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {(q.options ?? []).map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correct_answer === opt}
                          onChange={() => updateQuestion(idx, { correct_answer: opt })}
                          className="h-4 w-4"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={e => { const opts = [...(q.options ?? [])]; opts[oi] = e.target.value; updateQuestion(idx, { options: opts }); }}
                          onBlur={() => onSave(assessment)}
                          placeholder={`Option ${oi + 1}`}
                          className="flex-1 rounded border border-slate-200 px-2 py-1.5 text-sm"
                        />
                      </div>
                    ))}
                    <p className="text-xs text-slate-400">Select the radio button to mark the correct answer.</p>
                  </div>
                )}
                {q.type === 'true_false' && (
                  <div className="flex gap-3">
                    {['True', 'False'].map(opt => (
                      <label key={opt} className="flex items-center gap-1.5 text-sm">
                        <input type="radio" name={`tf-${q.id}`} checked={q.correct_answer === opt} onChange={() => updateQuestion(idx, { correct_answer: opt })} className="h-4 w-4" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-slate-500">Points:</label>
                  <input type="number" min={1} value={q.points} onChange={e => updateQuestion(idx, { points: parseInt(e.target.value) || 1 })} className="w-16 rounded border border-slate-200 px-2 py-1 text-xs" />
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => onSave(assessment)} disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Assessment'}
        </button>
      </div>

      {/* Take Assessment */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-navy-900">Take Assessment</h3>
          <button onClick={() => setShowTakeForm(!showTakeForm)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-navy-700 hover:border-gold-400">
            {showTakeForm ? 'Cancel' : 'Take Assessment'}
          </button>
        </div>
        {showTakeForm && (
          <div className="space-y-4">
            <input value={respondentName} onChange={e => setRespondentName(e.target.value)} placeholder="Your name" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-gold-400 focus:outline-none" />
            {assessment.questions.map((q, idx) => (
              <div key={q.id} className="rounded-lg border border-slate-100 p-3">
                <p className="mb-2 text-sm font-semibold text-navy-900">Q{idx + 1}. {q.question || '(empty question)'}</p>
                {q.type === 'multiple_choice' && (
                  <div className="space-y-1">
                    {(q.options ?? []).map((opt, oi) => (
                      <label key={oi} className="flex items-center gap-2 text-sm">
                        <input type="radio" name={`ans-${q.id}`} checked={answers[q.id] === opt} onChange={() => setAnswers({ ...answers, [q.id]: opt })} className="h-4 w-4" />
                        {opt || `(empty option ${oi + 1})`}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'true_false' && (
                  <div className="flex gap-3">
                    {['True', 'False'].map(opt => (
                      <label key={opt} className="flex items-center gap-1.5 text-sm">
                        <input type="radio" name={`ans-${q.id}`} checked={answers[q.id] === opt} onChange={() => setAnswers({ ...answers, [q.id]: opt })} className="h-4 w-4" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'open_response' && (
                  <textarea value={answers[q.id] ?? ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder="Your response..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={3} />
                )}
              </div>
            ))}
            <button onClick={handleTakeSubmit} disabled={!respondentName.trim() || assessment.questions.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:opacity-50">
              Submit Assessment
            </button>
          </div>
        )}
      </div>

      {/* Submissions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-base font-bold text-navy-900">Submissions ({submissions.length})</h3>
        {submissions.length === 0 ? (
          <p className="text-sm text-slate-400">No submissions yet.</p>
        ) : (
          <div className="space-y-2">
            {submissions.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-navy-500" />
                  <span className="text-sm font-semibold text-navy-900">{s.respondent_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {s.score !== null ? (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${(s.score ?? 0) >= 70 ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                      <Award className="h-3.5 w-3.5" /> {s.score}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Pending</span>
                  )}
                  <span className="text-xs text-slate-400">{new Date(s.submitted_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
