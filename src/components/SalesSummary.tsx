"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { TrendingUp, Wallet, CreditCard, Loader2, AlertTriangle, Calendar as CalendarIcon, X, ChevronDown } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// --- TYPE DEFINITIONS ---
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type SalesData = {
    total: number;
    cash: number;
    qr: number;
    bills: number;
    lastUpdated: string;
};

type Period = "Today" | "Weekly" | "Monthly" | "Custom";

interface SalesSummaryProps {
    enableTabs?: boolean;
    showHeader?: boolean;
}

export default function SalesSummary({ enableTabs = true, showHeader = true }: SalesSummaryProps) {

    const { status } = useSession();

    // State for Sales Data
    const [salesData, setSalesData] = useState<SalesData>({
        total: 0, cash: 0, qr: 0, bills: 0, lastUpdated: "",
    });
    const [activePeriod, setActivePeriod] = useState<Period>("Today");
    const [isSalesLoading, setIsSalesLoading] = useState(true);
    const [salesError, setSalesError] = useState<string | null>(null);

    // Date Range State
    const [dateRange, setDateRange] = useState<Value>(null);
    const [tempDateRange, setTempDateRange] = useState<Value>(null);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        if (status !== 'authenticated') {
            setIsSalesLoading(false);
            return;
        }

        const fetchSales = async () => {
            setIsSalesLoading(true);
            setSalesError(null);
            try {
                const queryParams = new URLSearchParams();
                queryParams.append('period', activePeriod.toLowerCase());

                if (activePeriod === 'Custom') {
                    if (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
                        queryParams.append('startDate', dateRange[0].toISOString());
                        queryParams.append('endDate', dateRange[1].toISOString());
                    } else {
                        // Don't fetch if custom range is incomplete
                        setIsSalesLoading(false);
                        return;
                    }
                }

                const res = await fetch(`/api/sales?${queryParams.toString()}`);
                if (!res.ok) throw new Error("Failed to fetch sales data");
                const data: SalesData = await res.json();
                setSalesData(data);
            } catch (err) {
                console.error("Failed to load sales data:", err);
                setSalesError("Could not load data.");
            } finally {
                setIsSalesLoading(false);
            }
        };

        fetchSales();
    }, [activePeriod, dateRange, status]);

    const TABS: Period[] = ["Today", "Weekly", "Monthly", "Custom"];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3.5">
            {showHeader && (
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#5a4fcf] rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Sales</h3>
                            <p className="text-xs text-gray-500">
                                {activePeriod === 'Today' ? "Today" : `This ${activePeriod.slice(0, -2)}`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Period Tabs - Only show if enableTabs is true */}
            {enableTabs && (
                <div className="mb-4">
                    <div className="flex gap-1 mb-2.5 bg-gray-100 p-0.5 rounded-lg">
                        <LayoutGroup>
                            {TABS.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActivePeriod(tab)}
                                    className={`relative flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors z-10 ${activePeriod === tab ? "text-white" : "text-gray-600 hover:text-gray-800"
                                        }`}
                                >
                                    {activePeriod === tab && (
                                        <motion.div
                                            layoutId="activeTab-summary"
                                            className="absolute inset-0 bg-[#5a4fcf] rounded-md -z-10 shadow-sm"
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        />
                                    )}
                                    {tab}
                                </button>
                            ))}
                        </LayoutGroup>
                    </div>

                    {/* Custom Date Picker - Only show when Custom tab is active */}
                    {activePeriod === 'Custom' && (
                        <div className="relative z-50">
                            <button
                                onClick={() => {
                                    setTempDateRange(dateRange);
                                    setShowCalendar(!showCalendar);
                                }}
                                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-[#5a4fcf] transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                    <span>
                                        {Array.isArray(dateRange) && dateRange[0] && dateRange[1]
                                            ? `${dateRange[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${dateRange[1].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                                            : 'Select Date Range'}
                                    </span>
                                </div>
                                {showCalendar ? <X className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </button>

                            {/* Floating Calendar Popover */}
                            {showCalendar && (
                                <div className="absolute top-12 left-0 z-[60] bg-white rounded-xl shadow-xl border border-gray-100 p-0 w-full sm:w-[280px] animate-in fade-in zoom-in-95 duration-200">
                                    <style jsx global>{`
                                        .sales-calendar .react-calendar {
                                            border: none;
                                            font-family: inherit;
                                            width: 100%;
                                            font-size: 0.75rem;
                                            background: transparent;
                                        }
                                        .sales-calendar .react-calendar__navigation {
                                            margin-bottom: 0.5rem;
                                        }
                                        .sales-calendar .react-calendar__navigation button {
                                            min-width: 24px;
                                            background: none;
                                            font-weight: 600;
                                        }
                                        .sales-calendar .react-calendar__month-view__weekdays {
                                            font-weight: 500;
                                            font-size: 0.65rem;
                                            text-transform: uppercase;
                                            color: #9ca3af;
                                        }
                                        .sales-calendar .react-calendar__tile {
                                            padding: 8px 4px;
                                        }
                                        .sales-calendar .react-calendar__tile--active {
                                            background: #5a4fcf !important;
                                            color: white !important;
                                            border-radius: 6px;
                                        }
                                        .sales-calendar .react-calendar__tile--now {
                                            background: #f3f4f6;
                                            border-radius: 6px;
                                            color: #1f2937;
                                        }
                                        .sales-calendar .react-calendar__tile--range {
                                            background: #eef2ff;
                                            color: #5a4fcf;
                                            border-radius: 0;
                                        }
                                        .sales-calendar .react-calendar__tile--rangeStart {
                                            background: #5a4fcf !important;
                                            color: white !important;
                                            border-top-left-radius: 6px !important;
                                            border-bottom-left-radius: 6px !important;
                                        }
                                        .sales-calendar .react-calendar__tile--rangeEnd {
                                            background: #5a4fcf !important;
                                            color: white !important;
                                            border-top-right-radius: 6px !important;
                                            border-bottom-right-radius: 6px !important;
                                        }
                                    `}</style>

                                    <div className="p-3 sales-calendar">
                                        <Calendar
                                            onChange={(value) => setTempDateRange(value)}
                                            value={tempDateRange}
                                            selectRange={true}
                                            prevLabel={<ChevronDown className="w-4 h-4 rotate-90" />}
                                            nextLabel={<ChevronDown className="w-4 h-4 -rotate-90" />}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 p-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                                        <button
                                            onClick={() => setShowCalendar(false)}
                                            className="flex-1 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDateRange(tempDateRange);
                                                setShowCalendar(false);
                                            }}
                                            disabled={!Array.isArray(tempDateRange) || !tempDateRange[0] || !tempDateRange[1]}
                                            className="flex-1 py-2 text-xs font-medium text-white bg-[#5a4fcf] rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {isSalesLoading ? (
                <div className="py-6 flex flex-col items-center justify-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mb-1.5 text-[#5a4fcf]" />
                    <span className="text-xs">Loading...</span>
                </div>
            ) : salesError ? (
                <div className="py-6 flex flex-col items-center justify-center text-red-500">
                    <AlertTriangle className="w-5 h-5 mb-1.5" />
                    <span className="text-xs">{salesError}</span>
                </div>
            ) : (
                enableTabs ? (
                    /* Default / Report Layout (Vertical List) */
                    <div className="space-y-2.5">
                        {/* Total Sales */}
                        <div className="bg-gradient-to-br from-[#5a4fcf] to-[#7c6fdd] rounded-lg p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs opacity-90">Total Sales</p>
                                    <p className="text-2xl font-bold">₹{salesData.total.toLocaleString()}</p>
                                </div>
                                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2.5 border border-green-200">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Wallet className="w-3.5 h-3.5 text-green-600" />
                                    <p className="text-xs font-semibold text-green-700">Cash</p>
                                </div>
                                <p className="text-lg font-bold text-green-800">₹{salesData.cash.toLocaleString()}</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2.5 border border-blue-200">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                    <p className="text-xs font-semibold text-blue-700">QR/Online</p>
                                </div>
                                <p className="text-lg font-bold text-blue-800">₹{salesData.qr.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
                            <span className="text-xs font-medium text-gray-700">{salesData.bills} Bills</span>
                            <span className="text-xs text-gray-500">
                                {salesData.lastUpdated
                                    ? new Date(salesData.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : ''}
                            </span>
                        </div>
                    </div>
                ) : (
                    /* Dashboard Layout (3-Column Grid) */
                    <div className="grid grid-cols-3 gap-3">
                        {/* Total Sales */}
                        <div className="bg-indigo-50 rounded-xl border-2 border-indigo-200 p-2 flex flex-col items-center justify-center text-center h-24">
                            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mb-1">
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">Total Sales</p>
                            <p className="text-lg font-extrabold text-gray-900">₹{salesData.total.toLocaleString()}</p>
                        </div>

                        {/* Cash Sales */}
                        <div className="bg-green-50 rounded-xl border-2 border-green-200 p-2 flex flex-col items-center justify-center text-center h-24">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-1">
                                <Wallet className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-[10px] font-bold text-green-500 uppercase tracking-wide">Cash</p>
                            <p className="text-lg font-extrabold text-gray-900">₹{salesData.cash.toLocaleString()}</p>
                        </div>

                        {/* QR/Online Sales */}
                        <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-2 flex flex-col items-center justify-center text-center h-24">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-1">
                                <CreditCard className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">Online/QR</p>
                            <p className="text-lg font-extrabold text-gray-900">₹{salesData.qr.toLocaleString()}</p>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
