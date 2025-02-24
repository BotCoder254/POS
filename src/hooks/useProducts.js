import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useProducts = () => {
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

  const getProductById = (productId) => {
    return products.find(product => product.id === productId);
  };

  return {
    products,
    loading,
    error,
    searchProducts,
    getProductById
  };
}; 