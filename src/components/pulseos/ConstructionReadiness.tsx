import { ArrowRight, Award, CheckCircle2, Clock3, HardHat } from 'lucide-react';

const programUrl = 'https://pulseosplatform.com/construction-workforce-readiness';
const navigation = [
  ['Program', 'program'],
  ["What You’ll Learn", 'learn'],
  ['Cost', 'cost'],
  ['Enroll', 'enroll'],
  ['Contact', 'contact'],
];
const subjects = [
  'Construction Safety', 'OSHA Fundamentals', 'Workplace Readiness',
  'Skilled Trades Foundations', 'Communication & Teamwork', 'Career Preparation',
];
const credentials = [
  'PulseOS Construction Workforce Readiness Certificate',
  'Digital Credential / Badge',
  'OSHA 10 Preparation Materials',
  'Employability and Workplace Skills Training',
  'Construction Safety Training',
  'Competency Transcript showing mastered skills',
  'Job Readiness Portfolio',
];
const enrollmentSteps = [
  'Complete the online enrollment form.',
  'Select the Construction Workforce Readiness pathway.',
  'Receive access to PulseOS.',
  'Complete learning activities and assessments.',
  'Earn your certificate and digital credential.',
];
const primaryButton = 'inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3 font-bold text-navy-950 transition hover:bg-gold-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-600';

export function ConstructionReadiness({ isHome = false }: { isHome?: boolean }) {
  return (
    <div className="min-h-screen bg-softgray text-navy-950 [&_a]:scroll-mt-6 [&_section]:scroll-mt-6">
      <a href="#main" className="sr-only focus:not-sr-only focus:block focus:bg-gold-500 focus:p-4">Skip to content</a>
      <ProgramHeader />

      <main id="main">
        <section id="program" className="bg-navy-950 text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-gold-300">Training & apprenticeship readiness</p>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Construction Workforce Readiness Program</h1>
              {isHome && <p className="mt-5 text-xl font-semibold text-gold-300">Readiness is proven by evidence, not course completion.</p>}
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">Get ready for a construction career in 12 weeks. Self-paced online learning, OSHA fundamentals, and a certificate that proves you are job-ready.</p>
              <p className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-200"><Award aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-gold-300" />Earn the PulseOS Construction Workforce Readiness Certificate + digital badge.</p>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <a href={isHome ? `${programUrl}#enroll` : '#enroll'} className={primaryButton}>{isHome ? 'Enroll Now' : 'Start Your Training'}<ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
                <span className="text-sm text-slate-200">Starting at $299 · Open year-round</span>
              </div>
            </div>
            <aside aria-labelledby="at-a-glance" className="rounded-3xl border border-white/20 bg-white/5 p-6 sm:p-8">
              <h2 id="at-a-glance" className="flex items-center gap-2 text-xl font-bold"><Clock3 aria-hidden="true" className="h-5 w-5 text-gold-300" />At a glance</h2>
              <dl className="mt-6 space-y-5 text-sm leading-6">
                {[
                  ['Duration', '12 weeks, self-paced — about 3–5 hours per week. Motivated learners can finish faster.'],
                  ['Certificate', 'PulseOS Construction Workforce Readiness Certificate + digital badge'],
                  ['Cost', 'Starting at $299'],
                  ['Who can join', 'High school students 16+, adult learners, entry-level workers, apprentices, career changers, veterans, job seekers. No previous construction experience required.'],
                  ['Enrollment', 'Open year-round'],
                ].map(([label, detail]) => <div key={label}><dt className="font-bold text-gold-300">{label}</dt><dd className="mt-1 text-slate-200">{detail}</dd></div>)}
              </dl>
              <a href={isHome ? programUrl : '#enroll'} className={`${primaryButton} mt-7 w-full`}>Start Your Training</a>
            </aside>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-12 px-5 py-12 sm:space-y-16 sm:px-8 sm:py-16">
          <section id="learn" aria-labelledby="learn-heading">
            <p className="text-sm font-bold uppercase tracking-widest text-gold-800">Build your foundation</p>
            <h2 id="learn-heading" className="mt-2 text-3xl font-bold">What you’ll learn</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{subjects.map((subject, index) => <li key={subject} className="rounded-2xl border border-slate-200 bg-white p-6"><span className="text-sm font-bold text-gold-800">0{index + 1}</span><h3 className="mt-3 text-lg font-bold">{subject}</h3></li>)}</ul>
          </section>

          <section aria-labelledby="receive-heading" className="rounded-3xl bg-white p-6 sm:p-8">
            <h2 id="receive-heading" className="text-3xl font-bold">What you’ll receive</h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2">{credentials.map((credential) => <li key={credential} className="flex gap-3 text-base leading-7"><CheckCircle2 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-gold-800" /><span>{credential}</span></li>)}</ul>
            <p className="mt-6 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600">OSHA 10 preparation materials support your learning; this program certificate is not an OSHA 10 course completion card.</p>
          </section>

          <section aria-labelledby="about-heading" className="max-w-4xl">
            <h2 id="about-heading" className="text-3xl font-bold">About the program</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">PulseOS is a competency-first workforce readiness program for construction. Readiness is proven by evidence, not course completion. Learners master 35 OSHA-aligned competencies — safety, technical, quality, productivity, leadership, and professional behaviors — and prove them through knowledge assessments, practical demonstrations, and supervisor observation.</p>
          </section>

          <section id="cost" aria-labelledby="cost-heading" className="rounded-3xl border border-gold-200 bg-gold-50 p-6 sm:p-8">
            <h2 id="cost-heading" className="text-3xl font-bold">Cost</h2>
            <p className="mt-4 text-lg leading-7">Starting at $299. Workforce, school, and employer discounts available.</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">{[
              ['Student enrollment', '$299'], ['Individual enrollment', '$399'],
              ['Employer-sponsored cohorts', 'Custom pricing'], ['School and workforce board partnerships', 'Custom pricing'],
            ].map(([label, price]) => <div key={label} className="rounded-2xl bg-white p-5"><dt className="text-sm font-semibold text-slate-600">{label}</dt><dd className="mt-2 text-2xl font-bold">{price}</dd></div>)}</dl>
          </section>

          <section id="enroll" aria-labelledby="enroll-heading">
            <h2 id="enroll-heading" className="text-3xl font-bold">How to enroll</h2>
            <p className="mt-4 text-lg text-slate-600">Open year-round. No previous construction experience required.</p>
            <p className="mt-4 text-base leading-7">For enrollment information, email <a href="mailto:james@datapulsesocial.com?subject=Construction%20Workforce%20Readiness%20enrollment" className="font-semibold underline underline-offset-4">james@datapulsesocial.com</a> or call <a href="tel:+18508309910" className="font-semibold underline underline-offset-4">850-830-9910</a>.</p>
            <ol className="mt-7 space-y-5">{enrollmentSteps.map((step, index) => <li key={step} className="flex items-center gap-4"><span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-950 text-sm font-bold text-gold-300">{index + 1}</span><span className="text-base leading-7">{step}</span></li>)}</ol>
          </section>
        </div>
      </main>

      <ProgramFooter />
    </div>
  );
}

export function ProgramHeader({ sectionBase = '' }: { sectionBase?: string }) {
  return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-8">
          <a href="/" aria-label="PulseOS home" className="flex items-center gap-3 text-xl font-extrabold tracking-tight">
            <span className="rounded-xl bg-navy-950 p-2 text-gold-400"><HardHat aria-hidden="true" className="h-6 w-6" /></span>
            PulseOS
          </a>
          <nav aria-label="Main navigation" className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold">
            {navigation.map(([label, id]) => <a key={id} href={`${sectionBase}#${id}`} className="underline-offset-4 hover:underline">{label}</a>)}
          </nav>
        </div>
      </header>
  );
}

export function ProgramFooter({ sectionBase = '' }: { sectionBase?: string }) {
  return (
      <footer id="contact" className="bg-navy-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Contact PulseOS</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-200">Questions about training, enrollment, or a school, workforce, or employer partnership? Get in touch.</p>
            <address className="mt-5 space-y-3 text-sm not-italic leading-6 text-slate-200">
              <p><a href="tel:+18508309910" className="underline underline-offset-4">850-830-9910</a></p>
              <p><a href="mailto:james@datapulsesocial.com" className="break-words underline underline-offset-4">james@datapulsesocial.com</a></p>
              <p>28839 Midnight Star Loop<br />Wesley Chapel, FL 33543</p>
            </address>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap content-start gap-x-6 gap-y-4 text-sm">
            <a href="/" className="underline underline-offset-4">Home</a>
            {navigation.map(([label, id]) => <a key={id} href={`${sectionBase}#${id}`} className="underline underline-offset-4">{label}</a>)}
            <a href={programUrl} className="basis-full underline underline-offset-4">Construction Workforce Readiness Program</a>
            <a href="/course-builder" className="underline underline-offset-4">Course Builder</a>
            <a href="/role-builder" className="underline underline-offset-4">Role Builder</a>
            <a href="/ojt-compliance" className="underline underline-offset-4">OJT &amp; Compliance</a>
            <a href="/competency-library" className="underline underline-offset-4">Competency Library</a>
          </nav>
        </div>
      </footer>
  );
}
