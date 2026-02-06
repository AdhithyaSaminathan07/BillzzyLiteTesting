'use client';
import React, { useState, useEffect } from 'react';
import CRMComponent from '@/components/CRM';
import ProfitSection from '@/components/Profit';
import SalesSummary from '@/components/SalesSummary';
import { ChevronDown, ChevronUp, BarChart3, TrendingUp, Lock, ArrowRight } from 'lucide-react';

export default function ReportPage() {
  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // --- HYDRATION FIX STATE ---
  // This ensures the component only renders on the client, avoiding extension conflicts
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // --- REPORT UI STATE ---
  const [showCRM, setShowCRM] = useState<boolean>(false);
  const [showProfit, setShowProfit] = useState<boolean>(false);
  const [showSales, setShowSales] = useState<boolean>(false);


  // Fix for Hydration Error: Only render content after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsChecking(true);

    try {
      const res = await fetch('/api/user/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setError(data.message || 'Incorrect PIN');
        setPinInput('');
      }
    } catch {
      setError('Failed to verify PIN. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  // 1. PREVENT HYDRATION MISMATCH
  // If we haven't mounted yet, return null so extensions can't inject attributes into React's VDOM
  if (!isMounted) return null;

  // 2. LOCKED VIEW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8" style={{ color: '#5a4fcf' }} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restricted Access</h2>
          <p className="text-gray-500 mb-8">Please enter the security PIN to view reports.</p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPinInput(e.target.value)}
                placeholder="• • • •"
                className="w-full text-center text-3xl tracking-[1em] py-3 border-b-2 border-gray-200 focus:border-[#5a4fcf] focus:outline-none transition-colors text-gray-800 placeholder-gray-300"
                autoFocus
                disabled={isChecking}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>
            )}

            <button
              type="submit"
              disabled={isChecking}
              className={`w-full py-3 px-4 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-6 ${isChecking ? 'opacity-70 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: '#5a4fcf' }}
            >
              {isChecking ? 'Verifying...' : 'Access Reports'} {!isChecking && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. UNLOCKED VIEW
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Page Heading */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#5a4fcf' }}>
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-gray-500 mt-1">View and analyze your business data</p>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* SALES SECTION */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden lg:col-span-2">
            <button
              onClick={() => setShowSales(!showSales)}
              className="flex items-center justify-between w-full px-6 py-5 text-white transition-all duration-300 group"
              style={{ backgroundColor: '#5a4fcf' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#4a3fbf'}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#5a4fcf'}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-lg block">Sales Overview</span>
                  <span className="text-xs opacity-90">Daily, Weekly, Monthly Analysis</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-90 hidden sm:block">
                  {showSales ? 'Hide' : 'Show'} Details
                </span>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  {showSales ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </button>

            {showSales && (
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <SalesSummary enableTabs={true} />
              </div>
            )}
          </div>

          {/* LEFT SIDE: Profit Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowProfit(!showProfit)}
              className="flex items-center justify-between w-full px-6 py-5 text-white transition-all duration-300 group"
              style={{ backgroundColor: '#5a4fcf' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#4a3fbf'}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#5a4fcf'}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-lg block">Profit</span>
                  <span className="text-xs opacity-90">Track your earnings</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-90 hidden sm:block">
                  {showProfit ? 'Hide' : 'Show'} Details
                </span>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  {showProfit ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </button>

            {showProfit && (
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <ProfitSection />
              </div>
            )}
          </div>

          {/* RIGHT SIDE: CRM Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowCRM(!showCRM)}
              className="flex items-center justify-between w-full px-6 py-5 text-white transition-all duration-300 group"
              style={{ backgroundColor: '#5a4fcf' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#4a3fbf'}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#5a4fcf'}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="font-semibold text-lg block">CRM</span>
                  <span className="text-xs opacity-90">Customer Management</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-90 hidden sm:block">
                  {showCRM ? 'Hide' : 'Show'} Details
                </span>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-all">
                  {showCRM ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </button>

            {showCRM && (
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <CRMComponent />
              </div>
            )}
          </div>

        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Secure Report Area
          </p>
        </div>
      </div>
    </div>
  );
}