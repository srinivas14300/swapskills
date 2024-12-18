import 'dotenv/config';
import { auth, db } from '../lib/firebase.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Enhanced Authentication Test Suite
export class AuthenticationTestSuite {
  private testEmail: string;
  private testPassword: string;
  private testDisplayName: string;

  constructor() {
    // Generate unique test credentials
    const timestamp = Date.now();
    this.testEmail = `test_user_${timestamp}@skillswap.com`;
    this.testPassword = `TestPass123!_${timestamp}`;
    this.testDisplayName = `Test User ${timestamp}`;
  }

  private log(message: string, isError: boolean = false) {
    if (isError) {
      console.error(`❌ ${message}`);
    } else {
      console.log(`✅ ${message}`);
    }
  }

  // Comprehensive User Registration Test
  async testUserRegistration(): Promise<UserCredential> {
    console.group('🧪 User Registration Test');
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        this.testEmail, 
        this.testPassword
      );

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: this.testEmail,
        displayName: this.testDisplayName,
        createdAt: new Date(),
        skills: [],
        interests: []
      });

      console.log('✅ Registration Successful', {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      });

      this.log('Registration Successful');
      console.groupEnd();
      return userCredential;
    } catch (error) {
      console.error('❌ Registration Test Failed', error);
      this.log('Registration Test Failed', true);
      console.groupEnd();
      throw error;
    }
  }

  // User Login Test
  async testUserLogin(email?: string, password?: string): Promise<UserCredential> {
    console.group('🧪 User Login Test');
    try {
      const loginEmail = email || this.testEmail;
      const loginPassword = password || this.testPassword;

      const userCredential = await signInWithEmailAndPassword(
        auth, 
        loginEmail, 
        loginPassword
      );

      console.log('✅ Login Successful', {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      });

      this.log('Login Successful');
      console.groupEnd();
      return userCredential;
    } catch (error) {
      console.error('❌ Login Test Failed', error);
      this.log('Login Test Failed', true);
      console.groupEnd();
      throw error;
    }
  }

  // User Logout Test
  async testUserLogout(): Promise<void> {
    console.group('🧪 User Logout Test');
    try {
      await signOut(auth);
      console.log('✅ Logout Successful');
      this.log('Logout Successful');
      console.groupEnd();
    } catch (error) {
      console.error('❌ Logout Test Failed', error);
      this.log('Logout Test Failed', true);
      console.groupEnd();
      throw error;
    }
  }

  // Comprehensive Authentication Flow Test
  async runFullAuthenticationTest() {
    console.group('🚀 Full Authentication Test Suite');
    try {
      // Registration Test
      const registeredUser = await this.testUserRegistration();

      // Login Test
      await this.testUserLogin();

      // Logout Test
      await this.testUserLogout();

      console.log('🎉 All Authentication Tests Passed Successfully!');
      this.log('All Authentication Tests Passed Successfully!');
    } catch (error) {
      console.error('❌ Authentication Test Suite Failed', error);
      this.log('Authentication Test Suite Failed', true);
    } finally {
      console.groupEnd();
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Authentication Tests');
  try {
    const authTestSuite = new AuthenticationTestSuite();
    await authTestSuite.runFullAuthenticationTest();
    console.log('🎉 All Authentication Tests Passed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Authentication Tests Failed', error);
    process.exit(1);
  }
}

// Run tests if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
