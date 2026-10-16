import React, { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle2, XCircle, Save, Clock } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { Student } from '../types';

export const AttendancePage: React.FC = () => {
  const currentUser = schoolService.getCurrentUser();
  const [selectedClass, setSelectedClass] = useState('Class 10A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const canMarkAttendance = ['ADMIN', 'TEACHER'].includes(currentUser.role);

  const loadData = async () => {
    setLoading(true);
    try {
      if (canMarkAttendance) {
        const sts = await schoolService.fetchStudents();
        const filtered = sts.filter(s => s.class === selectedClass || s.class === selectedClass.replace(' ', ''));
        setStudents(filtered);
        
        // Fetch existing attendance records from backend
        const res = await fetch(`/api/attendance?class=${selectedClass}&date=${selectedDate}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('smart_school_token_v1') || ''}`
          }
        });
        if (res.ok) {
          const recs = await res.json();
          const map: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
          filtered.forEach(s => {
            const found = recs.find((r: any) => r.student_id === s.id);
            map[s.id] = (found ? found.status : 'PRESENT') as any;
          });
          setAttendanceMap(map);
        }
      } else {
        // Student or Parent
        const res = await fetch('/api/attendance', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('smart_school_token_v1') || ''}`
          }
        });
        if (res.ok) {
          const recs = await res.json();
          setAttendanceRecords(recs);
        }
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass, selectedDate]);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    setSavedSuccess(false);
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT') => {
    const updated = { ...attendanceMap };
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
    setSavedSuccess(false);
  };

  const handleSaveAttendance = async () => {
    try {
      const records = students.map(s => ({
        studentId: s.id,
        status: attendanceMap[s.id] || 'PRESENT'
      }));
      await schoolService.saveAttendance(selectedClass, selectedDate, records);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving attendance');
    }
  };

  const total = students.length;
  const presentCount = students.filter(s => attendanceMap[s.id] === 'PRESENT').length;
  const absentCount = students.filter(s => attendanceMap[s.id] === 'ABSENT').length;
  const lateCount = students.filter(s => attendanceMap[s.id] === 'LATE').length;
  const percentage = total > 0 ? Math.round(((presentCount + lateCount * 0.5) / total) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-50 text-rose-500 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {canMarkAttendance ? 'Daily Attendance Roll' : 'My Attendance Record'}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {canMarkAttendance
              ? 'Mark and review official daily attendance registers for assigned classes.'
              : 'Verified personal attendance percentage, daily presence records, and absence status.'}
          </p>
        </div>

        {canMarkAttendance && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
            >
              Mark All Present
            </button>
            <button
              onClick={handleSaveAttendance}
              className="flex items-center gap-2 px-4 py-2 bg-[#1769FF] text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Attendance</span>
            </button>
          </div>
        )}
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Attendance records successfully logged in the database for {selectedClass} on {selectedDate}.</span>
        </div>
      )}

      {/* Control Bar & Live Stats for Staff */}
      {canMarkAttendance ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Selector Panel */}
            <div className="md:col-span-2 bg-white border border-[#E8EDF4] rounded-2xl p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 outline-none"
                >
                  <option value="Class 10A">Class 10A</option>
                  <option value="Class 10-A">Class 10-A</option>
                  <option value="Class 9B">Class 9B</option>
                  <option value="Class 8A">Class 8A</option>
                  <option value="Class 11A">Class 11A</option>
                  <option value="Class 12A">Class 12A</option>
                </select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Attendance Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 outline-none"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white border border-[#E8EDF4] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Present Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{percentage}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                {presentCount}/{total}
              </div>
            </div>

            <div className="bg-white border border-[#E8EDF4] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Absentees / Late</p>
                <p className="text-2xl font-bold text-rose-600 mt-0.5">{absentCount} / {lateCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Attendance Roster Table */}
          <div className="bg-white border border-[#E8EDF4] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">
                Attendance Roll — {selectedClass} ({selectedDate})
              </h3>
              <span className="text-xs text-gray-400">Click a button to toggle student state</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-[#E8EDF4] text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Cumulative %</th>
                    <th className="py-3 px-4 text-center">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EDF4]">
                  {students.map((st) => {
                    const currentStatus = attendanceMap[st.id] || 'PRESENT';
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-gray-700">
                          {st.rollNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          {st.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-emerald-600">{st.attendanceRate}%</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStatusChange(st.id, 'PRESENT')}
                              className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                                currentStatus === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleStatusChange(st.id, 'LATE')}
                              className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                                currentStatus === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              onClick={() => handleStatusChange(st.id, 'ABSENT')}
                              className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                                currentStatus === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Read-only Attendance History for Student / Parent */
        <div className="bg-white border border-[#E8EDF4] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Verified Daily Attendance Log</h3>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Read-Only Verified Roll
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-[#E8EDF4] text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF4]">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-mono font-medium text-gray-700">{r.date}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{r.student_name}</td>
                      <td className="py-3.5 px-4 text-gray-600">{r.class}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          r.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' :
                          r.status === 'LATE' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500">{r.marked_by || 'Faculty'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No attendance log records recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
