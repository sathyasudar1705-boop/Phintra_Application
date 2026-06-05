import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { BookOpen, Plus, Edit3, Trash2, Clock, Shield, Users } from 'lucide-react';
import Button from '../../components/common/Button';

const AdminModules = () => {
  const { trainingModules, addModule, deleteModule, updateModuleProgress } = useAppContext();
  const confirm = useConfirm();

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMod, setEditingMod] = useState(null);

  // Form Fields (Add)
  const [addName, setAddName] = useState('');
  const [addDiff, setAddDiff] = useState('Easy');
  const [addDur, setAddDur] = useState('15 mins');

  // Form Fields (Edit)
  const [editName, setEditName] = useState('');
  const [editDiff, setEditDiff] = useState('Easy');
  const [editDur, setEditDur] = useState('15 mins');
  const [editEnroll, setEditEnroll] = useState(0);
  const [editCompRate, setEditCompRate] = useState(0);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Training Module?',
      description: 'This action cannot be undone. The module and its content will be permanently removed.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      deleteModule(id);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!addName) {
      setError('Module title is required.');
      return;
    }

    addModule({
      name: addName,
      difficulty: addDiff,
      duration: addDur
    });

    setSuccess('Training course created successfully!');
    setTimeout(() => {
      setShowAddModal(false);
      setAddName('');
      setAddDiff('Easy');
      setAddDur('15 mins');
      setSuccess('');
    }, 1000);
  };

  const handleOpenEdit = (mod) => {
    setEditingMod(mod);
    setEditName(mod.name);
    setEditDiff(mod.difficulty);
    setEditDur(mod.duration);
    setEditEnroll(mod.enrollmentCount);
    setEditCompRate(mod.completionStats);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editName) {
      setError('Module title is required.');
      return;
    }

    // Direct mutation
    editingMod.name = editName;
    editingMod.difficulty = editDiff;
    editingMod.duration = editDur;
    editingMod.enrollmentCount = parseInt(editEnroll);
    editingMod.completionStats = parseInt(editCompRate);

    // Trigger state change trigger
    updateModuleProgress(editingMod.id, editingMod.progress);

    setSuccess('Course parameters updated!');
    setTimeout(() => {
      setEditingMod(null);
      setSuccess('');
    }, 1000);
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Training Modules</h1>
          <p>Create, manage, and inspect cybersecurity educational courses assigned to employee targets.</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          variant="primary"
          icon={Plus}
        >
          Create Module
        </Button>
      </div>

      {/* Grid of Courses */}
      {trainingModules.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <BookOpen size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
          <h3>No training modules found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Build your first cybersecurity awareness training module to dispatch to employees.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {trainingModules.map((mod) => (
            <div key={mod.id} className="saas-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className={`badge badge-${mod.difficulty.toLowerCase()}`}>{mod.difficulty} Lvl</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button 
                    onClick={() => handleOpenEdit(mod)}
                    variant="ghost"
                    size="sm"
                    icon={Edit3}
                    style={{ padding: '6px' }}
                  />
                  <Button 
                    onClick={() => handleDelete(mod.id)}
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    style={{ padding: '6px' }}
                  />
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '14px', lineHeight: '1.4' }}>
                {mod.name}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                
                {/* Meta details list */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px', color: 'var(--text-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {mod.duration}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} /> {mod.enrollmentCount} Enrolled
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-light)', marginBottom: '4px' }}>
                    <span>Completion Rate</span>
                    <strong style={{ color: 'var(--color-teal)' }}>{mod.completionStats}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${mod.completionStats}%`, height: '100%', backgroundColor: 'var(--color-teal)' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. Add Module Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Create Course Module</h2>
              <button onClick={() => setShowAddModal(false)} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{
                    backgroundColor: 'var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px'
                  }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success-hover)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: '550'
                  }}>
                    {success}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Module Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Recognizing Credential Theft"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-grid-2col" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select
                      className="form-control"
                      value={addDiff}
                      onChange={(e) => setAddDiff(e.target.value)}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Duration</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 20 mins"
                      value={addDur}
                      onChange={(e) => setAddDur(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Create Module</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Module Modal */}
      {editingMod && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Edit Course Module</h2>
              <button onClick={() => setEditingMod(null)} className="close-btn">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                {error && (
                  <div style={{
                    backgroundColor: 'var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px'
                  }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success-hover)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: '550'
                  }}>
                    {success}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Module Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-grid-2col" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select
                      className="form-control"
                      value={editDiff}
                      onChange={(e) => setEditDiff(e.target.value)}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Duration</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editDur}
                      onChange={(e) => setEditDur(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-grid-2col" style={{ gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Enrollment Count</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editEnroll}
                      onChange={(e) => setEditEnroll(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Completion Rate (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max="100"
                      value={editCompRate}
                      onChange={(e) => setEditCompRate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setEditingMod(null)}>Cancel</Button>
                <Button type="submit" variant="primary">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminModules;
