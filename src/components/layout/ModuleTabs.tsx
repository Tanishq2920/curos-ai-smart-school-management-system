import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Users,
  UserRound,
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileText,
  Files,
  Video,
  Star,
  MessageSquare,
  Bell,
  MoreHorizontal,
  Wrench,
  Trophy,
  CalendarPlus,
  FolderOpen,
  Megaphone,
  BarChart2,
  Sparkles,
  Calendar,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { schoolService } from '../../services/schoolService';
import { User, UserRole } from '../../types';

interface TabItem {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

interface MoreItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

export const ModuleTabs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User>(schoolService.getCurrentUser());
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getRoleNavigation = (role: UserRole): { tabs: TabItem[]; moreItems: MoreItem[] } => {
    if (role === 'TEACHER') {
      return {
        tabs: [
          { id: 'teacher-dash', name: 'Dashboard', path: '/teacher-dashboard', icon: Home, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#1769FF]' },
          { id: 'classes', name: 'My Classes', path: '/classes', icon: BookOpen, iconBg: 'bg-[#FFFBEB]', iconColor: 'text-[#F59E0B]' },
          { id: 'students', name: 'My Students', path: '/students', icon: Users, iconBg: 'bg-[#ECFDF5]', iconColor: 'text-[#10B981]' },
          { id: 'attendance', name: 'Attendance', path: '/attendance', icon: CalendarCheck, iconBg: 'bg-[#FFF1F2]', iconColor: 'text-[#F43F5E]' },
          { id: 'assignments', name: 'Assignments', path: '/assignments', icon: FileText, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#3B82F6]' },
          { id: 'exams', name: 'Exams & Marks', path: '/exams', icon: Award, iconBg: 'bg-[#FAF5FF]', iconColor: 'text-[#8B5CF6]' },
          { id: 'complaints', name: 'Assigned Complaints', path: '/complaints', icon: MessageSquare, iconBg: 'bg-[#FFF1F2]', iconColor: 'text-[#F43F5E]' },
          { id: 'learning-materials', name: 'Materials', path: '/learning-materials', icon: FolderOpen, iconBg: 'bg-[#F0FDF4]', iconColor: 'text-[#16A34A]' },
          { id: 'meetings', name: 'Parent Meetings', path: '/meetings', icon: Calendar, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#2563EB]' },
          { id: 'leaves', name: 'Leave Requests', path: '/leaves', icon: CalendarPlus, iconBg: 'bg-[#FDF2F8]', iconColor: 'text-[#DB2777]' },
          { id: 'notifications', name: 'Notifications', path: '/notifications', icon: Bell, iconBg: 'bg-[#F0F9FF]', iconColor: 'text-[#0EA5E9]' }
        ],
        moreItems: [
          { name: 'Extra Classes', path: '/extra-classes', icon: CalendarPlus },
          { name: 'Announcements', path: '/announcements', icon: Megaphone },
          { name: 'School Events', path: '/events', icon: Star },
          { name: 'Online Classes', path: '/online-classes', icon: Video },
          { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles }
        ]
      };
    }

    if (role === 'STUDENT') {
      return {
        tabs: [
          { id: 'student-dash', name: 'Dashboard', path: '/student-dashboard', icon: Home, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#1769FF]' },
          { id: 'classes', name: 'My Timetable', path: '/classes', icon: BookOpen, iconBg: 'bg-[#FFFBEB]', iconColor: 'text-[#F59E0B]' },
          { id: 'attendance', name: 'My Attendance', path: '/attendance', icon: CalendarCheck, iconBg: 'bg-[#FFF1F2]', iconColor: 'text-[#F43F5E]' },
          { id: 'assignments', name: 'My Homework', path: '/assignments', icon: FileText, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#3B82F6]' },
          { id: 'exams', name: 'Exams & Results', path: '/exams', icon: Award, iconBg: 'bg-[#FAF5FF]', iconColor: 'text-[#8B5CF6]' },
          { id: 'fees', name: 'My Fees', path: '/fees', icon: CreditCard, iconBg: 'bg-[#ECFDF5]', iconColor: 'text-[#10B981]' },
          { id: 'learning-materials', name: 'Study Materials', path: '/learning-materials', icon: FolderOpen, iconBg: 'bg-[#F0FDF4]', iconColor: 'text-[#16A34A]' },
          { id: 'pyqs', name: 'PYQ Library', path: '/pyqs', icon: Files, iconBg: 'bg-[#FAF5FF]', iconColor: 'text-[#A855F7]' },
          { id: 'online-classes', name: 'Online Classes', path: '/online-classes', icon: Video, iconBg: 'bg-[#FDF2F8]', iconColor: 'text-[#EC4899]' },
          { id: 'events', name: 'School Events', path: '/events', icon: Star, iconBg: 'bg-[#FFFBEB]', iconColor: 'text-[#F59E0B]' },
          { id: 'complaints', name: 'My Complaints', path: '/complaints', icon: MessageSquare, iconBg: 'bg-[#FFF1F2]', iconColor: 'text-[#F43F5E]' },
          { id: 'notifications', name: 'Notifications', path: '/notifications', icon: Bell, iconBg: 'bg-[#F0F9FF]', iconColor: 'text-[#0EA5E9]' }
        ],
        moreItems: [
          { name: 'Teacher Meetings', path: '/meetings', icon: Calendar },
          { name: 'Leave Application', path: '/leaves', icon: CalendarPlus },
          { name: 'Announcements', path: '/announcements', icon: Megaphone },
          { name: 'Achievements', path: '/achievements', icon: Trophy },
          { name: 'AI Study Assistant', path: '/ai-assistant', icon: Sparkles }
        ]
      };
    }

    if (role === 'PARENT') {
      return {
        tabs: [
          { id: 'parent-dash', name: 'Dashboard', path: '/parent-dashboard', icon: Home, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#1769FF]' },
          { id: 'attendance', name: 'Child Attendance', path: '/attendance', icon: CalendarCheck, iconBg: 'bg-[#FFF1F2]', iconColor: 'text-[#F43F5E]' },
          { id: 'assignments', name: 'Homework Status', path: '/assignments', icon: FileText, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#3B82F6]' },
          { id: 'exams', name: 'Exams & Reports', path: '/exams', icon: Award, iconBg: 'bg-[#FAF5FF]', iconColor: 'text-[#8B5CF6]' },
          { id: 'fees', name: 'Child Fees', path: '/fees', icon: CreditCard, iconBg: 'bg-[#ECFDF5]', iconColor: 'text-[#10B981]' },
          { id: 'meetings', name: 'Book Staff Meeting', path: '/meetings', icon: Calendar, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#2563EB]' },
          { id: 'complaints', name: 'My Complaints', path: '/complaints', icon: MessageSquare, iconBg: 'bg-[#FFF1F2]', iconColor: 'text-[#F43F5E]' },
          { id: 'announcements', name: 'Announcements', path: '/announcements', icon: Megaphone, iconBg: 'bg-[#FFFBEB]', iconColor: 'text-[#D97706]' },
          { id: 'events', name: 'School Events', path: '/events', icon: Star, iconBg: 'bg-[#FEF3C7]', iconColor: 'text-[#F59E0B]' },
          { id: 'notifications', name: 'Notifications', path: '/notifications', icon: Bell, iconBg: 'bg-[#F0F9FF]', iconColor: 'text-[#0EA5E9]' }
        ],
        moreItems: [
          { name: 'Leave Application', path: '/leaves', icon: CalendarPlus },
          { name: 'Service Requests', path: '/service-requests', icon: Wrench },
          { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles }
        ]
      };
    }

    // Default ADMIN navigation
    return {
      tabs: [
        { id: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: Home, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#1769FF]' },
        { id: 'students', name: 'Students', path: '/students', icon: Users, iconBg: 'bg-[#ECFDF5]', iconColor: 'text-[#10B981]' },
        { id: 'teachers', name: 'Teachers', path: '/teachers', icon: UserRound, iconBg: 'bg-[#F5F3FF]', iconColor: 'text-[#8B5CF6]' },
        { id: 'classes', name: 'Classes', path: '/classes', icon: BookOpen, iconBg: 'bg-[#FFFBEB]', iconColor: 'text-[#F59E0B]' },
        { id: 'attendance', name: 'Attendance', path: '/attendance', icon: CalendarCheck, iconBg: 'bg-[#FFF1F2]', iconColor: 'text-[#F43F5E]' },
        { id: 'fees', name: 'Fees', path: '/fees', icon: CreditCard, iconBg: 'bg-[#ECFDF5]', iconColor: 'text-[#10B981]' },
        { id: 'exams', name: 'Exams', path: '/exams', icon: FileText, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#3B82F6]' },
        { id: 'complaints', name: 'Complaints', path: '/complaints', icon: MessageSquare, iconBg: 'bg-[#FFF1F2]', iconColor: 'text-[#F43F5E]' },
        { id: 'announcements', name: 'Announcements', path: '/announcements', icon: Megaphone, iconBg: 'bg-[#FFFBEB]', iconColor: 'text-[#D97706]' },
        { id: 'events', name: 'Events', path: '/events', icon: Star, iconBg: 'bg-[#FEF3C7]', iconColor: 'text-[#F59E0B]' },
        { id: 'meetings', name: 'Meetings', path: '/meetings', icon: Calendar, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#2563EB]' },
        { id: 'notifications', name: 'Notifications', path: '/notifications', icon: Bell, iconBg: 'bg-[#F0F9FF]', iconColor: 'text-[#0EA5E9]' }
      ],
      moreItems: [
        { name: 'Audit Trail', path: '/audit-logs', icon: ShieldCheck },
        { name: 'Staff Leaves', path: '/leaves', icon: CalendarPlus },
        { name: 'Assignments Hub', path: '/assignments', icon: FileText },
        { name: 'Service Requests', path: '/service-requests', icon: Wrench },
        { name: 'Achievements', path: '/achievements', icon: Trophy },
        { name: 'Extra Classes', path: '/extra-classes', icon: CalendarPlus },
        { name: 'Learning Materials', path: '/learning-materials', icon: FolderOpen },
        { name: 'PYQ Library', path: '/pyqs', icon: Files },
        { name: 'Online Classes', path: '/online-classes', icon: Video },
        { name: 'Decision Board', path: '/decision-board', icon: BarChart2 },
        { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles }
      ]
    };
  };

  const { tabs, moreItems } = getRoleNavigation(currentUser.role);

  const isTabActive = (path: string) => {
    if (path.includes('dashboard')) {
      return location.pathname === '/' || location.pathname.includes('dashboard');
    }
    return location.pathname.startsWith(path);
  };

  const handleTabNavigate = (path: string) => {
    navigate(path);
  };

  const isMoreActive = moreItems.some((item) => location.pathname.startsWith(item.path));

  return (
    <div className="bg-white border-b border-[#E8EDF4] px-4 md:px-6 sticky top-[68px] z-20 shadow-xs">
      <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const active = isTabActive(tab.path);
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabNavigate(tab.path)}
              className="flex flex-col items-center justify-center py-2.5 px-2.5 sm:px-3 md:px-3.5 min-w-[68px] sm:min-w-[76px] relative group cursor-pointer transition-all select-none flex-shrink-0"
              title={tab.name}
            >
              {/* Icon Tile */}
              <div
                className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                  tab.iconBg
                } ${tab.iconColor}`}
              >
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              {/* Label */}
              <span
                className={`text-[12px] whitespace-nowrap transition-colors tracking-tight ${
                  active
                    ? 'font-semibold text-[#1769FF]'
                    : 'font-medium text-[#475467] group-hover:text-[#101828]'
                }`}
              >
                {tab.name}
              </span>
              {/* Active Bottom Underline Indicator */}
              {active && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#1769FF] rounded-t-full" />
              )}
            </button>
          );
        })}

        {/* More Tab with Dropdown */}
        {moreItems.length > 0 && (
          <div ref={moreRef} className="relative flex-shrink-0">
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="flex flex-col items-center justify-center py-2.5 px-2.5 sm:px-3 md:px-3.5 min-w-[68px] sm:min-w-[76px] relative group cursor-pointer transition-all select-none"
              title="More modules"
            >
              <div className="w-[44px] h-[44px] rounded-xl bg-[#F3F4F6] text-[#6B7280] flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105">
                <MoreHorizontal className="w-5 h-5 stroke-[2]" />
              </div>
              <span
                className={`text-[12px] whitespace-nowrap tracking-tight ${
                  isMoreActive
                    ? 'font-semibold text-[#1769FF]'
                    : 'font-medium text-[#475467] group-hover:text-[#101828]'
                }`}
              >
                More
              </span>
              {isMoreActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#1769FF] rounded-t-full" />
              )}
            </button>

            {/* More Menu Dropdown */}
            {isMoreOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Additional Modules</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                    {currentUser.role}
                  </span>
                </div>
                <div className="space-y-0.5 max-h-72 overflow-y-auto">
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname.startsWith(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          setIsMoreOpen(false);
                          navigate(item.path);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                          active
                            ? 'bg-[#EFF6FF] text-[#1769FF]'
                            : 'text-gray-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'text-[#1769FF]' : 'text-gray-500'}`} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
