import os
import json
import csv
import sqlite3
import zipfile
from datetime import datetime

DATASET_DIR = os.path.abspath("curos_ai_demo_dataset")
ZIP_PATH = os.path.abspath("curos_ai_demo_dataset.zip")
BACKEND_DIR = os.path.abspath("backend")
DB_PATH = os.path.join(BACKEND_DIR, "school.db")

def generate_dataset_and_seed():
    os.makedirs(DATASET_DIR, exist_ok=True)
    os.makedirs(BACKEND_DIR, exist_ok=True)

    # 1. Teachers
    teachers_rows = [
        {"id": "tch-amit", "name": "Mr. Amit Sharma", "employee_id": "EMP-T100", "subject": "Mathematics", "department": "Science & Mathematics", "email": "amit.sharma@smartschool.edu", "phone": "+91 98234 11000", "classes_assigned": json.dumps(["Class 10-A", "Class 9-A"]), "status": "Active"},
        {"id": "tch-01", "name": "Mr. Rajesh Verma", "employee_id": "EMP-T101", "subject": "Social Science", "department": "Humanities", "email": "rajesh.verma@smartschool.edu", "phone": "+91 98234 11001", "classes_assigned": json.dumps(["Class 10-A", "Class 11-A"]), "status": "Active"},
        {"id": "tch-02", "name": "Dr. Neha Sharma", "employee_id": "EMP-T102", "subject": "Biology & Chemistry", "department": "Science & Mathematics", "email": "neha.sharma@smartschool.edu", "phone": "+91 98234 11002", "classes_assigned": json.dumps(["Class 9-B", "Class 10-B"]), "status": "Active"},
        {"id": "tch-03", "name": "Prof. Alok Mukherjee", "employee_id": "EMP-T103", "subject": "Physics", "department": "Science & Mathematics", "email": "alok.m@smartschool.edu", "phone": "+91 98234 11003", "classes_assigned": json.dumps(["Class 10-A", "Class 11-A"]), "status": "Active"},
        {"id": "tch-04", "name": "Ms. Sunita Roy", "employee_id": "EMP-T104", "subject": "English Literature", "department": "Languages & Humanities", "email": "sunita.roy@smartschool.edu", "phone": "+91 98234 11004", "classes_assigned": json.dumps(["Class 8-A", "Class 10-A"]), "status": "Active"},
        {"id": "tch-05", "name": "Mr. David Fernandez", "employee_id": "EMP-T105", "subject": "Computer Science & AI", "department": "Technology", "email": "david.f@smartschool.edu", "phone": "+91 98234 11005", "classes_assigned": json.dumps(["Class 10-A", "Class 12-A"]), "status": "Active"},
    ]

    # 2. Classes
    classes_rows = [
        {"id": "cls-10a", "name": "Class 10-A", "grade": "10th Grade", "section": "A", "room": "Room 101", "class_teacher": "Mr. Amit Sharma", "total_students": 30, "capacity": 35},
        {"id": "cls-9a", "name": "Class 9-A", "grade": "9th Grade", "section": "A", "room": "Room 102", "class_teacher": "Ms. Sunita Roy", "total_students": 28, "capacity": 35},
        {"id": "cls-9b", "name": "Class 9-B", "grade": "9th Grade", "section": "B", "room": "Room 103", "class_teacher": "Dr. Neha Sharma", "total_students": 30, "capacity": 35},
        {"id": "cls-11a", "name": "Class 11-A", "grade": "11th Grade", "section": "A - Science", "room": "Room 201", "class_teacher": "Prof. Alok Mukherjee", "total_students": 26, "capacity": 30},
        {"id": "cls-12a", "name": "Class 12-A", "grade": "12th Grade", "section": "A - Science", "room": "Room 204", "class_teacher": "Mr. David Fernandez", "total_students": 29, "capacity": 30},
    ]

    # 3. Teacher Class Subject Assignments
    tcsa_rows = [
        {"id": "tcsa-1", "teacher_id": "tch-amit", "teacher_name": "Mr. Amit Sharma", "class_id": "cls-10a", "class_name": "Class 10-A", "subject_name": "Mathematics", "academic_year": "2026-2027"},
        {"id": "tcsa-2", "teacher_id": "tch-amit", "teacher_name": "Mr. Amit Sharma", "class_id": "cls-9a", "class_name": "Class 9-A", "subject_name": "Mathematics", "academic_year": "2026-2027"},
        {"id": "tcsa-3", "teacher_id": "tch-03", "teacher_name": "Prof. Alok Mukherjee", "class_id": "cls-10a", "class_name": "Class 10-A", "subject_name": "Physics", "academic_year": "2026-2027"},
        {"id": "tcsa-4", "teacher_id": "tch-02", "teacher_name": "Dr. Neha Sharma", "class_id": "cls-10a", "class_name": "Class 10-A", "subject_name": "Chemistry & Biology", "academic_year": "2026-2027"},
        {"id": "tcsa-5", "teacher_id": "tch-04", "teacher_name": "Ms. Sunita Roy", "class_id": "cls-10a", "class_name": "Class 10-A", "subject_name": "English Literature", "academic_year": "2026-2027"},
        {"id": "tcsa-6", "teacher_id": "tch-01", "teacher_name": "Mr. Rajesh Verma", "class_id": "cls-10a", "class_name": "Class 10-A", "subject_name": "Social Science", "academic_year": "2026-2027"},
        {"id": "tcsa-7", "teacher_id": "tch-05", "teacher_name": "Mr. David Fernandez", "class_id": "cls-10a", "class_name": "Class 10-A", "subject_name": "Computer Science & AI", "academic_year": "2026-2027"},
    ]

    # 4. Students (30 enrolled in Class 10-A)
    students_names = [
        ("std-101", "Aarav Patel", "10A-01", "Class 10-A", "Male", "Vikram Patel", "94", "Paid", "+91 98765 43210", "aarav.patel@student.smartschool.edu"),
        ("std-102", "Ananya Sharma", "10A-02", "Class 10-A", "Female", "Suresh Sharma", "98", "Paid", "+91 98765 43211", "ananya.sharma@student.smartschool.edu"),
        ("std-103", "Rohan Mehra", "10A-03", "Class 10-A", "Male", "Kavita Mehra", "86", "Partial", "+91 98765 43212", "rohan.mehra@student.smartschool.edu"),
        ("std-104", "Diya Sengupta", "10A-04", "Class 10-A", "Female", "Debashish Sengupta", "92", "Paid", "+91 98765 43213", "diya.sengupta@student.smartschool.edu"),
        ("std-105", "Kabir Khan", "10A-05", "Class 10-A", "Male", "Imran Khan", "80", "Unpaid", "+91 98765 43214", "kabir.khan@student.smartschool.edu"),
        ("std-106", "Sneha Kulkarni", "10A-06", "Class 10-A", "Female", "Manoj Kulkarni", "95", "Partial", "+91 98765 43215", "sneha.k@student.smartschool.edu"),
        ("std-107", "Aditya Chopra", "10A-07", "Class 10-A", "Male", "Rajesh Chopra", "90", "Paid", "+91 98765 43216", "aditya.c@student.smartschool.edu"),
        ("std-108", "Ishita Roy", "10A-08", "Class 10-A", "Female", "Subir Roy", "96", "Paid", "+91 98765 43217", "ishita.r@student.smartschool.edu"),
        ("std-109", "Vivaan Joshi", "10A-09", "Class 10-A", "Male", "Gaurav Joshi", "89", "Paid", "+91 98765 43218", "vivaan.j@student.smartschool.edu"),
        ("std-110", "Tara Deshmukh", "10A-10", "Class 10-A", "Female", "Anand Deshmukh", "93", "Paid", "+91 98765 43219", "tara.d@student.smartschool.edu"),
        ("std-111", "Arjun Nair", "10A-11", "Class 10-A", "Male", "Prakash Nair", "91", "Paid", "+91 98765 43220", "arjun.n@student.smartschool.edu"),
        ("std-112", "Rhea Bhatia", "10A-12", "Class 10-A", "Female", "Sunil Bhatia", "94", "Paid", "+91 98765 43221", "rhea.b@student.smartschool.edu"),
        ("std-113", "Karan Singhania", "10A-13", "Class 10-A", "Male", "Deepak Singhania", "88", "Paid", "+91 98765 43222", "karan.s@student.smartschool.edu"),
        ("std-114", "Meera Pillai", "10A-14", "Class 10-A", "Female", "Venu Pillai", "97", "Paid", "+91 98765 43223", "meera.p@student.smartschool.edu"),
        ("std-115", "Ayush Agarwal", "10A-15", "Class 10-A", "Male", "Pradeep Agarwal", "87", "Paid", "+91 98765 43224", "ayush.a@student.smartschool.edu"),
        ("std-116", "Tanvi Reddy", "10A-16", "Class 10-A", "Female", "Srinivas Reddy", "96", "Paid", "+91 98765 43225", "tanvi.r@student.smartschool.edu"),
        ("std-117", "Neil Dsouza", "10A-17", "Class 10-A", "Male", "Francis Dsouza", "90", "Paid", "+91 98765 43226", "neil.d@student.smartschool.edu"),
        ("std-118", "Pooja Malhotra", "10A-18", "Class 10-A", "Female", "Ashok Malhotra", "92", "Paid", "+91 98765 43227", "pooja.m@student.smartschool.edu"),
        ("std-119", "Devansh Gupta", "10A-19", "Class 10-A", "Male", "Pankaj Gupta", "89", "Paid", "+91 98765 43228", "devansh.g@student.smartschool.edu"),
        ("std-120", "Zoya Mirza", "10A-20", "Class 10-A", "Female", "Tariq Mirza", "95", "Paid", "+91 98765 43229", "zoya.m@student.smartschool.edu"),
        ("std-121", "Samar Bose", "10A-21", "Class 10-A", "Male", "Swapan Bose", "91", "Paid", "+91 98765 43230", "samar.b@student.smartschool.edu"),
        ("std-122", "Kavya Menon", "10A-22", "Class 10-A", "Female", "Radhakrishnan Menon", "98", "Paid", "+91 98765 43231", "kavya.m@student.smartschool.edu"),
        ("std-123", "Yashvardhan Jain", "10A-23", "Class 10-A", "Male", "Naveen Jain", "85", "Paid", "+91 98765 43232", "yash.j@student.smartschool.edu"),
        ("std-124", "Simran Gill", "10A-24", "Class 10-A", "Female", "Harpreet Gill", "94", "Paid", "+91 98765 43233", "simran.g@student.smartschool.edu"),
        ("std-125", "Manish Saxena", "10A-25", "Class 10-A", "Male", "Alok Saxena", "88", "Paid", "+91 98765 43234", "manish.s@student.smartschool.edu"),
        ("std-126", "Anvi Mathur", "10A-26", "Class 10-A", "Female", "Girish Mathur", "93", "Paid", "+91 98765 43235", "anvi.m@student.smartschool.edu"),
        ("std-127", "Pranav Hegde", "10A-27", "Class 10-A", "Male", "Shripad Hegde", "90", "Paid", "+91 98765 43236", "pranav.h@student.smartschool.edu"),
        ("std-128", "Nandini Sen", "10A-28", "Class 10-A", "Female", "Amitava Sen", "96", "Paid", "+91 98765 43237", "nandini.s@student.smartschool.edu"),
        ("std-129", "Hrithik Varshney", "10A-29", "Class 10-A", "Male", "Kamal Varshney", "89", "Paid", "+91 98765 43238", "hrithik.v@student.smartschool.edu"),
        ("std-130", "Gauri Iyer", "10A-30", "Class 10-A", "Female", "Venkatesh Iyer", "97", "Paid", "+91 98765 43239", "gauri.i@student.smartschool.edu"),
    ]
    students_rows = []
    for s in students_names:
        students_rows.append({
            "id": s[0],
            "name": s[1],
            "roll_number": s[2],
            "class": s[3],
            "gender": s[4],
            "status": "Active",
            "guardian_name": s[5],
            "phone": s[8],
            "email": s[9],
            "address": f"Sector 12, Smart City Residency, Flat {s[2]}",
            "attendance_rate": int(s[6]),
            "fee_status": s[7]
        })

    # 5. Parents
    parents_rows = [
        {"id": "par-101", "user_id": "usr-parent-1", "name": "Vikram Patel", "email": "vikram.patel@gmail.com", "phone": "+91 98765 43210", "student_id": "std-101", "student_name": "Aarav Patel", "relationship": "Father", "occupation": "Civil Engineer"},
        {"id": "par-102", "user_id": "usr-parent-2", "name": "Suresh Sharma", "email": "suresh.sharma@gmail.com", "phone": "+91 98765 43211", "student_id": "std-102", "student_name": "Ananya Sharma", "relationship": "Father", "occupation": "Chartered Accountant"},
        {"id": "par-103", "user_id": "usr-parent-3", "name": "Kavita Mehra", "email": "kavita.mehra@gmail.com", "phone": "+91 98765 43212", "student_id": "std-103", "student_name": "Rohan Mehra", "relationship": "Mother", "occupation": "Architect"},
        {"id": "par-104", "user_id": "usr-parent-4", "name": "Debashish Sengupta", "email": "debashish.s@gmail.com", "phone": "+91 98765 43213", "student_id": "std-104", "student_name": "Diya Sengupta", "relationship": "Father", "occupation": "Professor"},
        {"id": "par-105", "user_id": "usr-parent-5", "name": "Imran Khan", "email": "imran.khan@gmail.com", "phone": "+91 98765 43214", "student_id": "std-105", "student_name": "Kabir Khan", "relationship": "Father", "occupation": "Business Owner"},
        {"id": "par-106", "user_id": "usr-parent-6", "name": "Manoj Kulkarni", "email": "manoj.k@gmail.com", "phone": "+91 98765 43215", "student_id": "std-106", "student_name": "Sneha Kulkarni", "relationship": "Father", "occupation": "Software Architect"},
    ]

    # 6. Fee Invoices
    # Kabir Khan: unpaid 22000
    # Rohan Mehra: partial paid 11000, unpaid balance 11000
    # Sneha Kulkarni: partial paid 6600, unpaid balance 15400
    # Total outstanding fee amount = 11000 + 22000 + 15400 = 48,400
    fee_invoices_rows = [
        {"id": "inv-101", "invoice_number": "INV-2026-001", "student_id": "std-101", "student_name": "Aarav Patel", "class": "Class 10-A", "term": "Term 1 (2026-27)", "total_amount": 22000, "paid_amount": 22000, "balance_amount": 0, "status": "Paid", "due_date": "2026-08-15", "created_at": "2026-07-01"},
        {"id": "inv-102", "invoice_number": "INV-2026-002", "student_id": "std-102", "student_name": "Ananya Sharma", "class": "Class 10-A", "term": "Term 1 (2026-27)", "total_amount": 22000, "paid_amount": 22000, "balance_amount": 0, "status": "Paid", "due_date": "2026-08-15", "created_at": "2026-07-01"},
        {"id": "inv-103", "invoice_number": "INV-2026-003", "student_id": "std-103", "student_name": "Rohan Mehra", "class": "Class 10-A", "term": "Term 1 (2026-27)", "total_amount": 22000, "paid_amount": 11000, "balance_amount": 11000, "status": "Partial", "due_date": "2026-08-15", "created_at": "2026-07-01"},
        {"id": "inv-104", "invoice_number": "INV-2026-004", "student_id": "std-104", "student_name": "Diya Sengupta", "class": "Class 10-A", "term": "Term 1 (2026-27)", "total_amount": 22000, "paid_amount": 22000, "balance_amount": 0, "status": "Paid", "due_date": "2026-08-15", "created_at": "2026-07-01"},
        {"id": "inv-105", "invoice_number": "INV-2026-005", "student_id": "std-105", "student_name": "Kabir Khan", "class": "Class 10-A", "term": "Term 1 (2026-27)", "total_amount": 22000, "paid_amount": 0, "balance_amount": 22000, "status": "Unpaid", "due_date": "2026-08-15", "created_at": "2026-07-01"},
        {"id": "inv-106", "invoice_number": "INV-2026-006", "student_id": "std-106", "student_name": "Sneha Kulkarni", "class": "Class 10-A", "term": "Term 1 (2026-27)", "total_amount": 22000, "paid_amount": 6600, "balance_amount": 15400, "status": "Partial", "due_date": "2026-08-15", "created_at": "2026-07-01"},
        {"id": "inv-107", "invoice_number": "INV-2026-007", "student_id": "std-107", "student_name": "Aditya Chopra", "class": "Class 10-A", "term": "Term 1 (2026-27)", "total_amount": 22000, "paid_amount": 22000, "balance_amount": 0, "status": "Paid", "due_date": "2026-08-15", "created_at": "2026-07-01"},
        {"id": "inv-108", "invoice_number": "INV-2026-008", "student_id": "std-108", "student_name": "Ishita Roy", "class": "Class 10-A", "term": "Term 1 (2026-27)", "total_amount": 22000, "paid_amount": 22000, "balance_amount": 0, "status": "Paid", "due_date": "2026-08-15", "created_at": "2026-07-01"},
    ]

    # 7. Fee Payments
    fee_payments_rows = [
        {"id": "pay-101", "invoice_id": "inv-101", "student_id": "std-101", "student_name": "Aarav Patel", "amount_paid": 22000, "payment_date": "2026-08-10", "payment_method": "UPI / Net Banking", "transaction_ref": "TXN-99881101", "status": "Success"},
        {"id": "pay-102", "invoice_id": "inv-102", "student_id": "std-102", "student_name": "Ananya Sharma", "amount_paid": 22000, "payment_date": "2026-08-12", "payment_method": "Credit Card", "transaction_ref": "TXN-99881102", "status": "Success"},
        {"id": "pay-103", "invoice_id": "inv-103", "student_id": "std-103", "student_name": "Rohan Mehra", "amount_paid": 11000, "payment_date": "2026-08-14", "payment_method": "Cheque", "transaction_ref": "CHQ-445501", "status": "Success"},
        {"id": "pay-104", "invoice_id": "inv-104", "student_id": "std-104", "student_name": "Diya Sengupta", "amount_paid": 22000, "payment_date": "2026-08-11", "payment_method": "Net Banking", "transaction_ref": "TXN-99881104", "status": "Success"},
        {"id": "pay-106", "invoice_id": "inv-106", "student_id": "std-106", "student_name": "Sneha Kulkarni", "amount_paid": 6600, "payment_date": "2026-08-15", "payment_method": "UPI", "transaction_ref": "TXN-99881106", "status": "Success"},
        {"id": "pay-107", "invoice_id": "inv-107", "student_id": "std-107", "student_name": "Aditya Chopra", "amount_paid": 22000, "payment_date": "2026-08-08", "payment_method": "Net Banking", "transaction_ref": "TXN-99881107", "status": "Success"},
        {"id": "pay-108", "invoice_id": "inv-108", "student_id": "std-108", "student_name": "Ishita Roy", "amount_paid": 22000, "payment_date": "2026-08-09", "payment_method": "UPI", "transaction_ref": "TXN-99881108", "status": "Success"},
    ]

    # 8. Attendance on 14 October 2026
    # Kabir Khan (std-105) and Rohan Mehra (std-103) were ABSENT, 28 were PRESENT
    attendance_rows = []
    for s in students_rows:
        is_absent = s["id"] in ["std-103", "std-105"]
        attendance_rows.append({
            "id": f"att-20261014-{s['id']}",
            "class": "Class 10-A",
            "date": "2026-10-14",
            "student_id": s["id"],
            "student_name": s["name"],
            "status": "ABSENT" if is_absent else "PRESENT",
            "marked_by": "Mr. Amit Sharma"
        })
        attendance_rows.append({
            "id": f"att-20261013-{s['id']}",
            "class": "Class 10-A",
            "date": "2026-10-13",
            "student_id": s["id"],
            "student_name": s["name"],
            "status": "PRESENT",
            "marked_by": "Mr. Amit Sharma"
        })

    # 9. Parent Meetings
    parent_meetings_rows = [
        {"id": "mtg-101", "requester_id": "par-101", "requester_name": "Vikram Patel", "requester_role": "PARENT", "linked_student_id": "std-101", "target_staff_id": "tch-amit", "target_staff_name": "Mr. Amit Sharma", "meeting_type": "Academic Progress", "reason": "Mathematics Olympiad coaching guidance", "description": "Discuss advanced coaching schedule for Aarav in Class 10-A Mathematics.", "preferred_date": "2026-10-22", "preferred_time": "03:30 PM", "mode": "In-person", "status": "APPROVED", "decision_notes": "Confirmed in Room 101.", "created_at": "2026-10-12 10:00:00", "updated_at": "2026-10-13 11:30:00"},
        {"id": "mtg-102", "requester_id": "par-103", "requester_name": "Kavita Mehra", "requester_role": "PARENT", "linked_student_id": "std-103", "target_staff_id": "tch-03", "target_staff_name": "Prof. Alok Mukherjee", "meeting_type": "Subject Inquiry", "reason": "Physics mid-term concept revision", "description": "Reviewing Rohan's physics practical report and optics understanding.", "preferred_date": "2026-10-24", "preferred_time": "04:00 PM", "mode": "Google Meet", "status": "APPROVED", "decision_notes": "Online meeting scheduled.", "created_at": "2026-10-13 14:00:00", "updated_at": "2026-10-14 09:15:00"},
        {"id": "mtg-103", "requester_id": "par-105", "requester_name": "Imran Khan", "requester_role": "PARENT", "linked_student_id": "std-105", "target_staff_id": "tch-amit", "target_staff_name": "Mr. Amit Sharma", "meeting_type": "Attendance & Academic", "reason": "Attendance shortage and remedial classes", "description": "Requesting discussion regarding Kabir's attendance rate and upcoming exam preparation.", "preferred_date": "2026-10-25", "preferred_time": "02:30 PM", "mode": "In-person", "status": "PENDING", "decision_notes": None, "created_at": "2026-10-14 16:20:00", "updated_at": "2026-10-14 16:20:00"},
        {"id": "mtg-104", "requester_id": "par-106", "requester_name": "Manoj Kulkarni", "requester_role": "PARENT", "linked_student_id": "std-106", "target_staff_id": "tch-04", "target_staff_name": "Ms. Sunita Roy", "meeting_type": "Feedback", "reason": "English creative writing evaluation", "description": "Feedback on Sneha's essay writing submissions.", "preferred_date": "2026-10-26", "preferred_time": "03:00 PM", "mode": "In-person", "status": "PENDING", "decision_notes": None, "created_at": "2026-10-15 08:45:00", "updated_at": "2026-10-15 08:45:00"},
    ]

    # 10. Assignments
    assignments_rows = [
        {"id": "asg-101", "title": "Mathematics Chapter 5: Quadratic Equations Problem Set", "description": "Complete all exercises from Chapter 5, questions 1 through 25 with full step proofs.", "class": "Class 10-A", "subject": "Mathematics", "teacher_id": "tch-amit", "teacher_name": "Mr. Amit Sharma", "due_date": "2026-10-20", "max_marks": 100, "status": "Pending", "created_at": "2026-10-10"},
        {"id": "asg-102", "title": "Physics Practical Lab: Optics & Focal Length Experiment", "description": "Submit lab observations for convex lens image distance verification.", "class": "Class 10-A", "subject": "Physics", "teacher_id": "tch-03", "teacher_name": "Prof. Alok Mukherjee", "due_date": "2026-10-23", "max_marks": 50, "status": "Pending", "created_at": "2026-10-12"},
        {"id": "asg-103", "title": "English Literature: The Merchant of Venice Act III Analysis", "description": "Write a critical commentary on Portia's speech in Act III Scene 2.", "class": "Class 10-A", "subject": "English Literature", "teacher_id": "tch-04", "teacher_name": "Ms. Sunita Roy", "due_date": "2026-10-26", "max_marks": 50, "status": "Pending", "created_at": "2026-10-14"},
    ]

    # 11. Exams
    exams_rows = [
        {"id": "ex-101", "exam_name": "Mid-Term Examination 2026", "class_name": "Class 10-A", "subject": "Mathematics", "exam_date": "2026-10-25", "start_time": "09:00 AM", "duration_minutes": 180, "room": "Room 101", "max_marks": 100, "passing_marks": 40},
        {"id": "ex-102", "exam_name": "Mid-Term Examination 2026", "class_name": "Class 10-A", "subject": "Physics & Chemistry", "exam_date": "2026-10-28", "start_time": "09:00 AM", "duration_minutes": 180, "room": "Room 101", "max_marks": 100, "passing_marks": 40},
        {"id": "ex-103", "exam_name": "Mid-Term Examination 2026", "class_name": "Class 10-A", "subject": "English Literature", "exam_date": "2026-10-30", "start_time": "09:00 AM", "duration_minutes": 180, "room": "Room 101", "max_marks": 100, "passing_marks": 40},
        {"id": "ex-104", "exam_name": "Mid-Term Examination 2026", "class_name": "Class 10-A", "subject": "Social Science", "exam_date": "2026-11-03", "start_time": "09:00 AM", "duration_minutes": 180, "room": "Room 101", "max_marks": 100, "passing_marks": 40},
        {"id": "ex-105", "exam_name": "Mid-Term Examination 2026", "class_name": "Class 10-A", "subject": "Computer Science & AI", "exam_date": "2026-11-05", "start_time": "09:00 AM", "duration_minutes": 180, "room": "Computer Lab 1", "max_marks": 100, "passing_marks": 40},
    ]

    # 12. Published Results (Term 1 Assessment 2026)
    published_results_rows = [
        {"id": "res-101", "exam_name": "Term 1 Assessment 2026", "student_id": "std-101", "student_name": "Aarav Patel", "class": "Class 10-A", "subject": "Mathematics", "marks_obtained": 95, "max_marks": 100, "grade": "A+", "published": 1, "remarks": "Outstanding analytical skills"},
        {"id": "res-102", "exam_name": "Term 1 Assessment 2026", "student_id": "std-101", "student_name": "Aarav Patel", "class": "Class 10-A", "subject": "Physics", "marks_obtained": 92, "max_marks": 100, "grade": "A+", "published": 1, "remarks": "Excellent conceptual clarity"},
        {"id": "res-103", "exam_name": "Term 1 Assessment 2026", "student_id": "std-101", "student_name": "Aarav Patel", "class": "Class 10-A", "subject": "English Literature", "marks_obtained": 88, "max_marks": 100, "grade": "A", "published": 1, "remarks": "Very good comprehension"},
        {"id": "res-104", "exam_name": "Term 1 Assessment 2026", "student_id": "std-102", "student_name": "Ananya Sharma", "class": "Class 10-A", "subject": "Mathematics", "marks_obtained": 98, "max_marks": 100, "grade": "A+", "published": 1, "remarks": "Top score in class"},
        {"id": "res-105", "exam_name": "Term 1 Assessment 2026", "student_id": "std-102", "student_name": "Ananya Sharma", "class": "Class 10-A", "subject": "Physics", "marks_obtained": 96, "max_marks": 100, "grade": "A+", "published": 1, "remarks": "Exemplary lab performance"},
        {"id": "res-106", "exam_name": "Term 1 Assessment 2026", "student_id": "std-103", "student_name": "Rohan Mehra", "class": "Class 10-A", "subject": "Mathematics", "marks_obtained": 78, "max_marks": 100, "grade": "B+", "published": 1, "remarks": "Consistent effort"},
        {"id": "res-107", "exam_name": "Term 1 Assessment 2026", "student_id": "std-103", "student_name": "Rohan Mehra", "class": "Class 10-A", "subject": "Physics", "marks_obtained": 82, "max_marks": 100, "grade": "A", "published": 1, "remarks": "Good improvement"},
        {"id": "res-108", "exam_name": "Term 1 Assessment 2026", "student_id": "std-104", "student_name": "Diya Sengupta", "class": "Class 10-A", "subject": "Mathematics", "marks_obtained": 91, "max_marks": 100, "grade": "A+", "published": 1, "remarks": "Strong problem solver"},
        {"id": "res-109", "exam_name": "Term 1 Assessment 2026", "student_id": "std-105", "student_name": "Kabir Khan", "class": "Class 10-A", "subject": "Mathematics", "marks_obtained": 68, "max_marks": 100, "grade": "B", "published": 1, "remarks": "Needs practice in algebra"},
        {"id": "res-110", "exam_name": "Term 1 Assessment 2026", "student_id": "std-106", "student_name": "Sneha Kulkarni", "class": "Class 10-A", "subject": "Mathematics", "marks_obtained": 94, "max_marks": 100, "grade": "A+", "published": 1, "remarks": "Very dedicated and thorough"},
    ]

    # Write CSV files
    dataset_dict = {
        "teachers.csv": (teachers_rows, list(teachers_rows[0].keys())),
        "classes.csv": (classes_rows, list(classes_rows[0].keys())),
        "teacher_class_subject_assignments.csv": (tcsa_rows, list(tcsa_rows[0].keys())),
        "students.csv": (students_rows, list(students_rows[0].keys())),
        "parents.csv": (parents_rows, list(parents_rows[0].keys())),
        "fee_invoices.csv": (fee_invoices_rows, list(fee_invoices_rows[0].keys())),
        "fee_payments.csv": (fee_payments_rows, list(fee_payments_rows[0].keys())),
        "attendance.csv": (attendance_rows, list(attendance_rows[0].keys())),
        "parent_meetings.csv": (parent_meetings_rows, list(parent_meetings_rows[0].keys())),
        "assignments.csv": (assignments_rows, list(assignments_rows[0].keys())),
        "exams.csv": (exams_rows, list(exams_rows[0].keys())),
        "published_results.csv": (published_results_rows, list(published_results_rows[0].keys())),
    }

    for filename, (data, fieldnames) in dataset_dict.items():
        filepath = os.path.join(DATASET_DIR, filename)
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)

    # Write curos_demo_dataset.json
    json_path = os.path.join(DATASET_DIR, "curos_demo_dataset.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.now().isoformat(),
            "school_name": "Smart School International",
            "academic_year": "2026-2027",
            "teachers": teachers_rows,
            "classes": classes_rows,
            "teacher_class_subject_assignments": tcsa_rows,
            "students": students_rows,
            "parents": parents_rows,
            "fee_invoices": fee_invoices_rows,
            "fee_payments": fee_payments_rows,
            "attendance": attendance_rows,
            "parent_meetings": parent_meetings_rows,
            "assignments": assignments_rows,
            "exams": exams_rows,
            "published_results": published_results_rows
        }, f, indent=2)

    # Write README.md
    readme_content = """# CUROS AI Demonstration Dataset
This dataset provides grounded demonstration data for the CUROS AI school ERP assistant.

## Included Datasets:
1. `teachers.csv` - School faculty profiles, departments, emails, and assignments.
2. `classes.csv` - Grade levels, sections, classrooms, assigned class teachers, capacities.
3. `teacher_class_subject_assignments.csv` - Precise relational mappings of teacher -> class -> subject.
4. `students.csv` - 30 students enrolled in Class 10-A and additional grade levels.
5. `parents.csv` - Parent / guardian profiles linked to students.
6. `fee_invoices.csv` - Invoices with total amount, paid amount, and outstanding balances.
7. `fee_payments.csv` - Payment transactions, payment methods, and references.
8. `attendance.csv` - Daily attendance records, including 14 October 2026 for Class 10-A.
9. `parent_meetings.csv` - Parent-teacher meeting requests with Approved and Pending states.
10. `assignments.csv` - Active and pending homework/lab assignments.
11. `exams.csv` - Mid-Term Examination 2026 schedule for Class 10-A.
12. `published_results.csv` - Term 1 published academic marks and grades.
"""
    with open(os.path.join(DATASET_DIR, "README.md"), "w", encoding="utf-8") as f:
        f.write(readme_content)

    # Write IMPORT_NOTES.sql
    import_sql = """-- CUROS AI Demo Dataset Import Script
-- Tables: teachers, classes, teacher_class_subject_assignments, students, parents,
-- fee_invoices, fee_payments, attendance, parent_meetings, assignments, exams, published_results
"""
    with open(os.path.join(DATASET_DIR, "IMPORT_NOTES.sql"), "w", encoding="utf-8") as f:
        f.write(import_sql)

    # Create ZIP archive
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(DATASET_DIR):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, DATASET_DIR)
                zf.write(full_path, rel_path)

    # Also place zip copy in backend
    with open(ZIP_PATH, "rb") as src, open(os.path.join(BACKEND_DIR, "curos_ai_demo_dataset.zip"), "wb") as dst:
        dst.write(src.read())

    # Now seed into SQLite DB
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Create missing tables if needed
    c.execute("""
    CREATE TABLE IF NOT EXISTS teacher_class_subject_assignments (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        teacher_name TEXT NOT NULL,
        class_id TEXT NOT NULL,
        class_name TEXT NOT NULL,
        subject_name TEXT NOT NULL,
        academic_year TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS fee_invoices (
        id TEXT PRIMARY KEY,
        invoice_number TEXT NOT NULL,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        class TEXT NOT NULL,
        term TEXT NOT NULL,
        total_amount INTEGER NOT NULL,
        paid_amount INTEGER NOT NULL,
        balance_amount INTEGER NOT NULL,
        status TEXT NOT NULL,
        due_date TEXT,
        created_at TEXT
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS fee_payments (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        student_id TEXT NOT NULL,
        student_name TEXT NOT NULL,
        amount_paid INTEGER NOT NULL,
        payment_date TEXT NOT NULL,
        payment_method TEXT,
        transaction_ref TEXT,
        status TEXT DEFAULT 'Success'
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        exam_name TEXT NOT NULL,
        class_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        exam_date TEXT NOT NULL,
        start_time TEXT,
        duration_minutes INTEGER,
        room TEXT,
        max_marks INTEGER,
        passing_marks INTEGER
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS parents (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        student_id TEXT,
        student_name TEXT,
        relationship TEXT,
        occupation TEXT
    )
    """)

    # Populate / Sync Teachers
    for t in teachers_rows:
        c.execute("""
        INSERT INTO teachers (id, name, employee_id, subject, department, email, phone, classes_assigned, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            subject=excluded.subject,
            classes_assigned=excluded.classes_assigned,
            email=excluded.email
        """, (t["id"], t["name"], t["employee_id"], t["subject"], t["department"], t["email"], t["phone"], t["classes_assigned"], t["status"]))

    # Populate / Sync Classes
    for cl in classes_rows:
        c.execute("""
        INSERT INTO classes (id, name, grade, section, room, class_teacher, total_students, capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            class_teacher=excluded.class_teacher,
            total_students=excluded.total_students,
            room=excluded.room
        """, (cl["id"], cl["name"], cl["grade"], cl["section"], cl["room"], cl["class_teacher"], cl["total_students"], cl["capacity"]))

    # Populate teacher_class_subject_assignments
    c.execute("DELETE FROM teacher_class_subject_assignments")
    for tc in tcsa_rows:
        c.execute("""
        INSERT INTO teacher_class_subject_assignments (id, teacher_id, teacher_name, class_id, class_name, subject_name, academic_year)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (tc["id"], tc["teacher_id"], tc["teacher_name"], tc["class_id"], tc["class_name"], tc["subject_name"], tc["academic_year"]))

    # Populate Students
    for s in students_rows:
        c.execute("""
        INSERT INTO students (id, name, roll_number, class, gender, status, guardian_name, phone, email, address, attendance_rate, fee_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            roll_number=excluded.roll_number,
            class=excluded.class,
            attendance_rate=excluded.attendance_rate,
            fee_status=excluded.fee_status,
            guardian_name=excluded.guardian_name
        """, (s["id"], s["name"], s["roll_number"], s["class"], s["gender"], s["status"], s["guardian_name"], s["phone"], s["email"], s["address"], s["attendance_rate"], s["fee_status"]))

    # Populate Parents
    c.execute("DELETE FROM parents")
    for p in parents_rows:
        c.execute("""
        INSERT INTO parents (id, user_id, name, email, phone, student_id, student_name, relationship, occupation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (p["id"], p["user_id"], p["name"], p["email"], p["phone"], p["student_id"], p["student_name"], p["relationship"], p["occupation"]))
        # Also ensure parent_student_links has it
        c.execute("""
        INSERT OR REPLACE INTO parent_student_links (id, parent_user_id, student_id, relationship)
        VALUES (?, ?, ?, ?)
        """, (f"psl-{p['id']}", p["user_id"], p["student_id"], p["relationship"]))

    # Populate fee_invoices & fees table
    c.execute("DELETE FROM fee_invoices")
    for inv in fee_invoices_rows:
        c.execute("""
        INSERT INTO fee_invoices (id, invoice_number, student_id, student_name, class, term, total_amount, paid_amount, balance_amount, status, due_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (inv["id"], inv["invoice_number"], inv["student_id"], inv["student_name"], inv["class"], inv["term"], inv["total_amount"], inv["paid_amount"], inv["balance_amount"], inv["status"], inv["due_date"], inv["created_at"]))
        # Sync to fees table
        c.execute("""
        INSERT OR REPLACE INTO fees (id, student_id, student_name, roll_number, class, term, total_amount, paid_amount, status, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (f"fee-{inv['id']}", inv["student_id"], inv["student_name"], f"10A-{inv['student_id'][-2:]}", inv["class"], inv["term"], inv["total_amount"], inv["paid_amount"], inv["status"], inv["due_date"]))

    # Populate fee_payments
    c.execute("DELETE FROM fee_payments")
    for pay in fee_payments_rows:
        c.execute("""
        INSERT INTO fee_payments (id, invoice_id, student_id, student_name, amount_paid, payment_date, payment_method, transaction_ref, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (pay["id"], pay["invoice_id"], pay["student_id"], pay["student_name"], pay["amount_paid"], pay["payment_date"], pay["payment_method"], pay["transaction_ref"], pay["status"]))

    # Populate Attendance (including 2026-10-14)
    for att in attendance_rows:
        c.execute("""
        INSERT OR REPLACE INTO attendance_records (id, class, date, student_id, student_name, status, marked_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (att["id"], att["class"], att["date"], att["student_id"], att["student_name"], att["status"], att["marked_by"]))

    # Populate Meetings
    for m in parent_meetings_rows:
        c.execute("""
        INSERT OR REPLACE INTO meetings (id, requester_id, requester_name, requester_role, linked_student_id, target_staff_id, target_staff_name, meeting_type, reason, description, preferred_date, preferred_time, mode, status, decision_notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (m["id"], m["requester_id"], m["requester_name"], m["requester_role"], m["linked_student_id"], m["target_staff_id"], m["target_staff_name"], m["meeting_type"], m["reason"], m["description"], m["preferred_date"], m["preferred_time"], m["mode"], m["status"], m["decision_notes"], m["created_at"], m["updated_at"]))

    # Populate Assignments
    for a in assignments_rows:
        c.execute("""
        INSERT OR REPLACE INTO assignments (id, title, description, class, subject, teacher_id, teacher_name, due_date, max_marks, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (a["id"], a["title"], a["description"], a["class"], a["subject"], a["teacher_id"], a["teacher_name"], a["due_date"], a["max_marks"], a["created_at"]))

    # Populate Exams
    c.execute("DELETE FROM exams")
    for ex in exams_rows:
        c.execute("""
        INSERT INTO exams (id, exam_name, class_name, subject, exam_date, start_time, duration_minutes, room, max_marks, passing_marks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (ex["id"], ex["exam_name"], ex["class_name"], ex["subject"], ex["exam_date"], ex["start_time"], ex["duration_minutes"], ex["room"], ex["max_marks"], ex["passing_marks"]))

    # Populate Published Results
    for pr in published_results_rows:
        c.execute("""
        INSERT OR REPLACE INTO exams_results (id, exam_name, student_id, student_name, class, subject, marks_obtained, max_marks, grade, published, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (pr["id"], pr["exam_name"], pr["student_id"], pr["student_name"], pr["class"], pr["subject"], pr["marks_obtained"], pr["max_marks"], pr["grade"], pr["published"], pr["remarks"]))

    conn.commit()
    conn.close()
    print("Successfully generated demonstration dataset and seeded SQLite database.")

if __name__ == "__main__":
    generate_dataset_and_seed()
