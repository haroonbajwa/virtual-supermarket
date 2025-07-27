import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Store from './components/Store';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import StoreView from './pages/StoreView';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/owner'} replace />;
  }
  
  return children;
};

const StoreWrapper = () => {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      <Store isEditMode={user?.role === 'admin' || user?.role === 'owner'} />
    </ProtectedRoute>
  );
};

const StoreViewWrapper = () => {
  return (
    <Store isEditMode={false} />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/owner" element={
            <ProtectedRoute requiredRole="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/builder/:layoutId" element={<StoreWrapper />} />
          <Route path="/view/:layoutId" element={<StoreViewWrapper />} />
          <Route path="/stores" element={<StoreView />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
