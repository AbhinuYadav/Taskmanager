import requests
import json
import time
from typing import Dict, Any

class TaskManagerAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.admin_token = None
        self.member_token = None
        self.member2_token = None
        self.admin_id = None
        self.member1_id = None
        self.member2_id = None
        self.project_id = None
        self.task_id = None
        
    def print_test(self, test_name: str, passed: bool, details: str = ""):
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"[{status}] {test_name}")
        if details:
            print(f"     📝 {details}")
        print()
    
    def test_health_check(self):
        """Test 1: Health Check"""
        try:
            response = requests.get(f"{self.base_url}/health")
            if response.status_code == 200:
                self.print_test("Health Check", True, f"Status: {response.json()}")
                return True
            else:
                self.print_test("Health Check", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Health Check", False, f"Error: {str(e)}")
            return False
    
    def test_signup_admin(self):
        """Test 2: Signup Admin User"""
        data = {
            "email": "admin@test.com",
            "username": "admin",
            "password": "admin123",
            "role": "admin"
        }
        try:
            response = requests.post(f"{self.base_url}/api/auth/signup", json=data)
            if response.status_code == 200:
                result = response.json()
                self.admin_token = result.get("access_token")
                self.admin_id = result.get("user", {}).get("id")
                self.print_test("Signup Admin", True, f"Admin ID: {self.admin_id}")
                return True
            else:
                self.print_test("Signup Admin", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.print_test("Signup Admin", False, f"Error: {str(e)}")
            return False
    
    def test_login_admin(self):
        """Test 3: Login Admin"""
        data = {
            "username": "admin",
            "password": "admin123"
        }
        try:
            response = requests.post(f"{self.base_url}/api/auth/login", json=data)
            if response.status_code == 200:
                result = response.json()
                self.admin_token = result.get("access_token")
                self.print_test("Login Admin", True, f"Token received: {self.admin_token[:20]}...")
                return True
            else:
                self.print_test("Login Admin", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Login Admin", False, f"Error: {str(e)}")
            return False
    
    def test_signup_member1(self):
        """Test 4: Signup Member 1"""
        data = {
            "email": "john@test.com",
            "username": "john",
            "password": "john123",
            "role": "member"
        }
        try:
            response = requests.post(f"{self.base_url}/api/auth/signup", json=data)
            if response.status_code == 200:
                result = response.json()
                self.member1_id = result.get("user", {}).get("id")
                self.print_test("Signup Member 1", True, f"Member ID: {self.member1_id}, Username: john")
                return True
            else:
                self.print_test("Signup Member 1", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Signup Member 1", False, f"Error: {str(e)}")
            return False
    
    def test_signup_member2(self):
        """Test 5: Signup Member 2"""
        data = {
            "email": "jane@test.com",
            "username": "jane",
            "password": "jane123",
            "role": "member"
        }
        try:
            response = requests.post(f"{self.base_url}/api/auth/signup", json=data)
            if response.status_code == 200:
                result = response.json()
                self.member2_id = result.get("user", {}).get("id")
                self.print_test("Signup Member 2", True, f"Member ID: {self.member2_id}, Username: jane")
                return True
            else:
                self.print_test("Signup Member 2", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Signup Member 2", False, f"Error: {str(e)}")
            return False
    
    def test_get_members_admin(self):
        """Test 6: Get All Members (Admin only)"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = requests.get(f"{self.base_url}/api/members", headers=headers)
            if response.status_code == 200:
                members = response.json()
                member_count = len([m for m in members if m.get("role") == "member"])
                self.print_test("Get Members (Admin)", True, f"Found {member_count} members")
                return True
            else:
                self.print_test("Get Members (Admin)", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Get Members (Admin)", False, f"Error: {str(e)}")
            return False
    
    def test_create_project(self):
        """Test 7: Create Project (Admin only)"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        data = {
            "name": "E-Commerce Platform",
            "description": "Build a full-stack e-commerce website"
        }
        try:
            response = requests.post(f"{self.base_url}/api/projects", json=data, headers=headers)
            if response.status_code == 200:
                result = response.json()
                self.project_id = result.get("id")
                self.print_test("Create Project", True, f"Project ID: {self.project_id}, Name: {result.get('name')}")
                return True
            else:
                self.print_test("Create Project", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Create Project", False, f"Error: {str(e)}")
            return False
    
    def test_get_projects(self):
        """Test 8: Get All Projects"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = requests.get(f"{self.base_url}/api/projects", headers=headers)
            if response.status_code == 200:
                projects = response.json()
                self.print_test("Get Projects", True, f"Found {len(projects)} projects")
                return True
            else:
                self.print_test("Get Projects", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Get Projects", False, f"Error: {str(e)}")
            return False
    
    def test_create_task_with_milestones(self):
        """Test 9: Create Task with Milestones (Admin only)"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        data = {
            "title": "User Authentication System",
            "description": "Implement JWT authentication and user management",
            "project_id": self.project_id,
            "assigned_to_id": self.member1_id,
            "due_date": "2024-12-31T23:59:59",
            "milestones": [
                {"title": "Design Database Schema", "description": "Create User and Session tables"},
                {"title": "Implement JWT Tokens", "description": "Create token generation and validation"},
                {"title": "Build Login/Signup APIs", "description": "Create authentication endpoints"},
                {"title": "Create React UI Components", "description": "Build login and registration forms"}
            ]
        }
        try:
            response = requests.post(f"{self.base_url}/api/tasks", json=data, headers=headers)
            if response.status_code == 200:
                result = response.json()
                self.task_id = result.get("id")
                milestones_count = len(result.get("milestones", []))
                self.print_test("Create Task with Milestones", True, f"Task ID: {self.task_id}, Milestones: {milestones_count}")
                return True
            else:
                self.print_test("Create Task with Milestones", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.print_test("Create Task with Milestones", False, f"Error: {str(e)}")
            return False
    
    def test_login_member(self):
        """Test 10: Login as Member"""
        data = {
            "username": "john",
            "password": "john123"
        }
        try:
            response = requests.post(f"{self.base_url}/api/auth/login", json=data)
            if response.status_code == 200:
                result = response.json()
                self.member_token = result.get("access_token")
                self.print_test("Login Member (John)", True, f"Token received for John")
                return True
            else:
                self.print_test("Login Member (John)", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Login Member (John)", False, f"Error: {str(e)}")
            return False
    
    def test_get_member_tasks(self):
        """Test 11: Get Member's Assigned Tasks"""
        headers = {"Authorization": f"Bearer {self.member_token}"}
        try:
            response = requests.get(f"{self.base_url}/api/tasks", headers=headers)
            if response.status_code == 200:
                tasks = response.json()
                self.print_test("Get Member Tasks", True, f"Found {len(tasks)} tasks assigned to John")
                return True
            else:
                self.print_test("Get Member Tasks", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Get Member Tasks", False, f"Error: {str(e)}")
            return False
    
    def test_update_milestone_progress(self):
        """Test 12: Update Milestone Progress (Member)"""
        headers = {"Authorization": f"Bearer {self.member_token}"}
        data = {
            "progress_percentage": 50
        }
        try:
            response = requests.post(
                f"{self.base_url}/api/tasks/{self.task_id}/milestones/1/progress", 
                json=data, 
                headers=headers
            )
            if response.status_code == 200:
                result = response.json()
                self.print_test("Update Milestone Progress", True, f"Progress updated to 50% - Status: {result.get('status')}")
                return True
            else:
                self.print_test("Update Milestone Progress", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Update Milestone Progress", False, f"Error: {str(e)}")
            return False
    
    def test_update_milestone_to_100(self):
        """Test 13: Complete Milestone (100%)"""
        headers = {"Authorization": f"Bearer {self.member_token}"}
        data = {
            "progress_percentage": 100
        }
        try:
            response = requests.post(
                f"{self.base_url}/api/tasks/{self.task_id}/milestones/1/progress", 
                json=data, 
                headers=headers
            )
            if response.status_code == 200:
                result = response.json()
                self.print_test("Complete Milestone", True, f"Progress: 100% - Status: {result.get('status')}")
                return True
            else:
                self.print_test("Complete Milestone", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Complete Milestone", False, f"Error: {str(e)}")
            return False
    
    def test_admin_dashboard(self):
        """Test 14: Get Admin Dashboard Stats"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = requests.get(f"{self.base_url}/api/members/dashboard", headers=headers)
            if response.status_code == 200:
                stats = response.json()
                self.print_test("Admin Dashboard Stats", True, f"Total Tasks: {stats.get('total_tasks')}, Completed: {stats.get('completed_tasks')}")
                return True
            else:
                self.print_test("Admin Dashboard Stats", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Admin Dashboard Stats", False, f"Error: {str(e)}")
            return False
    
    def test_member_tasks_summary(self):
        """Test 15: Get Member Tasks Summary (Admin)"""
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        try:
            response = requests.get(f"{self.base_url}/api/members/member-tasks", headers=headers)
            if response.status_code == 200:
                summary = response.json()
                self.print_test("Member Tasks Summary", True, f"Found {len(summary)} members with tasks")
                return True
            else:
                self.print_test("Member Tasks Summary", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Member Tasks Summary", False, f"Error: {str(e)}")
            return False
    
    def test_unauthorized_access(self):
        """Test 16: Test Unauthorized Access (Member trying admin endpoint)"""
        headers = {"Authorization": f"Bearer {self.member_token}"}
        try:
            response = requests.get(f"{self.base_url}/api/members", headers=headers)
            if response.status_code == 403:
                self.print_test("Unauthorized Access Prevention", True, "Member correctly blocked from admin endpoint")
                return True
            else:
                self.print_test("Unauthorized Access Prevention", False, f"Expected 403, got {response.status_code}")
                return False
        except Exception as e:
            self.print_test("Unauthorized Access Prevention", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "="*60)
        print("🚀 STARTING API TESTS FOR TASK MANAGER")
        print("="*60 + "\n")
        
        tests = [
            ("Health Check", self.test_health_check),
            ("Signup Admin", self.test_signup_admin),
            ("Login Admin", self.test_login_admin),
            ("Signup Member 1", self.test_signup_member1),
            ("Signup Member 2", self.test_signup_member2),
            ("Get Members (Admin)", self.test_get_members_admin),
            ("Create Project", self.test_create_project),
            ("Get Projects", self.test_get_projects),
            ("Create Task with Milestones", self.test_create_task_with_milestones),
            ("Login Member", self.test_login_member),
            ("Get Member Tasks", self.test_get_member_tasks),
            ("Update Milestone Progress (50%)", self.test_update_milestone_progress),
            ("Complete Milestone (100%)", self.test_update_milestone_to_100),
            ("Admin Dashboard Stats", self.test_admin_dashboard),
            ("Member Tasks Summary", self.test_member_tasks_summary),
            ("Unauthorized Access Prevention", self.test_unauthorized_access),
        ]
        
        results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                results.append((test_name, result))
            except Exception as e:
                print(f"[❌ ERROR] {test_name}: {str(e)}\n")
                results.append((test_name, False))
        
        # Summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅" if result else "❌"
            print(f"{status} {test_name}")
        
        print("\n" + "="*60)
        print(f"TOTAL: {passed}/{total} TESTS PASSED")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! Your API is working perfectly!")
            print("\n📝 Next steps:")
            print("   1. Start React frontend: cd ../frontend && npm start")
            print("   2. Connect frontend to this backend")
            print("   3. Deploy to Railway")
        else:
            print(f"\n⚠️ {total - passed} TESTS FAILED. Please check your setup.")
        
        print("="*60 + "\n")

if __name__ == "__main__":
    # Wait a moment for server to be ready
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    # Run tests
    tester = TaskManagerAPITester()
    tester.run_all_tests()