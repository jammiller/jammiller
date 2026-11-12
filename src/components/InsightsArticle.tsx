import { useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Tag, User } from 'lucide-react';
import type { BlogPost } from '../lib/supabase';
import { blogPosts } from '../data/blogPosts';

const strategyCallUrl = 'https://calendar.app.google/8otEDsChvouw51aaA';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  'Curriculum Design': 'bg-navy-100 text-navy-700 border-navy-200',
  'Learning Science':  'bg-gold-100 text-gold-700 border-gold-200',
  'Assessment':        'bg-navy-100 text-navy-700 border-navy-200',
  'eLearning':         'bg-gold-100 text-gold-700 border-gold-200',
};

function categoryClass(category: string) {
  return CATEGORY_COLORS[category] ?? 'bg-slate-100 text-slate-600 border-slate-200';
}

export function InsightsArticle({ post }: { post: BlogPost }) {
  const canonical = `https://datapulsesocial.com/insights/${post.slug}`;

  useEffect(() => {
    document.title = `${post.title} | DATAPULSE SOCIAL`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', post.excerpt);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', canonical);
    document
      .querySelector('meta[property="og:type"]')
      ?.setAttribute('content', 'article');
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', post.title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', post.excerpt);
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute('content', canonical);
    document
      .querySelector('meta[name="twitter:title"]')
      ?.setAttribute('content', post.title);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute('content', post.excerpt);
  }, [post, canonical]);

  return (
    <div className="min-h-screen bg-softgray text-navy-900 antialiased">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="text-sm font-bold tracking-widest text-white">
            DATAPULSE SOCIAL
          </a>
          <a
            href="/insights"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/40"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All insights
          </a>
        </div>
      </header>

      <main id="top">
        <article className="bg-white">
          {post.cover_image_url && (
            <div className="relative h-64 overflow-hidden sm:h-80">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
            </div>
          )}

          <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${categoryClass(post.category)}`}
              >
                <Tag className="h-3 w-3" aria-hidden="true" />
                {post.category}
              </span>
              {post.published_at && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(post.published_at)}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {post.read_time_minutes} min read
              </span>
            </div>

            <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-navy-900 sm:text-4xl">
              {post.title}
            </h1>

            <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-7">
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-200 bg-navy-100">
                  <User className="h-5 w-5 text-navy-900" aria-hidden="true" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">{post.author_name}</p>
                {post.author_role && <p className="text-xs text-slate-500">{post.author_role}</p>}
              </div>
            </div>

            <div
              className="prose-blog"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-100 pt-7">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-12 rounded-2xl border border-navy-200 bg-navy-950 p-8 text-center text-white">
              <h2 className="text-2xl font-bold tracking-tight">
                Want this built into your program?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                We design curriculum, courses, and assessments that hold up in the real
                world — and we&apos;ll walk you through how on a short call.
              </p>
              <a
                href={strategyCallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 transition-colors hover:bg-gold-400"
              >
                Book a free consultation
              </a>
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t border-white/10 bg-navy-950 py-10 text-center">
        <p className="text-xs text-slate-400">DataPulseSocial.com | Curriculum &amp; Course Content Development</p>
      </footer>
    </div>
  );
}

export function findInsightBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
