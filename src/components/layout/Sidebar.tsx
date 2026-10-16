import React from 'react';
import {
  Home,
  Users,
  UserRound,
  BookOpen,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Wrench,
  Star,
  Trophy,
  FileText,
  Files,
  Video,
  CalendarPlus,
  FolderOpen,
  Bell,
  Megaphone,
  BarChart2,
  Sparkles,
  Calendar,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { schoolService } from '../../services/schoolService';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState(schoolService.getCurrentUser());

  React.useEffect(() => {
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

  const getRoleSections = (): NavSection[] => {
    if (currentUser.role === 'TEACHER') {
      return [
        {
          items: [{ name: 'Faculty Dashboard', path: '/teacher-dashboard', icon: Home }]
        },
        {
          title: 'My Teaching',
          items: [
            { name: 'My Classes', path: '/classes', icon: BookOpen },
            { name: 'My Students', path: '/students', icon: Users },
            { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
            { name: 'Assignments', path: '/assignments', icon: FileText },
            { name: 'Exams & Marks', path: '/exams', icon: Award }
          ]
        },
        {
          title: 'Student & Parent Care',
          items: [
            { name: 'Assigned Complaints', path: '/complaints', icon: MessageSquare },
            { name: 'Parent Meetings', path: '/meetings', icon: Calendar },
            { name: 'Leave Requests', path: '/leaves', icon: CalendarPlus },
            { name: 'Announcements', path: '/announcements', icon: Megaphone },
            { name: 'Notifications', path: '/notifications', icon: Bell }
          ]
        }
      ];
    }

    if (currentUser.role === 'STUDENT') {
      return [
        {
          items: [{ name: 'Student Dashboard', path: '/student-dashboard', icon: Home }]
        },
        {
          title: 'My Academics',
          items: [
            { name: 'My Homework', path: '/assignments', icon: FileText },
            { name: 'My Results', path: '/exams', icon: Award },
            { name: 'Class Timetable', path: '/classes', icon: BookOpen },
            { name: 'PYQ Library', path: '/pyqs', icon: Files },
            { name: 'Online Classes', path: '/online-classes', icon: Video },
            { name: 'Study Materials', path: '/learning-materials', icon: FolderOpen }
          ]
        },
        {
          title: 'Student Services',
          items: [
            { name: 'My Attendance', path: '/attendance', icon: CalendarCheck },
            { name: 'Submit Grievance', path: '/complaints', icon: MessageSquare },
            { name: 'Meeting Requests', path: '/meetings', icon: Calendar },
            { name: 'Apply Leave', path: '/leaves', icon: CalendarPlus },
            { name: 'School Events', path: '/events', icon: Star },
            { name: 'My Fee Account', path: '/fees', icon: CreditCard },
            { name: 'Notifications', path: '/notifications', icon: Bell }
          ]
        }
      ];
    }

    if (currentUser.role === 'PARENT') {
      return [
        {
          items: [{ name: 'Parent Dashboard', path: '/parent-dashboard', icon: Home }]
        },
        {
          title: 'Child Progress',
          items: [
            { name: 'Child Attendance', path: '/attendance', icon: CalendarCheck },
            { name: 'Exams & Reports', path: '/exams', icon: Award },
            { name: 'Homework Status', path: '/assignments', icon: FileText },
            { name: 'Class Timetable', path: '/classes', icon: BookOpen },
            { name: 'Child Fee Account', path: '/fees', icon: CreditCard }
          ]
        },
        {
          title: 'Family & Staff Connect',
          items: [
            { name: 'Book Principal Meeting', path: '/meetings', icon: Calendar },
            { name: 'Apply Leave', path: '/leaves', icon: CalendarPlus },
            { name: 'Grievance Desk', path: '/complaints', icon: MessageSquare },
            { name: 'Circulars', path: '/announcements', icon: Megaphone },
            { name: 'Campus Events', path: '/events', icon: Star },
            { name: 'Notifications', path: '/notifications', icon: Bell }
          ]
        }
      ];
    }

    // Default: ADMIN
    return [
      {
        items: [{ name: 'School Overview', path: '/dashboard', icon: Home }]
      },
      {
        title: 'Administration',
        items: [
          { name: 'Students Directory', path: '/students', icon: Users },
          { name: 'Teachers & Faculty', path: '/teachers', icon: UserRound },
          { name: 'Classes & Sections', path: '/classes', icon: BookOpen },
          { name: 'Attendance Oversight', path: '/attendance', icon: CalendarCheck },
          { name: 'Fee Collection', path: '/fees', icon: CreditCard },
          { name: 'Meeting Requests', path: '/meetings', icon: Calendar },
          { name: 'Leave Applications', path: '/leaves', icon: CalendarPlus },
          { name: 'Security Audit Trail', path: '/audit-logs', icon: ShieldCheck }
        ]
      },
      {
        title: 'Student Services',
        items: [
          { name: 'Complaints & Helpdesk', path: '/complaints', icon: MessageSquare },
          { name: 'Service Requests', path: '/service-requests', icon: Wrench },
          { name: 'Events & Calendar', path: '/events', icon: Star },
          { name: 'Achievements', path: '/achievements', icon: Trophy }
        ]
      },
      {
        title: 'Academics',
        items: [
          { name: 'Exams & Results', path: '/exams', icon: FileText },
          { name: 'Assignments Hub', path: '/assignments', icon: FileText },
          { name: 'PYQ Library', path: '/pyqs', icon: Files },
          { name: 'Online Classes', path: '/online-classes', icon: Video },
          { name: 'Extra Classes', path: '/extra-classes', icon: CalendarPlus },
          { name: 'Learning Materials', path: '/learning-materials', icon: FolderOpen }
        ]
      },
      {
        title: 'Communication',
        items: [
          { name: 'Notification Center', path: '/notifications', icon: Bell },
          { name: 'Announcements', path: '/announcements', icon: Megaphone },
          { name: 'Decision Board', path: '/decision-board', icon: BarChart2 },
          { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles }
        ]
      }
    ];
  };

  const navSections = getRoleSections();

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isActive = (path: string) => {
    if (path.includes('dashboard')) {
      return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/25 z-30 lg:hidden backdrop-blur-2xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-[68px] bottom-0 left-0 z-30 bg-white border-r border-[#E8EDF4] flex flex-col transition-all duration-200 overflow-hidden ${
          isOpen ? 'w-[248px] translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0'
        }`}
        style={{ height: 'calc(100vh - 68px)' }}
      >
        <div className="flex-1 overflow-y-auto px-3.5 py-3 custom-scrollbar w-[248px]">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="mb-4">
              {section.title && (
                <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3.5 h-[42px] rounded-xl text-[13.5px] font-medium transition-colors cursor-pointer select-none ${
                        active
                          ? 'bg-[#EFF6FF] text-[#1769FF]'
                          : 'text-[#344054] hover:bg-slate-50 hover:text-[#101828]'
                      }`}
                    >
                      <Icon
                        className={`w-[19px] h-[19px] stroke-[1.8] flex-shrink-0 ${
                          active ? 'text-[#1769FF]' : 'text-[#667085]'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};
