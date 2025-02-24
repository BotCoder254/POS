import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUpload,
  FiDownload,
  FiX,
  FiImage,
  FiAlertCircle
} from 'react-icons/fi';
import { useInventory } from '../../hooks/useInventory';

const ProductCard = ({ product, onEdit, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white p-6 rounded-lg shadow-sm"
  >
    <div className="relative">
      {product.images && product.images.length > 0 && (
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover rounded-lg"
          />
        </div>
      )}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-gray-500">${product.price.toFixed(2)}</p>
          <p className="text-sm mt-1 capitalize">{product.category}</p>
          <p className={`text-sm mt-1 ${
            product.stock <= product.minStock ? 'text-red-600' : 'text-green-600'
          }`}>
            Stock: {product.stock} units
          </p>
        </div>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(product)}
            className="p-2 text-gray-600 hover:text-primary-600"
          >
            <FiEdit2 />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(product)}
            className="p-2 text-gray-600 hover:text-red-600"
          >
            <FiTrash2 />
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
);

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    category: product?.category || '',
    stock: product?.stock || '',
    minStock: product?.minStock || 5,
    description: product?.description || '',
    images: product?.images || []
  });
  const [previewImages, setPreviewImages] = useState(product?.images || []);
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewImages]);
    setFormData(prev => ({
      ...prev,
      newImages: [...(prev.newImages || []), ...files]
    }));
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

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
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Stock</label>
        <input
          type="number"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Minimum Stock Level</label>
        <input
          type="number"
          value={formData.minStock}
          onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="3"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Images</label>
        <div className="mt-1 flex items-center space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            multiple
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center space-x-2"
          >
            <FiImage className="w-5 h-5" />
            <span>Add Images</span>
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewImages.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
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
          {product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </motion.form>
  );
};

export default function InventoryManagement() {
  const { products, loading, error, addProduct, updateProduct, deleteProduct, importCSV, exportCSV } = useInventory();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef();

  const handleAddProduct = async (productData) => {
    try {
      await addProduct(productData, productData.newImages || []);
      setShowForm(false);
      setSuccessMessage('Product added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      await updateProduct(selectedProduct.id, productData, productData.newImages || []);
      setSelectedProduct(null);
      setShowForm(false);
      setSuccessMessage('Product updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      try {
        await deleteProduct(product.id, product.images);
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await importCSV(file);
        setSuccessMessage('Products imported successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        console.error('Error importing products:', err);
      }
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
            <h2 className="text-2xl font-bold">Inventory Management</h2>
            <p className="mt-1 text-primary-100">Manage your products and stock levels</p>
          </div>
          <div className="flex space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".csv"
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current.click()}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center space-x-2"
            >
              <FiUpload />
              <span>Import CSV</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportCSV}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center space-x-2"
            >
              <FiDownload />
              <span>Export CSV</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedProduct(null);
                setShowForm(true);
              }}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add Product</span>
            </motion.button>
          </div>
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

      {/* Low Stock Warning */}
      {products.some(p => p.stock <= p.minStock) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center"
        >
          <FiAlertCircle className="w-5 h-5 mr-2" />
          <span>Some products are running low on stock!</span>
        </motion.div>
      )}

      {/* Product Form or List */}
      <AnimatePresence mode="wait">
        {showForm ? (
          <ProductForm
            key="form"
            product={selectedProduct}
            onSubmit={selectedProduct ? handleUpdateProduct : handleAddProduct}
            onCancel={() => {
              setSelectedProduct(null);
              setShowForm(false);
            }}
          />
        ) : (
          <motion.div
            key="list"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={(product) => {
                    setSelectedProduct(product);
                    setShowForm(true);
                  }}
                  onDelete={handleDeleteProduct}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return content;
} 