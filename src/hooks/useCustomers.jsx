import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'customers'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const customerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setCustomers(customerData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addCustomer = async (customerData) => {
    try {
      setError(null);
      const docRef = await addDoc(collection(db, 'customers'), {
        ...customerData,
        createdAt: Timestamp.now(),
        totalSpent: 0,
        lastVisit: Timestamp.now()
      });
      return docRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCustomer = async (customerId, customerData) => {
    try {
      setError(null);
      const customerRef = doc(db, 'customers', customerId);
      await updateDoc(customerRef, {
        ...customerData,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'customers', customerId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getCustomerTransactions = async (customerId) => {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('customer.id', '==', customerId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
    } catch (err) {
      console.error('Error getting customer transactions:', err);
      throw err;
    }
  };

  const updateCustomerSpending = async (customerId, amount) => {
    try {
      setError(null);
      const customerRef = doc(db, 'customers', customerId);
      await updateDoc(customerRef, {
        totalSpent: amount,
        lastVisit: Timestamp.now()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const searchCustomers = async (searchTerm) => {
    try {
      setError(null);
      const q = query(
        collection(db, 'customers'),
        where('searchTerms', 'array-contains', searchTerm.toLowerCase())
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerTransactions,
    updateCustomerSpending,
    searchCustomers
  };
}; 