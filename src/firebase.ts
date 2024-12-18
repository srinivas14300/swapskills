import { initializeApp, FirebaseError as FirebaseAppError, getApp, getApps } from 'firebase/app';
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { 
  getAuth, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  initializeFirestore,
  addDoc,
  deleteDoc,
  doc,
  setLogLevel,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { toast } from 'react-hot-toast';

// Secure Firebase configuration loading
const loadFirebaseConfig = () => {
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID'
  ];

  const missingKeys = requiredKeys.filter(key => !import.meta.env[key]);
  
  if (missingKeys.length > 0) {
    console.error('🚨 Missing Firebase Environment Variables:', missingKeys);
    toast.error('Firebase configuration is incomplete. Please check your .env file.', {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#FF6B6B',
        color: 'white',
        fontWeight: 'bold',
      },
    });
    throw new Error(`Firebase configuration incomplete. Missing: ${missingKeys.join(', ')}`);
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };
};

// Robust Firebase configuration
const firebaseConfig = loadFirebaseConfig();

// Singleton Firebase App Initialization
const app = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();

// Modify offline persistence setup
const enableOfflinePersistence = async () => {
  try {
    // Use FirestoreSettings.cache instead of deprecated enableIndexedDbPersistence
    const firestoreSettings = {
      cache: persistentLocalCache(),
      localCache: persistentMultipleTabManager()
    };
    
    // Apply settings before any Firestore operations
    initializeFirestore(app, firestoreSettings);
  } catch (error) {
    console.error('❌ Offline persistence setup failed:', error);
  }
};

// Call persistence setup before any Firestore operations
enableOfflinePersistence();

// Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Disable verbose Firestore logging in production
setLogLevel(import.meta.env.PROD ? 'error' : 'debug');

// Enhanced Network Error Handling
const handleNetworkError = (error: Error) => {
  console.error('🌐 Network/Authentication Error:', error);
  
  // Detailed error categorization
  if (error instanceof FirebaseAppError) {
    switch (error.code) {
      case 'auth/network-request-failed':
        toast.error('Network connection lost. Please check your internet connection.', {
          duration: 4000,
          position: 'top-center',
          icon: '🌐',
          style: {
            background: '#FF6B6B',
            color: 'white',
          },
        });
        break;
      case 'auth/too-many-requests':
        toast.error('Too many authentication attempts. Please try again later.', {
          duration: 5000,
          position: 'top-center',
        });
        break;
      default:
        toast.error(`Firebase Error: ${error.message}`, {
          duration: 3000,
          position: 'top-center',
        });
    }
  } else {
    // Generic network error
    toast.error('Unable to connect to services. Please check your network.', {
      duration: 3000,
      position: 'top-center',
    });
  }
};

// Comprehensive Network Monitoring
const setupNetworkMonitoring = () => {
  if ('onLine' in navigator) {
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      toast.success('Network connection restored', {
        icon: '🌐',
        duration: 2000,
      });
    });

    window.addEventListener('offline', () => {
      console.warn('Network connection lost');
      toast.error('Network connection lost', {
        icon: '📡',
        duration: 3000,
      });
    });
  }
};

// Call network monitoring setup
setupNetworkMonitoring();

// Authentication state observer with network error handling
onAuthStateChanged(auth, 
  (user) => {
    if (user) {
      console.log('👤 User authenticated:', user.uid);
    } else {
      console.warn('👥 No authenticated user');
    }
  }, 
  (error) => {
    console.error('🔒 Authentication monitoring error:', error);
    handleNetworkError(error);
  }
);

// Initial network status check
if ('onLine' in navigator) {
  const isOnline = navigator.onLine;
  if (isOnline) {
    console.log('🌐 Network connection restored');
    toast.success('Back online', { duration: 2000 });
  } else {
    console.warn('🚫 Network connection lost');
    toast.error('No internet connection. Working in offline mode.', {
      duration: 3000,
      position: 'top-center'
    });
  }
}

// Enhanced authentication state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('🔐 User authenticated:', user.uid);
  } else {
    console.log('🔓 No user authenticated');
  }
});

// Validate skill data
function validateSkillData(skillData: any): Skill | null {
  // Basic validation logic
  if (!skillData.name || !skillData.category) {
    console.warn('⚠️ Invalid skill data:', skillData);
    return null;
  }
  return skillData as Skill;
}

// Comprehensive Skill Retrieval with Enhanced Error Handling
export async function getAllAvailableSkills(requireAuth: boolean = true): Promise<Skill[]> {
  try {
    // Optional authentication check
    if (requireAuth && !auth.currentUser) {
      throw new Error('Authentication required for skill retrieval');
    }

    const skillsRef = collection(db, 'skills');
    const q = query(skillsRef, where('isPublic', '==', true));
    
    const querySnapshot = await getDocs(q);
    const validSkills: Skill[] = [];
    const invalidSkills: any[] = [];

    querySnapshot.forEach((doc) => {
      const skillData = doc.data();

      try {
        const validatedSkill = validateSkillData(skillData);
        if (validatedSkill) {
          validSkills.push({ id: doc.id, ...validatedSkill });
        } else {
          invalidSkills.push(skillData);
          console.warn('⚠️ Filtered out invalid skill:', skillData);
        }
      } catch (validationError) {
        console.warn('⚠️ Skill validation error:', validationError);
        invalidSkills.push(skillData);
      }
    });

    console.log(`✅ Processed ${validSkills.length} valid skills`);
    console.log(`❌ Filtered out ${invalidSkills.length} invalid skills`);

    return validSkills;
  } catch (error) {
    console.error('🚨 Skill Retrieval Error:', error);
    
    // Granular error handling
    if (error instanceof FirebaseAppError) {
      switch (error.code) {
        case 'permission-denied':
          toast.error('Insufficient permissions to retrieve skills');
          break;
        case 'unavailable':
          toast.error('Firebase service is currently unavailable');
          break;
        default:
          toast.error('An unexpected error occurred while retrieving skills');
      }
    }

    return []; // Return empty array to prevent app crash
  }
};

// Analytics Utility Functions
const trackEvent = (eventName: string, eventParams?: { [key: string]: any }) => {
  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

const setAnalyticsUserId = (userId: string) => {
  try {
    setUserId(analytics, userId);
  } catch (error) {
    console.error('Set user ID error:', error);
  }
};

const setAnalyticsUserProperties = (properties: { [key: string]: any }) => {
  try {
    setUserProperties(analytics, properties);
  } catch (error) {
    console.error('Set user properties error:', error);
  }
};

export { 
  app, 
  auth, 
  db as firestore,  // Explicitly alias db as firestore
  db,               // Keep original db export
  storage,
  analytics,
  trackEvent,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
  collection,       // Re-export Firestore methods
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc,
  doc
};
