// src/components/Dashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Package, AlertTriangle, XCircle, Loader2, TrendingUp, Wallet, CreditCard } from "lucide-react";
// 1. IMPORT THE CHART DYNAMICALLY (Fixes 500 Error / SSR issues)
import dynamic from 'next/dynamic';
const StockStyleSalesChart = dynamic(() => import("./StockStyleSalesChart"), { ssr: false });

// --- TYPE DEFINITIONS ---
type SalesData = {
  total: number;
  cash: number;
  qr: number;
  bills: number;
  lastUpdated: string;
};

interface Product {
  id: string;
  name: string;
  quantity: number;
  lowStockThreshold?: number;
}

type InventorySummary = {
  inStock: number;
  lowStock: number;
  outOfStock: number;
};

type Period = "Today" | "Weekly" | "Monthly";

// --- CONSTANTS ---
const LOW_STOCK_THRESHOLD = 10;

// --- COMPONENT ---
export default function Dashboard() {
  const { status } = useSession();

  // State for Sales Data
  const [salesData, setSalesData] = useState<SalesData>({
    total: 0, cash: 0, qr: 0, bills: 0, lastUpdated: "",
  });
  const [activePeriod, setActivePeriod] = useState<Period>("Today");
  const [isSalesLoading, setIsSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState<string | null>(null);

  // State for Inventory Summary
  const [inventorySummary, setInventorySummary] = useState<InventorySummary>({
    inStock: 0, lowStock: 0, outOfStock: 0,
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

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

  useEffect(() => {
    if (status !== 'authenticated') {
      setIsSummaryLoading(false);
      return;
    }

    const fetchInventorySummary = async () => {
      setIsSummaryLoading(true);
      setSummaryError(null);
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch product data');

        const products: Product[] = await res.json();
        const summary: InventorySummary = products.reduce((acc, product) => {
          const threshold = product.lowStockThreshold ?? LOW_STOCK_THRESHOLD;
          if (product.quantity === 0) {
            acc.outOfStock++;
          } else if (product.quantity <= threshold) {
            acc.lowStock++;
          } else {
            acc.inStock++;
          }
          return acc;
        }, { inStock: 0, lowStock: 0, outOfStock: 0 });
        setInventorySummary(summary);
      } catch (err) {
        console.error("Failed to load inventory summary:", err);
        setSummaryError("Could not load data.");
      } finally {
        setIsSummaryLoading(false);
      }
    };

    fetchInventorySummary();
  }, [status]);

  const TABS: Period[] = ["Today", "Weekly", "Monthly"];

  return (
    <div className="h-full bg-gray-50 overflow-y-auto p-2.5 pb-20">
      <div className="max-w-2xl mx-auto space-y-4"> {/* Increased spacing slightly */}

        {/* Sales Card */}
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

          {/* Period Tabs */}
          <div className="flex gap-1 mb-2.5 bg-gray-100 p-0.5 rounded-lg">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePeriod(tab)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${activePeriod === tab
                  ? "bg-[#5a4fcf] text-white"
                  : "text-gray-600"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

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
          )}
        </div>

        {/* 2. INSERT THE GRAPH HERE */}
         <StockStyleSalesChart /> 

        {/* Inventory Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3.5">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-8 h-8 bg-[#5a4fcf] rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Inventory</h3>
              <p className="text-xs text-gray-500">Stock levels</p>
            </div>
          </div>

          {isSummaryLoading ? (
            <div className="py-6 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mb-1.5 text-[#5a4fcf]" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : summaryError ? (
            <div className="py-6 flex flex-col items-center justify-center text-red-500">
              <AlertTriangle className="w-5 h-5 mb-1.5" />
              <span className="text-xs">{summaryError}</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* In Stock */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-2.5 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-700">In Stock</p>
                      <p className="text-xl font-bold text-green-800">{inventorySummary.inStock}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2.5 rounded-lg border-2 border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-orange-700">Low Stock</p>
                      <p className="text-xl font-bold text-orange-800">{inventorySummary.lowStock}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Out of Stock */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-2.5 rounded-lg border-2 border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-red-500 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-700">Out of Stock</p>
                      <p className="text-xl font-bold text-red-800">{inventorySummary.outOfStock}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}