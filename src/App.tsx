import { useEffect, useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { DataPulseSite } from './components/DataPulseSite';
import { PulseOS } from './components/PulseOS';
import { SafetyApp } from './components/SafetyApp';
import { StatsLab } from './components/StatsLab';
import { VideoWalkthrough } from './components/VideoWalkthrough';
import { CookieConsent } from './components/CookieConsent';
import { InstallPrompt } from './components/InstallPrompt';

type AppView = 'site' | 'safety';

function App() {
  const hostname = window.location.hostname.toLowerCase();
  const appVariant = import.meta.env.VITE_APP_VARIANT;
  const isSafetyDomain = appVariant === 'safety' || hostname === 'safetyapp.com' || hostname === 'www.safetyapp.com';
  const isStatsLabDomain = appVariant === 'statslab' || hostname === 'statslab.app' || hostname === 'www.statslab.app';
  const isPulseOSDomain = appVariant === 'pulseos' || hostname === 'pulseosplatform.com' || hostname === 'www.pulseosplatform.com';
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search);
  const isWalkthroughPath = pathname === '/walkthrough' || searchParams.get('walkthrough') === '1';
  const [activeView, setActiveView] = useState<AppView>('site');

  useEffect(() => {
    const title = isSafetyDomain ? 'Safety App'
      : isStatsLabDomain ? 'StatsLab'
      : isPulseOSDomain ? 'PulseOS Platform'
      : 'DATAPULSE SOCIAL';
    const description = isSafetyDomain
      ? 'Personal safety tools for emergency contacts, SOS support, location sharing, safety check-ins, and first aid guidance.'
        : isStatsLabDomain
          ? 'Interactive statistics tool for datasets, descriptive stats, visualizations, and inference tests.'
          : isPulseOSDomain
            ? 'PulseOS — UbD-driven learning operations. Build curriculum units with Stage 1, 2, and 3 structure, assessments, and analytics.'
            : 'DATAPULSE SOCIAL creates practical learning experiences and focused digital tools.';
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);

    if (isPulseOSDomain) {
      const pulseOSUrl = 'https://pulseosplatform.com/';
      const pulseOSTitle = 'PulseOS Platform | UbD-Driven Learning Operations';
      const pulseOSDescription = 'PulseOS — UbD-driven learning operations. Build curriculum units with Stage 1, 2, and 3 structure, assessments, and analytics.';
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', pulseOSUrl);
      document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', 'PulseOS Platform');
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', pulseOSTitle);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', pulseOSDescription);
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', pulseOSUrl);
      document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', pulseOSTitle);
      document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', pulseOSDescription);
    }

    if (isSafetyDomain) {
      document.querySelector('link[rel="icon"][sizes="32x32"]')?.setAttribute('href', '/safety-favicon-32.png');
      document.querySelector('link[rel="icon"][sizes="16x16"]')?.setAttribute('href', '/safety-favicon-16.png');
      document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute('href', '/safety-apple-touch-icon.png');
      document.querySelector('link[rel="manifest"]')?.setAttribute('href', '/safety-manifest.json');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#07131f');
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'Safety App');
    } else if (isPulseOSDomain) {
      document.querySelector('link[rel="icon"][sizes="32x32"]')?.setAttribute('href', '/pulseos-favicon.svg');
      document.querySelector('link[rel="icon"][sizes="16x16"]')?.setAttribute('href', '/pulseos-favicon.svg');
      document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute('href', '/pulseos-favicon.svg');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a1a2f');
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'PulseOS');
      document.querySelector('link[rel="manifest"]')?.setAttribute('href', '/pulseos-manifest.json');
    }
  }, [isSafetyDomain, isStatsLabDomain, isPulseOSDomain]);

  if (isWalkthroughPath) {
    return <VideoWalkthrough />;
  }
  if (isPulseOSDomain) {
    return <><PulseOS /><InstallPrompt /></>;
  }
  if (isSafetyDomain) {
    return <><SafetyApp /><InstallPrompt /></>;
  }
  if (isStatsLabDomain) {
    return <><StatsLab /><InstallPrompt /></>;
  }

  const openApp = (view: 'safety') => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {activeView === 'site' && <DataPulseSite onOpenApp={openApp} />}

      {activeView !== 'site' && (
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
                {activeView === 'safety' && <Shield className="h-4 w-4 text-rose-600" />}
                {activeView === 'safety' ? 'Safety App' : ''}
              </div>
            </div>
          </div>
          <main>
            {activeView === 'safety' && <SafetyApp />}
          </main>
        </div>
      )}

      <CookieConsent />
      <InstallPrompt />
    </>
  );
}

export default App;
