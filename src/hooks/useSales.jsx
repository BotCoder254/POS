import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  getDocs,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export function useSales() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionList = [];
      querySnapshot.forEach((doc) => {
        transactionList.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(transactionList);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching transactions:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addTransaction = async (transactionData, customer = null) => {
    try {
      const transaction = {
        ...transactionData,
        timestamp: Timestamp.now(),
        status: 'completed',
        customer: customer ? {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email
        } : null
      };

      const docRef = await addDoc(collection(db, 'transactions'), transaction);
      return { id: docRef.id, ...transaction };
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const getFilteredTransactions = async (startDate, endDate, cashierId = null) => {
    try {
      let q = query(
        collection(db, 'transactions'),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const filteredTransactions = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }))
        .filter(transaction => {
          const transactionDate = transaction.timestamp;
          const matchesEndDate = transactionDate <= endDate;
          const matchesCashier = !cashierId || transaction.cashierId === cashierId;
          return matchesEndDate && matchesCashier;
        });

      return filteredTransactions;
    } catch (err) {
      console.error('Error getting filtered transactions:', err);
      throw err;
    }
  };

  const emailReceipt = async (transactionId, email) => {
    try {
      // This would typically call a Firebase Function
      console.log('Emailing receipt for transaction', transactionId, 'to', email);
    } catch (err) {
      console.error('Error emailing receipt:', err);
      throw err;
    }
  };

  const printReceipt = async (transactionId) => {
    try {
      // This would typically call a Firebase Function or local printer API
      console.log('Printing receipt for transaction', transactionId);
    } catch (err) {
      console.error('Error printing receipt:', err);
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    getFilteredTransactions,
    emailReceipt,
    printReceipt
  };
}
 