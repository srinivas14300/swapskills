import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBslwwP16Qa-WgEJmJhtaZSBkDu5T_3CIg",
  authDomain: "swap-skills.firebaseapp.com",
  projectId: "swap-skills",
  storageBucket: "swap-skills.appspot.com",
  messagingSenderId: "241989537872",
  appId: "1:241989537872:web:178c2d706c04c991310155",
  measurementId: "G-PBSJ7H6HTH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable Firebase Auth persistence
setPersistence(auth, browserLocalPersistence).catch(console.error);