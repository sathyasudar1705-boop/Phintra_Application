import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, Mail, Plus, Eye, BookOpen, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';

const EmailTemplates = () => {
  const { emailTemplates, addTemplate, editTemplate, deleteTemplate } = useAppContext();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Modal States
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Form Fields for new template
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Credential Theft');
  const [newDifficulty, setNewDifficulty] = useState('Medium');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Extract unique categories
  const categories = ['All', 'Credential Theft', 'Urgent Action', 'Suspicious Link'];

  // Filtered Templates
  const filteredTemplates = (emailTemplates || []).filter((temp) => {
    const matchesSearch = temp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          temp.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || temp.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenEdit = (template) => {
    setEditingTemplate(template);
    setNewName(template.name);
    setNewCategory(template.category);
    setNewDifficulty(template.difficulty);
    setNewSubject(template.subject);
    setNewBody(template.body);
    setShowCreateModal(true);
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplate(id);
      } catch (err) {
        console.error(err);
        alert("Failed to delete template");
      }
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setEditingTemplate(null);
    setNewName('');
    setNewSubject('');
    setNewBody('');
    setCreateError('');
    setCreateSuccess('');
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!newName || !newSubject || !newBody) {
      setCreateError('Please complete all required fields.');
      return;
    }

    try {
      if (editingTemplate) {
        await editTemplate(editingTemplate.id, {
          name: newName,
          category: newCategory,
          difficulty: newDifficulty,
          subject: newSubject,
          body: newBody
        });
        setCreateSuccess('Template updated successfully!');
      } else {
        await addTemplate({
          name: newName,
          category: newCategory,
          difficulty: newDifficulty,
          subject: newSubject,
          body: newBody
        });
        setCreateSuccess('Template created successfully!');
      }

      setTimeout(() => {
        handleCloseCreateModal();
      }, 1000);
    } catch (err) {
      setCreateError(err.response?.data?.detail || 'Failed to save template.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="saas-header">
        <div className="saas-title-group">
          <h1>Phishing Email Templates</h1>
          <p>Browse, preview, and build simulated email layouts to test corporate phishing defenses.</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          icon={Plus}
        >
          Create Template
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="saas-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search field */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search templates by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', display: 'flex' }}>
              <Search size={16} />
            </div>
          </div>

        </div>
      </div>

      {/* Category Tabs */}
      <div className="saas-tabs" style={{ marginBottom: '28px' }}>
        {categories.map((cat) => (
          <div
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`saas-tab ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="saas-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          <Mail size={48} style={{ color: 'var(--text-subtle)', marginBottom: '16px' }} />
          <h3>No templates found</h3>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Try searching in a different category or create a custom email template.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredTemplates.map((template) => (
            <div key={template.id} className="saas-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span className="badge badge-reported" style={{ fontSize: '11px' }}>{template.category}</span>
                <span className={`badge badge-${template.difficulty.toLowerCase()}`} style={{ fontSize: '11px' }}>
                  {template.difficulty} Lvl
                </span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>{template.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: '500', marginBottom: '12px' }}>
                Subject: <strong style={{ color: 'var(--text-muted)' }}>{template.subject}</strong>
              </p>
              
              <div style={{
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '12px',
                color: 'var(--text-light)',
                lineHeight: '1.5',
                flex: 1,
                fontFamily: 'monospace',
                marginBottom: '16px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>
                {template.preview || template.body?.slice(0, 100) + '...'}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <Button 
                  onClick={() => setSelectedTemplate(template)}
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  style={{ flex: 1 }}
                >
                  Preview
                </Button>
                <Button 
                  onClick={() => handleOpenEdit(template)}
                  variant="secondary"
                  size="sm"
                  icon={Edit3}
                  style={{ minWidth: '40px' }}
                />
                <Button 
                  onClick={() => handleDeleteTemplate(template.id)}
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  style={{ minWidth: '40px' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 1. Preview Modal */}
      {selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2>Template Email Blueprint</h2>
              <button onClick={() => setSelectedTemplate(null)} className="close-btn">&times;</button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{selectedTemplate.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Category: {selectedTemplate.category} | Difficulty: {selectedTemplate.difficulty}</span>
                </div>
              </div>

              {/* Fake Email client mock box */}
              <div style={{
                border: '1px solid var(--border-hover)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
              }}>
                <div style={{
                  backgroundColor: 'var(--bg-sidebar)',
                  borderBottom: '1px solid var(--border-hover)',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-subtle)' }}>From:</span> Acme Security Simulation Node &lt;lure@phintra-sim.com&gt;
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-subtle)' }}>Subject:</span> <strong style={{ color: 'var(--text-main)' }}>{selectedTemplate.subject}</strong>
                  </div>
                </div>

                <div style={{
                  padding: '24px',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '14px',
                  color: 'var(--text-main)',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-line',
                  minHeight: '200px'
                }}>
                  {selectedTemplate.body}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <Button onClick={() => setSelectedTemplate(null)} variant="primary">Close Preview</Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Create Template Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2>{editingTemplate ? 'Edit Email Template' : 'Build Custom Email Lure'}</h2>
              <button onClick={handleCloseCreateModal} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleCreateTemplate}>
              <div className="modal-body">
                {createError && (
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
                    <AlertCircle size={16} />
                    <span>{createError}</span>
                  </div>
                )}

                {createSuccess && (
                  <div style={{
                    backgroundColor: 'var(--color-success-light)',
                    color: 'var(--color-success-hover)',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: '550'
                  }}>
                    {createSuccess}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Template Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. IT Token Expiry Alert"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div className="modal-grid-2col" style={{
                  gap: '16px'
                }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="Credential Theft">Credential Theft</option>
                      <option value="Urgent Action">Urgent Action</option>
                      <option value="Suspicious Link">Suspicious Link</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Difficulty Rating</label>
                    <select
                      className="form-control"
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value)}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Subject Line</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. [ALERT] Mandatory security patch installation"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Body Content</label>
                  <textarea
                    className="form-control"
                    rows="6"
                    placeholder="Provide the email text content. Use links to simulate phishing click targets."
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <Button variant="secondary" onClick={handleCloseCreateModal}>Cancel</Button>
                <Button variant="primary" type="submit">{editingTemplate ? 'Save Changes' : 'Create Template'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmailTemplates;
