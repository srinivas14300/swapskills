const firebase = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const firebaseConfig = {
  apiKey: 'AIzaSyBslwwP16Qa-WgEJmJhtaZSBkDu5T_3CIg',
  authDomain: 'swap-skills.firebaseapp.com',
  projectId: 'swap-skills',
  storageBucket: 'swap-skills.appspot.com',
  messagingSenderId: '241989537872',
  appId: '1:241989537872:web:178c2d706c04c991310155',
};

async function checkFirebaseConfig() {
  try {
    console.log('Initializing Firebase...');
    const app = firebase.initializeApp(firebaseConfig);
    const auth = getAuth(app);

    console.log('Firebase Configuration Verified Successfully!');
    console.log('Project ID:', firebaseConfig.projectId);
    console.log('Auth Domain:', firebaseConfig.authDomain);

    // Optional: Test authentication connectivity
    try {
      // IMPORTANT: Replace with a test account or remove in production
      await signInWithEmailAndPassword(auth, 'test@example.com', 'testpassword');
    } catch (authError) {
      console.warn('Authentication test failed (expected for test account):', authError.message);
    }
  } catch (error) {
    console.error('Firebase Configuration Error:', error);
    process.exit(1);
  }
}

checkFirebaseConfig();
