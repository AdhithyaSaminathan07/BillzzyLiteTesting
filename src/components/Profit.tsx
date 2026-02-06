'use client';
import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react';

export default function ProfitSection() {
  const [activeTab, setActiveTab] = useState('daily');
  const [profitData, setProfitData] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Custom Date State
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    const fetchProfit = async () => {
      setLoading(true);
      setError('');
      try {
        let url = '';
        if (activeTab === 'custom') {
          if (!customStart || !customEnd) {
            setLoading(false);
            return; // Don't fetch if dates are missing
          }
          url = `/api/sales?startDate=${customStart}&endDate=${customEnd}`;
        } else {
          const periodParam = activeTab === 'daily' ? 'today' : activeTab;
          url = `/api/sales?period=${periodParam}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        setProfitData(data.profit || 0);
      } catch (err) {
        setError('Failed to load profit data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfit();
  }, [activeTab, customStart, customEnd]); // Re-run when dates change

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      {/* Clean Modern Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header Section */}
        <div className="px-4 py-3 flex items-center justify-between bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#5a4fcf]/10 flex items-center justify-center text-[#5a4fcf]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold text-gray-800">Profit</span>
          </div>

          {/* Compact Tab Switcher */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {['daily', 'weekly', 'monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-2 py-0.5 rounded text-[10px] font-medium transition-all
                  ${activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                {tab === 'daily' ? 'Day' : tab === 'weekly' ? 'Week' : 'Month'}
              </button>
            ))}
            <button
              onClick={() => setActiveTab('custom')}
              className={`
                  px-2 py-0.5 rounded text-[10px] font-medium transition-all
                  ${activeTab === 'custom'
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-700'}
                `}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Custom Date Inputs (Conditional) */}
        {activeTab === 'custom' && (
          <div className="px-4 py-2 bg-gray-50/30 border-b border-gray-100 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full text-[10px] bg-white border border-gray-200 rounded px-2 py-1 text-gray-600 focus:border-[#5a4fcf] focus:ring-1 focus:ring-[#5a4fcf] outline-none"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full text-[10px] bg-white border border-gray-200 rounded px-2 py-1 text-gray-600 focus:border-[#5a4fcf] focus:ring-1 focus:ring-[#5a4fcf] outline-none"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="p-5 flex flex-col items-center justify-center min-h-[100px]">
          {loading ? (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-[#5a4fcf]" />
              <span className="text-[10px]">Calculating...</span>
            </div>
          ) : error ? (
            <div className="text-center">
              <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-xs text-red-500">{error}</p>
            </div>
          ) : (
            <div className="text-center relative z-10">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                Net Earnings
              </p>
              <h1 className="text-3xl font-bold text-gray-900 leading-none tracking-tight">
                {formatCurrency(profitData || 0)}
              </h1>
              <div className="mt-1.5 flex items-center justify-center gap-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +100%
                </span>
                <span className="text-[10px] text-gray-400">
                  vs yesterday
                </span>
              </div>
            </div>
          )}

          {/* Decorative background blob */}
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-t from-gray-50 to-transparent rounded-full -mr-8 -mb-8 pointer-events-none opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
