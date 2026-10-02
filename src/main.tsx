import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WorkforceMode } from './components/pulseos/WorkforceMode';
import { PulseOS } from './components/PulseOS';
import { LearningIntelligence } from './components/pulseos/LearningIntelligence';
import { PulseOSLanding } from './components/pulseos/PulseOSLanding';
import { ForemanPortal } from './components/pulseos/ForemanPortal';
import App from './App.tsx';
import './index.css';

const hostname = window.location.hostname.toLowerCase();
const isPulseOS = hostname === 'pulseosplatform.com' || hostname === 'www.pulseosplatform.com' || hostname.startsWith('pulse-os-') || hostname === 'pulse-os-datapulse-social.vercel.app';
const isPasswordRecovery = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'
  || new URLSearchParams(window.location.search).get('type') === 'recovery';
const pathname = window.location.pathname.replace(/\/$/, '') || '/';
const isForemanRoute = pathname === '/foreman';
const isWorkforceRoute = pathname === '/workforce';
const isPulseOSLanding = isPulseOS && pathname === '/';
const courseBuilderView = pathname === '/course-builder/assessments' ? 'assessments'
  : pathname === '/course-builder/analytics' ? 'analytics'
    : pathname === '/course-builder' ? 'builder'
      : null;
const isLearningIntelligenceRoute = pathname === '/learning-intelligence' || pathname.startsWith('/learning-intelligence/');
const learningTool = pathname === '/learning-intelligence/lvi' ? 'lvi' : 'overview';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isForemanRoute ? <ForemanPortal /> : isPulseOSLanding ? <PulseOSLanding /> : courseBuilderView ? <PulseOS initialView={courseBuilderView} /> : isLearningIntelligenceRoute ? <LearningIntelligence initialTool={learningTool} /> : isWorkforceRoute || isPulseOS || isPasswordRecovery ? <WorkforceMode initialView={isPasswordRecovery ? 'ojt' : 'library'} /> : <App />}
  </StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    if (isPulseOS) {
      void (async () => {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const wasControlled = Boolean(navigator.serviceWorker.controller);
        await Promise.all(registrations.map((registration) => registration.unregister()));
        await Promise.all((await caches.keys()).map((key) => caches.delete(key)));

        if (wasControlled || registrations.length > 0) window.location.reload();
      })();
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
