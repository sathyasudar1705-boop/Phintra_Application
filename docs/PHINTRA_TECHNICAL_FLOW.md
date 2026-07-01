# Phintra Platform — Backend/Frontend Integration & Data Flow

This document details the backend-to-frontend integrations, data structures, role-based access controls, and transaction flows implementing the **Phintra Phishing Awareness and Training Platform**.

---

## 1. Role-Based Access Control & Multi-Tenant Data Isolation

Phintra implements complete multi-tenant database isolation. Administrative portals run in isolated silos, preventing cross-tenant information leaks.

### 1.1 User Roles Matrix
1. **Security Administrator:** Full read/write access to company settings, employee databases, campaigns, SMTP server configurations, templates, quiz creation, audit logs, and support message threads.
2. **Security Manager:** Read-only dashboard access. Restricted from editing templates, creating campaigns, deleting employees, or modifying company configurations.
3. **Employee:** Locked out of `/admin/*` routes. Accesses `/user/*` to view personal training modules, quizzes, certificates, and reported email histories.

### 1.2 Data Isolation Logic
Tenant isolation is enforced at the database query level. Every API route determines the logged-in administrator's scope (`admin_id` or `company_id`) and injects filters into the SQLAlchemy query builder.

```python
# Query scoping example (e.g., listing campaigns in campaigns.py)
query = db.query(Campaign)
if company_id:
    query = query.filter(Campaign.company_id == company_id)
elif admin_id:
    query = query.filter(Campaign.admin_id == admin_id)
campaigns = query.all()
```

This guarantees that:
- Admin A cannot view, edit, or delete campaigns belonging to Admin B.
- Employee A cannot see progress charts or certificate records of Employee B.
- Support messages are routed exclusively to the administrator responsible for that employee's tenant organization.

---

## 2. Technical Integration Flows

These step-by-step technical workflows map client actions to database events.

### Feature 1: User Registration & Authentication

```
[Register.jsx] ---> POST /auth/register ---> [auth.py] ---> DB: users (Insert)
[Login.jsx]    ---> POST /auth/login    ---> [auth.py] ---> Verify Hashed Password ---> Returns JWT
```

#### A. Registration Flow
* **Frontend:** `phishguard-ai/src/pages/auth/Register.jsx` calls `register()` from `AuthContext.jsx`.
* **API Endpoint:** `POST /auth/register` (in `backend/app/routes/auth.py`).
* **Backend Logic:** Validates unique email inputs, creates a new `Company` entry, hashes password using bcrypt, and saves a new `User` record with role `Admin`.
* **Database Models:** [User](file:///c:/Sathyasudar/demo-react-project/backend/app/models/user.py) (`users` table), [Company](file:///c:/Sathyasudar/demo-react-project/backend/app/models/company.py) (`companies` table).
* **Response Data:** Returns registered user details (excluding password hash) in a `UserResponse` JSON structure.
* **Error Handling:** Returns `400 Bad Request` if password length is insufficient, or `409 Conflict` if the administrator email or company name is already registered.

#### B. Administrative Login Flow
* **Frontend:** `phishguard-ai/src/pages/auth/Login.jsx` requests token.
* **API Endpoint:** `POST /auth/login` (in `backend/app/routes/auth.py`).
* **Backend Logic:** Authenticates username/email using OAuth2 password flow, verifies bcrypt password hash, and signs a JWT bearer token containing the user's UUID and roles scope.
* **Database Models:** [User](file:///c:/Sathyasudar/demo-react-project/backend/app/models/user.py).
* **Response Data:** Returns access token payload (`access_token`, `token_type`, `role`).
* **Error Handling:** Returns `401 Unauthorized` for password mismatch or unverified user emails.

---

### Feature 2: Passwordless Employee Auto-Login

```
[Simulated Email link] ---> Click ---> /user/dashboard?token=... ---> GET /auth/verify-dashboard-token ---> Returns JWT
```

* **Frontend:** `phishguard-ai/src/context/AuthContext.jsx` detects `?token=...` parameter in the landing page query parameters on app initialization.
* **API Endpoint:** `GET /auth/verify-dashboard-token` (in `backend/app/routes/auth.py`).
* **Backend Logic:** Decodes and validates the secure token parameter, checks database expiration timestamps, resolves matching employee record details, and issues a standard JWT access token authorizing employee dashboard access.
* **Database Models:** [Employee](file:///c:/Sathyasudar/demo-react-project/backend/app/models/employee.py) (`employees` table).
* **Response Data:** Returns signed JWT `access_token` and employee metadata profile.
* **Error Handling:** Returns `403 Forbidden` if the secure token has expired or is invalid.

---

### Feature 3: Phishing Simulation Campaign Launch

```
[CreateCampaign.jsx] ---> POST /campaigns/launch ---> [campaigns.py]
                                                       |
                                                       v
                                            [email_service.py] ---> Send SMTP
                                                       |
                                                       v
                                            DB: email_logs & campaign status updated
```

* **Frontend:** `phishguard-ai/src/pages/admin/CreateCampaign.jsx` wizard calls launch API.
* **API Endpoint:** `POST /campaigns/{id}/launch` (in `backend/app/routes/campaigns.py`).
* **Backend Logic:** Resolves campaign details and associated template HTML body, generates secure tracking UUIDs for each recipient employee, registers campaign logs in `email_logs`, updates status to `Active`, and dispatches emails via corporate SMTP.
* **Database Models:** [Campaign](file:///c:/Sathyasudar/demo-react-project/backend/app/models/campaign.py) (`campaigns` table), [Employee](file:///c:/Sathyasudar/demo-react-project/backend/app/models/employee.py), [EmailLog](file:///c:/Sathyasudar/demo-react-project/backend/app/models/email_log.py) (`email_logs` table).
* **Response Data:** Returns updated campaign status JSON.
* **Error Handling:** Returns `404 Not Found` if template or recipient lists are missing.

---

### Feature 4: Simulated Phishing Click Tracking

```
[Employee clicks simulated link] ---> GET /campaigns/click/{track_id}
                                                 |
                                                 v
                                        DB: CampaignRecipient updated (Clicked)
                                        DB: Employee risk_score increased
                                        Redirects employee to educational warning (/report/:track_id)
```

* **Frontend:** Browser requests link (e.g. `http://localhost:8000/api/campaigns/click/{track_id}`).
* **API Endpoint:** `GET /campaigns/click/{track_id}` (in `backend/app/routes/campaigns.py`).
* **Backend Logic:** Resolves tracking ID, updates matching recipient record as Clicked, logs a `ReportLog` click action, increases employee risk rating, updates organizational metrics, and returns an HTTP redirect to the portal training landing page `/report/{track_id}`.
* **Database Models:** [CampaignRecipient](file:///c:/Sathyasudar/demo-react-project/backend/app/models/campaign.py) (`campaign_recipients` table), [ReportLog](file:///c:/Sathyasudar/demo-react-project/backend/app/models/campaign.py) (`report_logs` table), [Employee](file:///c:/Sathyasudar/demo-react-project/backend/app/models/employee.py).
* **Response Data:** `307 Temporary Redirect` response.
* **Error Handling:** Falls back to default system warning page if tracking UUID does not match database records.

---

### Feature 5: Suspicious Email Ingestion (Gmail Add-on)

```
[Gmail Add-on] ---> Click Report ---> POST /gmail/report-email ---> [gmail.py]
                                                                         |
                                                                         v
                                                                 AI Analysis Run
                                                                         |
                                                                         v
                                                                 DB: reported_emails
                                                                 DB: Employee XP updated
                                                                 Returns risk score, rank, token
```

* **Frontend:** `gmail-addon/Code.js` fetches Gmail plain text, sends POST request.
* **API Endpoint:** `POST /gmail/report-email` (in `backend/app/routes/gmail.py`).
* **Backend Logic:** Verifies authorization headers, queries employee email mapping, executes heuristic risk assessment using local AI models (`analyze_email_risk`), saves record to `reported_emails`, awards XP points to reporting employee, recalculates leaderboard rank, and signs secure auto-login credentials.
* **Database Models:** [ReportedEmail](file:///c:/Sathyasudar/demo-react-project/backend/app/models/reported_email.py) (`reported_emails` table), [Employee](file:///c:/Sathyasudar/demo-react-project/backend/app/models/employee.py), [Reward](file:///c:/Sathyasudar/demo-react-project/backend/app/models/certificate.py).
* **Response Data:** Returns success indicators, report ID, AI threat level metrics, XP awarded, company leaderboard rank, and passwordless url token.
* **Error Handling:** Returns `403 Forbidden` if reporter email is not registered under corporate databases.

---

## 3. Database Schema Relationships

```
  +---------------+             +---------------+             +---------------+
  |     users     | <--------- |   companies   | <--------- |  departments  |
  +---------------+             +---------------+             +---------------+
          ^                             ^                             ^
          |                             |                             |
          |                             +--------------+              |
          |                                            |              |
          |             +---------------+              |              |
          +----------- |   employees   | <------------+--------------+
                        +---------------+
                                |
                                +----------->  [training_assignments,
                                                quiz_attempts,
                                                reported_emails,
                                                certificates,
                                                email_logs]
```

* **users:** Stores administrative accounts (Admin, Manager).
* **companies:** Stores tenant profiles. Belongs to a single creating administrator (`admin_id`).
* **departments:** Segments organizations. Linked to a company (`company_id`) and managed by an administrator.
* **employees:** Linked to a department (`department_id`), company (`company_id`), and admin manager (`admin_id`).
* **campaigns:** Reference simulation scopes. Linked to creating administrator (`admin_id`) and target sender profile (`sender_profile_id`).
* **reported_emails:** Suspicious emails flagged by employees. Traced to a specific employee ID and company tenant.

---

## 4. Source Traceability

### Scanned Database Models
- User Model: [user.py](file:///c:/Sathyasudar/demo-react-project/backend/app/models/user.py)
- Employee Model: [employee.py](file:///c:/Sathyasudar/demo-react-project/backend/app/models/employee.py)
- Campaign Models: [campaign.py](file:///c:/Sathyasudar/demo-react-project/backend/app/models/campaign.py)
- Reported Email Model: [reported_email.py](file:///c:/Sathyasudar/demo-react-project/backend/app/models/reported_email.py)

### Scanned Backend Routers
- Authentications: [auth.py](file:///c:/Sathyasudar/demo-react-project/backend/app/routes/auth.py)
- Campaigns: [campaigns.py](file:///c:/Sathyasudar/demo-react-project/backend/app/routes/campaigns.py)
- Gmail add-on: [gmail.py](file:///c:/Sathyasudar/demo-react-project/backend/app/routes/gmail.py)
- Analytics: [analytics.py](file:///c:/Sathyasudar/demo-react-project/backend/app/routes/analytics.py)
