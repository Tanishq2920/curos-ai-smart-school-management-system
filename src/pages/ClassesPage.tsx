import React, { useState, useEffect } from 'react';
import { BookOpen, MapPin, Clock, Plus, X } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { SchoolClass } from '../types';

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = schoolService.getCurrentUser();

  // Create Class Form
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('10th Grade');
  const [section, setSection] = useState('A');
  const [room, setRoom] = useState('Room 101');
  const [classTeacher, setClassTeacher] = useState('Mr. Rajesh Verma');
  const [capacity, setCapacity] = useState(35);

  const loadClasses = () => {
    schoolService.fetchClasses().then(cls => {
      setClasses(cls);
      if (cls.length > 0 && !selectedClass) {
        setSelectedClass(cls[0]);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('smart_school_token_v1') || ''}`
        },
        body: JSON.stringify({
          name,
          grade,
          section,
          room,
          classTeacher,
          capacity
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create section');
      }
      setIsModalOpen(false);
      setName('');
      loadClasses();
    } catch (err: any) {
      alert(err.message || 'Error creating section');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Classes & Academic Sections</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Section schedules, assigned class teachers, enrollment capacities, and weekly timetable matrices.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1769FF] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Section</span>
          </button>
        )}
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {classes.map((cls) => {
          const isSelected = selectedClass?.id === cls.id;
          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-50/50 border-[#1769FF] shadow-sm ring-1 ring-blue-500'
                  : 'bg-white border-[#E8EDF4] hover:border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">{cls.grade}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Sec {cls.section}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">{cls.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>{cls.room}</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
                <span className="text-gray-400">Enrollment</span>
                <span className="font-bold text-gray-800">
                  {cls.totalStudents} / {cls.capacity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Class Schedule & Roster Detail */}
      {selectedClass && (
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div>
              <span className="text-xs font-semibold text-[#1769FF] uppercase tracking-wider">
                Section Overview & Timetable
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                {selectedClass.name} – {selectedClass.grade}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Class Teacher: <span className="font-semibold text-gray-700">{selectedClass.classTeacher}</span> • Allocated Room: <span className="font-semibold text-gray-700">{selectedClass.room}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold">
                {selectedClass.totalStudents} Active Students Enrolled
              </div>
            </div>
          </div>

          {/* Timetable for this class */}
          <div className="mt-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1769FF]" />
              Weekly Class Timetable Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <div key={day} className="bg-slate-50/70 border border-gray-200/70 rounded-xl p-3">
                  <p className="font-bold text-gray-800 pb-2 border-b border-gray-200 text-center uppercase tracking-wider text-[11px]">
                    {day}
                  </p>
                  <div className="space-y-2 mt-2">
                    <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-2xs">
                      <span className="text-[10px] text-gray-400 block font-mono">09:00 - 10:00</span>
                      <span className="font-semibold text-gray-800">Mathematics</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-2xs">
                      <span className="text-[10px] text-gray-400 block font-mono">10:15 - 11:15</span>
                      <span className="font-semibold text-gray-800">Science / Physics</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-2xs">
                      <span className="text-[10px] text-gray-400 block font-mono">11:30 - 12:30</span>
                      <span className="font-semibold text-gray-800">English Grammar</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-2xs">
                      <span className="text-[10px] text-gray-400 block font-mono">01:30 - 02:30</span>
                      <span className="font-semibold text-gray-800">Computer Science</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreateClass}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Create Academic Section</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Class Section Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10-B"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Grade Level</label>
                  <input
                    type="text"
                    required
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Classroom Room</label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Student Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assigned Class Teacher</label>
                <input
                  type="text"
                  value={classTeacher}
                  onChange={(e) => setClassTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1769FF] hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Create Section
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
