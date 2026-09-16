import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WorkforceMode } from './components/pulseos/WorkforceMode';
import App from './App.tsx';
import './index.css';

const hostname = window.location.hostname.toLowerCase();
const isPulseOS = hostname === 'pulseosplatform.com' || hostname === 'www.pulseosplatform.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPulseOS ? <WorkforceMode /> : <App />}
  </StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
