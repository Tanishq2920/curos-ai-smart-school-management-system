import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, AlertCircle, X } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { Meeting } from '../types';

export const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentUser = schoolService.getCurrentUser();

  // Booking Form State
  const [meetingType, setMeetingType] = useState('Principal Meeting');
  const [targetStaff, setTargetStaff] = useState('Principal Office');
  const [preferredDate, setPreferredDate] = useState('2025-09-12');
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [mode, setMode] = useState<'In-person' | 'Online'>('In-person');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const loadMeetings = () => {
    schoolService.fetchMeetings()
      .then(setMeetings)
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await schoolService.createMeeting({
        meetingType,
        targetStaffId: targetStaff === 'Principal Office' ? 'usr-admin-1' : 'usr-teacher-1',
        targetStaffName: targetStaff,
        preferredDate,
        preferredTime,
        mode,
        reason,
        description
      });
      setIsModalOpen(false);
      setReason('');
      setDescription('');
      loadMeetings();
    } catch (err: any) {
      setError(err.message || 'Slot conflict or booking error');
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await schoolService.updateMeetingStatus(id, status, `Confirmed by ${currentUser.name}`);
      loadMeetings();
    } catch (err: any) {
      alert(err.message || 'Error updating meeting');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Parent & Principal Meeting Desk</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Book appointments with the Principal or subject teachers with conflict prevention and slot verification.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1769FF] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Request Appointment</span>
        </button>
      </div>

      {/* Meetings List */}
      <div className="space-y-3.5">
        {meetings.length > 0 ? (
          meetings.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-gray-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {m.meeting_type}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      m.status === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : m.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {m.status}
                  </span>
                  <span className="text-xs text-gray-400">• Mode: {m.mode}</span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mt-2">{m.reason}</h3>
                {m.description && <p className="text-xs text-gray-600 mt-1">{m.description}</p>}

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{m.preferred_date} at {m.preferred_time}</span>
                  </span>
                  <span>Target: <strong className="text-gray-700">{m.target_staff_name}</strong></span>
                  <span>Requester: <strong className="text-gray-700">{m.requester_name}</strong> ({m.requester_role})</span>
                </div>

                {m.decision_notes && (
                  <p className="text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 mt-2.5">
                    <strong>Note:</strong> {m.decision_notes}
                  </p>
                )}
              </div>

              {/* Staff Action Controls */}
              {['ADMIN', 'TEACHER'].includes(currentUser.role) && m.status === 'PENDING' && (
                <div className="flex md:flex-col items-center md:items-end gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400">Action:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusUpdate(m.id, 'CONFIRMED')}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer"
                    >
                      Confirm Slot
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(m.id, 'REJECTED')}
                      className="px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-12 text-center text-gray-400 text-xs">
            No meeting appointments found for your account.
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleBookMeeting}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Request Appointment</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 my-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="py-3 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Appointment Type</label>
                <select
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                >
                  <option value="Principal Meeting">Principal Executive Meeting</option>
                  <option value="Parent-Teacher Meeting">Parent-Teacher Progress Consultation</option>
                  <option value="Academic Counselling">Academic Counselling & Subject Advice</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Staff</label>
                <select
                  value={targetStaff}
                  onChange={(e) => setTargetStaff(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                >
                  <option value="Principal Office">Dr. S. Nair (Principal Office)</option>
                  <option value="Mr. Rajesh Verma">Mr. Rajesh Verma (Mathematics HOD)</option>
                  <option value="Dr. Neha Sharma">Dr. Neha Sharma (Science Lead)</option>
                  <option value="Ms. Sunita Roy">Ms. Sunita Roy (Class Teacher 8A)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Preferred Date *</label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Time Slot *</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="09:30 AM">09:30 AM – 10:00 AM</option>
                    <option value="10:30 AM">10:30 AM – 11:00 AM</option>
                    <option value="11:30 AM">11:30 AM – 12:00 PM</option>
                    <option value="02:30 PM">02:30 PM – 03:00 PM</option>
                    <option value="03:30 PM">03:30 PM – 04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mode</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === 'In-person'}
                      onChange={() => setMode('In-person')}
                    />
                    <span>In-person (Campus)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      checked={mode === 'Online'}
                      onChange={() => setMode('Online')}
                    />
                    <span>Online (Google Meet)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Agenda / Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Higher secondary stream choice discussion"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Additional Context</label>
                <textarea
                  rows={2}
                  placeholder="Specific questions or items to review..."
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
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
