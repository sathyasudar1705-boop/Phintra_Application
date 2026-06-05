import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { 
  LayoutDashboard, Send, PlusCircle, Mail, Users, Building2, 
  BookOpen, Award, AlertTriangle, BarChart3, Trophy, Settings, 
  LogOut, ShieldCheck, X, Activity, Brain, FileText, Globe, 
  Calendar, History, Fingerprint, ShieldAlert, Sparkles
} from 'lucide-react';

const AdminSidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { currentUser, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const menuGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Executive Dashboard', path: '/admin/executive-dashboard', icon: Activity },
        { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
        { name: 'AI Analytics', path: '/admin/ai-analytics', icon: Brain },
        { name: 'Awareness Insights', path: '/admin/awareness-insights', icon: BarChart3 },
      ]
    },
    {
      label: 'CAMPAIGNS',
      items: [
        { name: 'Campaigns', path: '/admin/campaigns', icon: Send },
        { name: 'Create Campaign', path: '/admin/create-campaign', icon: PlusCircle },
        { name: 'Template Builder', path: '/admin/template-builder', icon: FileText },
        { name: 'Landing Builder', path: '/admin/landing-page-builder', icon: Globe },
        { name: 'Email Templates', path: '/admin/templates', icon: Mail },
        { name: 'Campaign Calendar', path: '/admin/campaign-calendar', icon: Calendar },
        { name: 'Awareness Builder', path: '/admin/awareness-builder', icon: Sparkles },
        { name: 'Email Simulator', path: '/admin/email-simulator', icon: Mail },
      ]
    },
    {
      label: 'USERS',
      items: [
        { name: 'Users / Employees', path: '/admin/employees', icon: Users },
        { name: 'Departments', path: '/admin/departments', icon: Building2 },
      ]
    },
    {
      label: 'SECURITY',
      items: [
        { name: 'Threat Feed', path: '/admin/threat-feed', icon: ShieldAlert },
        { name: 'Reported Emails', path: '/admin/reports', icon: AlertTriangle },
        { name: 'SMTP Email Logs', path: '/admin/email-logs', icon: Mail },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: History },
        { name: 'Security Maturity', path: '/admin/security-maturity', icon: ShieldCheck },
      ]
    },
    {
      label: 'ADMINISTRATION',
      items: [
        { name: 'Training Modules', path: '/admin/modules', icon: BookOpen },
        { name: 'Quizzes', path: '/admin/quizzes', icon: Award },
        { name: 'Roles & Permissions', path: '/admin/roles-permissions', icon: Fingerprint },
        { name: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy },
        { name: 'AI Security Coach', path: '/admin/ai-security-coach', icon: Brain },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ]
    }
  ];

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Confirm Log Out',
      description: 'Are you sure you want to log out of the admin console?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      logout();
      navigate('/login');
    }
  };

  const renderNavItems = (onItemClick) => {
    return menuGroups.map((group, gIdx) => (
      <div key={group.label} style={{ marginBottom: gIdx === menuGroups.length - 1 ? '0' : '12px' }}>
        <div style={{ 
          fontSize: '11px', 
          fontWeight: '700', 
          color: 'var(--text-subtle)', 
          paddingLeft: '14px', 
          marginBottom: '6px',
          letterSpacing: '0.05em'
        }}>
          {group.label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {group.items.map((item) => {
            const Icon = item.icon;
            // Support matching root /admin as Dashboard
            const isDashboard = item.path === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/');
            const isActive = location.pathname === item.path || isDashboard;
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={onItemClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
                className={isActive ? "" : "sidebar-nav-hover"}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-light)' }} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    ));
  };

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        padding: '24px 16px'
      }} className="desktop-sidebar-only">
        {/* Brand */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          paddingLeft: '8px'
        }}>
          <img 
            src="https://i.pinimg.com/1200x/5c/07/7c/5c077c6c718fb0216266ccf723d011d3.jpg" 
            alt="Phintra Logo" 
            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>Phintra</h1>
            <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: '600' }}>ADMIN CONSOLE</span>
          </div>
        </div>

        {/* Navigation Items (Grouped) */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          {renderNavItems()}
        </nav>

        {/* Footer Actions */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0
        }}>
          {/* User Profile Card */}
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginBottom: '4px'
          }}>
            <strong style={{ color: 'var(--text-main)', fontSize: '13px' }}>{currentUser.name}</strong>
            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Role: {currentUser.role}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Dept: {currentUser.department}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--color-danger)',
              width: '100%',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent'
            }}
            className="sidebar-nav-logout-hover"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* 2. Responsive Mobile Drawer SideBar */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: 'flex'
        }}>
          <div style={{
            width: '270px',
            backgroundColor: 'var(--bg-sidebar)',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingLeft: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img 
                  src="https://i.pinimg.com/1200x/5c/07/7c/5c077c6c718fb0216266ccf723d011d3.jpg" 
                  alt="Phintra Logo" 
                  style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }}
                />
                <h1 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Phintra</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-light)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
              {renderNavItems(() => setMobileMenuOpen(false))}
            </nav>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                marginBottom: '4px'
              }}>
                <strong style={{ color: 'var(--text-main)', fontSize: '13px' }}>{currentUser.name}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Role: {currentUser.role}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Dept: {currentUser.department}</span>
              </div>
              <button 
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--color-danger)',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={18} />
                Log Out
              </button>
            </div>
          </div>
          <div style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

    </>
  );
};

export default AdminSidebar;
