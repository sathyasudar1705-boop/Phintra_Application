import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ChevronRight, ChevronLeft, ShieldCheck, Mail, Users, BookOpen, Eye, Send, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import api from '../../services/api';

const CreateCampaign = () => {
  const { employees, emailTemplates, departments, currentUser, fetchData } = useAppContext();
  const navigate = useNavigate();

  // Multi-Step Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);

  // Draft Campaign ID saved in backend
  const [createdCampaignId, setCreatedCampaignId] = useState(null);

  // Form Fields
  // Step 1: Details
  const [campName, setCampName] = useState('');
  const [campDesc, setCampDesc] = useState('');
  
  // Step 2: Select Employees
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');

  // Step 3: Choose Template
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Step 5: Send Test Email
  const [testEmail, setTestEmail] = useState(currentUser?.email || 'admin@phintra.com');
  const [testSending, setTestSending] = useState(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState('');

  // Step 6: Confirmation Checkbox
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Sync test email field when currentUser is loaded
  useEffect(() => {
    if (currentUser?.email) {
      setTestEmail(currentUser.email);
    }
  }, [currentUser]);

  // Employee Selection List Handlers
  const filteredEmployees = (employees || []).filter(emp => {
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    const search = employeeSearch.toLowerCase();
    return fullName.includes(search) || email.includes(search) || dept.includes(search);
  });

  const handleToggleEmployee = (id) => {
    if (selectedEmployeeIds.includes(id)) {
      setSelectedEmployeeIds(prev => prev.filter(empId => empId !== id));
    } else {
      setSelectedEmployeeIds(prev => [...prev, id]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedEmployeeIds.length === filteredEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(filteredEmployees.map(emp => emp.id));
    }
  };

  const handleSelectDepartmentEmployees = () => {
    if (!selectedDeptFilter) return;
    const deptEmpIds = (employees || [])
      .filter(emp => emp.department_id === selectedDeptFilter || emp.department === selectedDeptFilter)
      .map(emp => emp.id);
    
    setSelectedEmployeeIds(prev => {
      const newSelection = [...prev];
      deptEmpIds.forEach(id => {
        if (!newSelection.includes(id)) {
          newSelection.push(id);
        }
      });
      return newSelection;
    });
  };

  // Step Transitions & Validations
  const validateStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!campName.trim()) {
        setError('Campaign name is required.');
        return false;
      }
      if (!campDesc.trim()) {
        setError('Campaign description is required.');
        return false;
      }
    } else if (currentStep === 2) {
      if (selectedEmployeeIds.length === 0) {
        setError('Please select at least one employee recipient.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!selectedTemplateId) {
        setError('Please choose an email template blueprint.');
        return false;
      }
    } else if (currentStep === 5) {
      if (!testEmail) {
        setError('A recipient email is required to send the test.');
        return false;
      }
    } else if (currentStep === 6) {
      if (!termsAccepted) {
        setError('You must accept the safety policy checkbox to launch.');
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    // Transition from Step 3 (Choose Template) to Step 4 (Preview): Save draft to DB
    if (currentStep === 3) {
      setSavingCampaign(true);
      setError('');
      try {
        // Delete previous draft campaign to avoid stale lists
        if (createdCampaignId) {
          try {
            await api.delete(`/campaigns/${createdCampaignId}`);
          } catch (e) {
            console.warn("Could not prune previous draft campaign:", e);
          }
        }

        // Create fresh draft campaign with the selected employees and template
        const response = await api.post('/campaigns', {
          title: campName,
          description: campDesc,
          campaign_type: 'Awareness Email',
          status: 'Draft',
          template_id: selectedTemplateId,
          employee_ids: selectedEmployeeIds
        });
        setCreatedCampaignId(response.data.id);
        setCurrentStep(4);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to save campaign draft. Please check your network connection.');
      } finally {
        setSavingCampaign(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setTestSuccessMsg('');
    setCurrentStep(prev => prev - 1);
  };

  // Test Email Dispatch via backend
  const handleSendTestEmail = async () => {
    setError('');
    setTestSuccessMsg('');
    if (!testEmail) {
      setError('Please provide a valid test recipient email address.');
      return;
    }
    
    setTestSending(true);
    try {
      await api.post(`/campaigns/${createdCampaignId}/send-test`, {
        test_email: testEmail.trim()
      });
      setTestSuccessMsg(`Test awareness email successfully sent to ${testEmail}! Please verify headers and body.`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to dispatch test SMTP connection email.');
    } finally {
      setTestSending(false);
    }
  };

  // Launch Campaign
  const handleLaunch = async () => {
    if (!termsAccepted) {
      setError('Please check the safety confirmation box.');
      return;
    }
    
    setSavingCampaign(true);
    setError('');
    try {
      await api.post(`/campaigns/${createdCampaignId}/launch`);
      setSuccess(true);
      if (fetchData) fetchData();
      setTimeout(() => {
        navigate('/admin/campaigns');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to launch SMTP campaign nodes.');
    } finally {
      setSavingCampaign(false);
    }
  };

  // Selected details reference helper
  const selectedTemplateObj = emailTemplates.find(t => t.id === selectedTemplateId);

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>New Training Campaign</h1>
          <p>Configure a cybersecurity training campaign to deliver targeted security alerts via Gmail SMTP.</p>
        </div>
      </div>

      {/* Step Indicators */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '20px 32px',
        marginBottom: '32px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {[
          { step: 1, label: 'Details', icon: Mail },
          { step: 2, label: 'Recipients', icon: Users },
          { step: 3, label: 'Template', icon: BookOpen },
          { step: 4, label: 'Preview', icon: Eye },
          { step: 5, label: 'Test Send', icon: Send },
          { step: 6, label: 'Launch', icon: ShieldCheck }
        ].map((item, idx) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isCompleted = currentStep > item.step;
          return (
            <React.Fragment key={item.step}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isActive ? 'var(--color-primary)' : isCompleted ? 'var(--color-success-light)' : 'var(--bg-sidebar)',
                  color: isActive ? '#ffffff' : isCompleted ? 'var(--color-success)' : 'var(--text-light)',
                  border: isActive ? 'none' : isCompleted ? '1px solid var(--color-success)' : '1px solid var(--border-hover)',
                  fontWeight: '600',
                  fontSize: '13px'
                }}>
                  {isCompleted ? <ShieldCheck size={16} /> : item.step}
                </div>
                <div className="step-label-responsive" style={{
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? 'var(--text-main)' : 'var(--text-light)'
                }}>
                  {item.label}
                </div>
              </div>
              {idx < 5 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--border-hover)',
                  margin: '0 8px'
                }} className="step-divider-responsive" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Container */}
      <div className="saas-card" style={{ maxWidth: '820px', margin: '0 auto' }}>
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-danger-light)',
            border: '1px solid var(--color-danger-light)',
            color: 'var(--color-danger)',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}>
              <ShieldCheck size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>Campaign Launched!</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-light)', marginTop: '6px' }}>Training emails are dispatched. Redirecting to listing...</p>
          </div>
        ) : (
          <div>
            
            {/* STEP 1: CAMPAIGN DETAILS */}
            {currentStep === 1 && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-main)' }}>Step 1: Campaign details</h2>
                
                <div className="form-group">
                  <label className="form-label">Campaign Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. June Phishing Awareness Campaign"
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Core Objective / Notes</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Define the simulation goals and target focus..."
                    value={campDesc}
                    onChange={(e) => setCampDesc(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: SELECT EMPLOYEES */}
            {currentStep === 2 && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Step 2: Select target employee base</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '20px' }}>Select specific recipients who will receive the educational security message.</p>

                {/* Filter and Selection Tools */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search employees by name, email or department..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    style={{ flex: 1, minWidth: '200px' }}
                  />
                  <select
                    className="form-control"
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    style={{ width: '180px' }}
                  >
                    <option value="">Filter by Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  <Button variant="secondary" size="sm" onClick={handleSelectDepartmentEmployees}>
                    Select Dept
                  </Button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <span>Selected: <strong>{selectedEmployeeIds.length}</strong> of {filteredEmployees.length} filtered employees</span>
                  <button onClick={handleToggleSelectAll} style={{ color: 'var(--color-primary)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {selectedEmployeeIds.length === filteredEmployees.length ? 'Deselect All' : 'Select All Filtered'}
                  </button>
                </div>

                {/* Employees Table Grid */}
                <div style={{
                  maxHeight: '320px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-main)'
                }}>
                  {filteredEmployees.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)' }}>No employees match search filter.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-sidebar)', color: 'var(--text-muted)', textAlign: 'left' }}>
                          <th style={{ padding: '10px 16px', width: '40px' }}>Select</th>
                          <th style={{ padding: '10px 16px' }}>Name</th>
                          <th style={{ padding: '10px 16px' }}>Department</th>
                          <th style={{ padding: '10px 16px' }}>Email Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map(emp => {
                          const isChecked = selectedEmployeeIds.includes(emp.id);
                          return (
                            <tr 
                              key={emp.id} 
                              onClick={() => handleToggleEmployee(emp.id)}
                              style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: isChecked ? 'var(--color-primary-light)' : '#ffffff', cursor: 'pointer' }}
                            >
                              <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  style={{ cursor: 'pointer' }}
                                />
                              </td>
                              <td style={{ padding: '10px 16px', fontWeight: '600' }}>{emp.first_name} {emp.last_name}</td>
                              <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{emp.department_name || emp.department}</td>
                              <td style={{ padding: '10px 16px', color: 'var(--text-light)' }}>{emp.email}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: CHOOSE TEMPLATE */}
            {currentStep === 3 && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Step 3: Select phishing simulation layout</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '20px' }}>Choose which security notification style template to attach to this campaign dispatch.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
                  {emailTemplates.map((template) => {
                    const isSelected = selectedTemplateId === template.id;
                    return (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplateId(template.id)}
                        style={{
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-hover)',
                          borderRadius: '8px',
                          padding: '16px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : '#ffffff',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: 'var(--border-color)', padding: '2px 6px', borderRadius: '4px' }}>{template.category}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{template.difficulty}</span>
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>{template.name}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          Subject: {template.subject}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: PREVIEW EMAIL */}
            {currentStep === 4 && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Step 4: Preview simulation headers & layout</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '20px' }}>Verify how the educational lure layout will present inside recipient user mail clients.</p>

                <div style={{ border: '1px solid var(--border-hover)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-hover)', padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      <span style={{ color: 'var(--text-subtle)' }}>From:</span> Acme Security Simulation Node &lt;lure@phintra-sim.com&gt;
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-subtle)' }}>Subject:</span> <strong style={{ color: 'var(--text-main)' }}>{selectedTemplateObj?.subject}</strong>
                    </div>
                  </div>
                  <div style={{ padding: '24px', backgroundColor: 'var(--bg-card)', fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap', minHeight: '220px' }}>
                    {selectedTemplateObj?.body}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: SEND TEST EMAIL */}
            {currentStep === 5 && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Step 5: Dispatch connectivity test email</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '20px' }}>Send a trial run of this simulation blueprint to a designated administrator box to ensure delivery.</p>

                {testSuccessMsg && (
                  <div style={{ backgroundColor: 'var(--color-success-light)', border: '1px solid var(--color-success-light)', color: '#047857', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>
                    {testSuccessMsg}
                  </div>
                )}

                <div className="form-group" style={{ maxWidth: '480px' }}>
                  <label className="form-label">Test Recipient Address</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="test@yourdomain.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                    <Button variant="outline" icon={Send} onClick={handleSendTestEmail} disabled={testSending}>
                      {testSending ? 'Sending...' : 'Send Test'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: LAUNCH CAMPAIGN */}
            {currentStep === 6 && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Step 6: Confirm and dispatch campaign</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '20px' }}>Verify all dispatch configurations. Once launched, emails are dispatched to SMTP targets immediately.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px' }}>
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Campaign Title</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px' }}>{campName}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>{campDesc}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13px' }} className="responsive-step4-grid">
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-light)', marginBottom: '4px', fontWeight: '500' }}>Template Blueprint</strong>
                      <span>{selectedTemplateObj?.name}</span>
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-light)', marginBottom: '4px', fontWeight: '500' }}>Target Audience</strong>
                      <span>{selectedEmployeeIds.length} employee targets</span>
                    </div>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-light)', marginBottom: '4px', fontWeight: '500' }}>SMTP Node</strong>
                      <span>Real SMTP / Gmail server connection</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '20px', backgroundColor: 'var(--color-primary-light)', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px' }}>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <p style={{ fontSize: '13px', color: 'var(--color-primary-hover)', lineHeight: '1.4' }}>
                    I confirm that this is an authorized educational cybersecurity campaign. Phintra automatically appends a training gateway landing page to all phishing links to protect user training posture.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '20px',
              marginTop: '28px'
            }}>
              {currentStep > 1 ? (
                <Button variant="secondary" icon={ChevronLeft} onClick={handleBack} disabled={savingCampaign}>
                  Back
                </Button>
              ) : <div />}

              {currentStep < 6 ? (
                <Button variant="primary" iconRight={ChevronRight} onClick={handleNext} disabled={savingCampaign}>
                  {savingCampaign ? 'Saving...' : 'Next Step'}
                </Button>
              ) : (
                <Button variant="teal" icon={ShieldCheck} onClick={handleLaunch} disabled={savingCampaign}>
                  {savingCampaign ? 'Deploying...' : 'Deploy & Launch Campaign'}
                </Button>
              )}
            </div>

          </div>
        )}

      </div>

      <style>{`
        @media (max-width: 768px) {
          .step-label-responsive {
            display: none !important;
          }
          .step-divider-responsive {
            margin: 0 8px !important;
          }
          .responsive-step4-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateCampaign;
