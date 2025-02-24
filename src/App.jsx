import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login.jsx';
import Signup from './components/auth/Signup.jsx';
import PasswordReset from './components/auth/PasswordReset.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import NewSale from './components/sales/NewSale.jsx';
import SalesHistory from './components/sales/SalesHistory.jsx';
import TodaysSales from './components/sales/TodaysSales.jsx';
import LandingPage from './components/LandingPage.jsx';
import UserManagement from './components/dashboard/manager/UserManagement';
import Analytics from './components/dashboard/manager/Analytics';
import CustomerManagement from './components/customers/CustomerManagement';
import InventoryManagement from './components/inventory/InventoryManagement';
import DashboardLayout from './components/dashboard/DashboardLayout';

function PrivateRoute({ children, roles }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(userRole)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return !currentUser ? children : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><PasswordReset /></PublicRoute>} />
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="new-sale" element={<NewSale />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="inventory" element={<PrivateRoute roles={['manager']}><InventoryManagement /></PrivateRoute>} />
          <Route path="sales-history" element={<PrivateRoute roles={['manager']}><SalesHistory /></PrivateRoute>} />
          <Route path="todays-sales" element={<TodaysSales />} />
          <Route path="analytics" element={<PrivateRoute roles={['manager']}><Analytics /></PrivateRoute>} />
          <Route path="users" element={<PrivateRoute roles={['manager']}><UserManagement /></PrivateRoute>} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}