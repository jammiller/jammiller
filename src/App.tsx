import { useEffect, useState } from 'react';
import { ArrowLeft, GraduationCap, Shield, BarChart3 } from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AcutelyAware } from './components/AcutelyAware';
import { DataPulseSite } from './components/DataPulseSite';
import { PulseOS } from './components/PulseOS';
import { SafetyApp } from './components/SafetyApp';
import { StatsLab } from './components/StatsLab';
import { VideoWalkthrough } from './components/VideoWalkthrough';
import { EduSyncWalkthrough } from './components/EduSyncWalkthrough';
import { CookieConsent } from './components/CookieConsent';
import { InstallPrompt } from './components/InstallPrompt';

type AppView = 'site' | 'classroom' | 'safety' | 'statslab' | 'walkthrough' | 'pulseos';

type DataPulseView = 'classroom' | 'safety' | 'statslab' | 'pulseos';

function App() {
  const hostname = window.location.hostname.toLowerCase();
  const appVariant = import.meta.env.VITE_APP_VARIANT;
  const isSafetyDomain = appVariant === 'safety' || hostname === 'safetyapp.com' || hostname === 'www.safetyapp.com';
  const isEduSyncDomain = appVariant === 'edusync' || hostname === 'edusync.app' || hostname === 'www.edusync.app';
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search);
  const isWalkthroughPath = pathname === '/walkthrough' || searchParams.get('walkthrough') === '1';
  const isEduSyncWalkthroughPath = pathname === '/edusync-walkthrough' || searchParams.get('edusync') === '1';
  const [activeView, setActiveView] = useState<AppView>(isSafetyDomain ? 'safety' : isEduSyncDomain ? 'classroom' : 'site');

  useEffect(() => {
    const title = isSafetyDomain ? 'Safety App' : isEduSyncDomain ? 'DATAPULSE SOCIAL' : 'DATAPULSE SOCIAL';
    const description = isSafetyDomain
      ? 'Personal safety tools for emergency contacts, SOS support, location sharing, safety check-ins, and first aid guidance.'
      : isEduSyncDomain
        ? 'A focused classroom workspace for attendance, grading, analytics, lesson notes, and knowledge exchange.'
        : 'DATAPULSE SOCIAL creates practical learning experiences and focused digital tools.';
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);

    if (isSafetyDomain) {
      document.querySelector('link[rel="icon"][sizes="32x32"]')?.setAttribute('href', '/safety-favicon-32.png');
      document.querySelector('link[rel="icon"][sizes="16x16"]')?.setAttribute('href', '/safety-favicon-16.png');
      document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute('href', '/safety-apple-touch-icon.png');
      document.querySelector('link[rel="manifest"]')?.setAttribute('href', '/safety-manifest.json');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#07131f');
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'Safety App');
    } else if (isEduSyncDomain) {
      document.querySelector('link[rel="icon"][sizes="32x32"]')?.setAttribute('href', '/edusync-favicon-32.png');
      document.querySelector('link[rel="icon"][sizes="16x16"]')?.setAttribute('href', '/edusync-favicon-16.png');
      document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute('href', '/edusync-apple-touch-icon.png');
      document.querySelector('link[rel="manifest"]')?.setAttribute('href', '/edusync-manifest.json');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a1a2f');
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'EduSync');
    }
  }, [isEduSyncDomain, isSafetyDomain]);

  if (isWalkthroughPath) {
    return <VideoWalkthrough />;
  }
  if (isEduSyncWalkthroughPath) {
    return <EduSyncWalkthrough />;
  }
  if (isSafetyDomain) {
    return <><SafetyApp /><InstallPrompt /></>;
  }
  if (isEduSyncDomain) {
    return <><AcutelyAware /><InstallPrompt /></>;
  }

  const openApp = (view: DataPulseView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToSite = () => setActiveView('site');

  return (
    <>
      {activeView === 'site' && <DataPulseSite onOpenApp={openApp} />}

      {activeView !== 'site' && activeView !== 'pulseos' && (
        <div className="min-h-screen bg-white font-sans antialiased">
          <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
              <button
                onClick={() => setActiveView('site')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 transition-colors hover:text-gold-700"
              >
                <ArrowLeft className="h-4 w-4" /> Back to DATAPULSE SOCIAL
              </button>
              <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex">
                {activeView === 'classroom' && <GraduationCap className="h-4 w-4 text-navy-700" />}
                {activeView === 'safety' && <Shield className="h-4 w-4 text-rose-600" />}
                {activeView === 'statslab' && <BarChart3 className="h-4 w-4 text-navy-700" />}
                {activeView === 'classroom' ? 'EduSync' : activeView === 'safety' ? 'Safety App' : activeView === 'statslab' ? 'StatsLab' : ''}
              </div>
            </div>
          </div>
          <main>
            {activeView === 'classroom' && <AcutelyAware />}
            {activeView === 'safety' && <SafetyApp />}
            {activeView === 'statslab' && <StatsLab />}
            {activeView === 'walkthrough' && <VideoWalkthrough />}
          </main>
        </div>
      )}

      {activeView === 'pulseos' && (
        <PulseOS onBack={backToSite} />
      )}

      <CookieConsent />
      <InstallPrompt />
      <SpeedInsights />
    </>
  );
}

export default App;
