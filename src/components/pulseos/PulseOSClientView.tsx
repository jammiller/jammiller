import { useState } from 'react';
import {
  BookOpen, ChevronRight, ClipboardList, Award, User,
  CheckCircle2, Zap, LogOut, Calendar, Phone,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type {
  Program, Course, UbDUnit, Assessment, AssessmentSubmission,
} from '../../lib/pulseos-types';

interface Props {
  programs: Program[];
  courses: Course[];
  units: UbDUnit[];
  assessments: Assessment[];
  submissions: AssessmentSubmission[];
  userEmail: string | null;
  canClaimAdmin: boolean;
  onClaimAdmin: () => Promise<boolean>;
  onSignOut: () => void;
}

export function PulseOSClientView({
  programs, courses, units, assessments, submissions, userEmail, canClaimAdmin, onClaimAdmin, onSignOut,
}: Props) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [claimingAdmin, setClaimingAdmin] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  const publishedUnits = units.filter(u => u.status === 'published');
  const selectedUnit = publishedUnits.find(u => u.id === selectedUnitId) ?? null;
  const selectedAssessment = assessments.find(a => a.id === selectedAssessmentId) ?? null;

  if (selectedAssessment) {
    const unit = units.find(u => u.id === selectedAssessment.unit_id);
    return (
      <AssessmentTakeView
        assessment={selectedAssessment}
        unit={unit}
        onBack={() => setSelectedAssessmentId(null)}
      />
    );
  }

  if (selectedUnit) {
    const unitAssessments = assessments.filter(a => a.unit_id === selectedUnit.id);
    return (
      <UnitDetailView
        unit={selectedUnit}
        course={courses.find(c => c.id === selectedUnit.course_id) ?? null}
        program={programs.find(p => p.id === courses.find(c => c.id === selectedUnit.course_id)?.program_id) ?? null}
        assessments={unitAssessments}
        onBack={() => setSelectedUnitId(null)}
        onTakeAssessment={(id) => setSelectedAssessmentId(id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-softgray font-sans antialiased">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950 text-white backdrop-blur-xl">
        <div className="relative mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/30">
              <Zap className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide leading-none">PulseOS</span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400/80">Client Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userEmail && (
              <span className="hidden text-xs text-slate-400 sm:inline">{userEmail}</span>
            )}
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 rounded-2xl bg-navy-950 p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="relative">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Published Curriculum</h1>
            <p className="mt-2 text-sm text-slate-300">
              Browse published units and take assessments assigned to your courses.
            </p>
          </div>
        </div>

        {claimMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
            {claimMessage}
          </div>
        )}

        {canClaimAdmin && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-navy-900">Are you the workspace owner?</p>
              <p className="mt-1 text-xs text-slate-600">If this is the first PulseOS account, claim admin access to open your dashboard.</p>
            </div>
            <button
              onClick={async () => {
                setClaimingAdmin(true);
                const claimed = await onClaimAdmin();
                setClaimingAdmin(false);
                setClaimMessage(claimed ? 'Admin access enabled. Your dashboard is ready.' : 'Admin access is already assigned to the workspace owner.');
              }}
              disabled={claimingAdmin}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-navy-800 disabled:opacity-50"
            >
              {claimingAdmin ? 'Checking...' : 'Claim Admin Access'}
            </button>
          </div>
        )}

        {publishedUnits.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-16 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No published units available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publishedUnits.map(unit => {
              const course = courses.find(c => c.id === unit.course_id);
              const program = programs.find(p => p.id === course?.program_id);
              const unitAssessments = assessments.filter(a => a.unit_id === unit.id);
              return (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnitId(unit.id)}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl"
                >
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-navy-50 transition-transform duration-500 group-hover:scale-[2.5]" />
                  <div className="relative">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Published
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-navy-900 transition-colors group-hover:text-gold-700">{unit.title}</h3>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {program?.title ?? '—'} / {course?.title ?? '—'}
                    </p>
                    {unitAssessments.length > 0 && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-navy-700">
                        <ClipboardList className="h-3.5 w-3.5" /> {unitAssessments.length} assessment{unitAssessments.length !== 1 ? 's' : ''}
                      </div>
                    )}
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 transition-colors group-hover:text-gold-700">
                      View unit <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6">
          <p className="text-xs text-slate-500">PulseOS Client Portal — UbD-driven learning operations.</p>
          <div className="flex gap-3">
            <a href="https://calendar.app.google/8otEDsChvouw51aaA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-semibold text-navy-950 transition-colors hover:bg-gold-400">
              <Calendar className="h-3.5 w-3.5" /> Book a Demo
            </a>
            <a href="tel:8508309910" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-navy-900 transition-colors hover:border-gold-400">
              <Phone className="h-3.5 w-3.5" /> 850-830-9910
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function UnitDetailView({
  unit, course, program, assessments, onBack, onTakeAssessment,
}: {
  unit: UbDUnit;
  course: Course | null;
  program: Program | null;
  assessments: Assessment[];
  onBack: () => void;
  onTakeAssessment: (id: string) => void;
}) {
  return (
    <div className="min-h-screen bg-softgray font-sans antialiased">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950 text-white backdrop-blur-xl">
        <div className="relative mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-gold-400">
            <ChevronRight className="h-4 w-4 rotate-180" /> Back to Units
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Published
            </span>
            <span className="text-xs text-slate-400">v{unit.version}</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">{unit.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{program?.title ?? '—'} / {course?.title ?? '—'}</p>
          {unit.description && (
            <p className="mt-3 text-sm text-slate-600">{unit.description}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StageCard title="Stage 1 — Desired Results" data={unit.stage1} />
          <StageCard title="Stage 2 — Evidence" data={unit.stage2} />
          <StageCard title="Stage 3 — Learning Plan" data={unit.stage3} />
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-navy-900">Assessments</h2>
          {assessments.length === 0 ? (
            <p className="text-sm text-slate-400">No assessments available for this unit.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assessments.map(a => {
                const typeColors: Record<string, string> = {
                  formative: 'bg-blue-100 text-blue-700',
                  summative: 'bg-navy-100 text-navy-700',
                  performance: 'bg-gold-100 text-gold-700',
                };
                return (
                  <button
                    key={a.id}
                    onClick={() => onTakeAssessment(a.id)}
                    className="group rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[a.type]}`}>{a.type}</span>
                      <span className="text-xs text-slate-400">{a.questions.length} Qs</span>
                    </div>
                    <h4 className="text-sm font-bold text-navy-900 group-hover:text-gold-700">{a.title}</h4>
                    {a.description && <p className="mt-1 text-xs text-slate-500">{a.description}</p>}
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-navy-700 group-hover:text-gold-700">
                      Take assessment <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StageCard({ title, data }: { title: string; data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'string') return v.length > 0;
    return v !== null && v !== undefined;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-bold text-navy-900">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-xs text-slate-400">No content</p>
      ) : (
        <ul className="space-y-2">
          {entries.map(([key, val]) => (
            <li key={key} className="text-xs">
              <span className="font-semibold text-navy-700 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
              {Array.isArray(val) ? (
                <span className="text-slate-500">{val.length} item{val.length !== 1 ? 's' : ''}</span>
              ) : (
                <span className="text-slate-500">{String(val).slice(0, 80)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AssessmentTakeView({
  assessment, unit, onBack,
}: {
  assessment: Assessment;
  unit: UbDUnit | undefined;
  onBack: () => void;
}) {
  const [respondentName, setRespondentName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!respondentName.trim()) return;
    setSubmitting(true);
    let computedScore: number | null = null;
    const graded = assessment.questions.filter(q => q.type === 'multiple_choice' || q.type === 'true_false');
    if (graded.length > 0) {
      let correct = 0;
      for (const q of graded) {
        if (answers[q.id] === q.correct_answer) correct++;
      }
      computedScore = Math.round((correct / graded.length) * 100);
    }

    const { error } = await supabase.from('pulseos_assessment_submissions').insert({
      assessment_id: assessment.id,
      respondent_name: respondentName,
      answers,
      score: computedScore,
    });
    if (error) {
      setSubmitting(false);
      return;
    }
    await supabase.from('pulseos_analytics_events').insert({
      assessment_id: assessment.id,
      event_type: 'score',
      value: computedScore,
    });

    setScore(computedScore);
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-softgray px-4 font-sans antialiased">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-navy-900">Assessment Submitted!</h2>
          {score !== null && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-100 px-5 py-2 text-lg font-bold text-gold-700">
              <Award className="h-5 w-5" /> Score: {score}%
            </div>
          )}
          <button
            onClick={onBack}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Back to Units
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-softgray font-sans antialiased">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950 text-white backdrop-blur-xl">
        <div className="relative mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-gold-400">
            <ChevronRight className="h-4 w-4 rotate-180" /> Back
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-bold text-navy-900">{assessment.title}</h1>
          {unit && <p className="mt-1 text-sm text-slate-500">{unit.title}</p>}
          {assessment.description && <p className="mt-2 text-sm text-slate-600">{assessment.description}</p>}
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-semibold text-navy-700">Your Name</label>
          <input
            value={respondentName}
            onChange={e => setRespondentName(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none"
          />
        </div>

        {assessment.questions.length === 0 ? (
          <p className="text-sm text-slate-400">No questions in this assessment.</p>
        ) : (
          <div className="space-y-4">
            {assessment.questions.map((q, idx) => (
              <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="mb-3 text-sm font-semibold text-navy-900">Q{idx + 1}. {q.question || '(empty question)'}</p>
                {q.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {(q.options ?? []).map((opt, oi) => (
                      <label key={oi} className="flex items-center gap-2.5 text-sm">
                        <input type="radio" name={`ans-${q.id}`} checked={answers[q.id] === opt} onChange={() => setAnswers({ ...answers, [q.id]: opt })} className="h-4 w-4" />
                        {opt || `(empty option ${oi + 1})`}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'true_false' && (
                  <div className="flex gap-4">
                    {['True', 'False'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input type="radio" name={`ans-${q.id}`} checked={answers[q.id] === opt} onChange={() => setAnswers({ ...answers, [q.id]: opt })} className="h-4 w-4" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'open_response' && (
                  <textarea
                    value={answers[q.id] ?? ''}
                    onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                    placeholder="Your response..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    rows={4}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {assessment.questions.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={!respondentName.trim() || submitting}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/30 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        )}
      </main>
    </div>
  );
}
