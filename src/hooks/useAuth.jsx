import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role;
      }
      return 'cashier'; // Default role
    } catch (err) {
      console.error('Error getting user role:', err);
      return 'cashier'; // Default role on error
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const role = await getUserRole(currentUser.uid);
          setUser(currentUser);
          setUserRole(role);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      const role = await getUserRole(result.user.uid);
      setUserRole(role);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const role = await getUserRole(result.user.uid);
      setUserRole(role);
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  return {
    currentUser: user,
    userRole,
    loading,
    error,
    login,
    signInWithGoogle,
    resetPassword,
    logout
  };
}; 