import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Search, Filter, UserPlus, Edit3, Trash2, ShieldAlert } from 'lucide-react';
import Button from '../../components/common/Button';

const AdminEmployees = () => {
  const { 
    employees, 
    addEmployee, 
    editEmployee, 
    deleteEmployee, 
    departments: dbDepartments 
  } = useAppContext();
  const confirm = useConfirm();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  // Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  // Form Fields (Add)
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addDeptId, setAddDeptId] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [credentialsSummary, setCredentialsSummary] = useState(null);
  
  // Form Fields (Edit)
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editRisk, setEditRisk] = useState('Low');
  const [editStatus, setEditStatus] = useState('Not Started');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Extract unique departments from DB
  const departments = ['All', ...(dbDepartments || []).map(d => d.name)];

  // Initialize default department selection for Add Form
  useEffect(() => {
    if (dbDepartments && dbDepartments.length > 0 && !addDeptId) {
      setAddDeptId(dbDepartments[0].id);
    }
  }, [dbDepartments, addDeptId]);

  // Filtered employees
  const filteredEmployees = (employees || []).filter((emp) => {
    const name = emp.name || `${emp.first_name} ${emp.last_name}` || '';
    const email = emp.email || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter || emp.department_name === deptFilter;
    
    const riskLvl = emp.risk_level || 'Low';
    const matchesRisk = riskFilter === 'All' || riskLvl === riskFilter;
    
    return matchesSearch && matchesDept && matchesRisk;
  });

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Remove Employee?',
      description: 'This action cannot be undone. The employee record will be permanently removed.',
      confirmText: 'Yes, Remove',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      try {
        await deleteEmployee(id);
      } catch (err) {
        alert("Failed to delete employee: " + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!addName || !addEmail || !addDeptId || !addPassword) {
      setFormError('Please fill out all required fields.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(addEmail)) {
      setFormError('Please provide a valid company email address.');
      return;
    }

    try {
      await addEmployee({
        name: addName.trim(),
        email: addEmail.trim(),
        department_id: addDeptId,
        password: addPassword,
        job_title: 'Specialist',
        status: 'Low Risk',
        risk_score: 15.0
      });

      setFormSuccess('Employee created successfully!');
      setCredentialsSummary({
        email: addEmail.trim(),
        password: addPassword
      });
    } catch (err) {
      setFormError(err.response?.data?.detail || err.message || 'Failed to add employee.');
    }
  };

  const handleOpenEdit = (emp) => {
    setEditingEmp(emp);
    setEditName(emp.name || `${emp.first_name} ${emp.last_name}`);
    setEditEmail(emp.email);
    setEditDeptId(emp.department_id);
    setEditRisk(emp.risk_level || 'Low');
    setEditStatus(emp.status || 'Low Risk');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!editName || !editEmail || !editDeptId) {
      setFormError('Please complete name and email fields.');
      return;
    }

    // Map risk category to risk_score
    let mappedRiskScore = 15.0;
    if (editRisk === 'Medium') mappedRiskScore = 45.0;
    if (editRisk === 'High') mappedRiskScore = 75.0;

    try {
      await editEmployee(editingEmp.id, {
        first_name: editName.split(' ')[0],
        last_name: editName.split(' ').slice(1).join(' ') || 'Employee',
        email: editEmail.trim(),
        department_id: editDeptId,
        risk_score: mappedRiskScore,
        status: editStatus,
        job_title: editingEmp.job_title || 'Specialist'
      });

      setFormSuccess('Employee updated successfully!');
      setTimeout(() => {
        setEditingEmp(null);
        setFormSuccess('');
      }, 1000);
    } catch (err) {
      setFormError(err.response?.data?.detail || err.message || 'Failed to update employee.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Employees & Users</h1>
          <p>Supervise training compliance, security failure risk categories, and direct employee rosters.</p>
        </div>
        <Button 
          onClick={() => {
            setFormError('');
            setFormSuccess('');
            setShowAddModal(true);
          }}
          variant="primary"
          icon={UserPlus}
        >
          Add Employee
        </Button>
      </div>

      {/* Toolbar (Filters and search) */}
      <div className="saas-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Keyword search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search employees by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex' }}>
              <Search size={16} />
            </div>
          </div>

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--text-light)' }} />
            <select
              className="form-control"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ minWidth: '160px', padding: '8px 12px' }}
            >
              <option value="All">All Teams</option>
              {dbDepartments.map((dept) => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Risk Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={16} style={{ color: 'var(--text-light)' }} />
            <select
              className="form-control"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              style={{ minWidth: '140px', padding: '8px 12px' }}
            >
              <option value="All">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

        </div>
      </div>

      {/* Roster Table */}
      {filteredEmployees.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <UserPlus size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
          <h3>No employees found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try relaxing your filter parameters or add a new team member.</p>
        </div>
      ) : (
        <div className="saas-table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Work Email</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => {
                const displayStatus = emp.status || 'Low Risk';
                return (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{emp.name || `${emp.first_name} ${emp.last_name}`}</td>
                    <td>{emp.department || emp.department_name || 'General'}</td>
                    <td style={{ color: 'var(--text-light)' }}>{emp.email}</td>
                    <td>
                      <span className={`badge badge-${(emp.risk_level || 'low').toLowerCase()}`}>
                        {emp.risk_level || 'Low'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${(displayStatus).replace(' ', '-').toLowerCase()}`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button 
                          onClick={() => handleOpenEdit(emp)}
                          variant="ghost"
                          size="sm"
                          icon={Edit3}
                        />
                        <Button 
                          onClick={() => handleDelete(emp.id)}
                          variant="danger"
                          size="sm"
                          icon={Trash2}
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

      {/* 1. Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Add New Employee</h2>
              <button onClick={() => {
                setShowAddModal(false);
                setCredentialsSummary(null);
                setAddName('');
                setAddEmail('');
                setAddPassword('');
              }} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    backgroundColor: 'var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px'
                  }}>
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div style={{
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success-hover)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: '550'
                  }}>
                    {formSuccess}
                  </div>
                )}

                {credentialsSummary ? (
                  <div style={{ padding: '16px 0' }}>
                    <div style={{
                      backgroundColor: 'var(--bg-sidebar)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '20px',
                      textAlign: 'left',
                      marginBottom: '10px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-main)' }}>Employee Credentials Summary</h4>
                      <div style={{ marginBottom: '10px', fontSize: '13px' }}>
                        <strong style={{ color: 'var(--text-light)' }}>Username (Email):</strong>{' '}
                        <span style={{ color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '14px' }}>{credentialsSummary.email}</span>
                      </div>
                      <div style={{ fontSize: '13px' }}>
                        <strong style={{ color: 'var(--text-light)' }}>Temporary Password:</strong>{' '}
                        <span style={{ color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '14px' }}>{credentialsSummary.password}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-subtle)', marginTop: '12px', textAlign: 'center' }}>Please securely share these credentials with the employee.</p>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Tony Stark"
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Corporate Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g. t.stark@company.com"
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Department Assign</label>
                      <select
                        className="form-control"
                        value={addDeptId}
                        onChange={(e) => setAddDeptId(e.target.value)}
                        required
                      >
                        <option value="">Select Department</option>
                        {dbDepartments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Temporary Password</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Set temporary password"
                        value={addPassword}
                        onChange={(e) => setAddPassword(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                {credentialsSummary ? (
                  <Button variant="primary" onClick={() => {
                    setShowAddModal(false);
                    setCredentialsSummary(null);
                    setAddName('');
                    setAddEmail('');
                    setAddPassword('');
                  }}>Done</Button>
                ) : (
                  <>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" type="submit">Save Employee</Button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Employee Modal */}
      {editingEmp && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Edit Employee Profile</h2>
              <button onClick={() => setEditingEmp(null)} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    backgroundColor: 'var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px'
                  }}>
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div style={{
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success-hover)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: '550'
                  }}>
                    {formSuccess}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Corporate Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department Assign</label>
                  <select
                    className="form-control"
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    {dbDepartments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="modal-grid-2col" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Risk Category</label>
                    <select
                      className="form-control"
                      value={editRisk}
                      onChange={(e) => setEditRisk(e.target.value)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="Low Risk">Low Risk</option>
                      <option value="Medium Risk">Medium Risk</option>
                      <option value="High Risk">High Risk</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={() => setEditingEmp(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminEmployees;
