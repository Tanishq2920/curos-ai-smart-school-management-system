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
  FeeRecord
} from '../types';

export const initialDashboardMetrics: DashboardMetrics = {
  totalStudents: 320,
  studentsGrowth: 5,
  totalTeachers: 24,
  teachersGrowth: 2,
  totalClasses: 12,
  classesGrowthText: 'No change',
  todayAttendancePercent: 85,
  attendanceGrowth: 3,
  currentTerm: 'Term 1',
  academicYear: '2025 – 2026',
  todayDateDisplay: 'Wed, 27 Aug 2025'
};

export const initialEvents: SchoolEvent[] = [
  {
    id: 'ev-1',
    month: 'AUG',
    day: '28',
    dateStr: '28 Aug 2025',
    title: 'Science Exhibition',
    time: '10:00 AM – 04:00 PM',
    location: 'School Auditorium',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-600',
    description: 'Annual inter-school science fair featuring robotics, eco-innovations, and physics demonstrations.',
    category: 'Academic',
    registeredCount: 142
  },
  {
    id: 'ev-2',
    month: 'SEP',
    day: '02',
    dateStr: '02 Sep 2025',
    title: 'Sports Day',
    time: '09:00 AM – 05:00 PM',
    location: 'School Ground',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-600',
    description: 'Track and field athletics championships across all grade houses.',
    category: 'Sports',
    registeredCount: 280
  },
  {
    id: 'ev-3',
    month: 'SEP',
    day: '10',
    dateStr: '10 Sep 2025',
    title: 'Career Guidance Session',
    time: '11:00 AM – 12:30 PM',
    location: 'Main Hall',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-600',
    description: 'Guest lecture by university admissions counselors for classes 10, 11, and 12.',
    category: 'Career',
    registeredCount: 95
  },
  {
    id: 'ev-4',
    month: 'SEP',
    day: '15',
    dateStr: '15 Sep 2025',
    title: 'Cultural Event',
    time: '10:00 AM – 03:00 PM',
    location: 'School Auditorium',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-500',
    description: 'Music, drama, and traditional dance performances by junior and senior wings.',
    category: 'Cultural',
    registeredCount: 175
  }
];

export const initialSchedule: ScheduleItem[] = [
  {
    id: 'sch-1',
    time: '09:00 AM – 10:00 AM',
    title: 'Class 10A – Mathematics',
    location: 'Room 101',
    type: 'Regular',
    color: '#3B82F6',
    teacher: 'Mr. Rajesh Verma',
    subject: 'Quadratic Equations'
  },
  {
    id: 'sch-2',
    time: '10:15 AM – 11:15 AM',
    title: 'Class 9B – Science',
    location: 'Room 103',
    type: 'Regular',
    color: '#10B981',
    teacher: 'Dr. Neha Sharma',
    subject: 'Cell Biology & Plant Anatomy'
  },
  {
    id: 'sch-3',
    time: '11:30 AM – 12:30 PM',
    title: 'Extra Class – Physics',
    location: 'Online (Meet Link)',
    type: 'Extra Class',
    color: '#F43F5E',
    teacher: 'Prof. Alok Mukherjee',
    subject: 'Thermodynamics Problem Solving',
    joinLink: 'https://meet.google.com/abc-school-phy'
  },
  {
    id: 'sch-4',
    time: '01:30 PM – 02:30 PM',
    title: 'Class 8A – English',
    location: 'Room 102',
    type: 'Regular',
    color: '#F59E0B',
    teacher: 'Ms. Sunita Roy',
    subject: 'Grammar & Essay Composition'
  },
  {
    id: 'sch-5',
    time: '03:00 PM – 04:00 PM',
    title: 'Teacher Meeting',
    location: 'Staff Room',
    type: 'Meeting',
    color: '#8B5CF6',
    teacher: 'All Department Heads',
    subject: 'Mid-term Curriculum Review'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    iconType: 'megaphone',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    title: 'New Announcement',
    description: 'Holiday on 5th September (Teachers Day)',
    timestamp: '2 hours ago',
    isUnread: true
  },
  {
    id: 'notif-2',
    iconType: 'calendar',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    title: 'Extra Class Scheduled',
    description: 'Physics extra class on 28 Aug',
    timestamp: '4 hours ago',
    isUnread: true
  },
  {
    id: 'notif-3',
    iconType: 'file-text',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'New PYQ Uploaded',
    description: 'Class 12 – Mathematics (2023)',
    timestamp: '1 day ago',
    isUnread: false
  },
  {
    id: 'notif-4',
    iconType: 'star',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Event Registration Open',
    description: 'Sports Day 2025',
    timestamp: '1 day ago',
    isUnread: false
  },
  {
    id: 'notif-5',
    iconType: 'message-circle',
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-500',
    title: 'Complaint Updated',
    description: 'Your complaint #C-1024 is resolved',
    timestamp: '2 days ago',
    isUnread: false
  }
];

export const initialStudents: Student[] = [
  {
    id: 'std-101',
    name: 'Aarav Patel',
    rollNumber: '10A-01',
    class: 'Class 10A',
    gender: 'Male',
    status: 'Active',
    guardianName: 'Vikram Patel',
    phone: '+91 98765 43210',
    email: 'aarav.patel@student.smartschool.edu',
    address: 'Flat 402, Sunshine Heights, North Wing',
    attendanceRate: 94,
    feeStatus: 'Paid'
  },
  {
    id: 'std-102',
    name: 'Ananya Sharma',
    rollNumber: '10A-02',
    class: 'Class 10A',
    gender: 'Female',
    status: 'Active',
    guardianName: 'Suresh Sharma',
    phone: '+91 98765 43211',
    email: 'ananya.sharma@student.smartschool.edu',
    address: 'B-12, Greenfield Enclave',
    attendanceRate: 98,
    feeStatus: 'Paid'
  },
  {
    id: 'std-103',
    name: 'Rohan Mehra',
    rollNumber: '9B-05',
    class: 'Class 9B',
    gender: 'Male',
    status: 'Active',
    guardianName: 'Kavita Mehra',
    phone: '+91 98765 43212',
    email: 'rohan.mehra@student.smartschool.edu',
    address: '74, Heritage Colony',
    attendanceRate: 88,
    feeStatus: 'Pending'
  },
  {
    id: 'std-104',
    name: 'Diya Sengupta',
    rollNumber: '8A-14',
    class: 'Class 8A',
    gender: 'Female',
    status: 'Active',
    guardianName: 'Debashish Sengupta',
    phone: '+91 98765 43213',
    email: 'diya.sengupta@student.smartschool.edu',
    address: '15/2, Lake View Road',
    attendanceRate: 91,
    feeStatus: 'Paid'
  },
  {
    id: 'std-105',
    name: 'Kabir Khan',
    rollNumber: '12A-09',
    class: 'Class 12A',
    gender: 'Male',
    status: 'Active',
    guardianName: 'Imran Khan',
    phone: '+91 98765 43214',
    email: 'kabir.khan@student.smartschool.edu',
    address: '88/A, Civil Lines',
    attendanceRate: 82,
    feeStatus: 'Overdue'
  },
  {
    id: 'std-106',
    name: 'Sneha Kulkarni',
    rollNumber: '11B-03',
    class: 'Class 11B',
    gender: 'Female',
    status: 'Active',
    guardianName: 'Manoj Kulkarni',
    phone: '+91 98765 43215',
    email: 'sneha.k@student.smartschool.edu',
    address: '42, Shanti Vihar',
    attendanceRate: 96,
    feeStatus: 'Paid'
  }
];

export const initialTeachers: Teacher[] = [
  {
    id: 'tch-01',
    name: 'Mr. Rajesh Verma',
    employeeId: 'EMP-T101',
    subject: 'Mathematics',
    department: 'Science & Math',
    email: 'rajesh.verma@smartschool.edu',
    phone: '+91 98234 11001',
    classesAssigned: ['Class 10A', 'Class 11A', 'Class 12A'],
    status: 'Active'
  },
  {
    id: 'tch-02',
    name: 'Dr. Neha Sharma',
    employeeId: 'EMP-T102',
    subject: 'Biology & Chemistry',
    department: 'Science & Math',
    email: 'neha.sharma@smartschool.edu',
    phone: '+91 98234 11002',
    classesAssigned: ['Class 9B', 'Class 10B'],
    status: 'Active'
  },
  {
    id: 'tch-03',
    name: 'Prof. Alok Mukherjee',
    employeeId: 'EMP-T103',
    subject: 'Physics',
    department: 'Science & Math',
    email: 'alok.m@smartschool.edu',
    phone: '+91 98234 11003',
    classesAssigned: ['Class 11A', 'Class 12A', 'Extra Physics'],
    status: 'Active'
  },
  {
    id: 'tch-04',
    name: 'Ms. Sunita Roy',
    employeeId: 'EMP-T104',
    subject: 'English Literature',
    department: 'Languages & Humanities',
    email: 'sunita.roy@smartschool.edu',
    phone: '+91 98234 11004',
    classesAssigned: ['Class 8A', 'Class 9A', 'Class 10A'],
    status: 'Active'
  },
  {
    id: 'tch-05',
    name: 'Mr. David Fernandez',
    employeeId: 'EMP-T105',
    subject: 'Computer Science & AI',
    department: 'Technology',
    email: 'david.f@smartschool.edu',
    phone: '+91 98234 11005',
    classesAssigned: ['Class 10A', 'Class 11B', 'Class 12A'],
    status: 'Active'
  }
];

export const initialClasses: SchoolClass[] = [
  {
    id: 'cls-1',
    name: 'Class 10A',
    grade: '10th Grade',
    section: 'A',
    room: 'Room 101',
    classTeacher: 'Mr. Rajesh Verma',
    totalStudents: 32,
    capacity: 35
  },
  {
    id: 'cls-2',
    name: 'Class 9B',
    grade: '9th Grade',
    section: 'B',
    room: 'Room 103',
    classTeacher: 'Dr. Neha Sharma',
    totalStudents: 30,
    capacity: 35
  },
  {
    id: 'cls-3',
    name: 'Class 8A',
    grade: '8th Grade',
    section: 'A',
    room: 'Room 102',
    classTeacher: 'Ms. Sunita Roy',
    totalStudents: 28,
    capacity: 32
  },
  {
    id: 'cls-4',
    name: 'Class 11A',
    grade: '11th Grade',
    section: 'A - Science',
    room: 'Room 201',
    classTeacher: 'Prof. Alok Mukherjee',
    totalStudents: 26,
    capacity: 30
  },
  {
    id: 'cls-5',
    name: 'Class 12A',
    grade: '12th Grade',
    section: 'A - Science',
    room: 'Room 204',
    classTeacher: 'Mr. David Fernandez',
    totalStudents: 29,
    capacity: 30
  }
];

export const initialComplaints: Complaint[] = [
  {
    id: 'cmp-1',
    ticketNumber: '#C-1024',
    title: 'AC cooling issue in Room 101 during afternoon hours',
    description: 'The split AC unit in Room 101 makes loud noise and cuts off cooling between 1 PM and 3 PM.',
    category: 'Facilities',
    submittedBy: 'Aarav Patel (Class 10A)',
    role: 'Student',
    date: '25 Aug 2025',
    status: 'Resolved',
    resolutionNotes: 'HVAC technician serviced unit filter and topped coolant on 26 Aug.'
  },
  {
    id: 'cmp-2',
    ticketNumber: '#C-1025',
    title: 'Bus Route 7 morning delay',
    description: 'Morning bus arrived 25 minutes late at Greenfield Enclave stop for two consecutive days.',
    category: 'Transport',
    submittedBy: 'Kavita Mehra',
    role: 'Parent',
    date: '26 Aug 2025',
    status: 'In Progress',
    resolutionNotes: 'Transport supervisor rerouted stop to avoid road construction choke point.'
  },
  {
    id: 'cmp-3',
    ticketNumber: '#C-1026',
    title: 'Library Chemistry Ref Book missing',
    description: 'NCERT Exemplar class 11 physical chemistry reference copies are all checked out.',
    category: 'Academic',
    submittedBy: 'Sneha Kulkarni (Class 11B)',
    role: 'Student',
    date: '27 Aug 2025',
    status: 'Open'
  }
];

export const initialPYQs: PYQItem[] = [
  {
    id: 'pyq-1',
    title: 'CBSE Class 12 – Mathematics Board Paper',
    classGrade: 'Class 12',
    subject: 'Mathematics',
    year: 2023,
    board: 'CBSE',
    downloads: 1420,
    fileSize: '3.4 MB'
  },
  {
    id: 'pyq-2',
    title: 'CBSE Class 10 – Science Annual Examination',
    classGrade: 'Class 10',
    subject: 'Science',
    year: 2024,
    board: 'CBSE',
    downloads: 2180,
    fileSize: '4.1 MB'
  },
  {
    id: 'pyq-3',
    title: 'CBSE Class 12 – Physics Mid-Term Sample & PYQ',
    classGrade: 'Class 12',
    subject: 'Physics',
    year: 2023,
    board: 'CBSE',
    downloads: 980,
    fileSize: '2.8 MB'
  },
  {
    id: 'pyq-4',
    title: 'Class 10 – English Language & Literature',
    classGrade: 'Class 10',
    subject: 'English',
    year: 2023,
    board: 'CBSE',
    downloads: 870,
    fileSize: '1.9 MB'
  }
];

export const initialFeeRecords: FeeRecord[] = [
  {
    id: 'fee-1',
    studentId: 'std-101',
    studentName: 'Aarav Patel',
    rollNumber: '10A-01',
    class: 'Class 10A',
    term: 'Term 1 (2025-26)',
    totalAmount: 18500,
    paidAmount: 18500,
    status: 'Paid',
    dueDate: '15 Aug 2025'
  },
  {
    id: 'fee-2',
    studentId: 'std-102',
    studentName: 'Ananya Sharma',
    rollNumber: '10A-02',
    class: 'Class 10A',
    term: 'Term 1 (2025-26)',
    totalAmount: 18500,
    paidAmount: 18500,
    status: 'Paid',
    dueDate: '15 Aug 2025'
  },
  {
    id: 'fee-3',
    studentId: 'std-103',
    studentName: 'Rohan Mehra',
    rollNumber: '9B-05',
    class: 'Class 9B',
    term: 'Term 1 (2025-26)',
    totalAmount: 17200,
    paidAmount: 8600,
    status: 'Partial',
    dueDate: '31 Aug 2025'
  },
  {
    id: 'fee-4',
    studentId: 'std-105',
    studentName: 'Kabir Khan',
    rollNumber: '12A-09',
    class: 'Class 12A',
    term: 'Term 1 (2025-26)',
    totalAmount: 21000,
    paidAmount: 0,
    status: 'Pending',
    dueDate: '10 Aug 2025'
  }
];
