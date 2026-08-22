import { Target, Users, Lightbulb } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Purposeful',
    description: 'Every decision we make is driven by your learning outcomes.',
  },
  {
    icon: Users,
    title: 'Collaborative',
    description: 'We work with you, not just for you.',
  },
  {
    icon: Lightbulb,
    title: 'Transformative',
    description: 'We measure success by the lives your courses change.',
  },
];

export function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-50 border border-navy-200 rounded-full mb-5">
            <span className="text-xs font-semibold text-navy-900 tracking-widest uppercase">About Us</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4 tracking-tight">
            We're Educators Who Build Things
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            DATAPULSE SOCIAL was founded with one mission: to make exceptional learning accessible, structured, and scalable. We believe great learning doesn't happen by accident — it's intentionally designed.
          </p>
        </div>

        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-slate-600 leading-relaxed mb-6">
            We design learning experiences that are purposeful, collaborative, and transformative. Our team combines deep expertise in instructional design, content strategy, and educational technology to help you build programs that work.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Whether you're launching your first online course or overhauling a full curriculum, we bring the structure, creativity, and dedication your project deserves.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="group p-8 bg-softgray rounded-2xl border border-slate-200 hover:border-gold-300 hover:shadow-md transition-all duration-300 text-center"
            >
              <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-navy-200 transition-colors border border-navy-200 group-hover:scale-105 group-hover:transition-transform">
                <value.icon className="w-6 h-6 text-navy-900" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2 tracking-tight">{value.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
