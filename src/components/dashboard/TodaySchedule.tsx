import React, { useState } from 'react';
import { MapPin, X, Video, ExternalLink } from 'lucide-react';
import { ScheduleItem } from '../../types';

interface TodayScheduleProps {
  schedule: ScheduleItem[];
  onViewFullSchedule?: () => void;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ schedule, onViewFullSchedule }) => {
  const [selectedSession, setSelectedSession] = useState<ScheduleItem | null>(null);

  const getBadgeStyle = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'Extra Class':
        return 'bg-rose-50 text-rose-500';
      case 'Meeting':
        return 'bg-purple-50 text-purple-600';
      case 'Regular':
      default:
        return 'bg-sky-50 text-sky-600';
    }
  };

  return (
    <>
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col h-full">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F2F4F7]">
          <h2 className="text-[16px] font-bold text-[#101828] tracking-tight">
            Today's Schedule
          </h2>
          <button
            onClick={onViewFullSchedule}
            className="text-[13px] font-medium text-[#1769FF] hover:text-blue-700 hover:underline transition-colors cursor-pointer"
          >
            View Full Schedule
          </button>
        </div>

        {/* Timeline List */}
        <div className="relative pt-3 pb-1 flex-1 flex flex-col justify-between">
          {schedule.slice(0, 5).map((item, idx) => {
            const isLast = idx === schedule.length - 1;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedSession(item)}
                className="relative flex items-start gap-3.5 group cursor-pointer hover:bg-slate-50/70 -mx-2 px-2 py-1.5 rounded-xl transition-colors"
              >
                {/* Timeline vertical connector & Dot */}
                <div className="relative flex flex-col items-center flex-shrink-0 mt-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white z-10"
                    style={{ backgroundColor: item.color }}
                  />
                  {!isLast && (
                    <div className="w-[1.5px] bg-[#E8EDF4] absolute top-2.5 bottom-[-22px]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <span className="text-[11px] font-medium text-[#667085] block leading-none">
                    {item.time}
                  </span>
                  <h3 className="text-[13.5px] font-bold text-[#101828] tracking-tight mt-1 truncate group-hover:text-[#1769FF] transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[11.5px] text-[#667085] mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#98A2B3] flex-shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>

                {/* Right Badge */}
                <div className="flex-shrink-0 mt-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full ${getBadgeStyle(
                      item.type
                    )}`}
                  >
                    {item.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span
                  className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full uppercase tracking-wider mb-1 ${getBadgeStyle(
                    selectedSession.type
                  )}`}
                >
                  {selectedSession.type}
                </span>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">
                  {selectedSession.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="text-gray-600 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-gray-500">Scheduled Time</span>
                <span className="font-semibold text-gray-800">{selectedSession.time}</span>
              </div>
              <div className="text-gray-600 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-gray-500">Location / Venue</span>
                <span className="font-semibold text-gray-800">{selectedSession.location}</span>
              </div>
              {selectedSession.teacher && (
                <div className="text-gray-600 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-gray-500">Teacher / Lead</span>
                  <span className="font-semibold text-gray-800">{selectedSession.teacher}</span>
                </div>
              )}
              {selectedSession.subject && (
                <div className="text-gray-600 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-gray-500">Topic / Agenda</span>
                  <span className="font-semibold text-gray-800">{selectedSession.subject}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
              {selectedSession.joinLink ? (
                <a
                  href={selectedSession.joinLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Join Google Meet</span>
                </a>
              ) : (
                <button
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1769FF] hover:bg-blue-700 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
