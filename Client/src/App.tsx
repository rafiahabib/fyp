import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ExpenseTracking from './pages/ExpenseTracking';
import CommitteePage from './pages/Committee';
import CreateCommittee from './pages/CreateCommittee';
import JoinCommittee from './pages/JoinCommittee';
import CommitteeDetail from './pages/CommitteeDetail';
import Settings from './pages/Settings';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<ExpenseTracking />} />
            <Route path="/committee" element={<CommitteePage />} />
            <Route path="/committee/join" element={<JoinCommittee />} />
            <Route path="/committee/:id" element={<CommitteeDetail />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/committee/create" element={<CreateCommittee />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </Router>
  );
}

export default App;