import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Shield,
  Siren,
  Users,
  Clock,
  Info,
  Settings,
  Wrench,
  CheckCircle2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Download,
} from 'lucide-react';

type Scene = {
  id: string;
  icon: typeof Shield;
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  accent: string;
  bg: string;
  duration: number;
};

const SCENES: Scene[] = [
  {
    id: 'intro',
    icon: Shield,
    title: 'Safety App',
    subtitle: 'Your personal safety companion',
    description: 'A pocket-sized safety toolkit that helps you stay prepared, stay connected, and get help fast when it matters most.',
    bullets: ['SOS alerts with one tap', 'Trusted contact network', 'Automatic safety check-ins'],
    accent: 'rose',
    bg: 'from-rose-600 via-rose-700 to-navy-900',
    duration: 6000,
  },
  {
    id: 'sos',
    icon: Siren,
    title: 'Emergency SOS',
    subtitle: 'One tap to alert your circle',
    description: 'Press the SOS button and a short countdown begins. Cancel if it was accidental, or let it send to notify your emergency contacts instantly.',
    bullets: ['5-second cancelable countdown', 'Sends your personalized message', 'Includes your live location'],
    accent: 'rose',
    bg: 'from-rose-500 via-rose-600 to-rose-800',
    duration: 7000,
  },
  {
    id: 'contacts',
    icon: Users,
    title: 'Emergency Contacts',
    subtitle: 'Your trusted circle, always reachable',
    description: 'Add family members, friends, or caregivers. Call them directly from the app, and they are the people notified by SOS and missed safety checks.',
    bullets: ['Quick-add by name and phone', 'One-tap direct calling', 'Notified automatically on SOS'],
    accent: 'blue',
    bg: 'from-blue-500 via-blue-600 to-navy-900',
    duration: 6500,
  },
  {
    id: 'check',
    icon: Clock,
    title: 'Safety Check',
    subtitle: 'Check in when you are safe',
    description: 'Set a timer before heading out. Tap I am Safe when you return. If the timer expires, the app prepares an alert with your last known location.',
    bullets: ['Choose 30 min, 1 hr, or 4 hr', 'One tap to mark yourself safe', 'Auto-alert if you do not check in'],
    accent: 'amber',
    bg: 'from-amber-500 via-orange-600 to-rose-800',
    duration: 7000,
  },
  {
    id: 'resources',
    icon: Info,
    title: 'Emergency Resources',
    subtitle: 'Help is one tap away',
    description: 'Quick links for crisis support, poison control, domestic violence support, and other national resources — available offline, no searching needed.',
    bullets: ['Crisis lines and hotlines', 'Poison control center', 'Domestic violence support'],
    accent: 'emerald',
    bg: 'from-emerald-500 via-teal-600 to-navy-900',
    duration: 6500,
  },
  {
    id: 'settings',
    icon: Settings,
    title: 'Custom Settings',
    subtitle: 'Make it work for you',
    description: 'Customize your SOS message, choose whether to share your location, and toggle the alarm sound. Your data stays on your device.',
    bullets: ['Personalize the SOS message', 'Toggle location sharing', 'Alarm sound on or off'],
    accent: 'slate',
    bg: 'from-slate-600 via-slate-700 to-navy-900',
    duration: 6000,
  },
  {
    id: 'tools',
    icon: Wrench,
    title: 'Safety Tools',
    subtitle: 'First aid and quick calls',
    description: 'Get first-aid guidance for common emergencies and quick call buttons for police, fire, and ambulance services.',
    bullets: ['Step-by-step first-aid guides', 'Direct call to 911', 'Police, fire, ambulance shortcuts'],
    accent: 'rose',
    bg: 'from-rose-600 via-rose-700 to-navy-900',
    duration: 6500,
  },
  {
    id: 'outro',
    icon: Shield,
    title: 'Stay Prepared',
    subtitle: 'Download the Safety App today',
    description: 'Your safety should not be complicated. Safety App keeps the tools you need close at hand — so you can focus on what matters.',
    bullets: ['Free to download', 'Works offline', 'Your data stays private'],
    accent: 'rose',
    bg: 'from-navy-800 via-navy-900 to-rose-900',
    duration: 6000,
  },
];

const accentMap: Record<string, { text: string; bg: string; ring: string; border: string }> = {
  rose: { text: 'text-rose-300', bg: 'bg-rose-500/20', ring: 'ring-rose-400/40', border: 'border-rose-400/30' },
  blue: { text: 'text-blue-300', bg: 'bg-blue-500/20', ring: 'ring-blue-400/40', border: 'border-blue-400/30' },
  amber: { text: 'text-amber-300', bg: 'bg-amber-500/20', ring: 'ring-amber-400/40', border: 'border-amber-400/30' },
  emerald: { text: 'text-emerald-300', bg: 'bg-emerald-500/20', ring: 'ring-emerald-400/40', border: 'border-emerald-400/30' },
  slate: { text: 'text-slate-300', bg: 'bg-slate-500/20', ring: 'ring-slate-400/40', border: 'border-slate-400/30' },
};

export function VideoWalkthrough() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const scene = SCENES[sceneIndex];
  const accent = accentMap[scene.accent] ?? accentMap.rose;
  const totalDuration = useMemo(() => SCENES.reduce((sum, s) => sum + s.duration, 0), []);

  useEffect(() => {
    document.title = 'Safety App — Video Walkthrough';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Watch a guided walkthrough of the Safety App — SOS alerts, emergency contacts, safety check-ins, and more.');
  }, []);

  useEffect(() => {
    if (!playing) return;
    startTimeRef.current = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(elapsed / scene.duration, 1);
      setProgress(pct);
      if (pct >= 1) {
        setSceneIndex((prev) => (prev + 1) % SCENES.length);
        setProgress(0);
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [playing, scene.duration, sceneIndex]);

  useEffect(() => {
    if (muted) {
      window.speechSynthesis?.cancel();
      return;
    }
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(`${scene.title}. ${scene.description}`);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    const speakTimer = setTimeout(() => {
      window.speechSynthesis?.speak(utterance);
    }, 300);
    return () => {
      clearTimeout(speakTimer);
      window.speechSynthesis?.cancel();
    };
  }, [muted, sceneIndex, scene.description, scene.title]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const togglePlay = () => {
    setPlaying((p) => !p);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const restart = () => {
    setSceneIndex(0);
    setProgress(0);
    setPlaying(true);
  };

  const goToScene = (idx: number) => {
    setSceneIndex(idx);
    setProgress(0);
    setPlaying(true);
  };

  const sceneStartOffset = useMemo(
    () => SCENES.slice(0, sceneIndex).reduce((sum, s) => sum + s.duration, 0),
    [sceneIndex],
  );
  const totalProgress = ((sceneStartOffset + progress * scene.duration) / totalDuration) * 100;

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Video frame */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
        {/* Scene */}
        <div className={`relative aspect-video bg-gradient-to-br ${scene.bg} transition-all duration-700 ease-out`}>
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {/* Content */}
          <div key={scene.id} className="relative flex h-full flex-col items-center justify-center px-6 text-center sm:px-12">
            <div className={`mb-5 flex h-20 w-20 items-center justify-center rounded-2xl ${accent.bg} ring-2 ${accent.ring} transition-transform duration-500 animate-[bounce_1s_ease-in-out]`}>
              <scene.icon className={`h-10 w-10 ${accent.text}`} strokeWidth={1.5} />
            </div>
            <p className={`mb-1 text-xs font-bold uppercase tracking-[0.2em] ${accent.text}`}>
              {scene.subtitle}
            </p>
            <h2 className="mb-3 text-3xl font-extrabold text-white drop-shadow-lg sm:text-4xl">
              {scene.title}
            </h2>
            <p className="mb-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              {scene.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {scene.bullets.map((bullet, i) => (
                <div
                  key={bullet}
                  className={`flex items-center gap-2 rounded-full border ${accent.border} bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:text-sm`}
                  style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.15}s both` }}
                >
                  <CheckCircle2 className={`h-3.5 w-3.5 ${accent.text}`} />
                  {bullet}
                </div>
              ))}
            </div>
          </div>

          {/* Scene counter */}
          <div className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur-sm">
            {sceneIndex + 1} / {SCENES.length}
          </div>

          {/* Watermark */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-semibold text-white/40">
            <Shield className="h-3.5 w-3.5" />
            Safety App
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 w-full bg-white/10">
          <div
            className="absolute left-0 top-0 h-full bg-rose-500 transition-all duration-100 ease-linear"
            style={{ width: `${totalProgress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-navy-950 px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white transition-colors hover:bg-rose-600"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
            </button>
            <button
              onClick={restart}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Restart walkthrough"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMuted((m) => !m)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label={muted ? 'Unmute narration' : 'Mute narration'}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <span className="ml-2 text-xs font-medium text-white/50">
              {playing ? 'Now playing' : 'Paused'}
            </span>
          </div>

          {/* Scene dots */}
          <div className="hidden items-center gap-1.5 sm:flex">
            {SCENES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goToScene(i)}
                className={`h-2 rounded-full transition-all ${
                  i === sceneIndex ? 'w-6 bg-rose-500' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to scene ${i + 1}: ${s.title}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scene navigation (below video) */}
      <div className="mt-6 flex w-full max-w-4xl flex-wrap items-center justify-center gap-2">
        {SCENES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goToScene(i)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
              i === sceneIndex
                ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
            }`}
          >
            <s.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{s.title}</span>
            <span className="sm:hidden">{i + 1}</span>
          </button>
        ))}
      </div>

      {/* LinkedIn call to action */}
      <div className="mt-8 w-full max-w-4xl rounded-xl border border-white/10 bg-white/5 p-5 text-center">
        <p className="text-sm text-white/70">
          Download the animated preview or share the full walkthrough on LinkedIn.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/safety-app-linkedin-walkthrough.gif"
            download="safety-app-linkedin-walkthrough.gif"
            className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-600"
          >
            <Download className="h-4 w-4" />
            Download animated preview
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0a66c2] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#004182]"
          >
            <ChevronRight className="h-4 w-4" />
            Share on LinkedIn
          </a>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
