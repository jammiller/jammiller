import {
  BarChart3, Target, CheckCircle2, AlertCircle, TrendingUp,
  Award, ClipboardList, Brain,
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
  // UbD integrity metrics
  const stage1Count = units.filter(u => {
    const c = ubdCompleteness(u);
    return c.stage >= 1;
  }).length;
  const stage2Count = units.filter(u => {
    const c = ubdCompleteness(u);
    return c.stage >= 2;
  }).length;
  const stage3Count = units.filter(u => {
    const c = ubdCompleteness(u);
    return c.stage >= 3;
  }).length;

  const avgCompleteness = units.length > 0
    ? Math.round((stage1Count + stage2Count + stage3Count) / (units.length * 3) * 100)
    : 0;

  // Assessment performance
  const scoredSubs = submissions.filter(s => s.score !== null);
  const avgScore = scoredSubs.length > 0
    ? Math.round(scoredSubs.reduce((acc, s) => acc + (s.score ?? 0), 0) / scoredSubs.length)
    : 0;
  const passRate = scoredSubs.length > 0
    ? Math.round(scoredSubs.filter(s => (s.score ?? 0) >= 70).length / scoredSubs.length * 100)
    : 0;

  // Status breakdown
  const statusBreakdown = {
    draft: units.filter(u => u.status === 'draft').length,
    in_review: units.filter(u => u.status === 'in_review').length,
    published: units.filter(u => u.status === 'published').length,
    archived: units.filter(u => u.status === 'archived').length,
  };

  // Per-unit analytics
  const unitAnalytics = units.map(unit => {
    const unitAssessments = assessments.filter(a => a.unit_id === unit.id);
    const unitSubs = submissions.filter(s => unitAssessments.some(a => a.id === s.assessment_id));
    const unitScored = unitSubs.filter(s => s.score !== null);
    const unitAvg = unitScored.length > 0
      ? Math.round(unitScored.reduce((acc, s) => acc + (s.score ?? 0), 0) / unitScored.length)
      : null;
    const comp = ubdCompleteness(unit);
    return {
      unit,
      assessmentCount: unitAssessments.length,
      submissionCount: unitSubs.length,
      avgScore: unitAvg,
      completeness: comp,
    };
  });

  if (units.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <BarChart3 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">No data to analyze yet. Create UbD units and assessments to see analytics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-navy-900">Analytics Dashboard</h2>

      {/* Top metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard icon={Brain} label="UbD Integrity" value={`${avgCompleteness}%`} color="navy" />
        <MetricCard icon={Award} label="Avg Score" value={`${avgScore}%`} color="gold" />
        <MetricCard icon={CheckCircle2} label="Pass Rate" value={`${passRate}%`} color="green" />
        <MetricCard icon={ClipboardList} label="Total Submissions" value={String(submissions.length)} color="navy" />
      </div>

      {/* UbD Stage Coverage */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-navy-700" />
          <h3 className="text-base font-bold text-navy-900">UbD Stage Coverage</h3>
        </div>
        <p className="mb-4 text-xs text-slate-500">How many units have content in each UbD stage. This reveals where curriculum design is strong or incomplete.</p>
        <div className="space-y-4">
          {[
            { label: 'Stage 1 — Desired Results', count: stage1Count, total: units.length, color: 'bg-navy-700' },
            { label: 'Stage 2 — Evidence', count: stage2Count, total: units.length, color: 'bg-gold-500' },
            { label: 'Stage 3 — Learning Plan', count: stage3Count, total: units.length, color: 'bg-green-500' },
          ].map(stage => {
            const pct = stage.total > 0 ? Math.round(stage.count / stage.total * 100) : 0;
            return (
              <div key={stage.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-navy-800">{stage.label}</span>
                  <span className="text-xs text-slate-500">{stage.count}/{stage.total} units ({pct}%)</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${stage.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unit Status Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-base font-bold text-navy-900">Unit Status Breakdown</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(statusBreakdown).map(([status, count]) => {
            const colors: Record<string, string> = {
              draft: 'bg-slate-100 text-slate-700',
              in_review: 'bg-amber-100 text-amber-700',
              published: 'bg-green-100 text-green-700',
              archived: 'bg-rose-100 text-rose-700',
            };
            return (
              <div key={status} className={`rounded-xl p-4 text-center ${colors[status]}`}>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs capitalize">{status.replace('_', ' ')}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Unit Analytics Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-navy-700" />
          <h3 className="text-base font-bold text-navy-900">Per-Unit Performance</h3>
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
                <tr key={unit.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-navy-900">{unit.title}</div>
                    <div className="text-xs text-slate-400 capitalize">{unit.status.replace('_', ' ')}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map(s => (
                        <div key={s} className={`h-2 w-5 rounded-full ${s <= completeness.stage ? 'bg-gold-500' : 'bg-slate-200'}`} />
                      ))}
                      <span className="ml-1 text-xs text-slate-500">{completeness.stage}/3</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{assessmentCount}</td>
                  <td className="py-3 pr-4 text-slate-600">{submissionCount}</td>
                  <td className="py-3 pr-4">
                    {avgScore !== null ? (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${avgScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
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

      {/* UbD Health Alerts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <h3 className="text-base font-bold text-navy-900">UbD Health Alerts</h3>
        </div>
        <p className="mb-4 text-xs text-slate-500">Units with incomplete UbD stages. These need attention before publishing.</p>
        <div className="space-y-2">
          {units.filter(u => ubdCompleteness(u).stage < 3).length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" /> All units have complete UbD stages.
            </div>
          ) : (
            units.filter(u => ubdCompleteness(u).stage < 3).map(unit => {
              const comp = ubdCompleteness(unit);
              return (
                <div key={unit.id} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{unit.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {comp.details.map((d, i) => (
                        <span key={i} className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{d}</span>
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
  );
}

function MetricCard({
  icon: Icon, label, value, color,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    navy: 'bg-navy-100 text-navy-700',
    gold: 'bg-gold-100 text-gold-700',
    green: 'bg-green-100 text-green-700',
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
