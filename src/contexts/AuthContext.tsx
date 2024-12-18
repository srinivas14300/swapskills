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
  networkError?: Error | null;
}

// Authentication Context Type
interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  networkError: Error | null;
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
  networkError: null,
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
  const [networkError, setNetworkError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          try {
            // Transform Firebase User to UserProfile
            const userProfile: UserProfile = {
              ...user,
              skills: [],
              interests: [],
              createdAt: new Date(),
              isProfileComplete: false, // Default to false until profile is complete
            };

            // Fetch additional user details from Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userProfile.isProfileComplete = userData.isProfileComplete || false;
              userProfile.skills = userData.skills || [];
              userProfile.interests = userData.interests || [];
            }

            // Update or create user document in Firestore
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

            setCurrentUser(userProfile);
            setNetworkError(null);
          } catch (error) {
            console.error('Error updating user profile:', error);
            setNetworkError(error instanceof Error ? error : new Error('Unknown error'));
          }
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
        setNetworkError(error instanceof Error ? error : new Error('Authentication failed'));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Signup Method with Enhanced Error Handling
  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      if (displayName) {
        await firebaseUpdateProfile(user, { displayName });
      }

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName || null,
        createdAt: serverTimestamp(),
        isProfileComplete: !!displayName
      });

      // Send verification email
      await sendEmailVerification(user);
      
      toast.success('Registration successful! Please verify your email.');
    } catch (error) {
      console.error('Registration Error:', error);
      toast.error('Failed to register. Please try again.', {
        duration: 5000,
        position: 'top-right',
        icon: '❌'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Enhanced Signin Method with Robust Error Handling and Validation
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Email verification check
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        toast.error('Please verify your email. Verification link sent.', {
          duration: 5000
        });
        throw new Error('Email not verified');
      }

      // Additional user profile sync
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        lastLogin: serverTimestamp()
      }, { merge: true });

      return user;
    } catch (error: any) {
      console.error('Login Error:', error);
      toast.error('Failed to login. Please try again.', {
        duration: 5000,
        position: 'top-right',
        icon: '❌'
      });
    } finally {
      setLoading(false);
    }
  };

  // Signout Method
  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout Error:', error);
      toast.error('Failed to logout. Please try again.', {
        duration: 5000,
        position: 'top-right',
        icon: '❌'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update User Profile Method
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) {
      toast.error('No user found. Please log in.');
      throw new Error('No current user');
    }

    setLoading(true);
    try {
      // Update Firebase Authentication Profile
      if (updates.displayName) {
        await firebaseUpdateProfile(currentUser, { 
          displayName: updates.displayName,
          photoURL: updates.photoURL || currentUser.photoURL || undefined
        });
      }

      // Update Firestore User Document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        ...updates,
        isProfileComplete: updates.isProfileComplete ?? true,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update local user state
      setCurrentUser(prev => prev ? {
        ...prev,
        ...updates,
        isProfileComplete: updates.isProfileComplete ?? true
      } : null);

      toast.success('Profile updated successfully!', {
        icon: '✅',
        style: {
          background: '#48BB78',
          color: 'white',
        }
      });
    } catch (error) {
      console.error('Profile Update Error:', error);
      toast.error('Failed to update profile. Please try again.', {
        duration: 5000,
        position: 'top-right',
        icon: '❌'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create Test User Method
  const createTestUser = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, 'test@example.com', 'password123');
      const user = userCredential.user;

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: 'Test User',
        createdAt: serverTimestamp(),
        isProfileComplete: true
      });

      // Send verification email
      await sendEmailVerification(user);
      
      toast.success('Test user created successfully!');
    } catch (error) {
      console.error('Test User Creation Error:', error);
      toast.error('Failed to create test user. Please try again.', {
        duration: 5000,
        position: 'top-right',
        icon: '❌'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    networkError,
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
