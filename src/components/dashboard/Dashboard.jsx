import { useAuth } from '../../contexts/AuthContext';
import ManagerDashboard from './manager/ManagerDashboard';
import CashierDashboard from './cashier/CashierDashboard';

export default function Dashboard() {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return userRole === 'manager' ? <ManagerDashboard /> : <CashierDashboard />;
} 