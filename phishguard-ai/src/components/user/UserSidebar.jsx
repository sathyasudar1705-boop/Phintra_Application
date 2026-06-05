import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { 
  Home, BookOpen, ShieldAlert, AlertTriangle, TrendingUp, 
  Award, HelpCircle, User, LogOut, X, Target, Key, Compass,
  Newspaper, BrainCircuit
} from 'lucide-react';

const UserSidebar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { currentUser, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const menuItems = [
    { name: 'Home', path: '/user/home', icon: Home },
    { name: 'Learning Feed', path: '/user/learning-feed', icon: Newspaper },
    { name: 'Scenario Training', path: '/user/scenario-training', icon: BrainCircuit },
    { name: 'My Training', path: '/user/training', icon: BookOpen },
    { name: 'Simulations', path: '/user/simulations', icon: ShieldAlert },
    { name: 'Report Email', path: '/user/report', icon: AlertTriangle },
    { name: 'Red Flag Spotter', path: '/user/red-flag-training', icon: Target },
    { name: 'Login Intercept', path: '/user/login-awareness', icon: Key },
    { name: 'Learning Center', path: '/user/learning-center', icon: BookOpen },
    { name: 'Weekly Challenges', path: '/user/challenges', icon: Award },
    { name: 'Security Journey', path: '/user/security-journey', icon: Compass },
    { name: 'Knowledge Hub', path: '/user/knowledge-hub', icon: HelpCircle },
    { name: 'My Progress', path: '/user/progress', icon: TrendingUp },
    { name: 'Certificates', path: '/user/certificates', icon: Award },
    { name: 'Help Center', path: '/user/help', icon: HelpCircle },
    { name: 'Profile', path: '/user/profile', icon: User },
  ];

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Confirm Log Out',
      description: 'Are you sure you want to log out of the employee portal?',
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
    return menuItems.map((item) => {
      const Icon = item.icon;
      // Support matching /user as Home path
      const isHome = item.path === '/user/home' && (location.pathname === '/user' || location.pathname === '/user/');
      const isActive = location.pathname === item.path || isHome;
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
          className={isActive ? "" : "sidebar-nav-user-hover"}
        >
          <Icon size={18} style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-light)' }} />
          {item.name}
        </Link>
      );
    });
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
          marginBottom: '32px',
          paddingLeft: '8px'
        }}>
          <img 
            src="https://i.pinimg.com/1200x/5c/07/7c/5c077c6c718fb0216266ccf723d011d3.jpg" 
            alt="Phintra Logo" 
            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>Phintra</h1>
            <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: '600' }}>EMPLOYEE PORTAL</span>
          </div>
        </div>

        {/* Navigation Items */}
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
          {/* Quick Security Score Gauge in Sidebar */}
          <div style={{
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '4px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-light)', fontWeight: '600' }}>Security Score</span>
              <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '700' }}>{currentUser.securityScore}/100</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${currentUser.securityScore}%`, 
                height: '100%', 
                backgroundColor: currentUser.securityScore >= 80 ? 'var(--color-success)' : currentUser.securityScore >= 60 ? 'var(--color-warning)' : 'var(--color-danger)' 
              }} />
            </div>
          </div>

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
                  border: 'none',
                  background: 'transparent',
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

export default UserSidebar;
