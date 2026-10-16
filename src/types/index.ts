export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  linkedId?: string;
  linkedStudent?: Student;
  linkedChildren?: Student[];
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  gender: 'Male' | 'Female' | 'Other';
  status: 'Active' | 'Inactive';
  guardianName: string;
  phone: string;
  email: string;
  address: string;
  avatar?: string;
  attendanceRate?: number;
  feeStatus?: 'Paid' | 'Pending' | 'Overdue';
}

export interface Teacher {
  id: string;
  name: string;
  employeeId: string;
  subject: string;
  department: string;
  email: string;
  phone: string;
  classesAssigned: string[];
  status?: 'Active' | 'On Leave';
  avatar?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  grade: string;
  section: string;
  room: string;
  classTeacher: string;
  totalStudents: number;
  capacity: number;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  type: 'Regular' | 'Extra Class' | 'Meeting';
  color: string;
  teacher?: string;
  subject?: string;
  joinLink?: string;
  classAssigned?: string;
}

export interface SchoolEvent {
  id: string;
  month: string;
  day: string;
  dateStr: string;
  title: string;
  time: string;
  location: string;
  badgeBg: string;
  badgeText: string;
  description?: string;
  category: 'Academic' | 'Sports' | 'Cultural' | 'Career';
  registeredCount: number;
}

export interface NotificationItem {
  id: string;
  iconType: 'megaphone' | 'calendar' | 'file-text' | 'star' | 'message-circle' | 'bell';
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  timestamp: string;
  isUnread: boolean;
  link?: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: 'Academic' | 'Behaviour' | 'Bullying' | 'Facilities' | 'Transport' | 'Safety' | 'Other';
  submittedBy: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'Student' | 'Parent' | 'Teacher';
  priority?: 'High' | 'Medium' | 'Low';
  assignedTo?: string;
  date: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_INFORMATION' | 'RESOLVED' | 'CLOSED' | 'ESCALATED' | 'Open' | 'In Progress' | 'Resolved';
  resolutionNotes?: string;
}

export interface Meeting {
  id: string;
  requester_id: string;
  requester_name: string;
  requester_role: string;
  linked_student_id?: string;
  target_staff_id: string;
  target_staff_name: string;
  meeting_type: string;
  reason: string;
  description?: string;
  preferred_date: string;
  preferred_time: string;
  mode: 'In-person' | 'Online';
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'RESCHEDULE_PROPOSED' | 'CANCELLED' | 'COMPLETED';
  decision_notes?: string;
  created_at: string;
}

export interface LeaveApplication {
  id: string;
  student_id: string;
  student_name: string;
  class: string;
  requester_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approver_id?: string;
  decision_notes?: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  class: string;
  subject: string;
  teacher_id: string;
  teacher_name: string;
  due_date: string;
  max_marks: number;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  content: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
  submitted_at: string;
  marks_awarded?: number;
  feedback?: string;
}

export interface ExamResult {
  id: string;
  exam_name: string;
  student_id: string;
  student_name: string;
  class: string;
  subject: string;
  marks_obtained: number;
  max_marks: number;
  grade: string;
  published: number;
  remarks?: string;
}

export interface PYQItem {
  id: string;
  title: string;
  classGrade: string;
  subject: string;
  year: number;
  board: string;
  downloads: number;
  fileSize: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  term: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Paid' | 'Partial' | 'Pending';
  dueDate: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_name?: string;
  actor_role?: string;
  action: string;
  target_entity?: string;
  target_id?: string;
  details?: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalStudents: number;
  studentsGrowth: number;
  totalTeachers: number;
  teachersGrowth: number;
  totalClasses: number;
  classesGrowthText: string;
  todayAttendancePercent: number;
  attendanceGrowth: number;
  currentTerm: string;
  academicYear: string;
  todayDateDisplay: string;
}
