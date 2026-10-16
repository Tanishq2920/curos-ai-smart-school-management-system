import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomeBanner } from '../components/dashboard/WelcomeBanner';
import { AcademicInfoCard } from '../components/dashboard/AcademicInfoCard';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { UpcomingEvents } from '../components/dashboard/UpcomingEvents';
import { TodaySchedule } from '../components/dashboard/TodaySchedule';
import { RecentNotifications } from '../components/dashboard/RecentNotifications';
import { schoolService } from '../services/schoolService';
import { DashboardMetrics, SchoolEvent, ScheduleItem, NotificationItem } from '../types';
import { MapPin, X, CreditCard, ShieldCheck, MessageSquare, CalendarPlus } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics>(schoolService.getMetrics());
  const [events, setEvents] = useState<SchoolEvent[]>(schoolService.getEvents());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(schoolService.getSchedule());
  const [notifications, setNotifications] = useState<NotificationItem[]>(schoolService.getNotifications());
  const [isFullScheduleOpen, setIsFullScheduleOpen] = useState(false);
  const [reportSummary, setReportSummary] = useState<any>(null);

  useEffect(() => {
    const user = schoolService.getCurrentUser();
    if (user.role === 'TEACHER') {
      navigate('/teacher-dashboard', { replace: true });
      return;
    }
    if (user.role === 'STUDENT') {
      navigate('/student-dashboard', { replace: true });
      return;
    }
    if (user.role === 'PARENT') {
      navigate('/parent-dashboard', { replace: true });
      return;
    }

    schoolService.fetchMetrics().then(setMetrics).catch(() => {});
    schoolService.fetchEvents().then(setEvents).catch(() => {});
    schoolService.fetchSchedule().then(setSchedule).catch(() => {});
    schoolService.fetchNotifications().then(setNotifications).catch(() => {});

    fetch('/api/reports/summary', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('smart_school_token_v1') || ''}`
      }
    }).then(res => res.ok ? res.json() : null)
      .then(setReportSummary)
      .catch(() => {});
  }, [navigate]);

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* Row 1: Welcome Banner & Academic Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <WelcomeBanner userName="Administrator" />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <AcademicInfoCard
            todayDisplay={metrics.todayDateDisplay}
            academicYear={metrics.academicYear}
            currentTerm={metrics.currentTerm}
          />
        </div>
      </div>

      {/* Row 2: 4 Summary Metric Cards */}
      <StatsGrid metrics={metrics} />

      {/* Administrative Operations KPI Bar */}
      {reportSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Fee Collection Rate</p>
              <p className="text-xl font-bold text-emerald-600 mt-0.5">
                {reportSummary.feeRealizationPercent}%
              </p>
              <span className="text-[11px] text-gray-400">
                ₹{reportSummary.feeCollected?.toLocaleString()} collected
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Outstanding Dues</p>
              <p className="text-xl font-bold text-rose-600 mt-0.5">
                ₹{reportSummary.feeOutstanding?.toLocaleString()}
              </p>
              <span className="text-[11px] text-rose-500">Requires follow-up</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Open Grievances</p>
              <p className="text-xl font-bold text-amber-600 mt-0.5">
                {reportSummary.openComplaints} Tickets
              </p>
              <span className="text-[11px] text-gray-400">Student & parent desk</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-[#E8EDF4] rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending Leaves</p>
              <p className="text-xl font-bold text-blue-600 mt-0.5">
                {reportSummary.pendingLeaves} Requests
              </p>
              <span className="text-[11px] text-gray-400">Awaiting school decision</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarPlus className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Lower Three-Column Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
        {/* Column 1: Upcoming Events */}
        <UpcomingEvents
          events={events}
          onViewAll={() => navigate('/events')}
        />

        {/* Column 2: Today's Schedule */}
        <TodaySchedule
          schedule={schedule}
          onViewFullSchedule={() => setIsFullScheduleOpen(true)}
        />

        {/* Column 3: Recent Notifications */}
        <RecentNotifications
          notifications={notifications}
          onViewAll={() => navigate('/notifications')}
          onSelectNotification={() => navigate('/notifications')}
        />
      </div>

      {/* Full Schedule Modal */}
      {isFullScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Complete School Timetable
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                  Today's School-Wide Academic Schedule
                </h3>
              </div>
              <button
                onClick={() => setIsFullScheduleOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1 pr-1">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 bg-slate-50/50 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{item.time}</p>
                      <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {item.location}
                        </span>
                        {item.teacher && (
                          <span className="text-gray-600 font-medium">
                            {item.teacher}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      item.type === 'Extra Class'
                        ? 'bg-rose-50 text-rose-600'
                        : item.type === 'Meeting'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-sky-50 text-sky-600'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>{schedule.length} timetable periods configured for today</span>
              <button
                onClick={() => setIsFullScheduleOpen(false)}
                className="px-4 py-2 bg-[#1769FF] text-white rounded-xl font-medium hover:bg-blue-700 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
