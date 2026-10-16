import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Eye, X } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { Student } from '../types';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const currentUser = schoolService.getCurrentUser();

  // Form State
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10A');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const loadStudents = () => {
    schoolService.fetchStudents().then(setStudents).catch(console.error);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.guardianName && s.guardianName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = classFilter === 'All' || s.class === classFilter;
    const matchesStatus = statusFilter === 'All' || s.feeStatus === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rollNumber.trim()) return;
    try {
      await schoolService.addStudent({
        name,
        rollNumber,
        class: studentClass,
        gender,
        status: 'Active',
        guardianName: guardianName || 'Guardian',
        phone: phone || '+91 98000 00000',
        email: email || `${rollNumber.toLowerCase()}@smartschool.edu`,
        address: address || 'Campus Residence'
      });
      setIsAddModalOpen(false);
      setName('');
      setRollNumber('');
      setGuardianName('');
      setPhone('');
      setEmail('');
      setAddress('');
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'Error enrolling student');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {currentUser.role === 'PARENT' ? 'Linked Children Profiles' : currentUser.role === 'TEACHER' ? 'My Students' : 'Students Directory'}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {currentUser.role === 'ADMIN'
              ? 'Institutional student enrollment records, section assignments, attendance rates, and fee statuses.'
              : currentUser.role === 'TEACHER'
              ? 'Students enrolled in your assigned teaching sections.'
              : currentUser.role === 'PARENT'
              ? 'Authorized profiles of your linked children.'
              : 'Your verified student academic record.'}
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1769FF] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Enroll New Student</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, roll no..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Class:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-700 outline-none"
            >
              <option value="All">All Classes</option>
              <option value="Class 8A">Class 8A</option>
              <option value="Class 9B">Class 9B</option>
              <option value="Class 10A">Class 10A</option>
              <option value="Class 10-A">Class 10-A</option>
              <option value="Class 11A">Class 11A</option>
              <option value="Class 11B">Class 11B</option>
              <option value="Class 12A">Class 12A</option>
            </select>
          </div>

          {currentUser.role === 'ADMIN' && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Fee Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-700 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-[#E8EDF4] text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Guardian Contact</th>
                <th className="py-3.5 px-4">Attendance Rate</th>
                {currentUser.role !== 'TEACHER' && <th className="py-3.5 px-4">Fee Status</th>}
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF4]">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm leading-tight">{st.name}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{st.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-gray-700">
                      {st.rollNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                        {st.class}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-gray-900 font-medium">{st.guardianName}</p>
                      <p className="text-gray-400 text-[11px] mt-0.5">{st.phone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${st.attendanceRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-700">{st.attendanceRate}%</span>
                      </div>
                    </td>
                    {currentUser.role !== 'TEACHER' && (
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                            st.feeStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : st.feeStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {st.feeStatus}
                        </span>
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(st)}
                        className="p-1.5 text-gray-400 hover:text-[#1769FF] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="View Student Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    No student records match your authorization criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 text-lg font-bold flex items-center justify-center">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Roll: {selectedStudent.rollNumber} • {selectedStudent.class}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-gray-500">Guardian Name:</span>
                <span className="font-semibold text-gray-800">{selectedStudent.guardianName}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-gray-500">Phone Contact:</span>
                <span className="font-semibold text-gray-800">{selectedStudent.phone}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-gray-500">Institutional Email:</span>
                <span className="font-semibold text-gray-800">{selectedStudent.email}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-gray-500">Home Address:</span>
                <span className="font-semibold text-gray-800">{selectedStudent.address}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-gray-500">Attendance Rate:</span>
                <span className="font-semibold text-emerald-600">{selectedStudent.attendanceRate}% (Present)</span>
              </div>
              {currentUser.role !== 'TEACHER' && (
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-gray-500">Fee Status:</span>
                  <span className="font-semibold text-gray-800">{selectedStudent.feeStatus}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1769FF] hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal (Admin only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleAddStudent}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Enroll New Student</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyanshu Gupta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10A-18"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Class Assigned</label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="Class 8A">Class 8A</option>
                    <option value="Class 9B">Class 9B</option>
                    <option value="Class 10A">Class 10A</option>
                    <option value="Class 11A">Class 11A</option>
                    <option value="Class 12A">Class 12A</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    placeholder="Parent or Guardian"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Home Address</label>
                <input
                  type="text"
                  placeholder="Street address, city"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
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
                Register Student
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
