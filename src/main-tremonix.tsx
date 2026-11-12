import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Tremonix } from './components/Tremonix';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><Tremonix /></StrictMode>
);

// Replace legacy cache-first workers, without importing another product's shell.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
