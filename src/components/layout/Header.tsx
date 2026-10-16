import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  X,
  Bot,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { schoolService } from '../../services/schoolService';
import { NotificationItem } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentUser, setCurrentUser] = useState(schoolService.getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(schoolService.getCurrentUser());
    };
    window.addEventListener('auth-user-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-user-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(schoolService.getNotifications());
  }, []);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    schoolService.markAllNotificationsRead();
    setNotifications(schoolService.getNotifications());
  };

  const handleSelectSearchItem = (path: string) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    navigate(path);
  };



  // Quick search results
  const allStudents = schoolService.getStudents();
  const allTeachers = schoolService.getTeachers();
  const allEvents = schoolService.getEvents();

  const filteredStudents = searchQuery.trim()
    ? allStudents.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredTeachers = searchQuery.trim()
    ? allTeachers.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredEvents = searchQuery.trim()
    ? allEvents.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const hasSearchResults =
    filteredStudents.length > 0 || filteredTeachers.length > 0 || filteredEvents.length > 0;

  return (
    <header className="h-[68px] bg-white border-b border-[#E8EDF4] px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Brand & Hamburger */}
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-2 text-[#475467] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>

        <div
          onClick={() => {
            if (currentUser.role === 'TEACHER') navigate('/teacher-dashboard');
            else if (currentUser.role === 'STUDENT') navigate('/student-dashboard');
            else if (currentUser.role === 'PARENT') navigate('/parent-dashboard');
            else navigate('/dashboard');
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#1769FF] group-hover:bg-[#1769FF] group-hover:text-white transition-all">
            <GraduationCap className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="text-[17px] font-bold text-[#101828] leading-tight tracking-tight flex items-center gap-1.5">
              <span>Smart School</span>
            </div>
            <div className="text-[11.5px] font-normal text-[#667085] leading-tight">
              Management System
            </div>
          </div>
        </div>
      </div>

      {/* Center: Search Field */}
      <div ref={searchRef} className="hidden md:block flex-1 max-w-[480px] mx-6 relative">
        <div className="bg-[#F8FAFC] border border-[#E8EDF4] rounded-xl flex items-center px-3.5 py-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-[#98A2B3] mr-2.5 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search students, teachers, classes, events..."
            className="w-full text-[13.5px] text-[#101828] placeholder-[#98A2B3] bg-transparent outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#98A2B3] hover:text-[#475467] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Popup */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50 max-h-80 overflow-y-auto">
            {hasSearchResults ? (
              <div className="space-y-3">
                {filteredStudents.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2">
                      Students
                    </span>
                    {filteredStudents.slice(0, 3).map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleSelectSearchItem('/students')}
                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-gray-800">{st.name}</span>
                        <span className="text-gray-500">{st.class} • {st.rollNumber}</span>
                      </div>
                    ))}
                  </div>
                )}
                {filteredTeachers.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2">
                      Teachers
                    </span>
                    {filteredTeachers.slice(0, 3).map((tch) => (
                      <div
                        key={tch.id}
                        onClick={() => handleSelectSearchItem('/teachers')}
                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-gray-800">{tch.name}</span>
                        <span className="text-gray-500">{tch.subject}</span>
                      </div>
                    ))}
                  </div>
                )}
                {filteredEvents.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2">
                      Events
                    </span>
                    {filteredEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => handleSelectSearchItem('/events')}
                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-gray-800">{ev.title}</span>
                        <span className="text-gray-500">{ev.dateStr}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-gray-500">
                No students, teachers, or events match "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications & User profile */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* CUROS AI Assistant Quick Trigger */}
        <button
          onClick={() => window.dispatchEvent(new Event('open-curos-ai'))}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
          title="Open CUROS AI (or click floating button at bottom-right)"
        >
          <Bot className="w-4 h-4 text-indigo-600" />
          <span>CUROS AI</span>
          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
        </button>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="View notifications"
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-[#344054] transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="bg-red-50 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-[#1769FF] font-medium hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto py-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      schoolService.markNotificationAsRead(n.id);
                      setNotifications(schoolService.getNotifications());
                      setIsNotifOpen(false);
                      navigate('/notifications');
                    }}
                    className={`py-2.5 px-2 flex items-start gap-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors ${
                      n.isUnread ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${n.iconBg} ${n.iconColor}`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{n.title}</p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{n.description}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">{n.timestamp}</span>
                    </div>
                    {n.isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#1769FF] flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/notifications');
                  }}
                  className="text-xs font-semibold text-[#1769FF] hover:underline cursor-pointer"
                >
                  Go to Notification Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-[#E8EDF4] mx-1 hidden sm:block" />

        {/* User profile button */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none"
          >
            {/* User Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 ring-2 ring-blue-50 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
                <circle cx="50" cy="40" r="22" fill="#D97706" opacity="0.3" />
                <circle cx="50" cy="38" r="20" fill="#FBBF24" opacity="0.4" />
                <path d="M30 35C30 20 40 16 50 16C60 16 70 20 70 35C70 28 62 22 50 22C38 22 30 28 30 35Z" fill="#1E293B" />
                <path d="M18 95C22 72 35 66 50 66C65 66 78 72 82 95Z" fill="#0F172A" />
                <polygon points="50,66 42,78 58,78" fill="#F8FAFC" />
              </svg>
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-[13.5px] font-bold text-[#101828] leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[11.5px] font-normal text-[#667085] leading-tight">
                {currentUser.role === 'ADMIN'
                  ? 'Administrator'
                  : currentUser.role === 'TEACHER'
                  ? 'Faculty Teacher'
                  : currentUser.role === 'STUDENT'
                  ? 'Student'
                  : 'Parent / Guardian'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#667085] hidden lg:block stroke-[2]" />
          </button>

          {/* User Profile Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">{currentUser.name}</p>
                <p className="text-[11px] text-gray-500">{currentUser.email}</p>
                <span className="mt-1.5 inline-block text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                  Role: {currentUser.role}
                </span>
              </div>
              <div className="py-1 text-xs">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (currentUser.role === 'TEACHER') navigate('/teacher-dashboard');
                    else if (currentUser.role === 'STUDENT') navigate('/student-dashboard');
                    else if (currentUser.role === 'PARENT') navigate('/parent-dashboard');
                    else navigate('/dashboard');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  My Dashboard
                </button>
                {currentUser.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/audit-logs');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                    Security & Audit Trail
                  </button>
                )}

              </div>

              <div className="pt-1 border-t border-gray-100 text-xs">
                <button
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await schoolService.logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
