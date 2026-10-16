import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  MessageSquare,
  CalendarPlus,
  Plus,
  CheckCircle2,
  Clock,
  Bot,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { schoolService } from '../services/schoolService';

export const TeacherDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    schoolService.fetchTeacherDashboard()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching teacher dashboard:', err);
        setError(err.message || 'Failed to load teacher dashboard.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] space-y-3">
        <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading faculty dashboard...</p>
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50/50 border border-purple-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-bold text-purple-700 bg-purple-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Faculty Teaching Workspace
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Welcome, {data?.teacherName || 'Faculty Member'} 👋
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Assigned Teaching Sections: <span className="font-semibold text-gray-800">{data?.assignedClasses?.join(', ') || 'Class 10A'}</span> ({data?.totalStudentsInClasses || 0} enrolled students)
          </p>
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
            onClick={() => navigate('/assignments')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1769FF] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Assignment</span>
          </button>
          <button
            onClick={() => navigate('/attendance')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">My Classes</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{data?.assignedClasses?.length || 0} Sections</p>
            <span className="text-[11px] text-gray-400 mt-0.5 block">{data?.totalStudentsInClasses || 0} Students</span>
          </div>
        </div>

        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Plus className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Submissions to Grade</p>
            <p className="text-xl font-bold text-blue-600 mt-0.5">{data?.pendingSubmissionsToGrade ?? 0}</p>
            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">Review pending</span>
          </div>
        </div>

        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Assigned Grievances</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{data?.pendingComplaints?.length || 0} Pending</p>
            <span className="text-[11px] text-rose-600 font-semibold mt-0.5 block">Requires response</span>
          </div>
        </div>

        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
            <CalendarPlus className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Student Leaves</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{data?.pendingLeaves?.length || 0} Pending</p>
            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">Awaiting review</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Today's Schedule & Pending Grievances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Teaching Schedule */}
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">My Teaching Schedule Today</h2>
            <button onClick={() => navigate('/classes')} className="text-xs text-blue-600 font-medium hover:underline">
              View Class Timetables
            </button>
          </div>
          <div className="divide-y divide-gray-100 py-2 space-y-2 flex-1">
            {data?.todayClasses?.length > 0 ? (
              data.todayClasses.map((item: any) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{item.title}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{item.time}</span>
                        <span>•</span>
                        <span>{item.location}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-md">
                    {item.type}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No teaching sessions scheduled for today.</p>
            )}
          </div>
        </div>

        {/* Assigned Complaints / Grievance Actions */}
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Student Concerns & Inquiries</h2>
            <button onClick={() => navigate('/complaints')} className="text-xs text-blue-600 font-semibold hover:underline">
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100 py-2 space-y-2 flex-1">
            {data?.pendingComplaints?.length > 0 ? (
              data.pendingComplaints.map((c: any) => (
                <div key={c.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-gray-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.ticket_number || c.ticketNumber}
                      </span>
                      <span className="text-xs font-bold text-gray-900">{c.title}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{c.description}</p>
                  </div>
                  <button
                    onClick={() => navigate('/complaints')}
                    className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer flex-shrink-0"
                  >
                    Respond
                  </button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                <span>All assigned student grievances are resolved.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
