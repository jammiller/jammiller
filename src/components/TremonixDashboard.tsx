import { useMemo, useState } from 'react';
import {
  audienceOptions,
  channelOptions,
  defaultAudience,
  generateMarketingPackage,
  getCurrentSeason,
  getSeasonTheme,
  type Audience,
  type Channel,
} from '../data/tremonixMessaging';

const copyToClipboard = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value);
    alert(`${label} copied to clipboard.`);
  } catch {
    alert(`Unable to copy ${label.toLowerCase()} automatically. Please copy it manually.`);
  }
};

export function TremonixDashboard() {
  const [selectedAudience, setSelectedAudience] = useState<Audience>(defaultAudience);
  const [selectedChannel, setSelectedChannel] = useState<Channel>('email');
  const [seasonOverride, setSeasonOverride] = useState<string | null>(null);

  const season = seasonOverride ?? getCurrentSeason();
  const packageData = useMemo(() => generateMarketingPackage({ audience: selectedAudience }), [selectedAudience]);
  const channelDetails = packageData.channels.find((channel) => channel.channel === selectedChannel) ?? packageData.channels[0];
  const seasonSummary = getSeasonTheme(season);

  const downloadPackage = () => {
    const blob = new Blob([JSON.stringify({ ...packageData, season }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tremonix-messaging-${selectedAudience}-${season.toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = async () => {
    const allText = packageData.channels
      .map((item) => `--- ${item.title} ---\n${item.subject ?? ''}\n${item.body}\nCTA: ${item.cta}\n`)
      .join('\n');

    await copyToClipboard(allText, 'all message variants');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Tremonix messaging control center
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Automated outreach dashboard</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
                This dashboard rotates messaging by season and audience, then generates ready-to-use versions for email, LinkedIn, X, and SMS.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadPackage}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50 hover:bg-emerald-500/10"
              >
                Download JSON
              </button>
              <button
                onClick={copyAll}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Copy all updates
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current season</p>
            <p className="mt-3 text-2xl font-bold text-white">{season}</p>
            <p className="mt-2 text-sm text-slate-300">{seasonSummary}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Audience</p>
            <p className="mt-3 text-2xl font-bold text-white">{audienceOptions.find((item) => item.value === selectedAudience)?.label}</p>
            <p className="mt-2 text-sm text-slate-300">Rotating by niche and season</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Active channel</p>
            <p className="mt-3 text-2xl font-bold text-white">{channelOptions.find((item) => item.value === selectedChannel)?.label}</p>
            <p className="mt-2 text-sm text-slate-300">Ready for send</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Message summary</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">{packageData.summary}</p>
          </div>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Audience</p>
            </div>
            <div className="space-y-2">
              {audienceOptions.map((audience) => (
                <button
                  key={audience.value}
                  onClick={() => setSelectedAudience(audience.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
                    selectedAudience === audience.value
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                      : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {audience.label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Season</p>
              <select
                value={seasonOverride ?? season}
                onChange={(event) => setSeasonOverride(event.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Autumn">Autumn</option>
                <option value="Winter">Winter</option>
              </select>
              <button
                onClick={() => setSeasonOverride(null)}
                className="mt-3 text-xs text-emerald-300 underline underline-offset-2"
              >
                Reset to current season
              </button>
            </div>
          </aside>

          <main className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Channel selector</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {channelOptions.map((channel) => (
                  <button
                    key={channel.value}
                    onClick={() => setSelectedChannel(channel.value)}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                      selectedChannel === channel.value
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                        : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {channel.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">{channelDetails.title}</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{channelDetails.subject ?? channelDetails.cta}</h2>
                </div>
                <button
                  onClick={() => copyToClipboard(channelDetails.subject ? `${channelDetails.subject}\n\n${channelDetails.body}` : channelDetails.body, channelDetails.title)}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Copy content
                </button>
              </div>

              {channelDetails.subject && (
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Subject</p>
                  <p className="text-sm text-white">{channelDetails.subject}</p>
                </div>
              )}

              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Body</p>
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{channelDetails.body}</pre>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => copyToClipboard(channelDetails.body, `${channelDetails.title} body`)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50 hover:bg-slate-800"
                >
                  Copy body
                </button>
                <button
                  onClick={() => copyToClipboard(channelDetails.cta, `${channelDetails.title} CTA`)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/50 hover:bg-slate-800"
                >
                  Copy CTA
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">All variants</p>
                <button
                  onClick={copyAll}
                  className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                >
                  Copy all
                </button>
              </div>

              <div className="space-y-4">
                {packageData.channels.map((item) => (
                  <div key={item.channel} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <button
                        onClick={() => copyToClipboard(item.subject ? `${item.subject}\n\n${item.body}` : item.body, item.title)}
                        className="text-xs font-medium text-emerald-300 underline underline-offset-2"
                      >
                        Copy
                      </button>
                    </div>
                    {item.subject && <p className="text-xs text-slate-400">{item.subject}</p>}
                    <p className="mt-3 text-sm leading-relaxed text-slate-200">{item.body}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300">CTA: {item.cta}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </section>
      </div>
    </div>
  );
}
