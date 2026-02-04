// "use client";

// import { useState, useEffect, useMemo } from "react";
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label
// } from "recharts";
// import { format, parseISO } from "date-fns";
// import { Loader2, TrendingUp, TrendingDown, Target, Edit2, Check, X } from "lucide-react";

// interface SalesDataPoint {
//   date: string;
//   sales: number;
// }

// const CHART_CONFIG: Record<string, { api: string; label: string; days: number }> = {
//   "Today": { api: "1D", label: "Daily Goal", days: 1 },
//   "1W":    { api: "7D", label: "Weekly Goal", days: 7 },
//   "1M":    { api: "1M", label: "Monthly Goal", days: 30 },
//   "6M":    { api: "6M", label: "Half-Year Goal", days: 180 },
//   "1Y":    { api: "1Y", label: "Yearly Goal", days: 365 },
//   "MAX":   { api: "MAX", label: "All Time Goal", days: 1 } 
// };

// const TABS = Object.keys(CHART_CONFIG);

// const CustomTooltip = ({ active, payload, label }: any) => {
//   if (active && payload && payload.length) {
//     const dateObj = parseISO(label);
//     const amount = payload[0].value;
//     return (
//       <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs z-50">
//         <p className="text-gray-400 mb-1 font-medium">{format(dateObj, "MMM dd, h:mm a")}</p>
//         <p className="font-bold text-lg flex items-center gap-2">Bill: <span className="text-emerald-400">₹{amount.toLocaleString()}</span></p>
//       </div>
//     );
//   }
//   return null;
// };

// export default function StockStyleSalesChart() {
//   const [data, setData] = useState<SalesDataPoint[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("Today");
//   const [displayValue, setDisplayValue] = useState<number | null>(null);

//   const [baseDailyTarget, setBaseDailyTarget] = useState<number>(0);
//   const [isEditing, setIsEditing] = useState(false);
//   const [tempTarget, setTempTarget] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const apiRange = CHART_CONFIG[activeTab].api;
//         const chartRes = await fetch(`/api/analytics/sales-chart?range=${apiRange}`);
//         if (chartRes.ok) {
//           const json = await chartRes.json();
//           setData(json);
//         }

//         const targetRes = await fetch("/api/user/target");
//         if (targetRes.ok) {
//           const targetJson = await targetRes.json();
//           setBaseDailyTarget(targetJson.target || 0);
//           setTempTarget(targetJson.target?.toString() || "");
//         }
//       } catch (error) { console.error("Failed to load data", error); } 
//       finally { setLoading(false); }
//     };
//     fetchData();
//   }, [activeTab]);

//   const handleSaveTarget = async () => {
//     try {
//       const val = Number(tempTarget);
//       if (isNaN(val)) return;

//       const res = await fetch("/api/user/target", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ target: val }),
//       });

//       if (res.ok) {
//         setBaseDailyTarget(val);
//         setIsEditing(false);
//       }
//     } catch (error) { console.error("Failed to save target"); }
//   };

//   // --- 1. CALCULATE MAX HEIGHT (The Fix) ---
//   const chartHeightDomain = useMemo(() => {
//     if (data.length === 0) return [0, baseDailyTarget * 1.2]; // Fallback if no data

//     const maxData = Math.max(...data.map((d) => d.sales));
//     // The chart max should be whichever is bigger: Max Sales OR Target
//     // We add * 1.15 to give it 15% breathing room at the top
//     const highestPoint = Math.max(maxData, baseDailyTarget);

//     return [0, highestPoint * 1.15]; 
//   }, [data, baseDailyTarget]);

//   const displayedTarget = useMemo(() => {
//     const multiplier = CHART_CONFIG[activeTab].days;
//     return baseDailyTarget * multiplier;
//   }, [baseDailyTarget, activeTab]);

//   const averageSales = useMemo(() => {
//     if (data.length === 0) return 0;
//     const sum = data.reduce((acc, curr) => acc + curr.sales, 0);
//     return sum / data.length;
//   }, [data]);

//   const colorBaseline = averageSales;
//   const currentValue = displayValue !== null ? displayValue : (data.length > 0 ? data[data.length - 1].sales : 0);

//   const gradientOffset = useMemo(() => {
//     if (data.length === 0) return 0;
//     const dataMax = Math.max(...data.map((i) => i.sales));
//     const dataMin = Math.min(...data.map((i) => i.sales));
//     if (dataMax <= colorBaseline) return 0;
//     if (dataMin >= colorBaseline) return 1;
//     return (dataMax - colorBaseline) / (dataMax - dataMin);
//   }, [data, colorBaseline]);

//   const diff = currentValue - colorBaseline;
//   const isUp = diff >= 0;

//   const formatXAxis = (tickItem: string) => {
//     try {
//       const date = parseISO(tickItem);
//       if (activeTab === "Today") return format(date, "h:mm a");
//       if (activeTab === "1W") return format(date, "EEE");
//       if (activeTab === "1Y") return format(date, "MMM");
//       return format(date, "dd MMM");
//     } catch (e) { return ""; }
//   };

//   const CustomLabel = (props: any) => {
//     const { x, y, value } = props;
//     if (!value) return null;
//     const isAbove = value >= colorBaseline;
//     return (
//       <text x={x} y={y} dy={-10} fill={isAbove ? "#10b981" : "#ef4444"} fontSize={10} fontWeight="bold" textAnchor="middle">
//         {`₹${value.toLocaleString()}`}
//       </text>
//     );
//   };

//   if (loading && data.length === 0) {
//     return (
//       <div className="h-[400px] w-full bg-white rounded-xl flex items-center justify-center border border-gray-100">
//         <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 font-sans">

//       {/* HEADER */}
//       <div className="mb-2 flex justify-between items-start">
//         <div>
//           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
//             {displayValue ? "Selected Bill" : "Last Bill"}
//           </p>
//           <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
//             ₹{currentValue.toLocaleString()}
//           </h2>
//           <div className="flex items-center gap-2 mt-1">
//              <span className={`flex items-center font-bold text-sm ${isUp ? "text-emerald-500" : "text-red-500"}`}>
//                {isUp ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
//                {isUp ? "+" : ""}{Math.round(diff).toLocaleString()} vs Average
//              </span>
//           </div>
//         </div>

//         <div className="text-right flex flex-col items-end">
//             <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
//                 <Target size={12} /> {CHART_CONFIG[activeTab].label}
//             </p>

//             {isEditing ? (
//               <div className="flex flex-col items-end gap-1">
//                 <div className="flex items-center gap-1 bg-gray-50 p-1 rounded border border-gray-200">
//                     <span className="text-xs font-bold text-gray-500">₹</span>
//                     <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)}
//                     className="w-20 text-sm font-bold bg-transparent outline-none text-indigo-600" autoFocus placeholder="Daily..." />
//                     <button onClick={handleSaveTarget} className="p-1 hover:bg-green-100 rounded text-green-600"><Check size={14} /></button>
//                     <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-red-100 rounded text-red-600"><X size={14} /></button>
//                 </div>
//                 <span className="text-[9px] text-gray-400">Set Daily Amount</span>
//               </div>
//             ) : (
//               <div className="group flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors"
//                 onClick={() => { setTempTarget(baseDailyTarget.toString()); setIsEditing(true); }}>
//                 <p className="text-xl font-bold text-indigo-600">₹{displayedTarget.toLocaleString()}</p>
//                 <Edit2 size={12} className="text-gray-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
//               </div>
//             )}
//         </div>
//       </div>

//       {/* GRAPH AREA */}
//       <div className="h-[240px] w-full mt-4 -ml-4">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data} 
//             margin={{ top: 30, right: 35, left: 10, bottom: 0 }} 
//             onMouseMove={(e: any) => { if (e.activePayload) setDisplayValue(e.activePayload[0].value); }} 
//             onMouseLeave={() => setDisplayValue(null)}>
//             <defs>
//               <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={1} />
//                 <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={1} />
//               </linearGradient>
//               <linearGradient id="splitFill" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.1} />
//                 <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.1} />
//               </linearGradient>
//             </defs>

//             {/* 2. ADD YAXIS WITH CUSTOM DOMAIN (Force Scale) */}
//             <YAxis hide domain={chartHeightDomain} />

//             <XAxis dataKey="date" hide={false} axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }} tickFormatter={formatXAxis} interval="preserveStartEnd" minTickGap={40} />
//             <Tooltip content={<CustomTooltip />} />

//             <ReferenceLine y={colorBaseline} stroke="#9ca3af" strokeDasharray="3 3" strokeOpacity={0.5}>
//                 <Label value={`Avg: ₹${Math.round(averageSales).toLocaleString()}`} position="insideTopRight" fill="#9ca3af" fontSize={10} fontWeight="bold" offset={10}/>
//             </ReferenceLine>

//             {baseDailyTarget > 0 && (
//                 <ReferenceLine y={baseDailyTarget} stroke="#6366f1" strokeDasharray="5 5" strokeWidth={1.5}>
//                      <Label value={`Goal: ₹${baseDailyTarget.toLocaleString()}`} position="insideBottomRight" fill="#6366f1" fontSize={10} fontWeight="bold" offset={10}/>
//                 </ReferenceLine>
//             )}

//             <Area type="linear" dataKey="sales" stroke="url(#splitColor)" fill="url(#splitFill)" strokeWidth={2} label={activeTab === 'Today' ? <CustomLabel /> : false} 
//               dot={(props: any) => {
//                 const { cx, cy, payload } = props;
//                 const isAbove = payload.sales >= colorBaseline;
//                 return (<circle key={payload.date} cx={cx} cy={cy} r={3} fill={isAbove ? "#10b981" : "#ef4444"} />);
//               }}
//               activeDot={{ r: 6, strokeWidth: 0, fill: "#1f2937" }}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       <div className="flex justify-between mt-6 border-t border-gray-100 pt-4">
//         {TABS.map((tab) => (
//           <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[10px] font-black py-1.5 px-3 rounded-md transition-all ${activeTab === tab ? "bg-gray-900 text-white scale-110 shadow-md" : "text-gray-400 hover:bg-gray-100"}`}>{tab}</button>
//         ))}
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useState, useEffect, useMemo } from "react";
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label
// } from "recharts";
// import { format, parseISO } from "date-fns";
// import { Loader2, TrendingUp, TrendingDown, Target, Edit2, Check, X } from "lucide-react";

// interface SalesDataPoint {
//   date: string;
//   sales: number;
// }

// const CHART_CONFIG: Record<string, { api: string; label: string; days: number }> = {
//   "Today": { api: "1D", label: "Daily Goal", days: 1 },
//   "1W":    { api: "7D", label: "Weekly Goal", days: 7 },
//   "1M":    { api: "1M", label: "Monthly Goal", days: 30 },
//   "6M":    { api: "6M", label: "Half-Year Goal", days: 180 },
//   "1Y":    { api: "1Y", label: "Yearly Goal", days: 365 },
//   "MAX":   { api: "MAX", label: "All Time Goal", days: 1 } 
// };

// const TABS = Object.keys(CHART_CONFIG);

// const CustomTooltip = ({ active, payload, label }: any) => {
//   if (active && payload && payload.length) {
//     const dateObj = parseISO(label);
//     const amount = payload[0].value;
//     return (
//       <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs z-50">
//         <p className="text-gray-400 mb-1 font-medium">{format(dateObj, "MMM dd, h:mm a")}</p>
//         <p className="font-bold text-lg flex items-center gap-2">Bill: <span className="text-emerald-400">₹{amount.toLocaleString()}</span></p>
//       </div>
//     );
//   }
//   return null;
// };

// export default function StockStyleSalesChart() {
//   const [data, setData] = useState<SalesDataPoint[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("Today");
//   const [displayValue, setDisplayValue] = useState<number | null>(null);

//   const [baseDailyTarget, setBaseDailyTarget] = useState<number>(0);
//   const [isEditing, setIsEditing] = useState(false);
//   const [tempTarget, setTempTarget] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const apiRange = CHART_CONFIG[activeTab].api;
//         const chartRes = await fetch(`/api/analytics/sales-chart?range=${apiRange}`);
//         if (chartRes.ok) {
//           const json = await chartRes.json();
//           setData(json);
//         }

//         const targetRes = await fetch("/api/user/target");
//         if (targetRes.ok) {
//           const targetJson = await targetRes.json();
//           setBaseDailyTarget(targetJson.target || 0);
//           setTempTarget(targetJson.target?.toString() || "");
//         }
//       } catch (error) { console.error("Failed to load data", error); } 
//       finally { setLoading(false); }
//     };
//     fetchData();
//   }, [activeTab]);

//   const handleSaveTarget = async () => {
//     try {
//       const val = Number(tempTarget);
//       if (isNaN(val)) return;

//       const res = await fetch("/api/user/target", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ target: val }),
//       });

//       if (res.ok) {
//         setBaseDailyTarget(val);
//         setIsEditing(false);
//       }
//     } catch (error) { console.error("Failed to save target"); }
//   };

//   const chartHeightDomain = useMemo(() => {
//     if (data.length === 0) return [0, baseDailyTarget * 1.2]; 

//     const maxData = Math.max(...data.map((d) => d.sales));
//     const highestPoint = Math.max(maxData, baseDailyTarget);

//     return [0, highestPoint * 1.15]; 
//   }, [data, baseDailyTarget]);

//   const displayedTarget = useMemo(() => {
//     const multiplier = CHART_CONFIG[activeTab].days;
//     return baseDailyTarget * multiplier;
//   }, [baseDailyTarget, activeTab]);

//   const averageSales = useMemo(() => {
//     if (data.length === 0) return 0;
//     const sum = data.reduce((acc, curr) => acc + curr.sales, 0);
//     return sum / data.length;
//   }, [data]);

//   const colorBaseline = averageSales;
//   const currentValue = displayValue !== null ? displayValue : (data.length > 0 ? data[data.length - 1].sales : 0);

//   const gradientOffset = useMemo(() => {
//     if (data.length === 0) return 0;
//     const dataMax = Math.max(...data.map((i) => i.sales));
//     const dataMin = Math.min(...data.map((i) => i.sales));
//     if (dataMax <= colorBaseline) return 0;
//     if (dataMin >= colorBaseline) return 1;
//     return (dataMax - colorBaseline) / (dataMax - dataMin);
//   }, [data, colorBaseline]);

//   const diff = currentValue - colorBaseline;
//   const isUp = diff >= 0;

//   const formatXAxis = (tickItem: string) => {
//     try {
//       const date = parseISO(tickItem);
//       if (activeTab === "Today") return format(date, "h:mm a");
//       if (activeTab === "1W") return format(date, "EEE");
//       if (activeTab === "1Y") return format(date, "MMM");
//       return format(date, "dd MMM");
//     } catch (e) { return ""; }
//   };

//   const CustomLabel = (props: any) => {
//     const { x, y, value } = props;
//     if (!value) return null;
//     const isAbove = value >= colorBaseline;
//     return (
//       <text x={x} y={y} dy={-10} fill={isAbove ? "#10b981" : "#ef4444"} fontSize={10} fontWeight="bold" textAnchor="middle">
//         {`₹${value.toLocaleString()}`}
//       </text>
//     );
//   };

//   if (loading && data.length === 0) {
//     return (
//       <div className="h-[400px] w-full bg-white rounded-xl flex items-center justify-center border border-gray-100">
//         <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 font-sans">

//       {/* HEADER */}
//       <div className="mb-2 flex justify-between items-start">
//         <div>
//           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
//             {displayValue ? "Selected Bill" : "Last Bill"}
//           </p>
//           <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
//             ₹{currentValue.toLocaleString()}
//           </h2>
//           <div className="flex items-center gap-2 mt-1">
//              <span className={`flex items-center font-bold text-sm ${isUp ? "text-emerald-500" : "text-red-500"}`}>
//                {isUp ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
//                {isUp ? "+" : ""}{Math.round(diff).toLocaleString()} vs Average
//              </span>
//           </div>
//         </div>

//         <div className="text-right flex flex-col items-end">
//             <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
//                 <Target size={12} /> {CHART_CONFIG[activeTab].label}
//             </p>

//             {isEditing ? (
//               <div className="flex flex-col items-end gap-1">
//                 <div className="flex items-center gap-1 bg-gray-50 p-1 rounded border border-gray-200">
//                     <span className="text-xs font-bold text-gray-500">₹</span>
//                     <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)}
//                     className="w-20 text-sm font-bold bg-transparent outline-none text-indigo-600" autoFocus placeholder="Daily..." />
//                     <button onClick={handleSaveTarget} className="p-1 hover:bg-green-100 rounded text-green-600"><Check size={14} /></button>
//                     <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-red-100 rounded text-red-600"><X size={14} /></button>
//                 </div>
//                 <span className="text-[9px] text-gray-400">Set Daily Amount</span>
//               </div>
//             ) : (
//               <div className="group flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors"
//                 onClick={() => { setTempTarget(baseDailyTarget.toString()); setIsEditing(true); }}>
//                 <p className="text-xl font-bold text-indigo-600">₹{displayedTarget.toLocaleString()}</p>
//                 <Edit2 size={12} className="text-gray-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
//               </div>
//             )}
//         </div>
//       </div>

//       {/* GRAPH AREA */}
//       <div className="h-[240px] w-full mt-4 -ml-4">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data} 
//             margin={{ top: 30, right: 35, left: 10, bottom: 0 }} 
//             onMouseMove={(e: any) => { if (e.activePayload) setDisplayValue(e.activePayload[0].value); }} 
//             onMouseLeave={() => setDisplayValue(null)}>
//             <defs>
//               <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={1} />
//                 <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={1} />
//               </linearGradient>
//               <linearGradient id="splitFill" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.1} />
//                 <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.1} />
//               </linearGradient>
//             </defs>

//             <YAxis hide domain={chartHeightDomain} />

//             <XAxis dataKey="date" hide={false} axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }} tickFormatter={formatXAxis} interval="preserveStartEnd" minTickGap={40} />
//             <Tooltip content={<CustomTooltip />} />

//             {/* UPDATED REFERENCE LINE (Average) */}
//             <ReferenceLine 
//               y={colorBaseline} 
//               stroke="#374151" 
//               strokeDasharray="3 3" 
//               strokeWidth={1.5}
//             >
//                 <Label 
//                   value={`Avg: ₹${Math.round(averageSales).toLocaleString()}`} 
//                   position="insideTopRight" 
//                   fill="#374151" 
//                   fontSize={10} 
//                   fontWeight="bold" 
//                   offset={10}
//                 />
//             </ReferenceLine>

//             {baseDailyTarget > 0 && (
//                 <ReferenceLine y={baseDailyTarget} stroke="#6366f1" strokeDasharray="5 5" strokeWidth={1.5}>
//                      <Label value={`Goal: ₹${baseDailyTarget.toLocaleString()}`} position="insideBottomRight" fill="#6366f1" fontSize={10} fontWeight="bold" offset={10}/>
//                 </ReferenceLine>
//             )}

//             <Area type="linear" dataKey="sales" stroke="url(#splitColor)" fill="url(#splitFill)" strokeWidth={2} label={activeTab === 'Today' ? <CustomLabel /> : false} 
//               dot={(props: any) => {
//                 const { cx, cy, payload } = props;
//                 const isAbove = payload.sales >= colorBaseline;
//                 return (<circle key={payload.date} cx={cx} cy={cy} r={3} fill={isAbove ? "#10b981" : "#ef4444"} />);
//               }}
//               activeDot={{ r: 6, strokeWidth: 0, fill: "#1f2937" }}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       <div className="flex justify-between mt-6 border-t border-gray-100 pt-4">
//         {TABS.map((tab) => (
//           <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[10px] font-black py-1.5 px-3 rounded-md transition-all ${activeTab === tab ? "bg-gray-900 text-white scale-110 shadow-md" : "text-gray-400 hover:bg-gray-100"}`}>{tab}</button>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label
} from "recharts";
import { format, parseISO } from "date-fns";
import { Loader2, TrendingUp, TrendingDown, Target, Edit2, Check, X } from "lucide-react";

interface SalesDataPoint {
  date: string;
  sales: number;
}

// Interface for Custom Tooltip Props
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

// Interface for Custom Label Props
interface CustomLabelProps {
  x?: number;
  y?: number;
  value?: number;
}

const CHART_CONFIG: Record<string, { api: string; label: string; days: number }> = {
  "Today": { api: "1D", label: "Daily Goal", days: 1 },
  "1W":    { api: "7D", label: "Weekly Goal", days: 7 },
  "1M":    { api: "1M", label: "Monthly Goal", days: 30 },
  "6M":    { api: "6M", label: "Half-Year Goal", days: 180 },
  "1Y":    { api: "1Y", label: "Yearly Goal", days: 365 },
  "MAX":   { api: "MAX", label: "All Time Goal", days: 1 } 
};

const TABS = Object.keys(CHART_CONFIG);

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length && label) {
    const dateObj = parseISO(label);
    const amount = payload[0].value;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs z-50">
        <p className="text-gray-400 mb-1 font-medium">{format(dateObj, "MMM dd, h:mm a")}</p>
        <p className="font-bold text-lg flex items-center gap-2">Bill: <span className="text-emerald-400">₹{amount.toLocaleString()}</span></p>
      </div>
    );
  }
  return null;
};

export default function StockStyleSalesChart() {
  const [data, setData] = useState<SalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Today");
  const [displayValue, setDisplayValue] = useState<number | null>(null);

  const [baseDailyTarget, setBaseDailyTarget] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTarget, setTempTarget] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiRange = CHART_CONFIG[activeTab].api;
        const chartRes = await fetch(`/api/analytics/sales-chart?range=${apiRange}`);
        if (chartRes.ok) {
          const json = await chartRes.json();
          setData(json);
        }

        const targetRes = await fetch("/api/user/target");
        if (targetRes.ok) {
          const targetJson = await targetRes.json();
          setBaseDailyTarget(targetJson.target || 0);
          setTempTarget(targetJson.target?.toString() || "");
        }
      } catch (error) { 
        console.error("Failed to load data", error); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [activeTab]);

  const handleSaveTarget = async () => {
    try {
      const val = Number(tempTarget);
      if (isNaN(val)) return;

      const res = await fetch("/api/user/target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: val }),
      });

      if (res.ok) {
        setBaseDailyTarget(val);
        setIsEditing(false);
      }
    } catch (error) { 
      // Log the error to use the variable, or remove the variable if not needed
      console.error("Failed to save target", error); 
    }
  };

  const chartHeightDomain = useMemo(() => {
    if (data.length === 0) return [0, baseDailyTarget * 1.2]; 

    const maxData = Math.max(...data.map((d) => d.sales));
    const highestPoint = Math.max(maxData, baseDailyTarget);

    return [0, highestPoint * 1.15]; 
  }, [data, baseDailyTarget]);

  const displayedTarget = useMemo(() => {
    const multiplier = CHART_CONFIG[activeTab].days;
    return baseDailyTarget * multiplier;
  }, [baseDailyTarget, activeTab]);

  const averageSales = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + curr.sales, 0);
    return sum / data.length;
  }, [data]);

  const colorBaseline = averageSales;
  const currentValue = displayValue !== null ? displayValue : (data.length > 0 ? data[data.length - 1].sales : 0);

  const gradientOffset = useMemo(() => {
    if (data.length === 0) return 0;
    const dataMax = Math.max(...data.map((i) => i.sales));
    const dataMin = Math.min(...data.map((i) => i.sales));
    if (dataMax <= colorBaseline) return 0;
    if (dataMin >= colorBaseline) return 1;
    return (dataMax - colorBaseline) / (dataMax - dataMin);
  }, [data, colorBaseline]);

  const diff = currentValue - colorBaseline;
  const isUp = diff >= 0;

  const formatXAxis = (tickItem: string) => {
    try {
      const date = parseISO(tickItem);
      if (activeTab === "Today") return format(date, "h:mm a");
      if (activeTab === "1W") return format(date, "EEE");
      if (activeTab === "1Y") return format(date, "MMM");
      return format(date, "dd MMM");
    } catch (e) { return ""; }
  };

  const CustomLabel = (props: CustomLabelProps) => {
    const { x, y, value } = props;
    if (value === undefined || x === undefined || y === undefined) return null;
    const isAbove = value >= colorBaseline;
    return (
      <text x={x} y={y} dy={-10} fill={isAbove ? "#10b981" : "#ef4444"} fontSize={10} fontWeight="bold" textAnchor="middle">
        {`₹${value.toLocaleString()}`}
      </text>
    );
  };

  if (loading && data.length === 0) {
    return (
      <div className="h-[400px] w-full bg-white rounded-xl flex items-center justify-center border border-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 font-sans">

      {/* HEADER */}
      <div className="mb-2 flex justify-between items-start">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
            {displayValue ? "Selected Bill" : "Last Bill"}
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            ₹{currentValue.toLocaleString()}
          </h2>
          <div className="flex items-center gap-2 mt-1">
             <span className={`flex items-center font-bold text-sm ${isUp ? "text-emerald-500" : "text-red-500"}`}>
               {isUp ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
               {isUp ? "+" : ""}{Math.round(diff).toLocaleString()} vs Average
             </span>
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Target size={12} /> {CHART_CONFIG[activeTab].label}
            </p>

            {isEditing ? (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded border border-gray-200">
                    <span className="text-xs font-bold text-gray-500">₹</span>
                    <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)}
                    className="w-20 text-sm font-bold bg-transparent outline-none text-indigo-600" autoFocus placeholder="Daily..." />
                    <button onClick={handleSaveTarget} className="p-1 hover:bg-green-100 rounded text-green-600"><Check size={14} /></button>
                    <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-red-100 rounded text-red-600"><X size={14} /></button>
                </div>
                <span className="text-[9px] text-gray-400">Set Daily Amount</span>
              </div>
            ) : (
              <div className="group flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors"
                onClick={() => { setTempTarget(baseDailyTarget.toString()); setIsEditing(true); }}>
                <p className="text-xl font-bold text-indigo-600">₹{displayedTarget.toLocaleString()}</p>
                <Edit2 size={12} className="text-gray-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            )}
        </div>
      </div>

      {/* GRAPH AREA */}
      <div className="h-[240px] w-full mt-4 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} 
            margin={{ top: 30, right: 35, left: 10, bottom: 0 }} 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onMouseMove={(e: any) => { if (e.activePayload) setDisplayValue(e.activePayload[0].value); }} 
            onMouseLeave={() => setDisplayValue(null)}>
            <defs>
              <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={1} />
                <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="splitFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset={gradientOffset} stopColor="#10b981" stopOpacity={0.1} />
                <stop offset={gradientOffset} stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <YAxis hide domain={chartHeightDomain} />

            <XAxis dataKey="date" hide={false} axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }} tickFormatter={formatXAxis} interval="preserveStartEnd" minTickGap={40} />
            <Tooltip content={<CustomTooltip />} />

            {/* UPDATED REFERENCE LINE (Average) */}
            <ReferenceLine 
              y={colorBaseline} 
              stroke="#374151" 
              strokeDasharray="3 3" 
              strokeWidth={1.5}
            >
                <Label 
                  value={`Avg: ₹${Math.round(averageSales).toLocaleString()}`} 
                  position="insideTopRight" 
                  fill="#374151" 
                  fontSize={10} 
                  fontWeight="bold" 
                  offset={10}
                />
            </ReferenceLine>

            {baseDailyTarget > 0 && (
                <ReferenceLine y={baseDailyTarget} stroke="#6366f1" strokeDasharray="5 5" strokeWidth={1.5}>
                     <Label value={`Goal: ₹${baseDailyTarget.toLocaleString()}`} position="insideBottomRight" fill="#6366f1" fontSize={10} fontWeight="bold" offset={10}/>
                </ReferenceLine>
            )}

            <Area type="linear" dataKey="sales" stroke="url(#splitColor)" fill="url(#splitFill)" strokeWidth={2} label={activeTab === 'Today' ? <CustomLabel /> : false} 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                const isAbove = payload.sales >= colorBaseline;
                return (<circle key={payload.date} cx={cx} cy={cy} r={3} fill={isAbove ? "#10b981" : "#ef4444"} />);
              }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#1f2937" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-6 border-t border-gray-100 pt-4">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[10px] font-black py-1.5 px-3 rounded-md transition-all ${activeTab === tab ? "bg-gray-900 text-white scale-110 shadow-md" : "text-gray-400 hover:bg-gray-100"}`}>{tab}</button>
        ))}
      </div>
    </div>
  );
}