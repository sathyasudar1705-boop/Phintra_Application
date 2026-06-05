import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { securityTips } from '../../data/dummyData';
import { 
  ShieldCheck, AlertTriangle, BookOpen, Clock, Award, 
  ChevronRight, ChevronLeft, Lightbulb, TrendingUp 
} from 'lucide-react';
import Button from '../../components/common/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UserHome = () => {
  const { currentUser, trainingModules, simulations } = useAppContext();
  const navigate = useNavigate();

  // Tips Carousel State
  const [tipIndex, setTipIndex] = useState(0);

  // Simulated Score Trend Dataset
  const scoreTrend = [
    { name: 'Jan', score: 70 },
    { name: 'Feb', score: 74 },
    { name: 'Mar', score: 82 },
    { name: 'Apr', score: 82 },
    { name: 'May', score: currentUser.securityScore }
  ];

  // Derive ongoing courses
  const pendingCourses = trainingModules.filter(m => !m.isCompleted);
  const nextCourse = pendingCourses.length > 0 ? pendingCourses[0] : null;

  // Derive recent simulation
  const recentSim = simulations.length > 0 ? simulations[0] : null;

  const handleNextTip = () => {
    setTipIndex(prev => (prev + 1) % securityTips.length);
  };

  const handlePrevTip = () => {
    setTipIndex(prev => (prev - 1 + securityTips.length) % securityTips.length);
  };

  return (
    <div>
      {/* 1. Greeting header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Welcome back, {currentUser.name || 'Alex'}</h1>
          <p>You belong to the <strong style={{ color: 'var(--text-main)' }}>{currentUser.department || 'Engineering'} Department</strong>. Let's keep our corporate nodes safe today!</p>
        </div>
      </div>

      {/* 2. Top Portal Grid: Score Gauge + Summaries */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }} className="responsive-home-top-grid">
        
        {/* Card 1: Score Gauge */}
        <div className="saas-card" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Circular progress gauge */}
          <div style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {/* SVG Ring background and value */}
            <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="45" cy="45" r="38" stroke="var(--border-color)" strokeWidth="6" fill="transparent" />
              <circle cx="45" cy="45" r="38" stroke="var(--color-teal)" strokeWidth="6" fill="transparent" 
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - currentUser.securityScore/100)}`}
              />
            </svg>
            <div style={{
              position: 'absolute',
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--text-main)'
            }}>
              {currentUser.securityScore}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>Your Safety Grade</span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginTop: '4px', color: 'var(--text-main)' }}>Security Champion</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-teal)', marginTop: '6px', fontWeight: '500' }}>
              Awesome! You are in the top 15% of the company.
            </p>
          </div>
        </div>

        {/* Card 2: Next Training Queue */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>Assigned Training</span>
            {nextCourse ? (
              <div style={{ marginTop: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.4' }}>{nextCourse.name}</h4>
                <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                  <span>{nextCourse.duration}</span>
                  <span>&bull;</span>
                  <span>{nextCourse.difficulty} level</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--color-success)', fontWeight: '500', marginTop: '8px' }}>All training assignments completed!</p>
            )}
          </div>
          
          <Button 
            variant="ghost"
            size="sm"
            iconRight={ChevronRight}
            onClick={() => navigate('/user/training')}
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--color-teal)',
              marginTop: '12px',
              width: 'fit-content'
            }}
          >
            {nextCourse ? 'Resume Course' : 'Review Modules'}
          </Button>
        </div>

        {/* Card 3: Recent Simulation Badge */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '600' }}>Latest Phishing Test</span>
            {recentSim ? (
              <div style={{ marginTop: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{recentSim.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span className={`badge badge-${recentSim.result.toLowerCase()}`} style={{ fontSize: '11px' }}>
                    {recentSim.result}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{recentSim.date}</span>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '8px' }}>No simulation records found.</p>
            )}
          </div>

          <Button 
            variant="ghost"
            size="sm"
            iconRight={ChevronRight}
            onClick={() => navigate('/user/simulations')}
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--color-teal)',
              marginTop: '12px',
              width: 'fit-content'
            }}
          >
            Review Simulation History
          </Button>
        </div>

      </div>

      {/* 3. Bottom Grid: Score Trend Chart + Security Tip Carousel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.8fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }} className="responsive-home-bottom-grid">
        
        {/* Trend Chart */}
        <div className="saas-card">
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} style={{ color: 'var(--color-teal)' }} />
            Personal Security Score Trajectory
          </h3>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrend} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-sidebar)" />
                <XAxis dataKey="name" tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <YAxis domain={[0, 100]} tickLine={false} style={{ fontSize: '11px', fill: 'var(--text-light)' }} />
                <Tooltip />
                <Line type="monotone" name="Security Score" dataKey="score" stroke="var(--color-teal)" strokeWidth={2.5} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tip Carousel */}
        <div className="saas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '300px', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Lightbulb size={18} style={{ color: 'var(--color-warning)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Security Tip of the Day</h3>
            </div>
            
            <div style={{
              backgroundColor: 'var(--color-warning-light)',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '20px',
              fontSize: '13px',
              color: '#92400e',
              lineHeight: '1.6',
              minHeight: '140px',
              display: 'flex',
              alignItems: 'center',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              "{securityTips[tipIndex]}"
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '500' }}>Tip {tipIndex + 1} of {securityTips.length}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button 
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                onClick={handlePrevTip}
                style={{ padding: '6px' }}
              />
              <Button 
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                onClick={handleNextTip}
                style={{ padding: '6px' }}
              />
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 991px) {
          .responsive-home-top-grid {
            grid-template-columns: 1fr !important;
          }
          .responsive-home-bottom-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default UserHome;
