import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Menu, Search, Bell } from 'lucide-react';

const UserTopbar = ({ onMenuClick, onSearchClick, onNotificationsClick }) => {
  const { currentUser, notifications } = useAppContext();
  const location = useLocation();
  const unreadCount = notifications ? notifications.filter(n => !n.is_read).length : 0;

  const menuItems = [
    { name: 'Home', path: '/user/home' },
    { name: 'Learning Feed', path: '/user/learning-feed' },
    { name: 'Scenario Training', path: '/user/scenario-training' },
    { name: 'My Training', path: '/user/training' },
    { name: 'Simulations', path: '/user/simulations' },
    { name: 'Report Email', path: '/user/report' },
    { name: 'Red Flag Spotter', path: '/user/red-flag-training' },
    { name: 'Login Intercept', path: '/user/login-awareness' },
    { name: 'Learning Center', path: '/user/learning-center' },
    { name: 'Weekly Challenges', path: '/user/challenges' },
    { name: 'Security Journey', path: '/user/security-journey' },
    { name: 'Knowledge Hub', path: '/user/knowledge-hub' },
    { name: 'My Progress', path: '/user/progress' },
    { name: 'Certificates', path: '/user/certificates' },
    { name: 'Help Center', path: '/user/help' },
    { name: 'Profile', path: '/user/profile' },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/user' || location.pathname === '/user/') {
      return 'Home';
    }
    const activeItem = menuItems.find(item => item.path === location.pathname);
    return activeItem ? activeItem.name : 'Employee Security Portal';
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }} className="app-header-nav">
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        {/* Burger menu for mobile */}
        <button 
          onClick={onMenuClick}
          style={{ color: 'var(--text-muted)', display: 'none', background: 'transparent', border: 'none', cursor: 'pointer' }}
          className="mobile-burger-only"
        >
          <Menu size={22} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap' }} className="page-title-responsive">{getPageTitle()}</h2>
        
        {/* Global Search Box */}
        <div style={{ marginLeft: '32px', flex: 1, maxWidth: '400px' }} className="search-bar-responsive">
          <div 
            onClick={onSearchClick}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', 
              backgroundColor: 'var(--bg-sidebar)', padding: '8px 16px', borderRadius: '8px', 
              cursor: 'pointer', border: '1px solid transparent',
              transition: 'all 0.2s ease'
            }}
            className="search-input-hover"
          >
            <Search size={18} color="var(--text-light)" />
            <span style={{ fontSize: '14px', color: 'var(--text-subtle)', flex: 1 }}>Search anywhere...</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <kbd style={{ background: 'var(--border-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Ctrl</kbd>
              <kbd style={{ background: 'var(--border-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>K</kbd>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Notifications Bell */}
        <button 
          onClick={onNotificationsClick}
          style={{
            position: 'relative',
            background: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            width: '38px', height: '38px',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          className="notification-btn-hover"
        >
          <Bell size={18} color="var(--text-muted)" />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '-2px', right: '-2px',
              width: '18px', height: '18px', borderRadius: '50%',
              backgroundColor: 'var(--color-danger)', color: '#fff',
              fontSize: '10px', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--bg-card)'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* Streak Counter Badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          backgroundColor: 'var(--color-warning-light)',
          color: 'var(--color-warning)',
          padding: '6px 12px',
          borderRadius: '9999px',
          fontWeight: '600'
        }} className="badge-system-user">
          ⚡ {currentUser.streakDays} Day Streak
        </span>

        {/* Profile Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
          <div style={{ textAlign: 'right' }} className="profile-text-responsive">
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{currentUser.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{currentUser.role}</p>
          </div>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-teal)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {currentUser.name ? currentUser.name.split(' ').map(n=>n[0]).join('') : "U"}
          </div>
        </div>
      </div>
    </header>
  );
};

export default UserTopbar;
