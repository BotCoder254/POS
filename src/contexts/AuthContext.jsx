import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, role = 'cashier') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      });

      setUserRole(role);
      return userCredential.user;
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      let role = 'cashier';
      
      if (userDoc.exists()) {
        role = userDoc.data().role || 'cashier';
      } else {
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          role: 'cashier',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active'
        });
      }
      
      setUserRole(role);
      return result.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async function signInWithGoogleProvider() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      let role = 'cashier';
      
      if (userDoc.exists()) {
        role = userDoc.data().role || 'cashier';
      } else {
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          role: 'cashier',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active'
        });
      }
      
      setUserRole(role);
      return result.user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  async function getUserRole(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role || 'cashier'; // Return role if exists, otherwise default to cashier
      }
      return 'cashier'; // Default role if document doesn't exist
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'cashier'; // Default role on error
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const role = await getUserRole(user.uid);
          setCurrentUser(user);
          setUserRole(role);
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    signInWithGoogle: signInWithGoogleProvider,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 