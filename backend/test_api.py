import unittest
import json
import os
import sys
import sqlite3
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.app import app, init_db, get_db
from backend.curos_dataset import generate_dataset_and_seed

class SmartSchoolMultiRoleTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        generate_dataset_and_seed()
        cls.client = app.test_client()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['backend'], 'Flask')
        self.assertIn('ADMIN', data['roles'])

    def test_02_login_and_roles(self):
        # Admin Login with initial Curos passcode
        res_admin = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'CurosAdmin@2026!', 'role': 'ADMIN'})
        self.assertEqual(res_admin.status_code, 200)
        data_admin = res_admin.get_json()
        self.assertEqual(data_admin['user']['role'], 'ADMIN')
        self.assertTrue(data_admin['success'])
        self.assertTrue(bool(data_admin['token']))

        # Teacher Login with initial Curos passcode
        res_tch = self.client.post('/api/auth/login', json={'username': 'teacher', 'password': 'CurosTeacher@2026!', 'role': 'TEACHER'})
        self.assertEqual(res_tch.status_code, 200)
        self.assertEqual(res_tch.get_json()['user']['role'], 'TEACHER')

        # Student Login with initial Curos passcode
        res_std = self.client.post('/api/auth/login', json={'username': 'student', 'password': 'CurosStudent@2026!', 'role': 'STUDENT'})
        self.assertEqual(res_std.status_code, 200)
        self.assertEqual(res_std.get_json()['user']['role'], 'STUDENT')

        # Parent Login with initial Curos passcode
        res_par = self.client.post('/api/auth/login', json={'username': 'parent', 'password': 'CurosParent@2026!', 'role': 'PARENT'})
        self.assertEqual(res_par.status_code, 200)
        self.assertEqual(res_par.get_json()['user']['role'], 'PARENT')

        # Role mismatch validation: Student tries to log in under Teacher context
        res_mismatch = self.client.post('/api/auth/login', json={'username': 'student', 'password': 'CurosStudent@2026!', 'role': 'TEACHER'})
        self.assertEqual(res_mismatch.status_code, 401)
        self.assertIn('Invalid credentials', res_mismatch.get_json()['error'])

        # Invalid Credentials
        res_inv = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'wrongpassword'})
        self.assertEqual(res_inv.status_code, 401)

    def test_03_role_authorization_and_isolation(self):
        # Student tries to access Admin Audit Logs
        res_std_login = self.client.post('/api/auth/login', json={'username': 'student', 'password': 'studentpassword123'})
        std_token = res_std_login.get_json()['token']
        headers = {'Authorization': f'Bearer {std_token}'}

        res_audit = self.client.get('/api/audit-logs', headers=headers)
        self.assertEqual(res_audit.status_code, 403)

        # Teacher tries to access school fees
        res_tch_login = self.client.post('/api/auth/login', json={'username': 'teacher', 'password': 'teacherpassword123'})
        tch_token = res_tch_login.get_json()['token']
        res_tch_fees = self.client.get('/api/fees', headers={'Authorization': f'Bearer {tch_token}'})
        self.assertEqual(res_tch_fees.status_code, 403)

        # Admin can access Audit Logs
        res_adm_login = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'adminpassword123'})
        adm_token = res_adm_login.get_json()['token']
        res_audit_ok = self.client.get('/api/audit-logs', headers={'Authorization': f'Bearer {adm_token}'})
        self.assertEqual(res_audit_ok.status_code, 200)

    def test_04_complaint_pipeline(self):
        # Student logs in and files a complaint
        res_std = self.client.post('/api/auth/login', json={'username': 'student', 'password': 'studentpassword123'})
        std_token = res_std.get_json()['token']
        res_post = self.client.post('/api/complaints', headers={'Authorization': f'Bearer {std_token}'}, json={
            'title': 'Test Laboratory Equipment Fault',
            'description': 'Microscope light is flickering in biology lab.',
            'category': 'Academic',
            'priority': 'Medium'
        })
        self.assertEqual(res_post.status_code, 201)
        cmp_data = res_post.get_json()
        self.assertTrue(cmp_data['ticket_number'].startswith('#C-'))
        cmp_id = cmp_data['id']

        # Teacher/Admin updates status
        res_adm = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'adminpassword123'})
        adm_token = res_adm.get_json()['token']
        res_put = self.client.put(f'/api/complaints/{cmp_id}/status', headers={'Authorization': f'Bearer {adm_token}'}, json={
            'status': 'RESOLVED',
            'resolutionNotes': 'Microscope bulb replaced by laboratory technician.'
        })
        self.assertEqual(res_put.status_code, 200)

    def test_05_meeting_pipeline_and_conflict_prevention(self):
        # Parent requests meeting with Principal
        res_par = self.client.post('/api/auth/login', json={'username': 'parent', 'password': 'parentpassword123'})
        par_token = res_par.get_json()['token']

        unique_suffix = int(time.time() * 1000) % 10000
        meeting_date = f"2027-11-{(unique_suffix % 25) + 1}"
        meeting_time = f"{(unique_suffix % 11) + 1}:{(unique_suffix % 50):02d} AM"

        res_book = self.client.post('/api/meetings', headers={'Authorization': f'Bearer {par_token}'}, json={
            'preferredDate': meeting_date,
            'preferredTime': meeting_time,
            'reason': 'Curriculum query',
            'targetStaffId': 'usr-admin-1',
            'targetStaffName': 'Principal Office'
        })
        self.assertEqual(res_book.status_code, 201)
        mtg_id = res_book.get_json()['id']

        # Admin approves meeting
        res_adm = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'adminpassword123'})
        adm_token = res_adm.get_json()['token']
        res_approve = self.client.put(f'/api/meetings/{mtg_id}/status', headers={'Authorization': f'Bearer {adm_token}'}, json={
            'status': 'CONFIRMED',
            'decisionNotes': 'Looking forward to meeting.'
        })
        self.assertEqual(res_approve.status_code, 200)

        # Attempt duplicate booking for same slot
        res_dupe = self.client.post('/api/meetings', headers={'Authorization': f'Bearer {par_token}'}, json={
            'preferredDate': meeting_date,
            'preferredTime': meeting_time,
            'reason': 'Another query',
            'targetStaffId': 'usr-admin-1'
        })
        self.assertEqual(res_dupe.status_code, 409)

    def test_06_attendance_marking_and_alerts(self):
        res_tch = self.client.post('/api/auth/login', json={'username': 'teacher', 'password': 'teacherpassword123'})
        tch_token = res_tch.get_json()['token']
        res_att = self.client.post('/api/attendance', headers={'Authorization': f'Bearer {tch_token}'}, json={
            'class': 'Class 10A',
            'date': '2025-08-27',
            'records': [
                {'studentId': 'std-101', 'status': 'PRESENT'},
                {'studentId': 'std-102', 'status': 'ABSENT'}
            ]
        })
        self.assertEqual(res_att.status_code, 200)

        # Student cannot mark attendance
        res_std = self.client.post('/api/auth/login', json={'username': 'student', 'password': 'studentpassword123'})
        std_token = res_std.get_json()['token']
        res_std_att = self.client.post('/api/attendance', headers={'Authorization': f'Bearer {std_token}'}, json={
            'class': 'Class 10A',
            'date': '2025-08-27',
            'records': [{'studentId': 'std-101', 'status': 'PRESENT'}]
        })
        self.assertEqual(res_std_att.status_code, 403)

    def test_07_role_dashboards_and_schedules(self):
        # Student Dashboard
        res_std = self.client.post('/api/auth/login', json={'username': 'student', 'password': 'studentpassword123'})
        std_token = res_std.get_json()['token']
        res_std_dash = self.client.get('/api/dashboard/student', headers={'Authorization': f'Bearer {std_token}'})
        self.assertEqual(res_std_dash.status_code, 200)
        std_data = res_std_dash.get_json()
        self.assertIn('student', std_data)
        self.assertIn('todayClasses', std_data)
        self.assertIn('assignments', std_data)
        self.assertIn('results', std_data)

        # Student Schedule
        res_std_sch = self.client.get('/api/schedule', headers={'Authorization': f'Bearer {std_token}'})
        self.assertEqual(res_std_sch.status_code, 200)

        # Teacher Dashboard
        res_tch = self.client.post('/api/auth/login', json={'username': 'teacher', 'password': 'teacherpassword123'})
        tch_token = res_tch.get_json()['token']
        res_tch_dash = self.client.get('/api/dashboard/teacher', headers={'Authorization': f'Bearer {tch_token}'})
        self.assertEqual(res_tch_dash.status_code, 200)
        tch_data = res_tch_dash.get_json()
        self.assertIn('teacherName', tch_data)
        self.assertIn('assignedClasses', tch_data)

        # Parent Dashboard
        res_par = self.client.post('/api/auth/login', json={'username': 'parent', 'password': 'parentpassword123'})
        par_token = res_par.get_json()['token']
        res_par_dash = self.client.get('/api/dashboard/parent', headers={'Authorization': f'Bearer {par_token}'})
        self.assertEqual(res_par_dash.status_code, 200)
        par_data = res_par_dash.get_json()
        self.assertIn('children', par_data)

        # Admin previewing Student Dashboard
        res_adm = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'adminpassword123'})
        adm_token = res_adm.get_json()['token']
        res_adm_std_dash = self.client.get('/api/dashboard/student', headers={'Authorization': f'Bearer {adm_token}'})
        self.assertEqual(res_adm_std_dash.status_code, 200)

    def test_08_curos_dataset_files_and_db_counts(self):
        # 1. Check dataset files exist on disk
        dataset_dir = os.path.abspath('curos_ai_demo_dataset')
        self.assertTrue(os.path.isdir(dataset_dir))
        expected_files = [
            'teachers.csv', 'classes.csv', 'teacher_class_subject_assignments.csv',
            'students.csv', 'parents.csv', 'fee_invoices.csv', 'fee_payments.csv',
            'attendance.csv', 'parent_meetings.csv', 'assignments.csv', 'exams.csv',
            'published_results.csv', 'curos_demo_dataset.json', 'README.md', 'IMPORT_NOTES.sql'
        ]
        for ef in expected_files:
            file_path = os.path.join(dataset_dir, ef)
            self.assertTrue(os.path.isfile(file_path), f"Missing dataset file: {ef}")
            self.assertGreater(os.path.getsize(file_path), 0, f"File is empty: {ef}")

        # 2. Check ZIP archive
        zip_path = os.path.abspath('curos_ai_demo_dataset.zip')
        self.assertTrue(os.path.isfile(zip_path))
        self.assertGreater(os.path.getsize(zip_path), 1000)

        # 3. Check /api/curos/dataset-status endpoint
        res = self.client.get('/api/curos/dataset-status')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'verified')
        tables = data['dataset_tables']
        self.assertGreaterEqual(tables['teachers'], 5)
        self.assertGreaterEqual(tables['students'], 30)
        self.assertGreaterEqual(tables['teacher_class_subject_assignments'], 7)
        self.assertGreaterEqual(tables['fee_invoices'], 8)
        self.assertGreaterEqual(tables['attendance_records'], 30)

    def test_09_curos_ai_queries_admin(self):
        # Login as Admin
        res_adm = self.client.post('/api/auth/login', json={'username': 'admin', 'password': 'adminpassword123'})
        adm_token = res_adm.get_json()['token']
        headers = {'Authorization': f'Bearer {adm_token}'}

        # 1. Who teaches Mathematics in Class 10-A?
        res1 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'Who teaches Mathematics in Class 10-A?'})
        self.assertEqual(res1.status_code, 200)
        self.assertIn('Amit Sharma', res1.get_json()['response'])
        self.assertIn('Mathematics', res1.get_json()['response'])

        # 2. Which classes does Amit Sharma teach?
        res2 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'Which classes does Amit Sharma teach?'})
        self.assertEqual(res2.status_code, 200)
        self.assertIn('Class 10-A', res2.get_json()['response'])
        self.assertIn('Class 9-A', res2.get_json()['response'])

        # 3. How many students are enrolled in Class 10-A?
        res3 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'How many students are enrolled in Class 10-A?'})
        self.assertEqual(res3.status_code, 200)
        self.assertIn('30', res3.get_json()['response'])

        # 4. Which students have unpaid fees?
        res4 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'Which students have unpaid fees?'})
        self.assertEqual(res4.status_code, 200)
        self.assertIn('Kabir Khan', res4.get_json()['response'])

        # 5. Which students have paid their fees?
        res5 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'Which students have paid their fees?'})
        self.assertEqual(res5.status_code, 200)
        self.assertIn('Aarav Patel', res5.get_json()['response'])

        # 6. What is the total outstanding fee amount?
        res6 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'What is the total outstanding fee amount?'})
        self.assertEqual(res6.status_code, 200)
        self.assertIn('48,400', res6.get_json()['response'])

        # 7. What was the attendance of Class 10-A on 14 October 2026?
        res7 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'What was the attendance of Class 10-A on 14 October 2026?'})
        self.assertEqual(res7.status_code, 200)
        self.assertIn('28', res7.get_json()['response'])
        self.assertIn('93.3%', res7.get_json()['response'])

        # 8. Which students were absent on that date?
        res8 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'Which students were absent on 14 October 2026?'})
        self.assertEqual(res8.status_code, 200)
        self.assertIn('Kabir Khan', res8.get_json()['response'])
        self.assertIn('Rohan Mehra', res8.get_json()['response'])

        # 9. Which parents have meetings scheduled?
        res9 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'Which parents have meetings scheduled?'})
        self.assertEqual(res9.status_code, 200)
        self.assertIn('Vikram Patel', res9.get_json()['response'])

        # 10. Which meetings are pending approval?
        res10 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'Which meetings are pending approval?'})
        self.assertEqual(res10.status_code, 200)
        self.assertIn('Imran Khan', res10.get_json()['response'])

        # 11. Which assignments are pending?
        res11 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'Which assignments are pending?'})
        self.assertEqual(res11.status_code, 200)
        self.assertIn('Quadratic Equations', res11.get_json()['response'])

        # 12. What examinations are scheduled for Class 10-A?
        res12 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'What examinations are scheduled for Class 10-A?'})
        self.assertEqual(res12.status_code, 200)
        self.assertIn('Mid-Term Examination 2026', res12.get_json()['response'])
        self.assertIn('Mathematics', res12.get_json()['response'])

        # 13. What are the published examination results?
        res13 = self.client.post('/api/curos/chat', headers=headers, json={'message': 'What are the published examination results?'})
        self.assertEqual(res13.status_code, 200)
        self.assertIn('Aarav Patel', res13.get_json()['response'])

    def test_10_curos_ai_role_authorization(self):
        # Teacher Login
        res_tch = self.client.post('/api/auth/login', json={'username': 'teacher', 'password': 'teacherpassword123'})
        tch_token = res_tch.get_json()['token']
        tch_headers = {'Authorization': f'Bearer {tch_token}'}

        # Teacher asks for school fees -> should be restricted
        res_tch_fees = self.client.post('/api/curos/chat', headers=tch_headers, json={'message': 'What is the total outstanding fee amount?'})
        self.assertEqual(res_tch_fees.status_code, 200)
        self.assertIn('Access Restricted', res_tch_fees.get_json()['response'])

        # Student Login
        res_std = self.client.post('/api/auth/login', json={'username': 'student', 'password': 'studentpassword123'})
        std_token = res_std.get_json()['token']
        std_headers = {'Authorization': f'Bearer {std_token}'}

        # Student asks about own fees -> allowed
        res_std_fees = self.client.post('/api/curos/chat', headers=std_headers, json={'message': 'Do I have any unpaid fees?'})
        self.assertEqual(res_std_fees.status_code, 200)
        self.assertIn('Aarav Patel', res_std_fees.get_json()['response'])

        # Parent Login
        res_par = self.client.post('/api/auth/login', json={'username': 'parent', 'password': 'parentpassword123'})
        par_token = res_par.get_json()['token']
        par_headers = {'Authorization': f'Bearer {par_token}'}

        # Parent asks about child's attendance on 14 October 2026
        res_par_att = self.client.post('/api/curos/chat', headers=par_headers, json={'message': 'What was the attendance of my child on 14 October 2026?'})
        self.assertEqual(res_par_att.status_code, 200)
        self.assertIn('PRESENT', res_par_att.get_json()['response'])

        # Suggested questions check
        res_sq = self.client.get('/api/curos/suggested-questions', headers=par_headers)
        self.assertEqual(res_sq.status_code, 200)
        sq_data = res_sq.get_json()
        self.assertIn('PARENT', sq_data['role'])
        self.assertIn("Hello! I'm CUROS AI. I can help you check your child's attendance", sq_data['welcome_message'])
        self.assertGreaterEqual(len(sq_data['questions']), 5)

    def test_11_object_level_authorization(self):
        # Parent A (usr-parent-1 linked to std-101) cannot access Student B (std-103)
        res_par = self.client.post('/api/auth/login', json={'username': 'parent', 'password': 'parentpassword123'})
        par_token = res_par.get_json()['token']
        par_headers = {'Authorization': f'Bearer {par_token}'}

        # Try to access unlinked student std-103 directly
        res_unauth_std = self.client.get('/api/students/std-103', headers=par_headers)
        self.assertEqual(res_unauth_std.status_code, 403)

        # Parent dashboard with unlinked child filter
        res_unauth_child_dash = self.client.get('/api/dashboard/parent?childId=std-103', headers=par_headers)
        self.assertEqual(res_unauth_child_dash.status_code, 403)

        # Student A (std-101) cannot view Student B (std-102) profile
        res_std = self.client.post('/api/auth/login', json={'username': 'student', 'password': 'studentpassword123'})
        std_token = res_std.get_json()['token']
        std_headers = {'Authorization': f'Bearer {std_token}'}
        res_other_std = self.client.get('/api/students/std-102', headers=std_headers)
        self.assertEqual(res_other_std.status_code, 403)

        # Student cannot pay another student's fees
        res_pay_other = self.client.put('/api/fees/fee-2/pay', headers=std_headers) # fee-2 belongs to std-102
        self.assertEqual(res_pay_other.status_code, 403)

if __name__ == '__main__':
    unittest.main()
