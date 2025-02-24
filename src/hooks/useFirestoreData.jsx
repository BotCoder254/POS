import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useTransactions = (limitCount = 10) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setTransactions(transactionData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [limitCount]);

  return { transactions, loading };
};

export const useDailySales = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'transactions'),
      where('timestamp', '>=', Timestamp.fromDate(today)),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sales = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setSalesData(sales);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { salesData, loading };
};

export const useInventoryLevels = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'inventory'),
      orderBy('quantity', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inventoryData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(inventoryData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { inventory, loading };
};

export const useEmployeeStats = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', 'in', ['cashier', 'manager'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const employeeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmployees(employeeData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { employees, loading };
};

export const useSalesAnalytics = (period = 'weekly') => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startDate = new Date();
    if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    }
    startDate.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, 'transactions'),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const salesByDay = snapshot.docs.reduce((acc, doc) => {
        const date = doc.data().timestamp.toDate();
        const day = date.toLocaleDateString();
        const amount = doc.data().total || 0;

        if (!acc[day]) {
          acc[day] = { name: day, sales: 0 };
        }
        acc[day].sales += amount;
        return acc;
      }, {});

      setAnalytics(Object.values(salesByDay));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [period]);

  return { analytics, loading };
}; 