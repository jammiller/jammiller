import { TrendingUp, CheckCircle, Building2 } from 'lucide-react';

const stats = [
  { value: '100+', label: 'Courses Built' },
  { value: '100%', label: 'Client Satisfaction' },
  { value: '4+', label: 'Industries Served' },
];

const industries = ['K-12', 'Higher Ed', 'Corporate Training', 'Faith-Based'];

const caseStudies = [
  {
    client: 'Northgate University',
    challenge: 'Needed a complete online curriculum rebuild for 12 graduate-level courses with outdated materials and low engagement.',
    solution: 'Redesigned all 12 courses with interactive modules, multimedia content, and competency-based assessments.',
    result: '87% course completion rate (up from 54%)',
  },
  {
    client: 'Riverside School District',
    challenge: 'Required 40+ K-12 courses built from scratch to meet new state standards within a single semester.',
    solution: 'Built standards-aligned curriculum with lesson plans, assessments, and teacher resources in 6 weeks.',
    result: 'Launched in 6 weeks, 100% standards compliance',
  },
  {
    client: 'Meridian Corporate Training',
    challenge: 'Existing employee onboarding program had low retention and couldn\'t scale across departments.',
    solution: 'Restructured into a modular, interactive learning path with role-specific tracks and assessments.',
    result: 'Onboarding time reduced by 40%, 95% learner satisfaction',
  },
];

export function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-softgray relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-light bg-grid" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-navy-50 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-50 border border-navy-200 rounded-full mb-5">
            <span className="text-xs font-semibold text-navy-900 tracking-widest uppercase">Portfolio</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4 tracking-tight">
            The Work Speaks for Itself
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A look at what we've built — and the impact it's made.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-8 bg-white rounded-2xl border border-slate-200 hover:shadow-md transition-all duration-300"
            >
              <p className="metric-value text-5xl font-bold text-navy-900 mb-2">{stat.value}</p>
              <p className="text-sm text-slate-500 tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {industries.map((industry) => (
            <span
              key={industry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-navy-900"
            >
              <Building2 className="w-3.5 h-3.5 text-gold-500" aria-hidden="true" />
              {industry}
            </span>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className="group p-7 bg-white rounded-2xl border border-slate-200 hover:border-gold-300 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 bg-navy-100 rounded-xl flex items-center justify-center border border-navy-200">
                  <TrendingUp className="w-5 h-5 text-navy-900" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 tracking-tight">{study.client}</h3>
              </div>

              <div className="space-y-4 flex-grow">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Challenge</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{study.challenge}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Solution</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{study.solution}</p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Result</p>
                    <p className="text-navy-900 text-sm font-semibold">{study.result}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
