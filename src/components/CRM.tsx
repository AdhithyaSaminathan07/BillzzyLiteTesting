'use client';

import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx'; // Import xlsx for Excel export
import { Calendar as CalendarIcon, X, ChevronDown } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Customer {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  createdAt: string;
}

export default function CRMComponent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Date Filter State
  const [dateRange, setDateRange] = useState<Value>(null);
  const [tempDateRange, setTempDateRange] = useState<Value>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/customers');
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    let result = [...customers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (customer) =>
          customer.name.toLowerCase().includes(term) ||
          customer.phoneNumber.includes(term)
      );
    }

    if (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      // Normalize start date to beginning of day
      startDate.setHours(0, 0, 0, 0);
      // Normalize end date to end of day
      endDate.setHours(23, 59, 59, 999);

      result = result.filter((customer) => {
        const customerDate = new Date(customer.createdAt);
        return customerDate >= startDate && customerDate <= endDate;
      });
    }

    setFilteredCustomers(result);
  }, [searchTerm, dateRange, customers]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/customers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error('Failed to delete customer');

      // Update local state
      const updated = customers.filter((c) => c._id !== id);
      setCustomers(updated);
      // Note: The useEffect above will automatically update filteredCustomers
      // when 'customers' state changes.

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  };

  // --- NEW: EXCEL EXPORT FUNCTION ---
  const handleExportExcel = () => {
    // Prepare data for Excel
    const dataToExport = filteredCustomers.map(customer => ({
      'Customer Name': customer.name,
      'Phone Number': customer.phoneNumber,
      'Email': customer.email || 'N/A',
      'Date Added': formatDate(customer.createdAt)
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

    // Download the file
    XLSX.writeFile(workbook, `customer-list-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Customer List', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    let filterText = '';
    if (searchTerm) filterText += `Search: ${searchTerm}`;
    if (Array.isArray(dateRange) && dateRange[0] && dateRange[1]) {
      if (filterText) filterText += ' | ';
      filterText += `Date Range: ${dateRange[0].toLocaleDateString()} to ${dateRange[1].toLocaleDateString()}`;
    }

    if (filterText) {
      doc.setFontSize(10);
      doc.text(`Filters: ${filterText}`, 14, 35);
    }

    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Phone Number', 'Added Date']],
      body: filteredCustomers.map((c) => [
        c.name,
        c.phoneNumber,
        formatDate(c.createdAt)
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save('customer-list.pdf');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateRange(null);
    setShowCalendar(false);
  };

  return (
    <div className="w-full">
      {/* Header & Export Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer List</h2>
          <p className="text-sm text-gray-500">Manage your client database</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Excel Button */}
          <button
            onClick={handleExportExcel}
            disabled={loading || filteredCustomers.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </button>

          {/* PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={loading || filteredCustomers.length === 0}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 rounded-lg border-2 border-gray-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative">
              <button
                onClick={() => {
                  setTempDateRange(dateRange);
                  setShowCalendar(!showCalendar);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-indigo-500 transition-colors w-full sm:w-auto min-w-[200px] justify-between"
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
                <div className="absolute top-12 left-0 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 p-0 w-[280px] animate-in fade-in zoom-in-95 duration-200">
                  <style jsx global>{`
                    .crm-calendar .react-calendar {
                      border: none;
                      font-family: inherit;
                      width: 100%;
                      font-size: 0.75rem;
                      background: transparent;
                    }
                    .crm-calendar .react-calendar__navigation {
                      margin-bottom: 0.5rem;
                    }
                    .crm-calendar .react-calendar__navigation button {
                      min-width: 24px;
                      background: none;
                      font-weight: 600;
                    }
                    .crm-calendar .react-calendar__month-view__weekdays {
                      font-weight: 500;
                      font-size: 0.65rem;
                      text-transform: uppercase;
                      color: #9ca3af;
                    }
                    .crm-calendar .react-calendar__tile {
                      padding: 8px 4px;
                    }
                    .crm-calendar .react-calendar__tile--active {
                      background: #4f46e5 !important;
                      color: white !important;
                      border-radius: 6px;
                    }
                    .crm-calendar .react-calendar__tile--now {
                      background: #f3f4f6;
                      border-radius: 6px;
                      color: #1f2937;
                    }
                    .crm-calendar .react-calendar__tile--range {
                       background: #eef2ff;
                       color: #4f46e5;
                       border-radius: 0;
                    }
                    .crm-calendar .react-calendar__tile--rangeStart {
                       background: #4f46e5 !important;
                       color: white !important;
                       border-top-left-radius: 6px !important;
                       border-bottom-left-radius: 6px !important;
                    }
                    .crm-calendar .react-calendar__tile--rangeEnd {
                       background: #4f46e5 !important;
                       color: white !important;
                       border-top-right-radius: 6px !important;
                       border-bottom-right-radius: 6px !important;
                    }
                  `}</style>

                  <div className="p-3 crm-calendar">
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
                      className="flex-1 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {(searchTerm || (Array.isArray(dateRange) && dateRange[0])) && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-end md:self-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {
        loading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-sm">Loading customers...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 text-sm">Error: {error}</p>
            <button onClick={() => window.location.reload()} className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">Retry</button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p className="text-gray-500 text-sm">{searchTerm ? 'No customers found matching your search.' : 'No customers found.'}</p>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="sm:hidden space-y-3">
              {filteredCustomers.map((customer) => (
                <div key={customer._id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex items-center gap-3">
                  <div className="shrink-0 h-10 w-10">
                    <div className="bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center border border-gray-200">
                      <span className="text-gray-600 font-bold text-sm">{customer.name.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{customer.name}</div>
                    <div className="text-xs text-gray-500 truncate">{customer.phoneNumber}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{formatDate(customer.createdAt)}</span>
                    <button
                      onClick={() => handleDeleteCustomer(customer._id)}
                      disabled={deletingId === customer._id}
                      className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md transition-colors"
                    >
                      {deletingId === customer._id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center">
                              <span className="text-gray-600 font-bold text-xs">{customer.name.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="ml-3 text-sm font-medium text-gray-900">{customer.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phoneNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(customer.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteCustomer(customer._id)}
                          disabled={deletingId === customer._id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {deletingId === customer._id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      }
    </div >
  );
}