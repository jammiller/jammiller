import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WorkforceMode } from './components/pulseos/WorkforceMode';
import App from './App.tsx';
import './index.css';

const hostname = window.location.hostname.toLowerCase();
const isPulseOS = hostname === 'pulseosplatform.com' || hostname === 'www.pulseosplatform.com' || hostname.startsWith('pulse-os-') || hostname === 'pulse-os-datapulse-social.vercel.app';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPulseOS ? <WorkforceMode /> : <App />}
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
