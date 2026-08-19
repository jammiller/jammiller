import { useState, useCallback, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Tag,
  X,
  ArrowRight,
  BookOpen,
  ChevronRight,
  User,
} from 'lucide-react';
import type { BlogPost } from '../lib/supabase';
import { blogPosts } from '../data/blogPosts';

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

function PostModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/20 my-4 overflow-hidden">
        {post.cover_image_url && (
          <div className="relative h-64 sm:h-80 overflow-hidden">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          </div>
        )}

        <button
          onClick={onClose}
          aria-label="Close article"
          className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center border border-slate-200 text-slate-500 hover:text-navy-900 hover:border-gold-300 transition-all duration-200 shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 sm:p-10">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${categoryClass(post.category)}`}>
              <Tag className="w-3 h-3" aria-hidden="true" />
              {post.category}
            </span>
            {post.published_at && (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                {formatDate(post.published_at)}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {post.read_time_minutes} min read
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 leading-tight tracking-tight mb-5">
            {post.title}
          </h2>

          <div className="flex items-center gap-3 pb-7 mb-7 border-b border-slate-100">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt={post.author_name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-navy-100 border border-navy-200 flex items-center justify-center">
                <User className="w-5 h-5 text-navy-900" aria-hidden="true" />
              </div>
            )}
            <div>
              <p className="text-slate-900 text-sm font-semibold">{post.author_name}</p>
              {post.author_role && (
                <p className="text-slate-500 text-xs">{post.author_role}</p>
              )}
            </div>
          </div>

          <div
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-7 border-t border-slate-100">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate-100 text-slate-500 text-xs rounded-lg border border-slate-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-gold-300 hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden h-48 flex-shrink-0">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-slate-300" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
        <span className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${categoryClass(post.category)}`}>
          {post.category}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
          {post.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              {formatDate(post.published_at)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {post.read_time_minutes} min
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight mb-2.5 group-hover:text-navy-900 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 flex-1 mb-5">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt={post.author_name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-navy-100 border border-navy-200 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-navy-900" aria-hidden="true" />
              </div>
            )}
            <span className="text-slate-500 text-xs">{post.author_name}</span>
          </div>

          <button
            onClick={onClick}
            className="group/btn flex items-center gap-1.5 text-navy-900 hover:text-gold-600 text-xs font-semibold transition-colors"
            aria-label={`Read article: ${post.title}`}
          >
            Read Article
            <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function Blog() {
  const [activePost, setActivePost] = useState<BlogPost | null>(null);
  const [showAll, setShowAll] = useState(false);

  const posts = blogPosts;

  const closeModal = useCallback(() => setActivePost(null), []);

  const visible = showAll ? posts : posts.slice(0, 3);

  return (
    <>
      <section id="blog" className="py-24 bg-softgray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-50 border border-navy-200 rounded-full mb-5">
              <BookOpen className="w-3.5 h-3.5 text-navy-900" aria-hidden="true" />
              <span className="text-xs font-semibold text-navy-900 tracking-widest uppercase">Insights & Resources</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4 tracking-tight">
              From Our Learning Lab
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Practical strategies, research summaries, and design frameworks from
              our curriculum development team — written for educators and instructional designers.
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-slate-400 py-16">No posts yet — check back soon.</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map((post) => (
                  <PostCard key={post.id} post={post} onClick={() => setActivePost(post)} />
                ))}
              </div>

              {posts.length > 3 && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-white hover:bg-softgray text-navy-900 font-semibold rounded-lg border border-slate-200 hover:border-gold-300 transition-all duration-200 text-sm shadow-sm"
                  >
                    {showAll ? 'Show Less' : `View All ${posts.length} Articles`}
                    <ArrowRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {activePost && <PostModal post={activePost} onClose={closeModal} />}
    </>
  );
}
