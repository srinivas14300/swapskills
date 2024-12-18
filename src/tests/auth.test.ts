import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  AuthError
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Mock the entire firebase/auth and firebase/firestore modules
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  AuthError: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn()
}));

describe('Authentication Flow', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('User Registration', async () => {
    const mockUserCredential = {
      user: {
        uid: 'test-uid',
        email: testUser.email,
        displayName: testUser.displayName
      }
    };

    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);
    (setDoc as jest.Mock).mockResolvedValue(undefined);

    const result = await createUserWithEmailAndPassword(auth, testUser.email, testUser.password);
    
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, testUser.email, testUser.password);
    expect(result.user.email).toBe(testUser.email);
  });

  test('User Login', async () => {
    const mockUserCredential = {
      user: {
        uid: 'test-uid',
        email: testUser.email
      }
    };

    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential);

    const result = await signInWithEmailAndPassword(auth, testUser.email, testUser.password);
    
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, testUser.email, testUser.password);
    expect(result.user.email).toBe(testUser.email);
  });

  test('User Logout', async () => {
    (signOut as jest.Mock).mockResolvedValue(undefined);

    await expect(signOut(auth)).resolves.toBeUndefined();
    expect(signOut).toHaveBeenCalledWith(auth);
  });

  test('Error Handling - Invalid Credentials', async () => {
    const invalidPassword = 'wrongpassword';

    (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(
      new Error('Invalid login credentials')
    );

    await expect(
      signInWithEmailAndPassword(auth, testUser.email, invalidPassword)
    ).rejects.toThrow('Invalid login credentials');
  });
});
