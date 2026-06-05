import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initialCurrentUser, 
  initialEmployees, 
  initialCampaigns, 
  initialEmailTemplates, 
  initialTrainingModules, 
  initialQuizzes, 
  initialLeaderboard, 
  initialSimulations,
  certificates as initialCertificates,
  initialAuditLogs,
  initialRolePermissions,
  initialScheduledCampaignEvents
} from '../data/dummyData';
import { useAuth } from './AuthContext';
import api from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { 
    isAuthenticated, 
    userRole, 
    currentUser, 
    login, 
    employeeLogin,
    register, 
    selectRole, 
    logout,
    setCurrentUser
  } = useAuth();


  // Database-backed States
  const [employees, setEmployees] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [reportedEmails, setReportedEmails] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Local-only / Fallback States
  const [trainingModules, setTrainingModules] = useState(() => {
    const saved = localStorage.getItem('pg_modules');
    return saved ? JSON.parse(saved) : [...initialTrainingModules];
  });

  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem('pg_quizzes');
    return saved ? JSON.parse(saved) : [...initialQuizzes];
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem('pg_leaderboard');
    return saved ? JSON.parse(saved) : [...initialLeaderboard];
  });

  const [simulations, setSimulations] = useState(() => {
    const saved = localStorage.getItem('pg_simulations');
    return saved ? JSON.parse(saved) : [...initialSimulations];
  });

  const [certificates, setCertificates] = useState(() => {
    const saved = localStorage.getItem('pg_certificates');
    return saved ? JSON.parse(saved) : [...initialCertificates];
  });

  const [rolePermissions, setRolePermissions] = useState(() => {
    const saved = localStorage.getItem('pg_role_permissions');
    return saved ? JSON.parse(saved) : [...initialRolePermissions];
  });

  const [campaignEvents, setCampaignEvents] = useState(() => {
    const saved = localStorage.getItem('pg_campaign_events');
    return saved ? JSON.parse(saved) : [...initialScheduledCampaignEvents];
  });

  // Global API Fetch Function
  const fetchData = async () => {
    if (!isAuthenticated) return;
    try {
      // Fetch notifications for all roles if authenticated
      try {
        const notifRes = await api.get('/notifications');
        setNotifications(notifRes.data);
      } catch (e) {
        console.warn("Could not fetch notifications:", e);
      }

      if (userRole === 'Security Administrator' || userRole === 'Security Manager') {
        const empRes = await api.get('/employees');
        setEmployees(empRes.data);
        
        const campRes = await api.get('/campaigns');
        setCampaigns(campRes.data);
        
        const tempRes = await api.get('/email-templates');
        setEmailTemplates(tempRes.data);
        
        const repRes = await api.get('/reported-emails');
        const mappedReports = repRes.data.map(r => ({
          id: r.id,
          employeeName: r.employee_name || "Unknown Employee",
          senderEmail: r.email_sender || "unknown@sender.com",
          subject: r.email_subject || "No Subject",
          campaignName: r.campaign_name || "External Gmail Report",
          riskScore: r.risk_score || 0,
          riskLevel: r.risk_level || ((r.risk_score || 0) > 70 ? "High" : (r.risk_score || 0) > 30 ? "Medium" : "Low"),
          status: r.report_status || "Pending",
          createdAt: r.created_at || r.reported_at,
          reportedDate: r.reported_at ? (typeof r.reported_at === 'string' ? r.reported_at.split('T')[0] : new Date(r.reported_at).toISOString().split('T')[0]) : (r.created_at ? (typeof r.created_at === 'string' ? r.created_at.split('T')[0] : new Date(r.created_at).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]),
          body: r.email_body || "",
          departmentId: r.department_id || null
        }));
        // Sort newest reports first by createdAt date
        mappedReports.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.reportedDate || 0);
          const dateB = new Date(b.createdAt || b.reportedDate || 0);
          return dateB - dateA;
        });
        setReportedEmails(mappedReports);
        
        const deptRes = await api.get('/departments');
        setDepartments(deptRes.data);
        
        if (userRole === 'Security Administrator') {
          try {
            const auditRes = await api.get('/audit-logs');
            setAuditLogs(auditRes.data);
          } catch (e) {
            console.warn("Could not fetch audit logs:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data from API:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, userRole]);

  // Sync remaining local states to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('pg_modules', JSON.stringify(trainingModules));
    localStorage.setItem('pg_quizzes', JSON.stringify(quizzes));
    localStorage.setItem('pg_leaderboard', JSON.stringify(leaderboard));
    localStorage.setItem('pg_simulations', JSON.stringify(simulations));
    localStorage.setItem('pg_certificates', JSON.stringify(certificates));
    localStorage.setItem('pg_role_permissions', JSON.stringify(rolePermissions));
    localStorage.setItem('pg_campaign_events', JSON.stringify(campaignEvents));
  }, [
    trainingModules, quizzes, leaderboard, simulations, certificates, 
    rolePermissions, campaignEvents
  ]);



  // State Action Helpers (Backend Routed)

  // Audit Logs Actions
  const addAuditLog = (action, details) => {
    api.post('/audit-logs', { action, details }).then(() => {
      if (userRole === 'Security Administrator') {
        api.get('/audit-logs').then(res => setAuditLogs(res.data)).catch(console.error);
      }
    }).catch(console.error);
  };

  const addEmployee = async (employee) => {
    try {
      const response = await api.post('/employees', {
        name: employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
        password: employee.password,
        first_name: employee.first_name || employee.name?.split(' ')[0] || 'Unknown',
        last_name: employee.last_name || employee.name?.split(' ').slice(1).join(' ') || 'Employee',
        email: employee.email,
        department_id: employee.department_id || employee.department,
        job_title: employee.job_title || 'Specialist',
        status: employee.status || 'Active',
        risk_score: employee.risk_score || 30.0
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to add employee:", error);
      throw error;
    }
  };

  const editEmployee = async (id, updatedData) => {
    try {
      const response = await api.put(`/employees/${id}`, {
        first_name: updatedData.first_name || updatedData.name?.split(' ')[0] || 'Unknown',
        last_name: updatedData.last_name || updatedData.name?.split(' ').slice(1).join(' ') || 'Employee',
        department_id: updatedData.department_id || updatedData.department,
        job_title: updatedData.job_title || 'Specialist',
        status: updatedData.status || 'Active',
        risk_score: updatedData.risk_score || 30.0
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to edit employee:", error);
      throw error;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await api.delete(`/employees/${id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete employee:", error);
      throw error;
    }
  };

  // Department Actions
  const addDepartment = async (deptName, details = {}) => {
    try {
      const response = await api.post('/departments', {
        name: deptName,
        description: details.description || '',
        manager_id: details.manager_id || null,
        risk_score: details.riskScore || details.risk_score || 30,
        training_completion: details.completionPercentage || details.training_completion || 0
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to add department:", error);
      throw error;
    }
  };

  const editDepartment = async (id, updatedData) => {
    try {
      const response = await api.put(`/departments/${id}`, {
        name: updatedData.name,
        description: updatedData.description || '',
        manager_id: updatedData.manager_id || null,
        risk_score: updatedData.riskScore || updatedData.risk_score || 30,
        training_completion: updatedData.completionPercentage || updatedData.training_completion || 0
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to edit department:", error);
      throw error;
    }
  };

  const deleteDepartment = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete department:", error);
      throw error;
    }
  };

  // Campaigns Actions
  const addCampaign = async (campaign) => {
    try {
      const response = await api.post('/campaigns', {
        title: campaign.name || campaign.title,
        description: campaign.description || '',
        campaign_type: campaign.campaign_type || 'Awareness Email',
        status: campaign.status || 'Draft',
        target_department_id: campaign.target_department_id || null,
        template_id: campaign.template_id || null,
        scheduled_at: campaign.scheduled_at || null,
        employee_ids: campaign.employee_ids || []
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to add campaign:", error);
      throw error;
    }
  };

  const deleteCampaign = async (id) => {
    try {
      await api.delete(`/campaigns/${id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      throw error;
    }
  };

  const updateCampaignStatus = async (id, status) => {
    try {
      const response = await api.put(`/campaigns/${id}`, { status });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to update campaign status:", error);
      throw error;
    }
  };

  // Templates Actions
  const addTemplate = async (template) => {
    try {
      const response = await api.post('/email-templates', {
        name: template.name,
        subject: template.subject,
        sender_name: template.sender_name || 'System Notification',
        body: template.body,
        category: template.category,
        difficulty: template.difficulty
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to add template:", error);
      throw error;
    }
  };

  const editTemplate = async (id, template) => {
    try {
      const response = await api.put(`/email-templates/${id}`, {
        name: template.name,
        subject: template.subject,
        sender_name: template.sender_name || 'System Notification',
        body: template.body,
        category: template.category,
        difficulty: template.difficulty
      });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to edit template:", error);
      throw error;
    }
  };

  const deleteTemplate = async (id) => {
    try {
      await api.delete(`/email-templates/${id}`);
      await fetchData();
    } catch (error) {
      console.error("Failed to delete template:", error);
      throw error;
    }
  };

  // Report Email Actions
  const reportEmail = async (emailReport) => {
    try {
      const response = await api.post('/reported-emails', {
        employee_id: currentUser.employee_id,
        subject: emailReport.subject,
        sender: emailReport.sender || 'unknown@sender.com',
        status: 'Pending'
      });

      // Also update simulations list locally for current user
      const matchedSim = simulations.find(s => s.name.toLowerCase().includes(emailReport.subject.toLowerCase()) || emailReport.subject.toLowerCase().includes(s.name.toLowerCase()));
      if (matchedSim) {
        setSimulations(prev => prev.map(s => s.id === matchedSim.id ? { ...s, result: 'Reported' } : s));
      } else {
        const newSim = {
          id: Date.now(),
          name: emailReport.subject || "Reported suspicious email",
          date: new Date().toISOString().split('T')[0],
          result: "Reported",
          duration: "N/A",
          difficulty: "Medium",
          templateCategory: emailReport.reason || "Suspicious Link"
        };
        setSimulations(prev => [newSim, ...prev]);
      }

      // Boost user's security score
      setCurrentUser(prev => {
        const newScore = Math.min((prev.securityScore || 70) + 3, 100);
        return { ...prev, securityScore: newScore };
      });

      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to report email:", error);
      throw error;
    }
  };

  const resolveReportedEmail = async (id, status) => {
    try {
      const response = await api.put(`/reported-emails/${id}`, { status });
      await fetchData();
      return response.data;
    } catch (error) {
      console.error("Failed to resolve reported email:", error);
      throw error;
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      await fetchData();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`)));
      await fetchData();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };
  // Modules & Quizzes
  const addQuiz = (newQuiz) => {
    const formattedQuiz = {
      id: Date.now(),
      createdDate: new Date().toISOString().split('T')[0],
      ...newQuiz
    };
    setQuizzes(prev => [...prev, formattedQuiz]);
    addAuditLog("Create Quiz", `Published '${newQuiz.quizName}' quiz`);
  };

  const deleteQuiz = (id) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const addModule = (newModule) => {
    const formattedMod = {
      id: Date.now(),
      enrollmentCount: 0,
      completionStats: 0,
      isCompleted: false,
      progress: 0,
      locked: false,
      lessons: ["Introduction", "Key Indicators", "Case Study", "Knowledge Review"],
      ...newModule
    };
    setTrainingModules(prev => [...prev, formattedMod]);
    addAuditLog("Create Module", `Published '${newModule.name}' module`);
  };

  const deleteModule = (id) => {
    setTrainingModules(prev => prev.filter(m => m.id !== id));
  };

  const updateModuleProgress = (id, progress) => {
    setTrainingModules(prev => prev.map(m => {
      if (m.id === id) {
        const isCompleted = progress >= 100;
        return { ...m, progress, isCompleted };
      }
      return m;
    }));

    if (progress >= 100) {
      // Award certificate if not already earned
      const targetModule = trainingModules.find(m => m.id === id);
      if (targetModule && !certificates.some(c => c.courseName === targetModule.name)) {
        const newCert = {
          id: Date.now(),
          name: `${targetModule.name} Completion Certificate`,
          courseName: targetModule.name,
          dateEarned: new Date().toISOString().split('T')[0]
        };
        setCertificates(prev => [newCert, ...prev]);

        // Boost training progress rate
        setCurrentUser(prev => {
          const newScore = Math.min(prev.securityScore + 5, 100);
          return { ...prev, securityScore: newScore, trainingCompletion: Math.min(prev.trainingCompletion + 15, 100) };
        });
      }
    }
  };

  const updateProfile = (data) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
    addAuditLog("Update Profile", "Modified personal biography details");
  };

  // Roles & Permissions matrix state save
  const savePermissions = (updatedPermissions) => {
    setRolePermissions(updatedPermissions);
    addAuditLog("Modify Permissions", "Updated system role permission matrices");
  };

  // Campaign calendar schedule add
  const addCampaignEvent = (event) => {
    const newEvent = {
      id: Date.now(),
      status: "Scheduled",
      ...event
    };
    setCampaignEvents(prev => [...prev, newEvent]);
    addAuditLog("Schedule Campaign", `Scheduled campaign '${event.name}' for ${event.date}`);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      userRole,
      currentUser,
      employees,
      campaigns,
      emailTemplates,
      reportedEmails,
      notifications,
      trainingModules,
      quizzes,
      leaderboard,
      simulations,
      certificates,
      auditLogs,
      rolePermissions,
      campaignEvents,
      departments,
      login,
      employeeLogin,
      register,
      selectRole,
      logout,
      addEmployee,
      editEmployee,
      deleteEmployee,
      addDepartment,
      editDepartment,
      deleteDepartment,
      addCampaign,
      deleteCampaign,
      updateCampaignStatus,
      addTemplate,
      editTemplate,
      deleteTemplate,
      reportEmail,
      resolveReportedEmail,
      addQuiz,
      deleteQuiz,
      addModule,
      deleteModule,
      updateModuleProgress,
      updateProfile,
      savePermissions,
      addCampaignEvent,
      addAuditLog,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      fetchData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
