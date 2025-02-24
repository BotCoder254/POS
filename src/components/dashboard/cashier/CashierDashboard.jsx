import { motion } from 'framer-motion';
import { FiShoppingCart, FiClock, FiDollarSign, FiUsers, FiPackage } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTransactions, useDailySales } from '../../../hooks/useFirestoreData';

const QuickStatCard = ({ icon: Icon, title, value, trend }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-lg shadow-sm"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>
        {trend !== undefined && (
          <p className={`text-sm mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
          </p>
        )}
      </div>
      <div className="bg-primary-50 p-4 rounded-full">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
    </div>
  </motion.div>
);

const QuickActionCard = ({ icon: Icon, title, description, to }) => (
  <Link
    to={to}
    className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center space-x-4">
      <div className="bg-primary-50 p-3 rounded-full">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </Link>
);

export default function CashierDashboard() {
  const { transactions } = useTransactions(5);
  const { salesData: todaysSales } = useDailySales();

  const totalSales = todaysSales?.length || 0;
  const totalRevenue = todaysSales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;
  const totalItems = todaysSales?.reduce((sum, sale) => sum + (sale.items?.length || 0), 0) || 0;

  const quickActions = [
    {
      icon: FiShoppingCart,
      title: 'New Sale',
      description: 'Start a new transaction',
      to: '/dashboard/new-sale'
    },
    {
      icon: FiUsers,
      title: 'Customers',
      description: 'Manage customer information',
      to: '/dashboard/customers'
    },
    {
      icon: FiClock,
      title: "Today's Sales",
      description: 'View today\'s transactions',
      to: '/dashboard/todays-sales'
    },
    {
      icon: FiDollarSign,
      title: 'Sales History',
      description: 'View past transactions',
      to: '/dashboard/sales-history'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-600 text-white p-6 rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="mt-1 text-primary-100">Here's an overview of today's activity</p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickStatCard
          icon={FiShoppingCart}
          title="Today's Sales"
          value={totalSales}
          trend={10}
        />
        <QuickStatCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          trend={15}
        />
        <QuickStatCard
          icon={FiPackage}
          title="Items Sold"
          value={totalItems}
          trend={5}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">Order #{transaction.id.slice(-5)}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.timestamp?.toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${transaction.total?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.items?.length || 0} items
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Helpful Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
          <div className="space-y-2">
            <p className="text-gray-600">• Press F2 for new sale</p>
            <p className="text-gray-600">• Press F3 to view last transaction</p>
            <p className="text-gray-600">• Press F4 to void transaction</p>
            <p className="text-gray-600">• Press ESC to clear current entry</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
          <p className="text-gray-600">
            If you need assistance with any transaction or have questions about the system,
            please contact your manager or refer to the help documentation.
          </p>
        </motion.div>
      </div>
    </div>
  );
}