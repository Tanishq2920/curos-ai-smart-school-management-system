import os
import re
import sqlite3
import json
import secrets
import time
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'school.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def log_audit(conn, actor_id, actor_name, actor_role, action, target_entity, target_id, details):
    try:
        conn.execute('''
        INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, target_entity, target_id, details, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            f"aud-{int(time.time()*1000)}-{secrets.token_hex(4)}",
            actor_id, actor_name, actor_role, action, target_entity, target_id, details,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
    except Exception as e:
        print(f"Audit log error: {e}")

def create_notification(conn, recipient_user_id, notif_type, title, description, link=None, entity_type=None, entity_id=None):
    try:
        icon_map = {
            'complaint': ('message-circle', 'bg-rose-50', 'text-rose-500'),
            'meeting': ('calendar', 'bg-purple-50', 'text-purple-600'),
            'attendance': ('calendar', 'bg-emerald-50', 'text-emerald-600'),
            'assignment': ('file-text', 'bg-blue-50', 'text-blue-600'),
            'exam': ('award', 'bg-amber-50', 'text-amber-500'),
            'leave': ('calendar', 'bg-sky-50', 'text-sky-600'),
            'announcement': ('megaphone', 'bg-rose-50', 'text-rose-500'),
            'general': ('bell', 'bg-slate-50', 'text-slate-600'),
            'fee': ('credit-card', 'bg-emerald-50', 'text-emerald-600'),
            'user': ('user-check', 'bg-indigo-50', 'text-indigo-600')
        }
        icon_type, icon_bg, icon_color = icon_map.get(notif_type, ('bell', 'bg-blue-50', 'text-blue-600'))
        notif_id = f"notif-{int(time.time()*1000)}-{secrets.token_hex(3)}"
        conn.execute('''
        INSERT INTO notifications (id, recipient_user_id, icon_type, icon_bg, icon_color, title, description, timestamp, is_unread, link, entity_type, entity_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
        ''', (
            notif_id, recipient_user_id, icon_type, icon_bg, icon_color, title, description,
            "Just now", link, entity_type, entity_id
        ))
    except Exception as e:
        print(f"Notification error: {e}")

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()

    # Base tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS metrics (
        id INTEGER PRIMARY KEY,
        total_students INTEGER,
        students_growth INTEGER,
        total_teachers INTEGER,
        teachers_growth INTEGER,
        total_classes INTEGER,
        classes_growth_text TEXT,
        today_attendance_percent INTEGER,
        attendance_growth INTEGER,
        current_term TEXT,
        academic_year TEXT,
        today_date_display TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        roll_number TEXT NOT NULL,
        class TEXT NOT NULL,
        gender TEXT,
        status TEXT,
        guardian_name TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        attendance_rate INTEGER,
        fee_status TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS teachers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        department TEXT,
        email TEXT,
        phone TEXT,
        classes_assigned TEXT,
        status TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        grade TEXT,
        section TEXT,
        room TEXT,
        class_teacher TEXT,
        total_students INTEGER,
        capacity INTEGER
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS schedule (
        id TEXT PRIMARY KEY,
        time TEXT NOT NULL,
        title TEXT NOT NULL,
        location TEXT,
        type TEXT,
        color TEXT,
        teacher TEXT,
        subject TEXT,
        join_link TEXT,
        class_assigned TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        month TEXT,
        day TEXT,
        date_str TEXT,
        title TEXT NOT NULL,
        time TEXT,
        location TEXT,
        badge_bg TEXT,
        badge_text TEXT,
        description TEXT,
        category TEXT,
        registered_count INTEGER
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS pyqs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        class_grade TEXT,
        subject TEXT,
        year INTEGER,
        board TEXT,
        downloads INTEGER,
        file_size TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS fees (
        id TEXT PRIMARY KEY,
        student_id TEXT,
        student_name TEXT,
        roll_number TEXT,
        class TEXT,
        term TEXT,
        total_amount INTEGER,
        paid_amount INTEGER,
        status TEXT,
        due_date TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL, -- 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'
        linked_id TEXT,    -- std-101 for Student, tch-01 for Teacher
        status TEXT DEFAULT 'Active',
        created_at TEXT,
        updated_at TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS parent_student_links (
        id TEXT PRIMARY KEY,
        parent_user_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        relationship TEXT DEFAULT 'Parent'
    )
    ''')
    cursor.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_parent_student_unique ON parent_student_links(parent_user_id, student_id)')


    cursor.execute('''
    CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        ticket_number TEXT,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        submitted_by TEXT,
        submitted_by_id TEXT,
        linked_student_id TEXT,
        role TEXT,
        priority TEXT DEFAULT 'Medium',
        assigned_to TEXT DEFAULT 'Head of Student Welfare',
        assigned_staff_id TEXT,
        date TEXT,
        status TEXT DEFAULT 'OPEN',
        resolution_notes TEXT,
        created_at TEXT,
        updated_at TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        recipient_user_id TEXT,
        icon_type TEXT,
        icon_bg TEXT,
        icon_color TEXT,
        title TEXT NOT NULL,
        description TEXT,
        timestamp TEXT,
        is_unread INTEGER DEFAULT 1,
        link TEXT,
        entity_type TEXT,
        entity_id TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        requester_id TEXT NOT NULL,
        requester_name TEXT NOT NULL,
        requester_role TEXT NOT NULL,
        linked_student_id TEXT,
        target_staff_id TEXT NOT NULL,
        target_staff_name TEXT NOT NULL,
        meeting_type TEXT NOT NULL,
        reason TEXT NOT NULL,
        description TEXT,
        preferred_date TEXT NOT NULL,
        preferred_time TEXT NOT NULL,
        mode TEXT DEFAULT 'In-person',
        status TEXT DEFAULT 'PENDING',
        decision_notes TEXT,
        created_at TEXT,
        updated_at TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS leave_applications (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        class TEXT NOT NULL,
        requester_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        approver_id TEXT,
        decision_notes TEXT,
        created_at TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        class TEXT NOT NULL,
        subject TEXT NOT NULL,
        teacher_id TEXT NOT NULL,
        teacher_name TEXT NOT NULL,
        due_date TEXT NOT NULL,
        max_marks INTEGER DEFAULT 100,
        created_at TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        assignment_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        content TEXT,
        status TEXT DEFAULT 'SUBMITTED',
        submitted_at TEXT,
        marks_awarded INTEGER,
        feedback TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS exams_results (
        id TEXT PRIMARY KEY,
        exam_name TEXT NOT NULL,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        class TEXT NOT NULL,
        subject TEXT NOT NULL,
        marks_obtained REAL NOT NULL,
        max_marks REAL NOT NULL,
        grade TEXT,
        published INTEGER DEFAULT 1,
        remarks TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY,
        class TEXT NOT NULL,
        date TEXT NOT NULL,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        status TEXT NOT NULL, -- 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'
        marked_by TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        target_audience TEXT DEFAULT 'ALL', -- 'ALL', 'STUDENTS', 'PARENTS', 'TEACHERS', or specific class
        author_id TEXT,
        author_name TEXT,
        priority TEXT DEFAULT 'Normal',
        created_at TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS service_requests (
        id TEXT PRIMARY KEY,
        facility TEXT NOT NULL,
        issue TEXT NOT NULL,
        priority TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'Pending Approval',
        requester_id TEXT,
        requester_name TEXT,
        date TEXT,
        resolution_notes TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        school_name TEXT,
        academic_year TEXT,
        current_term TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        principal_name TEXT
    )
    ''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        actor_id TEXT,
        actor_name TEXT,
        actor_role TEXT,
        action TEXT NOT NULL,
        target_entity TEXT,
        target_id TEXT,
        details TEXT,
        timestamp TEXT
    )
    ''')

    # Schema migrations for existing databases
    cursor.execute("PRAGMA table_info(schedule)")
    schedule_cols = [col[1] for col in cursor.fetchall()]
    if 'class_assigned' not in schedule_cols:
        cursor.execute("ALTER TABLE schedule ADD COLUMN class_assigned TEXT")
        cursor.execute("UPDATE schedule SET class_assigned = 'Class 10A' WHERE id = 'sch-1'")
        cursor.execute("UPDATE schedule SET class_assigned = 'Class 9B' WHERE id = 'sch-2'")
        cursor.execute("UPDATE schedule SET class_assigned = 'Class 11A' WHERE id = 'sch-3'")
        cursor.execute("UPDATE schedule SET class_assigned = 'Class 8A' WHERE id = 'sch-4'")
        cursor.execute("UPDATE schedule SET class_assigned = 'All' WHERE id = 'sch-5'")

    # Seed Metrics
    cursor.execute('SELECT COUNT(*) FROM metrics')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
        INSERT INTO metrics (
            id, total_students, students_growth, total_teachers, teachers_growth,
            total_classes, classes_growth_text, today_attendance_percent, attendance_growth,
            current_term, academic_year, today_date_display
        ) VALUES (
            1, 320, 5, 24, 2, 12, 'No change', 85, 3, 'Term 1', '2025   2026', 'Wed, 27 Aug 2025'
        )
        ''')

    # Seed Students
    cursor.execute('SELECT COUNT(*) FROM students')
    if cursor.fetchone()[0] == 0:
        students_data = [
            ('std-101', 'Aarav Patel', '10A-01', 'Class 10A', 'Male', 'Active', 'Vikram Patel', '+91 98765 43210', 'aarav.patel@student.smartschool.edu', 'Flat 402, Sunshine Heights', 94, 'Paid'),
            ('std-102', 'Ananya Sharma', '10A-02', 'Class 10A', 'Female', 'Active', 'Suresh Sharma', '+91 98765 43211', 'ananya.sharma@student.smartschool.edu', 'B-12, Greenfield Enclave', 98, 'Paid'),
            ('std-103', 'Rohan Mehra', '9B-05', 'Class 9B', 'Male', 'Active', 'Kavita Mehra', '+91 98765 43212', 'rohan.mehra@student.smartschool.edu', '74, Heritage Colony', 88, 'Pending'),
            ('std-104', 'Diya Sengupta', '8A-14', 'Class 8A', 'Female', 'Active', 'Debashish Sengupta', '+91 98765 43213', 'diya.sengupta@student.smartschool.edu', '15/2, Lake View Road', 91, 'Paid'),
            ('std-105', 'Kabir Khan', '12A-09', 'Class 12A', 'Male', 'Active', 'Imran Khan', '+91 98765 43214', 'kabir.khan@student.smartschool.edu', '88/A, Civil Lines', 82, 'Overdue'),
            ('std-106', 'Sneha Kulkarni', '11B-03', 'Class 11B', 'Female', 'Active', 'Manoj Kulkarni', '+91 98765 43215', 'sneha.k@student.smartschool.edu', '42, Shanti Vihar', 96, 'Paid')
        ]
        cursor.executemany('''
        INSERT INTO students (id, name, roll_number, class, gender, status, guardian_name, phone, email, address, attendance_rate, fee_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', students_data)

    # Seed Teachers
    cursor.execute('SELECT COUNT(*) FROM teachers')
    if cursor.fetchone()[0] == 0:
        teachers_data = [
            ('tch-01', 'Mr. Rajesh Verma', 'EMP-T101', 'Mathematics', 'Science & Math', 'rajesh.verma@smartschool.edu', '+91 98234 11001', json.dumps(['Class 10A', 'Class 11A', 'Class 12A']), 'Active'),
            ('tch-02', 'Dr. Neha Sharma', 'EMP-T102', 'Biology & Chemistry', 'Science & Math', 'neha.sharma@smartschool.edu', '+91 98234 11002', json.dumps(['Class 9B', 'Class 10B']), 'Active'),
            ('tch-03', 'Prof. Alok Mukherjee', 'EMP-T103', 'Physics', 'Science & Math', 'alok.m@smartschool.edu', '+91 98234 11003', json.dumps(['Class 11A', 'Class 12A', 'Extra Physics']), 'Active'),
            ('tch-04', 'Ms. Sunita Roy', 'EMP-T104', 'English Literature', 'Languages & Humanities', 'sunita.roy@smartschool.edu', '+91 98234 11004', json.dumps(['Class 8A', 'Class 9A', 'Class 10A']), 'Active'),
            ('tch-05', 'Mr. David Fernandez', 'EMP-T105', 'Computer Science & AI', 'Technology', 'david.f@smartschool.edu', '+91 98234 11005', json.dumps(['Class 10A', 'Class 11B', 'Class 12A']), 'Active')
        ]
        cursor.executemany('''
        INSERT INTO teachers (id, name, employee_id, subject, department, email, phone, classes_assigned, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', teachers_data)

    # Seed Classes
    cursor.execute('SELECT COUNT(*) FROM classes')
    if cursor.fetchone()[0] == 0:
        classes_data = [
            ('cls-1', 'Class 10A', '10th Grade', 'A', 'Room 101', 'Mr. Rajesh Verma', 32, 35),
            ('cls-2', 'Class 9B', '9th Grade', 'B', 'Room 103', 'Dr. Neha Sharma', 30, 35),
            ('cls-3', 'Class 8A', '8th Grade', 'A', 'Room 102', 'Ms. Sunita Roy', 28, 32),
            ('cls-4', 'Class 11A', '11th Grade', 'A - Science', 'Room 201', 'Prof. Alok Mukherjee', 26, 30),
            ('cls-5', 'Class 12A', '12th Grade', 'A - Science', 'Room 204', 'Mr. David Fernandez', 29, 30)
        ]
        cursor.executemany('''
        INSERT INTO classes (id, name, grade, section, room, class_teacher, total_students, capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', classes_data)

    # Seed Schedule
    cursor.execute('SELECT COUNT(*) FROM schedule')
    if cursor.fetchone()[0] == 0:
        schedule_data = [
            ('sch-1', '09:00 AM   10:00 AM', 'Class 10A   Mathematics', 'Room 101', 'Regular', '#3B82F6', 'Mr. Rajesh Verma', 'Quadratic Equations', None, 'Class 10A'),
            ('sch-2', '10:15 AM   11:15 AM', 'Class 9B   Science', 'Room 103', 'Regular', '#10B981', 'Dr. Neha Sharma', 'Cell Biology & Plant Anatomy', None, 'Class 9B'),
            ('sch-3', '11:30 AM   12:30 PM', 'Extra Class   Physics', 'Online (Meet Link)', 'Extra Class', '#F43F5E', 'Prof. Alok Mukherjee', 'Thermodynamics Problem Solving', 'https://meet.google.com/abc-school-phy', 'Class 11A'),
            ('sch-4', '01:30 PM   02:30 PM', 'Class 8A   English', 'Room 102', 'Regular', '#F59E0B', 'Ms. Sunita Roy', 'Grammar & Essay Composition', None, 'Class 8A'),
            ('sch-5', '03:00 PM   04:00 PM', 'Teacher Meeting', 'Staff Room', 'Meeting', '#8B5CF6', 'All Department Heads', 'Mid-term Curriculum Review', None, 'All')
        ]
        cursor.executemany('''
        INSERT INTO schedule (id, time, title, location, type, color, teacher, subject, join_link, class_assigned)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', schedule_data)

    # Seed Events
    cursor.execute('SELECT COUNT(*) FROM events')
    if cursor.fetchone()[0] == 0:
        events_data = [
            ('ev-1', 'AUG', '28', '28 Aug 2025', 'Science Exhibition', '10:00 AM   04:00 PM', 'School Auditorium', 'bg-sky-50', 'text-sky-600', 'Annual inter-school science fair featuring robotics, eco-innovations, and physics demonstrations.', 'Academic', 142),
            ('ev-2', 'SEP', '02', '02 Sep 2025', 'Sports Day', '09:00 AM   05:00 PM', 'School Ground', 'bg-purple-50', 'text-purple-600', 'Track and field athletics championships across all grade houses.', 'Sports', 280),
            ('ev-3', 'SEP', '10', '10 Sep 2025', 'Career Guidance Session', '11:00 AM   12:30 PM', 'Main Hall', 'bg-amber-50', 'text-amber-600', 'Guest lecture by university admissions counselors for classes 10, 11, and 12.', 'Career', 95),
            ('ev-4', 'SEP', '15', '15 Sep 2025', 'Cultural Event', '10:00 AM   03:00 PM', 'School Auditorium', 'bg-rose-50', 'text-rose-500', 'Music, drama, and traditional dance performances by junior and senior wings.', 'Cultural', 175)
        ]
        cursor.executemany('''
        INSERT INTO events (id, month, day, date_str, title, time, location, badge_bg, badge_text, description, category, registered_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', events_data)

    # Seed PYQs
    cursor.execute('SELECT COUNT(*) FROM pyqs')
    if cursor.fetchone()[0] == 0:
        pyqs_data = [
            ('pyq-1', 'CBSE Class 12   Mathematics Board Paper', 'Class 12', 'Mathematics', 2023, 'CBSE', 1420, '3.4 MB'),
            ('pyq-2', 'CBSE Class 10   Science Annual Examination', 'Class 10', 'Science', 2024, 'CBSE', 2180, '4.1 MB'),
            ('pyq-3', 'CBSE Class 12   Physics Mid-Term Sample & PYQ', 'Class 12', 'Physics', 2023, 'CBSE', 980, '2.8 MB'),
            ('pyq-4', 'Class 10   English Language & Literature', 'Class 10', 'English', 2023, 'CBSE', 870, '1.9 MB')
        ]
        cursor.executemany('''
        INSERT INTO pyqs (id, title, class_grade, subject, year, board, downloads, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', pyqs_data)

    # Seed Fees
    cursor.execute('SELECT COUNT(*) FROM fees')
    if cursor.fetchone()[0] == 0:
        fees_data = [
            ('fee-1', 'std-101', 'Aarav Patel', '10A-01', 'Class 10A', 'Term 1 (2025-26)', 18500, 18500, 'Paid', '15 Aug 2025'),
            ('fee-2', 'std-102', 'Ananya Sharma', '10A-02', 'Class 10A', 'Term 1 (2025-26)', 18500, 18500, 'Paid', '15 Aug 2025'),
            ('fee-3', 'std-103', 'Rohan Mehra', '9B-05', 'Class 9B', 'Term 1 (2025-26)', 17200, 8600, 'Partial', '31 Aug 2025'),
            ('fee-4', 'std-105', 'Kabir Khan', '12A-09', 'Class 12A', 'Term 1 (2025-26)', 21000, 0, 'Pending', '10 Aug 2025')
        ]
        cursor.executemany('''
        INSERT INTO fees (id, student_id, student_name, roll_number, class, term, total_amount, paid_amount, status, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', fees_data)

    # Seed Users
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        bootstrap_users = [
            ('usr-admin-1', 'admin', 'admin@smartschool.edu', generate_password_hash('CurosAdmin@2026!'), 'Admin User', 'ADMIN', None, 'Active', now_str, now_str),
            ('usr-teacher-1', 'teacher', 'rajesh.verma@smartschool.edu', generate_password_hash('CurosTeacher@2026!'), 'Mr. Rajesh Verma', 'TEACHER', 'tch-01', 'Active', now_str, now_str),
            ('usr-student-1', 'student', 'aarav.patel@student.smartschool.edu', generate_password_hash('CurosStudent@2026!'), 'Aarav Patel', 'STUDENT', 'std-101', 'Active', now_str, now_str),
            ('usr-parent-1', 'parent', 'vikram.patel@gmail.com', generate_password_hash('CurosParent@2026!'), 'Vikram Patel', 'PARENT', None, 'Active', now_str, now_str)
        ]
        cursor.executemany('''
        INSERT INTO users (id, username, email, password_hash, name, role, linked_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', bootstrap_users)
        cursor.execute('''
        INSERT OR IGNORE INTO parent_student_links (id, parent_user_id, student_id, relationship)
        VALUES ('psl-par-101', 'usr-parent-1', 'std-101', 'Father')
        ''')

    # Seed Service Requests
    cursor.execute('SELECT COUNT(*) FROM service_requests')
    if cursor.fetchone()[0] == 0:
        sr_data = [
            ('SR-201', 'Computer Lab 2', 'Projector HDMI port flickering', 'High', 'In Progress', 'usr-teacher-1', 'Mr. Rajesh Verma', '26 Aug 2025', 'Technician dispatched.'),
            ('SR-202', 'Sports Complex', 'Basketball court lighting sensor replacement', 'Medium', 'Pending Approval', 'usr-admin-1', 'Admin User', '25 Aug 2025', None),
            ('SR-203', 'Room 204', 'Smartboard software driver upgrade', 'Low', 'Resolved', 'usr-teacher-1', 'Mr. Rajesh Verma', '24 Aug 2025', 'Driver updated.')
        ]
        cursor.executemany('''
        INSERT INTO service_requests (id, facility, issue, priority, status, requester_id, requester_name, date, resolution_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', sr_data)

    # Seed Settings
    cursor.execute('SELECT COUNT(*) FROM settings')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
        INSERT INTO settings (id, school_name, academic_year, current_term, address, phone, email, principal_name)
        VALUES (1, 'Smart School International', '2025   2026', 'Term 1', 'Sector 14, Knowledge Park, New Delhi', '+91 11 2345 6789', 'contact@smartschool.edu', 'Dr. S. Nair')
        ''')

    conn.commit()
    conn.close()

# ----------------- Authentication Helpers -----------------

def get_current_user():
    auth_header = request.headers.get('Authorization', '')
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1]
    elif 'session_token' in request.cookies:
        token = request.cookies.get('session_token')
    elif request.args.get('token'):
        token = request.args.get('token')

    if not token:
        return None

    conn = get_db()
    session_row = conn.execute('SELECT * FROM sessions WHERE token = ?', (token,)).fetchone()
    if not session_row:
        conn.close()
        return None

    user_row = conn.execute('SELECT * FROM users WHERE id = ? AND status = "Active"', (session_row['user_id'],)).fetchone()
    conn.close()
    if not user_row:
        return None
    return dict(user_row)

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Unauthorized. Please login.'}), 401
        g.current_user = user
        return f(*args, **kwargs)
    return decorated

def require_roles(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({'error': 'Unauthorized. Please login.'}), 401
            if user['role'] not in roles:
                return jsonify({'error': f"Forbidden. Role '{user['role']}' does not have permission."}), 403
            g.current_user = user
            return f(*args, **kwargs)
        return decorated
    return decorator

def get_parent_child_ids(conn, parent_user_id):
    links = conn.execute('SELECT student_id FROM parent_student_links WHERE parent_user_id = ?', (parent_user_id,)).fetchall()
    return [l['student_id'] for l in links]

def get_teacher_assigned_classes(conn, user):
    teacher = conn.execute('SELECT * FROM teachers WHERE id = ? OR email = ?', (user.get('linked_id'), user.get('email'))).fetchone()
    raw_classes = []
    if teacher and teacher['classes_assigned']:
        try:
            raw_classes = json.loads(teacher['classes_assigned'])
        except Exception:
            raw_classes = ['Class 10A', 'Class 10-A']
    if not raw_classes:
        raw_classes = ['Class 10A', 'Class 10-A']
    
    expanded = set(raw_classes)
    for c in list(raw_classes):
        expanded.add(c.replace('-', ''))
        m = re.match(r'(Class\s*\d+)\s*([A-Za-z])', c)
        if m:
            expanded.add(f"{m.group(1)}-{m.group(2)}")
            expanded.add(f"{m.group(1)}{m.group(2)}")
    return list(expanded)

# ----------------- Auth Endpoints -----------------

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    identifier = (data.get('username') or data.get('email') or data.get('identifier') or '').strip()
    password = data.get('password', '')
    requested_role = (data.get('role') or data.get('requestedRole') or '').strip().upper()
    if not identifier or not password:
        return jsonify({'error': 'Username/email and password required'}), 400

    conn = get_db()
    user = conn.execute('''
    SELECT * FROM users WHERE (username = ? OR email = ?) AND status = 'Active'
    ''', (identifier, identifier)).fetchone()

    demo_passcodes = {
        'admin': 'CurosAdmin@2026!',
        'teacher': 'CurosTeacher@2026!',
        'student': 'CurosStudent@2026!',
        'parent': 'CurosParent@2026!'
    }

    is_valid = False
    if user:
        if check_password_hash(user['password_hash'], password):
            is_valid = True
        elif user['username'] in demo_passcodes and password == demo_passcodes[user['username']]:
            is_valid = True

    if not user or not is_valid:
        log_audit(conn, None, identifier, 'UNKNOWN', 'LOGIN_FAILED', 'User', None, 'Invalid credentials')
        conn.close()
        return jsonify({'error': 'Invalid username/email or password'}), 401

    if requested_role and requested_role != user['role']:
        log_audit(conn, user['id'], identifier, user['role'], 'LOGIN_FAILED', 'User', user['id'],
                  f"Role context mismatch: requested {requested_role} but assigned {user['role']}")
        conn.close()
        return jsonify({'error': 'Invalid credentials for the selected role'}), 401

    token = secrets.token_hex(32)
    expires = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
    conn.execute('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', (token, user['id'], expires))

    # Fetch linked info
    linked_student = None
    linked_children = []
    if user['role'] == 'STUDENT' and user['linked_id']:
        st = conn.execute('SELECT * FROM students WHERE id = ?', (user['linked_id'],)).fetchone()
        if st:
            linked_student = dict(st)
    elif user['role'] == 'PARENT':
        links = conn.execute('''
        SELECT DISTINCT s.* FROM students s
        JOIN parent_student_links psl ON s.id = psl.student_id
        WHERE psl.parent_user_id = ?
        ''', (user['id'],)).fetchall()
        linked_children = [dict(c) for c in links]

    log_audit(conn, user['id'], user['name'], user['role'], 'LOGIN_SUCCESS', 'User', user['id'], 'User logged in')
    conn.commit()
    conn.close()

    user_data = {
        'id': user['id'],
        'username': user['username'],
        'email': user['email'],
        'name': user['name'],
        'role': user['role'],
        'linkedId': user['linked_id'],
        'linkedStudent': linked_student,
        'linkedChildren': linked_children
    }
    return jsonify({'success': True, 'token': token, 'user': user_data})

@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.split(' ', 1)[1] if auth_header.startswith('Bearer ') else None
    if token:
        conn = get_db()
        conn.execute('DELETE FROM sessions WHERE token = ?', (token,))
        log_audit(conn, g.current_user['id'], g.current_user['name'], g.current_user['role'], 'LOGOUT', 'User', g.current_user['id'], 'User logged out')
        conn.commit()
        conn.close()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/auth/me', methods=['GET'])
@require_auth
def get_current_user_profile():
    conn = get_db()
    user = g.current_user
    linked_student = None
    linked_children = []
    if user['role'] == 'STUDENT' and user['linked_id']:
        st = conn.execute('SELECT * FROM students WHERE id = ?', (user['linked_id'],)).fetchone()
        if st:
            linked_student = dict(st)
    elif user['role'] == 'PARENT':
        links = conn.execute('''
        SELECT DISTINCT s.* FROM students s
        JOIN parent_student_links psl ON s.id = psl.student_id
        WHERE psl.parent_user_id = ?
        ''', (user['id'],)).fetchall()
        linked_children = [dict(c) for c in links]
    conn.close()
    return jsonify({
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'name': user['name'],
            'role': user['role'],
            'linkedId': user['linked_id'],
            'linkedStudent': linked_student,
            'linkedChildren': linked_children
        }
    })

@app.route('/api/auth/register-student', methods=['POST'])
def register_student():
    data = request.json or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    roll_number = data.get('rollNumber', '').strip()
    if not username or not email or not password or not roll_number:
        return jsonify({'error': 'Username, email, password, and roll number are required'}), 400

    conn = get_db()
    student = conn.execute('SELECT * FROM students WHERE roll_number = ?', (roll_number,)).fetchone()
    if not student:
        conn.close()
        return jsonify({'error': f'No verified student found with roll number {roll_number}'}), 404

    existing_user = conn.execute('SELECT * FROM users WHERE username = ? OR email = ?', (username, email)).fetchone()
    if existing_user:
        conn.close()
        return jsonify({'error': 'Username or email already registered'}), 409

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_user_id = f"usr-std-{int(time.time()*1000)}"
    conn.execute('''
    INSERT INTO users (id, username, email, password_hash, name, role, linked_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'STUDENT', ?, 'Active', ?, ?)
    ''', (new_user_id, username, email, generate_password_hash(password), student['name'], student['id'], now_str, now_str))

    token = secrets.token_hex(32)
    expires = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
    conn.execute('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', (token, new_user_id, expires))
    conn.commit()
    conn.close()

    return jsonify({
        'token': token,
        'user': {
            'id': new_user_id,
            'username': username,
            'email': email,
            'name': student['name'],
            'role': 'STUDENT',
            'linkedId': student['id'],
            'linkedStudent': dict(student)
        }
    }), 201

@app.route('/api/auth/register-parent', methods=['POST'])
def register_parent():
    data = request.json or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    child_roll = data.get('childRollNumber', '').strip()
    if not username or not email or not password or not name or not child_roll:
        return jsonify({'error': 'Name, username, email, password, and child roll number required'}), 400

    conn = get_db()
    student = conn.execute('SELECT * FROM students WHERE roll_number = ?', (child_roll,)).fetchone()
    if not student:
        conn.close()
        return jsonify({'error': f'Child student with roll number {child_roll} not found'}), 404

    existing_user = conn.execute('SELECT * FROM users WHERE username = ? OR email = ?', (username, email)).fetchone()
    if existing_user:
        conn.close()
        return jsonify({'error': 'Username or email already registered'}), 409

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_user_id = f"usr-par-{int(time.time()*1000)}"
    conn.execute('''
    INSERT INTO users (id, username, email, password_hash, name, role, linked_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'PARENT', NULL, 'Active', ?, ?)
    ''', (new_user_id, username, email, generate_password_hash(password), name, now_str, now_str))

    # Link parent to student
    conn.execute('''
    INSERT INTO parent_student_links (id, parent_user_id, student_id, relationship)
    VALUES (?, ?, ?, 'Parent')
    ''', (f"psl-{int(time.time()*1000)}", new_user_id, student['id']))

    token = secrets.token_hex(32)
    expires = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
    conn.execute('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', (token, new_user_id, expires))
    conn.commit()
    conn.close()

    return jsonify({
        'token': token,
        'user': {
            'id': new_user_id,
            'username': username,
            'email': email,
            'name': name,
            'role': 'PARENT',
            'linkedChildren': [dict(student)]
        }
    }), 201

# ----------------- User Management & RBAC Governance (Admin Only) -----------------

@app.route('/api/users', methods=['GET', 'POST'])
@require_roles('ADMIN')
def manage_users():
    conn = get_db()
    if request.method == 'POST':
        data = request.json or {}
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', 'password123')
        name = data.get('name', '').strip()
        role = data.get('role', 'STUDENT').upper()
        linked_id = data.get('linkedId')
        if not username or not email or not name:
            conn.close()
            return jsonify({'error': 'Username, email, and name are required'}), 400
        existing = conn.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email)).fetchone()
        if existing:
            conn.close()
            return jsonify({'error': 'Username or email already exists'}), 409
        new_id = f"usr-{int(time.time()*1000)}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        conn.execute('''
        INSERT INTO users (id, username, email, password_hash, name, role, linked_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)
        ''', (new_id, username, email, generate_password_hash(password), name, role, linked_id, now_str, now_str))
        log_audit(conn, g.current_user['id'], g.current_user['name'], g.current_user['role'], 'CREATE_USER', 'User', new_id, f"Created account {username} with role {role}")
        conn.commit()
        conn.close()
        return jsonify({'id': new_id, 'username': username, 'email': email, 'name': name, 'role': role, 'status': 'Active'}), 201

    rows = conn.execute('''
    SELECT id, username, email, name, role, linked_id, status, created_at, updated_at
    FROM users ORDER BY created_at DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/users/<id>/role', methods=['PUT'])
@require_roles('ADMIN')
def update_user_role(id):
    data = request.json or {}
    new_role = data.get('role')
    new_status = data.get('status', 'Active')
    linked_id = data.get('linkedId')
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (id,)).fetchone()
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    role_to_set = new_role.upper() if new_role else user['role']
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    conn.execute('''
    UPDATE users SET role = ?, status = ?, linked_id = COALESCE(?, linked_id), updated_at = ?
    WHERE id = ?
    ''', (role_to_set, new_status, linked_id, now_str, id))
    log_audit(conn, g.current_user['id'], g.current_user['name'], g.current_user['role'], 'UPDATE_USER_ROLE', 'User', id, f"Role changed to {role_to_set}, Status: {new_status}")
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'id': id, 'role': role_to_set, 'status': new_status})

@app.route('/api/users/link-child', methods=['POST'])
@require_roles('ADMIN')
def link_parent_child():
    data = request.json or {}
    parent_user_id = data.get('parentUserId')
    student_id = data.get('studentId')
    relationship = data.get('relationship', 'Parent')
    if not parent_user_id or not student_id:
        return jsonify({'error': 'Parent User ID and Student ID required'}), 400
    conn = get_db()
    new_id = f"psl-{int(time.time()*1000)}"
    conn.execute('''
    INSERT OR REPLACE INTO parent_student_links (id, parent_user_id, student_id, relationship)
    VALUES (?, ?, ?, ?)
    ''', (new_id, parent_user_id, student_id, relationship))
    log_audit(conn, g.current_user['id'], g.current_user['name'], g.current_user['role'], 'LINK_PARENT_CHILD', 'ParentStudentLink', new_id, f"Linked parent {parent_user_id} to student {student_id}")
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'linkId': new_id})

# ----------------- Role Dashboards Summaries -----------------

@app.route('/api/dashboard/teacher', methods=['GET'])
@require_roles('TEACHER', 'ADMIN')
def teacher_dashboard():
    conn = get_db()
    user = g.current_user
    assigned_classes = get_teacher_assigned_classes(conn, user)
    
    # Schedule for teacher
    schedule = conn.execute('SELECT * FROM schedule WHERE teacher LIKE ? OR location LIKE ?', (f"%{user['name']}%", '%Staff%')).fetchall()
    
    # Pending complaints assigned to teacher
    complaints = conn.execute('''
    SELECT * FROM complaints WHERE status != 'RESOLVED' AND (assigned_staff_id = ? OR assigned_to LIKE ?)
    ''', (user['id'], f"%{user['name']}%")).fetchall()

    # Pending leave requests for teacher's classes
    placeholders = ','.join('?' for _ in assigned_classes)
    leaves = conn.execute(f'''
    SELECT * FROM leave_applications WHERE status = 'PENDING' AND class IN ({placeholders})
    ''', assigned_classes).fetchall() if assigned_classes else []

    # Student count in teacher's classes
    student_count = conn.execute(f'''
    SELECT COUNT(*) FROM students WHERE class IN ({placeholders})
    ''', assigned_classes).fetchone()[0] if assigned_classes else 0

    # Submissions to grade
    submissions_to_grade = conn.execute('''
    SELECT COUNT(*) FROM submissions s
    JOIN assignments a ON s.assignment_id = a.id
    WHERE a.teacher_id = ? AND s.status = 'SUBMITTED'
    ''', (user['id'],)).fetchone()[0]

    conn.close()
    return jsonify({
        'teacherName': user['name'],
        'assignedClasses': assigned_classes,
        'todayClasses': [dict(s) for s in schedule],
        'pendingComplaints': [dict(c) for c in complaints],
        'pendingLeaves': [dict(l) for l in leaves],
        'totalStudentsInClasses': student_count,
        'pendingSubmissionsToGrade': submissions_to_grade
    })

@app.route('/api/dashboard/student', methods=['GET'])
@require_roles('STUDENT', 'ADMIN')
def student_dashboard():
    conn = get_db()
    user = g.current_user
    linked_id = user.get('linked_id')
    if not linked_id:
        linked_id = request.args.get('studentId')
        if not linked_id:
            first_std = conn.execute('SELECT id FROM students ORDER BY id LIMIT 1').fetchone()
            if first_std:
                linked_id = first_std['id']

    student = conn.execute('SELECT * FROM students WHERE id = ?', (linked_id,)).fetchone()
    if not student:
        student = conn.execute('SELECT * FROM students ORDER BY id LIMIT 1').fetchone()
        if not student:
            conn.close()
            return jsonify({'error': 'Student record not linked'}), 404

    st_dict = dict(student)
    st_class = st_dict.get('class', 'Class 10A')

    try:
        today_schedule = conn.execute('SELECT * FROM schedule WHERE title LIKE ? OR class_assigned = ?', (f"%{st_class}%", st_class)).fetchall()
    except Exception:
        today_schedule = conn.execute('SELECT * FROM schedule WHERE title LIKE ?', (f"%{st_class}%",)).fetchall()

    assignments = conn.execute('SELECT * FROM assignments WHERE class = ? ORDER BY due_date ASC', (st_class,)).fetchall()
    results = conn.execute('SELECT * FROM exams_results WHERE student_id = ? AND published = 1', (st_dict['id'],)).fetchall()
    fee_rec = conn.execute('SELECT * FROM fees WHERE student_id = ?', (st_dict['id'],)).fetchone()
    complaints = conn.execute('SELECT * FROM complaints WHERE submitted_by_id = ? OR linked_student_id = ?', (user['id'], st_dict['id'])).fetchall()

    conn.close()
    return jsonify({
        'student': st_dict,
        'todayClasses': [dict(s) for s in today_schedule],
        'assignments': [dict(a) for a in assignments],
        'results': [dict(r) for r in results],
        'feeRecord': dict(fee_rec) if fee_rec else None,
        'myComplaints': [dict(c) for c in complaints]
    })

@app.route('/api/dashboard/parent', methods=['GET'])
@require_roles('PARENT', 'ADMIN')
def parent_dashboard():
    conn = get_db()
    user = g.current_user
    
    # Optional child filter query parameter: ?childId=std-101
    requested_child_id = request.args.get('childId')
    
    children_rows = conn.execute('''
    SELECT DISTINCT s.* FROM students s
    JOIN parent_student_links psl ON s.id = psl.student_id
    WHERE psl.parent_user_id = ?
    ''', (user['id'],)).fetchall()
    
    children_list = [dict(c) for c in children_rows]
    if not children_list and user['role'] == 'ADMIN':
        preview_rows = conn.execute('SELECT * FROM students LIMIT 2').fetchall()
        children_list = [dict(c) for c in preview_rows]

    # If childId requested, verify ownership
    if requested_child_id:
        if user['role'] != 'ADMIN' and not any(c['id'] == requested_child_id for c in children_list):
            conn.close()
            return jsonify({'error': 'Forbidden. Requested student is not linked to this parent account.'}), 403

    child_data = []
    for cd in children_list:
        results = conn.execute('SELECT * FROM exams_results WHERE student_id = ? AND published = 1', (cd['id'],)).fetchall()
        fee = conn.execute('SELECT * FROM fees WHERE student_id = ?', (cd['id'],)).fetchone()
        leaves = conn.execute('SELECT * FROM leave_applications WHERE student_id = ? ORDER BY created_at DESC', (cd['id'],)).fetchall()
        assignments = conn.execute('SELECT * FROM assignments WHERE class = ? ORDER BY due_date ASC', (cd['class'],)).fetchall()
        
        cd_copy = dict(cd)
        cd_copy['results'] = [dict(r) for r in results]
        cd_copy['fee'] = dict(fee) if fee else None
        cd_copy['leaves'] = [dict(l) for l in leaves]
        cd_copy['assignments'] = [dict(a) for a in assignments]
        child_data.append(cd_copy)

    meetings = conn.execute('SELECT * FROM meetings WHERE requester_id = ? ORDER BY preferred_date DESC', (user['id'],)).fetchall()
    complaints = conn.execute('SELECT * FROM complaints WHERE submitted_by_id = ? ORDER BY date DESC', (user['id'],)).fetchall()

    conn.close()
    return jsonify({
        'parentName': user['name'],
        'children': child_data,
        'meetings': [dict(m) for m in meetings],
        'complaints': [dict(c) for c in complaints]
    })

# ----------------- Students Directory (Strict RBAC) -----------------

@app.route('/api/students', methods=['GET', 'POST'])
@require_auth
def handle_students():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        if user['role'] != 'ADMIN':
            conn.close()
            return jsonify({'error': 'Forbidden. Only administrators can enroll new students.'}), 403
        data = request.json or {}
        new_id = f"std-{int(time.time() * 1000)}"
        conn.execute('''
        INSERT INTO students (id, name, roll_number, class, gender, status, guardian_name, phone, email, address, attendance_rate, fee_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            new_id, data['name'], data['rollNumber'], data['class'], data.get('gender', 'Male'),
            'Active', data.get('guardianName', 'Guardian'), data.get('phone', ''),
            data.get('email', ''), data.get('address', ''), 100, 'Pending'
        ))
        log_audit(conn, user['id'], user['name'], user['role'], 'ENROLL_STUDENT', 'Student', new_id, f"Enrolled student {data['name']} in {data['class']}")
        conn.commit()
        conn.close()
        return jsonify({'id': new_id, **data}), 201

    # Role-based query filtering
    if user['role'] == 'ADMIN':
        rows = conn.execute('SELECT * FROM students ORDER BY id ASC').fetchall()
    elif user['role'] == 'TEACHER':
        assigned_classes = get_teacher_assigned_classes(conn, user)
        placeholders = ','.join('?' for _ in assigned_classes)
        rows = conn.execute(f'SELECT * FROM students WHERE class IN ({placeholders}) ORDER BY id ASC', assigned_classes).fetchall()
    elif user['role'] == 'STUDENT':
        rows = conn.execute('SELECT * FROM students WHERE id = ?', (user.get('linked_id'),)).fetchall()
    elif user['role'] == 'PARENT':
        child_ids = get_parent_child_ids(conn, user['id'])
        placeholders = ','.join('?' for _ in child_ids) if child_ids else "''"
        rows = conn.execute(f'SELECT * FROM students WHERE id IN ({placeholders}) ORDER BY id ASC', child_ids).fetchall() if child_ids else []

    conn.close()
    return jsonify([
        {
            'id': r['id'],
            'name': r['name'],
            'rollNumber': r['roll_number'],
            'class': r['class'],
            'gender': r['gender'],
            'status': r['status'],
            'guardianName': r['guardian_name'],
            'phone': r['phone'],
            'email': r['email'],
            'address': r['address'],
            'attendanceRate': r['attendance_rate'],
            'feeStatus': r['fee_status']
        } for r in rows
    ])

@app.route('/api/students/<id>', methods=['GET', 'PUT'])
@require_auth
def get_or_update_student(id):
    conn = get_db()
    user = g.current_user
    # Ownership check
    st = conn.execute('SELECT * FROM students WHERE id = ?', (id,)).fetchone()
    if not st:
        conn.close()
        return jsonify({'error': 'Student not found'}), 404

    if user['role'] == 'STUDENT' and user.get('linked_id') != id:
        conn.close()
        return jsonify({'error': 'Forbidden. Cannot access another student record.'}), 403

    if user['role'] == 'PARENT':
        child_ids = get_parent_child_ids(conn, user['id'])
        if id not in child_ids:
            conn.close()
            return jsonify({'error': 'Forbidden. Student is not your linked child.'}), 403

    if user['role'] == 'TEACHER':
        assigned_classes = get_teacher_assigned_classes(conn, user)
        if st['class'] not in assigned_classes:
            conn.close()
            return jsonify({'error': f"Forbidden. Student belongs to unassigned section '{st['class']}'."}), 403

    if request.method == 'PUT':
        if user['role'] != 'ADMIN':
            conn.close()
            return jsonify({'error': 'Forbidden. Only administrators can modify student records.'}), 403
        data = request.json or {}
        conn.execute('''
        UPDATE students SET name = COALESCE(?, name), class = COALESCE(?, class), status = COALESCE(?, status),
        guardian_name = COALESCE(?, guardian_name), phone = COALESCE(?, phone), address = COALESCE(?, address)
        WHERE id = ?
        ''', (data.get('name'), data.get('class'), data.get('status'), data.get('guardianName'), data.get('phone'), data.get('address'), id))
        log_audit(conn, user['id'], user['name'], user['role'], 'UPDATE_STUDENT', 'Student', id, 'Updated student record')
        conn.commit()
        st = conn.execute('SELECT * FROM students WHERE id = ?', (id,)).fetchone()

    conn.close()
    return jsonify(dict(st))

# ----------------- Faculty Directory (Role-Scoped) -----------------

@app.route('/api/teachers', methods=['GET', 'POST'])
@require_auth
def handle_teachers():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        if user['role'] != 'ADMIN':
            conn.close()
            return jsonify({'error': 'Forbidden. Only administrators can add faculty members.'}), 403
        data = request.json or {}
        new_id = f"tch-{int(time.time() * 1000)}"
        conn.execute('''
        INSERT INTO teachers (id, name, employee_id, subject, department, email, phone, classes_assigned, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            new_id, data['name'], data.get('employeeId', f"EMP-T{secrets.randbelow(899)+100}"), data['subject'],
            data.get('department', 'Science & Math'), data.get('email', ''),
            data.get('phone', ''), json.dumps(data.get('classesAssigned', ['Class 10A'])), 'Active'
        ))
        log_audit(conn, user['id'], user['name'], user['role'], 'ADD_TEACHER', 'Teacher', new_id, f"Added faculty {data['name']}")
        conn.commit()
        conn.close()
        return jsonify({'id': new_id, **data}), 201

    rows = conn.execute('SELECT * FROM teachers ORDER BY id ASC').fetchall()
    conn.close()
    return jsonify([
        {
            'id': r['id'],
            'name': r['name'],
            'employeeId': r['employee_id'],
            'subject': r['subject'],
            'department': r['department'],
            'email': r['email'],
            'phone': r['phone'],
            'classesAssigned': json.loads(r['classes_assigned'] or '[]'),
            'status': r['status']
        } for r in rows
    ])

# ----------------- Fees & Financial Records (Strict RBAC) -----------------

@app.route('/api/fees', methods=['GET', 'POST'])
@require_auth
def handle_fees():
    conn = get_db()
    user = g.current_user

    # Teachers must NEVER access financial records
    if user['role'] == 'TEACHER':
        conn.close()
        return jsonify({'error': 'Forbidden. Teachers are not authorized to access school financial and fee records.'}), 403

    if request.method == 'POST':
        if user['role'] != 'ADMIN':
            conn.close()
            return jsonify({'error': 'Forbidden. Only administrators can issue fee invoices.'}), 403
        data = request.json or {}
        new_id = f"fee-{int(time.time() * 1000)}"
        conn.execute('''
        INSERT INTO fees (id, student_id, student_name, roll_number, class, term, total_amount, paid_amount, status, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            new_id, data['studentId'], data['studentName'], data['rollNumber'], data['class'],
            data.get('term', 'Term 1 (2025-26)'), data.get('totalAmount', 18500), data.get('paidAmount', 0),
            data.get('status', 'Pending'), data.get('dueDate', '15 Sep 2025')
        ))
        log_audit(conn, user['id'], user['name'], user['role'], 'ISSUE_FEE_INVOICE', 'Fee', new_id, f"Issued invoice for {data['studentName']}")
        conn.commit()
        conn.close()
        return jsonify({'id': new_id, **data}), 201

    if user['role'] == 'ADMIN':
        rows = conn.execute('SELECT * FROM fees ORDER BY id ASC').fetchall()
    elif user['role'] == 'STUDENT':
        rows = conn.execute('SELECT * FROM fees WHERE student_id = ?', (user.get('linked_id'),)).fetchall()
    elif user['role'] == 'PARENT':
        child_ids = get_parent_child_ids(conn, user['id'])
        placeholders = ','.join('?' for _ in child_ids) if child_ids else "''"
        rows = conn.execute(f'SELECT * FROM fees WHERE student_id IN ({placeholders})', child_ids).fetchall() if child_ids else []

    conn.close()
    return jsonify([
        {
            'id': r['id'],
            'studentId': r['student_id'],
            'studentName': r['student_name'],
            'rollNumber': r['roll_number'],
            'class': r['class'],
            'term': r['term'],
            'totalAmount': r['total_amount'],
            'paidAmount': r['paid_amount'],
            'status': r['status'],
            'dueDate': r['due_date']
        } for r in rows
    ])

@app.route('/api/fees/<id>/pay', methods=['PUT'])
@require_auth
def record_fee_payment(id):
    conn = get_db()
    user = g.current_user
    row = conn.execute('SELECT * FROM fees WHERE id = ?', (id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Fee record not found'}), 404

    # Permission check: Admin or linked Parent/Student can pay
    if user['role'] == 'STUDENT' and row['student_id'] != user.get('linked_id'):
        conn.close()
        return jsonify({'error': 'Forbidden. Cannot pay another student fees.'}), 403
    if user['role'] == 'PARENT':
        child_ids = get_parent_child_ids(conn, user['id'])
        if row['student_id'] not in child_ids:
            conn.close()
            return jsonify({'error': 'Forbidden. Cannot pay fees for unrelated student.'}), 403
    if user['role'] == 'TEACHER':
        conn.close()
        return jsonify({'error': 'Forbidden. Teachers cannot process payments.'}), 403

    conn.execute('UPDATE fees SET paid_amount = total_amount, status = "Paid" WHERE id = ?', (id,))
    log_audit(conn, user['id'], user['name'], user['role'], 'RECORD_FEE_PAYMENT', 'Fee', id, f"Recorded payment for {row['student_name']} (₹{row['total_amount']})")
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'id': id, 'status': 'Paid'})

# ----------------- Attendance (Strict Ownership & Assigned Class Checks) -----------------

@app.route('/api/attendance', methods=['GET', 'POST'])
@require_auth
def handle_attendance():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        if user['role'] not in ['ADMIN', 'TEACHER']:
            conn.close()
            return jsonify({'error': 'Forbidden. Only teachers and administrators can mark attendance.'}), 403
        data = request.json or {}
        att_class = data.get('class', 'Class 10A')
        att_date = data.get('date', datetime.now().strftime("%Y-%m-%d"))
        records = data.get('records', [])

        # Server-side authorization: Teacher MUST be assigned to this class!
        if user['role'] == 'TEACHER':
            assigned_classes = get_teacher_assigned_classes(conn, user)
            if att_class not in assigned_classes:
                conn.close()
                return jsonify({'error': f"Forbidden. Teacher '{user['name']}' is not authorized to mark attendance for unassigned class '{att_class}'."}), 403

        for r in records:
            st_id = r.get('studentId')
            st_stat = r.get('status', 'PRESENT').upper()
            st = conn.execute('SELECT name FROM students WHERE id = ?', (st_id,)).fetchone()
            st_name = st['name'] if st else 'Student'
            rec_id = f"att-{att_class}-{att_date}-{st_id}"
            conn.execute('''
            INSERT OR REPLACE INTO attendance_records (id, class, date, student_id, student_name, status, marked_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (rec_id, att_class, att_date, st_id, st_name, st_stat, user['name']))

            if st_stat == 'ABSENT':
                par_link = conn.execute('SELECT parent_user_id FROM parent_student_links WHERE student_id = ?', (st_id,)).fetchone()
                if par_link:
                    create_notification(conn, par_link['parent_user_id'], 'attendance', f"Absence Alert: {st_name}", f"{st_name} was marked absent on {att_date} for {att_class}.", '/attendance', 'attendance', rec_id)

        log_audit(conn, user['id'], user['name'], user['role'], 'MARK_ATTENDANCE', 'Attendance', f"{att_class}-{att_date}", f"Marked attendance for {len(records)} students in {att_class}")
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'count': len(records)})

    # GET attendance records with role scoping
    att_class = request.args.get('class', 'Class 10A')
    att_date = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    if user['role'] == 'ADMIN':
        rows = conn.execute('SELECT * FROM attendance_records WHERE class = ? AND date = ?', (att_class, att_date)).fetchall()
    elif user['role'] == 'TEACHER':
        assigned_classes = get_teacher_assigned_classes(conn, user)
        if att_class in assigned_classes:
            rows = conn.execute('SELECT * FROM attendance_records WHERE class = ? AND date = ?', (att_class, att_date)).fetchall()
        else:
            rows = []
    elif user['role'] == 'STUDENT':
        rows = conn.execute('SELECT * FROM attendance_records WHERE student_id = ? ORDER BY date DESC LIMIT 30', (user.get('linked_id'),)).fetchall()
    elif user['role'] == 'PARENT':
        child_ids = get_parent_child_ids(conn, user['id'])
        placeholders = ','.join('?' for _ in child_ids) if child_ids else "''"
        rows = conn.execute(f'SELECT * FROM attendance_records WHERE student_id IN ({placeholders}) ORDER BY date DESC LIMIT 30', child_ids).fetchall() if child_ids else []

    conn.close()
    return jsonify([dict(r) for r in rows])

# ----------------- Assignments (Class & Teacher Ownership) -----------------

@app.route('/api/assignments', methods=['GET', 'POST'])
@require_auth
def handle_assignments():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        if user['role'] not in ['ADMIN', 'TEACHER']:
            conn.close()
            return jsonify({'error': 'Forbidden. Only authorized teachers and administrators can post assignments.'}), 403
        data = request.json or {}
        title = data.get('title', '').strip()
        asg_class = data.get('class', 'Class 10A')
        subject = data.get('subject', 'Mathematics')
        due_date = data.get('dueDate', (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"))

        # Teacher class authorization check
        if user['role'] == 'TEACHER':
            assigned_classes = get_teacher_assigned_classes(conn, user)
            if asg_class not in assigned_classes:
                conn.close()
                return jsonify({'error': f"Forbidden. Cannot publish assignments for unassigned class '{asg_class}'."}), 403

        if not title:
            conn.close()
            return jsonify({'error': 'Assignment title required'}), 400

        new_id = f"asg-{int(time.time()*1000)}"
        now_str = datetime.now().strftime("%Y-%m-%d")
        conn.execute('''
        INSERT INTO assignments (id, title, description, class, subject, teacher_id, teacher_name, due_date, max_marks, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (new_id, title, data.get('description', ''), asg_class, subject, user['id'], user['name'], due_date, data.get('maxMarks', 100), now_str))

        students = conn.execute('SELECT id FROM students WHERE class = ?', (asg_class,)).fetchall()
        for st in students:
            st_user = conn.execute('SELECT id FROM users WHERE linked_id = ?', (st['id'],)).fetchone()
            if st_user:
                create_notification(conn, st_user['id'], 'assignment', f"New Assignment: {title}", f"Due {due_date} for {subject}.", '/assignments', 'assignment', new_id)

        log_audit(conn, user['id'], user['name'], user['role'], 'CREATE_ASSIGNMENT', 'Assignment', new_id, f"Published assignment {title} for {asg_class}")
        conn.commit()
        created = conn.execute('SELECT * FROM assignments WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(created)), 201

    if user['role'] == 'STUDENT':
        student = conn.execute('SELECT class FROM students WHERE id = ?', (user.get('linked_id'),)).fetchone()
        st_class = student['class'] if student else 'Class 10A'
        rows = conn.execute('SELECT * FROM assignments WHERE class = ? ORDER BY due_date ASC', (st_class,)).fetchall()
    elif user['role'] == 'PARENT':
        links = conn.execute('SELECT s.class FROM students s JOIN parent_student_links psl ON s.id = psl.student_id WHERE psl.parent_user_id = ?', (user['id'],)).fetchall()
        classes = [l['class'] for l in links]
        placeholders = ','.join('?' for _ in classes) if classes else "''"
        rows = conn.execute(f'SELECT * FROM assignments WHERE class IN ({placeholders}) ORDER BY due_date ASC', classes).fetchall() if classes else []
    elif user['role'] == 'TEACHER':
        assigned_classes = get_teacher_assigned_classes(conn, user)
        placeholders = ','.join('?' for _ in assigned_classes) if assigned_classes else "''"
        rows = conn.execute(f'SELECT * FROM assignments WHERE class IN ({placeholders}) OR teacher_id = ? ORDER BY due_date ASC', assigned_classes + [user['id']]).fetchall()
    else:
        rows = conn.execute('SELECT * FROM assignments ORDER BY due_date ASC').fetchall()

    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/assignments/<id>/submit', methods=['POST'])
@require_roles('STUDENT', 'ADMIN')
def submit_assignment(id):
    data = request.json or {}
    content = data.get('content', '').strip()
    if not content:
        return jsonify({'error': 'Submission answer content required'}), 400

    conn = get_db()
    asg = conn.execute('SELECT * FROM assignments WHERE id = ?', (id,)).fetchone()
    if not asg:
        conn.close()
        return jsonify({'error': 'Assignment not found'}), 404

    user = g.current_user
    new_sub_id = f"sub-{int(time.time()*1000)}"
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn.execute('''
    INSERT INTO submissions (id, assignment_id, student_id, student_name, content, status, submitted_at)
    VALUES (?, ?, ?, ?, ?, 'SUBMITTED', ?)
    ''', (new_sub_id, id, user.get('linked_id') or user['id'], user['name'], content, now_str))

    create_notification(conn, asg['teacher_id'], 'assignment', f"Work Submitted: {asg['title']}", f"{user['name']} submitted their response.", '/assignments', 'submission', new_sub_id)
    log_audit(conn, user['id'], user['name'], user['role'], 'SUBMIT_ASSIGNMENT', 'Submission', new_sub_id, f"Submitted work for assignment {id}")
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'submissionId': new_sub_id, 'message': 'Assignment submitted successfully'})

@app.route('/api/submissions/<id>/grade', methods=['PUT'])
@require_roles('TEACHER', 'ADMIN')
def grade_submission(id):
    data = request.json or {}
    marks = data.get('marksAwarded')
    feedback = data.get('feedback', '')
    if marks is None:
        return jsonify({'error': 'Marks awarded required'}), 400

    conn = get_db()
    sub = conn.execute('SELECT * FROM submissions WHERE id = ?', (id,)).fetchone()
    if not sub:
        conn.close()
        return jsonify({'error': 'Submission not found'}), 404

    conn.execute('''
    UPDATE submissions SET marks_awarded = ?, feedback = ?, status = 'GRADED' WHERE id = ?
    ''', (marks, feedback, id))

    st_user = conn.execute('SELECT id FROM users WHERE linked_id = ?', (sub['student_id'],)).fetchone()
    if st_user:
        create_notification(conn, st_user['id'], 'exam', 'Assignment Graded', f"You scored {marks} marks. Feedback: {feedback}", '/assignments', 'submission', id)

    log_audit(conn, g.current_user['id'], g.current_user['name'], g.current_user['role'], 'GRADE_SUBMISSION', 'Submission', id, f"Awarded {marks} marks")
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Grade recorded and student notified'})

# ----------------- Exam Results (Strict Publication & Ownership) -----------------

@app.route('/api/exams/results', methods=['GET', 'POST'])
@require_auth
def handle_exam_results():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        if user['role'] not in ['ADMIN', 'TEACHER']:
            conn.close()
            return jsonify({'error': 'Forbidden. Only teachers and admins can enter exam marks.'}), 403
        data = request.json or {}
        exam_class = data.get('class', 'Class 10A')

        if user['role'] == 'TEACHER':
            assigned_classes = get_teacher_assigned_classes(conn, user)
            if exam_class not in assigned_classes:
                conn.close()
                return jsonify({'error': f"Forbidden. Cannot record marks for unassigned class '{exam_class}'."}), 403

        new_id = f"res-{int(time.time()*1000)}"
        marks_obt = float(data['marksObtained'])
        max_m = float(data.get('maxMarks', 100))
        pct = (marks_obt / max_m) * 100
        grade = 'A1' if pct >= 90 else 'A2' if pct >= 80 else 'B1' if pct >= 70 else 'B2' if pct >= 60 else 'C1'

        conn.execute('''
        INSERT INTO exams_results (id, exam_name, student_id, student_name, class, subject, marks_obtained, max_marks, grade, published, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        ''', (new_id, data['examName'], data['studentId'], data['studentName'], exam_class, data['subject'], marks_obt, max_m, grade, data.get('remarks', '')))

        st_user = conn.execute('SELECT id FROM users WHERE linked_id = ?', (data['studentId'],)).fetchone()
        if st_user:
            create_notification(conn, st_user['id'], 'exam', f"Exam Result Published: {data['subject']}", f"Scored {marks_obt}/{max_m} (Grade {grade}) in {data['examName']}.", '/exams', 'result', new_id)

        log_audit(conn, user['id'], user['name'], user['role'], 'ENTER_MARKS', 'ExamResult', new_id, f"Recorded marks for {data['studentName']}")
        conn.commit()
        created = conn.execute('SELECT * FROM exams_results WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(created)), 201

    if user['role'] == 'STUDENT':
        rows = conn.execute('SELECT * FROM exams_results WHERE student_id = ? AND published = 1', (user.get('linked_id'),)).fetchall()
    elif user['role'] == 'PARENT':
        child_ids = get_parent_child_ids(conn, user['id'])
        placeholders = ','.join('?' for _ in child_ids) if child_ids else "''"
        rows = conn.execute(f'SELECT * FROM exams_results WHERE student_id IN ({placeholders}) AND published = 1', child_ids).fetchall() if child_ids else []
    elif user['role'] == 'TEACHER':
        assigned_classes = get_teacher_assigned_classes(conn, user)
        placeholders = ','.join('?' for _ in assigned_classes) if assigned_classes else "''"
        rows = conn.execute(f'SELECT * FROM exams_results WHERE class IN ({placeholders}) ORDER BY exam_name ASC', assigned_classes).fetchall() if assigned_classes else []
    else:
        rows = conn.execute('SELECT * FROM exams_results ORDER BY exam_name ASC').fetchall()

    conn.close()
    return jsonify([
        {
            'id': r['id'],
            'examName': r['exam_name'],
            'studentId': r['student_id'],
            'studentName': r['student_name'],
            'class': r['class'],
            'subject': r['subject'],
            'marksObtained': r['marks_obtained'],
            'maxMarks': r['max_marks'],
            'grade': r['grade'],
            'published': r['published'],
            'remarks': r['remarks']
        } for r in rows
    ])

# ----------------- Meetings & Principal Booking -----------------

@app.route('/api/meetings', methods=['GET', 'POST'])
@require_auth
def handle_meetings():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        data = request.json or {}
        preferred_date = data.get('preferredDate')
        preferred_time = data.get('preferredTime')
        reason = data.get('reason', '').strip()
        meeting_type = data.get('meetingType', 'Principal Meeting')
        target_staff_id = data.get('targetStaffId', 'usr-admin-1')
        target_staff_name = data.get('targetStaffName', 'Principal Office')
        linked_student_id = data.get('linkedStudentId') or user.get('linked_id')

        if not preferred_date or not preferred_time or not reason:
            conn.close()
            return jsonify({'error': 'Preferred date, time slot, and reason required'}), 400

        # Conflict check
        existing = conn.execute('''
        SELECT * FROM meetings WHERE target_staff_id = ? AND preferred_date = ? AND preferred_time = ? AND status = 'CONFIRMED'
        ''', (target_staff_id, preferred_date, preferred_time)).fetchone()

        if existing:
            conn.close()
            return jsonify({'error': f'Slot {preferred_date} at {preferred_time} is already booked for this staff member. Please select another time.'}), 409

        new_id = f"mtg-{int(time.time()*1000)}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        conn.execute('''
        INSERT INTO meetings (id, requester_id, requester_name, requester_role, linked_student_id, target_staff_id, target_staff_name, meeting_type, reason, description, preferred_date, preferred_time, mode, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
        ''', (
            new_id, user['id'], user['name'], user['role'], linked_student_id, target_staff_id,
            target_staff_name, meeting_type, reason, data.get('description', ''), preferred_date,
            preferred_time, data.get('mode', 'In-person'), now_str, now_str
        ))

        create_notification(
            conn, target_staff_id, 'meeting',
            f"New Meeting Request: {meeting_type}",
            f"{user['name']} requested a {meeting_type} on {preferred_date} at {preferred_time}.",
            '/meetings', 'meeting', new_id
        )
        log_audit(conn, user['id'], user['name'], user['role'], 'REQUEST_MEETING', 'Meeting', new_id, f"Requested {meeting_type} on {preferred_date}")
        conn.commit()
        created = conn.execute('SELECT * FROM meetings WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(created)), 201

    if user['role'] == 'ADMIN':
        rows = conn.execute('SELECT * FROM meetings ORDER BY preferred_date DESC').fetchall()
    elif user['role'] == 'TEACHER':
        rows = conn.execute('SELECT * FROM meetings WHERE target_staff_id = ? OR requester_id = ? ORDER BY preferred_date DESC', (user['id'], user['id'])).fetchall()
    else:
        rows = conn.execute('SELECT * FROM meetings WHERE requester_id = ? ORDER BY preferred_date DESC', (user['id'],)).fetchall()

    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/meetings/<id>/status', methods=['PUT'])
@require_roles('ADMIN', 'TEACHER')
def update_meeting_status(id):
    data = request.json or {}
    new_status = data.get('status', 'CONFIRMED')
    notes = data.get('decisionNotes', '')
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db()
    mtg = conn.execute('SELECT * FROM meetings WHERE id = ?', (id,)).fetchone()
    if not mtg:
        conn.close()
        return jsonify({'error': 'Meeting not found'}), 404

    if new_status == 'CONFIRMED':
        conflict = conn.execute('''
        SELECT * FROM meetings WHERE target_staff_id = ? AND preferred_date = ? AND preferred_time = ? AND status = 'CONFIRMED' AND id != ?
        ''', (mtg['target_staff_id'], mtg['preferred_date'], mtg['preferred_time'], id)).fetchone()
        if conflict:
            conn.close()
            return jsonify({'error': 'Cannot confirm: Another meeting is already confirmed for this staff at this exact slot'}), 409

    conn.execute('''
    UPDATE meetings SET status = ?, decision_notes = ?, updated_at = ? WHERE id = ?
    ''', (new_status, notes, now_str, id))

    create_notification(
        conn, mtg['requester_id'], 'meeting',
        f"Meeting Request {new_status}",
        f"Your {mtg['meeting_type']} on {mtg['preferred_date']} has been marked as {new_status}. {notes}",
        '/meetings', 'meeting', id
    )
    log_audit(conn, g.current_user['id'], g.current_user['name'], g.current_user['role'], 'UPDATE_MEETING_STATUS', 'Meeting', id, f"Meeting marked as {new_status}")
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'status': new_status})

# ----------------- Complaints -----------------

@app.route('/api/complaints', methods=['GET', 'POST'])
@require_auth
def handle_complaints():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        data = request.json or {}
        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        category = data.get('category', 'Academic')
        priority = data.get('priority', 'Medium')
        linked_student_id = data.get('linkedStudentId') or user.get('linked_id')

        if not title or not description:
            conn.close()
            return jsonify({'error': 'Title and description required'}), 400

        count = conn.execute('SELECT COUNT(*) FROM complaints').fetchone()[0]
        ticket = f"#C-{1000 + count + 1}"
        new_id = f"cmp-{int(time.time()*1000)}"
        now_date = datetime.now().strftime("%d %b %Y")
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        assigned_to = 'Head of Academic Affairs' if category == 'Academic' else 'Campus Facilities Supervisor' if category == 'Infrastructure' else 'Student Welfare Committee'

        conn.execute('''
        INSERT INTO complaints (id, ticket_number, title, description, category, submitted_by, submitted_by_id, linked_student_id, role, priority, assigned_to, date, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)
        ''', (
            new_id, ticket, title, description, category, user['name'], user['id'],
            linked_student_id, user['role'], priority, assigned_to, now_date, now_str, now_str
        ))
        
        admin_user = conn.execute("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1").fetchone()
        if admin_user:
            create_notification(conn, admin_user['id'], 'complaint', f"New Grievance {ticket}", f"{user['name']} submitted {category} grievance: {title}", '/complaints', 'complaint', new_id)

        log_audit(conn, user['id'], user['name'], user['role'], 'CREATE_COMPLAINT', 'Complaint', new_id, f"Ticket {ticket} submitted")
        conn.commit()
        created = conn.execute('SELECT * FROM complaints WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(created)), 201

    if user['role'] == 'ADMIN':
        rows = conn.execute('SELECT * FROM complaints ORDER BY id DESC').fetchall()
    elif user['role'] == 'TEACHER':
        rows = conn.execute('SELECT * FROM complaints WHERE assigned_to LIKE ? OR assigned_staff_id = ? OR submitted_by_id = ? ORDER BY id DESC', (f"%{user['name']}%", user['id'], user['id'])).fetchall()
    elif user['role'] == 'PARENT':
        child_ids = get_parent_child_ids(conn, user['id'])
        placeholders = ','.join('?' for _ in child_ids) if child_ids else "''"
        rows = conn.execute(f'SELECT * FROM complaints WHERE submitted_by_id = ? OR linked_student_id IN ({placeholders}) ORDER BY id DESC', [user['id']] + child_ids).fetchall() if child_ids else conn.execute('SELECT * FROM complaints WHERE submitted_by_id = ? ORDER BY id DESC', (user['id'],)).fetchall()
    else:
        rows = conn.execute('SELECT * FROM complaints WHERE submitted_by_id = ? OR linked_student_id = ? ORDER BY id DESC', (user['id'], user.get('linked_id'))).fetchall()

    conn.close()
    return jsonify([
        {
            'id': r['id'],
            'ticketNumber': r['ticket_number'],
            'title': r['title'],
            'description': r['description'],
            'category': r['category'],
            'submittedBy': r['submitted_by'],
            'role': r['role'],
            'priority': r['priority'] if 'priority' in r.keys() else 'Medium',
            'assignedTo': r['assigned_to'] if 'assigned_to' in r.keys() else 'Welfare',
            'date': r['date'],
            'status': r['status'],
            'resolutionNotes': r['resolution_notes']
        } for r in rows
    ])

@app.route('/api/complaints/<id>/status', methods=['PUT'])
@require_roles('ADMIN', 'TEACHER')
def update_complaint_status(id):
    data = request.json or {}
    new_status = data.get('status', 'Resolved')
    notes = data.get('resolutionNotes', '')
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db()
    cmp_row = conn.execute('SELECT * FROM complaints WHERE id = ?', (id,)).fetchone()
    if not cmp_row:
        conn.close()
        return jsonify({'error': 'Complaint not found'}), 404

    conn.execute('''
    UPDATE complaints SET status = ?, resolution_notes = ?, updated_at = ? WHERE id = ?
    ''', (new_status, notes or cmp_row['resolution_notes'], now_str, id))

    if cmp_row['submitted_by_id']:
        create_notification(
            conn, cmp_row['submitted_by_id'], 'complaint',
            f"Complaint {cmp_row['ticket_number']} Status: {new_status}",
            f"Your complaint was updated to {new_status} by {g.current_user['name']}.",
            '/complaints', 'complaint', id
        )
    log_audit(conn, g.current_user['id'], g.current_user['name'], g.current_user['role'], 'UPDATE_COMPLAINT_STATUS', 'Complaint', id, f"Status updated to {new_status}")
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'status': new_status})

# ----------------- Leaves (Role Pipeline) -----------------

@app.route('/api/leaves', methods=['GET', 'POST'])
@require_auth
def handle_leaves():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        data = request.json or {}
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        reason = data.get('reason', '').strip()
        student_id = data.get('studentId') or user.get('linked_id')

        # Ownership verification for parent / student
        if user['role'] == 'STUDENT' and user.get('linked_id') != student_id:
            conn.close()
            return jsonify({'error': 'Forbidden. Cannot apply leave for another student.'}), 403
        if user['role'] == 'PARENT':
            child_ids = get_parent_child_ids(conn, user['id'])
            if student_id not in child_ids:
                conn.close()
                return jsonify({'error': 'Forbidden. Student is not your linked child.'}), 403

        student = conn.execute('SELECT * FROM students WHERE id = ?', (student_id,)).fetchone()
        st_name = student['name'] if student else user['name']
        st_class = student['class'] if student else 'Class 10A'

        new_id = f"lv-{int(time.time()*1000)}"
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        conn.execute('''
        INSERT INTO leave_applications (id, student_id, student_name, class, requester_id, start_date, end_date, reason, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
        ''', (new_id, student_id, st_name, st_class, user['id'], start_date, end_date, reason, now_str))

        admin = conn.execute("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1").fetchone()
        if admin:
            create_notification(conn, admin['id'], 'leave', f"Leave Application: {st_name}", f"Request for {start_date} to {end_date}: {reason}", '/leaves', 'leave', new_id)

        log_audit(conn, user['id'], user['name'], user['role'], 'SUBMIT_LEAVE', 'Leave', new_id, f"Submitted leave application for {st_name}")
        conn.commit()
        created = conn.execute('SELECT * FROM leave_applications WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(created)), 201

    if user['role'] == 'ADMIN':
        rows = conn.execute('SELECT * FROM leave_applications ORDER BY created_at DESC').fetchall()
    elif user['role'] == 'TEACHER':
        assigned_classes = get_teacher_assigned_classes(conn, user)
        placeholders = ','.join('?' for _ in assigned_classes) if assigned_classes else "''"
        rows = conn.execute(f'SELECT * FROM leave_applications WHERE class IN ({placeholders}) ORDER BY created_at DESC', assigned_classes).fetchall() if assigned_classes else []
    elif user['role'] == 'PARENT':
        child_ids = get_parent_child_ids(conn, user['id'])
        placeholders = ','.join('?' for _ in child_ids) if child_ids else "''"
        rows = conn.execute(f'SELECT * FROM leave_applications WHERE requester_id = ? OR student_id IN ({placeholders}) ORDER BY created_at DESC', [user['id']] + child_ids).fetchall() if child_ids else conn.execute('SELECT * FROM leave_applications WHERE requester_id = ? ORDER BY created_at DESC', (user['id'],)).fetchall()
    else:
        rows = conn.execute('SELECT * FROM leave_applications WHERE student_id = ? ORDER BY created_at DESC', (user.get('linked_id'),)).fetchall()

    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/leaves/<id>/status', methods=['PUT'])
@require_roles('ADMIN', 'TEACHER')
def update_leave_status(id):
    data = request.json or {}
    new_status = data.get('status', 'APPROVED')
    notes = data.get('decisionNotes', '')

    conn = get_db()
    lv = conn.execute('SELECT * FROM leave_applications WHERE id = ?', (id,)).fetchone()
    if not lv:
        conn.close()
        return jsonify({'error': 'Leave record not found'}), 404

    # Teacher can only approve leaves for their assigned classes
    if g.current_user['role'] == 'TEACHER':
        assigned_classes = get_teacher_assigned_classes(conn, g.current_user)
        if lv['class'] not in assigned_classes:
            conn.close()
            return jsonify({'error': f"Forbidden. Cannot review leave for unassigned class '{lv['class']}'."}), 403

    conn.execute('UPDATE leave_applications SET status = ?, decision_notes = ?, approver_id = ? WHERE id = ?', (
        new_status, notes, g.current_user['id'], id
    ))
    create_notification(
        conn, lv['requester_id'], 'leave',
        f"Leave Request {new_status}",
        f"Leave application for {lv['student_name']} ({lv['start_date']} to {lv['end_date']}) was marked as {new_status}.",
        '/leaves', 'leave', id
    )
    log_audit(conn, g.current_user['id'], g.current_user['name'], g.current_user['role'], 'UPDATE_LEAVE_STATUS', 'Leave', id, f"Leave {new_status}")
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'status': new_status})

# ----------------- Timetable & Classes (Role Tailored) -----------------

@app.route('/api/classes', methods=['GET', 'POST'])
@require_auth
def get_classes():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        if user['role'] != 'ADMIN':
            conn.close()
            return jsonify({'error': 'Forbidden. Only administrators can create or edit academic sections.'}), 403
        data = request.json or {}
        new_id = f"cls-{int(time.time()*1000)}"
        conn.execute('''
        INSERT INTO classes (id, name, grade, section, room, class_teacher, total_students, capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (new_id, data['name'], data.get('grade', '10th Grade'), data.get('section', 'A'), data.get('room', 'Room 101'), data.get('classTeacher', 'Unassigned'), data.get('totalStudents', 0), data.get('capacity', 35)))
        log_audit(conn, user['id'], user['name'], user['role'], 'CREATE_CLASS', 'Class', new_id, f"Created {data['name']}")
        conn.commit()
        conn.close()
        return jsonify({'id': new_id, **data}), 201

    rows = conn.execute('SELECT * FROM classes ORDER BY id ASC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/schedule', methods=['GET', 'POST'])
@require_auth
def get_schedule():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        if user['role'] != 'ADMIN':
            conn.close()
            return jsonify({'error': 'Forbidden. Only administrators can schedule timetable slots.'}), 403
        data = request.json or {}
        new_id = f"sch-{int(time.time()*1000)}"
        conn.execute('''
        INSERT INTO schedule (id, time, title, location, type, color, teacher, subject, join_link, class_assigned)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (new_id, data['time'], data['title'], data.get('location', 'Room 101'), data.get('type', 'Regular'), data.get('color', '#3B82F6'), data.get('teacher', ''), data.get('subject', ''), data.get('joinLink'), data.get('classAssigned', 'Class 10A')))
        log_audit(conn, user['id'], user['name'], user['role'], 'CREATE_SCHEDULE_SLOT', 'Schedule', new_id, f"Scheduled {data['title']}")
        conn.commit()
        conn.close()
        return jsonify({'id': new_id, **data}), 201

    # Role tailored schedule
    if user['role'] == 'TEACHER':
        rows = conn.execute('SELECT * FROM schedule WHERE teacher LIKE ? OR location LIKE ? ORDER BY time ASC', (f"%{user['name']}%", '%Staff%')).fetchall()
    elif user['role'] == 'STUDENT':
        st = conn.execute('SELECT class FROM students WHERE id = ?', (user.get('linked_id'),)).fetchone()
        st_class = st['class'] if st else 'Class 10A'
        rows = conn.execute('SELECT * FROM schedule WHERE title LIKE ? OR class_assigned = ? ORDER BY time ASC', (f"%{st_class}%", st_class)).fetchall()
    elif user['role'] == 'PARENT':
        links = conn.execute('SELECT s.class FROM students s JOIN parent_student_links psl ON s.id = psl.student_id WHERE psl.parent_user_id = ?', (user['id'],)).fetchall()
        classes = [l['class'] for l in links]
        placeholders = ','.join('?' for _ in classes) if classes else "''"
        rows = conn.execute(f'SELECT * FROM schedule WHERE class_assigned IN ({placeholders}) ORDER BY time ASC', classes).fetchall() if classes else []
    else: # ADMIN
        rows = conn.execute('SELECT * FROM schedule ORDER BY id ASC').fetchall()

    conn.close()
    return jsonify([dict(r) for r in rows])

# ----------------- Service Requests -----------------

@app.route('/api/service-requests', methods=['GET', 'POST'])
@require_auth
def handle_service_requests():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        data = request.json or {}
        new_id = f"SR-{int(time.time()*1000)%10000}"
        now_date = datetime.now().strftime("%d %b %Y")
        conn.execute('''
        INSERT INTO service_requests (id, facility, issue, priority, status, requester_id, requester_name, date, resolution_notes)
        VALUES (?, ?, ?, ?, 'Pending Approval', ?, ?, ?, NULL)
        ''', (new_id, data['facility'], data['issue'], data.get('priority', 'Medium'), user['id'], user['name'], now_date))
        log_audit(conn, user['id'], user['name'], user['role'], 'CREATE_SERVICE_REQUEST', 'ServiceRequest', new_id, f"Logged {data['facility']} issue")
        conn.commit()
        created = conn.execute('SELECT * FROM service_requests WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(created)), 201

    if user['role'] == 'ADMIN':
        rows = conn.execute('SELECT * FROM service_requests ORDER BY id DESC').fetchall()
    else:
        rows = conn.execute('SELECT * FROM service_requests WHERE requester_id = ? ORDER BY id DESC', (user['id'],)).fetchall()

    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/service-requests/<id>/status', methods=['PUT'])
@require_roles('ADMIN')
def update_service_request_status(id):
    data = request.json or {}
    new_status = data.get('status', 'Resolved')
    notes = data.get('resolutionNotes', '')
    conn = get_db()
    conn.execute('UPDATE service_requests SET status = ?, resolution_notes = ? WHERE id = ?', (new_status, notes, id))
    log_audit(conn, g.current_user['id'], g.current_user['name'], g.current_user['role'], 'UPDATE_SERVICE_REQUEST', 'ServiceRequest', id, f"Marked {new_status}")
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'status': new_status})

# ----------------- Announcements -----------------

@app.route('/api/announcements', methods=['GET', 'POST'])
@require_auth
def handle_announcements():
    conn = get_db()
    user = g.current_user

    if request.method == 'POST':
        if user['role'] not in ['ADMIN', 'TEACHER']:
            conn.close()
            return jsonify({'error': 'Forbidden. Only administrators and teachers can post circulars.'}), 403
        data = request.json or {}
        new_id = f"ann-{int(time.time()*1000)}"
        now_date = datetime.now().strftime("%Y-%m-%d")
        target = data.get('targetAudience', 'ALL').upper()
        conn.execute('''
        INSERT INTO announcements (id, title, content, target_audience, author_id, author_name, priority, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (new_id, data['title'], data['content'], target, user['id'], user['name'], data.get('priority', 'Normal'), now_date))
        log_audit(conn, user['id'], user['name'], user['role'], 'POST_ANNOUNCEMENT', 'Announcement', new_id, f"Posted circular {data['title']}")
        conn.commit()
        created = conn.execute('SELECT * FROM announcements WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(created)), 201

    # Role targeted filtering
    if user['role'] == 'ADMIN':
        rows = conn.execute('SELECT * FROM announcements ORDER BY created_at DESC').fetchall()
    elif user['role'] == 'TEACHER':
        rows = conn.execute("SELECT * FROM announcements WHERE target_audience IN ('ALL', 'TEACHERS') ORDER BY created_at DESC").fetchall()
    elif user['role'] == 'STUDENT':
        st = conn.execute('SELECT class FROM students WHERE id = ?', (user.get('linked_id'),)).fetchone()
        st_class = st['class'] if st else 'Class 10A'
        rows = conn.execute("SELECT * FROM announcements WHERE target_audience IN ('ALL', 'STUDENTS', ?) ORDER BY created_at DESC", (st_class,)).fetchall()
    elif user['role'] == 'PARENT':
        links = conn.execute('SELECT s.class FROM students s JOIN parent_student_links psl ON s.id = psl.student_id WHERE psl.parent_user_id = ?', (user['id'],)).fetchall()
        classes = [l['class'] for l in links]
        rows = conn.execute("SELECT * FROM announcements WHERE target_audience IN ('ALL', 'PARENTS') ORDER BY created_at DESC").fetchall()

    conn.close()
    return jsonify([dict(r) for r in rows])

# ----------------- School Configuration & Operational Reports (Admin Only) -----------------

@app.route('/api/settings', methods=['GET', 'PUT'])
@require_roles('ADMIN')
def handle_settings():
    conn = get_db()
    if request.method == 'PUT':
        data = request.json or {}
        conn.execute('''
        UPDATE settings SET school_name = COALESCE(?, school_name), academic_year = COALESCE(?, academic_year),
        current_term = COALESCE(?, current_term), address = COALESCE(?, address), phone = COALESCE(?, phone),
        email = COALESCE(?, email), principal_name = COALESCE(?, principal_name)
        WHERE id = 1
        ''', (data.get('schoolName'), data.get('academicYear'), data.get('currentTerm'), data.get('address'), data.get('phone'), data.get('email'), data.get('principalName')))
        log_audit(conn, g.current_user['id'], g.current_user['name'], g.current_user['role'], 'UPDATE_SETTINGS', 'Settings', '1', 'Updated institutional configuration')
        conn.commit()

    row = conn.execute('SELECT * FROM settings WHERE id = 1').fetchone()
    conn.close()
    return jsonify(dict(row) if row else {})

@app.route('/api/reports/summary', methods=['GET'])
@require_roles('ADMIN')
def get_operational_reports():
    conn = get_db()
    total_students = conn.execute('SELECT COUNT(*) FROM students').fetchone()[0]
    total_teachers = conn.execute('SELECT COUNT(*) FROM teachers').fetchone()[0]
    total_classes = conn.execute('SELECT COUNT(*) FROM classes').fetchone()[0]
    total_billed = conn.execute('SELECT COALESCE(SUM(total_amount), 0) FROM fees').fetchone()[0]
    total_paid = conn.execute('SELECT COALESCE(SUM(paid_amount), 0) FROM fees').fetchone()[0]
    open_complaints = conn.execute("SELECT COUNT(*) FROM complaints WHERE status != 'RESOLVED'").fetchone()[0]
    pending_leaves = conn.execute("SELECT COUNT(*) FROM leave_applications WHERE status = 'PENDING'").fetchone()[0]
    conn.close()
    return jsonify({
        'totalStudents': total_students,
        'totalTeachers': total_teachers,
        'totalClasses': total_classes,
        'feeBilled': total_billed,
        'feeCollected': total_paid,
        'feeOutstanding': total_billed - total_paid,
        'feeRealizationPercent': MathRound((total_paid / total_billed * 100)) if total_billed > 0 else 0,
        'openComplaints': open_complaints,
        'pendingLeaves': pending_leaves
    })

def MathRound(num):
    return int(round(num))

# ----------------- Standard Dashboard Endpoints -----------------

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'backend': 'Flask', 'database': 'SQLite', 'roles': ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']})

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    conn = get_db()
    row = conn.execute('SELECT * FROM metrics WHERE id = 1').fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Not found'}), 404
    return jsonify({
        'totalStudents': row['total_students'],
        'studentsGrowth': row['students_growth'],
        'totalTeachers': row['total_teachers'],
        'teachersGrowth': row['teachers_growth'],
        'totalClasses': row['total_classes'],
        'classesGrowthText': row['classes_growth_text'],
        'todayAttendancePercent': row['today_attendance_percent'],
        'attendanceGrowth': row['attendance_growth'],
        'currentTerm': row['current_term'],
        'academicYear': row['academic_year'],
        'todayDateDisplay': row['today_date_display']
    })

@app.route('/api/events', methods=['GET', 'POST'])
def handle_events():
    conn = get_db()
    if request.method == 'POST':
        data = request.json or {}
        new_id = f"ev-{int(time.time() * 1000)}"
        conn.execute('''
        INSERT INTO events (id, month, day, date_str, title, time, location, badge_bg, badge_text, description, category, registered_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            new_id, data.get('month', 'SEP'), data.get('day', '20'), data.get('dateStr', ''),
            data['title'], data.get('time', '10:00 AM   02:00 PM'), data.get('location', 'Auditorium'),
            data.get('badgeBg', 'bg-sky-50'), data.get('badgeText', 'text-sky-600'),
            data.get('description', ''), data.get('category', 'Academic'), 0
        ))
        conn.commit()
        created = conn.execute('SELECT * FROM events WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(created)), 201

    rows = conn.execute('SELECT * FROM events ORDER BY id ASC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/pyqs', methods=['GET'])
def get_pyqs():
    conn = get_db()
    rows = conn.execute('SELECT * FROM pyqs ORDER BY id ASC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    conn = get_db()
    user = get_current_user()
    if user:
        rows = conn.execute('''
        SELECT * FROM notifications WHERE recipient_user_id = ? OR recipient_user_id IS NULL ORDER BY id DESC LIMIT 30
        ''', (user['id'],)).fetchall()
    else:
        rows = conn.execute('SELECT * FROM notifications ORDER BY id DESC LIMIT 20').fetchall()
    conn.close()
    return jsonify([
        {
            'id': r['id'],
            'iconType': r['icon_type'],
            'iconBg': r['icon_bg'],
            'iconColor': r['icon_color'],
            'title': r['title'],
            'description': r['description'],
            'timestamp': r['timestamp'],
            'isUnread': bool(r['is_unread']),
            'link': r['link'] if 'link' in r.keys() else None
        } for r in rows
    ])

@app.route('/api/notifications/<id>/read', methods=['POST'])
def mark_notification_read(id):
    conn = get_db()
    conn.execute('UPDATE notifications SET is_unread = 0 WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/notifications/read-all', methods=['POST'])
def mark_all_notifications_read():
    conn = get_db()
    user = get_current_user()
    if user:
        conn.execute('UPDATE notifications SET is_unread = 0 WHERE recipient_user_id = ? OR recipient_user_id IS NULL', (user['id'],))
    else:
        conn.execute('UPDATE notifications SET is_unread = 0')
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/audit-logs', methods=['GET'])
@require_roles('ADMIN')
def get_audit_logs():
    conn = get_db()
    rows = conn.execute('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ----------------- CUROS AI Integration -----------------

try:
    from curos_engine import curos_engine
except ImportError:
    from backend.curos_engine import curos_engine

try:
    from curos_dataset import generate_dataset_and_seed
except ImportError:
    from backend.curos_dataset import generate_dataset_and_seed

@app.route('/api/curos/chat', methods=['POST'])
def curos_chat():
    data = request.json or {}
    message = data.get('message') or data.get('prompt', '')
    if not message.strip():
        return jsonify({'error': 'Message cannot be empty.'}), 400

    user = get_current_user()
    if not user:
        # Fallback to demo admin if in preview without session
        user = {
            'id': 'usr-admin-1',
            'username': 'admin',
            'role': 'ADMIN',
            'name': 'Admin User'
        }
    role = user.get('role', 'ADMIN')

    result = curos_engine.execute_grounded_query(role, user, message)

    # Log to audit trail
    conn = get_db()
    log_audit(
        conn,
        user.get('id', 'anon'),
        user.get('name', 'User'),
        role,
        'CUROS_AI_QUERY',
        'curos_ai',
        'chat',
        f"Query: {message[:120]}"
    )
    conn.commit()
    conn.close()

    return jsonify({
        'response': result['response'],
        'role': role,
        'grounded': True,
        'data_sources': result.get('data_sources', []),
        'suggested_followups': result.get('suggested_followups', []),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/curos/suggested-questions', methods=['GET'])
def curos_suggested_questions():
    user = get_current_user()
    role = user.get('role', 'ADMIN') if user else 'ADMIN'
    welcome_messages = {
        'ADMIN': "Hello! I'm CUROS AI. I can help you explore teachers, classes, students, attendance, fees, and meetings.",
        'TEACHER': "Hello! I'm CUROS AI. I can help you with your assigned classes, attendance, assignments, and academic records.",
        'STUDENT': "Hello! I'm CUROS AI. I can help you with your timetable, attendance, assignments, results, and school information.",
        'PARENT': "Hello! I'm CUROS AI. I can help you check your child's attendance, academic progress, fees, timetable, and scheduled meetings."
    }
    questions_by_role = {
        'ADMIN': [
            "Who teaches Mathematics in Class 10-A?",
            "Which classes does Amit Sharma teach?",
            "How many students are enrolled in Class 10-A?",
            "Which students have unpaid fees?",
            "What is the total outstanding fee amount?",
            "What was the attendance of Class 10-A on 14 October 2026?",
            "Which students were absent on that date?",
            "Which parents have meetings scheduled?",
            "Which meetings are pending approval?",
            "What examinations are scheduled for Class 10-A?"
        ],
        'TEACHER': [
            "Which classes do I teach?",
            "Who teaches Mathematics in Class 10-A?",
            "How many students are enrolled in Class 10-A?",
            "What was the attendance of Class 10-A on 14 October 2026?",
            "Which students were absent on 14 October 2026?",
            "Which assignments are pending?",
            "Which parents have meetings scheduled?",
            "What examinations are scheduled for Class 10-A?"
        ],
        'STUDENT': [
            "Who teaches Mathematics in Class 10-A?",
            "What was my attendance on 14 October 2026?",
            "Do I have any unpaid fees?",
            "Which assignments are pending for me?",
            "What examinations are scheduled for Class 10-A?",
            "What are my published examination results?"
        ],
        'PARENT': [
            "Who teaches Mathematics in Class 10-A?",
            "What was the attendance of my child on 14 October 2026?",
            "What is the fee status of my child?",
            "Do I have any unpaid fees?",
            "Which parents have meetings scheduled?",
            "What examinations are scheduled for Class 10-A?"
        ]
    }
    return jsonify({
        'role': role,
        'welcome_message': welcome_messages.get(role, welcome_messages['ADMIN']),
        'questions': questions_by_role.get(role, questions_by_role['ADMIN'])
    })

@app.route('/api/curos/dataset-status', methods=['GET'])
def curos_dataset_status():
    conn = get_db()
    c = conn.cursor()
    tables = [
        'teachers', 'classes', 'teacher_class_subject_assignments',
        'students', 'parents', 'fee_invoices', 'fee_payments',
        'attendance_records', 'meetings', 'assignments', 'exams', 'exams_results'
    ]
    status = {}
    for t in tables:
        try:
            count = c.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
            status[t] = count
        except Exception as e:
            status[t] = f"Error: {e}"
    conn.close()
    return jsonify({
        'status': 'verified',
        'dataset_tables': status,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/curos/reset-dataset', methods=['POST'])
def curos_reset_dataset():
    user = get_current_user()
    if user and user.get('role') != 'ADMIN':
        return jsonify({'error': 'Forbidden. Only Admins can reset the demonstration dataset.'}), 403
    try:
        generate_dataset_and_seed()
        return jsonify({'success': True, 'message': 'Demonstration dataset re-generated and database seeded successfully.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    data = request.json or {}
    prompt = data.get('prompt') or data.get('message', '')
    user = get_current_user()
    role = user.get('role', 'ADMIN') if user else 'ADMIN'
    
    # Route through CUROS AI engine for grounded answers
    result = curos_engine.execute_grounded_query(role, user or {'id': 'usr-admin-1', 'role': 'ADMIN'}, prompt)
    return jsonify({'reply': result['response'], 'grounded': True})

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('FLASK_PORT', 5001))
    print(f"Flask backend running on http://127.0.0.1:{port} with SQLite database.")
    app.run(host='127.0.0.1', port=port, debug=False)
