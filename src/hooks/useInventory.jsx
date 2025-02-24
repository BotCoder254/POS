import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  where,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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

  const addProduct = async (productData, images) => {
    try {
      setError(null);
      const imageUrls = [];
      
      // Upload images
      for (const image of images) {
        const imageRef = ref(storage, `products/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      await addDoc(collection(db, 'products'), {
        ...productData,
        images: imageUrls,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProduct = async (productId, productData, newImages = []) => {
    try {
      setError(null);
      const productRef = doc(db, 'products', productId);
      const imageUrls = [...(productData.images || [])];

      // Upload new images
      for (const image of newImages) {
        const imageRef = ref(storage, `products/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      await updateDoc(productRef, {
        ...productData,
        images: imageUrls,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProduct = async (productId, imageUrls = []) => {
    try {
      setError(null);
      // Delete images from storage
      for (const url of imageUrls) {
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
      }

      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const importCSV = async (file) => {
    try {
      setError(null);
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        complete: async (results) => {
          for (const row of results.data) {
            if (row.name && row.price) {
              await addDoc(collection(db, 'products'), {
                name: row.name,
                price: parseFloat(row.price),
                category: row.category || '',
                stock: parseInt(row.stock) || 0,
                minStock: parseInt(row.minStock) || 5,
                description: row.description || '',
                images: [],
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const exportCSV = () => {
    try {
      setError(null);
      const csv = Papa.unparse(products.map(product => ({
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        minStock: product.minStock,
        description: product.description
      })));

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `inventory_${new Date().toISOString()}.csv`;
      link.click();
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
    getLowStockProducts
  };
}; 