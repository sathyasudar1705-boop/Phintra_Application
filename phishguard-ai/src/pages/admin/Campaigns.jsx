import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Search, Filter, Plus, Eye, Edit3, Trash2, Calendar, Users, Percent, Send } from 'lucide-react';
import Button from '../../components/common/Button';
import api from '../../services/api';

const AdminCampaigns = () => {
  const { campaigns, deleteCampaign, emailTemplates, fetchData } = useAppContext();
  const navigate = useNavigate();
  const confirm = useConfirm();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  const getTemplateName = (templateId) => {
    if (!templateId) return "No Template";
    const template = emailTemplates?.find(t => t.id === templateId);
    return template ? template.title : "Unknown Template";
  };

  const handleLaunch = async (camp) => {
    const titleVal = camp.title || camp.name || 'Simulation Drill';
    const confirmed = await confirm({
      title: 'Launch Simulation Drill?',
      description: `This will immediately dispatch the simulated phishing emails to all assigned employees for "${titleVal}".`,
      confirmText: 'Yes, Send Now',
      cancelText: 'Cancel',
      variant: 'success'
    });
    if (confirmed) {
      try {
        await api.post(`/campaigns/${camp.id}/launch`);
        await fetchData();
      } catch (err) {
        alert("Failed to launch campaign: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  // Safe fallback if campaigns is undefined
  const campaignsList = campaigns || [];

  // Filtered campaigns
  const filteredCampaigns = campaignsList.filter((camp) => {
    const titleVal = camp.title || camp.name || '';
    const matchesSearch = titleVal.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || camp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Campaign?',
      description: 'This action cannot be undone. The campaign and its data will be permanently removed.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      try {
        await deleteCampaign(id);
      } catch (err) {
        alert("Failed to delete campaign: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleViewDetails = async (camp) => {
    setSelectedCampaign(camp);
    setAnalyticsData(null);
    setAnalyticsLoading(true);
    try {
      const res = await api.get(`/campaigns/analytics/${camp.id}`);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error("Failed to load campaign analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleOpenEdit = (camp) => {
    setEditCampaign(camp);
    setEditName(camp.title || camp.name || '');
    setEditDesc(camp.description || '');
    setEditStatus(camp.status || 'Active');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName) return;

    try {
      await api.put(`/campaigns/${editCampaign.id}`, {
        title: editName,
        description: editDesc,
        status: editStatus
      });
      await fetchData();
      setEditCampaign(null);
    } catch (err) {
      alert("Failed to save changes: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Simulation Campaigns</h1>
          <p>Deploy and monitor active security testing simulations inside the organization.</p>
        </div>
        <Button 
          onClick={() => navigate('/admin/create-campaign')}
          variant="primary"
          icon={Plus}
        >
          Create Campaign
        </Button>
      </div>

      {/* Toolbar (Search and Filters) */}
      <div className="saas-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search campaigns by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex' }}>
              <Search size={16} />
            </div>
          </div>

          {/* Filter dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--text-light)' }} />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '160px', padding: '8px 12px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Launched">Launched</option>
              <option value="Completed">Completed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

        </div>
      </div>

      {/* Campaigns Listing Grid / Table */}
      {filteredCampaigns.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <Percent size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
          <h3>No campaigns found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try modifying your search query or launch a new campaign.</p>
        </div>
      ) : (
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Status</th>
                <th>Target Scope</th>
                <th>Success Rate</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((camp) => {
                const titleVal = camp.title || camp.name || 'Simulation Drill';
                const employeeCount = camp.employee_count !== undefined ? camp.employee_count : (camp.targetUsers || 0);
                const successRateVal = camp.success_rate !== undefined ? camp.success_rate : (camp.successRate || 85);
                const createdDateStr = camp.created_at ? new Date(camp.created_at).toLocaleDateString() : (camp.createdDate || 'N/A');
                
                return (
                  <tr key={camp.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{titleVal}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {camp.description}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${camp.status.toLowerCase()}`}>
                        {camp.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <Users size={14} style={{ color: 'var(--text-light)' }} />
                        <span>{employeeCount} Employees</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontWeight: '600' }}>{camp.status === 'Draft' ? '0%' : `${successRateVal}%`}</div>
                        {camp.status !== 'Draft' && (
                          <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${successRateVal}%`, height: '100%', backgroundColor: 'var(--color-success)' }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <Calendar size={14} />
                        <span>{createdDateStr}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {camp.status === 'Draft' && (
                          <Button 
                            onClick={() => handleLaunch(camp)}
                            variant="success"
                            size="sm"
                            icon={Send}
                            title="Send Immediately"
                          />
                        )}
                        <Button 
                          onClick={() => handleViewDetails(camp)}
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          title="View Details"
                        />
                        <Button 
                          onClick={() => handleOpenEdit(camp)}
                          variant="ghost"
                          size="sm"
                          icon={Edit3}
                          title="Edit Campaign"
                        />
                        <Button 
                          onClick={() => handleDelete(camp.id)}
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          title="Delete Campaign"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. Campaign Details Modal */}
      {selectedCampaign && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>Campaign Intelligence details</h2>
              <button onClick={() => setSelectedCampaign(null)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className={`badge badge-${selectedCampaign.status.toLowerCase()}`} style={{ float: 'right' }}>
                  {selectedCampaign.status}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{selectedCampaign.title || selectedCampaign.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '6px' }}>
                  Created on {selectedCampaign.created_at ? new Date(selectedCampaign.created_at).toLocaleDateString() : (selectedCampaign.createdDate || 'N/A')}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '6px' }}>Campaign Description</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{selectedCampaign.description}</p>
              </div>

              <div className="modal-grid-2col" style={{
                gap: '16px',
                backgroundColor: 'var(--bg-main)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Target Volume</span>
                  <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '4px', color: 'var(--text-main)' }}>
                    {selectedCampaign.employee_count !== undefined ? selectedCampaign.employee_count : (selectedCampaign.targetUsers || 0)} Employees
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Template Design</span>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '4px', color: 'var(--color-primary)' }}>
                    {getTemplateName(selectedCampaign.template_id)}
                  </div>
                </div>
              </div>

              {selectedCampaign.status !== 'Draft' && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px' }}>Simulated Funnel Metrics</h4>
                  {analyticsLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                      Loading real-time campaign analytics...
                    </div>
                  ) : analyticsData ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>Emails Sent</span>
                          <strong style={{ color: 'var(--text-main)' }}>{analyticsData.total_sent}</strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px' }}>
                          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-primary)' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>Emails Delivered</span>
                          <strong style={{ color: 'var(--text-main)' }}>{analyticsData.total_delivered}</strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px' }}>
                          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-success)' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>Emails Clicked (Simulation Failure)</span>
                          <strong style={{ color: 'var(--color-danger)' }}>
                            {analyticsData.total_clicked} ({analyticsData.click_rate_percentage}%)
                          </strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px' }}>
                          <div style={{ width: `${analyticsData.click_rate_percentage}%`, height: '100%', backgroundColor: 'var(--color-danger)' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>Emails Reported (Simulation Success)</span>
                          <strong style={{ color: 'var(--color-teal)' }}>
                            {analyticsData.total_reported} ({analyticsData.reported_rate_percentage}%)
                          </strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px' }}>
                          <div style={{ width: `${analyticsData.reported_rate_percentage}%`, height: '100%', backgroundColor: 'var(--color-teal)' }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                      No analytics data available.
                    </div>
                  )}
                </div>
              )}

              {analyticsData && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '12px' }}>Click & Report Tracking Details</h4>
                  
                  {/* Clicked Employees */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-danger)', marginBottom: '8px' }}>
                      Employees Who Clicked Link ({analyticsData.clicked_employees.length})
                    </h5>
                    {analyticsData.clicked_employees.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>No employee clicked the simulation link.</p>
                    ) : (
                      <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px' }}>
                        {analyticsData.clicked_employees.map((emp, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: i < analyticsData.clicked_employees.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                            <span><strong>{emp.name}</strong> ({emp.email})</span>
                            <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>{new Date(emp.clicked_at).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reported Employees */}
                  <div>
                    <h5 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-teal)', marginBottom: '8px' }}>
                      Employees Who Reported Email ({analyticsData.reported_employees.length})
                    </h5>
                    {analyticsData.reported_employees.length === 0 ? (
                      <p style={{ fontSize: '12px', color: 'var(--text-light)', fontStyle: 'italic' }}>No employee reported the simulation email.</p>
                    ) : (
                      <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px' }}>
                        {analyticsData.reported_employees.map((emp, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: i < analyticsData.reported_employees.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                            <span><strong>{emp.name}</strong> ({emp.email})</span>
                            <span style={{ color: 'var(--text-light)', fontSize: '11px' }}>{new Date(emp.reported_at).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button onClick={() => setSelectedCampaign(null)} variant="primary">Close Details</Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Campaign Modal */}
      {editCampaign && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Edit Simulation</h2>
              <button onClick={() => setEditCampaign(null)} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Campaign Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Active Status</label>
                  <select
                    className="form-control"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Launched">Launched</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setEditCampaign(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCampaigns;
