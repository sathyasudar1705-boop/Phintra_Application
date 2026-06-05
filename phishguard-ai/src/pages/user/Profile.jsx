import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User, Mail, Shield, CheckCircle2, AlertCircle, Edit, Building2 } from 'lucide-react';
import Button from '../../components/common/Button';

const UserProfile = () => {
  const { currentUser, updateProfile } = useAppContext();

  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields: Edit Profile Details
  const [name, setName] = useState(currentUser.name || 'Alex Chen');
  const [email, setEmail] = useState(currentUser.email || 'alex.chen@phintra-enterprise.com');
  const [dept, setDept] = useState(currentUser.department || 'Engineering');
  const [bio, setBio] = useState(currentUser.bio || 'Cybersecurity enthusiast.');

  // Form Fields: Change Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences
  const [emailAlerts, setEmailAlerts] = useState(currentUser.preferences?.emailAlerts ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(currentUser.preferences?.weeklyDigest ?? true);
  
  const [error, setError] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2000);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    updateProfile({
      name,
      email,
      department: dept,
      bio
    });

    triggerToast('Profile parameters updated!');
    setShowEditModal(false);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must satisfy complexity (min 6 characters).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password confirmation does not match.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerToast('Password successfully changed!');
    }, 800);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    updateProfile({
      preferences: {
        emailAlerts,
        weeklyDigest
      }
    });
    triggerToast('Communication preferences updated!');
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Employee Profile</h1>
          <p>Supervise your personal credentials, workspace parameters, and customize notifications.</p>
        </div>
      </div>

      {/* Grid: Left Summary Details Card + Right Actions Form Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.8fr',
        gap: '32px',
        alignItems: 'start'
      }} className="responsive-profile-grid">
        
        {/* Left Profile Details Card */}
        <div className="saas-card" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-teal)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: '600',
            margin: '0 auto 16px auto'
          }}>
            {currentUser.name ? currentUser.name.split(' ').map(n=>n[0]).join('') : "A"}
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>{currentUser.name}</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{currentUser.email}</span>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            backgroundColor: 'var(--color-teal-light)',
            color: 'var(--color-teal)',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontWeight: '600',
            marginTop: '8px'
          }}>
            {currentUser.role}
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '16px', lineHeight: '1.5', fontStyle: 'italic' }}>
            "{currentUser.bio || 'No bio configured yet.'}"
          </p>

          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px',
            marginTop: '20px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '13px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)' }}>Department:</span>
              <strong style={{ color: 'var(--text-main)' }}>{currentUser.department} Team</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)' }}>Join Date:</span>
              <strong style={{ color: 'var(--text-main)' }}>{currentUser.joinDate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-light)' }}>Node Status:</span>
              <strong style={{ color: 'var(--color-success)' }}>Secure Verified</strong>
            </div>
          </div>

          <Button 
            variant="secondary"
            size="sm"
            icon={Edit}
            onClick={() => setShowEditModal(true)}
            style={{ width: '100%', marginTop: '24px' }}
          >
            Edit Profile Parameters
          </Button>
        </div>

        {/* Right Section: Forms for preferences and password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Password change */}
          <div className="saas-card">
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} style={{ color: 'var(--color-primary)' }} />
              Modify Workspace Password
            </h3>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-danger-light)',
                border: '1px solid var(--color-danger-light)',
                color: 'var(--color-danger)',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Old Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="responsive-profile-inputs">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="secondary"
                size="sm"
                loading={loading}
                disabled={loading}
              >
                Update Password
              </Button>
            </form>
          </div>

          {/* Card 2: Notifications */}
          <div className="saas-card">
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Communication Settings</h3>
            
            <form onSubmit={handleSavePreferences}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    style={{ marginTop: '3px' }} 
                  />
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>Email Alerts</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
                      Receive email alerts immediately when a new training course is assigned to you.
                    </span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    style={{ marginTop: '3px' }} 
                  />
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>Weekly Security Digest</strong>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>
                      Get a summary of security drills completed in the organization.
                    </span>
                  </div>
                </label>
              </div>

              <Button type="submit" variant="secondary" size="sm">Save Preferences</Button>
            </form>
          </div>

        </div>

      </div>

      {/* Profile Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department Assign</label>
                  <select
                    className="form-control"
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Profile Bio</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--text-main)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
          <span style={{ fontSize: '13px', fontWeight: '500' }}>{toastMessage}</span>
        </div>
      )}

      <style>{`
        @media (max-width: 992px) {
          .responsive-profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 576px) {
          .responsive-profile-inputs {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
        }
      `}</style>

    </div>
  );
};

export default UserProfile;
