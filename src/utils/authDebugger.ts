import { auth } from '../firebase';
import toast from 'react-hot-toast';

export const authDebugger = {
  logAuthState: () => {
    console.group('🔐 Authentication Debug');
    console.log('Current User:', auth.currentUser);
    console.log('Auth Instance:', auth);
    console.log('Is Signed In:', !!auth.currentUser);
    console.groupEnd();
  },

  checkFirebaseConfig: () => {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Present' : '❌ Missing',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Present' : '❌ Missing'
    };

    console.group('🔧 Firebase Configuration Check');
    console.table(config);
    console.groupEnd();

    if (Object.values(config).some(status => status === '❌ Missing')) {
      toast.error('Incomplete Firebase Configuration', {
        duration: 5000,
        position: 'top-center'
      });
    }
  },

  networkDiagnostics: () => {
    console.group('🌐 Network Diagnostics');
    console.log('Online Status:', navigator.onLine);
    console.log('Connection Type:', (navigator as any).connection?.effectiveType);
    console.groupEnd();
  }
};
