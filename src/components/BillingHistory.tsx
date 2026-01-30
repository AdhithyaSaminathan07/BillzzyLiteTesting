'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar, Filter, X, Receipt, Wallet, CreditCard,
  Smartphone, Pencil, Send, Loader2, Package, ChevronDown, ChevronUp,
  TrendingUp, CalendarDays, CalendarRange, Tag
} from 'lucide-react';

interface BillItem {
  name: string;
  quantity: number;
  price: number;
}

interface Bill {
  _id: string;
  id?: string;
  createdAt: string;
  amount: number; // This is the final amount after discount
  paymentMethod: string;
  customerPhone: string;
  customerName?: string;
  discount?: number; // Discount amount
  items: BillItem[];
  isEdited?: boolean;
}

type TimeFilter = 'today' | 'weekly' | 'monthly' | 'custom';

export default function BillingHistory() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState<TimeFilter>('today');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [newPhone, setNewPhone] = useState('');
  const [isResending, setIsResending] = useState(false);

  const getToday = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const today = getToday();
    setFromDate(today);
    setToDate(today);
    fetchHistory(today, today, 'today');
  }, []);

  const fetchHistory = async (from: string, to: string, tab: TimeFilter = 'custom') => {
    try {
      const url = from && to ? `/api/billing-history?from=${from}&to=${to}` : '/api/billing-history';
      const res = await fetch(url);
      const data = await res.json();
      setBills(data);
      setActiveTab(tab);
    } catch (error) {
      setBills([]);
    }
  };

  const handleQuickFilter = (type: TimeFilter) => {
    const today = new Date();
    let start = new Date();
    if (type === 'today') {
      const dateStr = getToday();
      fetchHistory(dateStr, dateStr, 'today');
    } else if (type === 'weekly') {
      start.setDate(today.getDate() - 7);
      fetchHistory(start.toISOString().split('T')[0], getToday(), 'weekly');
    } else if (type === 'monthly') {
      start.setMonth(today.getMonth() - 1);
      fetchHistory(start.toISOString().split('T')[0], getToday(), 'monthly');
    }
  };

  const handleUpdateAndResend = async () => {
    if (!editingBill) return;
    setIsResending(true);
    try {
      const res = await fetch(`/api/billing-history/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId: editingBill._id || editingBill.id, newPhone }),
      });
      if (res.ok) {
        setEditingBill(null);
        handleQuickFilter(activeTab);
      }
    } finally {
      setIsResending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getPaymentColor = (method: string) => {
    const m = method.toLowerCase();
    if (m === 'cash') return 'text-green-600 bg-green-50 border-green-100';
    if (m === 'qr' || m === 'upi') return 'text-blue-600 bg-blue-50 border-blue-100';
    return 'text-purple-600 bg-purple-50 border-purple-100';
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h1 className="text-base font-black text-gray-900">History</h1>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg">
            {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Filter Boxes */}
        <div className="px-3 pb-2 grid grid-cols-3 gap-2">
          {['today', 'weekly', 'monthly'].map((id) => (
            <button
              key={id}
              onClick={() => handleQuickFilter(id as TimeFilter)}
              className={`py-2 rounded-xl border text-center transition-all ${
                activeTab === id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-100 text-gray-500'
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-tighter">{id}</p>
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="px-3 pb-3 bg-gray-50 border-t border-gray-100 py-2">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border rounded-lg px-2 py-1.5 text-xs outline-none w-full" />
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border rounded-lg px-2 py-1.5 text-xs outline-none w-full" />
            </div>
            <button onClick={() => fetchHistory(fromDate, toDate, 'custom')} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-xs">Apply Range</button>
          </div>
        )}

        <div className="px-3 py-1 bg-indigo-50/30 flex justify-between items-center text-[10px] font-bold">
           <span className="text-gray-400 uppercase">{bills.length} BILLS</span>
           <span className="text-indigo-700">TOTAL: ₹{bills.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Bill List */}
      <div className="p-2 space-y-1.5">
        {bills.map((bill, index) => {
          const isOpen = expandedBillId === (bill._id || bill.id);
          // Calculate subtotal before discount
          const subtotal = bill.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          return (
            <div key={bill._id || index} className={`rounded-xl border transition-all ${bill.isEdited ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-100'}`}>
              <div className="p-2.5" onClick={() => setExpandedBillId(isOpen ? null : (bill._id || bill.id || ""))}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-2.5 overflow-hidden">
                    <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${bill.isEdited ? 'bg-red-100 text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-gray-900 truncate leading-tight">
                          {bill.customerName || "Guest Customer"}
                        </h3>
                        {bill.isEdited && (
                          <span className="text-[7px] bg-red-500 text-white px-1 rounded-sm font-black uppercase">Edited</span>
                        )}
                      </div>
                      <p className={`text-[11px] font-bold truncate ${bill.isEdited ? 'text-red-600' : 'text-indigo-600'}`}>
                        {bill.customerPhone || 'Walk-in'}
                      </p>
                      <p className="text-[9px] text-gray-400 font-medium">
                        {formatDate(bill.createdAt)} • {formatTime(bill.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <p className="text-base font-black text-gray-900 leading-none">₹{bill.amount.toLocaleString()}</p>
                    <div className={`mt-1.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border inline-block ${getPaymentColor(bill.paymentMethod)}`}>
                      {bill.paymentMethod}
                    </div>
                    
                    <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingBill(bill); 
                          setNewPhone(bill.customerPhone || ''); 
                        }}
                        className={`mt-2 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black transition-all active:scale-95 border ${
                          bill.isEdited 
                          ? 'bg-red-100 text-red-600 border-red-200' 
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100'
                        }`}
                    >
                        <Pencil className="w-2.5 h-2.5" />
                        EDIT
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-2 pt-2 border-t border-gray-200/60 animate-in fade-in duration-200">
                    <div className="space-y-1 mb-2">
                      {bill.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-bold text-gray-500">
                          <span className="truncate pr-4">{item.name} × {item.quantity}</span>
                          <span className="text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* TOTALS SECTION */}
                    <div className="border-t border-dashed border-gray-200 pt-2 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-gray-400">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        {bill.discount && bill.discount > 0 ? (
                            <div className="flex justify-between text-[10px] font-bold text-red-500">
                                <span className="flex items-center gap-1"><Tag className="w-2.5 h-2.5" /> Discount</span>
                                <span>- ₹{bill.discount.toLocaleString()}</span>
                            </div>
                        ) : null}
                        <div className="flex justify-between text-[11px] font-black text-indigo-600 pt-0.5">
                            <span>Total Amount</span>
                            <span>₹{bill.amount.toLocaleString()}</span>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CENTERED Popup */}
      {editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl p-5 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900">Update Number</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">For: {editingBill.customerName || 'Guest Customer'}</p>
              </div>
              <button onClick={() => setEditingBill(null)} className="p-1.5 bg-gray-100 rounded-full"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-indigo-500 uppercase ml-1 flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> New Phone Number
              </label>
              <input 
                type="tel" 
                value={newPhone} 
                onChange={e => setNewPhone(e.target.value)} 
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-lg font-black outline-none focus:border-indigo-600 focus:bg-white transition-all" 
                placeholder="00000 00000"
                maxLength={10}
                autoFocus
              />
            </div>

            <button 
              onClick={handleUpdateAndResend} 
              disabled={isResending || newPhone.length < 10} 
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black text-sm mt-6 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
            >
              {isResending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> UPDATE & RESEND BILL</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}