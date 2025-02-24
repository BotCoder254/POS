import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiUserPlus, 
  FiEdit2, 
  FiTrash2, 
  FiShoppingBag,
  FiSearch,
  FiX,
  FiPhone,
  FiMail,
  FiMapPin
} from 'react-icons/fi';
import { useCustomers } from '../../hooks/useCustomers';

export default function CustomerManagement() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view', 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    customers, 
    loading, 
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerPurchaseHistory
  } = useCustomers();

  const [purchaseHistory, setPurchaseHistory] = useState([]);

  const handleViewHistory = async (customer) => {
    setSelectedCustomer(customer);
    setModalMode('history');
    setIsModalOpen(true);
    try {
      const history = await getCustomerPurchaseHistory(customer.id);
      setPurchaseHistory(history);
    } catch (err) {
      console.error('Error fetching purchase history:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customerData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      address: formData.get('address'),
      searchTerms: [
        formData.get('name').toLowerCase(),
        formData.get('phone'),
        formData.get('email').toLowerCase()
      ]
    };

    try {
      if (modalMode === 'add') {
        await addCustomer(customerData);
      } else if (modalMode === 'edit') {
        await updateCustomer(selectedCustomer.id, customerData);
      }
      setIsModalOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Error saving customer:', err);
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(customerId);
      } catch (err) {
        console.error('Error deleting customer:', err);
      }
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setModalMode('add');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <FiUserPlus className="mr-2" />
          Add Customer
        </motion.button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customers..."
          className="pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{customer.name}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <FiPhone className="mr-2" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center text-gray-600 mt-1">
                      <FiMail className="mr-2" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center text-gray-600 mt-1">
                      <FiMapPin className="mr-2" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleViewHistory(customer)}
                    className="p-2 text-gray-600 hover:text-primary-600"
                  >
                    <FiShoppingBag />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setModalMode('edit');
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-600 hover:text-primary-600"
                  >
                    <FiEdit2 />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(customer.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                  >
                    <FiTrash2 />
                  </motion.button>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-medium">${customer.totalSpent?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Last Visit</span>
                  <span>
                    {customer.lastVisit?.toDate?.()?.toLocaleDateString() || 'Never'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg w-full max-w-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">
                  {modalMode === 'add' ? 'Add Customer' : 
                   modalMode === 'edit' ? 'Edit Customer' :
                   modalMode === 'history' ? 'Purchase History' : 'View Customer'}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedCustomer(null);
                    setPurchaseHistory([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              </div>

              {modalMode === 'history' ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {purchaseHistory.map(transaction => (
                      <div key={transaction.id} className="border-b pb-4">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Order #{transaction.id.slice(-5)}</span>
                          <span>{transaction.timestamp?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>
                        </div>
                        <div className="space-y-2">
                          {transaction.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 font-medium">
                          <span>Total</span>
                          <span>${transaction.total?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    ))}
                    {purchaseHistory.length === 0 && (
                      <div className="text-center text-gray-500">
                        No purchase history found
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={selectedCustomer?.name}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      defaultValue={selectedCustomer?.phone}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={selectedCustomer?.email}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      name="address"
                      rows="3"
                      defaultValue={selectedCustomer?.address}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedCustomer(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      {modalMode === 'add' ? 'Add Customer' : 'Save Changes'}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 