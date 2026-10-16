import {
  DashboardMetrics,
  SchoolEvent,
  ScheduleItem,
  NotificationItem,
  Student,
  Teacher,
  SchoolClass,
  Complaint,
  PYQItem,
  FeeRecord,
  User,
  UserRole,
  Meeting,
  LeaveApplication,
  Assignment,
  Submission,
  ExamResult,
  AuditLog
} from '../types';
import {
  initialDashboardMetrics,
  initialEvents,
  initialSchedule,
  initialNotifications,
  initialStudents,
  initialTeachers,
  initialClasses,
  initialComplaints,
  initialPYQs,
  initialFeeRecords
} from '../data/mockData';

const TOKEN_KEY = 'smart_school_token_v1';
const USER_KEY = 'smart_school_user_v1';

export const defaultGuestUser: User = {
  id: '',
  username: '',
  email: '',
  name: 'Guest User',
  role: 'STUDENT'
};

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return {};
  return { 'Authorization': `Bearer ${token}` };
}

export const schoolService = {
  // Authentication
  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    return Boolean(token && user);
  },

  getCurrentUser(): User {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultGuestUser;
  },

  setCurrentUser(user: User, token?: string) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    window.dispatchEvent(new Event('auth-user-changed'));
  },

  async login(username: string, password: string, role?: UserRole): Promise<{ user: User; token: string }> {
    try {
      const payload: { username: string; password: string; role?: UserRole } = { username, password };
      if (role) {
        payload.role = role;
      }
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok) {
        if (contentType.includes('application/json')) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Login failed. Please check credentials.');
        }
        throw new Error(`Login failed with status ${res.status}`);
      }
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      const data = await res.json();
      this.setCurrentUser(data.user, data.token);
      return data;
    } catch (err: any) {
      console.warn('API login request:', err.message);
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('auth-user-changed'));
  },

  async registerStudent(formData: any): Promise<any> {
    const res = await fetch('/api/auth/register-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    this.setCurrentUser(data.user, data.token);
    return data;
  },

  async registerParent(formData: any): Promise<any> {
    const res = await fetch('/api/auth/register-parent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    this.setCurrentUser(data.user, data.token);
    return data;
  },

  // Role Dashboards
  async fetchTeacherDashboard(): Promise<any> {
    try {
      const res = await fetch('/api/dashboard/teacher', {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) return await res.json();
    } catch {}
    return {
      teacher: { name: 'Amit Sharma', subject: 'Mathematics' },
      assignedClasses: ['10-A', '9-B'],
      todaySchedule: [],
      myStudents: initialStudents.slice(0, 10),
      pendingLeaves: [],
      recentExams: []
    };
  },

  async fetchStudentDashboard(studentId?: string): Promise<any> {
    try {
      const url = studentId ? `/api/dashboard/student?studentId=${studentId}` : '/api/dashboard/student';
      const res = await fetch(url, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) return await res.json();
    } catch {}
    return {
      student: initialStudents[0],
      attendancePercent: 92,
      todaySchedule: [],
      pendingAssignments: [],
      examResults: [],
      feeStatus: { totalFees: 45000, paidAmount: 45000, dueAmount: 0 }
    };
  },

  async fetchParentDashboard(childId?: string): Promise<any> {
    try {
      const url = childId ? `/api/dashboard/parent?childId=${childId}` : '/api/dashboard/parent';
      const res = await fetch(url, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) return await res.json();
    } catch {}
    return {
      children: [initialStudents[0]],
      selectedChild: initialStudents[0],
      attendanceSummary: { overallPercent: 92, presentCount: 46, absentCount: 4 },
      feesSummary: { totalFees: 45000, paidAmount: 45000, dueAmount: 0 },
      recentResults: [],
      upcomingMeetings: []
    };
  },

  // Metrics
  getMetrics(): DashboardMetrics {
    return initialDashboardMetrics;
  },

  async fetchMetrics(): Promise<DashboardMetrics> {
    try {
      const res = await fetch('/api/metrics', { headers: { ...getAuthHeader() } });
      if (res.ok) return await res.json();
    } catch {}
    return this.getMetrics();
  },

  // Events
  getEvents(): SchoolEvent[] {
    return initialEvents;
  },

  async fetchEvents(): Promise<SchoolEvent[]> {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return this.getEvents();
  },

  async addEvent(event: Omit<SchoolEvent, 'id' | 'registeredCount'>): Promise<SchoolEvent> {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(event)
      });
      if (res.ok) return await res.json();
    } catch {}
    return { ...event, id: `ev-${Date.now()}`, registeredCount: 0 };
  },

  // Schedule
  getSchedule(): ScheduleItem[] {
    return initialSchedule;
  },

  async fetchSchedule(): Promise<ScheduleItem[]> {
    try {
      const res = await fetch('/api/schedule', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return this.getSchedule();
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    return initialNotifications;
  },

  async fetchNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch('/api/notifications', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return this.getNotifications();
  },

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST', headers: { ...getAuthHeader() } });
    } catch {}
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST', headers: { ...getAuthHeader() } });
    } catch {}
  },

  // Students
  getStudents(): Student[] {
    return initialStudents;
  },

  async fetchStudents(): Promise<Student[]> {
    try {
      const res = await fetch('/api/students', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return this.getStudents();
  },

  async addStudent(studentData: Omit<Student, 'id'>): Promise<Student> {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(studentData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add student');
    }
    return await res.json();
  },

  // Teachers
  getTeachers(): Teacher[] {
    return initialTeachers;
  },

  async fetchTeachers(): Promise<Teacher[]> {
    try {
      const res = await fetch('/api/teachers', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return this.getTeachers();
  },

  async addTeacher(teacherData: Omit<Teacher, 'id'>): Promise<Teacher> {
    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(teacherData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add teacher');
    }
    return await res.json();
  },

  // Classes
  getClasses(): SchoolClass[] {
    return initialClasses;
  },

  async fetchClasses(): Promise<SchoolClass[]> {
    try {
      const res = await fetch('/api/classes', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return this.getClasses();
  },

  // Complaints
  getComplaints(): Complaint[] {
    return initialComplaints;
  },

  async fetchComplaints(): Promise<Complaint[]> {
    try {
      const res = await fetch('/api/complaints', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return this.getComplaints();
  },

  async createComplaint(complaintData: any): Promise<Complaint> {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(complaintData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit complaint');
    }
    return await res.json();
  },

  async addComplaint(complaintData: any): Promise<Complaint> {
    return this.createComplaint(complaintData);
  },

  async updateComplaintStatus(id: string, status: string, notes?: string): Promise<void> {
    const res = await fetch(`/api/complaints/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, decisionNotes: notes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update complaint');
    }
  },

  // Parent Meetings
  async fetchMeetings(): Promise<Meeting[]> {
    try {
      const res = await fetch('/api/meetings', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return [];
  },

  async createMeeting(meetingData: any): Promise<Meeting> {
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(meetingData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to schedule meeting');
    }
    return await res.json();
  },

  async updateMeetingStatus(id: string, status: string, notes?: string): Promise<void> {
    const res = await fetch(`/api/meetings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, decisionNotes: notes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update meeting');
    }
  },

  // Leave Applications
  async fetchLeaves(): Promise<LeaveApplication[]> {
    try {
      const res = await fetch('/api/leaves', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return [];
  },

  async createLeave(leaveData: any): Promise<LeaveApplication> {
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(leaveData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit leave');
    }
    return await res.json();
  },

  async updateLeaveStatus(id: string, status: string, notes?: string): Promise<void> {
    const res = await fetch(`/api/leaves/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status, decisionNotes: notes })
    });
    if (!res.ok) throw new Error('Failed to update leave');
  },

  // Assignments
  async fetchAssignments(): Promise<Assignment[]> {
    try {
      const res = await fetch('/api/assignments', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return [];
  },

  async createAssignment(assignmentData: any): Promise<Assignment> {
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(assignmentData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create assignment');
    }
    return await res.json();
  },

  async submitAssignment(assignmentId: string, content: string): Promise<any> {
    const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ content })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit assignment');
    }
    return await res.json();
  },

  async gradeSubmission(submissionId: string, marks: number, feedback: string): Promise<any> {
    const res = await fetch(`/api/submissions/${submissionId}/grade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ marksAwarded: marks, feedback })
    });
    if (!res.ok) throw new Error('Failed to grade submission');
    return await res.json();
  },

  // Exam Results
  async fetchExamResults(): Promise<ExamResult[]> {
    try {
      const res = await fetch('/api/exams/results', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return [];
  },

  async saveExamResult(resultData: any): Promise<ExamResult> {
    const res = await fetch('/api/exams/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(resultData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to record marks');
    }
    return await res.json();
  },

  // Attendance
  async saveAttendance(arg1: any, arg2?: string, arg3?: any[]): Promise<any> {
    let payload: any;
    if (typeof arg1 === 'string') {
      payload = { class: arg1, date: arg2, records: arg3 || [] };
    } else if (Array.isArray(arg1)) {
      payload = { records: arg1 };
    } else {
      payload = arg1;
    }
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save attendance');
    }
    return await res.json();
  },

  // Audit Logs
  async fetchAuditLogs(): Promise<AuditLog[]> {
    try {
      const res = await fetch('/api/audit-logs', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return [];
  },

  // PYQs
  getPYQs(): PYQItem[] {
    return initialPYQs;
  },

  async fetchPYQs(): Promise<PYQItem[]> {
    try {
      const res = await fetch('/api/pyqs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return this.getPYQs();
  },

  // Fees
  getFees(): FeeRecord[] {
    return initialFeeRecords;
  },

  async fetchFees(): Promise<FeeRecord[]> {
    try {
      const res = await fetch('/api/fees', { headers: { ...getAuthHeader() } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return this.getFees();
  },

  async payFee(id: string): Promise<void> {
    await fetch(`/api/fees/${id}/pay`, { method: 'PUT', headers: { ...getAuthHeader() } });
  },

  // CUROS AI Assistant Methods
  async sendCurosMessage(message: string, history: any[] = []): Promise<{
    response: string;
    role: string;
    grounded: boolean;
    data_sources: string[];
    suggested_followups: string[];
    timestamp: string;
  }> {
    const res = await fetch('/api/curos/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message, conversation_history: history })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to get answer from CUROS AI');
    }
    return await res.json();
  },

  async fetchCurosSuggestedQuestions(): Promise<{
    role: string;
    welcome_message: string;
    questions: string[];
  }> {
    const defaultData = {
      role: 'ADMIN',
      welcome_message: "Hello! I'm CUROS AI. I can help you explore teachers, classes, students, attendance, fees, and meetings.",
      questions: [
        "Who teaches Mathematics in Class 10-A?",
        "Which classes does Amit Sharma teach?",
        "How many students are enrolled in Class 10-A?",
        "Which students have unpaid fees?",
        "What is the total outstanding fee amount?",
        "What was the attendance of Class 10-A on 14 October 2026?"
      ]
    };
    try {
      const res = await fetch('/api/curos/suggested-questions', {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.questions)) return data;
      }
    } catch {}
    return defaultData;
  },

  async fetchCurosDatasetStatus(): Promise<any> {
    try {
      const res = await fetch('/api/curos/dataset-status');
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'healthy', tables_count: 12, records_count: 850 };
  },

  async resetCurosDataset(): Promise<any> {
    const res = await fetch('/api/curos/reset-dataset', {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to reset dataset');
    return await res.json();
  }
};
