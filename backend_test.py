import requests
import json
import os
from typing import Optional

class APITester:
    def __init__(self):
        # Get base URL from environment
        env_path = '/app/.env'
        base_url = None
        
        try:
            with open(env_path, 'r') as f:
                for line in f:
                    if line.startswith('NEXT_PUBLIC_BASE_URL='):
                        base_url = line.strip().split('=', 1)[1]
                        break
        except:
            pass
            
        self.base_url = base_url or "https://preschool-audit.preview.emergentagent.com"
        self.api_url = f"{self.base_url}/api"
        self.admin_token = None
        self.inspector_token = None
        self.headers = {
            'Content-Type': 'application/json'
        }
        
        print(f"🌐 Testing API at: {self.api_url}")

    def test_admin_login(self):
        """Test admin authentication"""
        print("\n📱 Testing Admin Login...")
        
        try:
            response = requests.post(
                f"{self.api_url}/auth/login",
                json={
                    "phone": "05549584320",
                    "password": "123457"
                },
                headers=self.headers
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data and data['user']['role'] == 'admin':
                    self.admin_token = data['token']
                    print("✅ Admin login successful")
                    print(f"User: {data['user']['name']} - Role: {data['user']['role']}")
                    return True
                else:
                    print("❌ Admin login failed - invalid response structure")
                    print(f"Response: {data}")
                    return False
            else:
                print(f"❌ Admin login failed with status {response.status_code}")
                try:
                    print(f"Error: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Admin login error: {str(e)}")
            return False

    def test_inspector_login(self):
        """Test inspector authentication"""
        print("\n🔍 Testing Inspector Login...")
        
        try:
            response = requests.post(
                f"{self.api_url}/auth/login",
                json={
                    "phone": "05549584321",
                    "password": "123456"
                },
                headers=self.headers
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if 'token' in data and data['user']['role'] == 'inspector':
                    self.inspector_token = data['token']
                    print("✅ Inspector login successful")
                    print(f"User: {data['user']['name']} - Role: {data['user']['role']}")
                    return True
                else:
                    print("❌ Inspector login failed - invalid response structure")
                    print(f"Response: {data}")
                    return False
            else:
                print(f"❌ Inspector login failed with status {response.status_code}")
                try:
                    print(f"Error: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Inspector login error: {str(e)}")
            return False

    def test_admin_inspections_list(self):
        """Test GET /api/admin/inspections"""
        print("\n📋 Testing Admin Inspections List...")
        
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        try:
            headers = {
                **self.headers,
                'Authorization': f'Bearer {self.admin_token}'
            }
            
            response = requests.get(f"{self.api_url}/admin/inspections", headers=headers)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Admin inspections list retrieved successfully")
                print(f"Found {len(data)} inspections")
                if data:
                    print(f"Sample inspection: {data[0].get('schoolName', 'N/A')} - Status: {data[0].get('status', 'N/A')}")
                return True, data
            else:
                print(f"❌ Admin inspections list failed with status {response.status_code}")
                try:
                    print(f"Error: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"❌ Admin inspections list error: {str(e)}")
            return False, None

    def test_inspector_inspections_list(self):
        """Test GET /api/inspector/inspections"""
        print("\n🔍 Testing Inspector Inspections List...")
        
        if not self.inspector_token:
            print("❌ No inspector token available")
            return False
            
        try:
            headers = {
                **self.headers,
                'Authorization': f'Bearer {self.inspector_token}'
            }
            
            response = requests.get(f"{self.api_url}/inspector/inspections", headers=headers)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Inspector inspections list retrieved successfully")
                print(f"Found {len(data)} assigned inspections")
                if data:
                    print(f"Sample inspection: {data[0].get('schoolName', 'N/A')} - Status: {data[0].get('status', 'N/A')}")
                return True, data
            else:
                print(f"❌ Inspector inspections list failed with status {response.status_code}")
                try:
                    print(f"Error: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"❌ Inspector inspections list error: {str(e)}")
            return False, None

    def test_admin_assign_inspector(self, inspection_id: str, inspector_id: str = None):
        """Test PUT /api/admin/inspections/{id}/assign"""
        print(f"\n👥 Testing Admin Inspector Assignment for inspection {inspection_id}...")
        
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        if not inspector_id:
            # Try to get inspector ID from inspector token
            if self.inspector_token:
                import jwt
                try:
                    decoded = jwt.decode(self.inspector_token, options={"verify_signature": False})
                    inspector_id = decoded.get('id')
                    print(f"Using inspector ID: {inspector_id}")
                except:
                    print("❌ Could not get inspector ID from token")
                    return False
            else:
                print("❌ No inspector ID provided and no inspector token available")
                return False
            
        try:
            headers = {
                **self.headers,
                'Authorization': f'Bearer {self.admin_token}'
            }
            
            response = requests.put(
                f"{self.api_url}/admin/inspections/{inspection_id}/assign",
                json={"inspectorId": inspector_id},
                headers=headers
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Inspector assignment successful")
                print(f"Inspection ID: {data.get('id', 'N/A')} assigned to inspector: {data.get('inspectorId', 'N/A')}")
                return True
            else:
                print(f"❌ Inspector assignment failed with status {response.status_code}")
                try:
                    print(f"Error: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Inspector assignment error: {str(e)}")
            return False

    def test_inspector_start_inspection(self, inspection_id: str):
        """Test POST /api/inspector/inspection/start"""
        print(f"\n🚀 Testing Inspector Start Inspection for {inspection_id}...")
        
        if not self.inspector_token:
            print("❌ No inspector token available")
            return False
            
        try:
            headers = {
                **self.headers,
                'Authorization': f'Bearer {self.inspector_token}'
            }
            
            response = requests.post(
                f"{self.api_url}/inspector/inspection/start",
                json={"inspectionId": inspection_id},
                headers=headers
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Inspection started successfully")
                print(f"Status changed to: {data['inspection'].get('status', 'N/A')}")
                print(f"Categories loaded: {len(data.get('categories', []))}")
                return True, data
            else:
                print(f"❌ Inspection start failed with status {response.status_code}")
                try:
                    print(f"Error: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"❌ Inspection start error: {str(e)}")
            return False, None

    def test_inspector_save_answer(self, inspection_id: str, question_id: str):
        """Test POST /api/inspector/inspection/answer"""
        print(f"\n💾 Testing Inspector Save Answer for inspection {inspection_id}, question {question_id}...")
        
        if not self.inspector_token:
            print("❌ No inspector token available")
            return False
            
        try:
            headers = {
                **self.headers,
                'Authorization': f'Bearer {self.inspector_token}'
            }
            
            response = requests.post(
                f"{self.api_url}/inspector/inspection/answer",
                json={
                    "inspectionId": inspection_id,
                    "questionId": question_id,
                    "answer": "uygun",
                    "note": "Test note from backend testing",
                    "photos": []
                },
                headers=headers
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Answer saved successfully")
                print(f"Answer ID: {data.get('id', 'N/A')}")
                print(f"Answer: {data.get('answer', 'N/A')}")
                return True, data
            else:
                print(f"❌ Answer save failed with status {response.status_code}")
                try:
                    print(f"Error: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"❌ Answer save error: {str(e)}")
            return False, None

    def test_inspector_complete_inspection(self, inspection_id: str):
        """Test POST /api/inspector/inspection/complete"""
        print(f"\n✅ Testing Inspector Complete Inspection for {inspection_id}...")
        
        if not self.inspector_token:
            print("❌ No inspector token available")
            return False
            
        try:
            headers = {
                **self.headers,
                'Authorization': f'Bearer {self.inspector_token}'
            }
            
            response = requests.post(
                f"{self.api_url}/inspector/inspection/complete",
                json={"inspectionId": inspection_id},
                headers=headers
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Inspection completed successfully")
                print(f"Message: {data.get('message', 'N/A')}")
                print(f"Status: {data['inspection'].get('status', 'N/A')}")
                return True
            else:
                print(f"❌ Inspection complete failed with status {response.status_code}")
                try:
                    print(f"Error: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Inspection complete error: {str(e)}")
            return False

    def test_admin_inspection_report(self, inspection_id: str):
        """Test GET /api/admin/inspection/{id}/report"""
        print(f"\n📊 Testing Admin Inspection Report for {inspection_id}...")
        
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        try:
            headers = {
                **self.headers,
                'Authorization': f'Bearer {self.admin_token}'
            }
            
            response = requests.get(f"{self.api_url}/admin/inspection/{inspection_id}/report", headers=headers)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Inspection report retrieved successfully")
                print(f"School: {data['inspection'].get('schoolName', 'N/A')}")
                print(f"Status: {data['inspection'].get('status', 'N/A')}")
                print(f"Categories: {len(data.get('categories', []))}")
                print(f"Answers: {len(data['inspection'].get('answers', []))}")
                return True, data
            else:
                print(f"❌ Inspection report failed with status {response.status_code}")
                try:
                    print(f"Error: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"❌ Inspection report error: {str(e)}")
            return False, None

    def test_admin_update_answer_note(self, inspection_id: str, answer_id: str):
        """Test PUT /api/admin/inspection/{id}/answer/{answerId}"""
        print(f"\n📝 Testing Admin Update Answer Note for answer {answer_id}...")
        
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        try:
            headers = {
                **self.headers,
                'Authorization': f'Bearer {self.admin_token}'
            }
            
            response = requests.put(
                f"{self.api_url}/admin/inspection/{inspection_id}/answer/{answer_id}",
                json={"note": "Updated note from backend testing"},
                headers=headers
            )
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Answer note updated successfully")
                print(f"Answer ID: {data.get('id', 'N/A')}")
                print(f"Updated note: {data.get('note', 'N/A')}")
                return True
            else:
                print(f"❌ Answer note update failed with status {response.status_code}")
                try:
                    print(f"Error: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Answer note update error: {str(e)}")
            return False

    def test_admin_inspection_pdf(self, inspection_id: str):
        """Test GET /api/admin/inspection/{id}/pdf"""
        print(f"\n📄 Testing Admin Inspection PDF for {inspection_id}...")
        
        if not self.admin_token:
            print("❌ No admin token available")
            return False
            
        try:
            headers = {
                **self.headers,
                'Authorization': f'Bearer {self.admin_token}'
            }
            
            response = requests.get(f"{self.api_url}/admin/inspection/{inspection_id}/pdf", headers=headers)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Inspection PDF data retrieved successfully")
                print(f"School: {data['inspection'].get('schoolName', 'N/A')}")
                print(f"Generated at: {data.get('generatedAt', 'N/A')}")
                print(f"Company: {data.get('company', 'N/A')}")
                return True
            else:
                print(f"❌ Inspection PDF failed with status {response.status_code}")
                try:
                    print(f"Error: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Inspection PDF error: {str(e)}")
            return False

def main():
    """Main test execution"""
    print("🚀 Starting Core Inspection and Reporting System API Tests")
    print("=" * 60)
    
    tester = APITester()
    results = {}
    
    # 1. Authentication Tests
    results['admin_login'] = tester.test_admin_login()
    results['inspector_login'] = tester.test_inspector_login()
    
    # 2. Admin Inspection Management
    admin_inspections_success, inspections_data = tester.test_admin_inspections_list()
    results['admin_inspections_list'] = admin_inspections_success
    
    # 3. Inspector Flow Tests (need an inspection to work with)
    inspector_inspections_success, inspector_inspections_data = tester.test_inspector_inspections_list()
    results['inspector_inspections_list'] = inspector_inspections_success
    
    # Use existing inspection if available, or create test scenario
    test_inspection_id = None
    test_answer_id = None
    
    if inspections_data and len(inspections_data) > 0:
        test_inspection_id = inspections_data[0]['id']
        print(f"\n📍 Using existing inspection for testing: {test_inspection_id}")
        
        # Test inspector assignment
        results['admin_assign_inspector'] = tester.test_admin_assign_inspector(test_inspection_id)
        
        # Test inspector start inspection
        start_success, start_data = tester.test_inspector_start_inspection(test_inspection_id)
        results['inspector_start_inspection'] = start_success
        
        # Test inspector save answer (need a question ID)
        if start_success and start_data and start_data.get('categories'):
            categories = start_data['categories']
            question_id = None
            for category in categories:
                if category.get('questions') and len(category['questions']) > 0:
                    question_id = category['questions'][0]['id']
                    break
                    
            if question_id:
                answer_success, answer_data = tester.test_inspector_save_answer(test_inspection_id, question_id)
                results['inspector_save_answer'] = answer_success
                if answer_success and answer_data:
                    test_answer_id = answer_data['id']
            else:
                print("⚠️ No questions found to test answer saving")
                results['inspector_save_answer'] = False
        else:
            results['inspector_save_answer'] = False
            
        # Test inspector complete inspection
        results['inspector_complete_inspection'] = tester.test_inspector_complete_inspection(test_inspection_id)
        
        # 4. Report System Tests
        report_success, report_data = tester.test_admin_inspection_report(test_inspection_id)
        results['admin_inspection_report'] = report_success
        
        # Test admin update answer note
        if test_answer_id:
            results['admin_update_answer_note'] = tester.test_admin_update_answer_note(test_inspection_id, test_answer_id)
        else:
            print("⚠️ No answer ID available to test answer note update")
            results['admin_update_answer_note'] = False
            
        # Test admin inspection PDF
        results['admin_inspection_pdf'] = tester.test_admin_inspection_pdf(test_inspection_id)
        
    else:
        print("\n⚠️ No inspections found in database to test with")
        print("Testing will be limited to authentication and listing endpoints")
        results.update({
            'admin_assign_inspector': False,
            'inspector_start_inspection': False,
            'inspector_save_answer': False,
            'inspector_complete_inspection': False,
            'admin_inspection_report': False,
            'admin_update_answer_note': False,
            'admin_inspection_pdf': False
        })
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All backend API tests passed successfully!")
    elif passed > total * 0.7:
        print("⚠️ Most tests passed - some issues detected")
    else:
        print("❌ Significant issues detected - multiple test failures")
    
    return results

if __name__ == "__main__":
    main()