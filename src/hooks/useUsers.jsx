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
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../config/firebase';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null
        };
      });
      setUsers(userData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addUser = async (userData) => {
    try {
      setError(null);
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Update profile
      await updateProfile(userCredential.user, {
        displayName: userData.name
      });

      // Add to Firestore
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        name: userData.name || '',
        email: userData.email,
        role: userData.role || 'cashier', // Default to cashier if role is not specified
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || ''
      });

      // Send password reset email for user to set their own password
      await sendPasswordResetEmail(auth, userData.email);

      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      setError(null);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.uid
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteUserAccount = async (userId, authUid) => {
    try {
      setError(null);
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userId));
      
      // Delete from Authentication
      const user = auth.currentUser;
      if (user && user.uid === authUid) {
        await deleteUser(user);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getUserActivity = async (userId) => {
    try {
      setError(null);
      const q = query(
        collection(db, 'userActivity'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logUserActivity = async (userId, action, details) => {
    try {
      setError(null);
      await addDoc(collection(db, 'userActivity'), {
        userId,
        action,
        details,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetUserPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    addUser,
    updateUser,
    deleteUserAccount,
    getUserActivity,
    logUserActivity,
    resetUserPassword
  };
}; 