import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart, PieChart, Pie, Cell, Legend } from 'recharts';
import { Upload, AlertCircle, TrendingDown, TrendingUp, DollarSign, Calendar, FileText, Layers, PieChart as PieIcon, ArrowRight, CheckCircle, Settings, Users, Activity, Plus, Trash2, Briefcase, Download, Info, BookOpen } from 'lucide-react';

// --- Static Data & Helpers ---

const LOCATIONS = ["California", "Texas", "Florida", "New York", "Illinois", "Ohio", "Georgia", "North Carolina", "Michigan", "New Jersey"];

// Define coherent defaults so initial state is mathematically valid
const DEFAULT_BREAKDOWN = {
  Food: 1000, Lodging: 1200, Childcare: 300, Curriculum: 400, 
  Meeting_Space: 500, AV: 200, Transportation: 100, Other: 50
};

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
        A React-based financial simulation tool designed to model cash flow, capital outlay, and profitability for large-scale event management projects.
      </p>
    </div>

    {/* Overview Section */}
    <section>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Activity size={20} className="text-indigo-500" />
        Overview
      </h2>
      <p className="text-slate-600 leading-relaxed mb-4">
        This application simulates the financial lifecycle of ~22,000 events over a 5-year period (2026–2031). It helps project managers visualize two critical metrics:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
          <h3 className="font-semibold text-red-700 mb-1">Peak Cash Outlay</h3>
          <p className="text-sm text-red-600">The maximum capital required to "float" costs before reimbursement arrives.</p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
          <h3 className="font-semibold text-emerald-700 mb-1">Net Profit</h3>
          <p className="text-sm text-emerald-600">The accumulated fees earned after all costs are reimbursed.</p>
        </div>
      </div>
    </section>

    {/* Financial Logic */}
    <section>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <DollarSign size={20} className="text-indigo-500" />
        Financial Logic
      </h2>
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">1. Total Event Cost</h3>
          <code className="block bg-white p-3 rounded border border-slate-200 text-slate-700 font-mono text-sm">
            Total = Sum(ODC Components) + Total Labor Cost
          </code>
          <p className="text-xs text-slate-500 mt-1 ml-1">
            * Labor Cost = (Rate × Hours × Count) × Wrap Rate
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">2. Cash Outflow (Day 0)</h3>
          <p className="text-sm text-slate-700">The company pays the <strong>Total Event Cost</strong> upfront on the day of the event.</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">3. Cash Inflow (Reimbursement)</h3>
          <code className="block bg-white p-3 rounded border border-slate-200 text-slate-700 font-mono text-sm">
            Inflow = (Labor Cost + ODC Cost) + (ODC Cost × Fee %)
          </code>
          <p className="text-xs text-slate-500 mt-1 ml-1">
            * Note: Labor is treated as a pass-through (reimbursed at cost). The Service Fee is applied <strong>only</strong> to the ODC portion.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">4. Reimbursement Timing</h3>
          <code className="block bg-white p-3 rounded border border-slate-200 text-slate-700 font-mono text-sm">
            Payment Day = Event Day + Mean Delay ± Random Variance
          </code>
          <p className="text-xs text-slate-500 mt-1 ml-1">
            The delay follows a Gaussian distribution centered on the selected "Avg. Reimbursement Delay".
          </p>
        </div>
      </div>
    </section>

    {/* Key Features */}
    <section>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Settings size={20} className="text-indigo-500" />
        Key Features & Usage
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Interactive Simulation", desc: "Adjust delays (30–150 days) and fees (2–5%) to see real-time impacts." },
          { title: "Granular Cost Builder", desc: "Define specific 'Other Direct Costs' (ODC) per event type (Food, Lodging, etc.)." },
          { title: "Labor & Staffing", desc: "Define roles, rates, and apply 'Wrap Rates' for overhead/benefits." },
          { title: "Gaussian Data Generation", desc: "Realistic bell-curve variance for event costs and payment delays." },
          { title: "CSV Export", desc: "Download full dataset (~22k rows) with granular breakdowns for Excel/Tableau." }
        ].map((feature, i) => (
          <li key={i} className="flex gap-3">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
              {i + 1}
            </div>
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

const LaborBuilderView = ({ 
  laborCosts, 
  updateLaborRole, 
  removeLaborRole, 
  addLaborRole, 
  handleApplyCostToSim, 
  totalLaborCost, 
  builderProfile 
}) => {
  if (!laborCosts) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Briefcase className="text-red-600" size={20} />
              <div>
                <h3 className="font-semibold text-lg">Labor & Staffing Model</h3>
                <p className="text-xs text-slate-500">Define roles charged to the event budget</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Total Labor Per Event</p>
              <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalLaborCost)}</p>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100">
                <th className="font-medium py-3 pl-2">Role Name</th>
                <th className="font-medium py-3 text-center">Headcount</th>
                <th className="font-medium py-3 text-right">Hourly Rate</th>
                <th className="font-medium py-3 text-right">Hours/Event</th>
                <th className="font-medium py-3 text-right">Wrap Rate</th>
                <th className="font-medium py-3 text-right">Cost/Event</th>
                <th className="font-medium py-3 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {laborCosts.map((item) => {
                const rate = parseFloat(item.rate) || 0;
                const hours = parseFloat(item.hours) || 0;
                const count = parseFloat(item.count) || 0;
                const wrap = parseFloat(item.wrapRate) || 1.0;
                const cost = rate * hours * count * wrap;

                return (
                  <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="py-3 pl-2">
                      <input 
                        type="text" 
                        value={item.role}
                        onChange={(e) => updateLaborRole(item.id, 'role', e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 font-medium text-slate-700 placeholder-slate-300"
                        placeholder="Role Name"
                      />
                    </td>
                    <td className="py-3 text-center">
                        <input 
                        type="number" 
                        min="1"
                        value={item.count}
                        onChange={(e) => updateLaborRole(item.id, 'count', e.target.value)}
                        className="w-16 text-center border border-slate-200 rounded py-1 focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <span className="text-slate-400">$</span>
                        <input 
                          type="number" 
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateLaborRole(item.id, 'rate', e.target.value)}
                          className="w-20 text-right border border-slate-200 rounded py-1 focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <input 
                        type="number" 
                        min="0"
                        step="0.25"
                        value={item.hours}
                        onChange={(e) => updateLaborRole(item.id, 'hours', e.target.value)}
                        className="w-20 text-right border border-slate-200 rounded py-1 focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <input 
                        type="number" 
                        min="1.0"
                        step="0.01"
                        value={item.wrapRate}
                        onChange={(e) => updateLaborRole(item.id, 'wrapRate', e.target.value)}
                        className="w-20 text-right border border-slate-200 rounded py-1 focus:ring-2 focus:ring-indigo-500 text-slate-600"
                      />
                    </td>
                    <td className="py-3 text-right font-medium text-slate-700">
                      {formatCurrency(cost)}
                    </td>
                    <td className="py-3 text-center">
                      <button 
                        onClick={() => removeLaborRole(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
            <button 
              onClick={addLaborRole}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
            >
              <Plus size={16} />
              <span>Add Labor Role</span>
            </button>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleApplyCostToSim}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition-all transform hover:scale-105"
            >
              <CheckCircle size={20} />
              <span>Update {builderProfile} Model</span>
              <ArrowRight size={18} />
            </button>
        </div>
      </Card>
    </div>
  );
};

// --- Main Application ---

export default function CashFlowApp() {
  const [activeTab, setActiveTab] = useState('analysis'); 
  const [rawData, setRawData] = useState(null);
  const [delayDays, setDelayDays] = useState(30);
  const [feePercent, setFeePercent] = useState(2.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("");
  
  // Simulation controls
  const [eventsPerMonth, setEventsPerMonth] = useState(300);
  const [stdDevPercent, setStdDevPercent] = useState(15); 

  // Initial Calculation Helpers
  const calcSum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
  const initialOdc = calcSum(DEFAULT_BREAKDOWN);
  const initialLabor = 300; 
  const initialTotal = initialOdc + initialLabor;

  // Event Mix State
  // Initialize with consistent sums to prevent simulation drift
  const [eventMix, setEventMix] = useState({
    Basic: { 
        pct: 50, 
        cost: initialTotal, 
        color: '#3b82f6',
        breakdown: { ...DEFAULT_BREAKDOWN }, 
        labor: initialLabor 
    },
    Standard: { 
        pct: 40, 
        cost: initialTotal * 3, // Approximation for differentiation
        color: '#8b5cf6',
        breakdown: { ...DEFAULT_BREAKDOWN, Food: 3000, Lodging: 4000, Meeting_Space: 2000 },
        labor: 800 
    },
    Specialized: { 
        pct: 10, 
        cost: initialTotal * 8, 
        color: '#f59e0b',
        breakdown: { ...DEFAULT_BREAKDOWN, Food: 8000, Lodging: 10000, AV: 5000 },
        labor: 2000
    }
  });

  // Cost Builder State
  const [builderProfile, setBuilderProfile] = useState('Standard');
  const [costBreakdown, setCostBreakdown] = useState({ ...DEFAULT_BREAKDOWN });

  // Labor Builder State
  const [laborCosts, setLaborCosts] = useState([
    { id: 1, role: 'Event Planner', count: 1, rate: 45, hours: 15, wrapRate: 1.0 },
    { id: 2, role: 'On-site Coord', count: 1, rate: 35, hours: 10, wrapRate: 1.0 }
  ]);

  const costColors = {
    Food: '#3b82f6', Lodging: '#8b5cf6', Childcare: '#ec4899', Curriculum: '#10b981', 
    Meeting_Space: '#f59e0b', AV: '#6366f1', Transportation: '#06b6d4', Other: '#94a3b8', Labor: '#ef4444' 
  };

  // Safe Calculation for Total Labor
  const totalLaborCost = useMemo(() => {
    return laborCosts.reduce((acc, item) => {
        const h = parseFloat(item.hours) || 0;
        const w = parseFloat(item.wrapRate) || 1.0;
        const count = parseFloat(item.count) || 0;
        const rate = parseFloat(item.rate) || 0;
        return acc + (count * rate * h * w);
    }, 0);
  }, [laborCosts]);

  const totalODCCost = Object.values(costBreakdown).reduce((a, b) => a + (parseFloat(b) || 0), 0);
  const grandTotalCost = totalODCCost + totalLaborCost;

  // Main Data Generation Effect
  useEffect(() => {
    // Only auto-regenerate if we are in "sample" mode
    if (!fileName || fileName === "Generated Sample Data") {
      generateSampleData();
    }
  }, [eventMix, eventsPerMonth, stdDevPercent]);

  const generateSampleData = () => {
    try {
      const sampleEvents = [];
      const startYear = 2026;
      const endYear = 2031;
      const safeEventsPerMonth = Math.max(1, parseInt(eventsPerMonth) || 1);
      const eventsPerYear = safeEventsPerMonth * 12; 
      
      const totalPct = eventMix.Basic.pct + eventMix.Standard.pct + eventMix.Specialized.pct;
      const safeTotal = totalPct === 0 ? 1 : totalPct;
      
      const basicThresh = eventMix.Basic.pct / safeTotal;
      const standardThresh = (eventMix.Basic.pct + eventMix.Standard.pct) / safeTotal;

      for (let year = startYear; year <= endYear; year++) {
        for (let i = 0; i < eventsPerYear; i++) {
          const rand = Math.random();
          let typeKey = 'Specialized';
          if (rand < basicThresh) typeKey = 'Basic';
          else if (rand < standardThresh) typeKey = 'Standard';

          const typeData = eventMix[typeKey];
          // We use breakdown sum + labor sum to guarantee math consistency
          // instead of relying on the possibly desynced `cost` property
          
          let breakdownSum = 0;
          let breakdownObj = {};
          
          if (typeData.breakdown) {
             Object.entries(typeData.breakdown).forEach(([k, v]) => {
                breakdownSum += (v || 0);
                breakdownObj[k] = (v || 0);
             });
          }
          const laborSum = typeData.labor || 0;
          const baseCost = breakdownSum + laborSum;

          // Gaussian Distribution
          const z = gaussianRandom();
          const multiplier = 1 + (z * (stdDevPercent / 100));
          
          // Gaussian Delay Z-score
          const delayZ = gaussianRandom(); 

          // Apply multiplier to components
          const scaledODC = {};
          let odcTotal = 0;
          Object.entries(breakdownObj).forEach(([key, val]) => {
              const scaled = val * multiplier;
              scaledODC[key] = scaled;
              odcTotal += scaled;
          });
          const laborTotal = laborSum * multiplier;
          
          // Strictly define Total Cost as sum of scaled components
          const totalCost = odcTotal + laborTotal;

          const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
          const attendees = typeKey === 'Basic' ? Math.floor(20 + Math.random() * 80) : 
                            typeKey === 'Standard' ? Math.floor(100 + Math.random() * 200) : 
                            Math.floor(300 + Math.random() * 700);
          
          const dayOfYear = Math.floor((i * 365) / eventsPerYear);
          const globalDay = (year - startYear) * 365 + dayOfYear;
          const eventId = `FY${year}_${(i + 1).toString().padStart(5, '0')}`;

          sampleEvents.push({ 
              d: globalDay, 
              c: totalCost,
              year,
              eventId,
              type: typeKey,
              location,
              attendees,
              breakdown: scaledODC,
              odcTotal: odcTotal,
              laborTotal: laborTotal,
              delayZ 
          });
        }
      }
      setRawData({ startYear, events: sampleEvents });
      setFileName("Generated Sample Data");
    } catch (e) {
      console.error("Simulation error", e);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      processCSV(e.target.result);
    };
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
          processedEvents.push({ d: globalDay, c: cost, delayZ: gaussianRandom() });
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
    const headers = ["Year", "Event_ID", "Event_Type", "Location", "Attendees", "Food", "Lodging", "Childcare", "Curriculum", "Meeting_Space", "AV", "Transportation", "Other", "ODC_Cost", "Labor_Cost", "Total_Cost"];
    const csvContent = [
        headers.join(","),
        ...rawData.events.map(e => {
            if (!e.breakdown) return `${e.year || ''},${e.eventId || ''},Unknown,Unknown,0,,,,,,,,,0,0,${e.c.toFixed(2)}`;
            return [
                e.year, e.eventId, e.type, `"${e.location}"`, e.attendees,
                e.breakdown.Food?.toFixed(2) || 0, e.breakdown.Lodging?.toFixed(2) || 0,
                e.breakdown.Childcare?.toFixed(2) || 0, e.breakdown.Curriculum?.toFixed(2) || 0,
                e.breakdown.Meeting_Space?.toFixed(2) || 0, e.breakdown.AV?.toFixed(2) || 0,
                e.breakdown.Transportation?.toFixed(2) || 0, e.breakdown.Other?.toFixed(2) || 0,
                e.odcTotal.toFixed(2), e.laborTotal.toFixed(2), e.c.toFixed(2)
            ].join(",");
        })
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `simulation_data.csv`);
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
      const maxDay = lastEventDay + 400; 
      if (maxDay > 100000) return null;

      const dailyNetChange = new Float32Array(maxDay + 1);
      let totalProjectCost = 0;
      let totalProjectProfit = 0;

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        
        // Strict consistency check: Use ODC + Labor if available, otherwise fallback to C
        const labor = event.laborTotal || 0;
        const odc = event.odcTotal !== undefined ? event.odcTotal : (event.c || 0);
        
        // For uploaded CSVs without breakdown, assume entire cost is ODC (incurs fee)
        // For generated data, cost is strictly labor + odc
        const cost = (event.laborTotal !== undefined && event.odcTotal !== undefined) ? (labor + odc) : (event.c || 0);

        totalProjectCost += cost;
        
        // Outflow: We pay full cost
        if (event.d >= 0 && event.d <= maxDay) dailyNetChange[event.d] -= cost;
        
        // Inflow: (Labor + ODC) + (ODC * Fee%)
        // We get back exactly what we paid (Labor + ODC) PLUS profit on ODC
        const profit = odc * (feePercent / 100);
        totalProjectProfit += profit;
        
        const inflow = (labor + odc) + profit;

        // Gaussian Delay
        const delayZ = event.delayZ || 0;
        const varianceFactor = 0.25; 
        const actualDelay = Math.max(1, Math.round(delayDays * (1 + delayZ * varianceFactor)));
        const inflowDay = event.d + actualDelay;

        if (inflowDay <= maxDay) dailyNetChange[inflowDay] += inflow;
      }

      const chartData = [];
      let currentBalance = 0;
      let minBalance = 0;
      let maxBalance = 0;
      let peakDayIndex = 0;
      let breakEvenDayIndex = -1;
      const sampleRate = 7; 

      for (let day = 0; day <= maxDay; day++) {
        currentBalance += dailyNetChange[day];
        if (currentBalance < minBalance) { minBalance = currentBalance; peakDayIndex = day; }
        if (currentBalance > maxBalance) maxBalance = currentBalance;
        if (breakEvenDayIndex === -1 && currentBalance > 0 && day > 0) breakEvenDayIndex = day;

        if (day % sampleRate === 0 || day === maxDay) {
          const year = startYear + Math.floor(day / 365);
          const dayOfYr = day % 365;
          const month = Math.floor(dayOfYr / 30.5); 
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const label = `${months[month % 12]} ${year}`;
          const safeBalance = isNaN(currentBalance) ? 0 : Math.round(currentBalance);
          chartData.push({ dayIndex: day, label: label, balance: safeBalance });
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
      const avgEventProfit = events.length > 0 ? totalProjectProfit / events.length : 0;
      const floatDuration = avgEventProfit > 0 ? (avgEventCost * delayDays) / avgEventProfit : Infinity;

      return {
        chartData,
        peakOutlay: minBalance,
        totalProfit: currentBalance,
        totalProjectCost,
        peakDateLabel: chartData.find(d => d.dayIndex >= peakDayIndex)?.label || "N/A",
        breakEvenLabel,
        floatDuration: Math.round(floatDuration)
      };
    } catch (e) {
      console.error("Simulation error", e);
      return null;
    }
  }, [rawData, delayDays, feePercent]);

  const handleApplyCostToSim = () => {
    setEventMix(prev => ({
      ...prev,
      [builderProfile]: {
        ...prev[builderProfile],
        cost: grandTotalCost,
        breakdown: { ...costBreakdown },
        labor: totalLaborCost
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

  const updateMix = (type, field, value) => {
    const numValue = parseInt(value) || 0;
    if (field === 'pct') {
      setEventMix(prev => {
        const newTargetVal = Math.min(100, Math.max(0, numValue));
        const remaining = 100 - newTargetVal;
        const otherTypes = Object.keys(prev).filter(t => t !== type);
        const typeA = otherTypes[0];
        const typeB = otherTypes[1];
        const valA = prev[typeA].pct;
        const valB = prev[typeB].pct;
        const totalOther = valA + valB;
        let newA, newB;
        if (totalOther === 0) { newA = Math.floor(remaining / 2); newB = remaining - newA; }
        else { newA = Math.round((valA / totalOther) * remaining); newB = remaining - newA; }
        return {
          ...prev,
          [type]: { ...prev[type], pct: newTargetVal },
          [typeA]: { ...prev[typeA], pct: newA },
          [typeB]: { ...prev[typeB], pct: newB }
        };
      });
    } else {
      setEventMix(prev => ({ ...prev, [type]: { ...prev[type], [field]: numValue } }));
    }
  };

  const addLaborRole = () => {
    const newId = Math.max(...laborCosts.map(i => i.id), 0) + 1;
    setLaborCosts([...laborCosts, { id: newId, role: 'New Role', count: 1, rate: 25, hours: 5, wrapRate: 1.0 }]);
  };

  const updateLaborRole = (id, field, value) => {
    setLaborCosts(laborCosts.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeLaborRole = (id) => {
    setLaborCosts(laborCosts.filter(item => item.id !== id));
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
          <div className="space-y-3">
            <div className="flex justify-between"><label className="text-sm font-medium text-slate-600">Avg. Reimbursement Delay</label><span className="font-bold text-indigo-600">{delayDays} Days</span></div>
            <input type="range" min="30" max="150" step="30" value={delayDays} onChange={(e) => setDelayDays(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            <div className="flex justify-between text-xs text-slate-400"><span>30d</span><span>150d</span></div>
            <p className="text-xs text-slate-400 italic">Actual delay varies by event (±25%)</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><label className="text-sm font-medium text-slate-600">Service Fee (on ODC)</label><span className="font-bold text-emerald-600">{feePercent}%</span></div>
            <input type="range" min="2" max="5" step="0.5" value={feePercent} onChange={(e) => setFeePercent(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
          <div className="pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 mb-4"><Layers className="text-purple-600" size={20} /><h3 className="font-semibold text-lg">Event Mix & Costs</h3></div>
             <div className="space-y-3 mb-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between"><label className="text-sm font-medium text-slate-700">Total Volume (Mo)</label><span className="font-bold text-purple-700">{eventsPerMonth} Events</span></div>
                <input type="range" min="100" max="1000" step="50" value={eventsPerMonth} disabled={fileName !== "Generated Sample Data"} onChange={(e) => setEventsPerMonth(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
             </div>
             <div className="space-y-3 mb-6 p-3 bg-slate-50 rounded-lg">
                 <div className="flex justify-between items-center mb-1"><div className="flex items-center gap-2"><Activity size={16} className="text-slate-500"/><label className="text-sm font-medium text-slate-700">Cost Variance (Std Dev)</label></div><span className="font-bold text-slate-700">{stdDevPercent}%</span></div>
                 <input type="range" min="0" max="50" step="1" value={stdDevPercent} disabled={fileName !== "Generated Sample Data"} onChange={(e) => setStdDevPercent(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-500" />
             </div>
             <div className="space-y-6">
                {Object.keys(eventMix).map((type) => (
                  <div key={type} className="space-y-2 relative pl-3 border-l-2" style={{ borderColor: eventMix[type].color }}>
                    <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-700">{type}</span><span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{eventMix[type].pct}%</span></div>
                    <div className="flex items-center gap-2"><span className="text-xs text-slate-400 w-8">Vol</span><input type="range" min="0" max="100" step="1" disabled={fileName !== "Generated Sample Data"} value={eventMix[type].pct} onChange={(e) => updateMix(type, 'pct', e.target.value)} className="flex-grow h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" style={{ accentColor: eventMix[type].color }} /></div>
                    <div className="flex items-center gap-2"><span className="text-xs text-slate-400 w-8">Avg $</span><input type="range" min="1000" max={type === 'Specialized' ? 100000 : 25000} step={500} disabled={fileName !== "Generated Sample Data"} value={eventMix[type].cost} onChange={(e) => updateMix(type, 'cost', e.target.value)} className="flex-grow h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" style={{ accentColor: eventMix[type].color }} /><span className="text-xs font-mono font-medium text-slate-600 w-12 text-right">{formatCompact(eventMix[type].cost)}</span></div>
                  </div>
                ))}
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
                <button onClick={downloadCSV} disabled={!rawData || fileName !== "Generated Sample Data"} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 text-xs px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Download size={14} /><span>Export Simulation CSV</span></button>
            </div>
          </div>
          <div className="flex-grow w-full">
            {simulationResults ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationResults.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" minTickGap={60} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(value) => `$${value / 1000000}M`} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [formatCurrency(value), "Net Cash Position"]} />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Card className="p-6 bg-blue-50 border-blue-100">
                <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-blue-600 mb-1">Total Project Cost</p><h2 className="text-2xl font-bold text-blue-800">{formatCompact(simulationResults.totalProjectCost)}</h2></div><div className="p-3 bg-white rounded-full shadow-sm text-blue-500"><FileText size={24} /></div></div>
                <p className="text-xs text-blue-600 mt-2">Total ODCs of all events</p>
              </Card>
              <Card className="p-6 bg-red-50 border-red-100">
                <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-red-600 mb-1">Peak Cash Outlay</p><h2 className="text-2xl font-bold text-red-700">{formatCompact(simulationResults.peakOutlay)}</h2></div><div className="p-3 bg-white rounded-full shadow-sm text-red-500"><TrendingDown size={24} /></div></div>
                <p className="text-xs text-red-500 mt-2">Max deficit: {simulationResults.peakDateLabel}</p>
              </Card>
              <Card className="p-6 bg-emerald-50 border-emerald-100">
                <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-emerald-600 mb-1">Total Net Profit</p><h2 className="text-2xl font-bold text-emerald-700">{formatCompact(simulationResults.totalProfit)}</h2></div><div className="p-3 bg-white rounded-full shadow-sm text-emerald-500"><DollarSign size={24} /></div></div>
                <p className="text-xs text-emerald-600 mt-2">Total fees earned ({feePercent}%)</p>
              </Card>
            </div>
            <Card className="p-6 bg-slate-50 border border-slate-200">
               <div className="flex items-center gap-2 mb-3"><div className="text-indigo-500">ℹ️</div><h3 className="font-semibold text-slate-700">Profitability Insights</h3></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
                  <div><p><strong>Float Recovery Time:</strong> ~{simulationResults.floatDuration} Days</p><p className="mt-1 text-xs">Time required for profit accumulation to exceed the cash float of a single event cycle.</p></div>
                  <div><p><strong>Break Even Status:</strong> {simulationResults.breakEvenLabel}</p><p className="mt-1 text-xs">"Never" means rate of new cash outflow exceeds incoming profit.</p></div>
               </div>
            </Card>
          </>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[{ label: "Total Events", value: rawData?.events ? rawData.events.length.toLocaleString() : "0" }, { label: "Est. Break Even", value: simulationResults?.breakEvenLabel || "N/A" }, { label: "Avg Cost", value: formatCurrency(simulationResults && rawData?.events?.length ? simulationResults.totalProjectCost / rawData.events.length : 0) }, { label: "Simulated Cost", value: formatCompact(simulationResults?.totalProjectCost || 0) }].map((stat, i) => (
             <Card key={i} className="p-4 flex flex-col items-center justify-center text-center"><span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{stat.label}</span><span className="text-slate-700 font-bold text-lg">{stat.value}</span></Card>
           ))}
        </div>
      </div>
    </div>
  );

  const CostBuilderView = () => {
    const pieData = Object.entries(costBreakdown).map(([name, value]) => ({ name, value })).concat({ name: 'Labor', value: totalLaborCost });
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
                  <div className="flex justify-between items-center"><label className="text-sm font-medium text-slate-600 flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: costColors[category] || '#ccc' }}></span>{category.replace('_', ' ')}</label><div className="flex items-center"><span className="text-slate-500 text-sm mr-1">$</span><input type="number" min="0" max={getSliderMax(category) * 2} value={costBreakdown[category].toString()} onChange={(e) => updateCostCategory(category, e.target.value)} className="w-24 text-right p-1 border border-slate-300 rounded text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none" /></div></div>
                  <input type="range" min="0" max={getSliderMax(category)} step={50} value={costBreakdown[category]} onChange={(e) => updateCostCategory(category, e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" style={{ accentColor: costColors[category] }} />
                  <div className="flex justify-between text-xs text-slate-300"><span>$0</span><span>${getSliderMax(category).toLocaleString()}</span></div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div><p className="text-xs text-slate-500 uppercase tracking-wide">Total {builderProfile} (ODC + Labor)</p><p className="text-2xl font-bold text-slate-800">{formatCurrency(grandTotalCost)}</p><span className="text-xs text-slate-400">Includes {formatCurrency(totalLaborCost)} labor</span></div>
                <button onClick={handleApplyCostToSim} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition-all transform hover:scale-105"><CheckCircle size={20} /><span>Update {builderProfile} Model</span><ArrowRight size={18} /></button>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
           <Card className="p-6 h-full flex flex-col items-center justify-center"><div className="text-center mb-6"><Badge color="purple">Editing: {builderProfile}</Badge></div><div className="w-full h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={costColors[entry.name]} />))}</Pie><Tooltip formatter={(value) => formatCurrency(value)} /><Legend /></PieChart></ResponsiveContainer></div><div className="mt-6 text-sm text-slate-500 text-center">Cost breakdown including computed labor burden.</div></Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="w-full mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div><h1 className="text-3xl font-bold text-slate-900">Event Cash Flow Analyzer</h1><p className="text-slate-500 mt-1">Visualize capital outlay peaks across reimbursement scenarios</p></div>
          <div className="flex items-center gap-2"><div className="relative group"><input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" /><button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-colors shadow-sm"><Upload size={18} /><span>{isProcessing ? "Processing..." : "Upload CSV Data"}</span></button></div>{fileName && (<Badge color="blue">{fileName}</Badge>)}</div>
        </div>
        <div className="flex gap-4 border-b border-slate-200">
          <button onClick={() => setActiveTab('analysis')} className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'analysis' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-white hover:text-slate-300'}`}>Cash Flow Analysis</button>
          <button onClick={() => setActiveTab('builder')} className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'builder' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-white hover:text-slate-300'}`}>Event Cost Builder</button>
          <button onClick={() => setActiveTab('labor')} className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'labor' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-white hover:text-slate-300'}`}>Labor & Staffing</button>
          <button onClick={() => setActiveTab('docs')} className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'docs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-white hover:text-slate-300'}`}>Documentation</button>
        </div>
        {activeTab === 'analysis' && <AnalysisView />}
        {activeTab === 'builder' && <CostBuilderView />}
        {activeTab === 'labor' && (<LaborBuilderView laborCosts={laborCosts} updateLaborRole={updateLaborRole} removeLaborRole={removeLaborRole} addLaborRole={addLaborRole} handleApplyCostToSim={handleApplyCostToSim} totalLaborCost={totalLaborCost} builderProfile={builderProfile} />)}
        {activeTab === 'docs' && <DocsView />}
      </div>
    </div>
  );
}