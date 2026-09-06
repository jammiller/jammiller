import { useState } from 'react';
import {
  Target,
  Users,
  Lightbulb,
  ArrowRight,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  Layers,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Cpu,
} from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'UbD-Driven',
    description: 'Every unit is engineered with Stage 1, 2, and 3 structure to build real workforce competencies.',
  },
  {
    icon: Users,
    title: 'Workforce-Ready',
    description: 'We prepare teams for advanced technology and machine-driven environments through structured learning.',
  },
  {
    icon: Lightbulb,
    title: 'Cognitive Load Optimized',
    description: 'Streamlined learning design that reduces cognitive overload and supports skill development.',
  },
];

const processStages = [
  {
    stage: 'Stage 1',
    title: 'Identify Desired Results',
    icon: Target,
    color: 'navy',
    points: [
      'Define transfer goals — what should learners be able to do in the real world?',
      'Establish essential questions that drive inquiry',
      'Determine enduring understandings that last beyond the unit',
    ],
    outcome: 'Clear learning outcomes tied to workforce competencies',
  },
  {
    stage: 'Stage 2',
    title: 'Determine Acceptable Evidence',
    icon: ClipboardCheck,
    color: 'gold',
    points: [
      'Design performance tasks that mirror real-world challenges',
      'Create rubrics that measure competency, not memorization',
      'Build formative assessments that guide learning in real time',
    ],
    outcome: 'Assessments that prove readiness, not just test scores',
  },
  {
    stage: 'Stage 3',
    title: 'Plan Learning Experiences',
    icon: GraduationCap,
    color: 'navy',
    points: [
      'Sequence lessons to build from knowledge to transfer',
      'Reduce cognitive overload with streamlined content design',
      'Embed technology tools that support, not distract',
    ],
    outcome: 'Learning experiences that build skills learners actually use',
  },
];

const beforeAfter = [
  {
    label: 'Traditional Curriculum',
    type: 'before' as const,
    items: [
      'Content-first design — cover the textbook',
      'Tests that measure memorization',
      'One-size-fits-all pacing',
      'Technology added as an afterthought',
      'Outcomes assumed, not engineered',
    ],
  },
  {
    label: 'DATAPULSE SOCIAL',
    type: 'after' as const,
    items: [
      'Outcomes-first design — start with the competency',
      'Assessments that measure real-world performance',
      'Cognitive load optimized for retention',
      'Technology built into the learning architecture',
      'Every unit engineered toward measurable outcomes',
    ],
  },
];

const metrics = [
  { value: '3', label: 'UbD Stages', sub: 'in every unit', icon: Layers },
  { value: '100%', label: 'Outcome-Driven', sub: 'no filler content', icon: Target },
  { value: '0', label: 'Cognitive Waste', sub: 'streamlined design', icon: Sparkles },
];

export function About() {
  const [activeStage, setActiveStage] = useState(0);
  const [hoveredCompare, setHoveredCompare] = useState<number | null>(null);

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-50 border border-navy-200 rounded-full mb-5">
            <span className="text-xs font-semibold text-navy-900 tracking-widest uppercase">About Us</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4 tracking-tight">
            We Engineer Learning Systems, Not Curriculum Packets
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            DATAPULSE SOCIAL engineers modern learning systems built on UbD principles, reducing cognitive overload and strengthening workforce competencies across every role. We don't create curriculum — we engineer structured learning infrastructure.
          </p>
        </div>

        {/* Metrics row */}
        <div className="mb-20 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
          {metrics.map((metric, i) => (
            <div
              key={metric.label}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-softgray p-6 text-center transition-all duration-500 hover:border-gold-300 hover:shadow-lg"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gold-100/50 blur-xl transition-all duration-500 group-hover:bg-gold-200/60 group-hover:scale-150" />
              <div className="relative z-10">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100 text-navy-900 transition-all duration-300 group-hover:bg-gold-100 group-hover:text-gold-700 group-hover:scale-110">
                  <metric.icon className="h-5 w-5" />
                </div>
                <p className="text-3xl font-bold text-navy-900">{metric.value}</p>
                <p className="mt-1 text-sm font-semibold text-navy-700">{metric.label}</p>
                <p className="text-xs text-slate-500">{metric.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Process Flow */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">How We Build</span>
            <h3 className="mt-2 text-2xl font-bold text-navy-900 tracking-tight">The UbD Process, Stage by Stage</h3>
            <p className="mt-3 text-sm text-slate-600 max-w-xl mx-auto">Click each stage to see what happens inside</p>
          </div>

          {/* Stage selector tabs */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {processStages.map((stage, i) => (
              <button
                key={i}
                onClick={() => setActiveStage(i)}
                className={`group flex items-center gap-3 rounded-2xl border px-5 py-4 transition-all duration-300 ${
                  activeStage === i
                    ? 'border-gold-400 bg-gold-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-navy-300 hover:bg-softgray'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                  activeStage === i
                    ? 'bg-gold-500 text-navy-950 scale-110'
                    : 'bg-navy-100 text-navy-900 group-hover:bg-navy-200'
                }`}>
                  <stage.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className={`text-xs font-semibold uppercase tracking-wider ${activeStage === i ? 'text-gold-700' : 'text-slate-400'}`}>{stage.stage}</p>
                  <p className={`text-sm font-bold ${activeStage === i ? 'text-navy-900' : 'text-slate-600'}`}>{stage.title}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Active stage detail card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-softgray p-8 sm:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold-100/40 blur-3xl" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-navy-950 shadow-lg">
                    {(() => {
                      const Icon = processStages[activeStage].icon;
                      return <Icon className="h-7 w-7" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">{processStages[activeStage].stage}</p>
                    <h4 className="text-xl font-bold text-navy-900">{processStages[activeStage].title}</h4>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="mb-6 flex gap-2">
                  {processStages.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        i <= activeStage ? 'bg-gold-500' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="rounded-2xl border border-gold-200 bg-gold-50/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">Outcome</p>
                  <p className="mt-1 text-sm font-medium text-navy-900">{processStages[activeStage].outcome}</p>
                </div>
              </div>

              <div className="space-y-3">
                {processStages[activeStage].points.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-gold-300 hover:shadow-sm"
                    style={{
                      opacity: 0,
                      animation: 'metric-in 0.5s ease-out forwards',
                      animationDelay: `${i * 100}ms`,
                    }}
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-900">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation arrows */}
            <div className="relative z-10 mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
                disabled={activeStage === 0}
                className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 transition-colors hover:text-gold-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowRight className="h-4 w-4 rotate-180" /> Previous
              </button>
              <span className="text-xs font-semibold text-slate-400">
                Step {activeStage + 1} of {processStages.length}
              </span>
              <button
                onClick={() => setActiveStage(Math.min(processStages.length - 1, activeStage + 1))}
                disabled={activeStage === processStages.length - 1}
                className="inline-flex items-center gap-2 text-sm font-semibold text-navy-700 transition-colors hover:text-gold-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Before vs After comparison */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">The Difference</span>
            <h3 className="mt-2 text-2xl font-bold text-navy-900 tracking-tight">What Changes When You Engineer Learning</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {beforeAfter.map((column, colIndex) => (
              <div
                key={colIndex}
                onMouseEnter={() => setHoveredCompare(colIndex)}
                onMouseLeave={() => setHoveredCompare(null)}
                className={`group rounded-3xl border p-7 transition-all duration-500 ${
                  column.type === 'after'
                    ? 'border-gold-300 bg-gold-50/50 hover:shadow-xl'
                    : 'border-slate-200 bg-slate-50 hover:shadow-md'
                }`}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    column.type === 'after' ? 'bg-gold-500 text-navy-950' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {column.type === 'after' ? <CheckCircle2 className="h-5 w-5" /> : <TrendingUp className="h-5 w-5 rotate-180" />}
                  </div>
                  <h4 className={`text-lg font-bold ${column.type === 'after' ? 'text-navy-900' : 'text-slate-600'}`}>
                    {column.label}
                  </h4>
                </div>
                <ul className="space-y-3">
                  {column.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm leading-relaxed transition-all duration-300"
                      style={{
                        transform: hoveredCompare === colIndex ? 'translateX(4px)' : 'translateX(0)',
                        transitionDelay: `${i * 50}ms`,
                      }}
                    >
                      {column.type === 'after' ? (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-gold-600" />
                      ) : (
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      )}
                      <span className={column.type === 'after' ? 'text-navy-800' : 'text-slate-500'}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Values cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="group relative overflow-hidden p-8 bg-softgray rounded-2xl border border-slate-200 hover:border-gold-300 hover:shadow-lg transition-all duration-500 text-center"
            >
              <div className="absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-gold-100/40 blur-xl transition-all duration-500 group-hover:bg-gold-200/50 group-hover:scale-150" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-gold-100 transition-colors border border-navy-200 group-hover:scale-110 group-hover:transition-transform duration-300">
                  <value.icon className="w-6 h-6 text-navy-900 group-hover:text-gold-700 transition-colors" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2 tracking-tight">{value.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
