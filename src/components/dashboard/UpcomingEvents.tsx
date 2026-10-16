import React, { useState } from 'react';
import { Clock, MapPin, ChevronRight, X, Calendar } from 'lucide-react';
import { SchoolEvent } from '../../types';

interface UpcomingEventsProps {
  events: SchoolEvent[];
  onViewAll?: () => void;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, onViewAll }) => {
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);

  return (
    <>
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col h-full">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F2F4F7]">
          <h2 className="text-[16px] font-bold text-[#101828] tracking-tight">
            Upcoming Events
          </h2>
          <button
            onClick={onViewAll}
            className="text-[13px] font-medium text-[#1769FF] hover:text-blue-700 hover:underline transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Events List */}
        <div className="divide-y divide-[#F2F4F7] flex-1">
          {events.slice(0, 4).map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className="py-3.5 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition-colors"
            >
              {/* Left Date Badge */}
              <div
                className={`w-[48px] h-[52px] rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${evt.badgeBg} ${evt.badgeText}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                  {evt.month}
                </span>
                <span className="text-[18px] font-bold leading-tight mt-0.5">
                  {evt.day}
                </span>
              </div>

              {/* Middle Event Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[13.5px] font-bold text-[#101828] truncate group-hover:text-[#1769FF] transition-colors">
                  {evt.title}
                </h3>
                <div className="flex items-center gap-3 text-[11.5px] text-[#667085] mt-1 truncate">
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-[#98A2B3]" />
                    <span>{evt.time}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11.5px] text-[#667085] mt-0.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#98A2B3] flex-shrink-0" />
                  <span className="truncate">{evt.location}</span>
                </div>
              </div>

              {/* Right Chevron */}
              <div className="text-[#98A2B3] group-hover:text-[#1769FF] group-hover:translate-x-0.5 transition-all flex-shrink-0">
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedEvent.badgeBg} ${selectedEvent.badgeText}`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    {selectedEvent.category} Event
                  </span>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                    {selectedEvent.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{selectedEvent.dateStr} • {selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{selectedEvent.location}</span>
              </div>
              {selectedEvent.description && (
                <p className="text-gray-600 bg-slate-50 p-3 rounded-xl text-xs leading-relaxed border border-slate-100">
                  {selectedEvent.description}
                </p>
              )}
              <div className="text-xs text-gray-500 pt-1">
                <span className="font-semibold text-gray-700">{selectedEvent.registeredCount}</span> attendees registered
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-[#1769FF] hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Register / Check-in
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
