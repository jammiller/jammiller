import {
  BarChart3, Target, CheckCircle2, AlertCircle, TrendingUp,
  Award, ClipboardList, Brain, Activity, Layers,
  FileText, Clock,
} from 'lucide-react';
import type {
  UbDUnit, Assessment, AssessmentSubmission,
} from '../../lib/pulseos-types';
import { ubdCompleteness } from '../../lib/pulseos-types';

interface Props {
  units: UbDUnit[];
  assessments: Assessment[];
  submissions: AssessmentSubmission[];
}

export function AnalyticsDashboard({ units, assessments, submissions }: Props) {
  const stage1Count = units.filter(u => ubdCompleteness(u).stage >= 1).length;
  const stage2Count = units.filter(u => ubdCompleteness(u).stage >= 2).length;
  const stage3Count = units.filter(u => ubdCompleteness(u).stage >= 3).length;

  const avgCompleteness = units.length > 0
    ? Math.round((stage1Count + stage2Count + stage3Count) / (units.length * 3) * 100)
    : 0;

  const scoredSubs = submissions.filter(s => s.score !== null);
  const avgScore = scoredSubs.length > 0
    ? Math.round(scoredSubs.reduce((acc, s) => acc + (s.score ?? 0), 0) / scoredSubs.length)
    : 0;
  const passRate = scoredSubs.length > 0
    ? Math.round(scoredSubs.filter(s => (s.score ?? 0) >= 70).length / scoredSubs.length * 100)
    : 0;

  const statusBreakdown = {
    draft: units.filter(u => u.status === 'draft').length,
    in_review: units.filter(u => u.status === 'in_review').length,
    published: units.filter(u => u.status === 'published').length,
    archived: units.filter(u => u.status === 'archived').length,
  };

  const unitAnalytics = units.map(unit => {
    const unitAssessments = assessments.filter(a => a.unit_id === unit.id);
    const unitSubs = submissions.filter(s => unitAssessments.some(a => a.id === s.assessment_id));
    const unitScored = unitSubs.filter(s => s.score !== null);
    const unitAvg = unitScored.length > 0
      ? Math.round(unitScored.reduce((acc, s) => acc + (s.score ?? 0), 0) / unitScored.length)
      : null;
    const comp = ubdCompleteness(unit);
    return { unit, assessmentCount: unitAssessments.length, submissionCount: unitSubs.length, avgScore: unitAvg, completeness: comp };
  });

  if (units.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50">
          <BarChart3 className="h-8 w-8 text-navy-300" />
        </div>
        <p className="text-sm font-medium text-slate-500">No data to analyze yet. Create UbD units and assessments to see analytics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-lg shadow-navy-500/20">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-navy-900">Analytics Dashboard</h2>
          <p className="text-xs text-slate-500">UbD integrity, assessment performance, and curriculum health</p>
        </div>
      </div>

      {/* Top metrics with circular rings */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RingMetricCard icon={Brain} label="UbD Integrity" value={avgCompleteness} suffix="%" gradient="navy" />
        <RingMetricCard icon={Award} label="Avg Score" value={avgScore} suffix="%" gradient="gold" />
        <RingMetricCard icon={CheckCircle2} label="Pass Rate" value={passRate} suffix="%" gradient="green" />
        <SimpleMetricCard icon={ClipboardList} label="Submissions" value={submissions.length} gradient="navy" />
      </div>

      {/* UbD Stage Coverage */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-navy-50 opacity-50" />
        <div className="relative">
          <div className="mb-5 flex items-center gap-2">
            <Target className="h-5 w-5 text-navy-700" />
            <h3 className="text-lg font-bold text-navy-900">UbD Stage Coverage</h3>
          </div>
          <p className="mb-5 text-xs text-slate-500">How many units have content in each UbD stage. This reveals where curriculum design is strong or incomplete.</p>
          <div className="space-y-5">
            {[
              { label: 'Stage 1 — Desired Results', count: stage1Count, total: units.length, gradient: 'from-navy-600 to-navy-800', bg: 'bg-navy-700' },
              { label: 'Stage 2 — Evidence', count: stage2Count, total: units.length, gradient: 'from-gold-400 to-gold-600', bg: 'bg-gold-500' },
              { label: 'Stage 3 — Learning Plan', count: stage3Count, total: units.length, gradient: 'from-emerald-500 to-emerald-700', bg: 'bg-green-500' },
            ].map(stage => {
              const pct = stage.total > 0 ? Math.round(stage.count / stage.total * 100) : 0;
              return (
                <div key={stage.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-navy-800">{stage.label}</span>
                    <span className="text-xs font-medium text-slate-500">{stage.count}/{stage.total} units ({pct}%)</span>
                  </div>
                  <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${stage.gradient} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Unit Status Breakdown */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-50 opacity-50" />
        <div className="relative">
          <div className="mb-5 flex items-center gap-2">
            <Layers className="h-5 w-5 text-navy-700" />
            <h3 className="text-lg font-bold text-navy-900">Unit Status Breakdown</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const configs: Record<string, { bg: string; text: string; icon: typeof Target; ring: string }> = {
                draft: { bg: 'bg-slate-50', text: 'text-slate-700', icon: FileText, ring: 'ring-slate-200' },
                in_review: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, ring: 'ring-amber-200' },
                published: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, ring: 'ring-green-200' },
                archived: { bg: 'bg-rose-50', text: 'text-rose-700', icon: AlertCircle, ring: 'ring-rose-200' },
              };
              const c = configs[status];
              return (
                <div key={status} className={`relative overflow-hidden rounded-xl ${c.bg} p-5 text-center ring-1 ${c.ring}`}>
                  <c.icon className={`mx-auto mb-2 h-5 w-5 ${c.text}`} />
                  <p className="text-3xl font-bold text-navy-900">{count}</p>
                  <p className="mt-0.5 text-xs font-medium capitalize text-slate-600">{status.replace('_', ' ')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-Unit Analytics Table */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-navy-50 opacity-50" />
        <div className="relative">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-navy-700" />
            <h3 className="text-lg font-bold text-navy-900">Per-Unit Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Unit</th>
                  <th className="pb-3 pr-4 font-semibold">UbD</th>
                  <th className="pb-3 pr-4 font-semibold">Assessments</th>
                  <th className="pb-3 pr-4 font-semibold">Submissions</th>
                  <th className="pb-3 pr-4 font-semibold">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {unitAnalytics.map(({ unit, assessmentCount, submissionCount, avgScore, completeness }) => (
                  <tr key={unit.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="py-3.5 pr-4">
                      <div className="font-semibold text-navy-900">{unit.title}</div>
                      <div className="text-xs text-slate-400 capitalize">{unit.status.replace('_', ' ')}</div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map(s => (
                          <div key={s} className={`h-2.5 w-6 rounded-full transition-colors ${s <= completeness.stage ? 'bg-gold-500' : 'bg-slate-200'}`} />
                        ))}
                        <span className="ml-1.5 text-xs font-medium text-slate-500">{completeness.stage}/3</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600">{assessmentCount}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{submissionCount}</td>
                    <td className="py-3.5 pr-4">
                      {avgScore !== null ? (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${avgScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                          <Award className="h-3 w-3" /> {avgScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* UbD Health Alerts */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-50 opacity-50" />
        <div className="relative">
          <div className="mb-5 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-bold text-navy-900">UbD Health Alerts</h3>
          </div>
          <p className="mb-5 text-xs text-slate-500">Units with incomplete UbD stages. These need attention before publishing.</p>
          <div className="space-y-3">
            {units.filter(u => ubdCompleteness(u).stage < 3).length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-semibold text-green-700">All units have complete UbD stages.</p>
              </div>
            ) : (
              units.filter(u => ubdCompleteness(u).stage < 3).map(unit => {
                const comp = ubdCompleteness(unit);
                return (
                  <div key={unit.id} className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-50/80">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{unit.title}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {comp.details.map((d, i) => (
                          <span key={i} className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RingMetricCard({
  icon: Icon, label, value, suffix, gradient,
}: {
  icon: typeof BarChart3;
  label: string;
  value: number;
  suffix: string;
  gradient: 'navy' | 'gold' | 'green';
}) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const strokeMap: Record<string, string> = {
    navy: 'stroke-navy-600',
    gold: 'stroke-gold-500',
    green: 'stroke-green-500',
  };
  const iconBgMap: Record<string, string> = {
    navy: 'bg-navy-100 text-navy-700',
    gold: 'bg-gold-100 text-gold-700',
    green: 'bg-green-100 text-green-700',
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBgMap[gradient]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy-900">{value}{suffix}</p>
            <p className="text-xs font-medium text-slate-500">{label}</p>
          </div>
        </div>
        <div className="relative h-20 w-20">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="5" className="stroke-slate-100" />
            <circle
              cx="32" cy="32" r={radius} fill="none" strokeWidth="5"
              strokeLinecap="round"
              className={`${strokeMap[gradient]} transition-all duration-700`}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-navy-700">
            {value}%
          </span>
        </div>
      </div>
    </div>
  );
}

function SimpleMetricCard({
  icon: Icon, label, value, gradient,
}: {
  icon: typeof BarChart3;
  label: string;
  value: number;
  gradient: 'navy';
}) {
  const gradMap: Record<string, string> = {
    navy: 'from-navy-600 to-navy-800',
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-slate-50 transition-transform duration-500 group-hover:scale-[2.5]" />
      <div className="relative">
        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradMap[gradient]} text-white shadow-md`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-2xl font-bold text-navy-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
