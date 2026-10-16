import React, { useState, useEffect } from 'react';
import { FileText, Clock, Download, Award, Plus, X } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { ExamResult } from '../types';

export const ExamsPage: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState('Mid-Term Examination (Term 1)');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isRecordMarksModalOpen, setIsRecordMarksModalOpen] = useState(false);
  const currentUser = schoolService.getCurrentUser();

  // Record Marks Form (Teacher/Admin)
  const [examName, setExamName] = useState('Mid-Term Examination 2026');
  const [studentId, setStudentId] = useState('std-101');
  const [studentName, setStudentName] = useState('Aarav Patel');
  const [examClass, setExamClass] = useState('Class 10A');
  const [subject, setSubject] = useState('Mathematics');
  const [marksObtained, setMarksObtained] = useState(85);
  const [maxMarks, setMaxMarks] = useState(100);
  const [remarks, setRemarks] = useState('Good analytical precision');

  const examDatesheet = [
    { date: '15 Sep 2025', time: '09:30 AM – 12:30 PM', subject: 'Mathematics', code: 'MATH-101', room: 'Hall A & B' },
    { date: '17 Sep 2025', time: '09:30 AM – 12:30 PM', subject: 'Physics & Chemistry', code: 'SCI-102', room: 'Hall A & B' },
    { date: '19 Sep 2025', time: '09:30 AM – 12:30 PM', subject: 'English Core', code: 'ENG-103', room: 'Rooms 101-105' },
    { date: '22 Sep 2025', time: '09:30 AM – 12:30 PM', subject: 'Computer Science & AI', code: 'CS-104', room: 'Computer Labs 1 & 2' },
    { date: '24 Sep 2025', time: '09:30 AM – 12:30 PM', subject: 'Social Sciences', code: 'SST-105', room: 'Hall C' }
  ];

  const loadResults = () => {
    schoolService.fetchExamResults().then(setResults).catch(console.error);
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleRecordMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await schoolService.saveExamResult({
        examName,
        studentId,
        studentName,
        class: examClass,
        subject,
        marksObtained: Number(marksObtained),
        maxMarks: Number(maxMarks),
        remarks
      });
      setIsRecordMarksModalOpen(false);
      loadResults();
    } catch (err: any) {
      alert(err.message || 'Error recording marks');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Examinations & Academic Results</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Exam datesheets, hall allocations, published student marks, and academic performance grading.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ADMIN', 'TEACHER'].includes(currentUser.role) && (
            <button
              onClick={() => setIsRecordMarksModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Exam Marks</span>
            </button>
          )}
          <button
            onClick={() => alert('Official PDF Datesheet generated & downloaded.')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1769FF] text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Datesheet</span>
          </button>
        </div>
      </div>

      {/* Published Results Section */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-gray-900 text-sm">
              {currentUser.role === 'STUDENT' ? 'My Published Exam Results' : currentUser.role === 'PARENT' ? 'Child Published Exam Results' : 'Published Examination Results'}
            </h3>
          </div>
          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
            {results.length} Published Grades
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-[#E8EDF4] text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Examination</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Evaluator Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF4]">
              {results.length > 0 ? (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{r.student_name || (r as any).studentName}</td>
                    <td className="py-3.5 px-4 text-gray-600">{r.class}</td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium">{r.exam_name || (r as any).examName}</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600">{r.subject}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      {r.marks_obtained ?? (r as any).marksObtained} / {r.max_marks ?? (r as any).maxMarks}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md font-bold text-emerald-700 bg-emerald-50">
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 italic">{r.remarks || 'Standard Evaluation'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No examination results published yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exam Datesheet Table */}
      <div className="bg-white border border-[#E8EDF4] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Official Datesheet & Hall Assignments</h3>
          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Approved by Academic Board
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-[#E8EDF4] text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Exam Date</th>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Subject Code</th>
                <th className="py-3 px-4">Allocated Hall</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF4]">
              {examDatesheet.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{row.date}</td>
                  <td className="py-3.5 px-4 text-gray-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{row.time}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-800">{row.subject}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">{row.code}</td>
                  <td className="py-3.5 px-4 text-gray-700">{row.room}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-semibold text-[11px]">
                      Scheduled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Marks Modal */}
      {isRecordMarksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleRecordMarks}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Enter Examination Marks</h3>
              <button
                type="button"
                onClick={() => setIsRecordMarksModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Examination Name</label>
                <input
                  type="text"
                  required
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Class</label>
                  <input
                    type="text"
                    required
                    value={examClass}
                    onChange={(e) => setExamClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    required
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    required
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Teacher Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsRecordMarksModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
              >
                Publish Result
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
