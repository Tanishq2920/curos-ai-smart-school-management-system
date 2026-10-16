import React from 'react';
import { Video, Clock, Users, Plus } from 'lucide-react';
import { schoolService } from '../services/schoolService';

export const OnlineClassesPage: React.FC = () => {
  const currentUser = schoolService.getCurrentUser();

  const onlineSessions = [
    {
      id: 'ol-1',
      title: 'Extra Class – Physics: Thermodynamics Problem Solving',
      teacher: 'Prof. Alok Mukherjee',
      classGrade: 'Class 11A & 12A',
      time: '11:30 AM – 12:30 PM (Today)',
      status: 'Live Now',
      platform: 'Google Meet',
      meetUrl: 'https://meet.google.com/demo-smart-school',
      attendees: 38
    },
    {
      id: 'ol-2',
      title: 'Advanced Mathematics – Calculus & Integration Series',
      teacher: 'Mr. Rajesh Verma',
      classGrade: 'Class 12A',
      time: '04:00 PM – 05:00 PM (Today)',
      status: 'Upcoming',
      platform: 'Google Meet',
      meetUrl: 'https://meet.google.com/demo-smart-school-math',
      attendees: 29
    },
    {
      id: 'ol-3',
      title: 'Science Doubt Clearing – Chemistry Reaction Mechanisms',
      teacher: 'Dr. Neha Sharma',
      classGrade: 'Class 9B & 10B',
      time: 'Tomorrow, 10:00 AM',
      status: 'Scheduled',
      platform: 'Google Meet',
      meetUrl: 'https://meet.google.com/demo-smart-school-chem',
      attendees: 42
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-pink-50 text-pink-600 rounded-xl">
              <Video className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Online & Live Classes</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time interactive virtual classrooms, video conference links, and recorded lecture replays.
          </p>
        </div>

        {['ADMIN', 'TEACHER'].includes(currentUser.role) && (
          <button
            onClick={() => alert('New live classroom created with instant Google Meet link.')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1769FF] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Host New Session</span>
          </button>
        )}
      </div>

      {/* Online Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {onlineSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    session.status === 'Live Now'
                      ? 'bg-rose-50 text-rose-600 animate-pulse'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {session.status}
                </span>
                <span className="text-xs text-gray-400 font-medium">{session.platform}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-base mt-3 leading-snug">{session.title}</h3>
              <p className="text-xs text-gray-500 mt-1">Instructor: {session.teacher}</p>

              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{session.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>Target: {session.classGrade} ({session.attendees} enrolled)</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100">
              <a
                href={session.meetUrl}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  session.status === 'Live Now'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    : 'bg-[#1769FF] hover:bg-blue-700 text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>{session.status === 'Live Now' ? 'Join Live Room' : 'Open Meeting Space'}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
