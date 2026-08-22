import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Check,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  Pause,
  Play,
  QrCode,
  RotateCcw,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';

type EduSyncScene = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  icon: typeof GraduationCap;
  colors: [string, string];
  duration: number;
};

const EDUSYNC_SCENES: EduSyncScene[] = [
  {
    id: 'intro',
    title: 'EduSync',
    subtitle: 'A calmer classroom, in one place',
    description: 'A focused teaching workspace that helps educators take attendance, grade work, understand progress, and keep every lesson moving.',
    bullets: ['Less admin', 'Clearer insight', 'More time to teach'],
    icon: GraduationCap,
    colors: ['#0A1A2F', '#2d4568'],
    duration: 6000,
  },
  {
    id: 'overview',
    title: 'Overview',
    subtitle: 'See the day at a glance',
    description: 'Start with a clear snapshot of your class, today’s attendance, grading queue, and current learning momentum.',
    bullets: ['Class snapshot', 'Today’s priorities', 'Fast navigation'],
    icon: ClipboardCheck,
    colors: ['#183557', '#0A1A2F'],
    duration: 6500,
  },
  {
    id: 'attendance',
    title: 'Attendance',
    subtitle: 'Mark a class in seconds',
    description: 'Record present, absent, or late with simple controls. Share a check-in QR code so students can confirm attendance from their own devices.',
    bullets: ['Present, absent, late', 'QR check-in', 'Saved automatically'],
    icon: Users,
    colors: ['#2d4568', '#12243d'],
    duration: 7000,
  },
  {
    id: 'grading',
    title: 'Grading',
    subtitle: 'Turn feedback into momentum',
    description: 'Move through student work with a focused grading queue, confidence notes, and clear feedback that supports the next step.',
    bullets: ['Focused queue', 'Feedback notes', 'Progress at a glance'],
    icon: Check,
    colors: ['#7c641b', '#2d4568'],
    duration: 7000,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    subtitle: 'Spot patterns early',
    description: 'See attendance and grade trends together so you can identify who needs support and celebrate steady growth.',
    bullets: ['Attendance trends', 'Grade distribution', 'Actionable insight'],
    icon: BarChart3,
    colors: ['#164e63', '#0A1A2F'],
    duration: 6500,
  },
  {
    id: 'notes',
    title: 'Notes',
    subtitle: 'Keep your best thinking close',
    description: 'Organize lesson plans, rubrics, and feedback banks so the ideas you reuse most are easy to find when you need them.',
    bullets: ['Lesson plans', 'Rubric library', 'Feedback bank'],
    icon: FileText,
    colors: ['#334155', '#0A1A2F'],
    duration: 6500,
  },
  {
    id: 'exchange',
    title: 'Exchange',
    subtitle: 'Connect classroom context',
    description: 'Share the right classroom details with the people who support your students, without losing your teaching flow.',
    bullets: ['Share context', 'Keep records clear', 'Support collaboration'],
    icon: QrCode,
    colors: ['#8b6f1e', '#0A1A2F'],
    duration: 6500,
  },
  {
    id: 'outro',
    title: 'Teach with clarity',
    subtitle: 'EduSync keeps the essentials moving',
    description: 'Spend less energy managing the classroom and more energy helping students learn.',
    bullets: ['Built for educators', 'Simple by design', 'Ready for every class'],
    icon: BookOpen,
    colors: ['#0A1A2F', '#7c641b'],
    duration: 6000,
  },
];

export function EduSyncWalkthrough() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const scene = EDUSYNC_SCENES[sceneIndex];
  const Icon = scene.icon;
  const totalDuration = useMemo(() => EDUSYNC_SCENES.reduce((sum, item) => sum + item.duration, 0), []);

  useEffect(() => {
    document.title = 'EduSync — Video Walkthrough';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Watch a guided walkthrough of EduSync for educators.');
  }, []);

  useEffect(() => {
    if (!playing) return;
    startTimeRef.current = performance.now();
    const animate = (now: number) => {
      const percent = Math.min((now - startTimeRef.current) / scene.duration, 1);
      setProgress(percent);
      if (percent >= 1) {
        setSceneIndex((current) => (current + 1) % EDUSYNC_SCENES.length);
        setProgress(0);
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, scene.duration, sceneIndex]);

  useEffect(() => {
    window.speechSynthesis?.cancel();
    if (muted) return;
    const utterance = new SpeechSynthesisUtterance(`${scene.title}. ${scene.description}`);
    utterance.rate = 0.95;
    const timer = setTimeout(() => window.speechSynthesis?.speak(utterance), 300);
    return () => { clearTimeout(timer); window.speechSynthesis?.cancel(); };
  }, [muted, scene.description, scene.title]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const sceneStartOffset = useMemo(
    () => EDUSYNC_SCENES.slice(0, sceneIndex).reduce((sum, item) => sum + item.duration, 0),
    [sceneIndex],
  );
  const totalProgress = ((sceneStartOffset + progress * scene.duration) / totalDuration) * 100;
  const goToScene = (index: number) => {
    setSceneIndex(index);
    setProgress(0);
    setPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[#071525] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <div className="relative w-full overflow-hidden rounded-2xl bg-[#071525] shadow-2xl ring-1 ring-white/10">
          <div
            className="relative aspect-video overflow-hidden transition-all duration-700"
            style={{ background: `linear-gradient(135deg, ${scene.colors[0]}, ${scene.colors[1]})` }}
          >
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" />
            <div key={scene.id} className="relative flex h-full flex-col items-center justify-center px-6 text-center sm:px-14">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#D4AF37]/20 ring-2 ring-[#D4AF37]/50 animate-[bounce_1s_ease-in-out]">
                <Icon className="h-10 w-10 text-[#F4D675]" strokeWidth={1.5} />
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#F4D675]">{scene.subtitle}</p>
              <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">{scene.title}</h1>
              <p className="mb-6 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">{scene.description}</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {scene.bullets.map((bullet) => (
                  <span key={bullet} className="flex items-center gap-2 rounded-full border border-[#F4D675]/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:text-sm">
                    <Check className="h-3.5 w-3.5 text-[#F4D675]" /> {bullet}
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute left-5 top-5 flex items-center gap-2 text-xs font-semibold tracking-wide text-white/60"><GraduationCap className="h-4 w-4 text-[#F4D675]" /> EDUSYNC</div>
            <div className="absolute right-5 top-5 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold text-white/70">{sceneIndex + 1} / {EDUSYNC_SCENES.length}</div>
          </div>
          <div className="h-1.5 bg-white/10"><div className="h-full bg-[#D4AF37] transition-all duration-100 ease-linear" style={{ width: `${totalProgress}%` }} /></div>
          <div className="flex items-center justify-between bg-[#071525] px-4 py-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setPlaying((current) => !current)} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-[#071525] hover:bg-[#F4D675]" aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}</button>
              <button onClick={() => { setSceneIndex(0); setProgress(0); setPlaying(true); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Restart walkthrough"><RotateCcw className="h-4 w-4" /></button>
              <button onClick={() => setMuted((current) => !current)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label={muted ? 'Unmute narration' : 'Mute narration'}>{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
              <span className="ml-2 hidden text-xs font-medium text-white/50 sm:inline">{playing ? 'Now playing' : 'Paused'}</span>
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">{EDUSYNC_SCENES.map((item, index) => <button key={item.id} onClick={() => goToScene(index)} className={`h-2 rounded-full transition-all ${index === sceneIndex ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-white/20 hover:bg-white/40'}`} aria-label={`Go to ${item.title}`} />)}</div>
          </div>
        </div>

        <div className="mt-6 flex w-full flex-wrap justify-center gap-2">
          {EDUSYNC_SCENES.map((item, index) => { const SceneIcon = item.icon; return <button key={item.id} onClick={() => goToScene(index)} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${index === sceneIndex ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#F4D675]' : 'border-white/10 bg-white/5 text-white/50 hover:text-white/80'}`}><SceneIcon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{item.title}</span><span className="sm:hidden">{index + 1}</span></button>; })}
        </div>

        <div className="mt-8 w-full rounded-xl border border-white/10 bg-white/5 p-5 text-center">
          <p className="text-sm text-white/70">Download the animated EduSync preview or share the full walkthrough on LinkedIn.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <a href="/edusync-linkedin-walkthrough.gif" download="edusync-linkedin-walkthrough.gif" className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm font-bold text-[#071525] hover:bg-[#F4D675]"><Download className="h-4 w-4" /> Download animated preview</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#0a66c2] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#004182]">Share on LinkedIn</a>
          </div>
        </div>
      </div>
    </div>
  );
}
