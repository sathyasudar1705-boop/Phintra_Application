# Phintra Platform — Button Inventory & Color Guide

This guide documents the button inventory, color system, and UI design decisions implemented across the **Phintra Phishing Awareness and Training Platform**.

---

## 1. Button Inventory Table

Below is the inventory of key interactive buttons found in the application.

| Button Text | Page Location (Source File) | Purpose | Required Role | API/Action Triggered | Expected Result | Success State | Error State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Sign In** | `/admin/login`<br>`(Login.jsx)` | Authenticate admins/managers | Public | `POST /auth/login` | Renders Dashboard | Token saved in `localStorage` | Error text banner, red input borders |
| **Access Portal** | `/user/login`<br>`(EmployeeLogin.jsx)` | Authenticate employees | Public | `POST /auth/employee-login` | Renders Employee Home | Token saved in `localStorage` | Error text banner |
| **Create Account** | `/register`<br>`(Register.jsx)` | Register new corporate tenants | Public | `POST /auth/register` | Registers company/admin | Success Toast, login redirect | Validation warning message |
| **Refresh (Icon)** | `/admin/dashboard`<br>`(Dashboard.jsx)` | Force sync analytics data | Admin / Manager | `GET /analytics/dashboard`<br>`GET /analytics/departments` | Updates charts/numbers | Spinner stops, numbers update | Warn log in console |
| **Add Employee** | `/admin/dashboard`<br>`(Dashboard.jsx)` | Quick add employee form modal | Admin / Manager | `POST /employees` | Registers employee profile | Modal closes, row added | Error text in modal |
| **Send Test Email** | `/admin/create-campaign`<br>`(CreateCampaign.jsx)` | Verify SMTP connection with test recipient | Admin / Manager | `POST /campaigns/{id}/send-test` | Sends email header | Success text alert | Red error alert |
| **Launch Campaign** | `/admin/create-campaign`<br>`(CreateCampaign.jsx)` | Launch simulation emails | Admin / Manager | `POST /campaigns/{id}/launch` | Dispatches emails, updates state | Redirect to campaigns list | Console warning banner |
| **Delete Campaign** | `/admin/campaigns`<br>`(Campaigns.jsx)` | Delete campaign | Admin / Manager | `DELETE /campaigns/{id}` | Drops row index | Row removed from database | Warn alert popover |
| **Save Template** | `/admin/template-builder`<br>`(TemplateBuilder.jsx)` | Save simulation HTML builder | Admin / Manager | `POST /email-templates` | Commits template layout | Redirect to library | Error alert text |
| **Add Employee (Dir)** | `/admin/employees`<br>`(Employees.jsx)` | Create new employee profile | Admin / Manager | `POST /employees` | Adds profile | List updates | Red message |
| **Create Department** | `/admin/departments`<br>`(Departments.jsx)` | Create department silo | Admin / Manager | `POST /departments` | Adds department card | Matrix updates | Warning message |
| **Send Reply** | `/admin/messages`<br>`(SupportMessages.jsx)` | Reply to employee support chat | Admin / Manager | `POST /messages/admin/reply` | Appends response text | Message balloon appears | Alert toast |
| **Mark as Resolved** | `/admin/reports`<br>`(ReportedEmails.jsx)` | Close reported email case | Admin / Manager | `PUT /reported-emails/{id}` | Changes status to Resolved | Badge changes to Green | Error dialog |
| **Retest AI Connection** | `/admin/ai-debug`<br>`(AIDebug.jsx)` | Test Hugging Face status | Admin / Manager | Hugging Face client test | Tests status | Connected Ready badge | Unavailable badge |
| **Start Course** | `/user/dashboard`<br>`(Home.jsx)` | Launch active training lesson | Employee | Client-side routing | Launches video module player | Renders player screen | N/A |
| **Submit Report** | `/user/report`<br>`(ReportEmail.jsx)` | Flag suspicious email to security team | Employee | `POST /reported-emails` | Flags email report details | Success notification, resets form | Red validation text |
| **Report Suspicious** | `/report/:track_id`<br>`(ReportLandingPage.jsx)` | Report simulated phishing click | Public (Anonymous) | `POST /report` | Flags simulation click | Success header text | Error warning message |

---

## 2. Color System Analysis

Phintra uses a curated, premium color system designed specifically to evoke trust, cybersecurity posture, and high professionalism. All styles are defined via CSS variables in [globals.css](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/styles/globals.css).

```css
:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-primary-light: rgba(59, 130, 246, 0.08);

  --color-teal: #0d9488;
  --color-teal-hover: #0f766e;
  --color-teal-light: rgba(13, 148, 136, 0.08);

  --color-success: #10b981;
  --color-success-hover: #059669;
  --color-success-light: rgba(16, 185, 129, 0.08);

  --color-warning: #f59e0b;
  --color-warning-light: rgba(245, 158, 11, 0.08);

  --color-danger: #ef4444;
  --color-danger-light: rgba(239, 68, 68, 0.08);

  --bg-main: #ffffff;
  --bg-card: #ffffff;
  --bg-sidebar: #f8fafc;
}
```

### Color Variables Breakdown

* **Primary Blue (`#3b82f6`):**
  - **Where Used:** Sidebar active navigation tabs, principal CTA buttons, primary text links, focus borders.
  - **Cybersecurity Feel:** Royal Blue is the industry standard for trust, technology stability, and authority. It reassures users of platform reliability.

* **Accent Teal (`#0d9488`):**
  - **Where Used:** Subtitles, specialized analytics callouts, security metrics dashboards.
  - **Cybersecurity Feel:** Teal evokes digital precision, automation, and threat defense intelligence.

* **Success Green (`#10b981`):**
  - **Where Used:** "Passed" badges, "Completed" courses, resolved alerts, success toast notification headers.
  - **Cybersecurity Feel:** Green provides immediate confirmation of safety, compliance, and correct reporting behavior.

* **Warning Amber (`#f59e0b`):**
  - **Where Used:** "Under Review" statuses, "Medium Risk" employees, draft simulation alerts.
  - **Cybersecurity Feel:** Warning amber draws alert attention without causing alarm, indicating audit gaps or items pending analysis.

* **Danger Red (`#ef4444`):**
  - **Where Used:** Click landing pages, "Failed" simulation tags, delete action indicators, high-risk user callouts.
  - **Cybersecurity Feel:** Red alerts users instantly to vulnerability, credential exposure risk, or severe gaps requiring intervention.

---

## 3. UI Design Reasoning

Phintra’s design decisions focus on visual containment, data density, and clear status communication.

* **Visual Cards (`.saas-card`):**
  - Used globally to isolate metrics, lists, forms, and logs. This provides structure and prevents cognitive overload when scanning extensive security reports.

* **Lucide Icon Sets:**
  - Icons act as immediate visual anchors (e.g., `ShieldAlert` for threats, `Users` for employees). This allows users to read and navigate dashboards with minimal reading delay.

* **Dashboard Metric Grids:**
  - Key indicators are placed at the top of workspaces. This ensures administrators immediately understand risk postures (e.g., overall risk score, active campaigns, reporting speed) without scrolling.

* **Data Tables:**
  - Used for employee lists, email logs, and threat reports. Tables support quick sorting, filtering, and status assessment.

* **Recharts Analytics:**
  - Visual charts (Line, Bar) demonstrate reporting progress over time and department vulnerability levels, making raw database logs actionable for decision-makers.

* **Grouped Sidebar Navigation:**
  - Separates logical duties (Overview, Campaigns, Users, Security, Administration) to minimize confusion between configuration tasks (templates) and monitoring tasks (audit logs).

* **Risk-Level Badges:**
  - Status badges use corresponding light background fills (`badge-high`, `badge-medium`, `badge-low`). This color coding highlights high-risk assets immediately.

---

## 4. Source Traceability

### Scanned Frontend Components
- Color system source: [globals.css](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/styles/globals.css)
- Button implementation elements: [Button.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/components/common/Button.jsx)
- Dashboard layout components: [Dashboard.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/admin/Dashboard.jsx)
- Campaign setup forms: [CreateCampaign.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/admin/CreateCampaign.jsx)
- Reported email management: [ReportedEmails.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/admin/ReportedEmails.jsx)
