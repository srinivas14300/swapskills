import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';

declare global {
  interface Window {
    ethereum?: unknown;
  }

  type AuthContextType = {
    user: FirebaseUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<FirebaseUser>;
    signUp: (email: string, password: string) => Promise<FirebaseUser>;
    signOut: () => Promise<void>;
    updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
    updateEmail: (newEmail: string) => Promise<void>;
    currentUser?: FirebaseUser | null;
  };

  type DashboardStats = {
    totalSkillsPosted: number;
    totalSkillSwaps: number;
    activeSkillRequests: number;
    skillMatchPercentage: number;
  };

  type ActivityLog = {
    id: number;
    type: string;
    description: string;
    timestamp: Timestamp;
  };
}

export {};
