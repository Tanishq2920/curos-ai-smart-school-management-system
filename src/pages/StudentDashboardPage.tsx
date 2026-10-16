import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  Award,
  CreditCard,
  MessageSquare,
  FileText,
  Clock,
  Video,
  MapPin,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Bot,
  Sparkles
} from 'lucide-react';
import { schoolService } from '../services/schoolService';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    schoolService.fetchStudentDashboard()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching student dashboard:', err);
        setError(err.message || 'Failed to load student dashboard. Please try again.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading student dashboard...</p>
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const student = data?.student;
  const todayClasses = data?.todayClasses || [];
  const assignments = data?.assignments || [];
  const results = data?.results || [];
  const complaints = data?.myComplaints || [];

  return (
    <div className="space-y-6">
      {/* Student Profile Header */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 border border-emerald-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Student Academic Space
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Hi, {student?.name || 'Student'} 👋
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Roll No: <span className="font-mono font-semibold text-gray-800">{student?.roll_number || student?.rollNumber || '10A-01'}</span> • Class: <span className="font-semibold text-gray-800">{student?.class || 'Class 10A'}</span>
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
            <FileText className="w-4 h-4" />
            <span>My Homework</span>
          </button>
          <button
            onClick={() => navigate('/complaints')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Submit Grievance</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">My Attendance</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {student?.attendance_rate ?? 94}%
          </p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${student?.attendance_rate ?? 94}%` }} />
          </div>
        </div>

        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">My Assignments</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {assignments.length} Due
          </p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Active tasks</span>
        </div>

        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">My Fee Account</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {data?.feeRecord?.status || 'Paid'}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">{data?.feeRecord?.term || 'Term 1'}</span>
        </div>

        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Published Grades</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {results.length} Subjects
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Evaluation available</span>
        </div>
      </div>

      {/* Today's Schedule Card */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Today's Class Schedule</h2>
          </div>
          <button onClick={() => navigate('/classes')} className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer">
            Weekly Timetable <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y divide-gray-100 pt-1">
          {todayClasses.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No scheduled periods for today.</p>
          ) : (
            todayClasses.map((cls: any) => (
              <div key={cls.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: cls.color || '#3B82F6' }} />
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">{cls.title}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Teacher: <span className="font-semibold text-gray-700">{cls.teacher}</span> • Topic: <span className="text-gray-700">{cls.subject}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <span className="text-xs font-mono font-semibold text-gray-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {cls.time}
                  </span>
                  {cls.join_link || cls.joinLink ? (
                    <a
                      href={cls.join_link || cls.joinLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-semibold"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meet</span>
                    </a>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-gray-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{cls.location || 'Classroom'}</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grid: Assignments & Exam Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Assignments */}
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Pending Homework & Tasks</h2>
            <button onClick={() => navigate('/assignments')} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
              Open Portal
            </button>
          </div>
          <div className="divide-y divide-gray-100 py-2 space-y-2 flex-1">
            {assignments.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No pending assignments at this time.</p>
            ) : (
              assignments.map((asg: any) => (
                <div key={asg.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                      {asg.subject}
                    </span>
                    <h3 className="text-xs font-bold text-gray-900 mt-1">{asg.title}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">Due date: {asg.due_date || asg.dueDate}</p>
                  </div>
                  <button
                    onClick={() => navigate('/assignments')}
                    className="px-3 py-1 bg-[#1769FF] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 cursor-pointer flex-shrink-0"
                  >
                    Submit
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Academic Marks Card */}
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Published Subject Marks</h2>
            <button onClick={() => navigate('/exams')} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
              Full Results
            </button>
          </div>
          <div className="divide-y divide-gray-100 py-2 space-y-2 flex-1">
            {results.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">No published examination results yet.</p>
            ) : (
              results.map((res: any) => (
                <div key={res.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{res.subject}</p>
                    <p className="text-[11px] text-gray-500">{res.exam_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-800">
                      {res.marks_obtained} / {res.max_marks}
                    </span>
                    <span className="px-2 py-0.5 font-bold text-emerald-700 bg-emerald-50 rounded-md">
                      {res.grade}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grievances / Complaints Summary */}
      {complaints.length > 0 && (
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-bold text-gray-900">My Lodged Inquiries & Grievances</h2>
            </div>
            <button onClick={() => navigate('/complaints')} className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-100 pt-1">
            {complaints.slice(0, 3).map((cmp: any) => (
              <div key={cmp.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-500 font-semibold">{cmp.ticket_number}</span>
                    <h3 className="font-bold text-gray-900">{cmp.title}</h3>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{cmp.date} • Category: {cmp.category}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                  cmp.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' :
                  cmp.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  {cmp.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
