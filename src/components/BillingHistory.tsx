'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar, Filter, X, Receipt, Wallet, CreditCard,
  Smartphone, Pencil, Send, Loader2, Package, ChevronDown, ChevronUp
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
  amount: number;
  paymentMethod: string;
  customerPhone: string;
  customerName?: string;
  discount?: number;
  items: BillItem[];
  isEdited?: boolean;
}

export default function BillingHistory() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [newPhone, setNewPhone] = useState('');
  const [isResending, setIsResending] = useState(false);

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    const today = getToday();
    setFromDate(today);
    setToDate(today);
    fetchHistory('', '');
  }, []);

  const fetchHistory = async (from: string, to: string) => {
    try {
      const url = from && to
        ? `/api/billing-history?from=${from}&to=${to}`
        : '/api/billing-history';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch billing history');
      const data = await res.json();
      setBills(data);
    } catch (error) {
      console.error('Error fetching billing history:', error);
      setBills([]);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory(fromDate, toDate);
    setShowFilters(false);
  };

  const handleClear = () => {
    const today = getToday();
    setFromDate(today);
    setToDate(today);
    fetchHistory('', '');
    setShowFilters(false);
  };

  const handleResend = async () => {
    if (!editingBill || !newPhone) return;
    setIsResending(true);
    try {
      const res = await fetch(`/api/billing-history/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: editingBill._id || editingBill.id,
          newPhone: newPhone,
        }),
      });

      if (res.ok) {
        alert('Bill resent successfully!');
        setEditingBill(null);
        fetchHistory(fromDate, toDate);
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to resend');
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Error resending bill');
    } finally {
      setIsResending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const getPaymentIcon = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower === 'cash') return <Wallet className="w-3.5 h-3.5" />;
    if (methodLower === 'qr' || methodLower === 'upi') return <Smartphone className="w-3.5 h-3.5" />;
    return <CreditCard className="w-3.5 h-3.5" />;
  };

  const getPaymentColor = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower === 'cash') return 'bg-green-100 text-green-700 border-green-200';
    if (methodLower === 'qr' || methodLower === 'upi') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-purple-100 text-purple-700 border-purple-200';
  };

  const toggleBill = (id: string) => {
    setExpandedBillId(prevId => prevId === id ? null : id);
  };

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="h-full bg-gray-50 overflow-y-auto pb-24">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">Billing History</h1>
                <p className="text-xs text-gray-500">{bills.length} transactions</p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center hover:bg-indigo-100 transition-colors"
            >
              {showFilters ? <X className="w-5 h-5 text-indigo-600" /> : <Filter className="w-5 h-5 text-indigo-600" />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="px-4 pb-3 border-t border-gray-100 bg-gray-50">
            <form onSubmit={handleFilter} className="space-y-2.5 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">Apply Filter</button>
                <button type="button" onClick={handleClear} className="flex-1 bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg">Clear</button>
              </div>
            </form>
          </div>
        )}

        {bills.length > 0 && (
          <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Total Revenue</span>
              <span className="text-lg font-bold text-indigo-700">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bills List */}
      <div className="p-2">
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <Receipt className="w-10 h-10 text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-600">No records found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bills.map((bill, index) => {
              const currentId = bill._id || bill.id || "";
              const isOpen = expandedBillId === currentId;

              return (
                <div key={currentId || index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-3">
                    <div
                      className="flex items-start justify-between cursor-pointer active:opacity-70"
                      onClick={() => toggleBill(currentId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
                          <Receipt className="w-4.5 h-4.5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">
                            Bill #{bills.length - index}
                            {bill.isEdited && (
                              <span className="ml-2 inline-flex items-center rounded-md bg-yellow-50 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                Edited
                              </span>
                            )}
                          </p>
                          <div className="flex flex-col">
                            {bill.customerName && <p className="text-[11px] font-semibold text-gray-700">{bill.customerName}</p>}
                            <p className="text-[11px] font-medium text-indigo-600">{bill.customerPhone || 'No Phone'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mt-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{formatDate(bill.createdAt)} • {formatTime(bill.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-gray-900">₹{bill.amount.toLocaleString()}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBill(bill);
                            setNewPhone(bill.customerPhone || '');
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 mt-1 ml-auto bg-indigo-50 px-2 py-0.5 rounded-md hover:bg-indigo-100"
                        >
                          <Pencil className="w-2.5 h-2.5" /> EDIT PHONE
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <button
                        onClick={() => toggleBill(currentId)}
                        className="w-full flex items-center justify-between p-2 text-xs font-semibold text-gray-600"
                      >
                        <span className="flex items-center gap-1.5"><Package className="w-3 h-3" /> Items ({bill.items?.length || 0})</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isOpen && (
                        <div className="px-2 pb-2 space-y-1 border-t border-gray-100 pt-1">
                          {bill.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] py-1 border-b border-gray-100 last:border-0">
                              <span className="text-gray-700 font-medium">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                              <span className="text-gray-900 font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}

                          {typeof bill.discount === 'number' && bill.discount > 0 && (
                            <div className="flex justify-between text-[11px] py-1 text-green-600 font-semibold">
                              <span>Discount</span>
                              <span>- ₹{bill.discount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400">Payment</span>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${getPaymentColor(bill.paymentMethod)}`}>
                        {getPaymentIcon(bill.paymentMethod)}
                        <span className="text-[9px] font-bold uppercase">{bill.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- NEW POPUP DESIGN START --- */}
      {editingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Area */}
            <div className="relative p-6 text-center border-b border-gray-50">
              <button 
                onClick={() => setEditingBill(null)} 
                className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
              
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-indigo-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900">Update Phone</h3>
              <p className="text-sm text-gray-500 mt-1">Update details for Bill #{bills.length - bills.indexOf(editingBill)}</p>
            </div>
            
            {/* Input Area */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider ml-1">
                  New Customer Number
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Enter 10 digit number"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3.5 text-lg font-bold focus:border-indigo-600 focus:bg-white focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <p className="text-[11px] text-amber-800 font-medium leading-tight">
                  This will update our records and resend the digital bill for <span className="font-bold">₹{editingBill.amount.toLocaleString()}</span>.
                </p>
              </div>
            </div>

            {/* Actions Area */}
            <div className="p-6 bg-gray-50/50 flex flex-col gap-2">
              <button
                onClick={handleResend}
                disabled={isResending || !newPhone || newPhone.length < 10}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {isResending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> SEND DIGITAL BILL
                  </>
                )}
              </button>
              
              <button
                onClick={() => setEditingBill(null)}
                className="w-full py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- NEW POPUP DESIGN END --- */}
    </div>
  );
}