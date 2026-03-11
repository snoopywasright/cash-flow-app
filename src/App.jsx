import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart, PieChart, Pie, Cell, Legend } from 'recharts';
import { Upload, AlertCircle, TrendingDown, TrendingUp, DollarSign, Calendar, FileText, Layers, PieChart as PieIcon, ArrowRight, CheckCircle, Settings, Users, Activity, Plus, Trash2, Briefcase, Download, Info, BookOpen } from 'lucide-react';

// --- Static Data & Helpers ---

const LOCATIONS = ["California", "Texas", "Florida", "New York", "Illinois", "Ohio", "Georgia", "North Carolina", "Michigan", "New Jersey"];

const DEFAULT_BREAKDOWN = {
  Food: 1000, Lodging: 1200, Childcare: 300, Curriculum: 400,
  Meeting_Space: 500, AV: 200, Transportation: 100, Other: 50
};

// Labor CLIN tiers (events per year)
const LABOR_TIERS = [1500, 2000, 2500, 3000, 3500, 4000];

const getActiveTier = (eventsPerYear) =>
  LABOR_TIERS.reduce((prev, curr) =>
    Math.abs(curr - eventsPerYear) < Math.abs(prev - eventsPerYear) ? curr : prev
  );

const formatCurrency = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "$0";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
};

const formatCompact = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "$0";
  return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(val);
};

const gaussianRandom = () => {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-800",
    emerald: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

// --- Sub-Components ---

const DocsView = () => (
  <div className="max-w-5xl mx-auto space-y-8 p-8 bg-white rounded-xl shadow-sm border border-slate-200">
    <div className="border-b border-slate-100 pb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          <BookOpen size={24} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Event Cash Flow Analyzer</h1>
      </div>
      <p className="text-slate-600 text-lg leading-relaxed max-w-3xl">
        A React-based financial simulation tool for modeling cash flow, capital outlay, and profitability for large-scale event management contracts. ODC costs are event-driven; Labor is billed as separate annual FFP CLINs paid in equal monthly installments.
      </p>
    </div>

    <section>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Activity size={20} className="text-indigo-500" />
        Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
          <h3 className="font-semibold text-red-700 mb-1">Peak Cash Outlay</h3>
          <p className="text-sm text-red-600">Maximum capital required to float ODC costs before reimbursement arrives.</p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
          <h3 className="font-semibold text-emerald-700 mb-1">Net Profit</h3>
          <p className="text-sm text-emerald-600">ODC service fee revenue plus total Labor CLIN revenue over the contract period.</p>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <DollarSign size={20} className="text-indigo-500" />
        Financial Logic
      </h2>
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">1. ODC Cash Outflow (per event)</h3>
          <code className="block bg-white p-3 rounded border border-slate-200 text-slate-700 font-mono text-sm">
            Outflow = Sum(ODC Components) — paid on event day
          </code>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">2. ODC Reimbursement (delayed)</h3>
          <code className="block bg-white p-3 rounded border border-slate-200 text-slate-700 font-mono text-sm">
            Inflow = ODC Cost × (1 + Service Fee %) — paid after delay
          </code>
          <p className="text-xs text-slate-500 mt-1 ml-1">
            Delay follows a Gaussian distribution centered on the selected reimbursement delay.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">3. Labor CLIN Revenue (monthly, no delay)</h3>
          <code className="block bg-white p-3 rounded border border-slate-200 text-slate-700 font-mono text-sm">
            Monthly Inflow = CLIN 0002 Rate + CLIN 0003 Rate + CLIN 0004 Rate
          </code>
          <p className="text-xs text-slate-500 mt-1 ml-1">
            Rates are determined by the active event-volume tier. Paid as steady monthly FFP regardless of actual event count.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">4. Profit Sensitivity</h3>
          <p className="text-sm text-slate-700">
            Because Labor revenue is <strong>fixed</strong> while ODC costs are <strong>variable</strong>, fewer events → lower ODC costs → higher net profit. More events → higher ODC costs → lower net profit.
          </p>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Briefcase size={20} className="text-indigo-500" />
        Labor CLIN Structure
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-1">CLIN 0002</h3>
          <p className="text-sm text-blue-700 font-medium">Program Admin Labor Support</p>
          <p className="text-xs text-blue-600 mt-1">Tiered by annual event volume (1,500–4,000). Monthly FFP rate × 12 = annual revenue.</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <h3 className="font-semibold text-purple-800 mb-1">CLIN 0003</h3>
          <p className="text-sm text-purple-700 font-medium">Specialized Event Planner Support</p>
          <p className="text-xs text-purple-600 mt-1">Fixed monthly rate regardless of total event volume. Based on specialized event count (25–200/yr).</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
          <h3 className="font-semibold text-orange-800 mb-1">CLIN 0004</h3>
          <p className="text-sm text-orange-700 font-medium">Standard Event Planner Support</p>
          <p className="text-xs text-orange-600 mt-1">Tiered by annual event volume (1,500–4,000). Monthly FFP rate × 12 = annual revenue.</p>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Settings size={20} className="text-indigo-500" />
        Default Configuration
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-2">Financial Parameters</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• <strong>Avg. Reimbursement Delay:</strong> 90 days</li>
              <li>• <strong>Service Fee (on ODC):</strong> 2.0%</li>
              <li>• <strong>Cost Variance (Std Dev):</strong> 15%</li>
            </ul>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-2">Event Volume & Mix</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• <strong>Total Volume:</strong> 3,000 events/year</li>
              <li>• <strong>Specialized Events:</strong> 75/year (fixed count)</li>
              <li>• <strong>Basic/Standard split:</strong> 50/50 of remaining</li>
            </ul>
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-800 mb-2">Basic Event ODC Defaults</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Total ODC:</strong> ~$3,750/event</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <h3 className="font-semibold text-purple-800 mb-2">Standard Event ODC Defaults</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• <strong>Total ODC:</strong> $25,000/event</li>
            </ul>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
            <h3 className="font-semibold text-orange-800 mb-2">Specialized Event ODC Defaults</h3>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• <strong>Total ODC:</strong> $190,000/event</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Activity size={20} className="text-indigo-500" />
        Key Features
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "FFP Labor CLINs", desc: "Enter monthly rates for three labor CLINs (Program Admin, Standard Planner, Specialized Planner) tiered by event volume." },
          { title: "Event-Driven ODC Costs", desc: "ODC costs are variable per event. More events = higher ODC outlay. Labor revenue stays fixed." },
          { title: "Profit Sensitivity", desc: "Move the events/year slider to see how actual volume affects profit against fixed labor CLIN payments." },
          { title: "Specialized Event Count", desc: "Set an absolute count of specialized events per year (25–200) independent of total volume." },
          { title: "Cash Flow Timeline", desc: "Visualize the cumulative cash position including ODC float and steady monthly labor inflows." },
          { title: "Advanced Analytics", desc: "Track peak outlay, break-even timing, and total profitability across the 5-year simulation." },
        ].map((feature, i) => (
          <li key={i} className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">{i + 1}</div>
            <div>
              <strong className="text-slate-800 block">{feature.title}</strong>
              <span className="text-slate-600 text-sm">{feature.desc}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  </div>
);

const LaborBuilderView = ({ laborClins, setLaborClins, eventsPerYear }) => {
  const activeTier = getActiveTier(eventsPerYear);

  const updateTieredRate = (clin, tier, value) => {
    const val = parseFloat(value) || 0;
    setLaborClins(prev => ({ ...prev, [clin]: { ...prev[clin], [tier]: val } }));
  };

  const updateFixedRate = (value) => {
    setLaborClins(prev => ({ ...prev, specializedPlanner: parseFloat(value) || 0 }));
  };

  const monthlyTotal =
    (laborClins.programAdmin[activeTier] || 0) +
    (laborClins.standardPlanner[activeTier] || 0) +
    (laborClins.specializedPlanner || 0);
  const annualTotal = monthlyTotal * 12;

  const clinDefs = [
    { key: 'programAdmin', id: '0002', label: 'Program Admin Labor Support', tiered: true },
    { key: 'standardPlanner', id: '0004', label: 'Standard Event Planner Labor Support', tiered: true },
    { key: 'specializedPlanner', id: '0003', label: 'Specialized Event Planner Labor Support', tiered: false },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="text-red-600" size={20} />
            <div>
              <h3 className="font-semibold text-lg">Labor CLIN Pricing (FFP)</h3>
              <p className="text-xs text-slate-500">Fixed-price labor billed monthly — not tied to individual events</p>
            </div>
          </div>
          <div className="text-right bg-emerald-50 px-5 py-3 rounded-lg border border-emerald-100">
            <p className="text-xs text-emerald-600 uppercase tracking-wide font-medium">Active Tier: {activeTier.toLocaleString()} Events/Year</p>
            <p className="text-xl font-bold text-emerald-700">{formatCurrency(monthlyTotal)}<span className="text-sm font-normal">/mo</span></p>
            <p className="text-xs text-emerald-600">{formatCurrency(annualTotal)} annually</p>
          </div>
        </div>

        <div className="space-y-10">
          {clinDefs.map(({ key, id, label, tiered }) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-3">
                <Badge color="blue">CLIN {id}</Badge>
                <h4 className="font-semibold text-slate-700">{label}</h4>
                {!tiered && <Badge color="purple">Fixed Rate</Badge>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-2 px-3 font-medium">{tiered ? 'Event Volume Tier' : 'Description'}</th>
                      <th className="text-right py-2 px-3 font-medium w-40">Monthly Rate</th>
                      <th className="text-right py-2 px-3 font-medium w-36">Annual Total</th>
                      <th className="text-center py-2 px-3 font-medium w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiered ? LABOR_TIERS.map(tier => {
                      const isActive = tier === activeTier;
                      const rate = laborClins[key][tier] || 0;
                      return (
                        <tr key={tier} className={`border-b border-slate-100 last:border-0 ${isActive ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                          <td className={`py-2 px-3 font-medium ${isActive ? 'text-emerald-700' : 'text-slate-600'}`}>
                            {tier.toLocaleString()} Events / Year
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-slate-400 text-xs">$</span>
                              <input
                                type="number"
                                min="0"
                                value={rate || ''}
                                placeholder="0"
                                onChange={(e) => updateTieredRate(key, tier, e.target.value)}
                                className={`w-32 text-right border rounded py-1 px-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isActive ? 'border-emerald-300 bg-white' : 'border-slate-200 bg-white'}`}
                              />
                            </div>
                          </td>
                          <td className={`py-2 px-3 text-right font-medium ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {formatCurrency(rate * 12)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isActive
                              ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Active</span>
                              : <span className="text-slate-300 text-xs">—</span>}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr className="bg-emerald-50">
                        <td className="py-2 px-3 font-medium text-emerald-700">All Event Volumes (Fixed)</td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-slate-400 text-xs">$</span>
                            <input
                              type="number"
                              min="0"
                              value={laborClins.specializedPlanner || ''}
                              placeholder="0"
                              onChange={(e) => updateFixedRate(e.target.value)}
                              className="w-32 text-right border border-emerald-300 rounded py-1 px-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-medium text-emerald-700">
                          {formatCurrency((laborClins.specializedPlanner || 0) * 12)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Active</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 space-y-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">5-Year Totals (Active Tier · 60 months)</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">CLIN 0002</p>
              <p className="text-xs text-blue-400 mb-1">Program Admin</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency((laborClins.programAdmin[activeTier] || 0) * 60)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">CLIN 0003</p>
              <p className="text-xs text-purple-400 mb-1">Specialized Planner</p>
              <p className="text-lg font-bold text-purple-700">{formatCurrency((laborClins.specializedPlanner || 0) * 60)}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <p className="text-xs text-orange-600 uppercase tracking-wide font-medium">CLIN 0004</p>
              <p className="text-xs text-orange-400 mb-1">Standard Planner</p>
              <p className="text-lg font-bold text-orange-700">{formatCurrency((laborClins.standardPlanner[activeTier] || 0) * 60)}</p>
            </div>
          </div>
          <div className="p-4 bg-slate-800 rounded-lg text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Total Labor — All CLINs · 5 Years</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(
              ((laborClins.programAdmin[activeTier] || 0) +
               (laborClins.standardPlanner[activeTier] || 0) +
               (laborClins.specializedPlanner || 0)) * 60
            )}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Main Application ---

export default function CashFlowApp() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [rawData, setRawData] = useState(null);
  const [delayDays, setDelayDays] = useState(90);
  const [feePercent, setFeePercent] = useState(2.0);
  const [laborProfitPercent, setLaborProfitPercent] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("");

  // Simulation controls
  const [eventsPerYear, setEventsPerYear] = useState(3000);
  const [specializedPerYear, setSpecializedPerYear] = useState(75);
  const [stdDevPercent, setStdDevPercent] = useState(15);

  // Labor CLIN state — monthly rates per tier
  const [laborClins, setLaborClins] = useState({
    programAdmin:     { 1500: 290000, 2000: 350000, 2500: 410000, 3000: 470000, 3500: 530000, 4000: 590000 },
    standardPlanner:  { 1500: 290000, 2000: 350000, 2500: 410000, 3000: 470000, 3500: 530000, 4000: 590000 },
    specializedPlanner: 29167,
  });

  // Event Mix State — Basic/Standard pct now applies to non-specialized events
  const [eventMix, setEventMix] = useState({
    Basic: {
      pct: 50,
      color: '#3b82f6',
      breakdown: { ...DEFAULT_BREAKDOWN },
    },
    Standard: {
      pct: 50,
      color: '#8b5cf6',
      breakdown: { Food: 8000, Lodging: 10000, Childcare: 1000, Curriculum: 2000, Meeting_Space: 2000, AV: 1000, Transportation: 500, Other: 500 },
    },
    Specialized: {
      color: '#f59e0b',
      breakdown: { Food: 50000, Lodging: 60000, Childcare: 10000, Curriculum: 20000, Meeting_Space: 25000, AV: 15000, Transportation: 5000, Other: 5000 },
    }
  });

  // Cost Builder State
  const [builderProfile, setBuilderProfile] = useState('Standard');
  const [costBreakdown, setCostBreakdown] = useState({ ...DEFAULT_BREAKDOWN });

  const costColors = {
    Food: '#3b82f6', Lodging: '#8b5cf6', Childcare: '#ec4899', Curriculum: '#10b981',
    Meeting_Space: '#f59e0b', AV: '#6366f1', Transportation: '#06b6d4', Other: '#94a3b8'
  };

  const totalODCCost = Object.values(costBreakdown).reduce((a, b) => a + (parseFloat(b) || 0), 0);

  // Monthly labor revenue based on active tier
  const monthlyLaborRevenue = useMemo(() => {
    const tier = getActiveTier(eventsPerYear);
    return (laborClins.programAdmin[tier] || 0) +
           (laborClins.standardPlanner[tier] || 0) +
           (laborClins.specializedPlanner || 0);
  }, [laborClins, eventsPerYear]);

  // Regenerate data when controls change
  useEffect(() => {
    if (!fileName || fileName === "Generated Sample Data") {
      generateSampleData();
    }
  }, [eventMix, eventsPerYear, specializedPerYear, stdDevPercent]);

  const generateSampleData = () => {
    try {
      const sampleEvents = [];
      const startYear = 2026;
      const endYear = 2030;
      const safeTotal = Math.max(1, parseInt(eventsPerYear) || 1);
      const safeSpec = Math.min(Math.max(0, parseInt(specializedPerYear) || 0), safeTotal);
      const nonSpec = safeTotal - safeSpec;

      // Basic/Standard split of non-specialized events
      const basicPct = eventMix.Basic.pct;
      const standardPct = eventMix.Standard.pct;
      const mixTotal = basicPct + standardPct || 1;
      const basicCount = Math.round(nonSpec * basicPct / mixTotal);
      const standardCount = nonSpec - basicCount;

      for (let year = startYear; year <= endYear; year++) {
        // Build shuffled event list for the year
        const yearTypes = [
          ...Array(safeSpec).fill('Specialized'),
          ...Array(basicCount).fill('Basic'),
          ...Array(standardCount).fill('Standard'),
        ];
        for (let i = yearTypes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [yearTypes[i], yearTypes[j]] = [yearTypes[j], yearTypes[i]];
        }

        yearTypes.forEach((typeKey, i) => {
          const typeData = eventMix[typeKey];
          const z = gaussianRandom();
          const multiplier = Math.max(0.1, 1 + (z * (stdDevPercent / 100)));

          const scaledODC = {};
          let odcTotal = 0;
          if (typeData.breakdown) {
            Object.entries(typeData.breakdown).forEach(([key, val]) => {
              const scaled = (val || 0) * multiplier;
              scaledODC[key] = scaled;
              odcTotal += scaled;
            });
          }

          const dayOfYear = Math.floor((i * 365) / yearTypes.length);
          const globalDay = (year - startYear) * 365 + dayOfYear;
          const eventId = `FY${year}_${(i + 1).toString().padStart(5, '0')}`;
          const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
          const attendees = typeKey === 'Basic'
            ? Math.floor(20 + Math.random() * 80)
            : typeKey === 'Standard'
            ? Math.floor(100 + Math.random() * 200)
            : Math.floor(300 + Math.random() * 700);

          sampleEvents.push({
            d: globalDay,
            c: odcTotal,
            year,
            eventId,
            type: typeKey,
            location,
            attendees,
            breakdown: scaledODC,
            odcTotal,
            delayZ: gaussianRandom(),
          });
        });
      }

      setRawData({ startYear, events: sampleEvents });
      setFileName("Generated Sample Data");
    } catch (e) {
      console.error("Data generation error", e);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => processCSV(e.target.result);
    reader.readAsText(file);
  };

  const processCSV = (csvText) => {
    try {
      const lines = csvText.split('\n');
      const processedEvents = [];
      let minYear = 3000;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        const year = parseInt(cols[0]);
        const cost = parseFloat(cols[cols.length - 1]);
        if (!isNaN(year) && !isNaN(cost)) {
          if (year < minYear) minYear = year;
          const globalDay = (year - minYear) * 365 + Math.floor(Math.random() * 365);
          processedEvents.push({ d: globalDay, c: cost, odcTotal: cost, delayZ: gaussianRandom() });
        }
      }
      setRawData({ startYear: minYear, events: processedEvents });
    } catch (e) {
      console.error("CSV Parse Error", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCSV = () => {
    if (!rawData || !rawData.events) return;
    const headers = ["Year", "Event_ID", "Event_Type", "Location", "Attendees",
      "Food", "Lodging", "Childcare", "Curriculum", "Meeting_Space", "AV", "Transportation", "Other", "ODC_Total"];
    const csvContent = [
      headers.join(","),
      ...rawData.events.map(e => {
        if (!e.breakdown) return `${e.year || ''},${e.eventId || ''},Unknown,Unknown,0,,,,,,,,,${e.c.toFixed(2)}`;
        return [
          e.year, e.eventId, e.type, `"${e.location}"`, e.attendees,
          e.breakdown.Food?.toFixed(2) || 0, e.breakdown.Lodging?.toFixed(2) || 0,
          e.breakdown.Childcare?.toFixed(2) || 0, e.breakdown.Curriculum?.toFixed(2) || 0,
          e.breakdown.Meeting_Space?.toFixed(2) || 0, e.breakdown.AV?.toFixed(2) || 0,
          e.breakdown.Transportation?.toFixed(2) || 0, e.breakdown.Other?.toFixed(2) || 0,
          e.odcTotal.toFixed(2),
        ].join(",");
      })
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "simulation_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const simulationResults = useMemo(() => {
    if (!rawData || !rawData.events || rawData.events.length === 0) return null;
    try {
      const { startYear, events } = rawData;
      const lastEvent = events[events.length - 1];
      if (!lastEvent) return null;

      const lastEventDay = Math.max(0, lastEvent.d);
      const maxDay = lastEventDay + 200;
      if (maxDay > 100000) return null;

      const dailyNetChange = new Float32Array(maxDay + 1);
      let totalProjectCost = 0;
      let totalODCProfit = 0;
      let totalLaborRevenue = 0;

      // Per-event ODC cash flows
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const odc = event.odcTotal !== undefined ? event.odcTotal : (event.c || 0);
        totalProjectCost += odc;

        if (event.d >= 0 && event.d <= maxDay) dailyNetChange[event.d] -= odc;

        const odcProfit = odc * (feePercent / 100);
        totalODCProfit += odcProfit;
        const inflow = odc + odcProfit;

        const actualDelay = Math.max(1, Math.round(delayDays * (1 + (event.delayZ || 0) * 0.25)));
        const inflowDay = event.d + actualDelay;
        if (inflowDay <= maxDay) dailyNetChange[inflowDay] += inflow;
      }

      // Monthly labor CLIN inflows (steady, no delay)
      const totalMonths = Math.ceil(maxDay / 30.44) + 1;
      for (let month = 0; month < totalMonths; month++) {
        const day = Math.min(Math.round(month * 30.44), maxDay);
        if (monthlyLaborRevenue > 0) {
          dailyNetChange[day] += monthlyLaborRevenue;
          totalLaborRevenue += monthlyLaborRevenue;
        }
      }

      const chartData = [];
      let currentBalance = 0;
      let minBalance = 0;
      let peakDayIndex = 0;
      let breakEvenDayIndex = -1;
      const sampleRate = 7;

      for (let day = 0; day <= maxDay; day++) {
        currentBalance += dailyNetChange[day];
        if (currentBalance < minBalance) { minBalance = currentBalance; peakDayIndex = day; }
        if (breakEvenDayIndex === -1 && currentBalance > 0 && day > 0) breakEvenDayIndex = day;
        if (day % sampleRate === 0 || day === maxDay) {
          const year = startYear + Math.floor(day / 365);
          const month = Math.floor((day % 365) / 30.5);
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          chartData.push({ dayIndex: day, label: `${months[month % 12]} ${year}`, balance: isNaN(currentBalance) ? 0 : Math.round(currentBalance) });
        }
      }

      let breakEvenLabel = "Never";
      if (breakEvenDayIndex !== -1) {
        const year = startYear + Math.floor(breakEvenDayIndex / 365);
        const month = Math.floor((breakEvenDayIndex % 365) / 30.5);
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        breakEvenLabel = `${months[month % 12]} ${year}`;
      }

      const avgEventCost = events.length > 0 ? totalProjectCost / events.length : 0;
      const totalLaborProfit = totalLaborRevenue * (laborProfitPercent / 100);
      const totalProfit = totalODCProfit + totalLaborProfit;
      const floatDuration = totalProfit > 0 ? Math.round((avgEventCost * delayDays * events.length) / totalProfit) : Infinity;

      return {
        chartData,
        peakOutlay: minBalance,
        totalProfit,
        totalProjectCost,
        totalLaborRevenue,
        totalLaborProfit,
        totalODCProfit,
        peakDateLabel: chartData.find(d => d.dayIndex >= peakDayIndex)?.label || "N/A",
        breakEvenLabel,
        floatDuration: isFinite(floatDuration) ? floatDuration : null,
      };
    } catch (e) {
      console.error("Simulation error", e);
      return null;
    }
  }, [rawData, delayDays, feePercent, monthlyLaborRevenue, laborProfitPercent]);

  const handleApplyCostToSim = () => {
    setEventMix(prev => ({
      ...prev,
      [builderProfile]: {
        ...prev[builderProfile],
        breakdown: { ...costBreakdown },
      }
    }));
    setActiveTab('analysis');
    setFileName("Generated Sample Data");
  };

  const switchProfile = (newProfile) => {
    setBuilderProfile(newProfile);
    const saved = eventMix[newProfile];
    if (saved && saved.breakdown) setCostBreakdown(saved.breakdown);
  };

  const updateCostCategory = (category, value) => {
    const numValue = value === '' ? 0 : parseInt(value);
    setCostBreakdown(prev => ({ ...prev, [category]: isNaN(numValue) ? 0 : numValue }));
  };

  const updateBasicStandardMix = (type, value) => {
    const newVal = Math.min(100, Math.max(0, parseInt(value) || 0));
    const other = type === 'Basic' ? 'Standard' : 'Basic';
    setEventMix(prev => ({
      ...prev,
      [type]: { ...prev[type], pct: newVal },
      [other]: { ...prev[other], pct: 100 - newVal },
    }));
  };

  // Views
  const AnalysisView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6">
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Settings className="text-slate-600" size={20} />
            <h3 className="font-semibold text-lg">Scenario Controls</h3>
          </div>

          {/* Reimbursement Delay */}
          <div className="space-y-3">
            <div className="flex justify-between"><label className="text-sm font-medium text-slate-600">Avg. Reimbursement Delay</label><span className="font-bold text-indigo-600">{delayDays} Days</span></div>
            <input type="range" min="30" max="150" step="30" value={delayDays} onChange={(e) => setDelayDays(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            <div className="flex justify-between text-xs text-slate-400"><span>30d</span><span>150d</span></div>
            <p className="text-xs text-slate-400 italic">Actual delay varies by event (±25%)</p>
          </div>

          {/* Service Fee */}
          <div className="space-y-3">
            <div className="flex justify-between"><label className="text-sm font-medium text-slate-600">Service Fee (on ODC)</label><span className="font-bold text-emerald-600">{feePercent}%</span></div>
            <input type="range" min="0" max="10" step="0.5" value={feePercent} onChange={(e) => setFeePercent(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            <div className="flex justify-between text-xs text-slate-400"><span>0%</span><span>10%</span></div>
          </div>

          {/* Labor Profit Margin */}
          <div className="space-y-3">
            <div className="flex justify-between"><label className="text-sm font-medium text-slate-600">Labor Profit Margin</label><span className="font-bold text-violet-600">{laborProfitPercent}%</span></div>
            <input type="range" min="0" max="25" step="0.5" value={laborProfitPercent} onChange={(e) => setLaborProfitPercent(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500" />
            <div className="flex justify-between text-xs text-slate-400"><span>0%</span><span>25%</span></div>
            <p className="text-xs text-slate-400 italic">Profit embedded in labor CLIN revenue</p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-2"><Layers className="text-purple-600" size={20} /><h3 className="font-semibold text-lg">Event Mix & Volume</h3></div>

            {/* Events per Year */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-700">Events per Year</label>
                <span className="font-bold text-purple-700">{eventsPerYear.toLocaleString()}</span>
              </div>
              <input type="range" min="1500" max="5000" step="250" value={eventsPerYear}
                disabled={fileName !== "Generated Sample Data"}
                onChange={(e) => setEventsPerYear(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
              <div className="flex justify-between text-xs text-slate-400"><span>1,500</span><span>5,000</span></div>
              <p className="text-xs text-slate-400 italic">Active labor tier: <strong>{getActiveTier(eventsPerYear).toLocaleString()}</strong> events/yr</p>
            </div>

            {/* Specialized Events Count */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-amber-800">Specialized Events / Year</label>
                <span className="font-bold text-amber-700">{specializedPerYear}</span>
              </div>
              <input type="range" min="25" max="200" step="25" value={specializedPerYear}
                disabled={fileName !== "Generated Sample Data"}
                onChange={(e) => setSpecializedPerYear(parseInt(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500" />
              <div className="flex justify-between text-xs text-amber-600"><span>25</span><span>200</span></div>
            </div>

            {/* Cost Variance */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2"><Activity size={14} className="text-slate-500" /><label className="text-sm font-medium text-slate-700">Cost Variance (Std Dev)</label></div>
                <span className="font-bold text-slate-700">{stdDevPercent}%</span>
              </div>
              <input type="range" min="0" max="50" step="1" value={stdDevPercent}
                disabled={fileName !== "Generated Sample Data"}
                onChange={(e) => setStdDevPercent(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500" />
            </div>

            {/* Basic / Standard split */}
            <div className="space-y-3">
              {['Basic', 'Standard'].map((type) => (
                <div key={type} className="space-y-1 relative pl-3 border-l-2" style={{ borderColor: eventMix[type].color }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-700">{type} Events</span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{eventMix[type].pct}% of non-specialized</span>
                  </div>
                  <input type="range" min="0" max="100" step="5"
                    disabled={fileName !== "Generated Sample Data"}
                    value={eventMix[type].pct}
                    onChange={(e) => updateBasicStandardMix(type, e.target.value)}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: eventMix[type].color }} />
                </div>
              ))}
              <p className="text-xs text-slate-400 italic">
                Non-specialized: {(eventsPerYear - specializedPerYear).toLocaleString()} events/yr
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6 h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Cash Position Timeline</h3>
            <div className="flex items-center gap-4">
              {simulationResults && <div className="text-sm text-slate-400">Simulating {rawData?.events ? rawData.events.length.toLocaleString() : '...'} events</div>}
              <button onClick={downloadCSV} disabled={!rawData || fileName !== "Generated Sample Data"} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 text-xs px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Download size={14} /><span>Export CSV</span></button>
            </div>
          </div>
          <div className="flex-grow w-full">
            {simulationResults ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationResults.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" minTickGap={60} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(v) => [formatCurrency(v), "Net Cash Position"]} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  <ReferenceLine y={simulationResults.peakOutlay} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Peak Outlay', fill: '#ef4444', fontSize: 12 }} />
                  <Area type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-400">{isProcessing ? "Processing Data..." : "Loading Simulation..."}</div>}
          </div>
        </Card>

        {simulationResults && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5 bg-blue-50 border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-1">Total ODC Cost</p>
                <h2 className="text-xl font-bold text-blue-800">{formatCompact(simulationResults.totalProjectCost)}</h2>
                <p className="text-xs text-blue-600 mt-2">Variable per event</p>
              </Card>
              <Card className="p-5 bg-red-50 border-red-100">
                <p className="text-xs font-medium text-red-600 mb-1">Peak Cash Outlay</p>
                <h2 className="text-xl font-bold text-red-700">{formatCompact(simulationResults.peakOutlay)}</h2>
                <p className="text-xs text-red-500 mt-2">Max deficit: {simulationResults.peakDateLabel}</p>
              </Card>
              <Card className="p-5 bg-emerald-50 border-emerald-100">
                <p className="text-xs font-medium text-emerald-600 mb-1">Labor CLIN Revenue</p>
                <h2 className="text-xl font-bold text-emerald-700">{formatCompact(simulationResults.totalLaborRevenue)}</h2>
                <p className="text-xs text-emerald-600 mt-2">{formatCurrency(monthlyLaborRevenue)}/mo fixed</p>
              </Card>
              <Card className="p-5 bg-violet-50 border-violet-100">
                <p className="text-xs font-medium text-violet-600 mb-1">Net Profit</p>
                <h2 className="text-xl font-bold text-violet-700">{formatCompact(simulationResults.totalProfit)}</h2>
                <p className="text-xs text-violet-600 mt-2">ODC fee + {laborProfitPercent}% of labor revenue</p>
              </Card>
            </div>
            <Card className="p-6 bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-3"><div className="text-indigo-500"><Info size={16} /></div><h3 className="font-semibold text-slate-700">Profitability Insights</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600">
                <div>
                  <p><strong>Break Even:</strong> {simulationResults.breakEvenLabel}</p>
                  <p className="mt-1 text-xs">"Never" means ODC outflow exceeds incoming profit rate.</p>
                </div>
                <div>
                  <p><strong>ODC Profit:</strong> {formatCompact(simulationResults.totalODCProfit)}</p>
                  <p className="mt-1 text-xs">Service fee ({feePercent}%) across all events.</p>
                </div>
                <div>
                  <p><strong>Float Recovery:</strong> {simulationResults.floatDuration != null ? `~${simulationResults.floatDuration} Days` : 'N/A'}</p>
                  <p className="mt-1 text-xs">Time for profit to exceed total ODC float.</p>
                </div>
              </div>
            </Card>
          </>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: rawData?.events ? rawData.events.length.toLocaleString() : "0" },
            { label: "Specialized/Yr", value: specializedPerYear.toLocaleString() },
            { label: "Avg ODC / Event", value: formatCurrency(simulationResults && rawData?.events?.length ? simulationResults.totalProjectCost / rawData.events.length : 0) },
            { label: "Est. Break Even", value: simulationResults?.breakEvenLabel || "N/A" },
          ].map((stat, i) => (
            <Card key={i} className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{stat.label}</span>
              <span className="text-slate-700 font-bold text-lg">{stat.value}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const CostBuilderView = () => {
    const pieData = Object.entries(costBreakdown).map(([name, value]) => ({ name, value }));
    const getSliderMax = (category) => {
      const limits = { Food: 40000, Lodging: 40000, Curriculum: 100000, Meeting_Space: 20000, AV: 15000 };
      return limits[category] || 10000;
    };
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-2"><PieIcon className="text-purple-600" size={20} /><h3 className="font-semibold text-lg">Cost Component Builder (ODCs)</h3></div>
              <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-lg border border-slate-200">
                {['Basic', 'Standard', 'Specialized'].map(type => (
                  <button key={type} onClick={() => switchProfile(type)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${builderProfile === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{type}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {Object.keys(costBreakdown).map((category) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: costColors[category] || '#ccc' }}></span>
                      {category.replace('_', ' ')}
                    </label>
                    <div className="flex items-center">
                      <span className="text-slate-500 text-sm mr-1">$</span>
                      <input type="number" min="0" max={getSliderMax(category) * 2} value={costBreakdown[category].toString()}
                        onChange={(e) => updateCostCategory(category, e.target.value)}
                        className="w-24 text-right p-1 border border-slate-300 rounded text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <input type="range" min="0" max={getSliderMax(category)} step={50} value={costBreakdown[category]}
                    onChange={(e) => updateCostCategory(category, e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: costColors[category] }} />
                  <div className="flex justify-between text-xs text-slate-300"><span>$0</span><span>${getSliderMax(category).toLocaleString()}</span></div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Total {builderProfile} ODC Cost</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalODCCost)}</p>
                <span className="text-xs text-slate-400">Labor billed separately via FFP CLINs</span>
              </div>
              <button onClick={handleApplyCostToSim} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition-all transform hover:scale-105">
                <CheckCircle size={20} /><span>Update {builderProfile} Model</span><ArrowRight size={18} />
              </button>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6 h-full flex flex-col items-center justify-center">
            <div className="text-center mb-6"><Badge color="purple">Editing: {builderProfile}</Badge></div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={costColors[entry.name]} />))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 text-sm text-slate-500 text-center">ODC cost breakdown (labor excluded).</div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="w-full mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Event Cash Flow Analyzer</h1>
            <p className="text-slate-500 mt-1">Visualize capital outlay peaks across reimbursement scenarios</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-colors shadow-sm">
                <Upload size={18} /><span>{isProcessing ? "Processing..." : "Upload CSV Data"}</span>
              </button>
            </div>
            {fileName && <Badge color="blue">{fileName}</Badge>}
          </div>
        </div>

        <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
          <button onClick={() => setActiveTab('analysis')} className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'analysis' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Cash Flow Analysis</button>
          <button onClick={() => setActiveTab('builder')} className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'builder' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Event Cost Builder</button>
          <button onClick={() => setActiveTab('labor')} className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'labor' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Labor CLINs</button>
          <button onClick={() => setActiveTab('docs')} className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'docs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>Documentation</button>
        </div>

        {activeTab === 'analysis' && <AnalysisView />}
        {activeTab === 'builder' && <CostBuilderView />}
        {activeTab === 'labor' && <LaborBuilderView laborClins={laborClins} setLaborClins={setLaborClins} eventsPerYear={eventsPerYear} />}
        {activeTab === 'docs' && <DocsView />}
      </div>
    </div>
  );
}
