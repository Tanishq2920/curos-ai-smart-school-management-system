import React, { useState, useEffect } from 'react';
import { FileText, Plus, Clock, CheckCircle2, Send, X, Award } from 'lucide-react';
import { schoolService } from '../services/schoolService';
import { Assignment } from '../types';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAsgForSubmit, setSelectedAsgForSubmit] = useState<Assignment | null>(null);
  const [selectedAsgForGrade, setSelectedAsgForGrade] = useState<any | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const currentUser = schoolService.getCurrentUser();

  // Create Assignment State
  const [title, setTitle] = useState('');
  const [asgClass, setAsgClass] = useState('Class 10A');
  const [subject, setSubject] = useState('Mathematics');
  const [dueDate, setDueDate] = useState('2025-09-10');
  const [maxMarks, setMaxMarks] = useState(25);
  const [description, setDescription] = useState('');

  // Grading State
  const [gradeMarks, setGradeMarks] = useState(23);
  const [gradeFeedback, setGradeFeedback] = useState('Excellent work with step-by-step proofs.');

  const loadAssignments = () => {
    schoolService.fetchAssignments().then(setAssignments).catch(console.error);
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await schoolService.createAssignment({
        title,
        class: asgClass,
        subject,
        dueDate,
        maxMarks: Number(maxMarks),
        description
      });
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
      loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Error creating assignment');
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgForSubmit || !submissionContent.trim()) return;
    try {
      await schoolService.submitAssignment(selectedAsgForSubmit.id, submissionContent);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedAsgForSubmit(null);
        setSubmissionContent('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Error submitting response');
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {currentUser.role === 'STUDENT' ? 'My Class Homework' : currentUser.role === 'TEACHER' ? 'My Course Assignments' : 'Assignments & Homework Hub'}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {currentUser.role === 'TEACHER'
              ? 'Publish subject coursework, set deadlines, and evaluate student submissions.'
              : currentUser.role === 'STUDENT'
              ? 'Active assignments published for your grade, deadlines, and digital submission workspace.'
              : currentUser.role === 'PARENT'
              ? 'Monitor homework assignments and active submission requirements for your child.'
              : 'School-wide curriculum oversight and academic task repository.'}
          </p>
        </div>

        {['ADMIN', 'TEACHER'].includes(currentUser.role) && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1769FF] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Assignment</span>
          </button>
        )}
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assignments.length > 0 ? (
          assignments.map((asg) => (
            <div
              key={asg.id}
              className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                    {asg.subject} • {asg.class}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    Max: {asg.max_marks || (asg as any).maxMarks || 25} Marks
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mt-2">{asg.title}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{asg.description}</p>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 font-medium text-rose-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {asg.due_date || (asg as any).dueDate}</span>
                  </span>
                  <span>By: {asg.teacher_name || (asg as any).teacherName}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                {currentUser.role === 'STUDENT' ? (
                  <button
                    onClick={() => setSelectedAsgForSubmit(asg)}
                    className="px-4 py-2 bg-[#1769FF] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Work</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Active Assignment
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-white border border-[#E8EDF4] rounded-2xl p-12 text-center text-gray-400 text-xs">
            No assignments found for your current scope.
          </div>
        )}
      </div>

      {/* Student Submit Work Modal */}
      {selectedAsgForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleSubmitResponse}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">Submit Homework</span>
                <h3 className="font-bold text-gray-900 text-base leading-tight mt-0.5">
                  {selectedAsgForSubmit.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsgForSubmit(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess && (
              <div className="p-3 my-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Assignment successfully submitted to instructor!</span>
              </div>
            )}

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-semibold text-gray-700">Task Instructions:</p>
                <p className="text-gray-600 mt-0.5">{selectedAsgForSubmit.description}</p>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Your Solution / Written Response *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Enter detailed workings, step-by-step answers, or project report notes..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedAsgForSubmit(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1769FF] hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Submit Response
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teacher Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Create New Assignment</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Quadratic Formula Practise"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Class</label>
                  <select
                    value={asgClass}
                    onChange={(e) => setAsgClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none bg-white font-medium"
                  >
                    <option value="Class 10A">Class 10A</option>
                    <option value="Class 10-A">Class 10-A</option>
                    <option value="Class 9B">Class 9B</option>
                    <option value="Class 8A">Class 8A</option>
                    <option value="Class 11A">Class 11A</option>
                    <option value="Class 12A">Class 12A</option>
                  </select>
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
                  <label className="block font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Task Instructions & Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed questions, page numbers, or guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1769FF] hover:bg-blue-700 rounded-xl cursor-pointer"
              >
                Publish Assignment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
