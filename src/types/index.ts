import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface Skill {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'offer' | 'request';
  userId: string;
  userEmail: string;
  isAvailable: boolean;
}

export interface UserProfile extends FirebaseUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  skills?: Skill[];
  interests?: string[];
  learningGoals?: string[];
  communicationPreference?: string;
  profileCompletionScore?: number;
  createdAt?: Timestamp | Date;
  isProfileComplete?: boolean;
}

export interface AIMatchingProfile {
  skills?: string[];
  interests?: string[];
  learningGoals?: string[];
  communicationPreference?: string;
}

export interface SkillSwapEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  location?: string;
  organizer: string;
}

export interface Notification {
  id?: string;
  type: 'skill_match' | 'message' | 'event_invite';
  content: string;
  recipient: string;
  sender?: string;
  read: boolean;
  createdAt: Timestamp | Date;
}

export interface DashboardStats {
  totalSkillsPosted: number;
  totalSkillSwaps: number;
  activeSkillRequests: number;
  skillMatchPercentage: number;
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  userId: string;
}

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  currentUser?: User | null;
};
