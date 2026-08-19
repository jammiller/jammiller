import { useState, useMemo, useEffect } from 'react';
import {
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  Title,
  Chart as ChartJS,
} from 'chart.js';
import { Bar, Line, Scatter } from 'react-chartjs-2';
import {
  BarChart3,
  Sigma,
  TrendingUp,
  Database,
  Calculator,
  Info,
  RefreshCw,
  Download,
  Upload,
  Plus,
  Trash2,
  NormalPlay,
  ArrowLeft,
} from 'lucide-react';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  Title,
);

type ViewName = 'datasets' | 'descriptive' | 'visualization' | 'inference' | 'learn';

interface Dataset {
  id: string;
  name: string;
  description: string;
  data: number[];
  category: string;
}

const BUILT_IN_DATASETS: Dataset[] = [
  {
    id: 'exam-scores',
    name: 'Exam Scores',
    description: 'Final exam scores for a class of 30 students',
    category: 'Education',
    data: [72, 85, 90, 67, 78, 92, 88, 74, 81, 95, 68, 77, 83, 89, 71, 79, 86, 93, 75, 82, 69, 87, 91, 73, 80, 84, 76, 70, 94, 66],
  },
  {
    id: 'heights',
    name: 'Adult Heights (cm)',
    description: 'Heights of 40 adults measured in centimeters',
    category: 'Health',
    data: [165, 172, 180, 158, 170, 175, 182, 168, 163, 177, 185, 160, 174, 169, 171, 178, 166, 181, 173, 167, 176, 184, 162, 179, 172, 164, 183, 170, 168, 175, 186, 161, 174, 169, 177, 165, 180, 172, 159, 173],
  },
  {
    id: 'reaction-times',
    name: 'Reaction Times (ms)',
    description: 'Reaction times in milliseconds from a cognitive test',
    category: 'Psychology',
    data: [245, 280, 310, 198, 256, 302, 275, 220, 340, 268, 290, 235, 315, 260, 285, 210, 330, 250, 295, 270, 305, 240, 325, 265, 288, 215, 350, 255, 298, 272],
  },
  {
    id: 'plant-growth',
    name: 'Plant Growth (mm)',
    description: 'Weekly growth of 25 plants under controlled conditions',
    category: 'Biology',
    data: [12, 15, 18, 14, 20, 16, 22, 13, 19, 17, 21, 11, 24, 15, 18, 23, 14, 20, 16, 19, 25, 12, 17, 22, 15],
  },
  {
    id: 'daily-temp',
    name: 'Daily Temperatures',
    description: '30 days of temperature readings in a city',
    category: 'Environment',
    data: [18, 21, 23, 19, 25, 27, 22, 20, 24, 26, 19, 23, 28, 21, 25, 20, 22, 26, 24, 19, 27, 23, 21, 25, 29, 20, 24, 22, 26, 18],
  },
  {
    id: 'sales',
    name: 'Monthly Sales',
    description: 'Monthly revenue figures for a small business',
    category: 'Business',
    data: [4500, 5200, 4800, 6100, 5500, 6800, 7200, 5900, 6400, 7100, 7800, 8200],
  },
];

const TABS: { name: ViewName; label: string; icon: typeof Database; accent: string }[] = [
  { name: 'datasets', label: 'Datasets', icon: Database, accent: '#D4AF37' },
  { name: 'descriptive', label: 'Descriptive', icon: Sigma, accent: '#2d4568' },
  { name: 'visualization', label: 'Visualization', icon: BarChart3, accent: '#D4AF37' },
  { name: 'inference', label: 'Inference', icon: TrendingUp, accent: '#2d4568' },
  { name: 'learn', label: 'Learn', icon: Info, accent: '#D4AF37' },
];

const CHART_COLORS = {
  navy: '#0A1A2F',
  gold: '#D4AF37',
  blue: '#2d4568',
  line: '#e3e5e7',
  muted: '#565b62',
  fillLight: 'rgba(45, 69, 104, 0.08)',
  goldLight: 'rgba(212, 175, 55, 0.15)',
};

// ---- Statistics functions ----

function mean(data: number[]): number {
  return data.reduce((a, b) => a + b, 0) / data.length;
}

function median(data: number[]): number {
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function mode(data: number[]): number[] {
  const freq: Record<number, number> = {};
  data.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  if (maxFreq === 1) return [];
  return Object.entries(freq).filter(([, c]) => c === maxFreq).map(([v]) => Number(v));
}

function variance(data: number[]): number {
  const m = mean(data);
  return data.reduce((a, b) => a + (b - m) ** 2, 0) / data.length;
}

function stdDev(data: number[]): number {
  return Math.sqrt(variance(data));
}

function quartiles(data: number[]): { q1: number; q2: number; q3: number } {
  const sorted = [...data].sort((a, b) => a - b);
  const q2 = median(sorted);
  const lower = sorted.slice(0, Math.floor(sorted.length / 2));
  const upper = sorted.slice(Math.ceil(sorted.length / 2));
  return { q1: median(lower), q2, q3: median(upper) };
}

function range(data: number[]): number {
  return Math.max(...data) - Math.min(...data);
}

function skewness(data: number[]): number {
  const m = mean(data);
  const s = stdDev(data);
  if (s === 0) return 0;
  const n = data.length;
  return (n / ((n - 1) * (n - 2))) * data.reduce((a, b) => a + ((b - m) / s) ** 3, 0);
}

function kurtosis(data: number[]): number {
  const m = mean(data);
  const s = stdDev(data);
  if (s === 0) return 0;
  const n = data.length;
  return (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * data.reduce((a, b) => a + ((b - m) / s) ** 4, 0) - (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    denX += (x[i] - mx) ** 2;
    denY += (y[i] - my) ** 2;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

function oneSampleTTest(data: number[], hypothesizedMean: number): { t: number; df: number; pValue: number } {
  const n = data.length;
  const m = mean(data);
  const s = stdDev(data) * Math.sqrt(n / (n - 1)); // sample std dev
  const se = s / Math.sqrt(n);
  const t = se === 0 ? 0 : (m - hypothesizedMean) / se;
  const df = n - 1;
  // Approximate p-value using normal approximation for large df
  const pValue = 2 * (1 - normalCDF(Math.abs(t)));
  return { t, df, pValue };
}

function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

function histogramBins(data: number[], numBins: number): { labels: string[]; counts: number[]; binEdges: number[] } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / numBins;
  const edges: number[] = [];
  const labels: string[] = [];
  const counts: number[] = new Array(numBins).fill(0);
  for (let i = 0; i <= numBins; i++) edges.push(min + i * binWidth);
  for (let i = 0; i < numBins; i++) {
    labels.push(`${edges[i].toFixed(1)}–${edges[i + 1].toFixed(1)}`);
  }
  data.forEach((v) => {
    let bin = Math.floor((v - min) / binWidth);
    if (bin >= numBins) bin = numBins - 1;
    if (bin < 0) bin = 0;
    counts[bin]++;
  });
  return { labels, counts, binEdges: edges };
}

function normalPDF(x: number, mu: number, sigma: number): number {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

function normalCurvePoints(mu: number, sigma: number, min: number, max: number, n = 60): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const x = min + (i / n) * (max - min);
    pts.push({ x, y: normalPDF(x, mu, sigma) });
  }
  return pts;
}

function formatNum(n: number, decimals = 2): string {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(decimals);
}

// ---- Main component ----

export function StatsLab() {
  const [view, setView] = useState<ViewName>('datasets');
  const [activeDataset, setActiveDataset] = useState<Dataset>(BUILT_IN_DATASETS[0]);
  const [customData, setCustomData] = useState<string>('');
  const [useCustom, setUseCustom] = useState(false);
  const [numBins, setNumBins] = useState(8);
  const [hypothesizedMean, setHypothesizedMean] = useState(75);
  const [compareDataset, setCompareDataset] = useState<Dataset>(BUILT_IN_DATASETS[1]);

  const currentData = useCustom
    ? customData.split(/[,\s\n]+/).map(Number).filter((n) => !isNaN(n))
    : activeDataset.data;

  const stats = useMemo(() => {
    if (currentData.length === 0) return null;
    return {
      mean: mean(currentData),
      median: median(currentData),
      mode: mode(currentData),
      stdDev: stdDev(currentData),
      variance: variance(currentData),
      min: Math.min(...currentData),
      max: Math.max(...currentData),
      range: range(currentData),
      q: quartiles(currentData),
      skewness: skewness(currentData),
      kurtosis: kurtosis(currentData),
      n: currentData.length,
      sum: currentData.reduce((a, b) => a + b, 0),
    };
  }, [currentData]);

  const tTest = useMemo(() => {
    if (currentData.length < 2) return null;
    return oneSampleTTest(currentData, hypothesizedMean);
  }, [currentData, hypothesizedMean]);

  const correlation = useMemo(() => {
    if (currentData.length < 3) return null;
    return pearsonCorrelation(currentData, compareDataset.data);
  }, [currentData, compareDataset]);

  return (
    <section className="py-12 bg-softgray min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-3 tracking-tight">
            StatsLab — Explore, analyze, understand
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            An interactive statistics playground. Load a dataset, compute descriptive stats, visualize distributions, and run inferential tests — all in your browser.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row rounded-2xl overflow-hidden border border-slate-200 shadow-lg shadow-navy-900/5 bg-white min-h-[640px]">
          {/* Sidebar */}
          <nav className="lg:w-56 flex-shrink-0 bg-navy-900 text-white flex flex-col lg:sticky lg:top-0 lg:h-[640px]">
            <div className="px-6 pt-7 pb-5 border-b border-white/10">
              <div className="font-bold text-2xl tracking-wide">StatsLab</div>
              <div className="font-mono text-[11px] text-slate-400 mt-1 tracking-wide">
                statistics playground
              </div>
            </div>
            <ul className="flex-1 py-1.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.name}>
                    <button
                      onClick={() => setView(tab.name)}
                      className={`flex items-center gap-2.5 w-full text-left px-5 py-3 text-sm font-medium border-l-[3px] transition-all duration-150 whitespace-nowrap ${
                        view === tab.name
                          ? 'bg-white/10 text-white border-l-current'
                          : 'text-[#D8DBD2] border-l-transparent hover:bg-white/5 hover:text-white'
                      }`}
                      style={view === tab.name ? { color: tab.accent } : undefined}
                    >
                      <Icon className="w-4 h-4" />
                      <span className={view === tab.name ? 'text-white' : ''}>{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="px-5 pt-4 border-t border-white/10 mt-1 pb-5">
              <div className="text-[11px] text-slate-400 font-mono leading-relaxed">
                Active dataset
                <div className="text-white text-[13px] font-semibold mt-1 truncate">
                  {useCustom ? 'Custom data' : activeDataset.name}
                </div>
                <div className="text-slate-400 mt-0.5">
                  n = {currentData.length}
                </div>
              </div>
            </div>
          </nav>

          {/* Main */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="sticky top-0 z-10 bg-softgray/90 backdrop-blur-sm border-b border-slate-200 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-medium text-xl text-navy-900 m-0">
                  {TABS.find((t) => t.name === view)?.label}
                </h3>
                <div className="font-mono text-xs text-slate-500 mt-0.5">
                  {useCustom ? 'Custom dataset' : activeDataset.name} · n = {currentData.length}
                </div>
              </div>
              <div className="flex gap-2.5 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-navy-900" />
                  {stats ? `Mean: ${formatNum(stats.mean)}` : 'No data'}
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                  {stats ? `SD: ${formatNum(stats.stdDev)}` : '—'}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1">
              {view === 'datasets' && (
                <DatasetsView
                  datasets={BUILT_IN_DATASETS}
                  activeId={activeDataset.id}
                  onSelect={(ds) => { setActiveDataset(ds); setUseCustom(false); }}
                  customData={customData}
                  setCustomData={setCustomData}
                  useCustom={useCustom}
                  setUseCustom={setUseCustom}
                />
              )}
              {view === 'descriptive' && stats && (
                <DescriptiveView stats={stats} data={currentData} />
              )}
              {view === 'descriptive' && !stats && <EmptyState />}
              {view === 'visualization' && stats && (
                <VisualizationView data={currentData} stats={stats} numBins={numBins} setNumBins={setNumBins} />
              )}
              {view === 'visualization' && !stats && <EmptyState />}
              {view === 'inference' && tTest && stats && (
                <InferenceView
                  stats={stats}
                  tTest={tTest}
                  hypothesizedMean={hypothesizedMean}
                  setHypothesizedMean={setHypothesizedMean}
                  correlation={correlation}
                  compareDataset={compareDataset}
                  setCompareDataset={setCompareDataset}
                />
              )}
              {view === 'inference' && !tTest && <EmptyState />}
              {view === 'learn' && <LearnView />}

              <footer className="mt-8 font-mono text-[11px] text-slate-500">
                StatsLab — all calculations run locally in your browser
              </footer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Datasets View ----

function DatasetsView({ datasets, activeId, onSelect, customData, setCustomData, useCustom, setUseCustom }: {
  datasets: Dataset[];
  activeId: string;
  onSelect: (ds: Dataset) => void;
  customData: string;
  setCustomData: (v: string) => void;
  useCustom: boolean;
  setUseCustom: (v: boolean) => void;
}) {
  const [showCustom, setShowCustom] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const nums = text.split(/[,\s\n\r\t]+/).map(Number).filter((n) => !isNaN(n));
      setCustomData(nums.join(', '));
      setUseCustom(true);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {datasets.map((ds) => (
          <button
            key={ds.id}
            onClick={() => onSelect(ds)}
            className={`text-left p-5 rounded-[10px] border transition-all duration-150 ${
              !useCustom && activeId === ds.id
                ? 'border-navy-900 bg-navy-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-navy-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Database className="w-5 h-5 text-navy-500" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {ds.category}
              </span>
            </div>
            <h4 className="font-semibold text-navy-900 text-sm mb-1">{ds.name}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{ds.description}</p>
            <div className="font-mono text-[11px] text-slate-400 mt-3">
              n = {ds.data.length} · range [{Math.min(...ds.data)}, {Math.max(...ds.data)}]
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-6">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center gap-2 text-sm font-semibold text-navy-700 hover:text-navy-900 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showCustom ? 'Hide custom data input' : 'Use your own data'}
        </button>
        {showCustom && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Paste numbers (comma, space, or newline separated)
              </label>
              <textarea
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                placeholder="e.g. 12, 15, 18, 14, 20, 16, 22, 13, 19, 17"
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 min-h-[80px] resize-y"
              />
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <button
                onClick={() => { setUseCustom(true); }}
                className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg py-2 px-4 transition-colors ${
                  useCustom
                    ? 'bg-navy-900 text-white'
                    : 'border border-navy-900 text-navy-900 hover:bg-navy-50'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" /> Use custom data
              </button>
              <label className="flex items-center gap-1.5 text-xs font-semibold border border-slate-200 text-slate-700 rounded-lg py-2 px-4 hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Upload CSV/TXT
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
              {customData && (
                <button
                  onClick={() => { setCustomData(''); setUseCustom(false); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
            {customData && (
              <div className="text-xs text-slate-500 font-mono">
                {customData.split(/[,\s\n]+/).map(Number).filter((n) => !isNaN(n)).length} valid numbers detected
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Descriptive View ----

function DescriptiveView({ stats, data }: { stats: Record<string, number | number[]> & { q: { q1: number; q2: number; q3: number }; mode: number[] }; data: number[] }) {
  const statRows = [
    { label: 'Sample size (n)', value: stats.n, group: 'Basic' },
    { label: 'Sum', value: formatNum(stats.sum), group: 'Basic' },
    { label: 'Mean', value: formatNum(stats.mean), group: 'Central tendency' },
    { label: 'Median', value: formatNum(stats.median), group: 'Central tendency' },
    { label: 'Mode', value: stats.mode.length === 0 ? 'No mode' : stats.mode.map((m: number) => formatNum(m)).join(', '), group: 'Central tendency' },
    { label: 'Minimum', value: formatNum(stats.min), group: 'Spread' },
    { label: 'Maximum', value: formatNum(stats.max), group: 'Spread' },
    { label: 'Range', value: formatNum(stats.range), group: 'Spread' },
    { label: 'Q1 (25th percentile)', value: formatNum(stats.q.q1), group: 'Quartiles' },
    { label: 'Q2 (50th percentile)', value: formatNum(stats.q.q2), group: 'Quartiles' },
    { label: 'Q3 (75th percentile)', value: formatNum(stats.q.q3), group: 'Quartiles' },
    { label: 'IQR', value: formatNum(stats.q.q3 - stats.q.q1), group: 'Quartiles' },
    { label: 'Variance', value: formatNum(stats.variance), group: 'Variability' },
    { label: 'Std deviation', value: formatNum(stats.stdDev), group: 'Variability' },
    { label: 'Skewness', value: formatNum(stats.skewness, 3), group: 'Shape' },
    { label: 'Kurtosis', value: formatNum(stats.kurtosis, 3), group: 'Shape' },
  ];

  const groups = [...new Set(statRows.map((r) => r.group))];

  return (
    <div>
      <h3 className="font-serif font-medium text-lg text-navy-900 mb-1">Descriptive statistics</h3>
      <p className="text-slate-500 text-[13.5px] mb-5">
        Summary measures computed from your active dataset.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div key={group} className="bg-white border border-slate-200 rounded-[10px] p-5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gold-600 mb-3">{group}</h4>
            <div className="space-y-0">
              {statRows.filter((r) => r.group === group).map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-dashed border-slate-200 last:border-0">
                  <span className="text-[13px] text-slate-600">{row.label}</span>
                  <span className="font-mono text-sm font-semibold text-navy-900">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-navy-900 text-white rounded-[10px] p-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-gold-400 mb-3">Raw data</h4>
        <div className="font-mono text-[12px] text-slate-300 leading-relaxed break-all max-h-[120px] overflow-y-auto">
          [{data.join(', ')}]
        </div>
      </div>
    </div>
  );
}

// ---- Visualization View ----

function VisualizationView({ data, stats, numBins, setNumBins }: {
  data: number[];
  stats: any;
  numBins: number;
  setNumBins: (n: number) => void;
}) {
  const hist = useMemo(() => histogramBins(data, numBins), [data, numBins]);
  const normalCurve = useMemo(
    () => normalCurvePoints(stats.mean, stats.stdDev, stats.min, stats.max),
    [stats],
  );

  const boxPlotData = useMemo(() => {
    return {
      labels: ['Dataset'],
      datasets: [{
        label: 'Range',
        data: [[stats.min, stats.max]],
        backgroundColor: CHART_COLORS.fillLight,
        borderColor: CHART_COLORS.navy,
        borderWidth: 1,
        barThickness: 40,
      }],
    };
  }, [stats]);

  return (
    <div>
      <h3 className="font-serif font-medium text-lg text-navy-900 mb-1">Visualizations</h3>
      <p className="text-slate-500 text-[13.5px] mb-5">
        Histogram with optional normal curve overlay, and a five-number summary box plot.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs font-semibold text-slate-600">Bins:</label>
        <input
          type="range" min={4} max={20} step={1} value={numBins}
          onChange={(e) => setNumBins(Number(e.target.value))}
          className="w-32 accent-navy-900 cursor-pointer"
        />
        <span className="font-mono text-sm font-semibold text-navy-900">{numBins}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-[10px] p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-navy-900 mb-3">Histogram</h4>
          <div style={{ height: '260px' }}>
            <Bar
              data={{
                labels: hist.labels,
                datasets: [{
                  label: 'Frequency',
                  data: hist.counts,
                  backgroundColor: CHART_COLORS.blue,
                  borderRadius: 4,
                  barThickness: 'flex' as const,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: CHART_COLORS.line }, title: { display: true, text: 'Count' } },
                  x: { grid: { display: false }, ticks: { maxRotation: 45, font: { size: 9 } } },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[10px] p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-navy-900 mb-3">Normal curve overlay</h4>
          <div style={{ height: '260px' }}>
            <Line
              data={{
                labels: normalCurve.map((p) => formatNum(p.x, 1)),
                datasets: [{
                  label: 'Normal PDF',
                  data: normalCurve.map((p) => p.y),
                  borderColor: CHART_COLORS.gold,
                  backgroundColor: CHART_COLORS.goldLight,
                  fill: true,
                  tension: 0.4,
                  pointRadius: 0,
                  borderWidth: 2,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: CHART_COLORS.line }, title: { display: true, text: 'Density' } },
                  x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 9 } } },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white border border-slate-200 rounded-[10px] p-5 shadow-sm">
        <h4 className="text-sm font-semibold text-navy-900 mb-3">Five-number summary</h4>
        <div className="grid grid-cols-5 gap-2 text-center">
          {[
            { label: 'Min', value: stats.min },
            { label: 'Q1', value: stats.q.q1 },
            { label: 'Median', value: stats.q.q2 },
            { label: 'Q3', value: stats.q.q3 },
            { label: 'Max', value: stats.max },
          ].map((item) => (
            <div key={item.label} className="py-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</div>
              <div className="font-mono text-lg font-bold text-navy-900 mt-1">{formatNum(item.value)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 relative h-12">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full" />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-6 bg-navy-100 border-x-2 border-navy-300 rounded"
            style={{
              left: `${((stats.q.q1 - stats.min) / (stats.max - stats.min)) * 100}%`,
              width: `${((stats.q.q3 - stats.q.q1) / (stats.max - stats.min)) * 100}%`,
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-10 bg-gold-500 rounded"
            style={{ left: `calc(${((stats.q.q2 - stats.min) / (stats.max - stats.min)) * 100}% - 2px)` }}
          />
        </div>
      </div>
    </div>
  );
}

// ---- Inference View ----

function InferenceView({ stats, tTest, hypothesizedMean, setHypothesizedMean, correlation, compareDataset, setCompareDataset }: {
  stats: any;
  tTest: { t: number; df: number; pValue: number };
  hypothesizedMean: number;
  setHypothesizedMean: (n: number) => void;
  correlation: number | null;
  compareDataset: Dataset;
  setCompareDataset: (ds: Dataset) => void;
}) {
  const significant = tTest.pValue < 0.05;
  const corrStrength = correlation === null ? '—' :
    Math.abs(correlation) > 0.7 ? 'strong' :
    Math.abs(correlation) > 0.4 ? 'moderate' :
    Math.abs(correlation) > 0.2 ? 'weak' : 'negligible';
  const corrDirection = correlation === null ? '' : correlation > 0 ? 'positive' : correlation < 0 ? 'negative' : 'no';

  return (
    <div>
      <h3 className="font-serif font-medium text-lg text-navy-900 mb-1">Inferential statistics</h3>
      <p className="text-slate-500 text-[13.5px] mb-5">
        One-sample t-test and Pearson correlation — computed in real time.
      </p>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* T-test */}
        <div className="bg-white border border-slate-200 rounded-[10px] p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-navy-900 mb-1 flex items-center gap-2">
            <Sigma className="w-4 h-4 text-gold-500" /> One-sample t-test
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Tests whether your sample mean differs from a hypothesized value.
          </p>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hypothesized mean (H₀: μ = ?)</label>
            <input
              type="number"
              value={hypothesizedMean}
              onChange={(e) => setHypothesizedMean(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
            />
          </div>
          <div className="space-y-0">
            {[
              { label: 'Sample mean (x̄)', value: formatNum(stats.mean) },
              { label: 't-statistic', value: formatNum(tTest.t, 4) },
              { label: 'Degrees of freedom', value: tTest.df },
              { label: 'p-value (two-tailed)', value: formatNum(tTest.pValue, 4) },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-dashed border-slate-200 last:border-0">
                <span className="text-[13px] text-slate-600">{row.label}</span>
                <span className="font-mono text-sm font-semibold text-navy-900">{row.value}</span>
              </div>
            ))}
          </div>
          <div className={`mt-4 p-3 rounded-lg text-[13px] font-medium ${significant ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {significant
              ? `Reject H₀ at α = 0.05 — the sample mean differs significantly from ${hypothesizedMean}.`
              : `Fail to reject H₀ at α = 0.05 — no significant difference from ${hypothesizedMean}.`}
          </div>
        </div>

        {/* Correlation */}
        <div className="bg-white border border-slate-200 rounded-[10px] p-5 shadow-sm">
          <h4 className="text-sm font-semibold text-navy-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold-500" /> Pearson correlation
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Correlation between your active dataset and a comparison dataset.
          </p>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Compare with</label>
            <select
              value={compareDataset.id}
              onChange={(e) => {
                const ds = BUILT_IN_DATASETS.find((d) => d.id === e.target.value);
                if (ds) setCompareDataset(ds);
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
            >
              {BUILT_IN_DATASETS.map((ds) => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
            </select>
          </div>
          {correlation !== null ? (
            <>
              <div className="text-center py-4">
                <div className="font-mono text-4xl font-bold text-navy-900">{formatNum(correlation, 3)}</div>
                <div className="text-xs text-slate-500 mt-2">
                  {corrDirection} {corrStrength} correlation
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                  <span>-1.0</span><span>0</span><span>+1.0</span>
                </div>
                <div className="relative h-3 bg-slate-100 rounded-full">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gold-500 rounded-full border-2 border-white shadow"
                    style={{ left: `calc(${((correlation + 1) / 2) * 100}% - 6px)` }}
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-navy-50 rounded-lg text-[13px] text-navy-700">
                {Math.abs(correlation) > 0.7
                  ? 'Strong relationship — changes in one variable closely track the other.'
                  : Math.abs(correlation) > 0.4
                    ? 'Moderate relationship — some association is present.'
                    : Math.abs(correlation) > 0.2
                      ? 'Weak relationship — association is minimal.'
                      : 'Little to no linear relationship between the variables.'}
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-500 py-4 text-center">Need at least 3 data points.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Learn View ----

function LearnView() {
  const concepts = [
    {
      title: 'Mean vs Median',
      body: 'The mean is the arithmetic average — it sums all values and divides by count. The median is the middle value when data is sorted. When data is skewed or has outliers, the median is often a better measure of central tendency because it is not pulled by extreme values.',
      formula: 'x̄ = (Σxᵢ) / n',
    },
    {
      title: 'Standard Deviation',
      body: 'Standard deviation measures how spread out your data is from the mean. A low SD means values cluster tightly; a high SD means they are spread widely. It is the square root of variance.',
      formula: 'σ = √(Σ(xᵢ - x̄)² / n)',
    },
    {
      title: 'Quartiles & IQR',
      body: 'Quartiles split your data into four equal parts. Q1 is the 25th percentile, Q2 is the median (50th), and Q3 is the 75th. The interquartile range (IQR = Q3 - Q1) measures the spread of the middle 50% and is robust to outliers.',
      formula: 'IQR = Q3 - Q1',
    },
    {
      title: 'Skewness',
      body: 'Skewness measures the asymmetry of a distribution. Positive skew means a long right tail (a few high outliers). Negative skew means a long left tail. A value near 0 indicates a roughly symmetric distribution.',
      formula: 'Skew = E[(X - μ)³] / σ³',
    },
    {
      title: 'T-test',
      body: 'A one-sample t-test checks whether your sample mean is significantly different from a hypothesized value. The t-statistic measures how many standard errors the sample mean is from the hypothesized mean. A small p-value (< 0.05) suggests the difference is unlikely due to chance.',
      formula: 't = (x̄ - μ₀) / (s / √n)',
    },
    {
      title: 'Pearson Correlation',
      body: 'Pearson correlation (r) measures the linear relationship between two variables, ranging from -1 (perfect negative) to +1 (perfect positive). A value of 0 means no linear relationship. Correlation does not imply causation.',
      formula: 'r = Σ(xᵢ - x̄)(yᵢ - ȳ) / √(Σ(xᵢ - x̄)² · Σ(yᵢ - ȳ)²)',
    },
  ];

  return (
    <div>
      <h3 className="font-serif font-medium text-lg text-navy-900 mb-1">Learn</h3>
      <p className="text-slate-500 text-[13.5px] mb-5">
        Key statistical concepts explained simply. Each concept includes a plain-language explanation and its formula.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {concepts.map((c) => (
          <div key={c.title} className="bg-white border border-slate-200 rounded-[10px] p-5 shadow-sm">
            <h4 className="font-semibold text-navy-900 text-sm mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-gold-500" />
              {c.title}
            </h4>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-3">{c.body}</p>
            <div className="bg-navy-900 text-gold-400 font-mono text-[13px] px-4 py-2.5 rounded-lg text-center">
              {c.formula}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Empty State ----

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Database className="w-12 h-12 text-slate-300 mb-4" />
      <h4 className="font-semibold text-slate-600 mb-1">No data loaded</h4>
      <p className="text-sm text-slate-400">Select a dataset or enter your own data to begin.</p>
    </div>
  );
}
