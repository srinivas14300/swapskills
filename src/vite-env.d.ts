import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;

  // OpenAI Configuration
  readonly OPENAI_API_KEY: string;
  readonly VITE_AI_MATCHMAKING_ENABLED: string;
  readonly VITE_AI_SUPPORT_ENABLED: string;

  // Add any additional environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Shared skills data
export const skills: string[] = [];
