import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiMenu,
  FiX,
  FiHome,
  FiShoppingCart,
  FiBox,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiDollarSign,
  FiClock,
  FiPrinter,
  FiPackage,
  FiList,
} from 'react-icons/fi';

// CashierNavBar Component
const CashierNavBar = () => {
  const location = useLocation();
  const { userRole } = useAuth();

  // Only render if user is a cashier
  if (userRole !== 'cashier') return null;

  const navItems = [
    { icon: FiHome, title: 'Overview', path: '/dashboard' },
    { icon: FiShoppingCart, title: 'New Sale', path: '/dashboard/new-sale' },
    { icon: FiUsers, title: 'Customers', path: '/dashboard/customers' },
    { icon: FiClock, title: "Today's Sales", path: '/dashboard/todays-sales' },
  ];

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <nav className="flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                  location.pathname === item.path
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-2 ${
                  location.pathname === item.path ? 'text-primary-600' : 'text-gray-400'
                }`} />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

// Header Component Definition
const Header = ({ onToggleSidebar, userRole }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {userRole === 'manager' ? (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          ) : (
            <div className="text-xl font-bold text-primary-600">POS System</div>
          )}

          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{currentUser?.email}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      <CashierNavBar />
    </>
  );
};

// Navigation items array for manager
const navigationItems = [
  { icon: FiHome, title: 'Overview', path: '/dashboard', roles: ['manager'], description: 'Dashboard overview' },
  { icon: FiShoppingCart, title: 'New Sale', path: '/dashboard/new-sale', roles: ['manager'], description: 'Create a new sale' },
  { icon: FiUsers, title: 'Customer Management', path: '/dashboard/customers', roles: ['manager'], description: 'Manage customers' },
  { icon: FiClock, title: "Today's Sales", path: '/dashboard/todays-sales', roles: ['manager'], description: "View today's transactions" },
  { icon: FiPackage, title: 'Inventory Management', path: '/dashboard/inventory', roles: ['manager'], description: 'Manage inventory' },
  { icon: FiDollarSign, title: 'Sales History', path: '/dashboard/sales-history', roles: ['manager'], description: 'View sales history' },
  { icon: FiBarChart2, title: 'Analytics', path: '/dashboard/analytics', roles: ['manager'], description: 'View analytics' },
  { icon: FiUsers, title: 'User Management', path: '/dashboard/users', roles: ['manager'], description: 'Manage users' }
];

export default function DashboardLayout() {
  const { currentUser, userRole, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!userRole) {
    console.log('No user role detected');
    return <div>Loading...</div>;
  }

  console.log('Current user role:', userRole);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Only show for manager */}
      <AnimatePresence>
        {userRole === 'manager' && isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="bg-white w-64 min-h-screen shadow-lg relative"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 flex-grow">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-600">POS System</h2>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-2">
                  {navigationItems
                    .filter(item => item.roles.includes(userRole?.toLowerCase()))
                    .map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                            isActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                          }`}
                        >
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                </nav>
              </div>

              <div className="p-4 border-t">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} userRole={userRole} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 