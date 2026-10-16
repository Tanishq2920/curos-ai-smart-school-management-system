import React from 'react';
import { Calendar } from 'lucide-react';

interface AcademicInfoCardProps {
  todayDisplay?: string;
  academicYear?: string;
  currentTerm?: string;
}

export const AcademicInfoCard: React.FC<AcademicInfoCardProps> = ({
  todayDisplay = 'Wed, 27 Aug 2025',
  academicYear = '2025 – 2026',
  currentTerm = 'Term 1'
}) => {
  return (
    <div className="bg-white border border-[#E8EDF4] rounded-2xl p-6 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)] h-full min-h-[178px]">
      {/* Top section */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#1769FF] flex-shrink-0">
          <Calendar className="w-6 h-6 stroke-[1.8]" />
        </div>
        <div>
          <span className="text-[12px] font-medium text-[#667085] block">
            Today
          </span>
          <span className="text-[17px] font-bold text-[#101828] tracking-tight block">
            {todayDisplay}
          </span>
        </div>
      </div>

      {/* Subtle Divider */}
      <div className="border-t border-[#F2F4F7] my-3.5" />

      {/* Academic Details */}
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#667085] text-[13.5px]">Academic Year:</span>
          <span className="font-semibold text-[#101828] text-[13.5px]">{academicYear}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#667085] text-[13.5px]">Current Term:</span>
          <span className="font-semibold text-[#101828] text-[13.5px]">{currentTerm}</span>
        </div>
      </div>
    </div>
  );
};
