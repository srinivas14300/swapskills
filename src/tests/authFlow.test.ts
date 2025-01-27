import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

describe('Authentication Flow', () => {
  const testEmail = 'testuser@skillswap.com';
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    try {
      // Ensure test user exists
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    } catch (error: any) {
      // Ignore if user already exists
      if (error.code !== 'auth/email-already-in-use') {
        console.error('Setup error:', error);
      }
    }
  });

  test('User can sign in successfully', async () => {
    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    expect(userCredential.user).toBeTruthy();
    expect(userCredential.user.email).toBe(testEmail);
  });

  test('Invalid login credentials are rejected', async () => {
    await expect(
      signInWithEmailAndPassword(auth, testEmail, 'WrongPassword')
    ).rejects.toThrow();
  });

  test('User can sign out', async () => {
    await signInWithEmailAndPassword(auth, testEmail, testPassword);
    await signOut(auth);
    // Additional checks can be added here
  });

  test('Create user profile after registration', async () => {
    const email = `newuser_${Date.now()}@skillswap.com`;
    const password = 'NewUserPassword123!';

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    const userProfile = {
      email: user.email,
      displayName: user.email?.split('@')[0],
      createdAt: new Date(),
      skills: [],
      isProfileComplete: false
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    // Verify profile creation
    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    expect(profileDoc.exists()).toBeTruthy();
    expect(profileDoc.data()?.email).toBe(email);
  });
});
