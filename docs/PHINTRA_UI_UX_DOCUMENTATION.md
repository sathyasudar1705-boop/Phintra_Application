# Phintra Platform — Page-by-Page UI/UX Breakdown

Welcome to the comprehensive UI/UX breakdown for the **Phintra Phishing Awareness and Training Platform**. This document serves as the single source of truth for all frontend routes, pages, and components in the application.

---

## 1. Authentication & Public Routing

These pages handle platform access, tenant identification, and educational landing experiences for simulated clicks.

### 1.1 Administrator/Manager Login
* **Route Path:** `/admin/login`
* **Source File:** `phishguard-ai/src/pages/auth/Login.jsx`
* **Access Control:** Public (Anonymous)
* **Purpose:** Allows Security Administrators and Security Managers to authenticate.
* **UI Layout & Sections:**
  - Dark-cybersecurity split screen with high-impact visual credentials panel.
  - Left panel: Interactive showcase of Phintra threat intelligence engine.
  - Right panel: Clean email and password input fields.
* **APIs Called:**
  - `POST /auth/login` (via `AuthContext.jsx` -> `login()`)
* **Interactive Elements & Buttons:**
  - **Sign In Button:** Validates input, requests access token, redirects to `/admin/dashboard` or `/admin/manager-dashboard`.
  - **Register Link:** Redirects to `/register`.
  - **Forgot Password Link:** Redirects to `/forgot-password`.
  - **Employee Login Link:** Redirects to `/user/login`.
* **Expected States:**
  - **Loading:** Disables submit buttons, shows progress spinner.
  - **Success:** Stores `adminToken`, redirects to appropriate dashboard.
  - **Error:** Highlights field borders, renders an error message banner.

### 1.2 Employee Login
* **Route Path:** `/user/login`
* **Source File:** `phishguard-ai/src/pages/auth/EmployeeLogin.jsx`
* **Access Control:** Public (Anonymous)
* **Purpose:** Allows employees to access their training and progress dashboard.
* **UI Layout & Sections:**
  - Sleek, modern employee portal sign-in card.
  - Organization key/email validation interface.
* **APIs Called:**
  - `POST /auth/employee-login`
* **Interactive Elements & Buttons:**
  - **Access Portal Button:** Validates email and password, redirects to `/user/dashboard`.
  - **Admin Login Link:** Redirects to `/admin/login`.
* **Expected States:**
  - **Loading / Success / Error:** Standard input validation states.

### 1.3 Platform Registration
* **Route Path:** `/register`
* **Source File:** `phishguard-ai/src/pages/auth/Register.jsx`
* **Access Control:** Public (Anonymous)
* **Purpose:** Registers new administrative tenants (organizations) on the platform.
* **UI Layout & Sections:**
  - Multiphase signup form: name, corporate email, company name, company size, industry, and password credentials.
* **APIs Called:**
  - `POST /auth/register`
* **Interactive Elements & Buttons:**
  - **Create Account Button:** Submits organizational metadata and password hash to database.
  - **Back to Login Link:** Navigates back to `/admin/login`.
* **Expected States:**
  - **Success:** Triggers toast message, redirects user to login.

### 1.4 Forgot Password
* **Route Path:** `/forgot-password`
* **Source File:** `phishguard-ai/src/pages/auth/ForgotPassword.jsx`
* **Access Control:** Public (Anonymous)
* **Purpose:** Requests secure password reset links.
* **UI Layout & Sections:**
  - Single-field email card to receive reset vectors.
* **APIs Called:**
  - *Pending / Not Implemented:* Backend API `/auth/forgot-password` is not implemented in backend routers; frontend utilizes a mock timer state for verification.
* **Interactive Elements & Buttons:**
  - **Send Reset Link Button:** Triggers email mock dispatch flow.

### 1.5 Simulated Phish Click Landing Page
* **Route Path:** `/report/:track_id`
* **Source File:** `phishguard-ai/src/pages/user/ReportLandingPage.jsx`
* **Access Control:** Public (Simulated Click Action)
* **Purpose:** Serves as the redirect destination when an employee clicks a link in a simulated phishing email. It alerts them that they participated in a test and delivers immediate micro-learning.
* **UI Layout & Sections:**
  - Red-coded warning card highlighting danger signs.
  - "Teachable Moment" breakdown listing red flags in the simulated email.
  - Direct employee assessment interactive panel.
* **APIs Called:**
  - `GET /campaigns/track/{track_id}` (Fetches tracking ID information)
  - `POST /report` (Saves simulated click reaction action)
* **Interactive Elements & Buttons:**
  - **Report Suspicious Button:** Logs response as reported threat, updates employee scoring XP.
  - **Mark Safe Button:** Records safe selection flag.

---

## 2. Administrator & Manager Portal Pages

These pages are accessible by users with `Security Administrator` or `Security Manager` roles. Managers are restricted to view-only dashboards or their specific company silos where configured.

### 2.1 Security Admin Dashboard
* **Route Path:** `/admin/dashboard`
* **Source File:** `phishguard-ai/src/pages/admin/Dashboard.jsx`
* **Access Control:** `Security Administrator`
* **Purpose:** Serves as the primary operational hub, displaying tenant analytics, system maturity, active campaigns, and a new-tenant wizard setup.
* **UI Layout & Sections:**
  - Metric summary cards (Total Employees, Active Campaigns, Org Risk Score, Training Rate).
  - Setup Wizard (multiphase guide: Create Department -> Add Employees -> Select Template -> Launch baseline drill).
  - Risk Trends Chart (Line Chart of average score changes).
  - Department risk analysis table.
* **APIs Called:**
  - `GET /analytics/dashboard`
  - `GET /analytics/departments`
  - `GET /employees`
  - `GET /campaigns`
  - `GET /reported-emails`
  - `GET /departments`
  - `GET /email-templates`
* **Interactive Elements & Buttons:**
  - **Add Employee Button:** Opens modal to register individual employees.
  - **Create Campaign Button:** Opens wizard steps.
  - **Refresh Button:** Syncs dashboard states dynamically.

### 2.2 Manager Dashboard
* **Route Path:** `/admin/manager-dashboard`
* **Source File:** `phishguard-ai/src/pages/admin/ManagerDashboard.jsx`
* **Access Control:** `Security Manager`
* **Purpose:** Executive status view scoped for managers who do not require write permissions for templates or campaigns.
* **UI Layout & Sections:**
  - Company-wide metrics cards.
  - Overview department listing.
  - Historical risk rating logs.
* **APIs Called:**
  - `GET /analytics/dashboard`
  - `GET /analytics/departments`
* **Interactive Elements & Buttons:**
  - **Export Report Button:** Generates a PDF file download mock.

### 2.3 Executive Dashboard
* **Route Path:** `/admin/executive-dashboard`
* **Source File:** `phishguard-ai/src/pages/admin/ExecutiveDashboard.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** High-level summary of corporate security postures for stakeholders.
* **UI Layout & Sections:**
  - Risk grading banner (Grade A-F).
  - Compliance stats and benchmarking details.
* **APIs Called:**
  - `GET /analytics/dashboard`
* **Interactive Elements & Buttons:**
  - **Export Executive PDF Button:** Mock summary extraction.

### 2.4 Campaigns Management
* **Route Path:** `/admin/campaigns`
* **Source File:** `phishguard-ai/src/pages/admin/Campaigns.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Displays active, draft, and completed phishing campaigns.
* **UI Layout & Sections:**
  - Filtering tabs (All, Active, Scheduled, Draft, Completed).
  - Detailed lists of campaigns showing template used, launch dates, click rates, and reporting rates.
* **APIs Called:**
  - `GET /campaigns`
  - `DELETE /campaigns/{id}`
  - `POST /campaigns/{id}/archive`
  - `POST /campaigns/{id}/remind`
* **Interactive Elements & Buttons:**
  - **New Campaign Button:** Navigates to `/admin/create-campaign`.
  - **Archive / Delete Campaign Buttons:** Updates status or drops record.
  - **Send Reminders Button:** Email templates mock notifications to non-complying targets.

### 2.5 Create Campaign
* **Route Path:** `/admin/create-campaign`
* **Source File:** `phishguard-ai/src/pages/admin/CreateCampaign.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Five-step wizard to setup, validate, test, and launch phishing campaigns.
* **UI Layout & Sections:**
  - Step 1: Details (Name, description, sender profiles selection).
  - Step 2: Templates (Choose suspicious templates).
  - Step 3: Target Recipients (Add departments or specific employees).
  - Step 4: Schedule (Launch instantly or set timezone-scoped delay).
  - Step 5: Test & Launch (Enter test email, execute validation SMTP debug, and launch).
* **APIs Called:**
  - `POST /campaigns`
  - `POST /campaigns/{id}/send-test`
  - `POST /campaigns/{id}/launch`
  - `DELETE /campaigns/{id}`
* **Interactive Elements & Buttons:**
  - **Next Step / Back Buttons:** Navigates wizard frames.
  - **Send Test Email Button:** Triggers test email via SMTP server.
  - **Launch Campaign Button:** Deploys simulated campaign nodes.

### 2.6 Email Templates Library
* **Route Path:** `/admin/templates`
* **Source File:** `phishguard-ai/src/pages/admin/EmailTemplates.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Manages pre-written phishing simulation email blueprints.
* **UI Layout & Sections:**
  - Grid of available templates categorized by tactic (BEC, Credential Theft, Attachment, Link).
* **APIs Called:**
  - `GET /email-templates`
  - `DELETE /email-templates/{id}`
* **Interactive Elements & Buttons:**
  - **Create Template Button:** Navigates to `/admin/template-builder`.
  - **Delete Button:** Removes custom template layout.

### 2.7 Template Builder
* **Route Path:** `/admin/template-builder`
* **Source File:** `phishguard-ai/src/pages/admin/TemplateBuilder.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** WYSIWYG HTML designer to create custom phishing simulation lures.
* **UI Layout & Sections:**
  - Code edit editor with metadata sidebar (Subject, Sender Name, Domain, Difficulty level).
  - Live iframe rendering panel.
* **APIs Called:**
  - `POST /email-templates`
  - `PUT /email-templates/{id}`
* **Interactive Elements & Buttons:**
  - **Save Template Button:** Commits HTML script and meta attributes.
  - **Insert Tracking Link:** Places secure tracking token tag.

### 2.8 Landing Page Builder
* **Route Path:** `/admin/landing-page-builder`
* **Source File:** `phishguard-ai/src/pages/admin/LandingPageBuilder.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Creates educational awareness pages linked to phishing simulation redirects.
* **UI Layout & Sections:**
  - Form editor specifying logo upload, custom alert warning message, text guidelines, and redirect target parameters.
* **APIs Called:**
  - `POST /awareness-pages`
  - `GET /awareness-pages`
* **Interactive Elements & Buttons:**
  - **Save Page Button:** Saves customized warning layout.

### 2.9 Campaign Calendar
* **Route Path:** `/admin/campaign-calendar`
* **Source File:** `phishguard-ai/src/pages/admin/CampaignCalendar.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Calendar grid visualizing scheduled simulations.
* **UI Layout & Sections:**
  - Month/Week visual calendar feed mapping dates to scheduled campaigns.
* **APIs Called:**
  - `GET /campaigns`
* **Interactive Elements & Buttons:**
  - **Add Event Button:** Syncs local scheduling objects.

### 2.10 Employees Directory
* **Route Path:** `/admin/employees`
* **Source File:** `phishguard-ai/src/pages/admin/Employees.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Manages employees, risk ratings, and credential details.
* **UI Layout & Sections:**
  - Database lists, search query bar, department/risk filter tags.
  - Add Employee Modal / Edit Employee Modal.
* **APIs Called:**
  - `GET /employees`
  - `POST /employees`
  - `PUT /employees/{id}`
  - `DELETE /employees/{id}`
  - `GET /departments`
  - `GET /companies`
* **Interactive Elements & Buttons:**
  - **Add Employee Button:** Opens registering form modal.
  - **Edit Icon / Delete Icon:** Modifies or deletes row indices.

### 2.11 Departments Directory
* **Route Path:** `/admin/departments`
* **Source File:** `phishguard-ai/src/pages/admin/Departments.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Compares department risk scores and compliance ratings.
* **UI Layout & Sections:**
  - Directory grid detailing managers, employee count, training rates, and risk indices.
* **APIs Called:**
  - `GET /departments`
  - `POST /departments`
  - `PUT /departments/{id}`
  - `DELETE /departments/{id}`
* **Interactive Elements & Buttons:**
  - **Create Department Button:** Launches setup form.

### 2.12 Support Messages Threads
* **Route Path:** `/admin/messages`
* **Source File:** `phishguard-ai/src/pages/admin/SupportMessages.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Resolves reporting feedback and direct chat support with employees.
* **UI Layout & Sections:**
  - Two-pane layout: left list shows employees with active threads, right pane renders message histories and text boxes.
* **APIs Called:**
  - `GET /messages/admin/threads`
  - `POST /messages/admin/reply`
* **Interactive Elements & Buttons:**
  - **Send Reply Button:** Transmits response text.

### 2.13 Reported Emails Feed
* **Route Path:** `/admin/reports`
* **Source File:** `phishguard-ai/src/pages/admin/ReportedEmails.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Ingests reported phishing messages from direct uploads and the Gmail Add-on, displaying threat indices.
* **UI Layout & Sections:**
  - Table showing reporter email, subject, source (Add-on/Direct), risk score, status (Pending, Under Review, Resolved).
  - Risk details side drawer showing email HTML/plain content, headers, and local AI explanation.
* **APIs Called:**
  - `GET /reported-emails`
  - `PUT /reported-emails/{id}` (To change status)
  - `DELETE /reported-emails/{id}`
* **Interactive Elements & Buttons:**
  - **Mark as Under Review / Resolved Buttons:** Updates database flags.
  - **Inspect Email Icon:** Opens analysis overlay details.

### 2.14 Threat Feed
* **Route Path:** `/admin/threat-feed`
* **Source File:** `phishguard-ai/src/pages/admin/ThreatFeed.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Aggregates zero-day phishing attack signatures.
* **UI Layout & Sections:**
  - RSS-style card listing active phishing campaign trends globally.
* **APIs Called:**
  - *Pending / Not Implemented:* Backend `/emails/stats` or threat API not actively bound; frontend aggregates predefined threat intelligence lists.
* **Interactive Elements & Buttons:**
  - **Report Alert Button:** Broadcasts threat summaries.

### 2.15 SMTP Email Logs
* **Route Path:** `/admin/email-logs`
* **Source File:** `phishguard-ai/src/pages/admin/EmailLogs.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Audits the execution of campaign mail transactions.
* **UI Layout & Sections:**
  - Audit log table displaying sender name, recipient address, delivery status, timestamps, and bounce codes.
* **APIs Called:**
  - `GET /emails/logs`
* **Interactive Elements & Buttons:**
  - **Filter Logs:** Filters results by email address or status.

### 2.16 Audit Logs
* **Route Path:** `/admin/audit-logs`
* **Source File:** `phishguard-ai/src/pages/admin/AuditLogs.jsx`
* **Access Control:** `Security Administrator` (Restricted)
* **Purpose:** Records administrative actions on campaigns, users, templates, and settings.
* **UI Layout & Sections:**
  - Chronological timeline table displaying user, IP, action category, timestamp, and details.
* **APIs Called:**
  - `GET /audit-logs`
* **Interactive Elements & Buttons:**
  - **Search Bar:** Filters audit indices.

### 2.17 Security Maturity Index
* **Route Path:** `/admin/security-maturity`
* **Source File:** `phishguard-ai/src/pages/admin/SecurityMaturity.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Measures organizational cybersecurity maturity.
* **UI Layout & Sections:**
  - Evaluation radar metric mapping threat awareness, training metrics, reporting speeds, and technical profiles.
* **APIs Called:**
  - `GET /analytics/dashboard`
* **Interactive Elements & Buttons:**
  - **Run Self-Assessment Button:** Generates survey mocks.

### 2.18 Training Modules Manager
* **Route Path:** `/admin/modules`
* **Source File:** `phishguard-ai/src/pages/admin/TrainingModules.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Manages corporate training courses.
* **UI Layout & Sections:**
  - Catalog cards representing courses, video link status, quiz dependencies, and active assignments.
* **APIs Called:**
  - `GET /training/modules`
  - `POST /training/modules`
  - `DELETE /training/modules/{id}`
* **Interactive Elements & Buttons:**
  - **Upload Module Button:** Creates new micro-learning course module.

### 2.19 Quizzes Manager
* **Route Path:** `/admin/quizzes`
* **Source File:** `phishguard-ai/src/pages/admin/Quizzes.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Creates and edits multiple-choice questions for training validation.
* **UI Layout & Sections:**
  - Table of active tests, questions index, pass rates, and action links.
* **APIs Called:**
  - `GET /quizzes`
  - `POST /quizzes`
  - `DELETE /quizzes/{id}`
* **Interactive Elements & Buttons:**
  - **New Quiz Button:** Form modal to create assessment criteria.

### 2.20 Roles & Permissions Settings
* **Route Path:** `/admin/roles-permissions`
* **Source File:** `phishguard-ai/src/pages/admin/RolesPermissions.jsx`
* **Access Control:** `Security Administrator` (Restricted)
* **Purpose:** Defines functional actions for custom administrative roles.
* **UI Layout & Sections:**
  - Permission matrix toggles (Access Dashboards, Manage Employees, Create Campaigns, Modify Settings).
* **APIs Called:**
  - Utilizes `AppContext.jsx` state management mapped to LocalStorage updates.
* **Interactive Elements & Buttons:**
  - **Save Permissions Button:** Saves current checklist toggles.

### 2.21 Leaderboard View
* **Route Path:** `/admin/leaderboard`
* **Source File:** `phishguard-ai/src/pages/admin/Leaderboard.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Analyzes department score rankings and reward distributions.
* **UI Layout & Sections:**
  - High-performing users, total points earned, and streak awards.
* **APIs Called:**
  - `GET /leaderboard`
* **Interactive Elements & Buttons:**
  - **Excel Export Button:** Triggers download mock.

### 2.22 AI Analytics Center
* **Route Path:** `/admin/ai-analytics`
* **Source File:** `phishguard-ai/src/pages/admin/AIAnalytics.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Renders predictive vulnerability data using simulated ML algorithms.
* **UI Layout & Sections:**
  - Predicted employee click rates, department vulnerabilities, high-risk user callouts, and recommendations list.
* **APIs Called:**
  - `GET /analytics/ai-insights`
* **Interactive Elements & Buttons:**
  - **Export AI Report Button:** Triggers mock report extraction.

### 2.23 AI Security Coach
* **Route Path:** `/admin/ai-security-coach`
* **Source File:** `phishguard-ai/src/pages/admin/AISecurityCoach.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Provides interactive assistant support to managers draft campaigns and review compliance.
* **UI Layout & Sections:**
  - Chat bubbles interface with suggested questions.
* **APIs Called:**
  - *Pending / Partial Integration:* Uses simulated client-side keywords, maps to `POST /admin/ai-assistant` when API is available.
* **Interactive Elements & Buttons:**
  - **Send Message Button:** Dispatches queries.

### 2.24 Awareness Insights
* **Route Path:** `/admin/awareness-insights`
* **Source File:** `phishguard-ai/src/pages/admin/AwarenessInsights.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Analyzes employee behavior patterns from simulation events.
* **UI Layout & Sections:**
  - Analytics visual charts showing report timings and reporting speeds.
* **APIs Called:**
  - `GET /analytics/insights`
* **Interactive Elements & Buttons:**
  - **Time-range Filter:** Adjusts charts scope.

### 2.25 Awareness Builder
* **Route Path:** `/admin/awareness-builder`
* **Source File:** `phishguard-ai/src/pages/admin/AwarenessBuilder.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Designs training reminders and banners.
* **UI Layout & Sections:**
  - Banner customize properties forms and template blueprints.
* **APIs Called:**
  - LocalStorage context mappings.
* **Interactive Elements & Buttons:**
  - **Publish Banner Button:** Commits reminder layout.

### 2.26 Email Simulator Sandbox
* **Route Path:** `/admin/email-simulator`
* **Source File:** `phishguard-ai/src/pages/admin/EmailSimulator.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Interactive sandbox to test email delivery.
* **UI Layout & Sections:**
  - Subject and content form parameters to simulate incoming alerts.
* **APIs Called:**
  - LocalStorage sandbox simulation.
* **Interactive Elements & Buttons:**
  - **Trigger Test Inbox Alert Button:** Pushes simulated alert.

### 2.27 AI Service Diagnostics
* **Route Path:** `/admin/ai-debug`
* **Source File:** `phishguard-ai/src/pages/admin/AIDebug.jsx`
* **Access Control:** `Security Administrator` or `Security Manager`
* **Purpose:** Real-time monitor of Hugging Face Inference API integrations and LLM connection properties.
* **UI Layout & Sections:**
  - Status indicator grids (Connected/Unavailable), response timers, API body preview panel.
* **APIs Called:**
  - Uses `testAIConnection` service interface.
* **Interactive Elements & Buttons:**
  - **Retest AI Connection Button:** Invokes Hugging Face endpoint connection test.

### 2.28 Platform Settings
* **Route Path:** `/admin/settings`
* **Source File:** `phishguard-ai/src/pages/admin/Settings.jsx`
* **Access Control:** `Security Administrator` (Restricted)
* **Purpose:** Updates corporate tenant configuration, API integrations, and passwordless authentication keys.
* **UI Layout & Sections:**
  - Organization profiles, SMTP server details, and API keys.
* **APIs Called:**
  - `GET /companies` (Fetches details)
  - `PUT /companies/{id}` (Updates details)
* **Interactive Elements & Buttons:**
  - **Save Configurations Button:** Saves administrative changes.

---

## 3. Employee Portal Pages

These pages are accessible by users authenticated with the `Employee` role.

### 3.1 Employee Home (Dashboard)
* **Route Path:** `/user/dashboard`
* **Source File:** `phishguard-ai/src/pages/user/Home.jsx`
* **Access Control:** `Employee`
* **Purpose:** The main hub showing personal security score, training tasks, reporting history, and badges.
* **UI Layout & Sections:**
  - Personal stats cards (XP score, Security Rating percentage, Active Streak days, Leaderboard Rank).
  - Mandatory Training tasks status list.
  - Quick action buttons (Report Phish, Open Learning Feed).
* **APIs Called:**
  - `GET /auth/employee/dashboard`
* **Interactive Elements & Buttons:**
  - **Report Suspicious Email Link:** Redirects to `/user/report`.
  - **Start Course Button:** Launches active micro-module.

### 3.2 Learning Feed
* **Route Path:** `/user/learning-feed`
* **Source File:** `phishguard-ai/src/pages/user/LearningFeed.jsx`
* **Access Control:** `Employee`
* **Purpose:** Ingests safety newsletters and blog items.
* **UI Layout & Sections:**
  - Cards summarizing threat alerts, reporting advice, and news items.
* **Interactive Elements & Buttons:**
  - **Read Article Button:** Opens full detail view modal.

### 3.3 Scenario Training
* **Route Path:** `/user/scenario-training`
* **Source File:** `phishguard-ai/src/pages/user/ScenarioTraining.jsx`
* **Access Control:** `Employee`
* **Purpose:** Delivers interactive text scenarios where employees choose how to respond to potential social engineering vectors.
* **UI Layout & Sections:**
  - Active chat simulation interface asking response options.
* **Interactive Elements & Buttons:**
  - **Select Option Buttons:** Moves narrative progress, scores XP.

### 3.4 My Training Modules
* **Route Path:** `/user/training`
* **Source File:** `phishguard-ai/src/pages/user/MyTraining.jsx`
* **Access Control:** `Employee`
* **Purpose:** Displays assigned training courses.
* **UI Layout & Sections:**
  - Course grid showing category tags, length, progress bar, and completion badges.
* **APIs Called:**
  - `GET /auth/employee/dashboard` (Returns completions)
* **Interactive Elements & Buttons:**
  - **Resume Lesson Button:** Launches course player.

### 3.5 Simulation Inbox
* **Route Path:** `/user/simulations`
* **Source File:** `phishguard-ai/src/pages/user/Simulations.jsx`
* **Access Control:** `Employee`
* **Purpose:** Lists recent simulated emails sent to the employee and how they responded.
* **UI Layout & Sections:**
  - Table of simulation history (Sender, Subject, Action Taken, XP Reward).
* **APIs Called:**
  - `GET /campaigns/employee/campaign-feed`
* **Interactive Elements & Buttons:**
  - **Action Details Icon:** Inspects the email and reveals clues.

### 3.6 Threat Reporting Center
* **Route Path:** `/user/report`
* **Source File:** `phishguard-ai/src/pages/user/ReportEmail.jsx`
* **Access Control:** `Employee`
* **Purpose:** Direct platform reporting form to flag suspect emails.
* **UI Layout & Sections:**
  - Form: Sender, Subject, reason dropdown, body context, file upload.
  - History pane: list of reported emails and status tags.
* **APIs Called:**
  - `POST /reported-emails`
  - `GET /reported-emails` (Filtered list)
* **Interactive Elements & Buttons:**
  - **Submit Report Button:** Logs reported email, recalculates threat score.

### 3.7 Red Flag Spotter
* **Route Path:** `/user/red-flag-training`
* **Source File:** `phishguard-ai/src/pages/user/RedFlagTraining.jsx`
* **Access Control:** `Employee`
* **Purpose:** Interactive training game where employees click red flags directly on a suspect email.
* **UI Layout & Sections:**
  - Rendered mock email with clickable indicator zones.
* **Interactive Elements & Buttons:**
  - **Clickable zones:** Triggers popover alerts, updates points score.

### 3.8 Login Intercept Awareness
* **Route Path:** `/user/login-awareness`
* **Source File:** `phishguard-ai/src/pages/user/LoginAwareness.jsx`
* **Access Control:** `Employee`
* **Purpose:** Intercepts simulated logins to demonstrate double-factor credential dangers.
* **UI Layout & Sections:**
  - Mock third-party login interface.

### 3.9 Learning Center
* **Route Path:** `/user/learning-center`
* **Source File:** `phishguard-ai/src/pages/user/LearningCenter.jsx`
* **Access Control:** `Employee`
* **Purpose:** Direct library of training video resources and policies.

### 3.10 Weekly Challenges
* **Route Path:** `/user/challenges`
* **Source File:** `phishguard-ai/src/pages/user/Challenges.jsx`
* **Access Control:** `Employee`
* **Purpose:** Gamified targets to encourage consistent reporting and module milestones.

### 3.11 Security Journey Maps
* **Route Path:** `/user/security-journey`
* **Source File:** `phishguard-ai/src/pages/user/SecurityJourney.jsx`
* **Access Control:** `Employee`
* **Purpose:** Progress roadmaps mapping milestones to security rankings.

### 3.12 Knowledge Hub FAQ
* **Route Path:** `/user/knowledge-hub`
* **Source File:** `phishguard-ai/src/pages/user/KnowledgeHub.jsx`
* **Access Control:** `Employee`
* **Purpose:** Resolves questions on corporate policies.

### 3.13 Progress Trend Dashboard
* **Route Path:** `/user/progress`
* **Source File:** `phishguard-ai/src/pages/user/MyProgress.jsx`
* **Access Control:** `Employee`
* **Purpose:** Visualized charts of personal security scores over time.

### 3.14 Organization Leaderboard
* **Route Path:** `/user/leaderboard`
* **Source File:** `phishguard-ai/src/pages/user/Leaderboard.jsx`
* **Access Control:** `Employee`
* **Purpose:** Renders employee rankings inside the tenant organization.
* **APIs Called:**
  - `GET /leaderboard`

### 3.15 Certificates Inventory
* **Route Path:** `/user/certificates`
* **Source File:** `phishguard-ai/src/pages/user/Certificates.jsx`
* **Access Control:** `Employee`
* **Purpose:** Inventories earned course certificates.
* **APIs Called:**
  - `GET /auth/employee/dashboard`

### 3.16 Help Center Support
* **Route Path:** `/user/help`
* **Source File:** `phishguard-ai/src/pages/user/HelpCenter.jsx`
* **Access Control:** `Employee`
* **Purpose:** Sends support inquiries and feedback to admin dashboards.
* **APIs Called:**
  - `GET /messages/thread`
  - `POST /messages/send`

### 3.17 Employee Profile
* **Route Path:** `/user/profile`
* **Source File:** `phishguard-ai/src/pages/user/Profile.jsx`
* **Access Control:** `Employee`
* **Purpose:** Updates personal description bio.
* **APIs Called:**
  - `GET /auth/me/profile`
  - `PUT /auth/me/profile`

---

## 4. Source Traceability

### Frontend Scanned Files
- Route configurations: [AppRoutes.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/routes/AppRoutes.jsx)
- Authentication pages: [Login.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/auth/Login.jsx), [EmployeeLogin.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/auth/EmployeeLogin.jsx), [Register.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/auth/Register.jsx)
- Admin pages: [Dashboard.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/admin/Dashboard.jsx), [Employees.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/admin/Employees.jsx), [Campaigns.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/admin/Campaigns.jsx), [CreateCampaign.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/admin/CreateCampaign.jsx), [AIAnalytics.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/admin/AIAnalytics.jsx), [AIDebug.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/admin/AIDebug.jsx)
- User pages: [Home.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/user/Home.jsx), [ReportEmail.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/user/ReportEmail.jsx), [ReportLandingPage.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/pages/user/ReportLandingPage.jsx)
- Context Providers: [AppContext.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/context/AppContext.jsx), [AuthContext.jsx](file:///c:/Sathyasudar/demo-react-project/phishguard-ai/src/context/AuthContext.jsx)
