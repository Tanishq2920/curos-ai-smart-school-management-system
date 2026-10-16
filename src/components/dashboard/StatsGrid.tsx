import React from 'react';
import { Users, UserRound, BookOpen, CalendarCheck } from 'lucide-react';
import { DashboardMetrics } from '../../types';

interface StatsGridProps {
  metrics: DashboardMetrics;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {/* Card 1: Total Students */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#1769FF] flex-shrink-0">
          <Users className="w-6 h-6 stroke-[1.8]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#667085] truncate">
            Total Students
          </p>
          <p className="text-[26px] font-bold text-[#101828] tracking-tight leading-tight mt-0.5">
            {metrics.totalStudents}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[12px]">
            <span className="text-[#16A34A] font-semibold flex items-center">
              +{metrics.studentsGrowth}%
            </span>
            <span className="text-[#667085] truncate">From last month</span>
          </div>
        </div>
      </div>

      {/* Card 2: Total Teachers */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="w-14 h-14 rounded-2xl bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6] flex-shrink-0">
          <UserRound className="w-6 h-6 stroke-[1.8]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#667085] truncate">
            Total Teachers
          </p>
          <p className="text-[26px] font-bold text-[#101828] tracking-tight leading-tight mt-0.5">
            {metrics.totalTeachers}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[12px]">
            <span className="text-[#16A34A] font-semibold flex items-center">
              +{metrics.teachersGrowth}%
            </span>
            <span className="text-[#667085] truncate">From last month</span>
          </div>
        </div>
      </div>

      {/* Card 3: Total Classes */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="w-14 h-14 rounded-2xl bg-[#FFFBEB] flex items-center justify-center text-[#F59E0B] flex-shrink-0">
          <BookOpen className="w-6 h-6 stroke-[1.8]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#667085] truncate">
            Total Classes
          </p>
          <p className="text-[26px] font-bold text-[#101828] tracking-tight leading-tight mt-0.5">
            {metrics.totalClasses}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[12px]">
            <span className="text-[#667085] font-medium">
              {metrics.classesGrowthText}
            </span>
            <span className="text-[#667085] truncate">From last month</span>
          </div>
        </div>
      </div>

      {/* Card 4: Today's Attendance */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] flex items-center justify-center text-[#10B981] flex-shrink-0">
          <CalendarCheck className="w-6 h-6 stroke-[1.8]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#667085] truncate">
            Today's Attendance
          </p>
          <p className="text-[26px] font-bold text-[#101828] tracking-tight leading-tight mt-0.5">
            {metrics.todayAttendancePercent}%
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[12px]">
            <span className="text-[#16A34A] font-semibold flex items-center">
              +{metrics.attendanceGrowth}%
            </span>
            <span className="text-[#667085]">Present</span>
          </div>
        </div>
      </div>
    </div>
  );
};
