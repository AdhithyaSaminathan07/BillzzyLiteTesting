import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2, AlertCircle, Calendar as CalendarIcon, X, ChevronDown } from 'lucide-react';
import { motion, LayoutGroup } from "framer-motion";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface ProfitSectionProps {
  showHeader?: boolean;
}

export default function ProfitSection({ showHeader = true }: ProfitSectionProps) {
  const [activeTab, setActiveTab] = useState('daily');
  const [profitData, setProfitData] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Custom Date State
  const [dateRange, setDateRange] = useState<Value>(null);
  const [tempDateRange, setTempDateRange] = useState<Value>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchProfit = async () => {
      setLoading(true);
      setError('');
      try {
        let url = '';
        if (activeTab === 'custom') {
          if (!dateRange || !Array.isArray(dateRange) || !dateRange[0] || !dateRange[1]) {
            setLoading(false);
            return; // Don't fetch if dates are missing
          }
          const start = dateRange[0].toISOString().split('T')[0];
          const end = dateRange[1].toISOString().split('T')[0];
          url = `/api/sales?startDate=${start}&endDate=${end}`;
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
  }, [activeTab, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-3.5">
      {/* Header Section - Optional */}
      {showHeader && (
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Profit</h3>
              <p className="text-xs text-gray-500">
                {activeTab === 'daily' ? 'Today' : activeTab === 'weekly' ? 'This Week' : activeTab === 'monthly' ? 'This Month' : 'Custom Period'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="mb-4">
        <div className="flex gap-1 mb-2.5 bg-gray-100 p-0.5 rounded-lg">
          <LayoutGroup>
            {['daily', 'weekly', 'monthly', 'custom'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'custom') {
                    setTempDateRange(dateRange);
                    setShowCalendar(!showCalendar);
                  } else {
                    setShowCalendar(false);
                  }
                }}
                className={`
                    relative flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors z-10
                    ${activeTab === tab ? 'text-white' : 'text-gray-600 hover:text-gray-800'}
                  `}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab-profit"
                    className="absolute inset-0 bg-emerald-500 rounded-md -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                {tab === 'daily' ? 'Day' : tab === 'weekly' ? 'Week' : tab === 'monthly' ? 'Month' : 'Custom'}
              </button>
            ))}
          </LayoutGroup>
        </div>

        {/* Custom Date Picker */}
        {activeTab === 'custom' && (
          <div className="relative z-50">
            <button
              onClick={() => {
                setTempDateRange(dateRange);
                setShowCalendar(!showCalendar);
              }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-emerald-500 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <span>
                  {Array.isArray(dateRange) && dateRange[0] && dateRange[1]
                    ? `${formatDate(dateRange[0])} - ${formatDate(dateRange[1])}`
                    : 'Select Date Range'}
                </span>
              </div>
              {showCalendar ? <X className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Calendar Popover */}
            {showCalendar && (
              <div className="absolute top-12 left-0 z-[60] bg-white rounded-xl shadow-xl border border-gray-100 p-0 w-full sm:w-[280px] animate-in fade-in zoom-in-95 duration-200">
                <style jsx global>{`
                  .profit-calendar .react-calendar {
                    border: none;
                    font-family: inherit;
                    width: 100%;
                    font-size: 0.75rem;
                    background: transparent;
                  }
                  .profit-calendar .react-calendar__navigation {
                    margin-bottom: 0.5rem;
                  }
                  .profit-calendar .react-calendar__navigation button {
                    min-width: 24px;
                    background: none;
                    font-weight: 600;
                  }
                  .profit-calendar .react-calendar__tile--active {
                    background: #10b981 !important;
                    color: white !important;
                    border-radius: 6px;
                  }
                  .profit-calendar .react-calendar__tile--now {
                    background: #f3f4f6;
                    border-radius: 6px;
                    color: #1f2937;
                  }
                  .profit-calendar .react-calendar__tile--range {
                     background: #ecfdf5;
                     color: #059669;
                     border-radius: 0;
                  }
                  .profit-calendar .react-calendar__tile--rangeStart {
                     background: #10b981 !important;
                     color: white !important;
                     border-top-left-radius: 6px !important;
                     border-bottom-left-radius: 6px !important;
                  }
                  .profit-calendar .react-calendar__tile--rangeEnd {
                     background: #10b981 !important;
                     color: white !important;
                     border-top-right-radius: 6px !important;
                     border-bottom-right-radius: 6px !important;
                  }
                `}</style>
                <div className="p-3 profit-calendar">
                  <Calendar
                    onChange={(value) => setTempDateRange(value)}
                    value={tempDateRange}
                    selectRange={true}
                    prevLabel={<ChevronDown className="w-4 h-4 rotate-90" />}
                    nextLabel={<ChevronDown className="w-4 h-4 -rotate-90" />}
                    className="w-full"
                  />
                </div>
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
                    className="flex-1 py-2 text-xs font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content - Gradient Card */}
      {loading ? (
        <div className="py-6 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mb-1.5 text-emerald-500" />
          <span className="text-xs">Calculating...</span>
        </div>
      ) : error ? (
        <div className="py-6 flex flex-col items-center justify-center text-red-500">
          <AlertCircle className="w-5 h-5 mb-1.5" />
          <span className="text-xs">{error}</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-3 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90 font-medium">Net Earnings</p>
                <p className="text-2xl font-bold mt-0.5">{formatCurrency(profitData || 0)}</p>
              </div>
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-emerald-50 text-[10px]">
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +100%
              </span>
              <span>vs previous period</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
