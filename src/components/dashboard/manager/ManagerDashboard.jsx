import { motion } from 'framer-motion';
import { FiDollarSign, FiPackage, FiUsers, FiTrendingUp } from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useState } from 'react';
import { useTransactions, useInventoryLevels, useEmployeeStats, useSalesAnalytics } from '../../../hooks/useFirestoreData.jsx';
import InventoryManagement from '../../inventory/InventoryManagement';

const StatCard = ({ icon: Icon, title, value, trend }) => (
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
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      <div className="bg-primary-50 p-4 rounded-full">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
    </div>
  </motion.div>
);

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'inventory'
  const { transactions } = useTransactions(5);
  const { inventory } = useInventoryLevels();
  const { employees } = useEmployeeStats();
  const { analytics: salesData } = useSalesAnalytics('weekly');

  // Calculate total revenue
  const totalRevenue = transactions.reduce((sum, t) => {
    const total = typeof t.total === 'number' ? t.total : 0;
    return sum + total;
  }, 0);
  
  // Get low stock items
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);

  // Calculate total employees
  const totalEmployees = employees.length;

  // Calculate average order value
  const averageOrder = transactions.length > 0 
    ? totalRevenue / transactions.length 
    : 0;

  // Format inventory data for chart
  const inventoryData = inventory
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map(item => ({
      name: item.name,
      value: item.quantity
    }));

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`${
              activeTab === 'inventory'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Inventory
          </button>
        </nav>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={FiDollarSign}
              title="Total Revenue"
              value={`$${totalRevenue.toFixed(2)}`}
              trend={12}
            />
            <StatCard
              icon={FiPackage}
              title="Low Stock Items"
              value={lowStockItems.length}
              trend={lowStockItems.length > 5 ? -20 : 0}
            />
            <StatCard
              icon={FiUsers}
              title="Total Employees"
              value={totalEmployees}
            />
            <StatCard
              icon={FiTrendingUp}
              title="Average Order"
              value={`$${averageOrder.toFixed(2)}`}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#0ea5e9"
                      fill="#e0f2fe"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Inventory Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Inventory Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {transactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">New Sale</p>
                    <p className="text-sm text-gray-500">Order #{transaction.id.slice(-5)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${typeof transaction.total === 'number' ? transaction.total.toFixed(2) : '0.00'}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.timestamp?.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      ) : (
        <InventoryManagement />
      )}
    </div>
  );
} 