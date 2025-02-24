import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPrinter, FiMail, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useSales } from '../../hooks/useSales';
import { useAuth } from '../../contexts/AuthContext';

export default function TodaysSales() {
  const { transactions, loading, error, emailReceipt, printReceipt } = useSales();
  const [todaysTransactions, setTodaysTransactions] = useState([]);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate >= today && transaction.cashierId === currentUser.uid;
    });

    setTodaysTransactions(filtered);
  }, [transactions, currentUser.uid]);

  const calculateTotals = () => {
    return todaysTransactions.reduce((acc, t) => ({
      sales: acc.sales + 1,
      revenue: acc.revenue + t.total,
      items: acc.items + t.items.reduce((sum, item) => sum + item.quantity, 0)
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
      <h1 className="text-2xl font-semibold text-gray-900">Today's Sales</h1>

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
              {key === 'revenue' ? `$${value.toFixed(2)}` : value}
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
                  Time
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
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : todaysTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No transactions today
                  </td>
                </tr>
              ) : (
                todaysTransactions.map(transaction => (
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
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.customer?.name || 'Guest'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {transaction.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${transaction.total.toFixed(2)}
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
                        <td colSpan="5" className="px-6 py-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Items</h4>
                            <div className="space-y-2">
                              {transaction.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between text-sm"
                                >
                                  <span>
                                    {item.quantity}x {item.name}
                                  </span>
                                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>${transaction.subtotal.toFixed(2)}</span>
                              </div>
                              {transaction.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Discount ({transaction.discountPercent}%)</span>
                                  <span>-${transaction.discount.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span>Tax (10%)</span>
                                <span>${transaction.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>${transaction.total.toFixed(2)}</span>
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