import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export const createTestUser = async () => {
  const testEmail = 'testuser@skillswap.com';
  const testPassword = 'TestPassword123!';

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      testEmail, 
      testPassword
    );
    
    console.log('Test user created:', userCredential.user.email);
    return { email: testEmail, password: testPassword };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
};
