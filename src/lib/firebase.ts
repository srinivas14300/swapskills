import type { User as FirebaseUser } from 'firebase/auth';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  connectAuthEmulator 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc 
} from 'firebase/firestore';
import { 
  getStorage, 
  connectStorageEmulator 
} from 'firebase/storage';
import { 
  Auth, 
  Firestore, 
  FirebaseStorage 
} from 'firebase/firestore';
import toast from 'react-hot-toast';

// Comprehensive environment variable validation
const validateEnvironmentSetup = () => {
  const requiredViteVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredViteVars.filter(key => !import.meta.env[key]);

  if (missingVars.length > 0) {
    const errorMessage = `🚨 Missing Firebase Environment Variables: ${missingVars.join(', ')}`;
    
    console.error(errorMessage);
    
    // Detailed guidance toast
    toast.error('Firebase Configuration Incomplete', {
      duration: 10000,
      position: 'top-center',
      style: {
        background: '#FF6B6B',
        color: 'white',
        fontWeight: 'bold',
      },
      description: `
        🔧 Setup Instructions:
        1. Create a .env file in your project root
        2. Copy configuration from .env.example
        3. Replace placeholders with your Firebase project details
        4. Restart your development server

        Missing Variables: ${missingVars.join(', ')}
      `
    });

    // Throw an error to prevent app initialization
    throw new Error('Incomplete Firebase Environment Configuration');
  }
};

// Safely get environment variables with improved error handling
const getEnvVar = (key: string, required: boolean = true): string => {
  const value = import.meta.env[key];
  
  if (!value && required) {
    console.warn(`🚨 Missing required environment variable: ${key}`);
    return '';
  }
  
  return value as string;
};

// Run environment validation immediately
validateEnvironmentSetup();

// Firebase configuration with validated environment variables
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID', false) // Optional
};

// Enhanced Firebase Configuration with Network Resilience
const initializeFirebaseServices = () => {
  return new Promise<{ auth: Auth; db: Firestore; storage: FirebaseStorage }>((resolve, reject) => {
    try {
      console.group('🔧 Firebase Initialization');
      
      // Comprehensive network and environment diagnostics
      const networkDiagnostics = {
        timestamp: new Date().toISOString(),
        environment: import.meta.env.NODE_ENV,
        networkStatus: {
          online: navigator.onLine,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        },
        firebaseConfig: {
          projectId: firebaseConfig.projectId,
          authDomain: firebaseConfig.authDomain,
        }
      };
      console.log('📡 Network Diagnostics:', networkDiagnostics);

      // Validate that no apps are already initialized
      const existingApp = getApps().length > 0 ? getApps()[0] : null;
      let firebaseApp: FirebaseApp = existingApp || initializeApp(firebaseConfig);

      console.log(existingApp ? '🔄 Using Existing Firebase App' : '🚀 Initializing New Firebase App');

      // Configure services with standard initialization
      const auth = getAuth(firebaseApp);
      const db = getFirestore(firebaseApp);
      const storage = getStorage(firebaseApp);

      console.log('✅ Firebase Services Initialized Successfully');
      console.groupEnd();

      resolve({ auth, db, storage });
    } catch (error) {
      console.group('🚨 Firebase Initialization Error');
      console.error('Detailed Error:', error);
      
      const errorMessage = 
        error instanceof Error 
          ? error.message 
          : 'Unknown Firebase initialization error';

      toast.error(`Firebase Setup Failed: ${errorMessage}`, {
        duration: 10000,
        position: 'top-center',
        style: {
          background: '#FF6B6B',
          color: 'white',
        },
      });

      console.groupEnd();
      reject(error);
    }
  });
};

// Initialize and destructure Firebase services
let auth: Auth, db: Firestore, storage: FirebaseStorage;

initializeFirebaseServices().then(({ auth: authInstance, db: dbInstance, storage: storageInstance }) => {
  auth = authInstance;
  db = dbInstance;
  storage = storageInstance;
});

// Comprehensive Firebase Error Logging
const logFirebaseError = (context: string, error: unknown) => {
  if (error instanceof Error) {
    console.group(`🚨 Firebase Error in ${context}`);
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.groupEnd();

    toast.error(`Firebase Error: ${error.message}`, {
      duration: 5000,
      position: 'top-center',
      style: {
        background: '#FF6B6B',
        color: 'white',
        fontWeight: 'bold',
      },
    });
  }
};

// Enhanced skill validation function
function validateSkillData(skillData: {
  skillName: string;
  category: string;
  description: string;
  userId: string;
  userEmail: string;
  type: 'offer' | 'request';
  isAvailable: boolean;
}) {
  const errors: string[] = [];

  // Skill Name Validation
  if (!skillData.skillName || skillData.skillName.trim() === '') {
    errors.push('Skill name is required');
  }

  // Category Validation
  if (!skillData.category || skillData.category.trim() === '') {
    errors.push('Category is required');
  }

  // Description Validation
  const descriptionErrors = validateSkillDescription(skillData.description);
  errors.push(...descriptionErrors);

  // User ID Validation
  if (!skillData.userId) {
    errors.push('User authentication is required');
  }

  // Email Validation (basic)
  if (!skillData.userEmail || !skillData.userEmail.includes('@')) {
    errors.push('Valid email is required');
  }

  // Type Validation
  if (!['offer', 'request'].includes(skillData.type)) {
    errors.push('Invalid skill type');
  }

  return errors;
}

// Description validation utility (similar to frontend validation)
function validateSkillDescription(description: string): string[] {
  const errors: string[] = [];
  const cleanedDesc = description.trim();

  // More lenient length checks
  if (cleanedDesc.length < 20) {
    errors.push('Description should provide some context');
  }

  if (cleanedDesc.length > 1000) {
    errors.push('Description is too long');
  }

  // More flexible word count check
  const wordCount = cleanedDesc.split(/\s+/).length;
  if (wordCount < 5) {
    errors.push('Please provide a bit more information');
  }

  // Prevent extremely generic descriptions
  const genericPhrases = ['i want to', 'looking to', 'need help', 'trying to', 'want to'];

  const lowercaseDesc = cleanedDesc.toLowerCase();
  if (genericPhrases.some((phrase) => lowercaseDesc.includes(phrase))) {
    errors.push('Please be more specific about your skill or learning goal');
  }

  return errors;
}

// Skill-related Firestore operations

// Retrieve all available skills
async function getAllAvailableSkills(): Promise<any[]> {
  try {
    console.group('🔍 Skill Retrieval Process');
    console.log('Initiating skill retrieval');

    if (!db) {
      console.error('Firestore database connection lost');
      toast.error('Database connection error', { duration: 3000 });
      return [];
    }

    const skillsRef = collection(db, 'skills');

    const allSkillsQuery = query(skillsRef);

    console.log('Executing Firestore query');
    const allSkillsSnapshot = await getDocs(allSkillsQuery);

    console.log(`Retrieved ${allSkillsSnapshot.docs.length} skill documents`);

    const processedSkills = allSkillsSnapshot.docs
      .map((doc) => {
        const rawData = doc.data();

        // Extremely robust type conversion and validation
        const processedSkill = {
          id: doc.id,
          skillName: rawData.skillName || 'Unnamed Skill',
          category: rawData.category || 'General',
          description: rawData.description || 'No description available',
          type: rawData.type || 'request',
          userEmail: rawData.userEmail || 'unknown@example.com',
          userId: rawData.userId || 'unknown',
          createdAt: rawData.createdAt || new Date(),

          // Flexible optional fields
          proficiencyLevel: rawData.proficiencyLevel || 'Beginner',
          yearsOfExperience: Number(rawData.yearsOfExperience) || 0,
          preferredTeachingMethod: rawData.preferredTeachingMethod || 'Flexible',
          isAvailable: rawData.isAvailable ?? true,
        };

        return processedSkill;
      })
      .filter((skill) => {
        // Extremely lenient validation
        const validationResults = {
          hasSkillName: skill.skillName.trim().length > 0,
          hasValidCategory: skill.category.trim().length > 0,
          hasDescription: skill.description.trim().length > 0,
          hasValidEmail: skill.userEmail.includes('@'),
          hasValidType: ['offer', 'request'].includes(skill.type),
          hasValidUserId: skill.userId !== 'unknown',
        };

        const isValid = Object.values(validationResults).every((result) => result === true);

        if (!isValid) {
          console.warn('🚨 Filtered out skill with validation details:', {
            skill,
            validationResults,
          });
        }

        return isValid;
      });

    console.log(`Processed ${processedSkills.length} valid skills`);

    // Sort skills by creation date, most recent first
    const sortedSkills = processedSkills.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (sortedSkills.length === 0) {
      console.warn('No valid skills found');
      toast.error('No skills available. Be the first to add a skill!', {
        duration: 4000,
      });
    }

    console.groupEnd();
    return sortedSkills;
  } catch (error) {
    console.error('Critical error in skill retrieval:', error);

    if (error instanceof Error) {
      console.error('Error Details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // Specific error handling
      if (error.message.includes('network')) {
        toast.error('Network error. Check your connection.', {
          duration: 5000,
        });
      } else if (error.message.includes('permission')) {
        toast.error('Permission denied. Please check your authentication.', {
          duration: 5000,
        });
      } else {
        toast.error('Failed to load skills. Try again later.', {
          duration: 4000,
        });
      }
    }

    console.groupEnd();
    return [];
  }
}

// Request a skill from a specific user
async function requestSkill(skillId: string, requestorUid: string) {
  try {
    const skillRef = doc(db, 'skills', skillId);

    // Create a new skill request document
    const skillRequestRef = collection(db, 'skillRequests');
    await addDoc(skillRequestRef, {
      skillId,
      requestorUid,
      status: 'pending',
      createdAt: new Date(),
    });

    // Optionally, update the skill's request status
    await updateDoc(skillRef, {
      hasActiveRequest: true,
    });

    toast.success('Skill request sent successfully!');
    return true;
  } catch (error) {
    logFirebaseError('Requesting Skill', error);
    toast.error('Failed to send skill request');
    return false;
  }
}

// Add a new skill to Firestore
async function addSkill(skillData: {
  skillName: string;
  category: string;
  description: string;
  userId: string;
  userEmail: string;
  type: 'offer' | 'request';
  isAvailable?: boolean;
  proficiencyLevel?: string;
  yearsOfExperience?: number;
  certifications?: string;
  preferredTeachingMethod?: string;
}) {
  try {
    // Basic validation
    if (!skillData.skillName || !skillData.category || !skillData.description) {
      toast.error('Please fill in all required fields', { duration: 3000 });
      return null;
    }

    // Prepare skill data
    const skillToAdd = {
      ...skillData,
      skillName: skillData.skillName.trim(),
      category: skillData.category.trim(),
      description: skillData.description.trim(),
      createdAt: new Date(),
      isAvailable: skillData.isAvailable ?? true,
    };

    // Add to Firestore
    const skillsRef = collection(db, 'skills');
    const docRef = await addDoc(skillsRef, skillToAdd);

    // Success notification
    toast.success(
      `${skillData.type === 'offer' ? 'Skill Offered' : 'Skill Requested'}: ${skillData.skillName}`,
      {
        duration: 3000,
      }
    );

    return {
      id: docRef.id,
      ...skillToAdd,
    };
  } catch (error) {
    console.error('Error adding skill:', error);

    // Generic error handling
    toast.error('Failed to add skill. Please try again.', { duration: 3000 });

    return null;
  }
}

// Manual skill addition for debugging
async function manualAddSkill() {
  try {
    // Use a fixed user ID and email for testing
    const testSkill = {
      skillName: 'Test React Skill',
      category: 'Web Development',
      description: 'Manual test skill for debugging',
      userId: 'test-user-id',
      userEmail: 'test@example.com',
      type: 'offer' as const,
      isAvailable: true,
      createdAt: new Date(),
    };

    const skillsRef = collection(db, 'skills');
    const docRef = await addDoc(skillsRef, testSkill);

    console.log('Manually Added Skill:', {
      id: docRef.id,
      ...testSkill,
    });

    toast.success('Manually added test skill!', {
      duration: 4000,
      style: {
        background: '#4CAF50',
        color: 'white',
      },
    });

    return {
      id: docRef.id,
      ...testSkill,
    };
  } catch (error) {
    console.error('Error in manual skill addition:', error);
    toast.error('Failed to manually add skill', {
      duration: 4000,
      style: {
        background: '#FF6B6B',
        color: 'white',
      },
    });
    return null;
  }
}

// Seed initial skills for testing
async function seedInitialSkills(userId: string, userEmail: string) {
  try {
    const initialSkills = [
      {
        skillName: 'React Development',
        category: 'Web Development',
        description: 'Experienced React developer offering mentorship',
        userId,
        userEmail,
        type: 'offer' as const,
        isAvailable: true,
      },
      {
        skillName: 'Python Programming',
        category: 'Programming Languages',
        description: 'Advanced Python skills, willing to teach basics to advanced concepts',
        userId,
        userEmail,
        type: 'offer' as const,
        isAvailable: true,
      },
      {
        skillName: 'UI/UX Design',
        category: 'Design',
        description: 'Professional UI/UX designer with 5+ years of experience',
        userId,
        userEmail,
        type: 'offer' as const,
        isAvailable: true,
      },
    ];

    const addedSkills = [];
    for (const skill of initialSkills) {
      const addedSkill = await addSkill(skill);
      if (addedSkill) {
        addedSkills.push(addedSkill);
      }
    }

    console.log('Seeded initial skills:', addedSkills);
    toast.success(`Added ${addedSkills.length} initial skills!`);

    return addedSkills;
  } catch (error) {
    console.error('Error seeding initial skills:', error);
    toast.error('Failed to seed initial skills');
    return [];
  }
}

// Export all Firebase-related functions and services
export {
  initializeFirebaseServices,
  auth,
  db,
  storage,
  logFirebaseError,
  validateSkillData,
  validateSkillDescription,
  getAllAvailableSkills,
  requestSkill,
  addSkill,
  manualAddSkill,
  seedInitialSkills,
  getEnvVar,
  validateEnvironmentSetup
};
