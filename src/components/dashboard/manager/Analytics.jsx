import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiBox,
  FiDownload,
  FiDollarSign,
  FiShoppingBag,
  FiPackage
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAnalytics } from '../../../hooks/useAnalytics';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const TimeRangeSelector = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
  >
    <option value={7}>Last 7 Days</option>
    <option value={30}>Last 30 Days</option>
    <option value={90}>Last 3 Months</option>
    <option value={180}>Last 6 Months</option>
  </select>
);

const IntervalSelector = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
  >
    <option value="hourly">Hourly</option>
    <option value="daily">Daily</option>
    <option value="weekly">Weekly</option>
    <option value="monthly">Monthly</option>
  </select>
);

const StatCard = ({ title, value, icon: Icon, trend }) => (
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

const calculateTotalRevenue = (trends) => {
  if (!trends || !trends.length) return '0.00';
  return trends.reduce((sum, t) => {
    const total = typeof t.total === 'number' ? t.total : parseFloat(t.total) || 0;
    return sum + total;
  }, 0).toFixed(2);
};

const calculateTotalTransactions = (trends) => {
  if (!trends || !trends.length) return '0';
  return trends.length.toString();
};

const calculateTotalItems = (trends) => {
  if (!trends || !trends.length) return '0';
  return trends.reduce((sum, t) => {
    const items = typeof t.items === 'number' ? t.items : parseFloat(t.items) || 0;
    return sum + items;
  }, 0).toString();
};

const calculateAverageTransaction = (trends) => {
  if (!trends || !trends.length) return '0.00';
  const total = trends.reduce((sum, t) => {
    const total = typeof t.total === 'number' ? t.total : parseFloat(t.total) || 0;
    return sum + total;
  }, 0);
  return (total / trends.length).toFixed(2);
};

export default function Analytics() {
  const [timeRange, setTimeRange] = useState(30);
  const [interval, setInterval] = useState('daily');
  const { salesData, loading, error, getProductPerformance, getCashierPerformance, getSalesTrends } = useAnalytics();
  const [trends, setTrends] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [cashierStats, setCashierStats] = useState([]);

  useEffect(() => {
    if (!loading && salesData.length > 0) {
      setTrends(getSalesTrends(interval, timeRange));
      setProductStats(getProductPerformance(timeRange));
      setCashierStats(getCashierPerformance(timeRange));
    }
  }, [loading, salesData, interval, timeRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-600 p-6 rounded-lg shadow-lg text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
            <p className="mt-1 text-primary-100">Track your business performance</p>
          </div>
          <div className="flex space-x-4">
            <div className="w-48">
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </div>
            <div className="w-48">
              <IntervalSelector value={interval} onChange={setInterval} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${calculateTotalRevenue(trends)}`}
          icon={FiDollarSign}
        />
        <StatCard
          title="Total Transactions"
          value={calculateTotalTransactions(trends)}
          icon={FiShoppingBag}
        />
        <StatCard
          title="Total Items Sold"
          value={calculateTotalItems(trends)}
          icon={FiPackage}
        />
        <StatCard
          title="Average Transaction"
          value={`$${calculateAverageTransaction(trends)}`}
          icon={FiTrendingUp}
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
              <AreaChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0ea5e9"
                  fill="#e0f2fe"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Product Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">Top Products</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productStats.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cashier Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">Cashier Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cashierStats}
                  dataKey="totalSales"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {cashierStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Transaction Details</h3>
            <button
              onClick={() => {/* Handle export */}}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <FiDownload className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
          <div className="space-y-4">
            {trends.slice(0, 5).map((trend, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{trend.label}</p>
                  <p className="text-sm text-gray-500">{trend.transactions || 0} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${typeof trend.total === 'number' ? trend.total.toFixed(2) : (parseFloat(trend.total) || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">{trend.items || 0} items</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}