/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { StudentSignupPage } from './pages/StudentSignupPage';
import { ParentSignupPage } from './pages/ParentSignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { ParentDashboardPage } from './pages/ParentDashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { ClassesPage } from './pages/ClassesPage';
import { AttendancePage } from './pages/AttendancePage';
import { FeesPage } from './pages/FeesPage';
import { ExamsPage } from './pages/ExamsPage';
import { PYQsPage } from './pages/PYQsPage';
import { OnlineClassesPage } from './pages/OnlineClassesPage';
import { EventsPage } from './pages/EventsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { LeavesPage } from './pages/LeavesPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import {
  ServiceRequestsPage,
  AchievementsPage,
  ExtraClassesPage,
  LearningMaterialsPage,
  AnnouncementsPage,
  DecisionBoardPage,
  AIAssistantPage
} from './pages/OtherModulePages';
import { CurosFloatingChatbot } from './components/curos/CurosFloatingChatbot';
import { schoolService } from './services/schoolService';
import { UserRole } from './types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface RoleRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactElement;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const [currentUser, setCurrentUser] = useState(schoolService.getCurrentUser());
  const [isAuth, setIsAuth] = useState(schoolService.isAuthenticated());
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(schoolService.getCurrentUser());
      setIsAuth(schoolService.isAuthenticated());
    };
    window.addEventListener('auth-user-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-user-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="bg-white border border-[#E8EDF4] rounded-2xl p-10 max-w-lg mx-auto my-12 text-center shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Your authenticated role (<strong className="text-gray-800">{currentUser.role}</strong>) does not have authorization to view this module.
          </p>
        </div>
        <button
          onClick={() => {
            if (currentUser.role === 'TEACHER') navigate('/teacher-dashboard');
            else if (currentUser.role === 'STUDENT') navigate('/student-dashboard');
            else if (currentUser.role === 'PARENT') navigate('/parent-dashboard');
            else navigate('/dashboard');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1769FF] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to My Dashboard</span>
        </button>
      </div>
    );
  }

  return children;
};

const RootRedirect: React.FC = () => {
  const isAuth = schoolService.isAuthenticated();
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  const user = schoolService.getCurrentUser();
  if (user.role === 'TEACHER') return <Navigate to="/teacher-dashboard" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student-dashboard" replace />;
  if (user.role === 'PARENT') return <Navigate to="/parent-dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

const ProtectedLayout: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(schoolService.isAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(schoolService.isAuthenticated());
    };
    window.addEventListener('auth-user-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-user-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Public Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup-student" element={<StudentSignupPage />} />
        <Route path="/signup-parent" element={<ParentSignupPage />} />

        {/* Protected App Layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<RootRedirect />} />

          {/* Role specific dashboards */}
          <Route
            path="/dashboard"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <DashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher-dashboard"
            element={
              <RoleRoute allowedRoles={['TEACHER', 'ADMIN']}>
                <TeacherDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/student-dashboard"
            element={
              <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                <StudentDashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/parent-dashboard"
            element={
              <RoleRoute allowedRoles={['PARENT', 'ADMIN']}>
                <ParentDashboardPage />
              </RoleRoute>
            }
          />

          {/* Module Pages with role restrictions */}
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          
          {/* Fees: Strictly denied to Teachers */}
          <Route
            path="/fees"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'STUDENT', 'PARENT']}>
                <FeesPage />
              </RoleRoute>
            }
          />

          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/pyqs" element={<PYQsPage />} />
          <Route path="/online-classes" element={<OnlineClassesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/leaves" element={<LeavesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />

          {/* Audit Logs: Admin Only */}
          <Route
            path="/audit-logs"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AuditLogsPage />
              </RoleRoute>
            }
          />

          <Route path="/service-requests" element={<ServiceRequestsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/extra-classes" element={<ExtraClassesPage />} />
          <Route path="/learning-materials" element={<LearningMaterialsPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />

          {/* Decision Board: Admin Only */}
          <Route
            path="/decision-board"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <DecisionBoardPage />
              </RoleRoute>
            }
          />

          <Route path="/ai-assistant" element={<AIAssistantPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>

      {/* Global CUROS AI Floating Bot on EVERY screen */}
      <CurosFloatingChatbot />
    </BrowserRouter>
  );
}
