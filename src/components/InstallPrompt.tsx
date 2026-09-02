import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const installedHandler = () => {
      setInstalled(true);
      setShowBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    if (isIOS() && !sessionStorage.getItem('ios-install-dismissed')) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
        window.removeEventListener('appinstalled', installedHandler);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleIOSClick = () => {
    setShowIOSModal(true);
    setShowBanner(false);
  };

  const dismissBanner = () => {
    setShowBanner(false);
    if (isIOS()) {
      sessionStorage.setItem('ios-install-dismissed', '1');
    }
  };

  const dismissModal = () => {
    setShowIOSModal(false);
    sessionStorage.setItem('ios-install-dismissed', '1');
  };

  if (installed) return null;

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-navy-900 rounded-2xl shadow-2xl border border-gold-500/30 overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-gold-500" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-semibold text-sm">Install App</h4>
                <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                  Add it to your home screen for quick access — works offline, just like a native app.
                </p>
              </div>
              <button
                onClick={dismissBanner}
                aria-label="Dismiss install prompt"
                className="text-slate-400 hover:text-white transition-colors flex-shrink-0 -mt-1 -mr-1 p-1"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={isIOS() ? handleIOSClick : handleInstall}
                className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Install Now
              </button>
            </div>
          </div>
        </div>
      )}

      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm px-4"
          onClick={dismissModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-bold text-navy-900 text-base">Install App</h3>
              <button
                onClick={dismissModal}
                aria-label="Close install instructions"
                className="text-slate-400 hover:text-navy-900 transition-colors p-1"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0 border border-navy-200">
                  <Share className="w-4 h-4 text-navy-900" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-navy-900 font-semibold text-sm">1. Tap the Share button</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    It's the square with the arrow pointing up, at the bottom of your screen.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0 border border-navy-200">
                  <PlusSquare className="w-4 h-4 text-navy-900" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-navy-900 font-semibold text-sm">2. Tap "Add to Home Screen"</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    Scroll the options and select "Add to Home Screen."
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-gold-50 flex items-center justify-center flex-shrink-0 border border-gold-200">
                  <Download className="w-4 h-4 text-gold-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-navy-900 font-semibold text-sm">3. Tap "Add"</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    The app icon will appear on your home screen. Tap it anytime to open the app.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={dismissModal}
                className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
