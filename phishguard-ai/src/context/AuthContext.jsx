import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('pg_auth') === 'true';
  });
  
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('pg_role') || 'Employee';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pg_user');
    return saved ? JSON.parse(saved) : {
      name: 'Alex Chen',
      email: 'employee@phintra.com',
      role: 'Employee',
      department: 'Finance',
      streakDays: 4,
      securityScore: 78
    };
  });

  // Map backend roles (Admin, Manager, Employee) to frontend UI expected roles
  const mapBackendRoleToFrontend = (role) => {
    if (role === 'Admin') return 'Security Administrator';
    if (role === 'Manager') return 'Security Manager';
    return 'Employee';
  };

  const mapFrontendRoleToBackend = (role) => {
    if (role === 'Security Administrator') return 'Admin';
    if (role === 'Security Manager') return 'Manager';
    return 'Employee';
  };

  // On mount: validate existing token
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('pg_token');
      if (!token) {
        logout();
        return;
      }
      try {
        const response = await api.get('/auth/validate');
        if (response.data.valid) {
          // Fetch complete profile details to keep frontend state sync'd
          const profileResponse = await api.get('/auth/me/profile');
          const profile = profileResponse.data;
          const mappedRole = mapBackendRoleToFrontend(profile.role);
          
          setIsAuthenticated(true);
          setUserRole(mappedRole);
          setCurrentUser({
            employee_id: profile.employee_id,
            name: profile.name,
            email: profile.email,
            role: mappedRole,
            department: profile.department,
            streakDays: 4,
            securityScore: profile.personal_score
          });
          
          localStorage.setItem('pg_auth', 'true');
          localStorage.setItem('pg_role', mappedRole);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Session token validation failed:", error);
        logout();
      }
    };

    validateToken();
  }, []);

  // Persist auth status to local storage
  useEffect(() => {
    localStorage.setItem('pg_auth', isAuthenticated);
    localStorage.setItem('pg_role', userRole);
    localStorage.setItem('pg_user', JSON.stringify(currentUser));
  }, [isAuthenticated, userRole, currentUser]);

  const login = async (email, password) => {
    try {
      // /auth/login uses OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', email.trim());
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      localStorage.setItem('pg_token', access_token);

      // Fetch user profile info
      const profileResponse = await api.get('/auth/me/profile');
      const profile = profileResponse.data;
      const mappedRole = mapBackendRoleToFrontend(profile.role);

      setIsAuthenticated(true);
      setUserRole(mappedRole);
      setCurrentUser({
        employee_id: profile.employee_id,
        name: profile.name,
        email: profile.email,
        role: mappedRole,
        department: profile.department,
        streakDays: 4,
        securityScore: profile.personal_score
      });

      return { success: true, role: mappedRole };
    } catch (error) {
      console.error("Login failure:", error);
      const errMsg = error.response?.data?.detail || 'Incorrect credentials or server connection failed.';
      return { success: false, message: errMsg };
    }
  };

  const employeeLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/employee-login', {
        email: email.trim(),
        password: password
      });

      const { access_token, employee } = response.data;
      localStorage.setItem('pg_token', access_token);

      const mappedRole = 'Employee';

      setIsAuthenticated(true);
      setUserRole(mappedRole);
      setCurrentUser({
        employee_id: employee.employee_id || employee.id,
        name: employee.name,
        email: employee.email,
        role: mappedRole,
        department: employee.department,
        streakDays: 4,
        securityScore: employee.personal_score || 80
      });

      return { success: true, role: mappedRole };
    } catch (error) {
      console.error("Employee login failure:", error);
      const errMsg = error.response?.data?.detail || 'Incorrect credentials or server connection failed.';
      return { success: false, message: errMsg };
    }
  };

  const register = async (name, email, companyName, password, companySize = '', industry = '') => {
    try {
      await api.post('/auth/register', {
        full_name: name,
        email: email.trim(),
        company_name: companyName,
        password: password,
        company_size: companySize || null,
        industry: industry || null
      });
      return { success: true };
    } catch (error) {
      console.error("[DEBUG] Registration failure. Full Axios error response:", error.response || error);
      const errMsg = error.response?.data?.detail || 'Registration failed. Please check inputs.';
      return { success: false, message: errMsg };
    }
  };

  const selectRole = (role) => {
    setUserRole(role);
    setCurrentUser(prev => ({ ...prev, role }));
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('pg_token');
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      console.warn("Logout notification to server failed:", e);
    }
    
    setIsAuthenticated(false);
    setUserRole('Employee');
    localStorage.removeItem('pg_token');
    localStorage.removeItem('pg_auth');
    localStorage.removeItem('pg_role');
    localStorage.removeItem('pg_user');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userRole,
      currentUser,
      login,
      employeeLogin,
      register,
      selectRole,
      logout,
      setCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
