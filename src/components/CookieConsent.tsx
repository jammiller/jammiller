import { useState, useEffect } from 'react';
import { Cookie, X, Check, Shield } from 'lucide-react';

const STORAGE_KEY = 'dps_cookie_consent';
const CONSENT_EXPIRY_DAYS = 180;
const GA_MEASUREMENT_ID = 'G-L8EMSGHX28';

type ConsentChoice = 'accepted' | 'declined' | null;

interface StoredConsent {
  choice: ConsentChoice;
  timestamp: number;
}

function getStoredConsent(): ConsentChoice {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: StoredConsent = JSON.parse(raw);
    const ageMs = Date.now() - parsed.timestamp;
    const maxAgeMs = CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (ageMs > maxAgeMs) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.choice;
  } catch {
    return null;
  }
}

function saveConsent(choice: Exclude<ConsentChoice, null>) {
  const data: StoredConsent = { choice, timestamp: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadAnalytics() {
  if (window.GA4_LOADED) return;
  window.GA4_LOADED = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer!.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    GA4_LOADED?: boolean;
  }
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (consent === 'accepted') {
      loadAnalytics();
    } else if (consent === null) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChoice = (choice: 'accepted' | 'declined') => {
    saveConsent(choice);
    if (choice === 'accepted') {
      loadAnalytics();
    }
    setClosing(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[60] transition-all duration-300 ${
        closing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            <div className="flex items-start gap-4 p-6 sm:p-7 flex-1">
              <div className="w-11 h-11 bg-navy-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-navy-200">
                <Cookie className="w-5 h-5 text-gold-500" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-navy-900 mb-1.5 tracking-tight">
                  We value your privacy
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We use cookies to enhance your browsing experience, analyze site traffic, and
                  personalize content. By clicking "Accept all", you consent to our use of cookies.
                  See our{' '}
                  <a href="https://datapulsesocial.com/privacy" className="text-navy-900 font-medium hover:text-gold-600 underline underline-offset-2">
                    Privacy Policy
                  </a>{' '}
                  for details.
                </p>
              </div>
              <button
                onClick={() => handleChoice('declined')}
                className="sm:hidden p-1.5 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                aria-label="Decline cookies"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-5 sm:p-7 sm:pl-2 border-t sm:border-t-0 sm:border-l border-slate-100 bg-slate-50/50">
              <button
                onClick={() => handleChoice('declined')}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 whitespace-nowrap"
              >
                Decline
              </button>
              <button
                onClick={() => handleChoice('accepted')}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-xl shadow-md shadow-navy-900/20 hover:-translate-y-px transition-all duration-200 whitespace-nowrap flex items-center gap-2"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                Accept all
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-6 sm:px-7 pb-4 -mt-1">
            <Shield className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <p className="text-xs text-slate-400">
              Your choice is stored for {CONSENT_EXPIRY_DAYS} days. You can change it at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
