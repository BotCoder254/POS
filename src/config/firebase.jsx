import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBMjKssyRSZJ16EhSdVOFd2XjIkj8_BT-E",
  authDomain: "twitterclone-47ebf.firebaseapp.com",
  databaseURL: "https://twitterclone-47ebf-default-rtdb.firebaseio.com",
  projectId: "twitterclone-47ebf",
  storageBucket: "twitterclone-47ebf.appspot.com",
  messagingSenderId: "700556014223",
  appId: "1:700556014223:web:a0646158ade0b1e55ab6fa"
};

// Check if all required environment variables are present
const missingVars = Object.entries(firebaseConfig).filter(([_, value]) => !value);
if (missingVars.length > 0) {
  console.error('Missing Firebase configuration variables:', missingVars.map(([key]) => key));
  throw new Error('Firebase configuration is incomplete. Check your .env file.');
}

let app;
let auth;
let db;
let storage;
const googleProvider = new GoogleAuthProvider();

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error; // Re-throw to be caught by error boundary
}

export { auth, db, storage, googleProvider };
export const isInitialized = !!app;
export default app; 