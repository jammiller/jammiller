import { StrictMode } from 'react';
import { PulseOSAuthProvider } from './components/pulseos/usePulseOSAuth';
import { createRoot } from 'react-dom/client';
import { WorkforceMode } from './components/pulseos/WorkforceMode';
import { PulseOS } from './components/PulseOS';
import { LearningIntelligence } from './components/pulseos/LearningIntelligence';
import { ForemanPortal } from './components/pulseos/ForemanPortal';
import { ConstructionReadiness, ProgramHeader, ProgramFooter } from './components/pulseos/ConstructionReadiness';
import { OJTPublicPage } from './components/pulseos/OJTPublicPage';
import './index.css';

const isPasswordRecovery = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'
  || new URLSearchParams(window.location.search).get('type') === 'recovery';
const pathname = window.location.pathname.replace(/\/$/, '') || '/';
const isPublicWorkforceRoute = pathname === '/competency-library' || pathname === '/role-builder';
const workforceView = pathname === '/role-builder' ? 'roles' : (pathname === '/ojt-workspace' || isPasswordRecovery) ? 'ojt' : 'library';
const isForemanRoute = pathname === '/foreman';
const courseBuilderView = pathname === '/course-builder/assessments' ? 'assessments'
  : pathname === '/course-builder/analytics' ? 'analytics'
    : pathname === '/course-builder' ? 'workforce'
      : null;
const isLearningIntelligenceRoute = pathname === '/learning-intelligence' || pathname.startsWith('/learning-intelligence/');
const learningTool = pathname === '/learning-intelligence/lvi' ? 'lvi' : 'overview';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {!isPasswordRecovery && (pathname === '/' || pathname === '/construction-workforce-readiness') ? (
      <ConstructionReadiness isHome={pathname === '/'} />
    ) : (
      <PulseOSAuthProvider>
        {pathname === '/ojt-compliance' ? <OJTPublicPage /> : isPublicWorkforceRoute ? (
          <div className="min-h-screen bg-softgray">
            <ProgramHeader sectionBase="/construction-workforce-readiness" />
            <main className="mx-auto max-w-6xl px-5 py-10"><WorkforceMode initialView={workforceView} /></main>
            <ProgramFooter sectionBase="/construction-workforce-readiness" />
          </div>
        ) : isForemanRoute ? <ForemanPortal /> : courseBuilderView ? <PulseOS initialView={courseBuilderView} brand="pulseos" /> : isLearningIntelligenceRoute ? <LearningIntelligence initialTool={learningTool} /> : <WorkforceMode initialView={workforceView} />}
      </PulseOSAuthProvider>
    )}
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
