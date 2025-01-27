import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NavbarModern from './components/layout/NavbarModern';
import ProtectedRoute from './components/ProtectedRoute'; 
import LoadingSpinner from './components/ui/LoadingSpinner';
import { Toaster } from 'react-hot-toast';
import CascadeAIAssistant from './components/ai/CascadeAIAssistant';
import CompleteProfile from './pages/CompleteProfile';

// Performance-aware Lazy Loading Utility
const lazyWithPerf = (
  importFn: () => Promise<{ default: React.ComponentType<any> }>, 
  componentName: string
) => {
  return React.lazy(() => {
    const start = performance.now();
    return importFn().then(module => {
      // Ensure default export exists
      if (!module.default) {
        console.error(`${componentName} is missing a default export`);
        throw new Error(`${componentName} is missing a default export`);
      }
      const end = performance.now();
      console.log(`${componentName} loaded in ${(end - start).toFixed(2)}ms`);
      return module;
    }).catch(error => {
      console.error(`Failed to load ${componentName}:`, error);
      throw error;
    });
  });
}

// Lazy loaded pages with performance tracking
const Home = lazyWithPerf(() => import('./pages/Home'), 'Home');
const Login = lazyWithPerf(() => import('./pages/Login'), 'Login');
const Register = lazyWithPerf(() => import('./pages/Register'), 'Register');
const Dashboard = lazyWithPerf(() => import('./pages/Dashboard'), 'Dashboard');
const Profile = lazyWithPerf(() => import('./pages/Profile'), 'Profile');
const Skills = lazyWithPerf(() => import('./pages/Skills'), 'Skills');
const Community = lazyWithPerf(() => import('./pages/Community'), 'Community');
const AccountSettings = lazyWithPerf(() => import('./pages/AccountSettings'), 'AccountSettings');
const About = lazyWithPerf(() => import('./pages/About'), 'About');
// const AIAssistant = lazyWithPerf(() => import('./pages/AIAssistant'), 'AIAssistant');
const PostSkill = lazyWithPerf(() => import('./pages/PostSkill'), 'PostSkill');
const AvailableSkills = lazyWithPerf(() => import('./pages/AvailableSkills'), 'AvailableSkills');
const TechEvents = lazyWithPerf(() => import('./pages/TechEvents'), 'TechEvents');
const Features = lazyWithPerf(() => import('./pages/Features'), 'Features');
const SearchPage = lazyWithPerf(() => import('./pages/SearchPage'), 'SearchPage');
const Requests = lazyWithPerf(() => import('./pages/Requests'), 'Requests');
const CompleteProfilePage = lazyWithPerf(() => import('./pages/CompleteProfile'), 'CompleteProfile');

// Enhanced Loading Spinner
const LoadingSpinnerComponent = () => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-white mb-4"></div>
      <p className="text-white text-xl">Loading SwapSkills...</p>
      <small className="text-white/70 mt-2">Initializing application resources</small>
    </div>
  </div>
);

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, 
  { hasError: boolean, error?: Error, errorInfo?: React.ErrorInfo }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    console.error('🚨 Error caught by ErrorBoundary:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    console.error('🔍 Detailed Error Information:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack
    });

    // Optional: Send error to a logging service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="flex justify-center items-center min-h-screen bg-red-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md">
            <h1 className="text-3xl text-red-600 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              We're experiencing an unexpected issue. Please try refreshing the page.
            </p>
            <div className="bg-red-100 p-4 rounded-md text-left text-sm text-red-800 overflow-auto max-h-64">
              <strong>Error Details:</strong>
              <pre>{this.state.error?.message}</pre>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Suspense fallback={<LoadingSpinnerComponent />}>
            <ErrorBoundary>
              <NavbarModern />
              <div className="pt-16"> {/* Add padding to prevent content from being hidden behind navbar */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
                  <Route path="/available-skills" element={<ProtectedRoute><AvailableSkills /></ProtectedRoute>} />
                  <Route path="/post-skill" element={<ProtectedRoute><PostSkill /></ProtectedRoute>} />
                  <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                  <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                  <Route path="/about" element={<About />} />
                  <Route path="/ai-assistant" element={<ProtectedRoute><CascadeAIAssistant /></ProtectedRoute>} />
                  <Route path="/tech-events" element={<TechEvents />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
                  <Route path="/cascade-ai-assistant" element={<CascadeAIAssistant />} />
                  <Route path="/ai-assistant" element={<ProtectedRoute><CascadeAIAssistant /></ProtectedRoute>} />
                  <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />
                </Routes>
              </div>
            </ErrorBoundary>
          </Suspense>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            success: { duration: 3000 },
            error: { duration: 5000 },
          }}
        />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);
