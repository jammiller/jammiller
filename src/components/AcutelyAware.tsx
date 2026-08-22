import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Link2, Check, Settings, X } from 'lucide-react';
import {
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
  Chart as ChartJS,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { teachflowStudents as studentData, teachflowGrades as gradeData, teachflowNotes as noteData } from '../data/teachflow';

ChartJS.register(
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
);

type ViewName = 'overview' | 'attendance' | 'grading' | 'analytics' | 'notes' | 'exchange';

type AttendanceState = 'present' | 'absent' | 'late' | null;

interface Student {
  id: string;
  n: string;
  i: string;
  state: AttendanceState;
  streak: string;
}

interface GradeRow {
  id: string;
  student_name: string;
  description: string;
  score: string;
  confidence: string;
  note: string;
  status: 'pending' | 'graded';
}

interface NoteRow {
  id: string;
  title: string;
  body: string;
  note_type: 'lesson' | 'rubric' | 'feedback';
}

type NoteType = 'lesson' | 'rubric' | 'feedback';

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  lesson: 'Lesson plan',
  rubric: 'Rubric',
  feedback: 'Feedback bank',
};

const TABS: { name: ViewName; label: string; num: string; accent: string }[] = [
  { name: 'overview', label: 'Overview', num: '01', accent: '#D4AF37' },
  { name: 'attendance', label: 'Attendance', num: '02', accent: '#2d4568' },
  { name: 'grading', label: 'Grading', num: '03', accent: '#D4AF37' },
  { name: 'analytics', label: 'Analytics', num: '04', accent: '#2d4568' },
  { name: 'notes', label: 'Notes', num: '05', accent: '#D4AF37' },
  { name: 'exchange', label: 'Exchange', num: '06', accent: '#2d4568' },
];

const CHART_COLORS = {
  inkMuted: '#565b62',
  navy: '#0A1A2F',
  gold: '#D4AF37',
  line: '#e3e5e7',
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { min: 50, max: 100, grid: { color: CHART_COLORS.line } },
    x: { grid: { display: false } },
  },
};

// ---- Teacher profile (customizable, saved to localStorage) ----

interface TeacherProfile {
  name: string;
  initials: string;
  subject: string;
  period: string;
}

const DEFAULT_PROFILE: TeacherProfile = {
  name: 'M. Alvarez',
  initials: 'MA',
  subject: 'Biology',
  period: 'Period 3',
};

const PROFILE_KEY = 'edusync_teacher_profile';

function loadProfile(): TeacherProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_PROFILE;
}

function saveProfile(p: TeacherProfile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

// ---- Icons ----

function PresentIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
      <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AbsentIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function LateIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
      <circle cx="8" cy="8" r="5.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 5v3l2 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function BlankIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
      <rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function MarkButton({
  active,
  state,
  onClick,
  title,
  children,
}: {
  active: boolean;
  state: NonNullable<AttendanceState>;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const bgClass = active
    ? state === 'present'
      ? 'bg-navy-900 border-navy-900 text-white'
      : state === 'absent'
      ? 'bg-slate-800 border-slate-800 text-white'
      : 'bg-gold-500 border-gold-500 text-navy-900'
    : 'bg-white border-slate-200 text-slate-300';
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-[34px] h-[34px] rounded-lg border flex items-center justify-center transition-all duration-150 ${bgClass}`}
    >
      {children}
    </button>
  );
}

const TODAY = new Date().toISOString().slice(0, 10);
const CLASSROOM_LOCATION = { lat: 37.4219, lng: -122.084 };

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ---- Settings modal ----

function SettingsModal({ profile, onClose, onSave }: {
  profile: TeacherProfile;
  onClose: () => void;
  onSave: (p: TeacherProfile) => void;
}) {
  const [draft, setDraft] = useState<TeacherProfile>(profile);

  const update = (key: keyof TeacherProfile, value: string) => {
    const next = { ...draft, [key]: value };
    if (key === 'name') {
      const parts = value.trim().split(/\s+/);
      if (parts.length >= 2) {
        next.initials = (parts[0][0] ?? '').toUpperCase() + (parts[parts.length - 1][0] ?? '').toUpperCase();
      } else if (parts.length === 1 && parts[0].length > 0) {
        next.initials = (parts[0].slice(0, 2)).toUpperCase();
      }
    }
    setDraft(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="font-bold text-navy-900 text-base flex items-center gap-2">
            <Settings className="w-4 h-4" /> Teacher profile
          </h3>
          <button onClick={onClose} aria-label="Close settings" className="text-slate-400 hover:text-navy-900 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g. J. Smith"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
            <input
              type="text"
              value={draft.subject}
              onChange={(e) => update('subject', e.target.value)}
              placeholder="e.g. Biology"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Period</label>
            <input
              type="text"
              value={draft.period}
              onChange={(e) => update('period', e.target.value)}
              placeholder="e.g. Period 3"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-8 h-8 rounded-full bg-gold-500 text-navy-900 flex items-center justify-center font-bold text-[13px] font-mono">
              {draft.initials}
            </div>
            <span>These appear in the sidebar and throughout the app.</span>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onSave(draft); onClose(); }}
            className="flex-1 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Check-in / Geofence cards ----

function CheckInCard() {
  const svgRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const checkinUrl = `https://edusync.app/checkin?class=bio-p3&date=${TODAY}`;

  const downloadQR = () => {
    const svg = svgRef.current?.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 256);
      ctx.drawImage(img, 0, 0, 256, 256);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `checkin-qr-${TODAY}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(checkinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card>
      <div className="flex flex-col items-center text-center gap-2.5">
        <h4 className="self-start text-sm font-semibold text-[#0A1A2F]">Self check-in</h4>
        <div ref={svgRef} className="p-2 bg-white rounded-lg border-2 border-[#0A1A2F]">
          <QRCodeSVG value={checkinUrl} size={110} level="M" bgColor="#ffffff" fgColor="#0A1A2F" />
        </div>
        <div className="text-xs text-[#565b62]">
          Students scan on entry. Marks sync here instantly — no roll call needed unless you want one.
        </div>
        <div className="flex gap-2 w-full mt-0.5">
          <button onClick={downloadQR} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#0A1A2F] rounded-lg py-2 px-3 hover:bg-[#163050] transition-colors">
            <Download size={13} /> Download QR
          </button>
          <button onClick={copyLink} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#0A1A2F] border border-[#0A1A2F]/20 rounded-lg py-2 px-3 hover:bg-[#0A1A2F]/5 transition-colors">
            {copied ? <Check size={13} /> : <Link2 size={13} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>
    </Card>
  );
}

function GeofenceCard() {
  const [radius, setRadius] = useState(75);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'in-range' | 'out-of-range' | 'denied' | 'unsupported'>('idle');

  const checkLocation = () => {
    if (!navigator.geolocation) { setStatus('unsupported'); return; }
    setStatus('checking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        const dist = haversineMeters(latitude, longitude, CLASSROOM_LOCATION.lat, CLASSROOM_LOCATION.lng);
        setStatus(dist <= radius ? 'in-range' : 'out-of-range');
      },
      () => setStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const distMeters = coords ? Math.round(haversineMeters(coords.lat, coords.lng, CLASSROOM_LOCATION.lat, CLASSROOM_LOCATION.lng)) : null;

  const statusConfig = {
    idle: { dot: 'bg-slate-400', label: 'Not checked', color: 'text-slate-500' },
    checking: { dot: 'bg-amber-400 animate-pulse', label: 'Checking…', color: 'text-amber-600' },
    'in-range': { dot: 'bg-emerald-500', label: 'In range', color: 'text-emerald-600' },
    'out-of-range': { dot: 'bg-rose-500', label: 'Out of range', color: 'text-rose-600' },
    denied: { dot: 'bg-rose-500', label: 'Location denied', color: 'text-rose-600' },
    unsupported: { dot: 'bg-slate-400', label: 'Unsupported', color: 'text-slate-500' },
  }[status];

  return (
    <Card>
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold text-[#0A1A2F] flex items-center justify-between">
          Geofenced check-in
          <span className={`flex items-center gap-1.5 text-[11px] font-medium ${statusConfig.color}`}>
            <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </h4>
        <div className="text-xs text-[#565b62] space-y-1">
          <div className="flex justify-between">
            <span>Classroom</span>
            <span className="font-mono">{CLASSROOM_LOCATION.lat.toFixed(4)}, {CLASSROOM_LOCATION.lng.toFixed(4)}</span>
          </div>
          {distMeters !== null && (
            <div className="flex justify-between">
              <span>Your distance</span>
              <span className="font-mono">{distMeters} m</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span>Radius</span>
            <span className="font-mono">{radius} m</span>
          </div>
        </div>
        <input
          type="range" min={25} max={300} step={5} value={radius}
          onChange={(e) => {
            const r = Number(e.target.value);
            setRadius(r);
            if (distMeters !== null) setStatus(distMeters <= r ? 'in-range' : 'out-of-range');
          }}
          className="w-full accent-[#0A1A2F] cursor-pointer"
        />
        <button onClick={checkLocation} disabled={status === 'checking'}
          className="w-full text-xs font-semibold text-white bg-[#0A1A2F] rounded-lg py-2 px-3 hover:bg-[#163050] transition-colors disabled:opacity-50 disabled:cursor-wait">
          {status === 'checking' ? 'Checking location…' : 'Check my location'}
        </button>
        <p className="text-[11px] text-[#565b62] leading-relaxed">
          Students within the radius auto-check in without scanning. Adjust the fence to match your room.
        </p>
      </div>
    </Card>
  );
}

// ---- Main component ----

export function AcutelyAware() {
  const [view, setView] = useState<ViewName>('overview');
  const [profile, setProfile] = useState<TeacherProfile>(DEFAULT_PROFILE);
  const [showSettings, setShowSettings] = useState(false);
  const [students, setStudents] = useState<Student[]>(
    studentData.map((s) => ({ id: s.id, n: s.name, i: s.initials, streak: s.streak_note, state: null as AttendanceState })),
  );
  const [grades, setGrades] = useState<GradeRow[]>(gradeData);
  const [notes, setNotes] = useState<NoteRow[]>(noteData);
  const [activeNoteType, setActiveNoteType] = useState<NoteType>('lesson');
  const [toast, setToast] = useState<string | null>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  // Load teacher profile from localStorage on mount
  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const handleSaveProfile = (p: TeacherProfile) => {
    setProfile(p);
    saveProfile(p);
    showToast('Profile saved');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    ChartJS.defaults.font.family = 'Inter, sans-serif';
    ChartJS.defaults.font.size = 11;
    ChartJS.defaults.color = CHART_COLORS.inkMuted;
  }, []);

  const switchTab = (name: ViewName) => setView(name);

  const setState = (idx: number, state: NonNullable<AttendanceState>) => {
    setStudents((prev) =>
      prev.map((s, i) =>
        i === idx ? { ...s, state: s.state === state ? null : state } : s,
      ),
    );
  };

  const markAllPresent = () => {
    setStudents((prev) => prev.map((s) => (s.state ? s : { ...s, state: 'present' })));
  };

  const gradeDone = (gradeId: string) => {
    setGrades((prev) => prev.map((g) => (g.id === gradeId ? { ...g, status: 'graded' } : g)));
  };

  const activeNote = notes.find((n) => n.note_type === activeNoteType) ?? null;

  const saveNotes = () => {
    if (!activeNote || !notesRef.current) return;
    const body = notesRef.current.innerText;
    setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? { ...n, body } : n)));
  };

  const createNote = (type: NoteType) => {
    const newNote: NoteRow = { id: `note-${Date.now()}`, title: `New ${NOTE_TYPE_LABELS[type]}`, body: '', note_type: type };
    setNotes((prev) => [...prev, newNote]);
    setActiveNoteType(type);
  };

  const handleNoteChipClick = (type: NoteType) => {
    const existing = notes.find((n) => n.note_type === type);
    if (existing) { setActiveNoteType(type); } else { void createNote(type); }
  };

  const presentCount = students.filter((s) => s.state === 'present').length;
  const absentCount = students.filter((s) => s.state === 'absent').length;
  const lateCount = students.filter((s) => s.state === 'late').length;
  const activeTab = TABS.find((t) => t.name === view)!;

  return (
    <section id="classroom" className="py-12 bg-softgray min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-3 tracking-tight">
            EduSync — Everything for the classroom, one place
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Attendance, grading, analytics, lesson notes, and cross-class knowledge exchange — all in one workspace.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row rounded-2xl overflow-hidden border border-slate-200 shadow-lg shadow-navy-900/5 bg-white min-h-[640px]">
          {/* Sidebar */}
          <nav className="lg:w-56 flex-shrink-0 bg-navy-900 text-white flex flex-col lg:sticky lg:top-0 lg:h-[640px]">
            <div className="px-6 pt-7 pb-5 border-b border-white/10">
              <div className="font-bold text-2xl tracking-wide">EduSync</div>
              <div className="font-mono text-[11px] text-slate-400 mt-1 tracking-wide">
                everything, one place
              </div>
            </div>
            <ul className="flex-1 py-1.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible">
              {TABS.map((tab) => (
                <li key={tab.name}>
                  <button
                    onClick={() => switchTab(tab.name)}
                    className={`flex items-center gap-2.5 w-full text-left px-5 py-3 text-sm font-medium border-l-[3px] transition-all duration-150 whitespace-nowrap ${
                      view === tab.name
                        ? 'bg-white/10 text-white border-l-current'
                        : 'text-[#D8DBD2] border-l-transparent hover:bg-white/5 hover:text-white'
                    }`}
                    style={view === tab.name ? { color: tab.accent } : undefined}
                  >
                    <span className="font-mono text-[11px] text-slate-500 w-4">{tab.num}</span>
                    <span className={view === tab.name ? 'text-white' : ''}>{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="px-5 pt-4 border-t border-white/10 mt-1 pb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gold-500 text-navy-900 flex items-center justify-center font-bold text-[13px] font-mono">
                  {profile.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate">{profile.name}</div>
                  <div className="text-[11px] text-slate-400">{profile.subject} · {profile.period}</div>
                </div>
                <button
                  onClick={() => setShowSettings(true)}
                  title="Edit profile"
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </nav>

          {/* Main */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Topbar */}
            <div className="sticky top-0 z-10 bg-softgray/90 backdrop-blur-sm border-b border-slate-200 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-xl text-navy-900 m-0">{activeTab.label}</h3>
                <div className="font-mono text-xs text-slate-500 mt-0.5">
                  {TODAY} · {profile.period} · {profile.subject} · 24 students
                </div>
              </div>
              <div className="flex gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-navy-900" />
                  {presentCount + 14} present today
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                  7 pending grading
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  2 flagged students
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 flex-1">
              {view === 'overview' && <OverviewView onNavigate={switchTab} onNudge={(name) => showToast(`Nudge sent to ${name}`)} />}
              {view === 'attendance' && (
                <AttendanceView students={students} setState={setState} markAllPresent={markAllPresent}
                  presentCount={presentCount} absentCount={absentCount} lateCount={lateCount} loading={false} />
              )}
              {view === 'grading' && <GradingView grades={grades} gradeDone={gradeDone} loading={false} />}
              {view === 'analytics' && <AnalyticsView />}
              {view === 'notes' && (
                <NotesView notesRef={notesRef} notes={notes} activeNoteType={activeNoteType} loading={false}
                  onSave={saveNotes} onChipClick={handleNoteChipClick} activeNote={activeNote} />
              )}
              {view === 'exchange' && <ExchangeView />}

              <footer className="mt-8 font-mono text-[11px] text-slate-500">
                EduSync — data saved locally in your browser
              </footer>
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-navy-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-[fadeIn_0.2s_ease-out]">
            {toast}
          </div>
        )}

        {showSettings && (
          <SettingsModal profile={profile} onClose={() => setShowSettings(false)} onSave={handleSaveProfile} />
        )}
      </div>
    </section>
  );
}

// ---- Sub-views ----

function OverviewView({ onNavigate, onNudge }: { onNavigate: (v: ViewName) => void; onNudge: (name: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card title="Today's schedule" tag="bell 1–7">
        <div className="space-y-0">
          {[
            { time: '8:10a', label: 'Period 1 — Biology', badge: 'done', badgeClass: 'bg-navy-50 text-navy-700' },
            { time: '9:05a', label: 'Period 2 — Biology Lab', badge: 'done', badgeClass: 'bg-navy-50 text-navy-700' },
            { time: '10:00a', label: 'Period 3 — Biology', badge: 'now', badgeClass: 'bg-[#FBEDCB] text-[#8A6300]', highlight: true },
            { time: '11:15a', label: 'Period 4 — Prep', badge: 'next', badgeClass: 'bg-[#FBEDCB] text-[#8A6300]' },
            { time: '1:30p', label: 'Period 6 — Biology', badge: 'next', badgeClass: 'bg-[#FBEDCB] text-[#8A6300]' },
          ].map((row) => (
            <div key={row.time} className="flex items-center justify-between py-2.5 border-b border-dashed border-slate-200 last:border-0 text-[13.5px]">
              <span className="font-mono text-xs text-slate-500 w-[70px] flex-shrink-0">{row.time}</span>
              <span className={`flex-1 ${row.highlight ? 'text-navy-700 font-bold' : ''}`}>{row.label}</span>
              <span className={`text-[10.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${row.badgeClass}`}>{row.badge}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Pending actions" tag="auto-detected">
        <div className="space-y-0">
          {[
            { text: '7 quizzes awaiting grade review', action: () => onNavigate('grading'), label: 'Review' },
            { text: '3 absences unexplained (2+ days)', action: () => onNavigate('attendance'), label: 'View' },
            { text: 'Cross-class challenge starts Mon', action: () => onNavigate('exchange'), label: 'Open' },
            { text: 'Lesson notes not yet shared', action: () => onNavigate('notes'), label: 'Draft' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-dashed border-[#e3e5e7] last:border-0 text-[13.5px]">
              <span>{row.text}</span>
              <MiniButton onClick={row.action}>{row.label}</MiniButton>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Flagged students" tag="trend-based">
        <div className="space-y-0">
          {[
            { initials: 'JT', name: 'Jordan T.', note: 'Mastery down 18% over 2 weeks — cell respiration' },
            { initials: 'SK', name: 'Sam K.', note: '3 late arrivals this week' },
          ].map((s) => (
            <div key={s.initials} className="flex items-center gap-3 py-2.5 border-b border-dashed border-[#e3e5e7] last:border-0">
              <div className="w-7 h-7 rounded-full bg-[#f6edd0] text-[#565b62] flex items-center justify-center text-[11.5px] font-bold flex-shrink-0">
                {s.initials}
              </div>
              <div className="flex-1 text-[13px]">
                <b className="block text-[13.5px]">{s.name}</b>
                <span className="text-[#565b62] text-xs">{s.note}</span>
              </div>
              <MiniButton onClick={() => onNudge(s.name)}>Nudge</MiniButton>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Card({ title, tag, children, className = '' }: { title?: string; tag?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#e3e5e7] rounded-[10px] p-5 shadow-[0_1px_2px_rgba(10,26,47,0.06),0_4px_14px_rgba(10,26,47,0.05)] ${className}`}>
      {title && (
        <h4 className="text-sm font-semibold text-[#0A1A2F] mb-3 flex items-center justify-between">
          {title}
          {tag && <span className="font-mono text-[10.5px] text-[#565b62] font-normal">{tag}</span>}
        </h4>
      )}
      {children}
    </div>
  );
}

function MiniButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="border border-[#e3e5e7] bg-white rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 hover:bg-[#2d4568] hover:text-white hover:border-[#2d4568]">
      {children}
    </button>
  );
}

function AttendanceView({ students, setState, markAllPresent, presentCount, absentCount, lateCount, loading }: {
  students: Student[];
  setState: (idx: number, state: NonNullable<AttendanceState>) => void;
  markAllPresent: () => void;
  presentCount: number; absentCount: number; lateCount: number; loading: boolean;
}) {
  return (
    <div>
      <h3 className="font-serif font-medium text-lg text-[#0A1A2F] mb-1">Attendance — Period 3</h3>
      <p className="text-[#565b62] text-[13.5px] mb-4">
        Tap to mark. Scans and geofenced check-ins fill this in automatically — this view is your override, not your only option.
      </p>
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4 items-start">
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex gap-4 font-mono text-xs">
              <span>Present <b className="text-sm">{presentCount}</b></span>
              <span>Absent <b className="text-sm">{absentCount}</b></span>
              <span>Late <b className="text-sm">{lateCount}</b></span>
            </div>
            <MiniButton onClick={markAllPresent}>Mark rest present</MiniButton>
          </div>
          <div className="bg-white border border-[#e3e5e7] rounded-[10px] overflow-hidden shadow-sm">
            {loading && <div className="px-4 py-6 text-[#565b62] text-sm">Loading roster…</div>}
            {!loading && students.length === 0 && <div className="px-4 py-6 text-[#565b62] text-sm">No students in the roster.</div>}
            {students.map((s, idx) => (
              <div key={s.i} className="flex items-center gap-3.5 px-4 py-3 border-b border-[#e3e5e7] last:border-0">
                <div className="w-8 h-8 rounded-full bg-[#e8ecf2] text-[#2d4568] flex items-center justify-center text-xs font-bold font-mono flex-shrink-0">{s.i}</div>
                <div className="flex-1 text-sm font-medium">
                  {s.n}
                  <div className="text-[11px] text-[#565b62] font-mono">{s.streak}</div>
                </div>
                <div className="flex gap-1.5">
                  <MarkButton active={s.state === 'present'} state="present" onClick={() => setState(idx, 'present')} title="Present">
                    {s.state === 'present' ? <PresentIcon /> : <BlankIcon />}
                  </MarkButton>
                  <MarkButton active={s.state === 'late'} state="late" onClick={() => setState(idx, 'late')} title="Late">
                    {s.state === 'late' ? <LateIcon /> : <BlankIcon />}
                  </MarkButton>
                  <MarkButton active={s.state === 'absent'} state="absent" onClick={() => setState(idx, 'absent')} title="Absent">
                    {s.state === 'absent' ? <AbsentIcon /> : <BlankIcon />}
                  </MarkButton>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <CheckInCard />
          <GeofenceCard />
        </div>
      </div>
    </div>
  );
}

function GradingView({ grades, gradeDone, loading }: { grades: GradeRow[]; gradeDone: (id: string) => void; loading: boolean }) {
  return (
    <div>
      <h3 className="font-serif font-medium text-lg text-[#0A1A2F] mb-1">Grading queue</h3>
      <p className="text-[#565b62] text-[13.5px] mb-4">
        AI drafts a score and comment from your rubric. You approve, edit, or overrule — nothing posts without you.
      </p>
      {loading && <div className="text-[#565b62] text-sm">Loading submissions…</div>}
      {!loading && grades.length === 0 && <div className="text-[#565b62] text-sm">No submissions in the queue.</div>}
      {grades.map((sub) => {
        const isGraded = sub.status === 'graded';
        return (
          <div key={sub.id} className={`border border-[#e3e5e7] rounded-[10px] px-4 py-4 mb-3 bg-white shadow-sm ${isGraded ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start gap-3.5 flex-wrap">
              <div>
                <b className="text-sm">{sub.student_name}</b>
                <span className="block text-[#565b62] text-xs mt-0.5">{sub.description}</span>
              </div>
              <div className="font-mono text-right">
                <div className="text-xl font-semibold text-[#2d4568]">{sub.score}</div>
                <div className="text-[10.5px] text-[#565b62]">AI confidence: {sub.confidence}</div>
              </div>
            </div>
            {sub.note && !isGraded && (
              <div className="text-[12.5px] text-[#565b62] my-2.5 px-3 py-2 bg-[#F2F6F9] border-l-[3px] border-[#D4AF37] rounded">{sub.note}</div>
            )}
            {!isGraded && (
              <div className="flex gap-2 mt-2.5">
                <button onClick={() => gradeDone(sub.id)} className="border-none rounded-md px-3.5 py-2 text-xs font-semibold bg-[#2d4568] text-white hover:bg-[#254b40] transition-colors">Approve &amp; return</button>
                <button className="rounded-md px-3.5 py-2 text-xs font-semibold bg-white border border-[#e3e5e7] hover:bg-[#F2F6F9] transition-colors">Edit</button>
              </div>
            )}
            {isGraded && <div className="text-[11.5px] text-[#2d4568] font-semibold mt-2">✓ graded and returned</div>}
          </div>
        );
      })}
    </div>
  );
}

function AnalyticsView() {
  return (
    <div>
      <h3 className="font-serif font-medium text-lg text-[#0A1A2F] mb-1">Real-time analytics</h3>
      <p className="text-[#565b62] text-[13.5px] mb-4">Updates as work is submitted and graded — not an overnight batch report.</p>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Class average, last 6 weeks">
          <div style={{ maxHeight: '220px' }}>
            <Line data={{
              labels: ['Wk1', 'Wk2', 'Wk3', 'Wk4', 'Wk5', 'Wk6'],
              datasets: [{ label: 'Class average', data: [74, 76, 73, 79, 81, 84], borderColor: CHART_COLORS.navy, backgroundColor: 'rgba(47,93,80,0.08)', fill: true, tension: 0.35, pointRadius: 3 }],
            }} options={chartOptions as never} />
          </div>
        </Card>
        <Card title="Mastery by topic">
          <div style={{ maxHeight: '220px' }}>
            <Bar data={{
              labels: ['Cell Bio', 'Genetics', 'Ecosystems', 'Respiration', 'Evolution'],
              datasets: [{ data: [88, 82, 91, 71, 85], backgroundColor: [CHART_COLORS.navy, CHART_COLORS.navy, CHART_COLORS.navy, CHART_COLORS.navy, CHART_COLORS.navy], borderRadius: 5, barThickness: 22 }],
            }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, grid: { color: CHART_COLORS.line } }, x: { grid: { display: false } } } } as never} />
          </div>
        </Card>
      </div>
      <Card title="Student progress" tag="this week" className="mt-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {['Student', 'Cell Respiration', 'Genetics', 'Ecosystems', 'Trend'].map((h) => (
                <th key={h} className="text-left text-[11px] text-[#565b62] font-semibold px-1.5 py-2 border-b border-[#e3e5e7]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Priya N.', cr: '92%', g: '88%', e: '95%', trend: '▲ +6%', up: true },
              { name: 'Marcus D.', cr: '74%', g: '70%', e: '81%', trend: '▲ +2%', up: true },
              { name: 'Jordan T.', cr: '58%', g: '65%', e: '60%', trend: '▼ -18%', up: false },
              { name: 'Elena R.', cr: '96%', g: '91%', e: '97%', trend: '▲ +4%', up: true },
              { name: 'Sam K.', cr: '77%', g: '80%', e: '75%', trend: '▼ -3%', up: false },
            ].map((row) => (
              <tr key={row.name}>
                <td className="px-1.5 py-2 border-b border-[#e3e5e7]">{row.name}</td>
                <td className="px-1.5 py-2 border-b border-[#e3e5e7]">{row.cr}</td>
                <td className="px-1.5 py-2 border-b border-[#e3e5e7]">{row.g}</td>
                <td className="px-1.5 py-2 border-b border-[#e3e5e7]">{row.e}</td>
                <td className={`px-1.5 py-2 border-b border-[#e3e5e7] font-bold ${row.up ? 'text-[#2d4568]' : 'text-[#565b62]'}`}>{row.trend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Cross-class comparison" tag="anonymized" className="mt-4">
        <div style={{ maxHeight: '180px' }}>
          <Bar data={{
            labels: ['Period 3 (yours)', 'Period 5', 'Period 6', 'Period 7'],
            datasets: [{ data: [84, 79, 88, 81], backgroundColor: [CHART_COLORS.gold, CHART_COLORS.line, CHART_COLORS.line, CHART_COLORS.line], borderRadius: 5, barThickness: 26 }],
          }} options={{ indexAxis: 'y' as const, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { min: 0, max: 100, grid: { color: CHART_COLORS.line } }, y: { grid: { display: false } } } } as never} />
        </div>
      </Card>
    </div>
  );
}

function NotesView({ notesRef, notes, activeNoteType, loading, onSave, onChipClick, activeNote }: {
  notesRef: React.RefObject<HTMLDivElement>;
  notes: NoteRow[];
  activeNoteType: NoteType;
  loading: boolean;
  onSave: () => void;
  onChipClick: (type: NoteType) => void;
  activeNote: NoteRow | null;
}) {
  const chipTypes: NoteType[] = ['lesson', 'rubric', 'feedback'];
  return (
    <div>
      <h3 className="font-serif font-medium text-lg text-[#0A1A2F] mb-1">Lesson notes</h3>
      <p className="text-[#565b62] text-[13.5px] mb-3">Your notes and their questions live on the same page — linked to the assignment they belong to.</p>
      <div className="flex gap-2 mb-3 flex-wrap">
        {chipTypes.map((type) => {
          const exists = notes.some((n) => n.note_type === type);
          const isActive = activeNoteType === type;
          return (
            <button key={type} onClick={() => onChipClick(type)}
              className={`border rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive ? 'bg-[#2d4568] text-white border-[#2d4568]' : 'border-[#e3e5e7] bg-white hover:bg-[#e8ecf2] hover:border-[#2d4568]'
              }`}>
              {exists ? NOTE_TYPE_LABELS[type] : `+ ${NOTE_TYPE_LABELS[type]}`}
            </button>
          );
        })}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="!p-0 overflow-hidden">
          <h4 className="text-sm font-semibold text-[#0A1A2F] px-5 pt-4 mb-0">
            {loading ? 'Loading…' : (activeNote?.title ?? `${NOTE_TYPE_LABELS[activeNoteType]} — new`)}
          </h4>
          <div
            key={activeNote?.id ?? activeNoteType}
            ref={notesRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={onSave}
            className="px-5 pb-5 pt-3 min-h-[280px] font-serif text-[15.5px] leading-8 outline-none text-[#0A1A2F] focus:bg-[#e8ecf2]/30 whitespace-pre-wrap"
            style={{ backgroundImage: 'repeating-linear-gradient(#fff 0 31px, #e3e5e7 31px 32px)', backgroundAttachment: 'local' }}
          >
            {activeNote?.body ?? ''}
          </div>
        </Card>
        <Card title="Student questions" tag="shared layer">
          {[
            { q: 'Q: Why does ETC need oxygen specifically?', body: 'Is it the only molecule that could work as the final electron acceptor?', from: 'Priya N.' },
            { q: 'Q: Mixed up glycolysis location', body: 'I wrote "mitochondria" — is that only true for the Krebs cycle?', from: 'Marcus D.' },
            { q: 'Note to self', body: 'Re-explain ATP yield differences between prokaryotes/eukaryotes next class.', from: 'you' },
          ].map((sticky, i) => (
            <div key={i} className="bg-[#FBEDCB] rounded-lg px-3 py-2.5 mb-2 last:mb-0 text-[12.5px]">
              <b className="block text-[12.5px] mb-1">{sticky.q}</b>
              {sticky.body}
              <span className="block text-[#565b62] text-[10.5px] mt-1.5">— {sticky.from}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function ExchangeView() {
  return (
    <div>
      <h3 className="font-serif font-medium text-lg text-[#0A1A2F] mb-1">Knowledge exchange</h3>
      <p className="text-[#565b62] text-[13.5px] mb-4">
        What one class masters becomes material for the next — teach-backs, shared rubrics, joint challenges.
      </p>
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-[#0A1A2F] mb-2.5">Teach-back matches this week</h4>
          {[
            { initials: 'ER', name: 'Elena R.', mastered: 'Punnett squares', detail: 'matched to co-teach Period 5 Biology', meta: '3-slide teach-back · 5 min peer Q&A · Fri 1:35p' },
            { initials: 'DF', name: 'Diego F.', mastered: 'lab safety protocol', detail: 'matched to Period 1 new transfer students', meta: 'Scheduled Mon 8:15a' },
          ].map((card) => (
            <div key={card.initials} className="flex gap-3.5 items-center border border-[#e3e5e7] rounded-[10px] px-4 py-3.5 bg-white mb-3 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-[#2d4568] text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0 font-mono">{card.initials}</div>
              <div className="flex-1 text-[13px]">
                <b className="text-sm">{card.name}</b> mastered <i>{card.mastered}</i> — {card.detail}
                <span className="block text-[#565b62] mt-0.5 text-xs">{card.meta}</span>
              </div>
              <MiniButton>Confirm</MiniButton>
            </div>
          ))}
        </div>
        <Card title="Shared rubric library" tag="school-wide">
          {[
            { name: 'Cellular Respiration — short answer rubric', meta: 'used by 4 teachers · fork' },
            { name: 'Lab report grading template', meta: 'used by 7 teachers · fork' },
            { name: 'Peer teach-back slide template', meta: 'used by 3 teachers · fork' },
          ].map((row, i) => (
            <div key={i} className="flex justify-between items-center py-2.5 border-b border-dashed border-[#e3e5e7] last:border-0 text-[13px]">
              <span className="font-medium">{row.name}</span>
              <span className="text-[#565b62] text-[11.5px]">{row.meta}</span>
            </div>
          ))}
        </Card>
      </div>
      <Card title="Cross-class challenge" tag="live now" className="mt-4">
        <p className="text-[13px] text-[#565b62] m-0">
          Period 3 vs. Period 5 — Ecosystems quiz, results shared Friday to prompt discussion, not ranking.
        </p>
      </Card>
    </div>
  );
}
