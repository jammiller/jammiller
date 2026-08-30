import { useState } from 'react';
import {
  BookOpen, ClipboardList, BarChart3, Plus, Layers,
  ChevronRight, FileText, Target, CheckCircle2, Clock,
  TrendingUp, Award, ListChecks, Zap, Brain, Calendar, Phone, Check,
  Sparkles, ArrowRight, Activity, Users, GraduationCap,
  CircleDot, LayoutGrid, FolderTree,
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
    { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { key: 'builder', label: 'UbD Units', icon: BookOpen },
    { key: 'assessments', label: 'Assessments', icon: ClipboardList },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-softgray font-sans antialiased">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950 text-white backdrop-blur-xl">
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-40" />
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500 text-navy-950 shadow-lg shadow-gold-500/30">
              <Zap className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-wide leading-none">PulseOS</span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-gold-400/80">UbD Platform</span>
            </div>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  view === item.key ? 'bg-white/10 text-gold-400 shadow-sm ring-1 ring-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
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
    { label: 'Total Units', value: units.length, icon: BookOpen, gradient: 'from-navy-600 to-navy-800', glow: 'shadow-navy-500/20' },
    { label: 'Published', value: publishedCount, icon: CheckCircle2, gradient: 'from-emerald-500 to-emerald-700', glow: 'shadow-emerald-500/20' },
    { label: 'In Review', value: reviewCount, icon: Clock, gradient: 'from-amber-400 to-amber-600', glow: 'shadow-amber-500/20' },
    { label: 'Drafts', value: draftCount, icon: FileText, gradient: 'from-slate-400 to-slate-600', glow: 'shadow-slate-500/20' },
    { label: 'Lessons', value: lessons.length, icon: ListChecks, gradient: 'from-navy-500 to-navy-700', glow: 'shadow-navy-500/20' },
    { label: 'Assessments', value: assessments.length, icon: ClipboardList, gradient: 'from-gold-400 to-gold-600', glow: 'shadow-gold-500/20' },
    { label: 'Submissions', value: submissions.length, icon: TrendingUp, gradient: 'from-navy-600 to-navy-800', glow: 'shadow-navy-500/20' },
    { label: 'Avg Score', value: `${avgScore}%`, icon: Award, gradient: 'from-gold-400 to-gold-600', glow: 'shadow-gold-500/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-navy-950 p-8 sm:p-12">
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-30" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl animate-glow-pulse" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-navy-400/15 blur-3xl" />
        <div className="absolute right-1/3 top-0 h-32 w-32 rounded-full bg-gold-400/5 blur-2xl" />
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400">
            <Sparkles className="h-3.5 w-3.5" />
            Understanding by Design
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-5xl">
            PulseOS <span className="text-gold-400">Dashboard</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Build, assess, and measure curriculum with real instructional design structure.
            Drag and drop units, sequence lessons, and track UbD integrity — all in one workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('builder')}
              className="group inline-flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 transition-all hover:bg-gold-400 hover:shadow-xl hover:shadow-gold-500/40"
            >
              <BookOpen className="h-4 w-4" />
              Build a Unit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onNavigate('assessments')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
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
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
            style={{ animation: `metric-in 0.5s ease-out ${i * 0.06}s both` }}
          >
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-slate-50 transition-transform duration-500 group-hover:scale-[2.5]" />
            <div className="relative">
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.glow}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-bold text-navy-900">{stat.value}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-5 md:grid-cols-3">
        <ActionCard
          onClick={() => onNavigate('builder')}
          icon={BookOpen}
          title="Build a UbD Unit"
          desc="Drag and drop curriculum units with Stage 1, 2, and 3 structure."
          cta="Open Unit Builder"
          accent="navy"
        />
        <ActionCard
          onClick={() => onNavigate('assessments')}
          icon={ClipboardList}
          title="Create Assessments"
          desc="Build formative, summative, and performance assessments tied to units."
          cta="Open Assessment Engine"
          accent="gold"
        />
        <ActionCard
          onClick={() => onNavigate('analytics')}
          icon={BarChart3}
          title="View Analytics"
          desc="Track UbD integrity, completion, and performance across units."
          cta="Open Analytics"
          accent="navy"
        />
      </div>

      {/* Recent units */}
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-navy-700" />
            <h2 className="text-xl font-bold text-navy-900">Recent Units</h2>
          </div>
          <button onClick={() => onNavigate('builder')} className="text-sm font-semibold text-navy-700 hover:text-gold-700">
            View all
          </button>
        </div>
        {units.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50">
              <Target className="h-8 w-8 text-navy-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">No units yet. Create your first UbD unit to get started.</p>
            {courses.length > 0 && (
              <button
                onClick={() => onCreateUnit(courses[0].id)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy-800 hover:shadow-lg"
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
              const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
                draft: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
                in_review: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
                published: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
                archived: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
              };
              const sc = statusConfig[unit.status];
              return (
                <button
                  key={unit.id}
                  onClick={() => onSelectUnit(unit.id)}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all hover:-translate-y-1 hover:border-gold-300 hover:shadow-xl"
                >
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-navy-50 transition-transform duration-500 group-hover:scale-[2.5]" />
                  <div className="relative">
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 rounded-full ${sc.bg} px-3 py-1 text-xs font-semibold ${sc.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {unit.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-medium text-slate-400">v{unit.version}</span>
                    </div>
                    <h3 className="text-base font-bold text-navy-900 transition-colors group-hover:text-gold-700">{unit.title}</h3>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {program?.title ?? '—'} / {course?.title ?? '—'}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 transition-colors group-hover:text-gold-700">
                      Open unit <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pricing */}
      <div>
        <div className="mb-5 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-navy-700" />
          <h2 className="text-xl font-bold text-navy-900">Pricing</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
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

function ActionCard({
  onClick, icon: Icon, title, desc, cta, accent,
}: {
  onClick: () => void;
  icon: typeof BookOpen;
  title: string;
  desc: string;
  cta: string;
  accent: 'navy' | 'gold';
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 text-left transition-all hover:-translate-y-1.5 hover:border-gold-300 hover:shadow-2xl"
    >
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full transition-transform duration-500 group-hover:scale-[2.5] ${accent === 'gold' ? 'bg-gold-50' : 'bg-navy-50'}`} />
      <div className="relative">
        <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
          accent === 'gold'
            ? 'bg-gold-100 text-gold-700 group-hover:bg-gold-500 group-hover:text-navy-950 group-hover:shadow-lg group-hover:shadow-gold-500/30'
            : 'bg-navy-100 text-navy-700 group-hover:bg-navy-900 group-hover:text-white group-hover:shadow-lg group-hover:shadow-navy-500/30'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-navy-900">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 transition-colors group-hover:text-gold-700">
          {cta} <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </button>
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
    <div className={`relative overflow-hidden rounded-2xl border bg-white p-7 transition-all ${highlighted ? 'border-gold-400 shadow-xl ring-2 ring-gold-200' : 'border-slate-200 hover:shadow-lg'}`}>
      {highlighted && (
        <>
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold-50 blur-2xl" />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-4 py-1 text-xs font-bold text-navy-950 shadow-lg">
            Most popular
          </span>
        </>
      )}
      <div className="relative">
        <h3 className="text-lg font-bold text-navy-900">{name}</h3>
        <p className="mt-1 text-xs text-slate-500">{tagline}</p>
        <div className="mt-5 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-navy-900">{price}</span>
          {price !== 'Custom' && <span className="text-sm text-slate-500">/month</span>}
        </div>
        <ul className="mt-6 space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${highlighted ? 'bg-gold-100' : 'bg-green-50'}`}>
                <Check className={`h-3 w-3 ${highlighted ? 'text-gold-700' : 'text-green-600'}`} />
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <a
          href={ctaHref}
          target={ctaHref.startsWith('http') ? '_blank' : undefined}
          rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
            highlighted
              ? 'bg-gold-500 text-navy-950 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/30'
              : 'bg-navy-900 text-white hover:bg-navy-800 hover:shadow-lg'
          }`}
        >
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
