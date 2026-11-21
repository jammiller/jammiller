type AnalyticsValue = string | number | boolean;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackAnalyticsEvent(
  eventName: string,
  parameters: Record<string, AnalyticsValue>,
  consentKey: string,
) {
  try {
    const consent = JSON.parse(localStorage.getItem(consentKey) ?? 'null') as {
      choice?: string;
      timestamp?: number;
    } | null;
    const ageMs = Date.now() - (consent?.timestamp ?? 0);
    const consentIsValid = consent?.choice === 'accepted'
      && Number.isFinite(consent.timestamp)
      && ageMs >= 0
      && ageMs <= 180 * 24 * 60 * 60 * 1000;
    if (!consentIsValid || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, parameters);
  } catch {
    return;
  }
}
