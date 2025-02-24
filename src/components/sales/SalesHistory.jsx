import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiDownload, 
  FiFilter, 
  FiCalendar, 
  FiUser, 
  FiCreditCard,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiPrinter,
  FiMail
} from 'react-icons/fi';
import { useSales } from '../../hooks/useSales';
import { useAuth } from '../../contexts/AuthContext';

export default function SalesHistory() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  });
  const [cashier, setCashier] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [loading, setLoading] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { transactions, getFilteredTransactions, emailReceipt, printReceipt } = useSales();
  const { userRole } = useAuth();

  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const fetchFilteredTransactions = async () => {
      setLoading(true);
      try {
        const filters = {
          startDate,
          endDate,
          cashier: cashier !== 'all' ? cashier : null,
          paymentMethod: paymentMethod !== 'all' ? paymentMethod : null
        };
        const results = await getFilteredTransactions(filters);
        
        // Apply search filter locally
        const filtered = results.filter(transaction => 
          transaction.items.some(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          transaction.cashierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setFilteredTransactions(filtered);
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredTransactions();
  }, [startDate, endDate, cashier, paymentMethod, searchQuery]);

  const exportData = () => {
    const headers = [
      'Date',
      'Transaction ID',
      'Cashier',
      'Customer',
      'Payment Method',
      'Subtotal',
      'Tax',
      'Discount',
      'Total',
      'Items'
    ];

    const csvData = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        new Date(t.timestamp).toLocaleDateString(),
        t.id,
        t.cashierName,
        t.customer?.name || 'Guest',
        t.paymentMethod,
        (typeof t.subtotal === 'number' ? t.subtotal : parseFloat(t.subtotal) || 0).toFixed(2),
        (typeof t.tax === 'number' ? t.tax : parseFloat(t.tax) || 0).toFixed(2),
        (typeof t.discount === 'number' ? t.discount : parseFloat(t.discount) || 0).toFixed(2),
        (typeof t.total === 'number' ? t.total : parseFloat(t.total) || 0).toFixed(2),
        t.items.map(item => `${item.quantity}x ${item.name}`).join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_history_${new Date().toISOString()}.csv`;
    link.click();
  };

  const calculateTotals = () => {
    return filteredTransactions.reduce((acc, t) => ({
      sales: acc.sales + 1,
      revenue: acc.revenue + (typeof t.total === 'number' ? t.total : parseFloat(t.total) || 0),
      items: acc.items + t.items.reduce((sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0), 0)
    }), { sales: 0, revenue: 0, items: 0 });
  };

  const handlePrint = async (transactionId) => {
    try {
      await printReceipt(transactionId);
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
  };

  const handleEmail = async (transactionId, customerEmail) => {
    if (!customerEmail) {
      alert('No customer email available');
      return;
    }
    try {
      await emailReceipt(transactionId, customerEmail);
    } catch (error) {
      console.error('Error emailing receipt:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sales History</h1>
        <button
          onClick={exportData}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <FiDownload className="w-5 h-5 mr-2" />
          Export to CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiCalendar className="inline mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiCalendar className="inline mr-2" />
              End Date
            </label>
            <input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiUser className="inline mr-2" />
              Cashier
            </label>
            <select
              value={cashier}
              onChange={(e) => setCashier(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Cashiers</option>
              {/* Add cashier options dynamically */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiCreditCard className="inline mr-2" />
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="digital">Digital Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiSearch className="inline mr-2" />
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(calculateTotals()).map(([key, value]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h3 className="text-sm font-medium text-gray-500 uppercase">
              {key === 'sales' ? 'Total Sales' :
               key === 'revenue' ? 'Total Revenue' : 'Items Sold'}
            </h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {key === 'revenue' ? `$${(typeof value === 'number' ? value : parseFloat(value) || 0).toFixed(2)}` : value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cashier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(transaction => (
                  <>
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedTransaction(
                        expandedTransaction === transaction.id ? null : transaction.id
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.cashierName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.customer?.name || 'Guest'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {transaction.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(typeof transaction.total === 'number' ? transaction.total : parseFloat(transaction.total) || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrint(transaction.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FiPrinter className="w-5 h-5" />
                          </button>
                          {transaction.customer?.email && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmail(transaction.id, transaction.customer.email);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <FiMail className="w-5 h-5" />
                            </button>
                          )}
                          {expandedTransaction === transaction.id ? (
                            <FiChevronUp className="w-5 h-5" />
                          ) : (
                            <FiChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                    {expandedTransaction === transaction.id && (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td colSpan="6" className="px-6 py-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Items</h4>
                            <div className="space-y-2">
                              {transaction.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>${((typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0) * 
                                          (typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity) || 0)).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>${(typeof transaction.subtotal === 'number' ? transaction.subtotal : parseFloat(transaction.subtotal) || 0).toFixed(2)}</span>
                              </div>
                              {transaction.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Discount ({transaction.discountPercent}%)</span>
                                  <span>-${(typeof transaction.discount === 'number' ? transaction.discount : parseFloat(transaction.discount) || 0).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span>Tax (10%)</span>
                                <span>${(typeof transaction.tax === 'number' ? transaction.tax : parseFloat(transaction.tax) || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>${(typeof transaction.total === 'number' ? transaction.total : parseFloat(transaction.total) || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 