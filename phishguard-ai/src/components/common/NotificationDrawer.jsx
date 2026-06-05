import React, { useState, useEffect } from 'react';
import { X, Bell, ShieldAlert, CheckCircle, Brain, Target, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const NotificationDrawer = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('All');
  const { notifications: rawNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getIconAndColor = (title) => {
    const t = title.toLowerCase();
    if (t.includes('critical') || t.includes('phishing threat') || t.includes('alert')) {
      return { icon: ShieldAlert, color: 'var(--color-danger)', type: 'Alert' };
    }
    if (t.includes('completed') || t.includes('training')) {
      return { icon: CheckCircle, color: 'var(--color-success)', type: 'Training' };
    }
    if (t.includes('ai') || t.includes('recommendation')) {
      return { icon: Brain, color: 'var(--color-primary)', type: 'AI' };
    }
    if (t.includes('campaign')) {
      return { icon: Target, color: 'var(--color-teal)', type: 'Campaign' };
    }
    return { icon: MessageSquare, color: 'var(--color-warning)', type: 'Report' };
  };

  const notifications = (rawNotifications || []).map(n => {
    const meta = getIconAndColor(n.title);
    return {
      id: n.id,
      type: meta.type,
      title: n.title,
      desc: n.message,
      time: formatTime(n.created_at),
      read: n.is_read,
      icon: meta.icon,
      color: meta.color
    };
  });

  const markAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !n.read;
    if (activeTab === 'Alerts') return n.type === 'Alert';
    return true;
  });

  return (
    <div className="modal-overlay" style={{ justifyContent: 'flex-end', padding: 0 }} onClick={onClose}>
      <div 
        style={{ 
          width: '100%', maxWidth: '400px', height: '100vh', 
          backgroundColor: 'var(--bg-card)', 
          boxShadow: '-8px 0 32px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column',
          animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} color="var(--text-main)" />
            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Notifications</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['All', 'Unread', 'Alerts'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: activeTab === tab ? '600' : '500',
                  color: activeTab === tab ? 'var(--color-primary)' : 'var(--text-muted)',
                  paddingBottom: '4px',
                  borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <button onClick={markAllAsRead} style={{ fontSize: '12px', color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            Mark all read
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div key={notification.id} style={{ 
                padding: '16px 24px', 
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: notification.read ? 'transparent' : 'var(--color-primary-light)',
                display: 'flex', gap: '16px',
                transition: 'background 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => !notification.read && markNotificationAsRead(notification.id)}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : 'var(--color-primary-light)'}
              >
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0,
                  borderRadius: '50%', background: 'var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)',
                  color: notification.color
                }}>
                  <notification.icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>{notification.title}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{notification.time}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>{notification.desc}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ margin: '24px', border: 'none' }}>
              <div className="empty-state-icon">
                <Bell size={32} />
              </div>
              <h3>All caught up!</h3>
              <p>You have no {activeTab === 'All' ? '' : activeTab.toLowerCase()} notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
