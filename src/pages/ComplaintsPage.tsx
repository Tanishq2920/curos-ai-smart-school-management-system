import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, CheckCircle2, X } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { Complaint } from '../types';

export const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = schoolService.getCurrentUser();

  // New Complaint Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Academic' | 'Facilities' | 'Transport' | 'Other'>('Academic');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [description, setDescription] = useState('');
  const [resolutionNoteInput, setResolutionNoteInput] = useState('');
  const [selectedForResolution, setSelectedForResolution] = useState<Complaint | null>(null);

  const loadComplaints = () => {
    schoolService.fetchComplaints().then(setComplaints).catch(console.error);
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const filtered = complaints.filter(c => statusFilter === 'All' || c.status === statusFilter || (statusFilter === 'Resolved' && c.status === 'RESOLVED') || (statusFilter === 'Open' && c.status === 'OPEN'));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    try {
      await schoolService.addComplaint({
        title,
        category,
        priority,
        description
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      loadComplaints();
    } catch (err: any) {
      alert(err.message || 'Error submitting complaint');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, notes?: string) => {
    try {
      await schoolService.updateComplaintStatus(id, newStatus, notes);
      loadComplaints();
      setSelectedForResolution(null);
      setResolutionNoteInput('');
    } catch (err: any) {
      alert(err.message || 'Error updating grievance');
    }
  };

  const canResolve = ['ADMIN', 'TEACHER'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-50 text-rose-500 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Grievance & Complaints Desk</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {currentUser.role === 'ADMIN'
              ? 'Institutional oversight of all academic, transport, and facility grievances with auditable resolution workflows.'
              : currentUser.role === 'TEACHER'
              ? 'Complaints and academic concerns assigned to your department or filed by your classes.'
              : 'Submit and track progress on personal inquiries, feedback, and academic grievances.'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1769FF] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Lodge Grievance</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['All', 'Open', 'Resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              statusFilter === st
                ? 'bg-[#1769FF] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-slate-50'
            }`}
          >
            {st} ({complaints.filter(c => st === 'All' || c.status === st || (st === 'Resolved' && c.status === 'RESOLVED') || (st === 'Open' && c.status === 'OPEN')).length})
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="space-y-3.5">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-gray-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.ticketNumber || (item as any).ticket_number}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400">
                    {item.category} • {item.date}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      item.status === 'Resolved' || item.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'In Progress' || item.status === 'IN_PROGRESS'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.priority && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      {item.priority} Priority
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 text-base mt-2">{item.title}</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</p>

                {(item.resolutionNotes || (item as any).resolution_notes) && (
                  <div className="mt-2.5 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Resolution Note: </span>
                      {item.resolutionNotes || (item as any).resolution_notes}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-gray-400 mt-2">
                  Submitted by: <span className="font-medium text-gray-700">{item.submittedBy || (item as any).submitted_by}</span> ({item.role})
                  {item.assignedTo && <span> • Assigned to: <strong className="text-gray-700">{item.assignedTo}</strong></span>}
                </p>
              </div>

              {/* Status Change Controls for Staff */}
              {canResolve && item.status !== 'Resolved' && item.status !== 'RESOLVED' && (
                <div className="flex md:flex-col items-center md:items-end gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400">Resolution:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedForResolution(item)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                    >
                      Resolve Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-12 text-center text-gray-400 text-xs">
            No complaints found under your authorization scope.
          </div>
        )}
      </div>

      {/* Resolution Notes Modal */}
      {selectedForResolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">
                Resolve Complaint {selectedForResolution.ticketNumber || (selectedForResolution as any).ticket_number}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedForResolution(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <p className="text-gray-600">
                Please enter the operational steps taken to inspect and resolve this grievance:
              </p>
              <textarea
                rows={4}
                required
                placeholder="e.g. Technician inspected laboratory unit and replaced faulty bulb on 15 Oct."
                value={resolutionNoteInput}
                onChange={(e) => setResolutionNoteInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedForResolution(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(selectedForResolution.id, 'RESOLVED', resolutionNoteInput || 'Issue reviewed and resolved.')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lodge Grievance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Lodge New Grievance</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Issue Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Lab microscope light flickering"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Facilities">Facilities & Infrastructure</option>
                    <option value="Transport">School Transport</option>
                    <option value="Other">General Concern</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the incident, classroom location, and assistance requested..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
