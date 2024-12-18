const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, deleteDoc, getDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // Other config details
};

async function validateFirestoreRules() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  try {
    // Test user authentication
    const testUser = await signInWithEmailAndPassword(
      auth, 
      'test@example.com', 
      'testpassword'
    );

    // Test user profile creation
    const userProfileRef = doc(db, 'users', testUser.user.uid);
    await setDoc(userProfileRef, {
      email: testUser.user.email,
      displayName: 'Test User',
      skills: []
    });

    // Test skill creation
    const skillRef = collection(db, 'skills');
    await addDoc(skillRef, {
      name: 'Test Skill',
      category: 'Technology',
      description: 'A test skill for validation',
      creatorId: testUser.user.uid
    });

    console.log('✅ Firestore Rules Validation Successful');
  } catch (error) {
    console.error('❌ Firestore Rules Validation Failed:', error);
    process.exit(1);
  }
}

validateFirestoreRules();
