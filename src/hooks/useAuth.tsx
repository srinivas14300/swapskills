import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import toast from 'react-hot-toast';

// Enhanced User Profile Type
export interface UserProfile extends User {
  skills?: string[];
  interests?: string[];
  createdAt?: Date;
  isProfileComplete?: boolean;
}

// Authentication Context Type
interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  createTestUser: () => Promise<void>;
}

// Create Authentication Context
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => null,
  signOut: async () => {},
  updateUserProfile: async () => {},
  createTestUser: async () => {},
});

// Authentication Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // Transform Firebase User to UserProfile
          const userProfile: UserProfile = {
            ...user,
            skills: [],
            interests: [],
            createdAt: new Date(),
            isProfileComplete: false, // Default to false until profile is complete
          };

          // Create or update user document in Firestore
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userProfile.isProfileComplete = userData.isProfileComplete || false;
              userProfile.skills = userData.skills || [];
              userProfile.interests = userData.interests || [];
            }

            await setDoc(
              userDocRef, 
              {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                skills: userProfile.skills,
                interests: userProfile.interests,
                createdAt: serverTimestamp(),
                isProfileComplete: userProfile.isProfileComplete
              }, 
              { merge: true }
            );

            // Programmatically redirect if on login/register page
            if (window.location.pathname === '/login' || window.location.pathname === '/register') {
              window.location.href = '/dashboard';
            }
          } catch (error) {
            console.error('Error updating user profile:', error);
          }

          setCurrentUser(userProfile);
        } else {
          setCurrentUser(null);
          // Redirect to login if not authenticated and not already on login/register page
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }
        setLoading(false);
      },
      (error) => {
        console.error('Authentication Error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (displayName) {
        await firebaseUpdateProfile(user, { displayName });
      }

      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Sign Up Error:', error);
      toast.error('Failed to create account');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.group('🔐 Firebase Sign In');
      console.log('Attempting authentication', { 
        email, 
        timestamp: new Date().toISOString() 
      });

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('✅ Authentication Successful', { 
        uid: userCredential.user.uid,
        email: userCredential.user.email 
      });

      toast.success('Logged in successfully!', {
        icon: '🎉',
        style: {
          background: '#48BB78',
          color: 'white',
        }
      });

      console.groupEnd();
      return userCredential.user;
    } catch (error) {
      console.group('🚨 Authentication Error');
      console.error('Detailed Authentication Error:', error);

      // Specific Firebase error handling
      if (error instanceof Error) {
        const firebaseError = error as { code?: string, message: string };
        
        const errorMessages: Record<string, string> = {
          'auth/invalid-email': 'Invalid email format',
          'auth/user-disabled': 'This account has been disabled',
          'auth/user-not-found': 'No account found with this email',
          'auth/wrong-password': 'Incorrect password',
          'auth/too-many-requests': 'Too many login attempts. Please try again later.'
        };

        const friendlyMessage = errorMessages[firebaseError.code || ''] || 
          'An unexpected error occurred during login';

        toast.error(friendlyMessage, {
          duration: 5000,
          position: 'top-right',
          icon: '🚫',
          style: {
            background: '#FF6B6B',
            color: 'white',
          }
        });
      }

      console.groupEnd();
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Sign Out Error:', error);
      toast.error('Failed to log out');
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;

    try {
      // Update Firebase user profile
      if (updates.displayName || updates.photoURL) {
        await firebaseUpdateProfile(currentUser, {
          displayName: updates.displayName,
          photoURL: updates.photoURL,
        });
      }

      // Update Firestore document
      await setDoc(
        doc(db, 'users', currentUser.uid),
        updates,
        { merge: true }
      );

      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile Update Error:', error);
      toast.error('Failed to update profile');
    }
  };

  // Utility method to create a test user for debugging
  const createTestUser = async () => {
    try {
      console.group('🧪 Test User Creation');
      const testEmail = 'testuser@skillswap.com';
      const testPassword = 'TestUser123!';

      // Check if user already exists
      try {
        await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log('✅ Test user already exists');
        return;
      } catch (signInError) {
        // User doesn't exist, so create one
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          testEmail, 
          testPassword
        );

        await firebaseUpdateProfile(userCredential.user, {
          displayName: 'Skill Swap Test User'
        });

        // Create user document in Firestore
        await setDoc(
          doc(db, 'users', userCredential.user.uid), 
          {
            uid: userCredential.user.uid,
            email: testEmail,
            displayName: 'Skill Swap Test User',
            skills: [],
            interests: [],
            createdAt: serverTimestamp(),
          }, 
          { merge: true }
        );

        console.log('✅ Test user created successfully');
      }

      console.groupEnd();
    } catch (error) {
      console.error('🚨 Test User Creation Error:', error);
      toast.error('Failed to create test user');
    }
  };

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    createTestUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
