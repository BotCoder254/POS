import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useAnalytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [cashierData, setCashierData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time sales data listener
  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      setSalesData(transactions);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get filtered sales data
  const getFilteredSales = async (startDate, endDate, cashierId = null) => {
    try {
      // Use a single where clause with orderBy
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
      setError(err.message);
      throw err;
    }
  };

  // Get product performance data
  const getProductPerformance = (timeRange = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    const productStats = salesData
      .filter(sale => new Date(sale.timestamp) >= startDate)
      .reduce((acc, sale) => {
        sale.items.forEach(item => {
          if (!acc[item.id]) {
            acc[item.id] = {
              id: item.id,
              name: item.name,
              quantity: 0,
              revenue: 0,
              transactions: 0
            };
          }
          acc[item.id].quantity += item.quantity;
          acc[item.id].revenue += item.price * item.quantity;
          acc[item.id].transactions += 1;
        });
        return acc;
      }, {});

    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue);
  };

  // Get cashier performance data
  const getCashierPerformance = (timeRange = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    const cashierStats = salesData
      .filter(sale => new Date(sale.timestamp) >= startDate)
      .reduce((acc, sale) => {
        const cashierId = sale.cashierId;
        if (!acc[cashierId]) {
          acc[cashierId] = {
            id: cashierId,
            name: sale.cashierName,
            totalSales: 0,
            transactionCount: 0,
            averageTransaction: 0
          };
        }
        acc[cashierId].totalSales += sale.total;
        acc[cashierId].transactionCount += 1;
        acc[cashierId].averageTransaction = 
          acc[cashierId].totalSales / acc[cashierId].transactionCount;
        return acc;
      }, {});

    return Object.values(cashierStats)
      .sort((a, b) => b.totalSales - a.totalSales);
  };

  // Get sales trends data
  const getSalesTrends = (interval = 'daily', days = 30) => {
    try {
      // Calculate start date
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      // Filter transactions by date
      const filteredTransactions = salesData.filter(t => {
        const transactionDate = t.timestamp instanceof Date ? t.timestamp : t.timestamp?.toDate();
        return transactionDate >= startDate;
      });

      // Group transactions by interval
      const groupedTransactions = filteredTransactions.reduce((acc, t) => {
        const date = t.timestamp instanceof Date ? t.timestamp : t.timestamp?.toDate();
        let key = '';
        
        switch(interval) {
          case 'hourly':
            key = date.toLocaleString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric', 
              hour: 'numeric' 
            });
            break;
          case 'daily':
            key = date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
            break;
          case 'weekly':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
            break;
          case 'monthly':
            key = date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short' 
            });
            break;
        }

        if (!acc[key]) {
          acc[key] = {
            label: key,
            total: 0,
            items: 0,
            transactions: 0
          };
        }

        // Ensure numeric values
        const total = typeof t.total === 'number' ? t.total : parseFloat(t.total) || 0;
        const items = typeof t.items === 'number' ? t.items : parseInt(t.items) || 0;

        acc[key].total += total;
        acc[key].items += items;
        acc[key].transactions += 1;

        return acc;
      }, {});

      // Convert to array and sort by date
      return Object.values(groupedTransactions).sort((a, b) => {
        const dateA = new Date(a.label);
        const dateB = new Date(b.label);
        return dateA - dateB;
      });
    } catch (error) {
      console.error('Error in getSalesTrends:', error);
      return [];
    }
  };

  return {
    salesData,
    loading,
    error,
    getFilteredSales,
    getProductPerformance,
    getCashierPerformance,
    getSalesTrends
  };
}; 