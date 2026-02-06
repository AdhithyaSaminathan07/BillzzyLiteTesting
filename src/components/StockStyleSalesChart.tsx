// // "use client";

// // import { useState, useEffect, useMemo } from "react";
// // import {
// //   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label
// // } from "recharts";
// // import { format, parseISO } from "date-fns";
// // import { Loader2, TrendingUp, TrendingDown, Target, Edit2, Check, X } from "lucide-react";

// // // --- INTERFACES ---
// // interface SalesDataPoint {
// //   date: string;
// //   sales: number;
// // }
// // interface CustomTooltipProps {
// //   active?: boolean;
// //   payload?: Array<{ value: number }>;
// //   label?: string;
// // }
// // interface CustomLabelProps {
// //   x?: number;
// //   y?: number;
// //   value?: number;
// // }

// // // --- CONSTANTS ---
// // const CHART_CONFIG: Record<string, { api: string; label: string; days: number }> = {
// //   "Today": { api: "1D", label: "Daily Goal", days: 1 },
// //   "1W":    { api: "7D", label: "Weekly Goal", days: 7 },
// //   "1M":    { api: "1M", label: "Monthly Goal", days: 30 },
// //   "6M":    { api: "6M", label: "Half-Year Goal", days: 180 },
// //   "1Y":    { api: "1Y", label: "Yearly Goal", days: 365 },
// //   "MAX":   { api: "MAX", label: "All Time Goal", days: 1 } 
// // };
// // const TABS = Object.keys(CHART_CONFIG);
// // const COLORS = {
// //     BELOW_AVG: '#ef4444',   // Red
// //     ABOVE_AVG: '#10b981',   // Green
// //     ABOVE_TARGET: '#6366f1' // Blue
// // };

// // // --- TOOLTIP COMPONENT ---
// // const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
// //   if (active && payload && payload.length && label) {
// //     const dateObj = parseISO(label);
// //     const amount = payload[0].value;
// //     return (
// //       <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs z-50">
// //         <p className="text-gray-400 mb-1 font-medium">{format(dateObj, "MMM dd, h:mm a")}</p>
// //         <p className="font-bold text-lg flex items-center gap-2">Bill: <span className="text-emerald-400">₹{amount.toLocaleString()}</span></p>
// //       </div>
// //     );
// //   }
// //   return null;
// // };

// // // --- MAIN CHART COMPONENT ---
// // export default function StockStyleSalesChart() {
// //   const [data, setData] = useState<SalesDataPoint[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [activeTab, setActiveTab] = useState("Today");
// //   const [displayValue, setDisplayValue] = useState<number | null>(null);

// //   const [baseDailyTarget, setBaseDailyTarget] = useState<number>(0);
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [tempTarget, setTempTarget] = useState("");

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       setLoading(true);
// //       try {
// //         const apiRange = CHART_CONFIG[activeTab].api;
// //         const chartRes = await fetch(`/api/analytics/sales-chart?range=${apiRange}`);
// //         if (chartRes.ok) setData(await chartRes.json());

// //         const targetRes = await fetch("/api/user/target");
// //         if (targetRes.ok) {
// //           const { target = 0 } = await targetRes.json();
// //           setBaseDailyTarget(target);
// //           setTempTarget(target.toString());
// //         }
// //       } catch (error) { console.error("Failed to load data", error); } 
// //       finally { setLoading(false); }
// //     };
// //     fetchData();
// //   }, [activeTab]);

// //   const handleSaveTarget = async () => {
// //     try {
// //       const val = Number(tempTarget);
// //       if (isNaN(val)) return;
// //       const res = await fetch("/api/user/target", {
// //         method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target: val }),
// //       });
// //       if (res.ok) { setBaseDailyTarget(val); setIsEditing(false); }
// //     } catch (error) { console.error("Failed to save target", error); }
// //   };

// //   // --- MEMOIZED CALCULATIONS ---
// //   const { averageSales, displayedTarget, chartHeightDomain } = useMemo(() => {
// //     const avg = data.length > 0 ? data.reduce((acc, curr) => acc + curr.sales, 0) / data.length : 0;
// //     const target = baseDailyTarget * CHART_CONFIG[activeTab].days;

// //     if (data.length === 0) return { averageSales: avg, displayedTarget: target, chartHeightDomain: [0, baseDailyTarget]};

// //     const maxData = Math.max(...data.map((d) => d.sales));
// //     // FINAL FIX: The Y-axis domain MUST NOT have extra padding for the gradient to be accurate.
// //     // The domain's top should be the highest value of either the data, the target, or the average.
// //     const highestPoint = Math.max(maxData, baseDailyTarget, avg);

// //     return {
// //       averageSales: avg,
// //       displayedTarget: target,
// //       chartHeightDomain: [0, highestPoint]
// //     };
// //   }, [data, baseDailyTarget, activeTab]);

// //   // Gradient calculation is now accurate because the domain it's based on has no padding.
// //   const { stop1, stop2, topColor, middleColor, bottomColor } = useMemo(() => {
// //     const [domainMin, domainMax] = chartHeightDomain;
// //     const totalDomainRange = domainMax - domainMin;

// //     if (totalDomainRange === 0) {
// //         return { stop1: 0.5, stop2: 0.5, topColor: COLORS.ABOVE_AVG, middleColor: COLORS.ABOVE_AVG, bottomColor: COLORS.ABOVE_AVG };
// //     }

// //     const clamp = (num: number) => Math.max(0, Math.min(1, num));
// //     const isNormalOrder = averageSales <= baseDailyTarget;

// //     const upperThreshold = isNormalOrder ? baseDailyTarget : averageSales;
// //     const lowerThreshold = isNormalOrder ? averageSales : baseDailyTarget;

// //     // Calculate the percentage position of each threshold from the TOP of the chart's domain
// //     const stop1_calc = clamp((domainMax - upperThreshold) / totalDomainRange);
// //     const stop2_calc = clamp((domainMax - lowerThreshold) / totalDomainRange);

// //     return {
// //         stop1: stop1_calc,
// //         stop2: stop2_calc,
// //         topColor: isNormalOrder ? COLORS.ABOVE_TARGET : COLORS.ABOVE_AVG,
// //         middleColor: isNormalOrder ? COLORS.ABOVE_AVG : COLORS.ABOVE_TARGET,
// //         bottomColor: COLORS.BELOW_AVG
// //     };
// //   }, [chartHeightDomain, averageSales, baseDailyTarget]);

// //   // --- DYNAMIC VALUES & HELPERS ---
// //   const currentValue = displayValue ?? (data.length > 0 ? data.at(-1)!.sales : 0);
// //   const diff = currentValue - averageSales;
// //   const isUp = diff >= 0;

// //   const getDynamicColor = (value: number) => {
// //     if (value >= baseDailyTarget) return COLORS.ABOVE_TARGET;
// //     if (value >= averageSales) return COLORS.ABOVE_AVG;
// //     return COLORS.BELOW_AVG;
// //   };

// //   const formatXAxis = (tickItem: string) => {
// //     try {
// //       const date = parseISO(tickItem);
// //       if (activeTab === "Today") return format(date, "h:mm a");
// //       if (activeTab === "1W") return format(date, "EEE");
// //       if (activeTab === "1Y") return format(date, "MMM");
// //       return format(date, "dd MMM");
// //     } catch (e) { return ""; }
// //   };

// //   const CustomLabel = (props: CustomLabelProps) => {
// //     const { x, y, value } = props;
// //     if (value === undefined || x === undefined || y === undefined) return null;
// //     return (
// //       <text x={x} y={y} dy={-10} fill={getDynamicColor(value)} fontSize={10} fontWeight="bold" textAnchor="middle">
// //         {`₹${value.toLocaleString()}`}
// //       </text>
// //     );
// //   };

// //   if (loading && data.length === 0) {
// //     return <div className="h-[400px] w-full bg-white rounded-xl flex items-center justify-center border border-gray-100"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;
// //   }

// //   return (
// //     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 font-sans">
// //       {/* HEADER */}
// //       <div className="mb-2 flex justify-between items-start">
// //         <div>
// //           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{displayValue ? "Selected Bill" : "Last Bill"}</p>
// //           <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">₹{currentValue.toLocaleString()}</h2>
// //           <div className="flex items-center gap-2 mt-1">
// //              <span className={`flex items-center font-bold text-sm ${isUp ? "text-emerald-500" : "text-red-500"}`}>
// //                {isUp ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
// //                {isUp ? "+" : ""}{Math.round(diff).toLocaleString()} vs Average
// //              </span>
// //           </div>
// //         </div>
// //         <div className="text-right flex flex-col items-end">
// //             <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Target size={12} /> {CHART_CONFIG[activeTab].label}</p>
// //             {isEditing ? (
// //               <div className="flex flex-col items-end gap-1">
// //                 <div className="flex items-center gap-1 bg-gray-50 p-1 rounded border border-gray-200">
// //                     <span className="text-xs font-bold text-gray-500">₹</span>
// //                     <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} className="w-20 text-sm font-bold bg-transparent outline-none text-indigo-600" autoFocus placeholder="Daily..." />
// //                     <button onClick={handleSaveTarget} className="p-1 hover:bg-green-100 rounded text-green-600"><Check size={14} /></button>
// //                     <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-red-100 rounded text-red-600"><X size={14} /></button>
// //                 </div>
// //                 <span className="text-[9px] text-gray-400">Set Daily Amount</span>
// //               </div>
// //             ) : (
// //               <div className="group flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors" onClick={() => { setTempTarget(baseDailyTarget.toString()); setIsEditing(true); }}>
// //                 <p className="text-xl font-bold text-indigo-600">₹{displayedTarget.toLocaleString()}</p>
// //                 <Edit2 size={12} className="text-gray-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
// //               </div>
// //             )}
// //         </div>
// //       </div>

// //       {/* GRAPH AREA */}
// //       <div className="h-[240px] w-full mt-4 -ml-4">
// //         <ResponsiveContainer width="100%" height="100%">
// //           <AreaChart data={data} margin={{ top: 30, right: 35, left: 10, bottom: 0 }} onMouseMove={(e: any) => { if (e.activePayload) setDisplayValue(e.activePayload[0].value); }} onMouseLeave={() => setDisplayValue(null)}>
// //             <defs>
// //               <linearGradient id="multiColorStroke" x1="0" y1="0" x2="0" y2="1">
// //                 <stop offset={stop1} stopColor={topColor} />
// //                 <stop offset={stop1} stopColor={middleColor} />
// //                 <stop offset={stop2} stopColor={middleColor} />
// //                 <stop offset={stop2} stopColor={bottomColor} />
// //               </linearGradient>
// //               <linearGradient id="multiColorFill" x1="0" y1="0" x2="0" y2="1">
// //                 <stop offset={stop1} stopColor={topColor} stopOpacity={0.2} />
// //                 <stop offset={stop1} stopColor={middleColor} stopOpacity={0.1} />
// //                 <stop offset={stop2} stopColor={middleColor} stopOpacity={0.1} />
// //                 <stop offset={stop2} stopColor={bottomColor} stopOpacity={0.1} />
// //               </linearGradient>
// //             </defs>

// //             <YAxis hide domain={chartHeightDomain} allowDataOverflow={true} />
// //             <XAxis dataKey="date" hide={false} axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }} tickFormatter={formatXAxis} interval="preserveStartEnd" minTickGap={40} />
// //             <Tooltip content={<CustomTooltip />} />

// //             <ReferenceLine y={averageSales} stroke="#374151" strokeDasharray="3 3" strokeWidth={1.5}><Label value={`Avg: ₹${Math.round(averageSales).toLocaleString()}`} position="insideTopRight" fill="#374151" fontSize={10} fontWeight="bold" offset={10}/></ReferenceLine>
// //             {baseDailyTarget > 0 && (<ReferenceLine y={baseDailyTarget} stroke="#6366f1" strokeDasharray="5 5" strokeWidth={1.5}><Label value={`Goal: ₹${baseDailyTarget.toLocaleString()}`} position="insideBottomRight" fill="#6366f1" fontSize={10} fontWeight="bold" offset={10}/></ReferenceLine>)}

// //             {/* The type is "linear" to match the sharp corners in the reference image. */}
// //             <Area type="linear" dataKey="sales" stroke="url(#multiColorStroke)" fill="url(#multiColorFill)" strokeWidth={2} label={activeTab === 'Today' ? <CustomLabel /> : false} 
// //               dot={(props: any) => {
// //                 const { cx, cy, payload } = props;
// //                 return (<circle key={payload.date} cx={cx} cy={cy} r={3} fill={getDynamicColor(payload.sales)} />);
// //               }}
// //               activeDot={{ r: 6, strokeWidth: 0, fill: "#1f2937" }}
// //             />
// //           </AreaChart>
// //         </ResponsiveContainer>
// //       </div>

// //       {/* FOOTER TABS */}
// //       <div className="flex justify-between mt-6 border-t border-gray-100 pt-4">
// //         {TABS.map((tab) => (
// //           <button key={tab} onClick={() => setActiveTab(tab)} className={`text-[10px] font-black py-1.5 px-3 rounded-md transition-all ${activeTab === tab ? "bg-gray-900 text-white scale-110 shadow-md" : "text-gray-400 hover:bg-gray-100"}`}>{tab}</button>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState, useEffect, useMemo } from "react";
// import {
//   AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Label
// } from "recharts";
// import { format, parseISO } from "date-fns";
// import { Loader2, TrendingUp, TrendingDown, Target, Edit2, Check, X } from "lucide-react";

// // --- INTERFACES ---
// interface SalesDataPoint {
//   date: string;
//   sales: number;
// }
// interface CustomTooltipProps {
//   active?: boolean;
//   payload?: Array<{ value: number }>;
//   label?: string;
// }
// interface CustomLabelProps {
//   x?: number;
//   y?: number;
//   value?: number;
// }

// // --- CONSTANTS ---
// const CHART_CONFIG: Record<string, { api: string; label: string; days: number }> = {
//   "Today": { api: "1D", label: "Daily Goal", days: 1 },
//   "1W":    { api: "7D", label: "Weekly Goal", days: 7 },
//   "1M":    { api: "1M", label: "Monthly Goal", days: 30 },
//   "6M":    { api: "6M", label: "Half-Year Goal", days: 180 },
//   "1Y":    { api: "1Y", label: "Yearly Goal", days: 365 },
//   "MAX":   { api: "MAX", label: "All Time Goal", days: 1 } 
// };
// const TABS = Object.keys(CHART_CONFIG);
// const COLORS = {
//     BELOW_AVG: '#ef4444',   // Red
//     ABOVE_AVG: '#10b981',   // Green
//     ABOVE_TARGET: '#6366f1' // Blue
// };

// // --- TOOLTIP COMPONENT ---
// const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
//   if (active && payload && payload.length && label) {
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

// // --- MAIN CHART COMPONENT ---
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
//         if (chartRes.ok) setData(await chartRes.json());

//         const targetRes = await fetch("/api/user/target");
//         if (targetRes.ok) {
//           const { target = 0 } = await targetRes.json();
//           setBaseDailyTarget(target);
//           setTempTarget(target.toString());
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
//         method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target: val }),
//       });
//       if (res.ok) { setBaseDailyTarget(val); setIsEditing(false); }
//     } catch (error) { console.error("Failed to save target", error); }
//   };

//   // --- MEMOIZED CALCULATIONS ---
//   const { averageSales, displayedTarget, chartHeightDomain } = useMemo(() => {
//     const avg = data.length > 0 ? data.reduce((acc, curr) => acc + curr.sales, 0) / data.length : 0;
//     const target = baseDailyTarget * CHART_CONFIG[activeTab].days;

//     if (data.length === 0) return { averageSales: avg, displayedTarget: target, chartHeightDomain: [0, baseDailyTarget]};

//     const maxData = Math.max(...data.map((d) => d.sales));
//     const highestPoint = Math.max(maxData, baseDailyTarget, avg);

//     return {
//       averageSales: avg,
//       displayedTarget: target,
//       chartHeightDomain: [0, highestPoint]
//     };
//   }, [data, baseDailyTarget, activeTab]);

//   const { stop1, stop2, topColor, middleColor, bottomColor } = useMemo(() => {
//     const [domainMin, domainMax] = chartHeightDomain;
//     const totalDomainRange = domainMax - domainMin;

//     if (totalDomainRange === 0) {
//         return { stop1: 0.5, stop2: 0.5, topColor: COLORS.ABOVE_AVG, middleColor: COLORS.ABOVE_AVG, bottomColor: COLORS.ABOVE_AVG };
//     }

//     const clamp = (num: number) => Math.max(0, Math.min(1, num));
//     const isNormalOrder = averageSales <= baseDailyTarget;

//     const upperThreshold = isNormalOrder ? baseDailyTarget : averageSales;
//     const lowerThreshold = isNormalOrder ? averageSales : baseDailyTarget;

//     const stop1_calc = clamp((domainMax - upperThreshold) / totalDomainRange);
//     const stop2_calc = clamp((domainMax - lowerThreshold) / totalDomainRange);

//     return {
//         stop1: stop1_calc,
//         stop2: stop2_calc,
//         topColor: isNormalOrder ? COLORS.ABOVE_TARGET : COLORS.ABOVE_AVG,
//         middleColor: isNormalOrder ? COLORS.ABOVE_AVG : COLORS.ABOVE_TARGET,
//         bottomColor: COLORS.BELOW_AVG
//     };
//   }, [chartHeightDomain, averageSales, baseDailyTarget]);

//   // --- DYNAMIC VALUES & HELPERS ---
//   const currentValue = displayValue ?? (data.length > 0 ? data.at(-1)!.sales : 0);
//   const diff = currentValue - averageSales;
//   const isUp = diff >= 0;

//   const getDynamicColor = (value: number) => {
//     if (value >= baseDailyTarget) return COLORS.ABOVE_TARGET;
//     if (value >= averageSales) return COLORS.ABOVE_AVG;
//     return COLORS.BELOW_AVG;
//   };

//   const formatXAxis = (tickItem: string) => {
//     try {
//       const date = parseISO(tickItem);
//       if (activeTab === "Today") return format(date, "h:mm a");
//       if (activeTab === "1W") return format(date, "EEE");
//       if (activeTab === "1Y") return format(date, "MMM");
//       return format(date, "dd MMM");
//     // FIXED: Unused variable warning by removing 'e'
//     } catch { return ""; }
//   };

//   const CustomLabel = (props: CustomLabelProps) => {
//     const { x, y, value } = props;
//     if (value === undefined || x === undefined || y === undefined) return null;
//     return (
//       <text x={x} y={y} dy={-10} fill={getDynamicColor(value)} fontSize={10} fontWeight="bold" textAnchor="middle">
//         {`₹${value.toLocaleString()}`}
//       </text>
//     );
//   };

//   if (loading && data.length === 0) {
//     return <div className="h-[400px] w-full bg-white rounded-xl flex items-center justify-center border border-gray-100"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;
//   }

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 font-sans">
//       {/* HEADER */}
//       <div className="mb-2 flex justify-between items-start">
//         <div>
//           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{displayValue ? "Selected Bill" : "Last Bill"}</p>
//           <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">₹{currentValue.toLocaleString()}</h2>
//           <div className="flex items-center gap-2 mt-1">
//              <span className={`flex items-center font-bold text-sm ${isUp ? "text-emerald-500" : "text-red-500"}`}>
//                {isUp ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
//                {isUp ? "+" : ""}{Math.round(diff).toLocaleString()} vs Average
//              </span>
//           </div>
//         </div>
//         <div className="text-right flex flex-col items-end">
//             <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Target size={12} /> {CHART_CONFIG[activeTab].label}</p>
//             {isEditing ? (
//               <div className="flex flex-col items-end gap-1">
//                 <div className="flex items-center gap-1 bg-gray-50 p-1 rounded border border-gray-200">
//                     <span className="text-xs font-bold text-gray-500">₹</span>
//                     <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} className="w-20 text-sm font-bold bg-transparent outline-none text-indigo-600" autoFocus placeholder="Daily..." />
//                     <button onClick={handleSaveTarget} className="p-1 hover:bg-green-100 rounded text-green-600"><Check size={14} /></button>
//                     <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-red-100 rounded text-red-600"><X size={14} /></button>
//                 </div>
//                 <span className="text-[9px] text-gray-400">Set Daily Amount</span>
//               </div>
//             ) : (
//               <div className="group flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors" onClick={() => { setTempTarget(baseDailyTarget.toString()); setIsEditing(true); }}>
//                 <p className="text-xl font-bold text-indigo-600">₹{displayedTarget.toLocaleString()}</p>
//                 <Edit2 size={12} className="text-gray-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
//               </div>
//             )}
//         </div>
//       </div>

//       {/* GRAPH AREA */}
//       <div className="h-[240px] w-full mt-4 -ml-4">
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data} margin={{ top: 30, right: 35, left: 10, bottom: 0 }} 
//             // FIXED: Added eslint-disable to fix the build error
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             onMouseMove={(e: any) => { if (e.activePayload) setDisplayValue(e.activePayload[0].value); }} 
//             onMouseLeave={() => setDisplayValue(null)}>
//             <defs>
//               <linearGradient id="multiColorStroke" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset={stop1} stopColor={topColor} />
//                 <stop offset={stop1} stopColor={middleColor} />
//                 <stop offset={stop2} stopColor={middleColor} />
//                 <stop offset={stop2} stopColor={bottomColor} />
//               </linearGradient>
//               <linearGradient id="multiColorFill" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset={stop1} stopColor={topColor} stopOpacity={0.2} />
//                 <stop offset={stop1} stopColor={middleColor} stopOpacity={0.1} />
//                 <stop offset={stop2} stopColor={middleColor} stopOpacity={0.1} />
//                 <stop offset={stop2} stopColor={bottomColor} stopOpacity={0.1} />
//               </linearGradient>
//             </defs>

//             <YAxis hide domain={chartHeightDomain} allowDataOverflow={true} />
//             <XAxis dataKey="date" hide={false} axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }} tickFormatter={formatXAxis} interval="preserveStartEnd" minTickGap={40} />
//             <Tooltip content={<CustomTooltip />} />

//             <ReferenceLine y={averageSales} stroke="#374151" strokeDasharray="3 3" strokeWidth={1.5}><Label value={`Avg: ₹${Math.round(averageSales).toLocaleString()}`} position="insideTopRight" fill="#374151" fontSize={10} fontWeight="bold" offset={10}/></ReferenceLine>
//             {baseDailyTarget > 0 && (<ReferenceLine y={baseDailyTarget} stroke="#6366f1" strokeDasharray="5 5" strokeWidth={1.5}><Label value={`Goal: ₹${baseDailyTarget.toLocaleString()}`} position="insideBottomRight" fill="#6366f1" fontSize={10} fontWeight="bold" offset={10}/></ReferenceLine>)}

//             <Area type="linear" dataKey="sales" stroke="url(#multiColorStroke)" fill="url(#multiColorFill)" strokeWidth={2} label={activeTab === 'Today' ? <CustomLabel /> : false} 
//               // FIXED: Added eslint-disable to fix the build error
//               // eslint-disable-next-line @typescript-eslint/no-explicit-any
//               dot={(props: any) => {
//                 const { cx, cy, payload } = props;
//                 return (<circle key={payload.date} cx={cx} cy={cy} r={3} fill={getDynamicColor(payload.sales)} />);
//               }}
//               activeDot={{ r: 6, strokeWidth: 0, fill: "#1f2937" }}
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       {/* FOOTER TABS */}
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
import { motion, LayoutGroup } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Loader2, TrendingUp, TrendingDown, Target, Edit2, Check, X, Calendar as CalendarIcon } from "lucide-react";

// --- INTERFACES ---
interface SalesDataPoint {
  date: string;
  sales: number;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}
interface CustomLabelProps {
  x?: number;
  y?: number;
  value?: number;
}

// --- CONSTANTS ---
const CHART_CONFIG: Record<string, { api: string; label: string; days: number }> = {
  "Today": { api: "1D", label: "Daily Goal", days: 1 },
  "Weekly": { api: "7D", label: "Weekly Goal", days: 7 },
  "Monthly": { api: "1M", label: "Monthly Goal", days: 30 },
  "Custom": { api: "", label: "Custom Range", days: 0 }
};
const TABS = Object.keys(CHART_CONFIG);

const COLORS = {
  BELOW_AVG: '#ef4444',   // Red
  ABOVE_AVG: '#10b981',   // Green
  ABOVE_TARGET: '#6366f1' // Blue
};

// --- TOOLTIP COMPONENT ---
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

// --- MAIN CHART COMPONENT ---
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
      if (activeTab === 'Custom') {
        setData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const apiRange = CHART_CONFIG[activeTab].api;
        const chartRes = await fetch(`/api/analytics/sales-chart?range=${apiRange}`);
        if (chartRes.ok) setData(await chartRes.json());

        const targetRes = await fetch("/api/user/target");
        if (targetRes.ok) {
          const { target = 0 } = await targetRes.json();
          setBaseDailyTarget(target);
          setTempTarget(target.toString());
        }
      } catch (error) { console.error("Failed to load data", error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [activeTab]);

  const handleSaveTarget = async () => {
    try {
      const val = Number(tempTarget);
      if (isNaN(val)) return;
      const res = await fetch("/api/user/target", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target: val }),
      });
      if (res.ok) { setBaseDailyTarget(val); setIsEditing(false); }
    } catch (error) { console.error("Failed to save target", error); }
  };

  // --- MEMOIZED CALCULATIONS ---
  const { averageSales, displayedTarget, chartHeightDomain } = useMemo(() => {
    const avg = data.length > 0 ? data.reduce((acc, curr) => acc + curr.sales, 0) / data.length : 0;
    const target = baseDailyTarget * (CHART_CONFIG[activeTab]?.days || 1);

    if (data.length === 0) return { averageSales: avg, displayedTarget: target, chartHeightDomain: [0, baseDailyTarget] };

    const maxData = Math.max(...data.map((d) => d.sales));
    const highestPoint = Math.max(maxData, baseDailyTarget, avg);

    return {
      averageSales: avg,
      displayedTarget: target,
      chartHeightDomain: [0, highestPoint]
    };
  }, [data, baseDailyTarget, activeTab]);

  const { stop1, stop2, topColor, middleColor, bottomColor } = useMemo(() => {
    const [domainMin, domainMax] = chartHeightDomain;
    const totalDomainRange = domainMax - domainMin;

    if (totalDomainRange === 0) {
      return { stop1: 0.5, stop2: 0.5, topColor: COLORS.ABOVE_AVG, middleColor: COLORS.ABOVE_AVG, bottomColor: COLORS.ABOVE_AVG };
    }

    const clamp = (num: number) => Math.max(0, Math.min(1, num));
    const isNormalOrder = averageSales <= baseDailyTarget;

    const upperThreshold = isNormalOrder ? baseDailyTarget : averageSales;
    const lowerThreshold = isNormalOrder ? averageSales : baseDailyTarget;

    const stop1_calc = clamp((domainMax - upperThreshold) / totalDomainRange);
    const stop2_calc = clamp((domainMax - lowerThreshold) / totalDomainRange);

    return {
      stop1: stop1_calc,
      stop2: stop2_calc,
      topColor: isNormalOrder ? COLORS.ABOVE_TARGET : COLORS.ABOVE_AVG,
      middleColor: isNormalOrder ? COLORS.ABOVE_AVG : COLORS.ABOVE_TARGET,
      bottomColor: COLORS.BELOW_AVG
    };
  }, [chartHeightDomain, averageSales, baseDailyTarget]);

  // --- DYNAMIC VALUES & HELPERS ---
  const currentValue = displayValue ?? (data.length > 0 ? data.at(-1)!.sales : 0);
  const diff = currentValue - averageSales;
  const isUp = diff >= 0;

  const getDynamicColor = (value: number) => {
    if (value >= baseDailyTarget) return COLORS.ABOVE_TARGET;
    if (value >= averageSales) return COLORS.ABOVE_AVG;
    return COLORS.BELOW_AVG;
  };

  const formatXAxis = (tickItem: string) => {
    try {
      const date = parseISO(tickItem);
      if (activeTab === "Today") return format(date, "h:mm a");
      if (activeTab === "Weekly") return format(date, "EEE");
      if (activeTab === "Monthly") return format(date, "dd MMM");
      return format(date, "dd MMM");
    } catch { return ""; }
  };

  const CustomLabel = (props: CustomLabelProps) => {
    const { x, y, value } = props;
    if (value === undefined || x === undefined || y === undefined) return null;
    return (
      <text x={x} y={y} dy={-10} fill={getDynamicColor(value)} fontSize={10} fontWeight="bold" textAnchor="middle">
        {`₹${value.toLocaleString()}`}
      </text>
    );
  };

  if (loading && data.length === 0 && activeTab !== 'Custom') {
    return <div className="h-[400px] w-full bg-white rounded-xl flex items-center justify-center border border-gray-100"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>;
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm font-sans">
      {/* HEADER */}
      <div className="mb-2 flex justify-between items-start">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{displayValue ? "Selected Bill" : "Last Bill"}</p>
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">₹{currentValue.toLocaleString()}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`flex items-center font-bold text-sm ${isUp ? "text-emerald-500" : "text-red-500"}`}>
              {isUp ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
              {isUp ? "+" : ""}{Math.round(diff).toLocaleString()} vs Average
            </span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Target size={12} /> {CHART_CONFIG[activeTab]?.label || 'Daily Goal'}</p>
          {isEditing ? (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded border border-gray-200">
                <span className="text-xs font-bold text-gray-500">₹</span>
                <input type="number" value={tempTarget} onChange={(e) => setTempTarget(e.target.value)} className="w-20 text-sm font-bold bg-transparent outline-none text-indigo-600" autoFocus placeholder="Daily..." />
                <button onClick={handleSaveTarget} className="p-1 hover:bg-green-100 rounded text-green-600"><Check size={14} /></button>
                <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-red-100 rounded text-red-600"><X size={14} /></button>
              </div>
              <span className="text-[9px] text-gray-400">Set Daily Amount</span>
            </div>
          ) : (
            <div className="group flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors" onClick={() => { setTempTarget(baseDailyTarget.toString()); setIsEditing(true); }}>
              <p className="text-xl font-bold text-indigo-600">₹{displayedTarget.toLocaleString()}</p>
              <Edit2 size={12} className="text-gray-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          )}
        </div>
      </div>

      {/* GRAPH AREA */}
      <div className="h-[240px] w-full mt-4">
        {activeTab === 'Custom' ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-400">
            <CalendarIcon className="w-10 h-10 mb-2 text-gray-300" />
            <p className="text-sm font-semibold">Custom Date Range</p>
            <p className="text-xs">Date picker UI to be implemented here.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 30, right: 10, left: 10, bottom: 0 }}
              // FIXED: Re-added eslint-disable to fix the build error
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onMouseMove={(e: any) => { if (e.activePayload) setDisplayValue(e.activePayload[0].value); }}
              onMouseLeave={() => setDisplayValue(null)}>
              <defs>
                <linearGradient id="multiColorStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={stop1} stopColor={topColor} />
                  <stop offset={stop1} stopColor={middleColor} />
                  <stop offset={stop2} stopColor={middleColor} />
                  <stop offset={stop2} stopColor={bottomColor} />
                </linearGradient>
                <linearGradient id="multiColorFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={stop1} stopColor={topColor} stopOpacity={0.2} />
                  <stop offset={stop1} stopColor={middleColor} stopOpacity={0.1} />
                  <stop offset={stop2} stopColor={middleColor} stopOpacity={0.1} />
                  <stop offset={stop2} stopColor={bottomColor} stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <YAxis hide domain={chartHeightDomain} allowDataOverflow={true} />
              <XAxis dataKey="date" hide={false} axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700 }} tickFormatter={formatXAxis} interval="preserveStartEnd" minTickGap={40} />
              <Tooltip content={<CustomTooltip />} />

              <ReferenceLine y={averageSales} stroke="#374151" strokeDasharray="3 3" strokeWidth={1.5}><Label value={`Avg: ₹${Math.round(averageSales).toLocaleString()}`} position="insideTopRight" fill="#374151" fontSize={10} fontWeight="bold" offset={10} /></ReferenceLine>
              {baseDailyTarget > 0 && (<ReferenceLine y={baseDailyTarget} stroke="#6366f1" strokeDasharray="5 5" strokeWidth={1.5}><Label value={`Goal: ₹${baseDailyTarget.toLocaleString()}`} position="insideBottomRight" fill="#6366f1" fontSize={10} fontWeight="bold" offset={10} /></ReferenceLine>)}

              <Area type="linear" dataKey="sales" stroke="url(#multiColorStroke)" fill="url(#multiColorFill)" strokeWidth={2} label={activeTab === 'Today' ? <CustomLabel /> : false}
                // FIXED: Re-added eslint-disable to fix the build error
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  return (<circle key={payload.date} cx={cx} cy={cy} r={3} fill={getDynamicColor(payload.sales)} />);
                }}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#1f2937" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* FOOTER TABS */}
      <div className="flex gap-1 mt-6 bg-gray-100 p-0.5 rounded-lg">
        <LayoutGroup>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-1.5 text-[10px] font-black rounded-md transition-colors z-10 ${activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab-graph"
                  className="absolute inset-0 bg-gray-900 rounded-md -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              {tab}
            </button>
          ))}
        </LayoutGroup>
      </div>
    </div>
  );
}