'use client';

import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Customer {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  createdAt: string;
}

export default function CRM() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: ''
  });

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

    if (dateFilter.startDate || dateFilter.endDate) {
      result = result.filter((customer) => {
        const customerDate = new Date(customer.createdAt);

        if (dateFilter.startDate && dateFilter.endDate) {
          const startDate = new Date(dateFilter.startDate);
          const endDate = new Date(dateFilter.endDate);
          endDate.setHours(23, 59, 59, 999);
          return customerDate >= startDate && customerDate <= endDate;
        } else if (dateFilter.startDate) {
          return customerDate >= new Date(dateFilter.startDate);
        } else if (dateFilter.endDate) {
          const endDate = new Date(dateFilter.endDate);
          endDate.setHours(23, 59, 59, 999);
          return customerDate <= endDate;
        }
        return true;
      });
    }

    setFilteredCustomers(result);
  }, [searchTerm, dateFilter, customers]);

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

      const updated = customers.filter((c) => c._id !== id);
      setCustomers(updated);

      let result = [...updated];

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            c.phoneNumber.includes(term)
        );
      }

      setFilteredCustomers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Customer List', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Phone Number', 'Added Date']],
      body: filteredCustomers.map((c) => [
        c.name,
        c.phoneNumber,
        formatDate(c.createdAt)
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save('customer-list.pdf');
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFilter({ startDate: '', endDate: '' });
  };

  return (
    <div className="container mx-auto py-3 px-2">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 text-xs mt-1">Manage your customers efficiently</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-3">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Customer List</h2>

          <button
            onClick={handleExportPDF}
            disabled={loading || filteredCustomers.length === 0}
            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
          >
            Export PDF
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
          {/* Search */}
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Search name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 rounded-lg border-2 border-gray-300 p-1.5 text-xs"
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              >
                ✕
              </button>
            )}
          </div>

          {/* Date Filters */}
          <div className="flex gap-2 items-center text-xs">
            <span>Date:</span>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, startDate: e.target.value })
              }
              className="border rounded p-1 text-xs"
            />
            <span>to</span>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, endDate: e.target.value })
              }
              className="border rounded p-1 text-xs"
            />
          </div>

          {(searchTerm || dateFilter.startDate || dateFilter.endDate) && (
            <div className="flex justify-end mt-2">
              <button
                onClick={handleResetFilters}
                className="text-xs text-indigo-600"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-6 text-sm">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600 text-sm py-4">{error}</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            No customers found
          </div>
        ) : (
          <>
            {/* Mobile view */}
            <div className="sm:hidden space-y-2">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer._id}
                  className="border rounded-lg p-2 bg-white"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium">{customer.name}</div>
                      <div className="text-xs text-gray-500">
                        {customer.phoneNumber}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {formatDate(customer.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCustomer(customer._id)}
                      className="text-red-600 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">
                      Name
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">
                      Phone
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">
                      Added
                    </th>
                    <th className="px-2 py-2 text-left font-medium text-gray-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id}>
                      <td className="px-2 py-2">{customer.name}</td>
                      <td className="px-2 py-2">{customer.phoneNumber}</td>
                      <td className="px-2 py-2">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          onClick={() => handleDeleteCustomer(customer._id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
