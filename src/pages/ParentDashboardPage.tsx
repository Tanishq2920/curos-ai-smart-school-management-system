import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Award,
  CreditCard,
  Calendar,
  Clock,
  Bot,
  Sparkles,
  RefreshCw,
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { schoolService } from '../services/schoolService';

export const ParentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  const loadData = () => {
    setLoading(true);
    setError(null);
    schoolService.fetchParentDashboard()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching parent dashboard:', err);
        setError(err.message || 'Failed to load parent dashboard.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const rawChildren = data?.children;
  const children: any[] = React.useMemo(() => {
    if (!rawChildren || !Array.isArray(rawChildren)) return [];
    const seen = new Set<string>();
    return rawChildren.filter((c: any) => {
      const id = c?.id || c?.student_id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [rawChildren]);

  const currentChild = children[selectedChildIndex] || children[0] || null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] space-y-3">
        <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading parent & student records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Dashboard Unavailable</h3>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border border-amber-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Parent & Guardian Portal
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Welcome, {data?.parentName || 'Parent'} 👋
          </h1>
          {currentChild ? (
            <p className="text-xs text-gray-500 mt-1">
              Verified Linked Child: <span className="font-semibold text-gray-800">{currentChild.name}</span> • Section: <span className="font-semibold text-gray-800">{currentChild.class}</span> (Roll: {currentChild.roll_number || currentChild.rollNumber})
            </p>
          ) : (
            <p className="text-xs text-amber-600 mt-1">
              No verified linked children found. Please contact administration.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => window.dispatchEvent(new Event('open-curos-ai'))}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Bot className="w-4 h-4 text-indigo-100" />
            <span>Ask CUROS AI</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          </button>
          <button
            onClick={() => navigate('/meetings')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1769FF] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Principal Meeting</span>
          </button>
          <button
            onClick={() => navigate('/leaves')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <span>Apply Child Leave</span>
          </button>
        </div>
      </div>

      {/* Child Switcher Tabs if multiple children */}
      {children.length > 1 && (
        <div className="flex items-center gap-2">
          {children.map((c: any, idx: number) => (
            <button
              key={`${c.id || 'child'}-${idx}`}
              onClick={() => setSelectedChildIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedChildIndex === idx
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-slate-50'
              }`}
            >
              {c.name} ({c.class})
            </button>
          ))}
        </div>
      )}

      {/* Child Overview Cards */}
      {currentChild ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Child Attendance</span>
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {currentChild.attendance_rate ?? currentChild.attendanceRate ?? 'N/A'}%
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Verified Roll Status</span>
          </div>

          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Child Fee Balance</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {currentChild.fee?.status || 'No pending invoice'}
            </p>
            <span className="text-[11px] text-gray-400 mt-1 block">
              {currentChild.fee?.total_amount ? `₹${currentChild.fee.total_amount.toLocaleString()} Invoiced` : 'Standard Enrollment'}
            </span>
          </div>

          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Active Appointments</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {data?.meetings?.length || 0} Booked
            </p>
            <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Meeting Desk Active</span>
          </div>

          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Academic Reports</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {currentChild.results?.length || 0} Published
            </p>
            <span className="text-[11px] text-gray-400 mt-1 block">Term assessments</span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-xs">
          <UserCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <span>No student is linked to your parent account. Please register with a verified student roll number.</span>
        </div>
      )}

      {/* Grid: Exam Performance & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Child Exam Performance */}
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">
              {currentChild ? `${currentChild.name}'s Published Exam Marks` : 'Child Examination Results'}
            </h2>
            <button onClick={() => navigate('/exams')} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100 py-2 space-y-2 flex-1">
            {currentChild?.results && currentChild.results.length > 0 ? (
              currentChild.results.map((res: any) => (
                <div key={res.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{res.subject}</p>
                    <p className="text-[11px] text-gray-500">{res.exam_name || 'Academic Assessment'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800">{res.marks_obtained} / {res.max_marks}</span>
                    <span className="px-2 py-0.5 font-bold text-emerald-700 bg-emerald-50 rounded-md">
                      {res.grade}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-8 text-center">No examination records published for this student.</p>
            )}
          </div>
        </div>

        {/* Confirmed Meetings */}
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">My Consultation Appointments</h2>
            <button onClick={() => navigate('/meetings')} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
              Book Meeting
            </button>
          </div>
          <div className="divide-y divide-gray-100 py-2 space-y-2 flex-1">
            {data?.meetings && data.meetings.length > 0 ? (
              data.meetings.map((m: any) => (
                <div key={m.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{m.meeting_type}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          m.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : m.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{m.reason}</p>
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{m.preferred_date} at {m.preferred_time} ({m.mode})</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-8 text-center">No meeting appointments requested yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
