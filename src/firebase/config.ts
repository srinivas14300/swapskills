import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, initializeAuth, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Enhanced Firebase Configuration with Comprehensive Error Handling
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase Configuration
function validateFirebaseConfig(config: typeof firebaseConfig) {
  const requiredKeys: (keyof typeof firebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  requiredKeys.forEach((key) => {
    if (!config[key]) {
      console.error(`🚨 Missing Firebase configuration: ${key}`);
      throw new Error(`Invalid Firebase Configuration: ${key} is missing`);
    }
  });

  console.log('✅ Firebase Configuration Validated');
}

// Initialize Firebase with Enhanced Logging
function initializeFirebase() {
  try {
    // Validate configuration first
    validateFirebaseConfig(firebaseConfig);

    // Initialize Firebase App
    const app = initializeApp(firebaseConfig);
    console.log('🔥 Firebase App Initialized');

    // Initialize Firestore with offline persistence
    const db = getFirestore(app);
    enableIndexedDbPersistence(db)
      .then(() => console.log('💾 Firestore Offline Persistence Enabled'))
      .catch((error) => {
        console.warn('⚠️ Firestore Offline Persistence Failed:', error);
      });

    // Initialize Authentication with local persistence
    const auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });

    // Initialize Analytics (optional)
    const analytics = getAnalytics(app);

    // Authentication State Observer
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('🔐 User Authenticated:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        });
      } else {
        console.log('❌ No User Authenticated');
      }
    });

    return { app, db, auth, analytics };
  } catch (error) {
    console.error('🚨 Firebase Initialization Error:', error);
    throw error;
  }
}

// Export initialized Firebase services
export const { app, db, auth, analytics } = initializeFirebase();

// Utility function for retry mechanism
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  console.error('Max retries reached:', lastError);
  throw lastError;
};

export const isNetworkError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    (error.message.includes('network') || error.message.includes('connection'))
  );
};

// Remove verbose development logging
const logNetworkDiagnostics = () => {
  const networkStatus = {
    timestamp: new Date().toISOString(),
    environment: import.meta.env.MODE,
    networkStatus: navigator.onLine ? 'Online' : 'Offline'
  };

  // Minimal logging in production
  if (import.meta.env.PROD) return;

  console.log('📡 Network Diagnostics:', networkStatus);
};
