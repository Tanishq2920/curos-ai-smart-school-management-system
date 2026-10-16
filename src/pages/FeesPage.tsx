import React, { useState, useEffect } from 'react';
import { CreditCard, Download, ShieldAlert, Plus, X } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { FeeRecord } from '../types';

export const FeesPage: React.FC = () => {
  const currentUser = schoolService.getCurrentUser();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Invoice State (Admin only)
  const [studentId, setStudentId] = useState('std-101');
  const [studentName, setStudentName] = useState('Aarav Patel');
  const [rollNumber, setRollNumber] = useState('10A-01');
  const [feeClass, setFeeClass] = useState('Class 10A');
  const [term, setTerm] = useState('Term 2 (2025-26)');
  const [totalAmount, setTotalAmount] = useState(18500);
  const [dueDate, setDueDate] = useState('2025-11-15');

  const loadFees = async () => {
    setLoading(true);
    try {
      const data = await schoolService.fetchFees();
      setFees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser.role !== 'TEACHER') {
      loadFees();
    } else {
      setLoading(false);
    }
  }, [currentUser.role]);

  // Teachers are strictly forbidden from financial records
  if (currentUser.role === 'TEACHER') {
    return (
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-12 text-center max-w-lg mx-auto my-12 shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Faculty and teaching staff accounts do not have permission to view institutional fee records, student balances, or collection accounts under the principle of least privilege.
          </p>
        </div>
      </div>
    );
  }

  const filtered = fees.filter(f => statusFilter === 'All' || f.status === statusFilter);
  const totalBilled = fees.reduce((acc, f) => acc + (f.totalAmount || 0), 0);
  const totalCollected = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
  const pendingAmount = totalBilled - totalCollected;

  const handleMarkPaid = async (id: string) => {
    try {
      await schoolService.payFee(id);
      loadFees();
    } catch (err: any) {
      alert(err.message || 'Payment failed');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('smart_school_token_v1') || ''}`
        },
        body: JSON.stringify({
          studentId,
          studentName,
          rollNumber,
          class: feeClass,
          term,
          totalAmount: Number(totalAmount),
          paidAmount: 0,
          status: 'Pending',
          dueDate
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to issue invoice');
      }
      setIsInvoiceModalOpen(false);
      loadFees();
    } catch (err: any) {
      alert(err.message || 'Error creating invoice');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {currentUser.role === 'ADMIN' ? 'Fee Collection & Accounts Management' : 'Tuition & Fee Statements'}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {currentUser.role === 'ADMIN'
              ? 'Monitor institutional tuition collections, reconcile dues, and manage student fee schedules.'
              : 'Official tuition invoices, payment receipts, and balance statements.'}
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1769FF] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Issue Fee Invoice</span>
          </button>
        )}
      </div>

      {/* Summary metric cards for Admin */}
      {currentUser.role === 'ADMIN' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-medium text-gray-500">Total Billed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalBilled.toLocaleString()}</p>
            <span className="text-[11px] text-gray-400 mt-1 block">Term enrollment billing</span>
          </div>
          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-medium text-gray-500">Total Collected</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalCollected.toLocaleString()}</p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
              {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}% realization rate
            </span>
          </div>
          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
            <p className="text-xs font-medium text-gray-500">Outstanding Receivables</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">₹{pendingAmount.toLocaleString()}</p>
            <span className="text-[11px] text-rose-500 font-semibold mt-1 block">Pending dues</span>
          </div>
        </div>
      )}

      {/* Filter and Table */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="font-bold text-gray-900 text-sm">
            {currentUser.role === 'ADMIN' ? 'Enrolled Student Fee Invoices' : 'Your Invoices'}
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs outline-none"
            >
              <option value="All">All Invoices</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-[#E8EDF4] text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Roll No & Class</th>
                <th className="py-3 px-4">Academic Term</th>
                <th className="py-3 px-4">Total Billed</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF4]">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{item.studentName}</td>
                    <td className="py-3.5 px-4 text-gray-600 font-mono">{item.rollNumber} • {item.class}</td>
                    <td className="py-3.5 px-4 text-gray-600">{item.term}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">₹{item.totalAmount?.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">₹{item.paidAmount?.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-gray-500">{item.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          item.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.status === 'Partial'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.status !== 'Paid' ? (
                        <button
                          onClick={() => handleMarkPaid(item.id)}
                          className="px-3 py-1 bg-[#1769FF] text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                        >
                          {currentUser.role === 'ADMIN' ? 'Reconcile Payment' : 'Pay Online'}
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Receipt downloaded for ${item.studentName}`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer inline-flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    No fee records found for your account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Issue Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreateInvoice}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Issue Fee Invoice</h3>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Student ID *</label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Class</label>
                  <input
                    type="text"
                    required
                    value={feeClass}
                    onChange={(e) => setFeeClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1769FF] hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Issue Invoice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
