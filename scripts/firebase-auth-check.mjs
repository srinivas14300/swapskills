import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Logging utility
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m%s\x1b[0m', // Cyan
    success: '\x1b[32m%s\x1b[0m', // Green
    error: '\x1b[31m%s\x1b[0m', // Red
  };
  console.log(colors[type], message);
}

async function checkFirebaseAuth() {
  try {
    log('🔍 Firebase Authentication Diagnostic Tool', 'info');

    // Log configuration for debugging
    log('\n📋 Firebase Configuration:', 'info');
    log(JSON.stringify(firebaseConfig, null, 2), 'info');

    // Validate configuration
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
    
    if (missingFields.length > 0) {
      log(`❌ Missing Configuration Fields: ${missingFields.join(', ')}`, 'error');
      process.exit(1);
    }

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Prompt for test credentials
    const testEmail = process.argv[2];
    const testPassword = process.argv[3];

    if (!testEmail || !testPassword) {
      log('❌ Please provide email and password as arguments', 'error');
      process.exit(1);
    }

    log(`\n🔐 Attempting to sign in with: ${testEmail}`, 'info');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      const user = userCredential.user;

      log('\n✅ Sign In Successful!', 'success');
      log(`User UID: ${user.uid}`, 'info');
      log(`Email Verified: ${user.emailVerified}`, 'info');
    } catch (signInError) {
      log('\n❌ Sign In Failed', 'error');
      log(`Error Code: ${signInError.code}`, 'error');
      log(`Error Message: ${signInError.message}`, 'error');

      // Attempt to create user if sign-in fails
      if (signInError.code === 'auth/invalid-credential') {
        log('\n🔧 Attempting to create new user...', 'info');
        try {
          const newUserCredential = await createUserWithEmailAndPassword(
            auth,
            testEmail,
            testPassword
          );
          const newUser = newUserCredential.user;

          log('\n✅ New User Created Successfully!', 'success');
          log(`New User UID: ${newUser.uid}`, 'info');
        } catch (createError) {
          log('\n❌ User Creation Failed', 'error');
          log(`Error Code: ${createError.code}`, 'error');
          log(`Error Message: ${createError.message}`, 'error');
        }
      }
    }
  } catch (error) {
    log('\n❌ Unexpected Error', 'error');
    log(error.message, 'error');
  }
}

checkFirebaseAuth();
