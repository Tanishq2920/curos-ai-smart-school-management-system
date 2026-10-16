import React, { useState, useEffect } from 'react';
import { CalendarPlus, Plus, Clock, X } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { LeaveApplication } from '../types';

export const LeavesPage: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = schoolService.getCurrentUser();

  const [startDate, setStartDate] = useState('2025-09-08');
  const [endDate, setEndDate] = useState('2025-09-09');
  const [reason, setReason] = useState('');
  const [studentId, setStudentId] = useState(currentUser.linkedId || 'std-101');

  const loadLeaves = () => {
    schoolService.fetchLeaves().then(setLeaves).catch(console.error);
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    try {
      await schoolService.createLeave({
        startDate,
        endDate,
        reason,
        studentId
      });
      setIsModalOpen(false);
      setReason('');
      loadLeaves();
    } catch (err: any) {
      alert(err.message || 'Error submitting leave');
    }
  };

  const handleDecision = async (id: string, status: string) => {
    try {
      await schoolService.updateLeaveStatus(id, status, `Reviewed by ${currentUser.name}`);
      loadLeaves();
    } catch (err: any) {
      alert(err.message || 'Error updating leave');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <CalendarPlus className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Leave Applications</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Submit medical or formal absence requests, track class teacher approvals, and maintain attendance records.
          </p>
        </div>

        {['STUDENT', 'PARENT'].includes(currentUser.role) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1769FF] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Apply for Leave</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3.5">
        {leaves.length > 0 ? (
          leaves.map((lv) => (
            <div
              key={lv.id}
              className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-gray-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {lv.student_name} ({lv.class})
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      lv.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : lv.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {lv.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mt-2">{lv.reason}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Absence Duration: {lv.start_date} to {lv.end_date}</span>
                </p>
                {lv.decision_notes && (
                  <p className="text-xs text-blue-800 bg-blue-50/70 p-2 rounded-xl border border-blue-100 mt-2">
                    {lv.decision_notes}
                  </p>
                )}
              </div>

              {/* Staff Approval Actions */}
              {['ADMIN', 'TEACHER'].includes(currentUser.role) && lv.status === 'PENDING' && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDecision(lv.id, 'APPROVED')}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    Approve Leave
                  </button>
                  <button
                    onClick={() => handleDecision(lv.id, 'REJECTED')}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-12 text-center text-gray-400 text-xs">
            No leave applications recorded for your scope.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Apply for Student Leave</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason for Absence *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Medical illness, family ceremony, or out-of-town engagement..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1769FF] hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
