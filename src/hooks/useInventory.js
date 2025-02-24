import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  getDocs
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import Papa from 'papaparse';

export const useInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      orderBy('name')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const uploadImages = async (images) => {
    const uploadPromises = images.map(async (image) => {
      const storageRef = ref(storage, `products/${Date.now()}_${image.name}`);
      await uploadBytes(storageRef, image);
      return getDownloadURL(storageRef);
    });

    return Promise.all(uploadPromises);
  };

  const deleteImages = async (imageUrls) => {
    const deletePromises = imageUrls.map(async (url) => {
      const storageRef = ref(storage, url);
      return deleteObject(storageRef);
    });

    return Promise.all(deletePromises);
  };

  const addProduct = async (productData, images = []) => {
    try {
      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(images);
      }

      const newProduct = {
        ...productData,
        images: imageUrls,
        searchTerms: [
          productData.name.toLowerCase(),
          productData.category.toLowerCase(),
          ...productData.name.toLowerCase().split(' ')
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'products'), newProduct);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProduct = async (productId, productData, newImages = []) => {
    try {
      const productRef = doc(db, 'products', productId);
      let imageUrls = [...(productData.images || [])];

      if (newImages.length > 0) {
        const newImageUrls = await uploadImages(newImages);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const updatedProduct = {
        ...productData,
        images: imageUrls,
        searchTerms: [
          productData.name.toLowerCase(),
          productData.category.toLowerCase(),
          ...productData.name.toLowerCase().split(' ')
        ],
        updatedAt: new Date()
      };

      await updateDoc(productRef, updatedProduct);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProduct = async (productId, imageUrls = []) => {
    try {
      const productRef = doc(db, 'products', productId);
      
      if (imageUrls.length > 0) {
        await deleteImages(imageUrls);
      }

      await deleteDoc(productRef);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const importCSV = async (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const importPromises = results.data.map(async (row) => {
              const productData = {
                name: row.name,
                price: parseFloat(row.price),
                category: row.category,
                stock: parseInt(row.stock),
                minStock: parseInt(row.minStock) || 5,
                description: row.description || '',
                searchTerms: [
                  row.name.toLowerCase(),
                  row.category.toLowerCase(),
                  ...row.name.toLowerCase().split(' ')
                ],
                createdAt: new Date(),
                updatedAt: new Date()
              };

              await addDoc(collection(db, 'products'), productData);
            });

            await Promise.all(importPromises);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        error: (err) => reject(err)
      });
    });
  };

  const exportCSV = () => {
    const csvData = products.map(product => ({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      minStock: product.minStock,
      description: product.description
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_${new Date().toISOString()}.csv`;
    link.click();
  };

  const searchProducts = async (searchTerm) => {
    try {
      const q = query(
        collection(db, 'products'),
        where('searchTerms', 'array-contains', searchTerm.toLowerCase())
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getLowStockProducts = () => {
    return products.filter(product => product.stock <= product.minStock);
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    importCSV,
    exportCSV,
    searchProducts,
    getLowStockProducts
  };
};
