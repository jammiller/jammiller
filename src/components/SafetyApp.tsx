import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield,
  Phone,
  Plus,
  Trash2,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Users,
  Siren,
  Share2,
  Bell,
  ChevronLeft,
  Settings,
  Info,
  Wrench,
  HeartPulse,
  Flame,
  Ambulance,
  MousePointer2,
  Volume2,
  VolumeX,
} from 'lucide-react';

type View = 'home' | 'contacts' | 'check' | 'resources' | 'settings' | 'tools' | 'firstaid';

type WalkthroughStep = {
  view: View;
  title: string;
  description: string;
  action: string;
};

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    view: 'home',
    title: 'Emergency SOS',
    description: 'The SOS button starts a short countdown so you can cancel by mistake. When it sends, your emergency contacts receive your message and location.',
    action: 'Watch the SOS button',
  },
  {
    view: 'contacts',
    title: 'Emergency Contacts',
    description: 'Add trusted people with their phone numbers. They can be called directly, and they are the people notified by SOS and missed safety checks.',
    action: 'Open Contacts',
  },
  {
    view: 'check',
    title: 'Safety Check',
    description: 'Set a timer before going out. Tap I’m Safe when you return. If the timer expires, the app prepares an alert with your last known location.',
    action: 'Open Safety Check',
  },
  {
    view: 'resources',
    title: 'Emergency Resources',
    description: 'Find quick links for crisis support, poison control, domestic violence support, and other national resources.',
    action: 'Open Resources',
  },
  {
    view: 'settings',
    title: 'Settings',
    description: 'Customize the SOS message and choose whether location sharing and the alarm sound are enabled.',
    action: 'Open Settings',
  },
  {
    view: 'tools',
    title: 'Safety Tools',
    description: 'Get first-aid guidance and quick call buttons for police, fire, and ambulance services.',
    action: 'Open Tools',
  },
];

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface SafetyCheck {
  active: boolean;
  durationMin: number;
  startedAt: number | null;
  remainingSec: number;
}

const STORAGE_KEY = 'safety_app_contacts';
const SETTINGS_KEY = 'safety_app_settings';

interface AppSettings {
  sosMessage: string;
  shareLocation: boolean;
  alarmSound: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  sosMessage: 'I need help. This is my current location.',
  shareLocation: true,
  alarmSound: true,
};

function loadContacts(): EmergencyContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveContacts(contacts: EmergencyContact[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts)); } catch { /* ignore */ }
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

function saveSettings(s: AppSettings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function SafetyApp() {
  const [view, setView] = useState<View>('home');
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [toast, setToast] = useState<string | null>(null);
  const [walkthroughStep, setWalkthroughStep] = useState<number | null>(null);
  const [walkthroughAudio, setWalkthroughAudio] = useState(true);
  const sosTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setContacts(loadContacts());
    setSettings(loadSettings());
  }, []);

  // Auto-grab location on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }, []);
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // SOS countdown interval — only runs while counting down
  useEffect(() => {
    if (sosActive && sosCountdown > 0) {
      sosTimerRef.current = setInterval(() => {
        setSosCountdown((c) => c - 1);
      }, 1000);
      return () => { if (sosTimerRef.current) clearInterval(sosTimerRef.current); };
    }
  }, [sosActive, sosCountdown]);

  // SOS fired — runs once when countdown reaches zero
  const sosFiredRef = useRef(false);
  useEffect(() => {
    if (!sosActive || sosCountdown !== 0 || sosFiredRef.current) return;
    sosFiredRef.current = true;
    showToast('SOS sent to your emergency contacts');
    if (settings.shareLocation && location) {
      const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
      if (navigator.share) {
        navigator.share({
          title: 'Emergency SOS',
          text: `${settings.sosMessage} My location: ${mapsUrl}`,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(`${settings.sosMessage} My location: ${mapsUrl}`).catch(() => {});
      }
    } else {
      showToast('SOS sent — enable location sharing for best results');
    }
  }, [sosActive, sosCountdown, location, settings, showToast]);

  const triggerSOS = () => {
    sosFiredRef.current = false;
    setSosCountdown(5);
    setSosActive(true);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setSosCountdown(5);
    if (sosTimerRef.current) clearInterval(sosTimerRef.current);
  };

  const refreshLocation = () => {
    if (!navigator.geolocation) { setLocationStatus('denied'); return; }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const addContact = (name: string, phone: string, relationship: string) => {
    const newContact: EmergencyContact = {
      id: `c-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim(),
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    saveContacts(updated);
    showToast('Contact added');
  };

  const deleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
    showToast('Contact removed');
  };

  const updateSettings = (s: AppSettings) => {
    setSettings(s);
    saveSettings(s);
    showToast('Settings saved');
  };

  const stopWalkthrough = useCallback(() => {
    setWalkthroughStep(null);
    window.speechSynthesis?.cancel();
  }, []);

  const startWalkthrough = useCallback(() => {
    setView(WALKTHROUGH_STEPS[0].view);
    setWalkthroughStep(0);
  }, []);

  const advanceWalkthrough = useCallback(() => {
    if (walkthroughStep === null) return;
    const nextStep = walkthroughStep + 1;
    if (nextStep >= WALKTHROUGH_STEPS.length) {
      stopWalkthrough();
      return;
    }
    setView(WALKTHROUGH_STEPS[nextStep].view);
    setWalkthroughStep(nextStep);
  }, [stopWalkthrough, walkthroughStep]);

  useEffect(() => {
    if (walkthroughStep === null || !walkthroughAudio) return;
    const step = WALKTHROUGH_STEPS[walkthroughStep];
    window.speechSynthesis?.cancel();
    if (window.speechSynthesis) {
      const announcement = new SpeechSynthesisUtterance(`${step.title}. ${step.description}`);
      announcement.rate = 0.95;
      announcement.pitch = 1;
      window.speechSynthesis.speak(announcement);
    }
  }, [walkthroughAudio, walkthroughStep]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const NAV_ITEMS: { view: View; label: string; icon: typeof Shield }[] = [
    { view: 'home', label: 'Home', icon: Shield },
    { view: 'contacts', label: 'Contacts', icon: Users },
    { view: 'check', label: 'Safety Check', icon: Clock },
    { view: 'resources', label: 'Resources', icon: Info },
    { view: 'settings', label: 'Settings', icon: Settings },
    { view: 'tools', label: 'Tools', icon: Wrench },
  ];

  return (
    <section id="safety-app" className="min-h-screen bg-softgray">
      {/* Header */}
      <header className="bg-navy-900 text-white sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {view !== 'home' && (
            <button
              onClick={() => setView('home')}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={startWalkthrough}
            className="flex items-center gap-2 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            aria-label="Start the Safety App walkthrough"
          >
            <img
              src="/safety-logo-s.webp"
              alt="Safety App logo"
              className="w-9 h-9 rounded-xl transition-transform hover:scale-105"
            />
            <div>
              <h1 className="text-lg font-bold leading-none">Safety App</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">Tap logo for a walkthrough</p>
            </div>
          </button>
          <div className="ml-auto flex items-center gap-1.5 text-xs">
            <span className={`w-2 h-2 rounded-full ${locationStatus === 'granted' ? 'bg-emerald-400' : locationStatus === 'loading' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-slate-400">{locationStatus === 'granted' ? 'Location on' : locationStatus === 'loading' ? 'Locating…' : locationStatus === 'denied' ? 'Location off' : 'No GPS'}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {view === 'home' && (
          <HomeView
            contacts={contacts}
            sosActive={sosActive}
            sosCountdown={sosCountdown}
            onTriggerSOS={triggerSOS}
            onCancelSOS={cancelSOS}
            location={location}
            locationStatus={locationStatus}
            onRefreshLocation={refreshLocation}
            onNavigate={setView}
          />
        )}
        {view === 'contacts' && (
          <ContactsView contacts={contacts} onAdd={addContact} onDelete={deleteContact} />
        )}
        {view === 'check' && (
          <SafetyCheckView location={location} settings={settings} />
        )}
        {view === 'resources' && <ResourcesView />}
        {view === 'settings' && (
          <SettingsView settings={settings} onSave={updateSettings} />
        )}
        {view === 'tools' && <ToolsView onNavigate={setView} />}
        {view === 'firstaid' && <FirstAidView />}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20">
        <div className="max-w-2xl mx-auto flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = view === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                  active ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {walkthroughStep !== null && (
        <>
          <div className="fixed inset-0 z-30 bg-slate-950/45 pointer-events-none" />
          <div className="fixed left-1/2 top-[38%] z-40 -translate-x-1/2 pointer-events-none animate-[bounce_1.8s_ease-in-out_infinite]">
            <div className="relative rounded-full bg-white p-4 shadow-2xl ring-4 ring-rose-400/30">
              <MousePointer2 className="h-10 w-10 -rotate-12 text-rose-500" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-rose-500 text-center text-sm font-bold leading-6 text-white">{walkthroughStep + 1}</span>
            </div>
          </div>
          <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:bottom-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <MousePointer2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Feature {walkthroughStep + 1} of {WALKTHROUGH_STEPS.length}</p>
                <h2 className="mt-1 text-lg font-bold text-navy-900">{WALKTHROUGH_STEPS[walkthroughStep].title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{WALKTHROUGH_STEPS[walkthroughStep].description}</p>
              </div>
              <button
                onClick={() => {
                  const nextAudio = !walkthroughAudio;
                  setWalkthroughAudio(nextAudio);
                  if (!nextAudio) window.speechSynthesis?.cancel();
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label={walkthroughAudio ? 'Mute walkthrough' : 'Enable walkthrough audio'}
              >
                {walkthroughAudio ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button onClick={stopWalkthrough} className="text-sm font-semibold text-slate-500 hover:text-slate-800">Exit walkthrough</button>
              <button onClick={advanceWalkthrough} className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-600">
                {walkthroughStep === WALKTHROUGH_STEPS.length - 1 ? 'Finish' : 'Next feature'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-navy-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}
    </section>
  );
}

// ---- Home View ----

function HomeView({
  contacts,
  sosActive,
  sosCountdown,
  onTriggerSOS,
  onCancelSOS,
  location,
  locationStatus,
  onRefreshLocation,
  onNavigate,
}: {
  contacts: EmergencyContact[];
  sosActive: boolean;
  sosCountdown: number;
  onTriggerSOS: () => void;
  onCancelSOS: () => void;
  location: { lat: number; lng: number } | null;
  locationStatus: 'idle' | 'loading' | 'granted' | 'denied';
  onRefreshLocation: () => void;
  onNavigate: (v: View) => void;
}) {
  return (
    <div className="space-y-5">
      {/* SOS Button */}
      <div className="flex flex-col items-center pt-4 pb-2">
        {sosActive && sosCountdown > 0 ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-44 h-44 rounded-full bg-rose-500 flex items-center justify-center shadow-2xl shadow-rose-500/30 animate-pulse">
              <span className="text-5xl font-bold text-white">{sosCountdown}</span>
            </div>
            <p className="text-sm font-semibold text-rose-600">Sending SOS in {sosCountdown}s…</p>
            <button
              onClick={onCancelSOS}
              className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-semibold text-sm hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        ) : sosActive && sosCountdown === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-44 h-44 rounded-full bg-rose-600 flex items-center justify-center shadow-2xl shadow-rose-500/40">
              <CheckCircle2 className="w-16 h-16 text-white" />
            </div>
            <p className="text-sm font-semibold text-rose-600">SOS sent to {contacts.length} contacts</p>
          </div>
        ) : (
          <>
            <button
              onClick={onTriggerSOS}
              disabled={contacts.length === 0}
              className="relative w-44 h-44 rounded-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl shadow-rose-500/30 transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-20 group-hover:opacity-30" />
              <div className="relative flex flex-col items-center">
                <Siren className="w-12 h-12 text-white mb-1" />
                <span className="text-white font-bold text-lg">SOS</span>
              </div>
            </button>
            <p className="text-sm text-slate-500 mt-3 text-center max-w-xs">
              {contacts.length === 0
                ? 'Add emergency contacts first to enable SOS'
                : 'Press to send your location to your emergency contacts'}
            </p>
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAction
          icon={Share2}
          label="Share Location"
          onClick={() => {
            if (location && navigator.share) {
              navigator.share({
                title: 'My Location',
                text: `I'm here: https://maps.google.com/?q=${location.lat},${location.lng}`,
              }).catch(() => {});
            } else if (location && navigator.clipboard) {
              navigator.clipboard.writeText(`https://maps.google.com/?q=${location.lat},${location.lng}`);
            }
          }}
          disabled={!location}
        />
        <QuickAction
          icon={Phone}
          label="Call 911"
          onClick={() => { window.location.href = 'tel:911'; }}
        />
      </div>

      {/* Location card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-navy-900 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" /> Your Location
          </h3>
          <button
            onClick={onRefreshLocation}
            className="text-xs font-semibold text-navy-700 hover:text-navy-900 transition-colors"
          >
            Refresh
          </button>
        </div>
        {locationStatus === 'loading' && (
          <p className="text-sm text-slate-500">Getting your location…</p>
        )}
        {locationStatus === 'denied' && (
          <p className="text-sm text-slate-500">Location access denied. Enable it in your browser settings to share your location in emergencies.</p>
        )}
        {locationStatus === 'granted' && location && (
          <div className="space-y-1">
            <p className="text-sm font-mono text-navy-900">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
            <a
              href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-navy-600 hover:text-navy-900 underline"
            >
              View on Google Maps
            </a>
          </div>
        )}
        {locationStatus === 'idle' && (
          <p className="text-sm text-slate-500">Location not requested yet.</p>
        )}
      </div>

      {/* Contacts summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-navy-900 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-navy-700" /> Emergency Contacts
          </h3>
          <button
            onClick={() => onNavigate('contacts')}
            className="text-xs font-semibold text-navy-700 hover:text-navy-900 transition-colors"
          >
            {contacts.length > 0 ? 'Manage' : 'Add'}
          </button>
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-slate-500">No contacts yet. Add people you trust to be notified in an emergency.</p>
        ) : (
          <div className="space-y-2">
            {contacts.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-1.5">
                <div className="w-8 h-8 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">{c.relationship} · {c.phone}</p>
                </div>
                <a href={`tel:${c.phone}`} className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            ))}
            {contacts.length > 3 && (
              <p className="text-xs text-slate-500 pt-1">+ {contacts.length - 3} more</p>
            )}
          </div>
        )}
      </div>

      {/* Safety tips preview */}
      <div className="bg-navy-900 rounded-2xl p-5 text-white">
        <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-gold-500" /> Safety Tip
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Set up a Safety Check before going out. If you don't confirm you're safe before the timer ends, your contacts are automatically notified with your location.
        </p>
        <button
          onClick={() => onNavigate('check')}
          className="mt-3 text-xs font-semibold text-gold-500 hover:text-gold-400 transition-colors"
        >
          Set up Safety Check →
        </button>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick, disabled }: {
  icon: typeof Share2;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-navy-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-semibold text-navy-900">{label}</span>
    </button>
  );
}

// ---- Contacts View ----

function ContactsView({ contacts, onAdd, onDelete }: {
  contacts: EmergencyContact[];
  onAdd: (name: string, phone: string, relationship: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onAdd(name, phone, relationship);
    setName('');
    setPhone('');
    setRelationship('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy-900">Emergency Contacts</h2>
          <p className="text-sm text-slate-500 mt-0.5">People notified when you trigger SOS or miss a safety check.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors flex-shrink-0"
          aria-label="Add contact"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 animate-[fadeIn_0.2s_ease-out]">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mom"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555-123-4567"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Relationship (optional)</label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Parent, Spouse, Friend"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Save Contact
          </button>
        </form>
      )}

      {contacts.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No contacts yet. Tap the + button to add your first emergency contact.</p>
        </div>
      )}

      <div className="space-y-2">
        {contacts.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center font-bold flex-shrink-0">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy-900 text-sm">{c.name}</p>
              <p className="text-xs text-slate-500">{c.relationship || 'No relationship set'} · {c.phone}</p>
            </div>
            <a
              href={`tel:${c.phone}`}
              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              aria-label={`Call ${c.name}`}
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() => onDelete(c.id)}
              className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
              aria-label={`Delete ${c.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Safety Check View ----

function SafetyCheckView({ location, settings }: {
  location: { lat: number; lng: number } | null;
  settings: AppSettings;
}) {
  const [check, setCheck] = useState<SafetyCheck>({
    active: false,
    durationMin: 30,
    startedAt: null,
    remainingSec: 30 * 60,
  });
  const [checkToast, setCheckToast] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (check.active && check.remainingSec > 0) {
      timerRef.current = setInterval(() => {
        setCheck((prev) => ({ ...prev, remainingSec: Math.max(0, prev.remainingSec - 1) }));
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [check.active]);

  useEffect(() => {
    if (check.active && check.remainingSec === 0) {
      setCheck((prev) => ({ ...prev, active: false }));
      setCheckToast('Safety check expired — emergency contacts notified');
      if (settings.shareLocation && location && navigator.clipboard) {
        const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
        navigator.clipboard.writeText(`Safety check expired. Last known location: ${mapsUrl}`);
      }
      setTimeout(() => setCheckToast(null), 4000);
    }
  }, [check.active, check.remainingSec, location, settings]);

  const startCheck = () => {
    setCheck({
      active: true,
      durationMin: check.durationMin,
      startedAt: Date.now(),
      remainingSec: check.durationMin * 60,
    });
  };

  const cancelCheck = () => {
    setCheck((prev) => ({ ...prev, active: false, remainingSec: prev.durationMin * 60 }));
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const markSafe = () => {
    setCheck({ active: false, durationMin: check.durationMin, startedAt: null, remainingSec: check.durationMin * 60 });
    if (timerRef.current) clearInterval(timerRef.current);
    setCheckToast('You marked yourself safe');
    setTimeout(() => setCheckToast(null), 3000);
  };

  const durations = [15, 30, 60, 120];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-navy-900">Safety Check</h2>
        <p className="text-sm text-slate-500 mt-0.5">Set a timer. If you don't confirm you're safe before it ends, your contacts are notified automatically.</p>
      </div>

      {!check.active ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setCheck((prev) => ({ ...prev, durationMin: d, remainingSec: d * 60 }))}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                    check.durationMin === d
                      ? 'bg-navy-900 text-white border-navy-900'
                      : 'bg-white text-navy-700 border border-slate-200 hover:border-navy-300'
                  }`}
                >
                  {d < 60 ? `${d}m` : `${d / 60}h`}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={startCheck}
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" /> Start Safety Check
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-40 h-40 rounded-full bg-navy-900 flex items-center justify-center shadow-xl">
              <span className="text-4xl font-bold text-white font-mono">{formatTime(check.remainingSec)}</span>
            </div>
            <p className="text-sm text-slate-500">
              {check.remainingSec > 0 ? 'Confirm you\'re safe before time runs out' : 'Time expired'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={markSafe}
              className="py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> I'm Safe
            </button>
            <button
              onClick={cancelCheck}
              className="py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" /> Cancel
            </button>
          </div>
          {location && (
            <div className="text-center text-xs text-slate-500">
              <MapPin className="w-3 h-3 inline mr-1" />
              Location will be shared if timer expires
            </div>
          )}
        </div>
      )}

      {checkToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-navy-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-[fadeIn_0.2s_ease-out]">
          {checkToast}
        </div>
      )}
    </div>
  );
}

// ---- Resources View ----

function ResourcesView() {
  const resources = [
    {
      title: 'National Domestic Violence Hotline',
      phone: '1-800-799-7233',
      description: '24/7 confidential support for anyone affected by domestic violence.',
      icon: Phone,
    },
    {
      title: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: 'Free, 24/7 crisis support via text message.',
      icon: Bell,
    },
    {
      title: 'Suicide & Crisis Lifeline',
      phone: '988',
      description: 'Call or text 988 for free, confidential support if you are in distress.',
      icon: Phone,
    },
    {
      title: 'Poison Control',
      phone: '1-800-222-1222',
      description: 'Expert help for poison emergencies, available 24/7.',
      icon: AlertTriangle,
    },
    {
      title: 'FEMA Emergency Alerts',
      phone: 'Visit ready.gov',
      description: 'Information on wireless emergency alerts and disaster preparedness.',
      icon: Info,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-navy-900">Emergency Resources</h2>
        <p className="text-sm text-slate-500 mt-0.5">Quick access to national emergency hotlines and safety resources.</p>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-rose-800">
          If you are in immediate danger, call <strong>911</strong> (or your local emergency number) right away. This app is a supplement to, not a replacement for, emergency services.
        </p>
      </div>

      {resources.map((r, i) => {
        const Icon = r.icon;
        return (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-navy-900 text-sm">{r.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.description}</p>
                <a
                  href={r.phone.startsWith('Text') ? undefined : `tel:${r.phone.replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 mt-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> {r.phone}
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Tools View ----

function ToolsView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const tools = [
    {
      title: 'First Aid',
      description: 'Step-by-step guides for bleeding, burns, choking, CPR, and more.',
      icon: HeartPulse,
      className: 'bg-rose-50 text-rose-600 border-rose-200',
      action: 'firstaid' as View,
    },
    {
      title: 'Police',
      description: 'Call for immediate danger, a crime in progress, or when you need urgent police assistance.',
      icon: Shield,
      className: 'bg-navy-50 text-navy-700 border-navy-200',
      phone: '911',
    },
    {
      title: 'Fire',
      description: 'Call for a fire, smoke, gas leak, or another immediate fire hazard. Move away from danger if it is safe to do so.',
      icon: Flame,
      className: 'bg-amber-50 text-amber-600 border-amber-200',
      phone: '911',
    },
    {
      title: 'Ambulance',
      description: 'Call for a serious injury, trouble breathing, chest pain, or any medical emergency.',
      icon: Ambulance,
      className: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      phone: '911',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-navy-900">Safety Tools</h2>
        <p className="text-sm text-slate-500 mt-0.5">Quick guidance and emergency calling options.</p>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
        <p className="text-sm text-rose-800">
          If someone is in immediate danger, call <strong>911</strong> or your local emergency number now.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.title} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${tool.className}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-navy-900 text-sm">{tool.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tool.description}</p>
                </div>
              </div>
              {tool.action ? (
                <button
                  onClick={() => onNavigate(tool.action!)}
                  className="mt-4 w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <HeartPulse className="w-4 h-4" /> Open Guide
                </button>
              ) : tool.phone ? (
                <a
                  href={`tel:${tool.phone}`}
                  className="mt-4 w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call {tool.phone}
                </a>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Settings View ----

function SettingsView({ settings, onSave }: {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
}) {
  const [draft, setDraft] = useState<AppSettings>(settings);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-navy-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Customize your SOS message and location sharing.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">SOS Message</label>
          <textarea
            value={draft.sosMessage}
            onChange={(e) => setDraft({ ...draft, sosMessage: e.target.value })}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">This message is sent along with your location when you trigger SOS.</p>
        </div>

        <div className="space-y-3">
          <ToggleRow
            label="Share Location with SOS"
            description="Include your GPS coordinates when sending SOS alerts"
            checked={draft.shareLocation}
            onChange={(v) => setDraft({ ...draft, shareLocation: v })}
          />
          <ToggleRow
            label="Alarm Sound"
            description="Play a loud tone when SOS is triggered"
            checked={draft.alarmSound}
            onChange={(v) => setDraft({ ...draft, alarmSound: v })}
          />
        </div>

        <button
          onClick={() => onSave(draft)}
          className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          Save Settings
        </button>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 text-center">
        <p className="text-xs text-slate-400">Safety App v1.0 — Your data stays on your device.</p>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 pr-4">
        <p className="text-sm font-semibold text-navy-900">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-rose-500' : 'bg-slate-300'}`}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ---- First Aid View ----

interface FirstAidGuide {
  id: string;
  title: string;
  icon: typeof HeartPulse;
  color: string;
  warning: string;
  steps: string[];
  doNot?: string[];
}

const FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    id: 'cpr',
    title: 'CPR (Adult)',
    icon: HeartPulse,
    color: 'bg-rose-50 text-rose-600 border-rose-200',
    warning: 'Only perform CPR if the person is unresponsive and not breathing normally.',
    steps: [
      'Call 911 immediately, or have someone else call while you begin.',
      'Lay the person flat on their back on a firm surface.',
      'Place the heel of one hand in the center of the chest, between the nipples. Place your other hand on top and interlock fingers.',
      'Push hard and fast — at least 2 inches deep, 100–120 compressions per minute.',
      'Let the chest fully recoil between compressions.',
      'Continue until emergency help arrives or the person starts breathing.',
      'If trained, give 30 compressions followed by 2 rescue breaths. Repeat.',
    ],
    doNot: [
      'Do not stop compressions to check for a pulse unless the person clearly responds.',
      'Do not lean on the chest between compressions — full recoil is essential.',
    ],
  },
  {
    id: 'choking',
    title: 'Choking (Heimlich)',
    icon: AlertTriangle,
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    warning: 'If the person cannot cough, speak, or breathe, act immediately.',
    steps: [
      'Call 911 if someone else is available to do so.',
      'Stand behind the person and wrap your arms around their waist.',
      'Make a fist with one hand and place it thumb-side just above the navel.',
      'Grasp the fist with your other hand and give quick, upward thrusts.',
      'Repeat thrusts until the object is dislodged or the person becomes unconscious.',
      'If the person becomes unconscious, lower them carefully and begin CPR.',
    ],
    doNot: [
      'Do not perform abdominal thrusts on infants under 1 year — use back blows instead.',
      'Do not give water or food if the airway might still be blocked.',
    ],
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding',
    icon: Ambulance,
    color: 'bg-red-50 text-red-600 border-red-200',
    warning: 'Call 911 for heavy, uncontrolled, or spurting bleeding.',
    steps: [
      'Call 911 immediately for serious bleeding.',
      'Apply firm, direct pressure on the wound with a clean cloth or gauze.',
      'Keep pressing — do not lift the cloth to check. Add more layers if it soaks through.',
      'If possible, elevate the injured area above heart level.',
      'If bleeding does not stop, apply pressure to the nearest pressure point.',
      'Keep the person warm and still while waiting for help.',
    ],
    doNot: [
      'Do not remove an embedded object — apply pressure around it instead.',
      'Do not use a tourniquet unless you are trained and bleeding is life-threatening.',
    ],
  },
  {
    id: 'burns',
    title: 'Burns',
    icon: Flame,
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    warning: 'Call 911 for large, deep, or facial/airway burns.',
    steps: [
      'Remove the person from the heat source and stop the burning.',
      'Cool the burn under cool (not cold) running water for 10–20 minutes.',
      'Remove jewelry or tight clothing near the burn before swelling begins.',
      'Cover loosely with a clean, non-stick dressing or plastic wrap.',
      'Give over-the-counter pain relief if the person is conscious.',
    ],
    doNot: [
      'Do not apply ice, butter, or ointments to the burn.',
      'Do not break blisters or peel away stuck clothing.',
    ],
  },
  {
    id: 'fracture',
    title: 'Suspected Fracture',
    icon: AlertTriangle,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    warning: 'Do not move the person if a neck, back, or head injury is suspected.',
    steps: [
      'Call 911 for any serious or suspected spinal injury.',
      'Keep the person still and support the injured area in the position found.',
      'Immobilize the area with a splint only if you are trained and it can be done without moving the limb.',
      'Apply a cold pack wrapped in cloth to reduce swelling.',
      'Treat any bleeding first (see Severe Bleeding).',
    ],
    doNot: [
      'Do not try to straighten or push back a deformed or protruding bone.',
      'Do not move the person unless they are in immediate danger.',
    ],
  },
  {
    id: 'shock',
    title: 'Shock',
    icon: Ambulance,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    warning: 'Shock is life-threatening. Call 911 immediately.',
    steps: [
      'Call 911 right away.',
      'Lay the person flat on their back.',
      'Elevate the legs about 12 inches, unless a fracture or head injury is suspected.',
      'Cover with a blanket to keep warm.',
      'Loosen tight clothing around the neck and chest.',
      'Turn the head to the side if vomiting occurs, to keep the airway clear.',
    ],
    doNot: [
      'Do not give the person food or water.',
      'Do not move the person unnecessarily.',
    ],
  },
  {
    id: 'seizure',
    title: 'Seizure',
    icon: AlertTriangle,
    color: 'bg-sky-50 text-sky-600 border-sky-200',
    warning: 'Call 911 if the seizure lasts more than 5 minutes or is a first-time seizure.',
    steps: [
      'Stay calm and time the seizure.',
      'Clear the area of hard or sharp objects.',
      'Gently guide the person to the floor if they are not already down.',
      'Place something soft under their head.',
      'Turn them onto their side once the shaking stops, to keep the airway clear.',
      'Stay with them until they are fully alert.',
    ],
    doNot: [
      'Do not hold the person down or restrain them.',
      'Do not put anything in their mouth.',
    ],
  },
  {
    id: 'stroke',
    title: 'Stroke (FAST)',
    icon: AlertTriangle,
    color: 'bg-red-50 text-red-600 border-red-200',
    warning: 'Every minute counts. Call 911 immediately if you suspect a stroke.',
    steps: [
      'F — Face: Ask the person to smile. Does one side droop?',
      'A — Arms: Ask them to raise both arms. Does one arm drift downward?',
      'S — Speech: Ask them to repeat a simple sentence. Is speech slurred?',
      'T — Time: If any sign is present, call 911 immediately.',
      'Note the time symptoms started and share it with responders.',
      'Keep the person calm and comfortable while waiting for help.',
    ],
    doNot: [
      'Do not give the person food, water, or medication.',
      'Do not drive them to the hospital — call an ambulance.',
    ],
  },
  {
    id: 'allergic',
    title: 'Severe Allergic Reaction',
    icon: Ambulance,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    warning: 'Anaphylaxis is life-threatening. Call 911 immediately.',
    steps: [
      'Call 911 right away.',
      'If the person has an epinephrine auto-injector (EpiPen), help them use it.',
      'Inject into the outer thigh and hold for the time specified on the device.',
      'Have the person lie flat with legs elevated. If breathing is hard, let them sit up.',
      'A second dose may be given after 5–15 minutes if symptoms do not improve.',
      'Stay with the person until emergency help arrives.',
    ],
    doNot: [
      'Do not assume symptoms will pass — anaphylaxis can worsen rapidly.',
      'Do not give oral medication if the person is having trouble breathing.',
    ],
  },
  {
    id: 'nosebleed',
    title: 'Nosebleed',
    icon: Info,
    color: 'bg-sky-50 text-sky-600 border-sky-200',
    warning: 'Seek medical care if bleeding lasts more than 20 minutes or is very heavy.',
    steps: [
      'Sit upright and lean slightly forward — do not tilt the head back.',
      'Pinch the soft part of the nose, just below the bony bridge.',
      'Hold pressure continuously for 10–15 minutes without letting go to check.',
      'Breathe through the mouth.',
      'Apply a cold pack to the bridge of the nose.',
    ],
    doNot: [
      'Do not tilt the head back — blood can flow down the throat.',
      'Do not pack the nose with cotton or tissue.',
    ],
  },
  {
    id: 'heat',
    title: 'Heat Exhaustion',
    icon: Flame,
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    warning: 'If the person is confused, stops sweating, or faints, call 911 — this may be heat stroke.',
    steps: [
      'Move the person to a cool, shaded, or air-conditioned area.',
      'Have them lie down and elevate the legs slightly.',
      'Loosen tight clothing.',
      'Give cool water to sip — small amounts, frequently.',
      'Apply cool, damp cloths to the skin or mist with water.',
    ],
    doNot: [
      'Do not give sports drinks or sugary beverages.',
      'Do not use ice baths for heat exhaustion — reserve for heat stroke under medical guidance.',
    ],
  },
  {
    id: 'hypothermia',
    title: 'Hypothermia',
    icon: Info,
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    warning: 'Call 911 for severe shivering, confusion, or loss of consciousness.',
    steps: [
      'Move the person to a warm, dry place.',
      'Remove wet clothing and replace with dry layers or blankets.',
      'Cover the head and neck — most heat is lost there.',
      'Give warm (not hot) non-alcoholic drinks if the person is fully alert.',
      'Warm the body gradually — use skin-to-skin contact or warm packs on the core.',
    ],
    doNot: [
      'Do not warm too quickly — rapid warming can cause dangerous heart rhythms.',
      'Do not give alcohol or massage the limbs.',
    ],
  },
];

function FirstAidView() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-rose-600 text-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <HeartPulse className="w-7 h-7 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold">First Aid Guide</h2>
            <p className="text-rose-100 text-sm mt-0.5">Step-by-step instructions for common emergencies.</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Always call 911 first</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              This guide is for reference only. In any emergency, call emergency services first, then follow these steps while you wait for help.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {FIRST_AID_GUIDES.map((guide) => {
          const Icon = guide.icon;
          const isOpen = expanded === guide.id;
          return (
            <div key={guide.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setExpanded(isOpen ? null : guide.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
                aria-expanded={isOpen}
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${guide.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="flex-1 font-semibold text-navy-900 text-sm">{guide.title}</h3>
                <ChevronLeft className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? '-rotate-90' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 space-y-4">
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-rose-700 leading-relaxed">{guide.warning}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Steps</p>
                    <ol className="space-y-2.5">
                      {guide.steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="text-sm text-slate-700 leading-relaxed pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {guide.doNot && guide.doNot.length > 0 && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Do NOT</p>
                      <ul className="space-y-2">
                        {guide.doNot.map((item, i) => (
                          <li key={i} className="flex gap-2.5">
                            <X className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-600 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a
                    href="tel:911"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Call 911
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400 pt-2 leading-relaxed">
        This guide is for educational purposes only and is not a substitute for professional medical care.
      </p>
    </div>
  );
}
