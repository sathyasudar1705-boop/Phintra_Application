import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AlertTriangle, Send, UploadCloud, CheckCircle2, ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';

const ReportSuspicious = () => {
  const { reportedEmails, reportEmail } = useAppContext();

  // Form States
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('Suspicious Link');
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Form Validations
    if (!sender.trim()) {
      setError('Please provide the sender\'s email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(sender)) {
      setError('Please enter a valid sender email format.');
      return;
    }
    if (!subject.trim()) {
      setError('Please specify the email subject line.');
      return;
    }
    if (!message.trim()) {
      setError('Please describe why this email appears suspicious.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Dispatch to global context
      reportEmail({
        senderEmail: sender,
        subject: subject,
        reason: reason,
        body: message
      });

      setLoading(false);
      setSuccess(true);

      // Reset fields
      setSender('');
      setSubject('');
      setMessage('');
      setAttachedFile(null);

      // Hide success notification after 3s
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 800);
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Threat Reporting Center</h1>
          <p>Instantly flag suspicious incoming emails to the IT security response team to isolate threats.</p>
        </div>
      </div>

      {/* Main Grid: Left Form + Right Recent History list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '32px',
        alignItems: 'start'
      }} className="responsive-reporting-grid">
        
        {/* Flag Form */}
        <div className="saas-card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--color-danger)' }} />
            Flag Suspicious Email
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
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-success-light)',
              border: '1px solid var(--color-success-light)',
              color: 'var(--color-success-hover)',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '16px',
              fontWeight: '550'
            }}>
              <CheckCircle2 size={16} />
              <span>Suspicious email successfully isolated. IT security team notified!</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Sender Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. security-alert@office365-verify.com"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Subject Line</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Action Required: Account Suspension Warning"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Suspicious Risk Factor Category</label>
              <select
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              >
                <option value="Suspicious Link">Suspicious Hyperlink</option>
                <option value="Credential Theft">Credential Reset Request</option>
                <option value="Urgent Action">Urgent Action Mandate / CEO request</option>
                <option value="Suspicious Attachment">Suspicious File Attachment</option>
                <option value="Other">Other Indicator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description of Anomalies</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Describe what triggers your concern. e.g. Domain typos, weird urgency language, unexpected billing, etc..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Fake attachment upload */}
            <div className="form-group">
              <label className="form-label">Upload EML / Email headers (Optional)</label>
              <div style={{
                border: '1px dashed var(--border-hover)',
                borderRadius: '6px',
                padding: '14px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-main)',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <UploadCloud size={20} style={{ color: 'var(--text-subtle)', margin: '0 auto 6px auto' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block' }}>
                  {attachedFile ? `Attached: ${attachedFile}` : 'Drag & drop EML file, or click to upload'}
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              type="submit"
              variant="teal"
              icon={Send}
              loading={loading}
              disabled={loading}
              style={{ width: '100%', marginTop: '10px' }}
            >
              Submit Threat Report
            </Button>
          </form>
        </div>

        {/* History Table */}
        <div className="saas-card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Your Threat Flag History</h3>
          
          <div className="saas-table-container" style={{ margin: 0 }}>
            <table className="saas-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportedEmails.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '24px 0' }}>
                      No reported threats recorded.
                    </td>
                  </tr>
                ) : (
                  reportedEmails.map((report) => (
                    <tr key={report.id}>
                      <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.senderEmail}
                      </td>
                      <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                        {report.subject}
                      </td>
                      <td>
                        <span className={`badge badge-${report.status.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .responsive-reporting-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default ReportSuspicious;
