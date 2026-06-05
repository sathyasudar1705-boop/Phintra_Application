import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAppContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'Security Administrator') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'Security Manager') {
      return <Navigate to="/admin/manager-dashboard" replace />;
    } else {
      return <Navigate to="/user/home" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
