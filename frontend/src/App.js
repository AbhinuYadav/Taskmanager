import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Members from './pages/Members';
import MyTasks from './pages/MyTasks';
import TaskDetails from './pages/TaskDetails';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = ['admin', 'member'] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="container-fluid px-0">
        <Routes>
          {/* Public Routes - ORDER MATTERS! Put more specific routes first */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Dashboard - Role Based */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {user?.role === 'admin' ? <AdminDashboard /> : <MemberDashboard />}
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Only Routes */}
          <Route 
            path="/projects" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Projects />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/projects/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProjectDetails />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/members" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Members />
              </ProtectedRoute>
            } 
          />
          
          {/* Member Only Routes */}
          <Route 
            path="/my-tasks" 
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MyTasks />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared Routes (Both Admin and Member can access) */}
          <Route 
            path="/tasks/:id" 
            element={
              <ProtectedRoute>
                <TaskDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Not Found - This should be last */}
          <Route 
            path="*" 
            element={
              <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                  <h1 className="display-1 text-muted">404</h1>
                  <p className="lead">Page not found</p>
                  <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;