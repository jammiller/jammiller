import { StrictMode } from 'react';
import { PulseOSAuthProvider } from './components/pulseos/usePulseOSAuth';
import { createRoot } from 'react-dom/client';
import { WorkforceMode } from './components/pulseos/WorkforceMode';
import { PulseOS } from './components/PulseOS';
import { LearningIntelligence } from './components/pulseos/LearningIntelligence';
import { ForemanPortal } from './components/pulseos/ForemanPortal';
import { TrustCenter, type TrustCenterView } from './components/pulseos/TrustCenter';
import './index.css';

const isPasswordRecovery = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'
  || new URLSearchParams(window.location.search).get('type') === 'recovery';
const pathname = window.location.pathname.replace(/\/$/, '') || '/';
const isForemanRoute = pathname === '/foreman';
const courseBuilderView = pathname === '/course-builder/assessments' ? 'assessments'
  : pathname === '/course-builder/analytics' ? 'analytics'
    : pathname === '/course-builder' ? 'workforce'
      : null;
const isLearningIntelligenceRoute = pathname === '/learning-intelligence' || pathname.startsWith('/learning-intelligence/');
const isTrustCenterRoute = pathname === '/trust-center' || pathname.startsWith('/trust-center/');
const trustCenterViews: TrustCenterView[] = ['risk-monitor', 'investigations', 'audit-logs', 'integrity-ai'];
const trustCenterView = trustCenterViews.find((v) => pathname === `/trust-center/${v}`) ?? 'overview';
const learningTool = pathname === '/learning-intelligence/lvi' ? 'lvi' : 'overview';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PulseOSAuthProvider>
    {isForemanRoute ? <ForemanPortal /> : isTrustCenterRoute ? <TrustCenter initialView={trustCenterView} /> : courseBuilderView ? <PulseOS initialView={courseBuilderView} brand="pulseos" /> : isLearningIntelligenceRoute ? <LearningIntelligence initialTool={learningTool} /> : <WorkforceMode initialView={isPasswordRecovery ? 'ojt' : 'library'} />}
    </PulseOSAuthProvider>
  </StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
      void (async () => {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const wasControlled = Boolean(navigator.serviceWorker.controller);
        await Promise.all(registrations.map((registration) => registration.unregister()));
        await Promise.all((await caches.keys()).map((key) => caches.delete(key)));

        if (wasControlled || registrations.length > 0) window.location.reload();
      })();
  });
}
