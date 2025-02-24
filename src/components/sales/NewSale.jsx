import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiPlus, 
  FiMinus, 
  FiTrash2, 
  FiPrinter, 
  FiMail, 
  FiUserPlus, 
  FiX, 
  FiUser,
  FiShoppingCart,
  FiDollarSign,
  FiCreditCard
} from 'react-icons/fi';
import { useSales } from '../../hooks/useSales';
import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts';
import { auth } from '../../config/firebase';

export default function NewSale() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);

  const { customers, addCustomer } = useCustomers();
  const { addTransaction, emailReceipt, printReceipt } = useSales();
  const { products, searchProducts } = useProducts();

  useEffect(() => {
    const searchProductsDebounced = setTimeout(async () => {
      if (searchQuery.trim()) {
        const results = await searchProducts(searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchProductsDebounced);
  }, [searchQuery]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = subtotal * (discountPercent / 100);
    const tax = (subtotal - discount) * 0.1; // 10% tax
    return {
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax
    };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const totals = calculateTotal();
      const transactionData = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        ...totals,
        paymentMethod,
        discountPercent,
        cashierId: auth.currentUser.uid,
        cashierName: auth.currentUser.displayName
      };

      const transaction = await addTransaction(transactionData, selectedCustomer);

      // Print or email receipt based on customer preference
      if (selectedCustomer?.email) {
        await emailReceipt(transaction.id, selectedCustomer.email);
      } else {
        await printReceipt(transaction.id);
      }

      // Clear the cart and customer selection
      setCart([]);
      setSelectedCustomer(null);
      setDiscountPercent(0);
      
      // Show success message
      alert('Sale completed successfully!');
    } catch (err) {
      console.error('Error processing sale:', err);
      alert('Error processing sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.phone?.includes(customerSearchQuery) ||
    customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  const handleAddCustomer = async (e) => {
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
      const newCustomer = await addCustomer(customerData);
      setSelectedCustomer(newCustomer);
      setIsCustomerModalOpen(false);
    } catch (err) {
      console.error('Error adding customer:', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Customer Selection Section */}
      <div className="bg-white p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selectedCustomer ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{selectedCustomer.name}</div>
                  <div className="text-sm text-gray-600">{selectedCustomer.phone}</div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <FiUser className="mr-2" />
                Select Customer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Products Section */}
        <div className="w-2/3 p-4 border-r">
          <div className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {(searchQuery ? searchResults : products).map(product => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-4 rounded-lg shadow-sm cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-gray-600">${product.price.toFixed(2)}</p>
                  {product.stock < 10 && (
                    <p className="text-sm text-red-500">Low stock: {product.stock}</p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-1/3 p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Cart</h2>
          
          <div className="space-y-4 mb-4">
            <AnimatePresence>
              {cart.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-600">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${calculateTotal().subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-${calculateTotal().discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span>${calculateTotal().tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${calculateTotal().total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="digital">Digital Payment</option>
              </select>

              <div className="flex space-x-2">
                <button
                  onClick={() => printReceipt()}
                  className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <FiPrinter className="w-5 h-5 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => emailReceipt()}
                  className="flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <FiMail className="w-5 h-5 mr-2" />
                  Email
                </button>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || loading}
                className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      <AnimatePresence>
        {isCustomerModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg w-full max-w-2xl"
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Select Customer</h3>
                  <button
                    onClick={() => setIsCustomerModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                </div>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    placeholder="Search customers..."
                    className="pl-10 w-full rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto p-6">
                <div className="space-y-4">
                  {filteredCustomers.map(customer => (
                    <motion.div
                      key={customer.id}
                      whileHover={{ scale: 1.01 }}
                      className="p-4 border rounded-lg cursor-pointer hover:border-primary-500"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsCustomerModalOpen(false);
                      }}
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.phone}</div>
                      {customer.email && (
                        <div className="text-sm text-gray-600">{customer.email}</div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      // Handle new customer form
                    }}
                    className="flex items-center text-primary-600 hover:text-primary-700"
                  >
                    <FiUserPlus className="mr-2" />
                    Add New Customer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 