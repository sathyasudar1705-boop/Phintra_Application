import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Calendar, Plus, Mail, Users, CheckCircle, Info, ChevronLeft, ChevronRight, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';

const CampaignCalendar = () => {
  const { campaignEvents, addCampaignEvent } = useAppContext();

  // Calendar parameters: fixed to May 2026
  const currentYear = 2026;
  const currentMonthIndex = 4; // May (0-indexed)
  const monthName = "May 2026";

  // Modal States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form State
  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-05-18');
  const [newTemplateName, setNewTemplateName] = useState('CEO Gift Card Request');
  const [newTargetUsers, setNewTargetUsers] = useState(150);

  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!newEventName || !newEventDate || !newTemplateName) return;

    addCampaignEvent({
      name: newEventName,
      date: newEventDate,
      templateName: newTemplateName,
      targetUsers: Number(newTargetUsers)
    });

    triggerToast(`Simulation drill "${newEventName}" successfully scheduled on ${newEventDate}.`);
    
    // Reset
    setShowScheduleModal(false);
    setNewEventName('');
    setNewEventDate('2026-05-18');
  };

  // Helper: Get campaigns scheduled on a particular day of May 2026 (yyyy-mm-dd)
  const getEventsForDate = (dayNumber) => {
    const formattedDate = `2026-05-${dayNumber.toString().padStart(2, '0')}`;
    return campaignEvents.filter(e => e.date === formattedDate);
  };

  // Render Days of May 2026
  // May 1, 2026 is a Friday (so 5 empty cells of offset: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5)
  const startOffsetDays = 5;
  const totalDaysInMay = 31;
  const daysArray = [];

  // Generate calendar days structure
  for (let i = 0; i < startOffsetDays; i++) {
    daysArray.push({ type: 'empty', key: `empty-${i}` });
  }
  for (let i = 1; i <= totalDaysInMay; i++) {
    daysArray.push({ type: 'day', day: i, key: `day-${i}` });
  }

  // Row segments helper (groups of 7 days)
  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };
  const calendarRows = chunkArray(daysArray, 7);

  // Return status color markers
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return { bg: 'var(--color-primary-light)', text: 'var(--color-primary)', border: '#bfdbfe' };
      case 'Completed': return { bg: 'var(--color-success-light)', text: 'var(--color-success-hover)', border: 'var(--color-success-light)' };
      case 'Scheduled': return { bg: 'var(--color-warning-light)', text: 'var(--color-warning)', border: '#fde68a' };
      default: return { bg: 'var(--bg-sidebar)', text: 'var(--text-muted)', border: 'var(--border-hover)' };
    }
  };

  return (
    <div>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: 'var(--text-main)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          animation: 'slideUp 0.3s ease-out',
          fontSize: '14px'
        }}>
          <ShieldAlert size={18} style={{ color: 'var(--color-success)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Simulation Campaign Calendar</h1>
          <p>Schedule, manage, and coordinate threat simulation runs over the monthly roadmap schedule.</p>
        </div>
        <Button 
          onClick={() => setShowScheduleModal(true)}
          variant="primary"
          icon={Plus}
        >
          Schedule New Campaign
        </Button>
      </div>

      {/* Calendar Grid Board */}
      <div className="saas-card" style={{ padding: '24px', overflowX: 'auto' }}>
        
        {/* Month Header Banner */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={22} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{monthName}</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }} className="calendar-controls">
            <button 
              disabled 
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-hover)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-subtle)',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled 
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-hover)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-subtle)',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Week Days Label Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '13px',
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '10px',
          marginBottom: '10px'
        }}>
          <div>SUNDAY</div>
          <div>MONDAY</div>
          <div>TUESDAY</div>
          <div>WEDNESDAY</div>
          <div>THURSDAY</div>
          <div>FRIDAY</div>
          <div>SATURDAY</div>
        </div>

        {/* Calendar Monthly cells grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {calendarRows.map((row, rIdx) => (
            <div 
              key={`row-${rIdx}`} 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))',
                gap: '8px',
                minHeight: '110px'
              }}
            >
              {row.map((cell) => {
                if (cell.type === 'empty') {
                  return (
                    <div 
                      key={cell.key} 
                      style={{
                        backgroundColor: 'var(--bg-main)',
                        border: '1px dashed var(--border-hover)',
                        borderRadius: '8px'
                      }}
                    />
                  );
                }

                const dayEvents = getEventsForDate(cell.day);
                return (
                  <div 
                    key={cell.key} 
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'border-color 0.2s',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.01)'
                    }}
                    className="calendar-day-cell"
                  >
                    {/* Day number */}
                    <span style={{ 
                      fontSize: '13px', 
                      fontWeight: '700', 
                      color: cell.day === 29 ? 'var(--color-primary)' : 'var(--text-muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: cell.day === 29 ? 'var(--color-primary-light)' : 'transparent'
                    }}>
                      {cell.day}
                    </span>

                    {/* Day scheduled campaign tags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
                      {dayEvents.map(evt => {
                        const styleColors = getStatusColor(evt.status);
                        return (
                          <div 
                            key={evt.id} 
                            onClick={() => setSelectedEvent(evt)}
                            style={{
                              backgroundColor: styleColors.bg,
                              color: styleColors.text,
                              border: `1px solid ${styleColors.border}`,
                              padding: '4px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              textAlign: 'left'
                            }}
                            title={evt.name}
                          >
                            • {evt.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

      </div>

      {/* Legend markers */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', fontSize: '12px', color: 'var(--text-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></span>
          <span>Completed Drills</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></span>
          <span>Active Campaign</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }}></span>
          <span>Scheduled Roadmaps</span>
        </div>
      </div>

      {/* 1. View Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div className="modal-content animate-fade-in" style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Campaign Configuration</h3>
              <button 
                onClick={() => setSelectedEvent(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--text-light)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-sidebar)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-light)' }}>Campaign Title:</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedEvent.name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-sidebar)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-light)' }}>Execution Date:</span>
                <span style={{ fontWeight: '600' }}>{selectedEvent.date}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-sidebar)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-light)' }}>Status:</span>
                <span className={`badge badge-${selectedEvent.status.toLowerCase()}`} style={{ fontSize: '11px' }}>
                  {selectedEvent.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-sidebar)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-light)' }}>Lure Template Name:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>{selectedEvent.templateName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-sidebar)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-light)' }}>Target Users:</span>
                <span style={{ fontWeight: '600' }}>{selectedEvent.targetUsers} Employees</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifySelf: 'end', marginTop: '24px' }}>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'var(--text-main)',
                  color: '#ffffff',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Schedule Event Modal Form */}
      {showScheduleModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div className="modal-content animate-fade-in" style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Schedule Phishing Campaign</h3>
              <button 
                onClick={() => setShowScheduleModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: 'var(--text-light)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Campaign Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Benefits Lure Run"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Execution Date (May 2026)</label>
                <input
                  type="date"
                  min="2026-05-01"
                  max="2026-05-31"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Select Email Blueprint Lure</label>
                <select
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                >
                  <option value="CEO Gift Card Request">CEO Gift Card Request</option>
                  <option value="Mandatory Password Reset">Mandatory Password Reset</option>
                  <option value="Annual Benefits Update">Annual Benefits Update</option>
                  <option value="Slack Account Deactivation Warning">Slack Account Deactivation Warning</option>
                  <option value="Failed Shipping Delivery">Failed Shipping Delivery</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>Target Employee Count</label>
                <input
                  type="number"
                  min="1"
                  value={newTargetUsers}
                  onChange={(e) => setNewTargetUsers(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-hover)' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifySelf: 'end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Schedule Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS style keyframes */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CampaignCalendar;
