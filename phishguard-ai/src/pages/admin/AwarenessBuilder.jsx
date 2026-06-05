import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { Eye, Save, Sparkles, Layout, RotateCcw, AlertTriangle, ArrowRight, Shield } from 'lucide-react';
import Button from '../../components/common/Button';

const TEMPLATES = [
  {
    id: 'mfa',
    title: 'Action Required: Multi-Factor Authentication Verification',
    message: 'We have updated our internal authentication protocols to secure corporate assets. All employees are required to verify their mobile device authentication credentials immediately.',
    tips: [
      'Check the browser address bar to ensure you are on the company domain before logging in.',
      'Phintra internal systems will never ask you to authenticate twice within a minute.',
      'Report any unexpected MFA push notifications directly to the Security Team.'
    ],
    ctaText: 'Verify Account MFA Now',
    theme: 'danger'
  },
  {
    id: 'hr_policy',
    title: 'Updated Remote Work Security Guidelines 2026',
    message: 'To protect corporate data while working remotely, please review the revised remote access guidelines and confirm compliance before the end of the week.',
    tips: [
      'Never use public Wi-Fi without connecting to Phintra corporate VPN.',
      'Ensure your home router admin password has been changed from default settings.',
      'Lock your screen when leaving your device unattended, even at home.'
    ],
    ctaText: 'Review Guidelines',
    theme: 'teal'
  },
  {
    id: 'payroll',
    title: 'Quarterly Earnings Report & Payroll Verification',
    message: 'Please access the secure finance portal to check your updated tax distributions and payroll adjustments for this quarter.',
    tips: [
      'Corporate HR does not send payroll links hosted on external cloud drives (e.g., OneDrive, Dropbox).',
      'Hover over URLs to see the actual target domain before clicking.',
      'Reach out directly to the Payroll department via Slack if you receive unexpected document requests.'
    ],
    ctaText: 'Access Portal',
    theme: 'primary'
  }
];

const AwarenessBuilder = () => {
  const toast = useToast();
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);
  const [title, setTitle] = useState(TEMPLATES[0].title);
  const [message, setMessage] = useState(TEMPLATES[0].message);
  const [tipsText, setTipsText] = useState(TEMPLATES[0].tips.join('\n'));
  const [ctaText, setCtaText] = useState(TEMPLATES[0].ctaText);
  const [theme, setTheme] = useState(TEMPLATES[0].theme);
  const [previewTab, setPreviewTab] = useState('desktop');

  const handleTemplateChange = (id) => {
    const template = TEMPLATES.find(t => t.id === id);
    if (template) {
      setSelectedTemplateId(id);
      setTitle(template.title);
      setMessage(template.message);
      setTipsText(template.tips.join('\n'));
      setCtaText(template.ctaText);
      setTheme(template.theme);
    }
  };

  const handleReset = () => {
    handleTemplateChange(selectedTemplateId);
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success(`Successfully saved awareness landing template: "${title}"`);
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'danger':
        return { primary: 'var(--color-danger)', bg: 'var(--color-danger-light)', text: 'var(--color-danger)' };
      case 'teal':
        return { primary: 'var(--color-teal)', bg: 'var(--color-teal-light)', text: 'var(--color-teal)' };
      case 'primary':
      default:
        return { primary: 'var(--color-primary)', bg: 'var(--color-primary-light)', text: 'var(--color-primary)' };
    }
  };

  const themeColors = getThemeColors();

  return (
    <div>
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Awareness Page Builder</h1>
          <p>Create educational redirection pages shown when employees click on simulated phishing links.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Editor Form */}
        <div className="saas-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Page Configurations</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={handleReset}
                className="btn btn-secondary btn-sm"
                title="Reset Form"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave}>
            {/* Template Selection */}
            <div className="form-group">
              <label className="form-label">Start from a Template</label>
              <select 
                className="form-control"
                value={selectedTemplateId} 
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.title.substring(0, 45)}...</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Page Main Title</label>
              <input 
                type="text" 
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Urgent System Maintenance Notification"
                required
              />
            </div>

            {/* Message */}
            <div className="form-group">
              <label className="form-label">Educational Message</label>
              <textarea 
                className="form-control"
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter awareness description or warnings..."
                required
              />
            </div>

            {/* Tips list */}
            <div className="form-group">
              <label className="form-label">Security Red Flags / Tips (One per line)</label>
              <textarea 
                className="form-control"
                rows="4"
                value={tipsText}
                onChange={(e) => setTipsText(e.target.value)}
                placeholder="Provide security advice..."
                required
              />
            </div>

            {/* Theme & CTA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Button Text</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="e.g. Acknowledge & Return"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Alert Theme</label>
                <select 
                  className="form-control"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="primary">Brand Blue (Info)</option>
                  <option value="danger">Crimson Red (Urgent)</option>
                  <option value="teal">Teal (Standard)</option>
                </select>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', display: 'flex', gap: '12px' }}>
              <Button type="submit" variant="primary" icon={Save} style={{ flex: 1 }}>
                Save Template
              </Button>
            </div>
          </form>
        </div>

        {/* Live Preview Console */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Live Redirect Preview</h3>
            <div className="saas-tabs" style={{ marginBottom: 0, gap: '12px' }}>
              <span 
                className={`saas-tab ${previewTab === 'desktop' ? 'active' : ''}`}
                style={{ padding: '4px 8px', fontSize: '13px' }}
                onClick={() => setPreviewTab('desktop')}
              >
                Desktop
              </span>
              <span 
                className={`saas-tab ${previewTab === 'mobile' ? 'active' : ''}`}
                style={{ padding: '4px 8px', fontSize: '13px' }}
                onClick={() => setPreviewTab('mobile')}
              >
                Mobile
              </span>
            </div>
          </div>

          <div style={{
            flex: 1,
            backgroundColor: 'var(--border-hover)',
            borderRadius: '8px',
            padding: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.2s ease',
            minHeight: '400px'
          }}>
            {/* The Outer Frame */}
            <div style={{
              width: previewTab === 'desktop' ? '100%' : '320px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: '8px',
              border: '1px solid var(--text-subtle)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'width 0.3s ease'
            }}>
              {/* Browser Header Bar */}
              <div style={{
                backgroundColor: 'var(--bg-sidebar)',
                borderBottom: '1px solid var(--border-color)',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }} />
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                </div>
                <div style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '11px',
                  color: 'var(--text-light)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  https://phintra-simulation.security/awareness
                </div>
              </div>

              {/* Awareness Page Content */}
              <div style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    backgroundColor: themeColors.bg,
                    color: themeColors.primary,
                    padding: '16px',
                    borderRadius: '50%'
                  }}>
                    <AlertTriangle size={32} />
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.3' }}>
                    {title || 'Oops! Simulated Link Clicked'}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '8px', lineHeight: '1.5' }}>
                    {message || 'This is an educational screen created by the security operations team.'}
                  </p>
                </div>

                {/* Simulated Tips Console */}
                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  borderLeft: `4px solid ${themeColors.primary}`,
                  borderRadius: '6px',
                  padding: '16px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Shield size={16} style={{ color: themeColors.primary }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Educational Insights</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tipsText.split('\n').filter(t => t.trim() !== '').map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Call to Action Button */}
                <button 
                  type="button"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => toast.info('Simulated action redirect completed')}
                >
                  {ctaText || 'Acknowledge Guidelines'}
                  <ArrowRight size={16} />
                </button>

                <span style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>
                  Phintra Awareness Redirection Console &copy; 2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwarenessBuilder;
