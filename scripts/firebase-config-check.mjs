import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

async function checkFirebaseConfig() {
  try {
    console.log('Initializing Firebase...');
    console.log('Firebase Config:', JSON.stringify(firebaseConfig, null, 2));

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    console.log('Firebase Configuration Verified Successfully!');
    console.log('Project ID:', firebaseConfig.projectId);
    console.log('Auth Domain:', firebaseConfig.authDomain);

    // Validate configuration fields
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing Firebase Configuration Fields:', missingFields);
      process.exit(1);
    }
  } catch (error) {
    console.error('Firebase Configuration Error:', error);
    process.exit(1);
  }
}

checkFirebaseConfig();
