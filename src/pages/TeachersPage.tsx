import React, { useState, useEffect } from 'react';
import { UserRound, Plus, Search, Mail, Phone, X } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { Teacher } from '../types';

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const currentUser = schoolService.getCurrentUser();

  // Form State
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('Science & Math');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const loadTeachers = () => {
    schoolService.fetchTeachers().then(setTeachers).catch(console.error);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;
    try {
      await schoolService.addTeacher({
        name,
        employeeId: employeeId || `EMP-T${100 + teachers.length + 1}`,
        subject,
        department,
        email: email || `${name.toLowerCase().replace(' ', '.')}@smartschool.edu`,
        phone: phone || '+91 98000 11000',
        classesAssigned: ['Class 10A']
      });
      setIsAddModalOpen(false);
      setName('');
      setEmployeeId('');
      setSubject('');
      setEmail('');
      setPhone('');
      loadTeachers();
    } catch (err: any) {
      alert(err.message || 'Error adding faculty member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <UserRound className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Faculty & Teachers</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Directory of faculty members, department specializations, and academic appointments.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1769FF] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Teacher</span>
          </button>
        )}
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search teacher by name, subject, or department..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Showing {filteredTeachers.length} faculty members
        </span>
      </div>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((tch) => (
          <div
            key={tch.id}
            className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 font-bold text-lg flex items-center justify-center">
                    {tch.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{tch.name}</h3>
                    <p className="text-xs text-purple-600 font-semibold">{tch.subject}</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                  {tch.status}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Department:</span>
                  <span className="font-medium text-gray-700">{tch.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Employee ID:</span>
                  <span className="font-mono text-gray-700">{tch.employeeId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Classes:</span>
                  <span className="font-medium text-gray-700">
                    {Array.isArray(tch.classesAssigned) ? tch.classesAssigned.join(', ') : tch.classesAssigned}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <a
                href={`mailto:${tch.email}`}
                className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate max-w-[130px]">{tch.email}</span>
              </a>
              <span className="flex items-center gap-1 text-gray-400">
                <Phone className="w-3 h-3" />
                <span>{tch.phone}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleAddTeacher}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Add Faculty Member</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Priya Raman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Subject Specialization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. History & Civics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="Science & Math">Science & Math</option>
                    <option value="Languages & Humanities">Languages & Humanities</option>
                    <option value="Technology">Technology</option>
                    <option value="Arts & Physical Ed">Arts & Physical Ed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@smartschool.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1769FF] hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Add Teacher
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
