import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const Register = () => {
  const { register } = useAppContext();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!name || !email || !companyName || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please provide a valid company email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, companyName, password, companySize, industry);
      setLoading(false);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        console.error("[DEBUG] Register component error:", res.message);
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setLoading(false);
      console.error("[DEBUG] Register component network exception:", err.response || err);
      setError(err.response?.data?.detail || 'A network connection error occurred.');
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }}>
        <div style={{
          backgroundColor: 'var(--color-success-light)',
          color: 'var(--color-success)',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)'
        }}>
          <ShieldCheck size={28} />
        </div>
        
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>Workspace Created Successfully!</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
          Your workspace and admin account are set up. Automatically redirecting to login page...
        </p>

        <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>Create Your Workspace</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>Set up cybersecurity awareness training for your organization.</p>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'var(--color-danger-light)',
          border: '1px solid var(--color-danger-light)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '13px',
          color: 'var(--color-danger)',
          marginBottom: '16px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">Full Name *</label>
          <input
            id="fullName"
            type="text"
            className="form-control"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Work Email *</label>
          <input
            id="email"
            type="email"
            className="form-control"
            placeholder="john.doe@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="companyName">Company Name *</label>
          <input
            id="companyName"
            type="text"
            className="form-control"
            placeholder="e.g. Acme Corp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="modal-grid-2col" style={{ gap: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="companySize">Company Size</label>
            <select
              id="companySize"
              className="form-control"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              disabled={loading}
            >
              <option value="">Select size</option>
              <option value="1-50">1-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="industry">Industry</label>
            <input
              id="industry"
              type="text"
              className="form-control"
              placeholder="e.g. Finance"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            className="form-control"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
          <input
            id="confirmPassword"
            type="password"
            className="form-control"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          style={{ width: '100%', marginTop: '16px' }}
          disabled={loading}
          loading={loading}
          iconRight={ArrowRight}
        >
          Create Workspace
        </Button>
      </form>

      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--text-light)',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px'
      }}>
        Already have a workspace account?{' '}
        <Link to="/login" style={{ fontWeight: '600' }}>Sign In</Link>
      </div>
    </div>
  );
};

export default Register;
