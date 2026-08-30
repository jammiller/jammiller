import { useState } from 'react';
import {
  BookOpen, ClipboardList, BarChart3, Plus, Layers,
  ChevronRight, FileText, Target, CheckCircle2, Clock,
  TrendingUp, Award, ListChecks, Zap, Brain, Calendar, Phone, Check,
  Sparkles, ArrowRight, Activity, Users, GraduationCap,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type {
  Program, Course, UbDUnit, Lesson, Assessment, AssessmentSubmission,
} from '../lib/pulseos-types';
import { usePulseOSData } from './pulseos/usePulseOSData';
import { UnitBuilder } from './pulseos/UnitBuilder';
import { AssessmentEngine } from './pulseos/AssessmentEngine';
import { AnalyticsDashboard } from './pulseos/AnalyticsDashboard';

type View = 'dashboard' | 'builder' | 'assessments' | 'analytics';

export function PulseOS() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const {
    programs, courses, units, lessons, assessments, submissions,
    loading, error, refetch,
  } = usePulseOSData();

  const selectedUnit = units.find(u => u.id === selectedUnitId) ?? null;

  const handleSelectUnit = (id: string) => {
    setSelectedUnitId(id);
    setView('builder');
  };

  const handleCreateUnit = async (courseId: string) => {
    const { data, error: insertError } = await supabase
      .from('pulseos_units')
      .insert({
        course_id: courseId,
        title: 'New UbD Unit',
        description: '',
        stage1: { big_ideas: [], understandings: [], essential_questions: [], knowledge_skills: [], standards: [] },
        stage2: { performance_tasks: [], summative_assessments: [], formative_checks: [], rubrics: [] },
        stage3: { learning_experiences: [], sequence: [], resources: [], differentiation_notes: '' },
        status: 'draft',
        version: 1,
      })
      .select()
      .single();
    if (insertError) { console.error(insertError); return; }
    await refetch();
    if (data) handleSelectUnit(data.id);
  };

  const navItems: { key: View; label: string; icon: typeof BookOpen }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: Layers },
    { key: 'builder', label: 'UbD Units', icon: BookOpen },
    { key: 'assessments', label: 'Assessments', icon: ClipboardList },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-softgray font-sans antialiased">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950 text-white backdrop-blur-xl">
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-40" />
        <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/30">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold tracking-wide">PulseOS</span>
            <span className="ml-2 hidden rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-400 sm:inline">UbD Platform</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  view === item.key ? 'bg-white/10 text-gold-400 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </nav>
        </div>
        {/* Mobile nav */}
        <nav className="relative flex items-center gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                view === item.key ? 'bg-white/10 text-gold-400' : 'text-slate-300'
              }`}
            >
              <item.icon className="h-3.5 w-3.5" /> {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-navy-200 border-t-gold-500" />
            <p className="mt-4 text-sm text-slate-500">Loading your curriculum workspace...</p>
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}
        {!loading && !error && view === 'dashboard' && (
          <Dashboard
            programs={programs}
            courses={courses}
            units={units}
            lessons={lessons}
            assessments={assessments}
            submissions={submissions}
            onSelectUnit={handleSelectUnit}
            onCreateUnit={handleCreateUnit}
            onNavigate={setView}
          />
        )}
        {!loading && !error && view === 'builder' && (
          <UnitBuilder
            units={units}
            courses={courses}
            programs={programs}
            lessons={lessons}
            selectedUnit={selectedUnit}
            onSelectUnit={setSelectedUnitId}
            onRefetch={refetch}
          />
        )}
        {!loading && !error && view === 'assessments' && (
          <AssessmentEngine
            assessments={assessments}
            units={units}
            submissions={submissions}
            courses={courses}
            onRefetch={refetch}
          />
        )}
        {!loading && !error && view === 'analytics' && (
          <AnalyticsDashboard
            units={units}
            assessments={assessments}
            submissions={submissions}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6">
          <p className="text-xs text-slate-500">PulseOS — UbD-driven learning operations. Built for real instructional design.</p>
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

function Dashboard({
  programs, courses, units, lessons, assessments, submissions,
  onSelectUnit, onCreateUnit, onNavigate,
}: {
  programs: Program[];
  courses: Course[];
  units: UbDUnit[];
  lessons: Lesson[];
  assessments: Assessment[];
  submissions: AssessmentSubmission[];
  onSelectUnit: (id: string) => void;
  onCreateUnit: (courseId: string) => void;
  onNavigate: (v: View) => void;
}) {
  const publishedCount = units.filter(u => u.status === 'published').length;
  const draftCount = units.filter(u => u.status === 'draft').length;
  const reviewCount = units.filter(u => u.status === 'in_review').length;
  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.score ?? 0), 0) / submissions.length)
    : 0;

  const stats = [
    { label: 'Total Units', value: units.length, icon: BookOpen, color: 'navy', gradient: 'from-navy-600 to-navy-800' },
    { label: 'Published', value: publishedCount, icon: CheckCircle2, color: 'green', gradient: 'from-emerald-500 to-emerald-700' },
    { label: 'In Review', value: reviewCount, icon: Clock, color: 'amber', gradient: 'from-amber-400 to-amber-600' },
    { label: 'Drafts', value: draftCount, icon: FileText, color: 'slate', gradient: 'from-slate-400 to-slate-600' },
    { label: 'Lessons', value: lessons.length, icon: ListChecks, color: 'navy', gradient: 'from-navy-500 to-navy-700' },
    { label: 'Assessments', value: assessments.length, icon: ClipboardList, color: 'gold', gradient: 'from-gold-400 to-gold-600' },
    { label: 'Submissions', value: submissions.length, icon: TrendingUp, color: 'navy', gradient: 'from-navy-600 to-navy-800' },
    { label: 'Avg Score', value: `${avgScore}%`, icon: Award, color: 'gold', gradient: 'from-gold-400 to-gold-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-navy-950 p-8 sm:p-10">
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-navy-400/10 blur-3xl" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gold-400">
            <Sparkles className="h-3.5 w-3.5" />
            Understanding by Design
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">PulseOS Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Build, assess, and measure curriculum with real instructional design structure.
            Drag and drop units, sequence lessons, and track UbD integrity — all in one workspace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('builder')}
              className="group inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/30"
            >
              <BookOpen className="h-4 w-4" />
              Build a Unit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => onNavigate('assessments')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              <ClipboardList className="h-4 w-4" />
              Create Assessments
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ animation: `metric-in 0.5s ease-out ${i * 0.05}s both` }}
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-md`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => onNavigate('builder')}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl"
        >
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-navy-50 transition-transform group-hover:scale-150" />
          <div className="relative">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-100 text-navy-700 transition-colors group-hover:bg-gold-100 group-hover:text-gold-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-navy-900">Build a UbD Unit</h3>
            <p className="mt-1 text-sm text-slate-500">Drag and drop curriculum units with Stage 1, 2, and 3 structure.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:text-gold-700">
              Open Unit Builder <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('assessments')}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl"
        >
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold-50 transition-transform group-hover:scale-150" />
          <div className="relative">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-100 text-navy-700 transition-colors group-hover:bg-gold-100 group-hover:text-gold-700">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-navy-900">Create Assessments</h3>
            <p className="mt-1 text-sm text-slate-500">Build formative, summative, and performance assessments tied to units.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:text-gold-700">
              Open Assessment Engine <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('analytics')}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl"
        >
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-navy-50 transition-transform group-hover:scale-150" />
          <div className="relative">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-100 text-navy-700 transition-colors group-hover:bg-gold-100 group-hover:text-gold-700">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-navy-900">View Analytics</h3>
            <p className="mt-1 text-sm text-slate-500">Track UbD integrity, completion, and performance across units.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:text-gold-700">
              Open Analytics <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </button>
      </div>

      {/* Recent units */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900">Recent Units</h2>
          <button onClick={() => onNavigate('builder')} className="text-sm font-semibold text-navy-700 hover:text-gold-700">
            View all
          </button>
        </div>
        {units.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Target className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No units yet. Create your first UbD unit to get started.</p>
            {courses.length > 0 && (
              <button
                onClick={() => onCreateUnit(courses[0].id)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
              >
                <Plus className="h-4 w-4" /> Create Unit
              </button>
            )}
            {courses.length === 0 && (
              <p className="mt-2 text-xs text-slate-400">Create a program and course first in the Unit Builder.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {units.slice(0, 6).map(unit => {
              const course = courses.find(c => c.id === unit.course_id);
              const program = programs.find(p => p.id === course?.program_id);
              const statusColors: Record<string, string> = {
                draft: 'bg-slate-100 text-slate-600',
                in_review: 'bg-amber-100 text-amber-700',
                published: 'bg-green-100 text-green-700',
                archived: 'bg-rose-100 text-rose-700',
              };
              return (
                <button
                  key={unit.id}
                  onClick={() => onSelectUnit(unit.id)}
                  className="group rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[unit.status]}`}>
                      {unit.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">v{unit.version}</span>
                  </div>
                  <h3 className="text-sm font-bold text-navy-900 group-hover:text-gold-700">{unit.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {program?.title ?? '—'} / {course?.title ?? '—'}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pricing */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-navy-900">Pricing</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <PricingCard
            name="Educator"
            price="$0"
            tagline="For individual teachers and instructional designers"
            features={[
              'Unlimited UbD units',
              'Stage 1, 2, 3 editor',
              'Assessment engine',
              'Basic analytics',
              'Shared workspace',
            ]}
            ctaLabel="Start free"
            ctaHref="https://calendar.app.google/8otEDsChvouw51aaA"
            highlighted={false}
          />
          <PricingCard
            name="Team"
            price="$49"
            tagline="For schools and small teams building curriculum together"
            features={[
              'Everything in Educator',
              'Program and course hierarchy',
              'Workflow and review status',
              'UbD integrity scoring',
              'Per-unit analytics dashboard',
              'Priority support',
            ]}
            ctaLabel="Book a demo"
            ctaHref="https://calendar.app.google/8otEDsChvouw51aaA"
            highlighted={true}
          />
          <PricingCard
            name="District"
            price="Custom"
            tagline="For districts scaling aligned curriculum across schools"
            features={[
              'Everything in Team',
              'Multi-school programs',
              'District-level analytics',
              'UbD alignment reporting',
              'Custom onboarding',
              'Dedicated support',
            ]}
            ctaLabel="Contact us"
            ctaHref="tel:8508309910"
            highlighted={false}
          />
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  name, price, tagline, features, ctaLabel, ctaHref, highlighted,
}: {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted: boolean;
}) {
  return (
    <div className={`relative rounded-2xl border bg-white p-6 transition-all ${highlighted ? 'border-gold-400 shadow-lg ring-2 ring-gold-200' : 'border-slate-200'}`}>
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-navy-950">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-bold text-navy-900">{name}</h3>
      <p className="mt-1 text-xs text-slate-500">{tagline}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-navy-900">{price}</span>
        {price !== 'Custom' && <span className="text-sm text-slate-500">/month</span>}
      </div>
      <ul className="mt-5 space-y-2.5">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            {feature}
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        target={ctaHref.startsWith('http') ? '_blank' : undefined}
        rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
          highlighted
            ? 'bg-gold-500 text-navy-950 hover:bg-gold-400'
            : 'bg-navy-900 text-white hover:bg-navy-800'
        }`}
      >
        {ctaLabel}
      </a>
    </div>
  );
}
