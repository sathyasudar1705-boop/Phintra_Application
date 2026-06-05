import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProtectedRoute from './ProtectedRoute';

// Layout Wrappers
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import EmployeeLogin from '../pages/auth/EmployeeLogin';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Admin Portal Pages
import Dashboard from '../pages/admin/Dashboard';
import Campaigns from '../pages/admin/Campaigns';
import CreateCampaign from '../pages/admin/CreateCampaign';
import EmailTemplates from '../pages/admin/EmailTemplates';
import Employees from '../pages/admin/Employees';
import Departments from '../pages/admin/Departments';
import TrainingModules from '../pages/admin/TrainingModules';
import Quizzes from '../pages/admin/Quizzes';
import ReportedEmails from '../pages/admin/ReportedEmails';
import Analytics from '../pages/admin/Analytics';
import Leaderboard from '../pages/admin/Leaderboard';
import Settings from '../pages/admin/Settings';
import AIAnalytics from '../pages/admin/AIAnalytics';
import AIDebug from '../pages/admin/AIDebug';
import TemplateBuilder from '../pages/admin/TemplateBuilder';
import LandingPageBuilder from '../pages/admin/LandingPageBuilder';
import CampaignCalendar from '../pages/admin/CampaignCalendar';
import AuditLogs from '../pages/admin/AuditLogs';
import EmailLogs from '../pages/admin/EmailLogs';
import RolesPermissions from '../pages/admin/RolesPermissions';
import SecurityMaturity from '../pages/admin/SecurityMaturity';
import ExecutiveDashboard from '../pages/admin/ExecutiveDashboard';
import ThreatFeed from '../pages/admin/ThreatFeed';
import FloatingAIChatbot from '../components/common/FloatingAIChatbot';
import AwarenessBuilder from '../pages/admin/AwarenessBuilder';
import EmailSimulator from '../pages/admin/EmailSimulator';
import AISecurityCoach from '../pages/admin/AISecurityCoach';
import AwarenessInsights from '../pages/admin/AwarenessInsights';
import ManagerDashboard from '../pages/admin/ManagerDashboard';

// Employee / User Portal Pages
import Home from '../pages/user/Home';
import MyTraining from '../pages/user/MyTraining';
import Simulations from '../pages/user/Simulations';
import ReportEmail from '../pages/user/ReportEmail';
import MyProgress from '../pages/user/MyProgress';
import Certificates from '../pages/user/Certificates';
import HelpCenter from '../pages/user/HelpCenter';
import Profile from '../pages/user/Profile';
import LearningFeed from '../pages/user/LearningFeed';
import ScenarioTraining from '../pages/user/ScenarioTraining';
import RedFlagTraining from '../pages/user/RedFlagTraining';
import LoginAwareness from '../pages/user/LoginAwareness';
import LearningCenter from '../pages/user/LearningCenter';
import Challenges from '../pages/user/Challenges';
import SecurityJourney from '../pages/user/SecurityJourney';
import KnowledgeHub from '../pages/user/KnowledgeHub';

// Conditionally renders the AI chatbot only on admin routes
const AdminOnlyChatbot = () => {
  const location = useLocation();
  if (!location.pathname.startsWith('/admin')) return null;
  return <FloatingAIChatbot />;
};

const AdminRedirect = () => {
  const { userRole } = useAppContext();
  if (userRole === 'Security Manager') {
    return <Navigate to="/admin/manager-dashboard" replace />;
  }
  return <Navigate to="/admin/dashboard" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated, userRole } = useAppContext();

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Auth Routing */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* 2. Admin Portal Routing */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Security Administrator', 'Security Manager']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminRedirect />} />
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['Security Administrator']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="manager-dashboard" element={
            <ProtectedRoute allowedRoles={['Security Manager']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="create-campaign" element={<CreateCampaign />} />
          <Route path="templates" element={<EmailTemplates />} />
          <Route path="employees" element={<Employees />} />
          <Route path="departments" element={<Departments />} />
          <Route path="modules" element={<TrainingModules />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="reports" element={<ReportedEmails />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="settings" element={
            <ProtectedRoute allowedRoles={['Security Administrator']}>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="ai-analytics" element={<AIAnalytics />} />
          <Route path="ai-debug" element={<AIDebug />} />
          <Route path="template-builder" element={<TemplateBuilder />} />
          <Route path="landing-page-builder" element={<LandingPageBuilder />} />
          <Route path="campaign-calendar" element={<CampaignCalendar />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="email-logs" element={<EmailLogs />} />
          <Route path="roles-permissions" element={
            <ProtectedRoute allowedRoles={['Security Administrator']}>
              <RolesPermissions />
            </ProtectedRoute>
          } />
          <Route path="security-maturity" element={<SecurityMaturity />} />
          <Route path="executive-dashboard" element={<ExecutiveDashboard />} />
          <Route path="threat-feed" element={<ThreatFeed />} />
          <Route path="awareness-builder" element={<AwarenessBuilder />} />
          <Route path="email-simulator" element={<EmailSimulator />} />
          <Route path="ai-security-coach" element={<AISecurityCoach />} />
          <Route path="awareness-insights" element={<AwarenessInsights />} />
        </Route>

        {/* 3. Employee Portal Routing */}
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['Employee']}>
            <UserLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="training" element={<MyTraining />} />
          <Route path="simulations" element={<Simulations />} />
          <Route path="report" element={<ReportEmail />} />
          <Route path="progress" element={<MyProgress />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="profile" element={<Profile />} />
          <Route path="learning-feed" element={<LearningFeed />} />
          <Route path="scenario-training" element={<ScenarioTraining />} />
          <Route path="red-flag-training" element={<RedFlagTraining />} />
          <Route path="login-awareness" element={<LoginAwareness />} />
          <Route path="learning-center" element={<LearningCenter />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="security-journey" element={<SecurityJourney />} />
          <Route path="knowledge-hub" element={<KnowledgeHub />} />
        </Route>

        {/* 4. Root Catch Redirect */}
        <Route path="/" element={
          isAuthenticated ? (
            userRole === 'Security Administrator' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : userRole === 'Security Manager' ? (
              <Navigate to="/admin/manager-dashboard" replace />
            ) : (
              <Navigate to="/user/home" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <AdminOnlyChatbot />
    </BrowserRouter>
  );
};

export default AppRoutes;
