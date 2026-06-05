import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  ArrowRight, 
  ShieldCheck, 
  Brain, 
  Lock, 
  Mail, 
  Sparkles, 
  Target, 
  BarChart3 
} from 'lucide-react';
import Button from '../../components/common/Button';

const EmployeeLogin = () => {
  const { employeeLogin, isAuthenticated, userRole } = useAppContext();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation and Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'Employee') {
        navigate('/user/home');
      } else if (userRole === 'Security Administrator') {
        navigate('/admin/dashboard');
      } else if (userRole === 'Security Manager') {
        navigate('/admin/manager-dashboard');
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  // Pre-fills demo employee account
  const handleDemoSelect = () => {
    setEmail('employee@phintra.com');
    setPassword('employee123');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    let hasError = false;

    // Email validation checks
    if (!email.trim()) {
      setEmailError('Email address is required');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    // Password validation checks
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const res = await employeeLogin(email, password);
      setLoading(false);
      
      if (res.success) {
        navigate('/user/home');
      } else {
        setGeneralError(res.message || 'Incorrect email or password');
      }
    } catch (err) {
      setLoading(false);
      setGeneralError('A connection error occurred. Please check that the server is online.');
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. Left Panel (Brand Section) */}
      <div className="login-left-panel" style={{
        flex: '1.2',
        backgroundColor: 'var(--bg-card)',
        padding: '64px 80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid var(--border-color)'
      }}>
        {/* Soft blue gradient accent spheres */}
        <div className="gradient-sphere sphere-1" />
        <div className="gradient-sphere sphere-2" />

        <div style={{ maxWidth: '520px', position: 'relative', zIndex: 10 }}>
          {/* Prominent Logo & Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
            <img 
              src="https://i.pinimg.com/1200x/5c/07/7c/5c077c6c718fb0216266ccf723d011d3.jpg" 
              alt="Phintra Logo" 
              style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)' }}
            />
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.03em', margin: 0 }}>Phintra</h1>
              <p style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '700', letterSpacing: '0.05em', margin: 0, textTransform: 'uppercase' }}>Cybersecurity Awareness Platform</p>
            </div>
          </div>

          {/* Headline and Description */}
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.025em', lineHeight: '1.25' }}>
            Enhance your security awareness and knowledge
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '16px', lineHeight: '1.6' }}>
            Participate in cybersecurity training, complete quizzes, and keep yourself and your organization safe against phishing and social engineering.
          </p>

          {/* Feature Highlights Vertical List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginTop: '48px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.06)', color: 'var(--color-primary)', padding: '10px', borderRadius: '10px', display: 'flex', flexShrink: 0 }}>
                <Brain size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Interactive micro-learning</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px', lineHeight: '1.5' }}>
                  Learn on the go with curated learning bytes and interactive red flag training.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.06)', color: 'var(--color-primary)', padding: '10px', borderRadius: '10px', display: 'flex', flexShrink: 0 }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Verify your skills</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px', lineHeight: '1.5' }}>
                  Earn certificates and XP as you successfully complete quizzes and security challenges.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.06)', color: 'var(--color-primary)', padding: '10px', borderRadius: '10px', display: 'flex', flexShrink: 0 }}>
                <Target size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>Simulated threat detection</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px', lineHeight: '1.5' }}>
                  Practice identifying phishing indicators in a safe, controlled simulator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Panel (Login Card) */}
      <div className="login-right-panel" style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px',
        backgroundColor: 'var(--bg-sidebar)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '440px', width: '100%', position: 'relative', zIndex: 10 }}>
          
          {/* Card Container */}
          <div className="saas-card shadow-premium" style={{ 
            padding: '40px', 
            borderRadius: '16px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}>
            
            {/* Header text */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>Employee Login</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '6px', margin: 0 }}>Sign in to access your training dashboard.</p>
            </div>

            {/* General Credentials Error Alert */}
            {generalError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'var(--color-danger-light)',
                border: '1px solid var(--color-danger-light)',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '13px',
                color: 'var(--color-danger)',
                marginBottom: '20px'
              }}>
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: '500' }}>{generalError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate>
              
              {/* Email Address Input */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Work Email</label>
                <div className="login-input-container">
                  <Mail size={18} className="login-input-icon" />
                  <input 
                    id="email"
                    type="email"
                    className={`login-input ${emailError ? 'login-input-error' : ''}`}
                    placeholder="your.email@company.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); setGeneralError(''); }}
                    disabled={loading}
                    required
                  />
                </div>
                {emailError && <div style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '5px', fontWeight: '500' }}>{emailError}</div>}
              </div>

              {/* Password Input */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" htmlFor="password" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', margin: 0 }}>Password</label>
                </div>
                <div className="login-input-container">
                  <Lock size={18} className="login-input-icon" />
                  <input 
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`login-input login-input-password ${passwordError ? 'login-input-error' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); setGeneralError(''); }}
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && <div style={{ fontSize: '12px', color: 'var(--color-danger)', marginTop: '5px', fontWeight: '500' }}>{passwordError}</div>}
              </div>

              {/* Remember me option */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      accentColor: 'var(--color-primary)', 
                      cursor: 'pointer' 
                    }}
                  />
                  Remember me
                </label>
              </div>

              {/* Submit Sign In Button */}
              <Button
                type="submit"
                variant="primary"
                style={{ width: '100%', height: '42px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}
                disabled={loading}
                loading={loading}
                iconRight={ArrowRight}
              >
                Sign In
              </Button>
            </form>

            {/* Quick selector Demo Account Buttons */}
            <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', textAlign: 'center' }}>Quick Access Demo</span>
              <div className="demo-btn-group" style={{ display: 'flex', justifyContent: 'center' }}>
                <button 
                  type="button"
                  onClick={handleDemoSelect}
                  className="demo-btn"
                  style={{ width: '100%', padding: '8px' }}
                >
                  Load Demo Employee Credentials
                </button>
              </div>
            </div>

            {/* Small Encrypted Security Note */}
            <div style={{
              marginTop: '24px',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--text-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <Lock size={12} />
              <span>Secure connection established</span>
            </div>

          </div>

          {/* Registration link back to admin portal login */}
          <div style={{
            marginTop: '28px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-light)'
          }}>
            Are you an administrator?{' '}
            <Link to="/login" style={{ fontWeight: '600', color: 'var(--color-primary)', textDecoration: 'none' }}>Admin Login</Link>
          </div>

        </div>
      </div>

      {/* Styled custom CSS properties representing standard SaaS login behaviors */}
      <style>{`
        .gradient-sphere {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }
        .sphere-1 {
          top: -200px;
          left: -150px;
        }
        .sphere-2 {
          bottom: -200px;
          right: -100px;
        }
        .shadow-premium {
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.03), 0 8px 16px -8px rgba(0, 0, 0, 0.03) !important;
        }
        .login-input-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .login-input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-subtle);
          pointer-events: none;
        }
        .login-input {
          width: 100%;
          height: 42px;
          padding: 10px 14px 10px 42px;
          font-size: 14px;
          border: 1px solid var(--border-hover);
          border-radius: 8px;
          background: #ffffff;
          color: var(--text-main);
          transition: all 0.15s ease-out;
          font-family: inherit;
        }
        .login-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
          outline: none;
        }
        .login-input-error {
          border-color: var(--color-danger) !important;
        }
        .login-input-error:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.08) !important;
        }
        .login-input-password {
          padding-right: 42px;
        }
        .password-toggle-btn {
          position: absolute;
          right: 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--text-subtle);
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease;
        }
        .password-toggle-btn:hover {
          color: var(--text-muted);
        }
        .demo-btn-group {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          width: 100%;
        }
        .demo-btn {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 550;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease-out;
          text-align: center;
          font-family: inherit;
        }
        .demo-btn:hover {
          background: var(--bg-main);
          border-color: var(--border-hover);
          color: var(--text-main);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }
        @media (max-width: 900px) {
          .login-container {
            flex-direction: column !important;
          }
          .login-left-panel {
            padding: 48px 32px !important;
            flex: none !important;
            width: 100% !important;
            box-sizing: border-box;
          }
          .login-right-panel {
            padding: 32px 16px !important;
            flex: none !important;
            width: 100% !important;
            box-sizing: border-box;
            background-color: var(--bg-sidebar) !important;
          }
          .saas-card {
            padding: 24px !important;
          }
        }
        @media (max-width: 640px) {
          .login-left-panel {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
};

export default EmployeeLogin;
