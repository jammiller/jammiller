import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What types of clients do you work with?',
    answer: 'We work with K-12 schools, higher education institutions, nonprofit organizations, faith-based communities, and corporate training teams — anyone who needs high-quality educational content built with care.',
  },
  {
    question: 'How long does a typical project take?',
    answer: 'Most projects range from 2 to 8 weeks depending on scope and complexity. We\'ll give you a clear timeline in your project proposal.',
  },
  {
    question: 'Do you work with existing content, or start from scratch?',
    answer: 'Both! We can build from the ground up or refresh and restructure content you already have.',
  },
  {
    question: 'What formats do you deliver in?',
    answer: 'We deliver in whatever format works for you — Google Docs, SCORM packages, LMS-ready files, PDFs, slide decks, and more.',
  },
  {
    question: 'How much does it cost?',
    answer: 'Every project is scoped individually. Reach out for a free discovery call and we\'ll put together a proposal tailored to your budget and goals.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-50 border border-navy-200 rounded-full mb-5">
            <span className="text-xs font-semibold text-navy-900 tracking-widest uppercase">FAQ</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4 tracking-tight">
            Questions? We've Got Answers.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? 'bg-softgray border-gold-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-navy-900 tracking-tight">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gold-500 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 pb-6 text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
