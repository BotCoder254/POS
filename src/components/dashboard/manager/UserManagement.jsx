import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUserPlus, FiEdit2, FiTrash2, FiActivity, FiKey } from 'react-icons/fi';
import { useUsers } from '../../../hooks/useUsers';
import { useAuth } from '../../../contexts/AuthContext';
import DashboardLayout from '../DashboardLayout';

const UserCard = ({ user, onEdit, onDelete, onViewActivity, onResetPassword }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white p-6 rounded-lg shadow-sm"
  >
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold">{user.name || 'Unnamed User'}</h3>
        <p className="text-gray-500">{user.email}</p>
        <p className={`text-sm mt-1 ${
          (user.role || '').toLowerCase() === 'manager' ? 'text-primary-600' : 'text-secondary-600'
        }`}>
          {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'No Role'}
        </p>
      </div>
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onEdit(user)}
          className="p-2 text-gray-600 hover:text-primary-600"
        >
          <FiEdit2 />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onViewActivity(user)}
          className="p-2 text-gray-600 hover:text-primary-600"
        >
          <FiActivity />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onResetPassword(user)}
          className="p-2 text-gray-600 hover:text-primary-600"
        >
          <FiKey />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(user)}
          className="p-2 text-gray-600 hover:text-red-600"
        >
          <FiTrash2 />
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'cashier'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-sm space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>
      {!user && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            required={!user}
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="cashier">Cashier</option>
          <option value="manager">Manager</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
        >
          {user ? 'Update User' : 'Add User'}
        </button>
      </div>
    </motion.form>
  );
};

const ActivityLog = ({ activities, onClose }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="bg-white p-6 rounded-lg shadow-sm"
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Activity Log</h3>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
    </div>
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="border-b pb-2">
          <p className="font-medium">{activity.action}</p>
          <p className="text-sm text-gray-500">{activity.details}</p>
          <p className="text-xs text-gray-400">
            {activity.timestamp.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  </motion.div>
);

export default function UserManagement() {
  const { users, loading, error, addUser, updateUser, deleteUser } = useUsers();
  const { currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activities, setActivities] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddUser = async (userData) => {
    try {
      await addUser(userData);
      setShowForm(false);
      setSuccessMessage('User added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await updateUser(selectedUser.id, userData);
      setSelectedUser(null);
      setShowForm(false);
      setSuccessMessage('User updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await deleteUser(user.id, user.uid);
        setSuccessMessage('User deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleViewActivity = async (user) => {
    try {
      const userActivities = await getUserActivity(user.id);
      setActivities(userActivities);
    } catch (err) {
      console.error('Error fetching user activities:', err);
    }
  };

  const handleResetPassword = async (user) => {
    try {
      await resetUserPassword(user.email);
      setSuccessMessage('Password reset email sent!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error resetting password:', err);
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-600 p-6 rounded-lg shadow-lg text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">User Management</h2>
            <p className="mt-1 text-primary-100">Manage your team members and their roles</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedUser(null);
              setShowForm(true);
            }}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center space-x-2"
          >
            <FiUserPlus />
            <span>Add User</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Form or List */}
      <AnimatePresence mode="wait">
        {showForm ? (
          <UserForm
            key="form"
            user={selectedUser}
            onSubmit={selectedUser ? handleUpdateUser : handleAddUser}
            onCancel={() => {
              setSelectedUser(null);
              setShowForm(false);
            }}
          />
        ) : (
          <motion.div
            key="list"
            className="space-y-4"
          >
            <AnimatePresence>
              {users.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={(user) => {
                    setSelectedUser(user);
                    setShowForm(true);
                  }}
                  onDelete={handleDeleteUser}
                  onViewActivity={handleViewActivity}
                  onResetPassword={handleResetPassword}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Log Modal */}
      <AnimatePresence>
        {activities && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <ActivityLog
              activities={activities}
              onClose={() => setActivities(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  return content;
} 