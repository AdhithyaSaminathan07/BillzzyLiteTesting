"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { TrendingUp, Wallet, CreditCard, Loader2, AlertTriangle } from "lucide-react";
import { motion, LayoutGroup } from "framer-motion";

// --- TYPE DEFINITIONS ---
type SalesData = {
    total: number;
    cash: number;
    qr: number;
    bills: number;
    lastUpdated: string;
};

type Period = "Today" | "Weekly" | "Monthly";

interface SalesSummaryProps {
    enableTabs?: boolean;
}

export default function SalesSummary({ enableTabs = true }: SalesSummaryProps) {
    const { status } = useSession();

    // State for Sales Data
    const [salesData, setSalesData] = useState<SalesData>({
        total: 0, cash: 0, qr: 0, bills: 0, lastUpdated: "",
    });
    const [activePeriod, setActivePeriod] = useState<Period>("Today");
    const [isSalesLoading, setIsSalesLoading] = useState(true);
    const [salesError, setSalesError] = useState<string | null>(null);

    useEffect(() => {
        if (status !== 'authenticated') {
            setIsSalesLoading(false);
            return;
        }

        const fetchSales = async () => {
            setIsSalesLoading(true);
            setSalesError(null);
            try {
                const res = await fetch(`/api/sales?period=${activePeriod.toLowerCase()}`);
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
    }, [activePeriod, status]);

    const TABS: Period[] = ["Today", "Weekly", "Monthly"];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3.5">
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

            {/* Period Tabs - Only show if enableTabs is true */}
            {enableTabs && (
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
