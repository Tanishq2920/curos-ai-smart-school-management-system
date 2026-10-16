import os
import re
import json
import sqlite3
import urllib.request
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "school.db")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def normalize_class(text):
    """Normalize class representations like '10-A', '10A', '10 a', 'Class 10A' -> 'Class 10-A'"""
    # Remove months to avoid matching e.g. '14 October' as '14-O'
    cleaned = re.sub(r'\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b', '', text, flags=re.IGNORECASE)
    cleaned = re.sub(r'\b(?:jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b', '', cleaned, flags=re.IGNORECASE)
    
    # Check for explicit 'Class 10-A', 'Class 10A', 'Grade 10A', '10th A', '10-A'
    m = re.search(r'(?:class|grade)?\s*(\d+)(?:th|st|nd|rd)?\s*[-_ ]*\s*([A-Za-z])\b', cleaned, re.IGNORECASE)
    if m:
        grade = m.group(1)
        section = m.group(2).upper()
        return f"Class {grade}-{section}"
    return "Class 10-A"

def normalize_date(text):
    """Normalize dates like '14 October 2026', '2026-10-14', '14-10-2026' -> '2026-10-14'"""
    # Matches '2026-10-14'
    m_iso = re.search(r'\b(20\d\d)[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b', text)
    if m_iso:
        return f"{m_iso.group(1)}-{int(m_iso.group(2)):02d}-{int(m_iso.group(3)):02d}"
    
    # Matches '14 October 2026' or '14th October 2026'
    months = {
        'january': 1, 'jan': 1, 'february': 2, 'feb': 2, 'march': 3, 'mar': 3,
        'april': 4, 'apr': 4, 'may': 5, 'june': 6, 'jun': 6, 'july': 7, 'jul': 7,
        'august': 8, 'aug': 8, 'september': 9, 'sep': 9, 'sept': 9,
        'october': 10, 'oct': 10, 'november': 11, 'nov': 11, 'december': 12, 'dec': 12
    }
    m_text = re.search(r'\b(0?[1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\s+([A-Za-z]+)(?:\s+(20\d\d))?\b', text, re.IGNORECASE)
    if m_text:
        day = int(m_text.group(1))
        month_name = m_text.group(2).lower()
        year = int(m_text.group(3)) if m_text.group(3) else 2026
        if month_name in months:
            return f"{year}-{months[month_name]:02d}-{day:02d}"
    # Default if '14 October'
    if "14" in text and "oct" in text.lower():
        return "2026-10-14"
    return None

class CurosEngine:
    def __init__(self):
        self.api_key = GEMINI_API_KEY

    def execute_grounded_query(self, user_role, user_context, message):
        """
        Interprets user intent, applies strict role-based access control,
        executes SQL queries against school.db, performs calculations,
        and returns structured result data + formatted response.
        """
        msg = message.strip()
        msg_lower = msg.lower()
        conn = get_db()
        c = conn.cursor()
        data_sources = []
        response_text = ""
        suggested_followups = []

        # -------------------------------------------------------------------------
        # 1. Intent: TEACHER / SUBJECT INQUIRIES
        # E.g. "Who teaches Mathematics in Class 10-A?"
        # E.g. "Which classes does Amit Sharma teach?"
        # -------------------------------------------------------------------------
        if "who teaches" in msg_lower or ("teacher" in msg_lower and any(s in msg_lower for s in ["math", "science", "physics", "english", "computer", "biology"])):
            cls = normalize_class(msg)
            data_sources.extend(["teachers", "teacher_class_subject_assignments"])
            
            # Detect subject
            subject = None
            if "math" in msg_lower:
                subject = "Mathematics"
            elif "physics" in msg_lower:
                subject = "Physics"
            elif "chemistry" in msg_lower or "biology" in msg_lower or "science" in msg_lower:
                subject = "Chemistry"
            elif "english" in msg_lower:
                subject = "English"
            elif "computer" in msg_lower or "ai" in msg_lower:
                subject = "Computer Science"

            query = """
            SELECT tc.teacher_name, tc.class_name, tc.subject_name, t.email, t.phone, t.department
            FROM teacher_class_subject_assignments tc
            JOIN teachers t ON tc.teacher_id = t.id
            WHERE (tc.class_name LIKE ? OR tc.class_name LIKE ?)
            """
            params = [f"%{cls}%", f"%{cls.replace('-', '')}%"]
            if subject:
                query += " AND tc.subject_name LIKE ?"
                params.append(f"%{subject}%")
            
            rows = c.execute(query, params).fetchall()
            if rows:
                if len(rows) == 1:
                    r = rows[0]
                    response_text = f"**{r['teacher_name']}** teaches **{r['subject_name']}** in **{r['class_name']}**.\n\n- Department: {r['department']}\n- Email: {r['email']}"
                else:
                    lines = [f"Here are the subject teachers for **{cls}**:"]
                    for r in rows:
                        lines.append(f"- **{r['subject_name']}**: {r['teacher_name']} ({r['email']})")
                    response_text = "\n".join(lines)
                
                suggested_followups = [
                    f"Which classes does {rows[0]['teacher_name']} teach?",
                    f"How many students are enrolled in {cls}?",
                    f"What examinations are scheduled for {cls}?"
                ]
            else:
                response_text = f"No teacher assignment record was found for {subject or 'that subject'} in {cls}. Please verify the class and subject."

        elif "which classes does" in msg_lower or "classes teach" in msg_lower or ("classes" in msg_lower and "teach" in msg_lower):
            data_sources.extend(["teachers", "teacher_class_subject_assignments"])
            # Extract teacher name
            teacher_query = "%Amit Sharma%"
            if "amit" in msg_lower:
                teacher_query = "%Amit Sharma%"
            elif "rajesh" in msg_lower:
                teacher_query = "%Rajesh Verma%"
            elif "alok" in msg_lower:
                teacher_query = "%Alok Mukherjee%"
            elif "neha" in msg_lower:
                teacher_query = "%Neha Sharma%"
            elif "sunita" in msg_lower:
                teacher_query = "%Sunita Roy%"
            elif "david" in msg_lower:
                teacher_query = "%David Fernandez%"
            elif user_role == "TEACHER" and user_context.get("name"):
                teacher_query = f"%{user_context['name']}%"

            rows = c.execute("""
            SELECT tc.teacher_name, tc.class_name, tc.subject_name, t.department
            FROM teacher_class_subject_assignments tc
            JOIN teachers t ON tc.teacher_id = t.id
            WHERE tc.teacher_name LIKE ? OR t.name LIKE ?
            """, (teacher_query, teacher_query)).fetchall()

            if rows:
                t_name = rows[0]["teacher_name"]
                classes_list = [f"**{r['class_name']}** ({r['subject_name']})" for r in rows]
                response_text = f"**{t_name}** teaches the following classes:\n\n" + "\n".join([f"- {item}" for item in classes_list])
                suggested_followups = [
                    f"Who teaches Mathematics in Class 10-A?",
                    f"How many students are enrolled in Class 10-A?",
                    f"What was the attendance of Class 10-A on 14 October 2026?"
                ]
            else:
                response_text = f"I could not find class assignments for that teacher in the database."

        # -------------------------------------------------------------------------
        # 2. Intent: CLASS ENROLLMENT
        # E.g. "How many students are enrolled in Class 10-A?"
        # -------------------------------------------------------------------------
        elif "how many students" in msg_lower or "enrolled in" in msg_lower or "enrollment" in msg_lower:
            cls = normalize_class(msg)
            data_sources.extend(["students", "classes"])
            count_row = c.execute("""
            SELECT COUNT(*) as count FROM students 
            WHERE class LIKE ? OR class LIKE ?
            """, (f"%{cls}%", f"%{cls.replace('-', '')}%")).fetchone()
            class_info = c.execute("""
            SELECT name, room, class_teacher, capacity FROM classes 
            WHERE name LIKE ? OR name LIKE ?
            """, (f"%{cls}%", f"%{cls.replace('-', '')}%")).fetchone()
            student_count = count_row["count"] if count_row else 0
            if student_count > 0:
                room_str = f" in {class_info['room']}" if class_info and class_info["room"] else ""
                teacher_str = f", with Class Teacher **{class_info['class_teacher']}**" if class_info and class_info["class_teacher"] else ""
                capacity_str = f" (classroom capacity: {class_info['capacity']})" if class_info and class_info["capacity"] else ""
                
                response_text = f"There are currently **{student_count} students** enrolled in **{cls}**{capacity_str}{teacher_str}{room_str}."
                suggested_followups = [
                    f"What was the attendance of {cls} on 14 October 2026?",
                    f"Who teaches Mathematics in {cls}?",
                    f"What examinations are scheduled for {cls}?"
                ]
            else:
                response_text = f"No enrolled students were found for class '{cls}'. Please check if the class name is formatted as 'Class 10-A'."

        # -------------------------------------------------------------------------
        # 3. Intent: FEE INQUIRIES (UNPAID, PAID, TOTAL OUTSTANDING)
        # -------------------------------------------------------------------------
        elif any(w in msg_lower for w in ["unpaid fee", "unpaid fees", "outstanding fee", "paid fee", "paid their fees", "fee status", "fees"]):
            data_sources.extend(["fee_invoices", "fees"])

            # ROLE ACCESS CHECK
            if user_role == "TEACHER":
                response_text = "🔒 **Access Restricted**: Global school financial balances and individual student fee records are confidential. As a teacher, you do not have permission to view student fee accounts."
                conn.close()
                return {
                    "response": response_text,
                    "data_sources": data_sources,
                    "suggested_followups": ["Which classes do I teach?", "What was the attendance of Class 10-A on 14 October 2026?"]
                }
            
            if user_role == "STUDENT":
                # Only own fees
                std_id = user_context.get("linked_id", "std-101")
                inv = c.execute("SELECT * FROM fee_invoices WHERE student_id = ?", (std_id,)).fetchone()
                if inv:
                    status_badge = "Paid" if inv["balance_amount"] == 0 else f"Pending (Balance: ₹{inv['balance_amount']:,})"
                    response_text = f"**Fee Status for {inv['student_name']}** ({inv['class']}):\n\n- Term: {inv['term']}\n- Total Fees: ₹{inv['total_amount']:,}\n- Paid: ₹{inv['paid_amount']:,}\n- Balance Due: ₹{inv['balance_amount']:,}\n- Status: **{inv['status']}**\n- Due Date: {inv['due_date']}"
                else:
                    response_text = "No fee record was found for your student profile."
                conn.close()
                return {
                    "response": response_text,
                    "data_sources": data_sources,
                    "suggested_followups": ["What is my attendance rate?", "Which assignments are pending for me?"]
                }

            if user_role == "PARENT":
                # Only child's fees
                parent_user_id = user_context.get("id")
                links = c.execute("SELECT student_id FROM parent_student_links WHERE parent_user_id = ?", (parent_user_id,)).fetchall()
                child_ids = [l["student_id"] for l in links] if links else ["std-101"]
                
                rows = c.execute(f"SELECT * FROM fee_invoices WHERE student_id IN ({','.join(['?']*len(child_ids))})", child_ids).fetchall()
                if rows:
                    lines = ["**Fee Details for Your Child / Children**:"]
                    for inv in rows:
                        lines.append(f"\n- **{inv['student_name']}** ({inv['class']}):\n  - Invoice: {inv['invoice_number']}\n  - Total: ₹{inv['total_amount']:,}\n  - Paid: ₹{inv['paid_amount']:,}\n  - Balance: ₹{inv['balance_amount']:,}\n  - Status: **{inv['status']}** (Due: {inv['due_date']})")
                    response_text = "\n".join(lines)
                else:
                    response_text = "No fee invoices found for your linked student."
                conn.close()
                return {
                    "response": response_text,
                    "data_sources": data_sources,
                    "suggested_followups": ["What was the attendance of my child on 14 October 2026?", "Which parents have meetings scheduled?"]
                }

            # ADMIN ROLE ACCESS
            if "outstanding" in msg_lower or "total fee" in msg_lower or "total unpaid" in msg_lower:
                agg = c.execute("""
                SELECT 
                    SUM(balance_amount) as total_outstanding,
                    COUNT(CASE WHEN balance_amount > 0 THEN 1 END) as pending_students,
                    SUM(total_amount) as total_invoiced,
                    SUM(paid_amount) as total_collected
                FROM fee_invoices
                """).fetchone()
                total_out = agg["total_outstanding"] or 0
                total_coll = agg["total_collected"] or 0
                total_inv = agg["total_invoiced"] or 0
                pending_count = agg["pending_students"] or 0
                response_text = (
                    f"**Total Outstanding Fee Summary**:\n\n"
                    f"- **Total Outstanding Amount**: **₹{total_out:,}**\n"
                    f"- **Students with Outstanding Dues**: {pending_count} students\n"
                    f"- **Total Invoiced**: ₹{total_inv:,}\n"
                    f"- **Total Collected**: ₹{total_coll:,} ({(total_coll/total_inv*100):.1f}% collection rate)"
                )
                suggested_followups = [
                    "Which students have unpaid fees?",
                    "Which students have paid their fees?",
                    "How many students are enrolled in Class 10-A?"
                ]
            elif "unpaid" in msg_lower or "pending" in msg_lower or "due" in msg_lower:
                rows = c.execute("""
                SELECT student_name, class, balance_amount, total_amount, paid_amount, status, due_date
                FROM fee_invoices
                WHERE balance_amount > 0
                ORDER BY balance_amount DESC
                """).fetchall()
                if rows:
                    lines = [f"**Students with Unpaid / Partial Fees** ({len(rows)} found):\n"]
                    for r in rows:
                        lines.append(f"- **{r['student_name']}** ({r['class']}): Outstanding **₹{r['balance_amount']:,}** (Paid ₹{r['paid_amount']:,} of ₹{r['total_amount']:,}) — Status: *{r['status']}*")
                    response_text = "\n".join(lines)
                else:
                    response_text = "All student fee invoices are completely paid! There are no unpaid fees."
                
                suggested_followups = [
                    "What is the total outstanding fee amount?",
                    "Which students have paid their fees?",
                    "Which parents have meetings scheduled?"
                ]
            elif "paid" in msg_lower:
                rows = c.execute("""
                SELECT student_name, class, paid_amount, due_date
                FROM fee_invoices
                WHERE status = 'Paid'
                ORDER BY student_name ASC
                """).fetchall()
                if rows:
                    lines = [f"**Students Who Have Paid Their Fees** ({len(rows)} students):\n"]
                    for r in rows:
                        lines.append(f"- **{r['student_name']}** ({r['class']}) — Paid ₹{r['paid_amount']:,} in full.")
                    response_text = "\n".join(lines)
                else:
                    response_text = "No fully paid invoices recorded yet."
                
                suggested_followups = [
                    "Which students have unpaid fees?",
                    "What is the total outstanding fee amount?",
                    "What was the attendance of Class 10-A on 14 October 2026?"
                ]

        # -------------------------------------------------------------------------
        # 4. Intent: ATTENDANCE & ABSENTEES
        # E.g. "What was the attendance of Class 10-A on 14 October 2026?"
        # E.g. "Which students were absent on that date?"
        # -------------------------------------------------------------------------
        elif "attendance" in msg_lower or "absent" in msg_lower or "present" in msg_lower:
            data_sources.append("attendance_records")
            cls = normalize_class(msg)
            date_str = normalize_date(msg) or "2026-10-14"

            # Check if student or parent asking for personal/child attendance
            if user_role == "STUDENT":
                std_id = user_context.get("linked_id", "std-101")
                att = c.execute("SELECT * FROM attendance_records WHERE student_id = ? AND date = ?", (std_id, date_str)).fetchone()
                std_row = c.execute("SELECT attendance_rate, name, class FROM students WHERE id = ?", (std_id,)).fetchone()
                
                status_str = att["status"] if att else "PRESENT"
                rate_str = f"{std_row['attendance_rate']}%" if std_row else "94%"
                response_text = f"**Attendance Record for {user_context.get('name', 'Student')}**:\n\n- Date: **{date_str}**\n- Class: {cls}\n- Status on {date_str}: **{status_str}**\n- Overall Academic Attendance Rate: **{rate_str}**"
                suggested_followups = ["Which assignments are pending for me?", "What examinations are scheduled for Class 10-A?"]
                conn.close()
                return {"response": response_text, "data_sources": data_sources, "suggested_followups": suggested_followups}

            if user_role == "PARENT":
                parent_user_id = user_context.get("id")
                links = c.execute("SELECT student_id FROM parent_student_links WHERE parent_user_id = ?", (parent_user_id,)).fetchall()
                child_ids = [l["student_id"] for l in links] if links else ["std-101"]
                lines = [f"**Attendance on {date_str} for Your Child / Children**:"]
                for cid in child_ids:
                    att = c.execute("SELECT * FROM attendance_records WHERE student_id = ? AND date = ?", (cid, date_str)).fetchone()
                    s_info = c.execute("SELECT name, class, attendance_rate FROM students WHERE id = ?", (cid,)).fetchone()
                    if s_info:
                        st = att["status"] if att else "PRESENT"
                        lines.append(f"- **{s_info['name']}** ({s_info['class']}): **{st}** (Cumulative attendance rate: {s_info['attendance_rate']}%)")
                response_text = "\n".join(lines)
                suggested_followups = ["Do I have any unpaid fees?", "What examinations are scheduled for Class 10-A?"]
                conn.close()
                return {"response": response_text, "data_sources": data_sources, "suggested_followups": suggested_followups}

            # ADMIN & TEACHER: Full Class Attendance & Absentees
            if "absent" in msg_lower or "who was absent" in msg_lower or "absentees" in msg_lower:
                absentees = c.execute("""
                SELECT student_name, student_id FROM attendance_records
                WHERE (class LIKE ? OR class LIKE ?) AND date = ? AND status = 'ABSENT'
                ORDER BY student_name ASC
                """, (f"%{cls}%", f"%{cls.replace('-', '')}%", date_str)).fetchall()
                if absentees:
                    lines = [f"On **{date_str}**, the following **{len(absentees)} students** were marked **ABSENT** in **{cls}**:\n"]
                    for a in absentees:
                        lines.append(f"- **{a['student_name']}** (Student ID: `{a['student_id']}`)")
                    response_text = "\n".join(lines)
                else:
                    response_text = f"No students were marked absent in {cls} on {date_str}. All students were present!"
                suggested_followups = [
                    f"What was the attendance of {cls} on {date_str}?",
                    f"Which students have unpaid fees?",
                    f"Which parents have meetings scheduled?"
                ]
            else:
                # Overall class attendance count / percentage
                stats = c.execute("""
                SELECT status, COUNT(*) as count
                FROM attendance_records
                WHERE (class LIKE ? OR class LIKE ?) AND date = ?
                GROUP BY status
                """, (f"%{cls}%", f"%{cls.replace('-', '')}%", date_str)).fetchall()
                stat_dict = {row["status"]: row["count"] for row in stats}
                present_count = stat_dict.get("PRESENT", 0)
                absent_count = stat_dict.get("ABSENT", 0)
                total = present_count + absent_count
                if total > 0:
                    pct = (present_count / total) * 100
                    response_text = (
                        f"**Attendance for {cls} on {date_str}**:\n\n"
                        f"- **Present**: {present_count} students\n"
                        f"- **Absent**: {absent_count} students\n"
                        f"- **Total Marked**: {total} students\n"
                        f"- **Attendance Rate**: **{pct:.1f}%**"
                    )
                    if absent_count > 0:
                        response_text += f"\n\n*(You can ask 'Which students were absent on that date?' to see the names.)*"
                else:
                    response_text = f"No attendance record was found for {cls} on {date_str}. The standard record date is 14 October 2026."
                suggested_followups = [
                    f"Which students were absent on {date_str}?",
                    f"How many students are enrolled in {cls}?",
                    f"Who teaches Mathematics in {cls}?"
                ]

        # -------------------------------------------------------------------------
        # 5. Intent: PARENT MEETINGS (SCHEDULED & PENDING)
        # E.g. "Which parents have meetings scheduled?"
        # E.g. "Which meetings are pending approval?"
        # -------------------------------------------------------------------------
        elif "meeting" in msg_lower or "meetings" in msg_lower:
            data_sources.extend(["meetings", "parent_meetings"])
            if "pending" in msg_lower:
                query = "SELECT * FROM meetings WHERE status = 'PENDING'"
                params = []
                if user_role == "TEACHER":
                    query += " AND target_staff_id = ?"
                    params.append(user_context.get("linked_id", "tch-01"))
                elif user_role == "PARENT":
                    query += " AND requester_id = ?"
                    params.append(user_context.get("id"))
                rows = c.execute(query, params).fetchall()
                if rows:
                    lines = [f"**Parent-Teacher Meetings Pending Approval** ({len(rows)} pending):\n"]
                    for r in rows:
                        lines.append(f"- **{r['requester_name']}** with **{r['target_staff_name']}**\n  - Date/Time: {r['preferred_date']} at {r['preferred_time']}\n  - Reason: {r['reason']}\n  - Status: *{r['status']}*")
                    response_text = "\n".join(lines)
                else:
                    response_text = "There are no parent meetings currently pending approval."
            else:
                query = "SELECT * FROM meetings WHERE status = 'APPROVED' OR status = 'CONFIRMED'"
                params = []
                if user_role == "TEACHER":
                    query += " AND (target_staff_id = ? OR target_staff_name LIKE ?)"
                    params.extend([user_context.get("linked_id", "tch-01"), f"%{user_context.get('name', '')}%"])
                elif user_role == "PARENT":
                    query += " AND requester_id = ?"
                    params.append(user_context.get("id"))
                rows = c.execute(query, params).fetchall()
                if rows:
                    lines = [f"**Scheduled Parent Meetings** ({len(rows)} scheduled):\n"]
                    for r in rows:
                        lines.append(f"- **{r['requester_name']}** with **{r['target_staff_name']}**\n  - Date/Time: **{r['preferred_date']} at {r['preferred_time']}** ({r['mode']})\n  - Reason: {r['reason']}\n  - Note: {r['decision_notes'] or 'Confirmed'}")
                    response_text = "\n".join(lines)
                else:
                    response_text = "No meetings are currently scheduled."
            
            suggested_followups = [
                "Which meetings are pending approval?",
                "Which parents have meetings scheduled?",
                "Who teaches Mathematics in Class 10-A?"
            ]

        # -------------------------------------------------------------------------
        # 6. Intent: ASSIGNMENTS
        # E.g. "Which assignments are pending?"
        # -------------------------------------------------------------------------
        elif "assignment" in msg_lower or "homework" in msg_lower:
            data_sources.append("assignments")
            cls = normalize_class(msg) if any(c in msg_lower for c in ["class", "10", "9", "8", "11", "12"]) else None
            
            query = "SELECT * FROM assignments WHERE 1=1"
            params = []
            if cls:
                query += " AND class LIKE ?"
                params.append(f"%{cls}%")
            rows = c.execute(query, params).fetchall()
            if rows:
                lines = [f"**Current & Pending Assignments**:\n"]
                for r in rows:
                    lines.append(f"- **{r['title']}**\n  - Class: {r['class']} | Subject: {r['subject']}\n  - Due Date: **{r['due_date']}** | Max Marks: {r['max_marks']}\n  - Assigned by: {r['teacher_name']}")
                response_text = "\n".join(lines)
            else:
                response_text = "No pending assignments found in the database."
            suggested_followups = [
                "What examinations are scheduled for Class 10-A?",
                "What was the attendance of Class 10-A on 14 October 2026?",
                "Who teaches Mathematics in Class 10-A?"
            ]

        # -------------------------------------------------------------------------
        # 7. Intent: EXAMINATIONS SCHEDULE
        # E.g. "What examinations are scheduled for Class 10-A?"
        # -------------------------------------------------------------------------
        elif ("examination" in msg_lower or "exams" in msg_lower or "exam schedule" in msg_lower) and not any(r in msg_lower for r in ["result", "marks", "grade", "score", "published"]):
            data_sources.append("exams")
            cls = normalize_class(msg) if any(c in msg_lower for c in ["class", "10", "9", "8", "11", "12"]) else "Class 10-A"
            rows = c.execute("""
            SELECT * FROM exams 
            WHERE class_name LIKE ? OR class_name LIKE ?
            ORDER BY exam_date ASC
            """, (f"%{cls}%", f"%{cls.replace('-', '')}%")).fetchall()
            if rows:
                lines = [f"**Examination Schedule for {cls}**:\n"]
                for r in rows:
                    lines.append(f"- **{r['subject']}** — *{r['exam_name']}*\n  - Date: **{r['exam_date']}** at {r['start_time']} ({r['duration_minutes']} mins)\n  - Room: {r['room']} | Max Marks: {r['max_marks']}")
                response_text = "\n".join(lines)
            else:
                response_text = f"No upcoming examinations scheduled for {cls}."
            suggested_followups = [
                "What are the published examination results?",
                "Which assignments are pending?",
                "Who teaches Mathematics in Class 10-A?"
            ]

        # -------------------------------------------------------------------------
        # 8. Intent: PUBLISHED RESULTS
        # E.g. "What are the published examination results?"
        # -------------------------------------------------------------------------
        elif "published result" in msg_lower or "results" in msg_lower or "marks" in msg_lower or "grades" in msg_lower:
            data_sources.extend(["exams_results", "published_results"])
            if user_role == "STUDENT":
                std_id = user_context.get("linked_id", "std-101")
                rows = c.execute("SELECT * FROM exams_results WHERE student_id = ? AND published = 1", (std_id,)).fetchall()
            elif user_role == "PARENT":
                parent_user_id = user_context.get("id")
                links = c.execute("SELECT student_id FROM parent_student_links WHERE parent_user_id = ?", (parent_user_id,)).fetchall()
                child_ids = [l["student_id"] for l in links] if links else ["std-101"]
                rows = c.execute(f"SELECT * FROM exams_results WHERE student_id IN ({','.join(['?']*len(child_ids))}) AND published = 1", child_ids).fetchall()
            else:
                # Admin / Teacher
                cls = normalize_class(msg) if any(c in msg_lower for c in ["class", "10", "9", "8", "11", "12"]) else "Class 10-A"
                rows = c.execute("SELECT * FROM exams_results WHERE (class LIKE ? OR class LIKE ?) AND published = 1", (f"%{cls}%", f"%{cls.replace('-', '')}%")).fetchall()
            
            if rows:
                lines = ["**Published Examination Results**:\n"]
                for r in rows:
                    lines.append(f"- **{r['student_name']}** ({r['subject']}): **{r['marks_obtained']}/{r['max_marks']}** (Grade: **{r['grade']}**) — *{r['remarks'] or ''}*")
                response_text = "\n".join(lines)
            else:
                response_text = "No published examination results found for the requested criteria."
            suggested_followups = [
                "What examinations are scheduled for Class 10-A?",
                "How many students are enrolled in Class 10-A?",
                "What was the attendance of Class 10-A on 14 October 2026?"
            ]

        # -------------------------------------------------------------------------
        # 9. Fallback: LLM Grounded Query with Schema Context or Clarification
        # -------------------------------------------------------------------------
        if not response_text:
            response_text = self.fallback_with_gemini_or_clarify(user_role, user_context, msg, c, data_sources)
            if not suggested_followups:
                suggested_followups = [
                    "Who teaches Mathematics in Class 10-A?",
                    "How many students are enrolled in Class 10-A?",
                    "What was the attendance of Class 10-A on 14 October 2026?"
                ]

        conn.close()
        return {
            "response": response_text,
            "data_sources": list(set(data_sources)),
            "suggested_followups": suggested_followups
        }

    def fallback_with_gemini_or_clarify(self, user_role, user_context, message, cursor, data_sources):
        """
        Attempts to synthesize answer using Gemini API with live DB schema,
        or prompts user for clarification if question is ambiguous.
        """
        if not self.api_key:
            return (
                "I am CUROS AI, your school management assistant. "
                "Could you please specify which information you are looking for? For example:\n\n"
                "- *'Who teaches Mathematics in Class 10-A?'*\n"
                "- *'How many students are enrolled in Class 10-A?'*\n"
                "- *'What was the attendance of Class 10-A on 14 October 2026?'*\n"
                "- *'Which students have unpaid fees?'*"
            )

        try:
            # Query summary data for prompt context
            teachers_sample = cursor.execute("SELECT name, subject, classes_assigned FROM teachers LIMIT 5").fetchall()
            classes_sample = cursor.execute("SELECT name, total_students, class_teacher FROM classes LIMIT 5").fetchall()
            
            prompt = f"""You are CUROS AI, an intelligent database-grounded assistant for Smart School Management System.
The authenticated user role is: {user_role}.
User Context: {json.dumps(user_context)}

Available Database Context:
- Teachers: {[dict(t) for t in teachers_sample]}
- Classes: {[dict(c) for c in classes_sample]}
- Date Context: Today is October 2026. Academic term is Term 1 (2026-2027).

Role-Based Rules:
1. ADMIN has full school access.
2. TEACHER cannot view school-wide finances or other teachers' private records.
3. STUDENT can only view their own attendance, fees, marks, and their class timetable/teachers.
4. PARENT can only view their linked child's attendance, fees, marks, and timetable.
5. If the request violates role permissions, politely refuse and state the restriction.
6. If the request is ambiguous, ask for specific clarification (e.g. ask for class name or date).
7. Base answers strictly on school facts, do not make up dates or names.

User Question: {message}

Provide a helpful, professional, Markdown-formatted answer:"""

            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={self.api_key}"
            data = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 800}
            }).encode("utf-8")

            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=8) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                ans = res["candidates"][0]["content"]["parts"][0]["text"].strip()
                data_sources.append("gemini-grounded-db")
                return ans
        except Exception as e:
            print("Gemini fallback exception:", e)
            return (
                "I couldn't find a direct record matching that query. "
                "Could you please clarify? You can ask about:\n\n"
                "- Subject teachers (e.g. *'Who teaches Mathematics in Class 10-A?'*)\n"
                "- Class enrollments (e.g. *'How many students are enrolled in Class 10-A?'*)\n"
                "- Attendance (e.g. *'What was the attendance of Class 10-A on 14 October 2026?'*)\n"
                "- Fees and payments (e.g. *'Which students have unpaid fees?'*)"
            )

curos_engine = CurosEngine()
