import { useEffect } from 'react';
import { DataPulseSite } from './components/DataPulseSite';
import { InsightsArticle, findInsightBySlug } from './components/InsightsArticle';
import { PulseOS } from './components/PulseOS';
import { SafetyApp } from './components/SafetyApp';
import { StatsLab } from './components/StatsLab';
import { VideoWalkthrough } from './components/VideoWalkthrough';
import { CookieConsent } from './components/CookieConsent';
import { InstallPrompt } from './components/InstallPrompt';
import { Harbor } from './components/Harbor';
import { Tremonix } from './components/Tremonix';
import { VoltEcho } from './components/VoltEcho';
import { APP_VARIANT } from './config';

function App() {
  const hostname = window.location.hostname.toLowerCase();
  const appVariant = APP_VARIANT || import.meta.env.VITE_APP_VARIANT;
  const isSafetyDomain = appVariant === 'safety' || hostname === 'safetyapp.com' || hostname === 'www.safetyapp.com';
  const isStatsLabDomain = appVariant === 'statslab' || hostname === 'statslab.app' || hostname === 'www.statslab.app';
  const isPulseOSDomain = appVariant === 'pulseos' || hostname === 'pulseosplatform.com' || hostname === 'www.pulseosplatform.com';
  const isHarborDomain = appVariant === 'harbor' || hostname === 'harborhush.website' || hostname === 'www.harborhush.website';
  const isTremonixDomain = appVariant === 'tremonix' || hostname === 'tremonix.com' || hostname === 'www.tremonix.com';
  const isVoltEchoDomain = appVariant === 'voltecho' || hostname === 'voltecho.app' || hostname === 'www.voltecho.app';
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const searchParams = new URLSearchParams(window.location.search);
  const isWalkthroughPath = pathname === '/walkthrough' || searchParams.get('walkthrough') === '1';

  // Insights article routes: /insights and /insights/:slug
  const insightsSlug = pathname === '/insights'
    ? ''
    : pathname.startsWith('/insights/')
      ? pathname.slice('/insights/'.length).replace(/\/+$/, '')
      : null;
  const insightPost = insightsSlug ? findInsightBySlug(insightsSlug) : null;

  useEffect(() => {
    const isPulseOS = isPulseOSDomain;
    const isHarbor = isHarborDomain;
    const title = isSafetyDomain ? 'Safety App'
      : isStatsLabDomain ? 'StatsLab'
      : isPulseOS ? 'PulseOS Platform'
      : isHarbor ? 'Harbor — Wellness Community Platform'
      : isTremonixDomain ? 'Tremonix — Revenue Leak Diagnostic'
      : isVoltEchoDomain ? 'VoltEcho — Smart Algorithm Hub'
      : insightPost
        ? `${insightPost.title} | DATAPULSE SOCIAL`
        : 'DATAPULSE SOCIAL';
    const description = isSafetyDomain
      ? 'Personal safety tools for emergency contacts, SOS support, location sharing, safety check-ins, and first aid guidance.'
        : isStatsLabDomain
          ? 'Interactive statistics tool for datasets, descriptive stats, visualizations, and inference tests.'
          : isPulseOS
            ? 'PulseOS — UbD-driven learning operations. Build curriculum units with Stage 1, 2, and 3 structure, assessments, and analytics.'
            : isHarbor
              ? 'A guided community experience platform designed to help wellness brands build intentional, supportive member communities.'
              : isTremonixDomain
                ? 'Tremonix — find the revenue your business is losing to slow response times, insufficient follow-up, and abandoned leads. Backed by published research.'
                : isVoltEchoDomain
                  ? 'VoltEcho — a single hub housing smart algorithms for data entry automation, customer churn prediction, and inventory forecasting.'
                  : insightPost
                    ? insightPost.excerpt
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
    } else if (isStatsLabDomain) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a1a2f');
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'StatsLab');
      document.querySelector('link[rel="manifest"]')?.setAttribute('href', '/statslab-manifest.json');
      document.querySelector('link[rel="icon"][sizes="32x32"]')?.setAttribute('href', '/statslab-app-icon.webp');
      document.querySelector('link[rel="icon"][sizes="16x16"]')?.setAttribute('href', '/statslab-app-icon.webp');
    } else if (isPulseOS) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a1a2f');
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'PulseOS');
      document.querySelector('link[rel="manifest"]')?.setAttribute('href', '/pulseos-manifest.json');
      document.querySelector('link[rel="icon"][sizes="32x32"]')?.setAttribute('href', '/pulseos-icon-512.webp');
      document.querySelector('link[rel="icon"][sizes="16x16"]')?.setAttribute('href', '/pulseos-icon-512.webp');
    } else if (isHarbor) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#1a3a42');
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'Harbor');
    } else if (isTremonixDomain) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a1f1a');
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'Tremonix');
    } else if (isVoltEchoDomain) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#000000');
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'VoltEcho');
    } else {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a1a2f');
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'DATAPULSE SOCIAL');
      document.querySelector('link[rel="manifest"]')?.setAttribute('href', '/manifest.json');
      document.querySelector('link[rel="icon"][sizes="32x32"]')?.setAttribute('href', '/favicon-32.png');
      document.querySelector('link[rel="icon"][sizes="16x16"]')?.setAttribute('href', '/favicon-16.png');
      document.querySelector('link[rel="apple-touch-icon"]')?.setAttribute('href', '/apple-touch-icon.png');
    }

    if (insightPost) {
      const canonical = `https://datapulsesocial.com/insights/${insightPost.slug}`;
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
      document.querySelector('meta[property="og:type"]')?.setAttribute('content', 'article');
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', insightPost.title);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', insightPost.excerpt);
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical);
      document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', insightPost.title);
      document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', insightPost.excerpt);
    }
  }, [isSafetyDomain, isStatsLabDomain, isPulseOSDomain, isHarborDomain, isTremonixDomain, isVoltEchoDomain, insightPost]);


  if (isWalkthroughPath) {
    return <VideoWalkthrough />;
  }
  if (isHarborDomain) {
    return <Harbor />;
  }
  if (isTremonixDomain) {
    return <Tremonix />;
  }
  if (isVoltEchoDomain) {
    return <VoltEcho />;
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
  if (insightPost) {
    return <InsightsArticle post={insightPost} />;
  }

  return (
    <>
      <DataPulseSite />

      <CookieConsent />
      <InstallPrompt />
    </>
  );
}

export default App;
