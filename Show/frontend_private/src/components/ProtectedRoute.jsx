// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth();

  // ✅ Pendant le chargement
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Chargement...
      </div>
    );
  }

  // ✅ Non connecté
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Admin requis mais pas admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;