import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Trophy,
  CalendarPlus,
  FolderOpen,
  Megaphone,
  BarChart2,
  Sparkles,
  Download,
  Send,
  Bot
} from 'lucide-react';
import { schoolService } from '../services/schoolService';

export const ServiceRequestsPage: React.FC = () => {
  const requests = [
    { id: 'SR-201', facility: 'Computer Lab 2', issue: 'Projector HDMI port flickering', priority: 'High', status: 'In Progress', date: '26 Aug 2025' },
    { id: 'SR-202', facility: 'Sports Complex', issue: 'Basketball court lighting sensor replacement', priority: 'Medium', status: 'Pending Approval', date: '25 Aug 2025' },
    { id: 'SR-203', facility: 'Room 204', issue: 'Smartboard software driver upgrade', priority: 'Low', status: 'Resolved', date: '24 Aug 2025' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <Wrench className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campus Service & Facility Requests</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          IT maintenance, laboratory equipment repair, and campus infrastructure requisitions.
        </p>
      </div>

      <div className="bg-white border border-[#E8EDF4] rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-[#E8EDF4] text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Facility / Location</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Logged Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EDF4]">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-mono font-bold text-gray-700">{req.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-gray-900">{req.facility}</td>
                  <td className="py-3.5 px-4 text-gray-600">{req.issue}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                      req.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {req.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-blue-600">{req.status}</td>
                  <td className="py-3.5 px-4 text-gray-400">{req.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AchievementsPage: React.FC = () => {
  const honors = [
    { title: 'National Science Olympiad – 1st Place', winner: 'Ananya Sharma (Class 10A)', event: 'All-India NSO 2025', badge: 'Gold Medal' },
    { title: 'Inter-School Basketball Championship', winner: 'Senior Boys Team', event: 'District Sports Meet', badge: 'Trophy' },
    { title: 'State Debate Competition Winner', winner: 'Kabir Khan (Class 12A)', event: 'Literary Festival', badge: '1st Prize' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Trophy className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student & Institutional Achievements</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Honor roll, academic awards, state/national olympiad winners, and sports trophies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {honors.map((h, i) => (
          <div key={i} className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px]">
                {h.badge}
              </span>
              <h3 className="text-base font-bold text-gray-900 mt-3">{h.title}</h3>
              <p className="text-xs text-blue-600 font-semibold mt-1">{h.winner}</p>
              <p className="text-xs text-gray-500 mt-0.5">{h.event}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Academic Year 2025–26</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ExtraClassesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 bg-rose-50 text-rose-500 rounded-xl">
            <CalendarPlus className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Extra & Remedial Classes</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Targeted remedial coaching, advanced placement preparation, and doubt resolution clinics.
        </p>
      </div>

      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-gray-900 text-sm mb-4">Scheduled Extra Sessions</h3>
        <div className="p-4 rounded-xl bg-slate-50 border border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-600 uppercase">Physics Advanced</span>
            <p className="font-bold text-gray-900 text-sm mt-0.5">Thermodynamics & Heat Transfer Numericals</p>
            <p className="text-xs text-gray-500 mt-0.5">Prof. Alok Mukherjee • Room 201 / Online</p>
          </div>
          <span className="text-xs font-semibold bg-rose-100 text-rose-700 px-3 py-1 rounded-full">
            11:30 AM – 12:30 PM
          </span>
        </div>
      </div>
    </div>
  );
};

export const LearningMaterialsPage: React.FC = () => {
  const materials = [
    { title: 'Class 10 Mathematics NCERT Solutions & Formula Sheet', type: 'PDF Document', size: '4.8 MB', subject: 'Mathematics' },
    { title: 'Physics Class 12 Electrostatics Lecture Notes & Slides', type: 'PDF & Presentation', size: '12.2 MB', subject: 'Physics' },
    { title: 'English Grammar Comprehensive Practice Workbook', type: 'Workbook PDF', size: '2.1 MB', subject: 'English' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <FolderOpen className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Digital Learning Materials</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Course curriculum, syllabi, classroom presentation decks, and revision worksheets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((m, i) => (
          <div key={i} className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                {m.subject}
              </span>
              <h3 className="font-bold text-gray-900 text-sm mt-2">{m.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{m.type} • {m.size}</p>
            </div>
            <button
              onClick={() => alert(`Downloading ${m.title}...`)}
              className="mt-4 pt-3 border-t border-gray-100 w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#1769FF] hover:underline cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Study Resource</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnnouncementsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 bg-rose-50 text-rose-500 rounded-xl">
            <Megaphone className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">School Circulars & Announcements</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Administrative decrees, scheduled holidays, and official board directives.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
              Notice #CIR-2025/08
            </span>
            <span className="text-xs text-gray-400">2 hours ago</span>
          </div>
          <h3 className="text-base font-bold text-gray-900 mt-2">
            School Holiday on 5th September (Teachers' Day Observance)
          </h3>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
            The school will remain closed for regular classes on 5th September 2025 in observance of National Teachers' Day.
            A commemorative felicitation assembly will be held from 09:30 AM to 11:30 AM in the School Auditorium for faculty and student council representatives.
          </p>
        </div>
      </div>
    </div>
  );
};

export const DecisionBoardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <BarChart2 className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Administrative Decision Board</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Strategic metrics, school board proposals, curriculum approvals, and governance agenda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
          <h3 className="font-bold text-gray-900 text-sm">Curriculum Modernization Proposal (AI & Robotics)</h3>
          <p className="text-xs text-gray-600 mt-1">Status: Approved by 8 out of 9 Academic Committee Members</p>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-2 rounded-full w-[88%]" />
          </div>
        </div>

        <div className="bg-white border border-[#E8EDF4] rounded-2xl p-5 shadow-xs">
          <h3 className="font-bold text-gray-900 text-sm">Annual Sports Turf Resurfacing Tender</h3>
          <p className="text-xs text-gray-600 mt-1">Status: Reviewing Quotations • Target completion: Oct 2025</p>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-2 rounded-full w-[60%]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    text: string;
    dataSources?: string[];
    suggestedFollowups?: string[];
  }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [datasetStatus, setDatasetStatus] = useState<any>(null);
  const currentUser = schoolService.getCurrentUser();

  useEffect(() => {
    schoolService.fetchCurosSuggestedQuestions().then(data => {
      setSuggestedQuestions(data.questions);
      setMessages([
        {
          role: 'assistant',
          text: data.welcome_message,
          dataSources: ['school_database']
        }
      ]);
    }).catch(() => {});

    schoolService.fetchCurosDatasetStatus().then(setDatasetStatus).catch(() => {});
  }, [currentUser.role]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;
    if (!textToSend) setInput('');

    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }));
      const res = await schoolService.sendCurosMessage(text, history);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.response,
          dataSources: res.data_sources,
          suggestedFollowups: res.suggested_followups
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: err.message || 'Error querying the school database. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CUROS AI Assistant</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Role: {currentUser.role}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Database-grounded school ERP assistant with strict role-based access control and verification.
          </p>
        </div>

        {datasetStatus && datasetStatus.dataset_tables && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold">Dataset Verified:</span>
            <span>{datasetStatus.dataset_tables.students} students, {datasetStatus.dataset_tables.teachers} teachers</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#E8EDF4] rounded-2xl shadow-xs flex flex-col h-[580px] overflow-hidden">
        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar bg-slate-50/50">
          {/* Suggested question chips */}
          {suggestedQuestions.length > 0 && messages.length < 3 && (
            <div className="p-3 bg-white border border-indigo-100 rounded-xl shadow-2xs">
              <p className="text-xs font-semibold text-indigo-900 mb-2">Recommended Inquiries for Your Role:</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 border border-gray-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2.5 max-w-[85%]">
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white border border-gray-200/90 text-gray-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {m.text}
                  {m.dataSources && m.dataSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[10px] text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Verified source: {m.dataSources.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
              {m.suggestedFollowups && m.suggestedFollowups.length > 0 && (
                <div className="mt-2 ml-10 flex flex-wrap gap-1.5">
                  {m.suggestedFollowups.map((f, fIdx) => (
                    <button
                      key={fIdx}
                      onClick={() => handleSend(f)}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      👉 {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-gray-500">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-xs shadow-2xs flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-gray-500 ml-1">Consulting school database...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 sm:p-4 border-t border-gray-200 bg-white flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask CUROS AI about teachers, enrollments, attendance, fees, exams..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
